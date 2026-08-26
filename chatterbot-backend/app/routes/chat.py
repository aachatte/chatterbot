import json
import time

from flask import Blueprint, Response, current_app, jsonify, request

from app import db, limiter
from app.models import Chat, Message
from app.services.openai_service import generate_reply, stream_completion
from app.utils.errors import NotFoundError, ValidationError

bp = Blueprint("chat", __name__, url_prefix="/api")

SSE_HEARTBEAT_SECONDS = 15  # keep connection alive through proxies


def _get_chat_or_404(chat_id, user_id):
    chat = db.session.get(Chat, chat_id)
    if chat is None or chat.user_id != user_id:
        # 404 (not 403) so we don't reveal that another user's chat exists.
        raise NotFoundError("Chat not found")
    return chat


@bp.post("/chats/<int:chat_id>/stream")
@login_required
@limiter.limit("30 per minute")
def stream_chat(chat_id):
    """Stream an assistant reply for `message` as Server-Sent Events.

    Contract (consumed by src/api/streaming.js):
        data: {"delta": "<text>"}   repeated per token chunk
        data: [DONE]                final event
    """
    payload = request.get_json(silent=True) or {}
    content = (payload.get("message") or "").strip()
    if not content or len(content) > 8000:
        raise ValidationError("Message must be between 1 and 8000 characters")

    chat = _get_chat_or_404(chat_id, current_user.id)

    # Persist user message before streaming so a dropped connection never loses it.
    user_msg = Message(chat_id=chat.id, role="user", content=content)
    db.session.add(user_msg)
    db.session.commit()

    history = chat.recent_messages(limit=20)  # oldest -> newest

    def generate():
        assistant_text_parts = []
        last_beat = time.monotonic()

        try:
            for delta in stream_completion(history, new_message=content):
                assistant_text_parts.append(delta)
                yield f"data: {json.dumps({'delta': delta})}\n\n"

                now = time.monotonic()
                if now - last_beat > SSE_HEARTBEAT_SECONDS:
                    yield ": keepalive\n\n"
                    last_beat = now

            full_text = "".join(assistant_text_parts)
            assistant_msg = Message(chat_id=chat.id, role="assistant", content=full_text)
            db.session.add(assistant_msg)
            db.session.commit()  # commit BEFORE [DONE]

            yield "data: [DONE]\n\n"
            current_app.logger.info(
                "Stream complete",
                extra={"chat_id": chat.id, "user_id": current_user.id, "chars": len(full_text)},
            )

        except Exception:
            db.session.rollback()
            partial = "".join(assistant_text_parts)
            if partial:
                db.session.add(
                    Message(
                        chat_id=chat.id,
                        role="assistant",
                        content=f"{partial}\n\n_[stream interrupted]_",
                    )
                )
                db.session.commit()
            current_app.logger.error("Streaming failed", exc_info=True, extra={"chat_id": chat.id})
            yield f"data: {json.dumps({'error': 'Generation interrupted'})}\n\n"
            yield "data: [DONE]\n\n"

    return Response(
        generate(),
        mimetype="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",  # disable nginx buffering
            "Connection": "keep-alive",
        },
    )


@bp.get("/chats/<int:chat_id>/messages")
@login_required
def get_messages(chat_id):
    chat = _get_chat_or_404(chat_id, current_user.id)
    return jsonify([m.to_dict() for m in chat.messages])


@bp.post("/chats/<int:chat_id>/messages")
@login_required
@limiter.limit("100 per minute")
def send_message(chat_id):
    """Non-streaming fallback (used by outbox flush / retries)."""
    payload = request.get_json(silent=True) or {}
    content = (payload.get("content") or "").strip()
    if not content or len(content) > 8000:
        raise ValidationError("Message must be between 1 and 8000 characters")

    chat = _get_chat_or_404(chat_id, current_user.id)

    db.session.add(Message(chat_id=chat.id, role="user", content=content))
    reply_text = generate_reply(chat.recent_messages(limit=20), content)
    reply = Message(chat_id=chat.id, role="assistant", content=reply_text)
    db.session.add(reply)
    db.session.commit()
    return jsonify(chat.message_dicts()), 201
