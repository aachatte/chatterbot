"""OpenAI service helpers for both chat routes and SMS/domain services."""
import logging
import re
import time
from typing import List

from openai import APIConnectionError, APIError, OpenAI, RateLimitError

from config import settings
from app.services.operations_service import emit_operational_event

logger = logging.getLogger(__name__)
MAX_RETRIES = 3


def _get_client():
    from flask import current_app

    api_key = current_app.config.get("OPENAI_API_KEY") or settings.openai_api_key
    return OpenAI(
        api_key=api_key,
        timeout=settings.provider_timeout_seconds,
        max_retries=settings.provider_max_retries,
    )


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
                model=settings.openai_model,
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
            if emitted_any or attempt == MAX_RETRIES - 1:
                logger.error(
                    "Stream failed after %d attempts: %s",
                    attempt + 1,
                    type(exc).__name__,
                )
                emit_operational_event(
                    "ai_provider",
                    "openai.stream",
                    "generation_failed",
                )
                raise
            time.sleep(delay)
            delay *= 2


def generate_reply(history, new_message):
    """Non-streaming reply used by fallback endpoints."""
    try:
        response = _get_client().chat.completions.create(
            model=settings.openai_model,
            messages=_build_messages(history, new_message),
            temperature=0.7,
        )
        return response.choices[0].message.content or ""
    except APIError as exc:
        logger.error("OpenAI API error: %s", exc)
        raise


class OpenAIService:
    """High-level app service used by SMS, dashboard assistant, and schedulers."""

    def __init__(self):
        self.model = settings.openai_model
        self.client = (
            OpenAI(
                api_key=settings.openai_api_key,
                timeout=settings.provider_timeout_seconds,
                max_retries=settings.provider_max_retries,
            )
            if settings.openai_api_key
            else None
        )

    def _fallback_reply(self, message: str) -> str:
        return (
            "Thanks for sharing that. I’m here to help, and your guardian can review dashboard "
            "summaries for follow-up."
            if message
            else "I’m here to help."
        )

    def generate_parent_reply(self, message: str) -> str:
        if not self.client:
            return self._fallback_reply(message)

        prompt = (
            "You are the Chatterbot guardian assistant. Give concise, practical guidance about "
            "teen safety, alerts, and healthy communication. Do not provide emergency guarantees."
        )
        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                temperature=0.4,
                max_tokens=300,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": message},
                ],
            )
            return (completion.choices[0].message.content or "").strip() or self._fallback_reply(message)
        except Exception as exc:
            logger.error("Parent assistant reply failed: %s", type(exc).__name__)
            emit_operational_event(
                "ai_provider",
                "openai.parent_assistant",
                "generation_failed",
            )
            return self._fallback_reply(message)

    def generate_response(
        self,
        user_message: str,
        conversation_history: List[dict] | None = None,
        context_facts: List[str] | None = None,
        teen_name: str | None = None,
        trigger_type: str = "reactive",
    ) -> dict:
        if not self.client:
            return {"text": self._fallback_reply(user_message)}

        context_history = conversation_history or []
        context_lines = context_facts or []
        safety_mode = "crisis-support mode" if trigger_type == "crisis" else "supportive mode"
        system_prompt = (
            f"You are Chatterbot, a supportive teen SMS companion in {safety_mode}. "
            "Be brief, empathetic, age-appropriate, and avoid clinical diagnosis."
        )
        if teen_name:
            system_prompt += f" The teen's first name is {teen_name}."
        if context_lines:
            system_prompt += "\nKnown context:\n" + "\n".join(context_lines[:20])

        messages = [{"role": "system", "content": system_prompt}]
        for item in context_history[-10:]:
            role = "assistant" if item.get("direction") == "outbound" else "user"
            messages.append({"role": role, "content": item.get("content", "")})
        messages.append({"role": "user", "content": user_message})

        try:
            completion = self.client.chat.completions.create(
                model=self.model,
                temperature=0.6,
                max_tokens=220,
                messages=messages,
            )
            text = (completion.choices[0].message.content or "").strip()
            return {"text": text or self._fallback_reply(user_message)}
        except Exception as exc:
            logger.error("Teen response generation failed: %s", type(exc).__name__)
            emit_operational_event(
                "ai_provider",
                "openai.teen_response",
                "generation_failed",
            )
            return {"text": self._fallback_reply(user_message)}

    def analyze_sentiment(self, text: str) -> float:
        """Heuristic sentiment scoring for lightweight UX metrics, not clinical/safety decisions."""
        if not text:
            return 0.0
        positive_hits = len(re.findall(r"\b(happy|good|great|excited|fine|love)\b", text.lower()))
        negative_hits = len(re.findall(r"\b(sad|bad|stressed|anxious|angry|scared)\b", text.lower()))
        score = (positive_hits - negative_hits) / max(1, positive_hits + negative_hits)
        return max(-1.0, min(1.0, score))

    def extract_context_facts(self, text: str, teen_name: str | None = None) -> list:
        if not isinstance(text, str) or not text.strip():
            return []

        facts = []
        cleaned = text.strip()
        if "homework" in cleaned.lower() or "school" in cleaned.lower():
            facts.append({
                "type": "concern",
                "key": "school_stress",
                "value": f"{teen_name or 'Teen'} mentioned school-related stress.",
                "importance": 6,
                "confidence": 0.7,
            })
        if "practice" in cleaned.lower() or "game" in cleaned.lower():
            facts.append({
                "type": "event",
                "key": "sports_activity",
                "value": f"{teen_name or 'Teen'} referenced sports or practice.",
                "importance": 5,
                "confidence": 0.65,
            })
        return facts[:5]
