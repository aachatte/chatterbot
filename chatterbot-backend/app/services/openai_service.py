"""OpenAI wrapper - streaming generator + retry with backoff."""
import logging
import time

from openai import APIConnectionError, APIError, OpenAI, RateLimitError

logger = logging.getLogger(__name__)

MAX_RETRIES = 3


def _get_client():
    from flask import current_app

    return OpenAI(api_key=current_app.config["OPENAI_API_KEY"])


def _build_messages(history, new_message):
    messages = [{"role": m.role, "content": m.content} for m in history]
    messages.append({"role": "user", "content": new_message})
    return messages


def stream_completion(history, new_message):
    """Yield text deltas. Retries transient failures only before first token."""
    delay = 0.5
    emitted_any = False

    for attempt in range(MAX_RETRIES):
        try:
            stream = _get_client().chat.completions.create(
                model="gpt-4o-mini",
                messages=_build_messages(history, new_message),
                stream=True,
                temperature=0.7,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta.content if chunk.choices else None
                if delta:
                    emitted_any = True
                    yield delta
            return
        except (RateLimitError, APIConnectionError) as exc:
            # Safe to retry only if nothing has been yielded yet,
            # otherwise the client would receive duplicated text.
            if emitted_any or attempt == MAX_RETRIES - 1:
                logger.error("Stream failed after %d attempts: %s", attempt + 1, exc)
                raise
            time.sleep(delay)
            delay *= 2  # 0.5s -> 1s -> 2s


def generate_reply(history, new_message):
    """Non-streaming reply used by the fallback endpoint and Celery tasks."""
    try:
        response = _get_client().chat.completions.create(
            model="gpt-4o-mini",
            messages=_build_messages(history, new_message),
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except APIError as exc:
        logger.error("OpenAI API error: %s", exc)
        raise
