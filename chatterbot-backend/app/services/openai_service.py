"""OpenAI LLM service with Chatterbot system prompt."""
import openai
from config import settings
import logging

logger = logging.getLogger(__name__)

# Core system prompt for Chatterbot
CHATTERBOT_SYSTEM_PROMPT = """You are Chatterbot, a proactive digital companion and lifestyle organizer designed for teenagers. Your goal is to provide a supportive space for communication while helping the user stay on track with their daily schedules, homework, and extracurriculars. You communicate exclusively via SMS text messages.

TONE AND STYLE:
- Keep responses concise (1-3 sentences maximum). This is a text message, not an email.
- Use natural, casual language appropriate for a high school or middle school student.
- Do not be overly enthusiastic or sycophantic.
- Act as a helpful guide and organizer, but never claim to be a human, therapist, or romantic partner. You are a tool that simulates conversation.
- Use the teen\'s name occasionally to build rapport.
- Reference past conversations and known facts to maintain continuity.

THE PROACTIVE ENGINE:
- When prompted by the scheduling system, you must initiate the conversation based on the user\'s known calendar or past context.
- Ask direct, low-friction questions about their day, upcoming events, or tasks.
- If you know they have an event soon, remind them proactively.

HARD SAFETY GUARDRAILS (CRITICAL):
- Never Encourage Harm: You must never agree with or encourage dangerous, illegal, or unhealthy ideas, even if the user insists.
- No Medical or Mental Health Advice: If a user expresses anxiety, depression, or distress, you must gently suggest they speak to a parent, doctor, or trusted adult. You are not a qualified mental health professional.
- Escalation Trigger (Code Red): If the user mentions suicidal ideation, self-harm, or severe bullying, you must immediately output the exact string [SYSTEM_ALERT_ESCALATE] at the START of your response, then provide supportive resources.
- No Romantic/Sexual Engagement: You must completely refuse to engage in any flirtatious, romantic, or sexually explicit conversations. Redirect the conversation immediately or end it.
- Anti-Dependency: Do not attempt to isolate the user. Encourage real-world socializing with peers and family, as socializing is critically important for youth.
- No Personal Data Collection: Do not ask for addresses, passwords, financial info, or other sensitive personal data.

CONVERSATION CONTEXT (use these facts to personalize):
{context}

CURRENT TIME: {current_time}
TRIGGER TYPE: {trigger_type}
"""


class OpenAIService:
    def __init__(self):
        self.client = openai.OpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model

    def generate_response(
        self,
        user_message: str,
        conversation_history: list,
        context_facts: list,
        teen_name: str,
        trigger_type: str = "reactive",
    ) -> dict:
        """Generate a Chatterbot response with full safety and context."""

        # Build context string
        context_str = "\n".join(context_facts) if context_facts else "- No specific context yet."

        # Build messages
        messages = [
            {
                "role": "system",
                "content": CHATTERBOT_SYSTEM_PROMPT.format(
                    context=context_str,
                    current_time="",  # Can inject actual time
                    trigger_type=trigger_type,
                ),
            }
        ]

        # Add conversation history (last 10 messages for context window)
        for msg in conversation_history[-10:]:
            role = "user" if msg["direction"] == "inbound" else "assistant"
            messages.append({"role": role, "content": msg["content"]})

        # Add current user message
        messages.append({"role": "user", "content": user_message})

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                max_tokens=150,
                temperature=0.7,
                top_p=0.9,
            )

            reply_text = response.choices[0].message.content.strip()

            # Check for crisis escalation
            is_crisis = "[SYSTEM_ALERT_ESCALATE]" in reply_text
            if is_crisis:
                # Remove the tag from the actual message sent to teen
                reply_text = reply_text.replace("[SYSTEM_ALERT_ESCALATE]", "").strip()

            return {
                "success": True,
                "text": reply_text,
                "is_crisis": is_crisis,
                "tokens_used": response.usage.total_tokens if response.usage else 0,
            }

        except Exception as e:
            logger.error(f"OpenAI API error: {e}")
            return {
                "success": False,
                "text": "Sorry, I\'m having trouble right now. Can you try again in a bit?",
                "is_crisis": False,
                "error": str(e),
            }

    def extract_context_facts(self, message: str, teen_name: str) -> list:
        """Use LLM to extract memory facts from a message."""
        prompt = f"""Extract key facts about {teen_name} from this message as a JSON array of objects with keys: type (fact/preference/event/goal/concern), key (short identifier), value (description).

Message: "{message}"

Respond with ONLY valid JSON, no markdown."""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                max_tokens=300,
                temperature=0.2,
                response_format={"type": "json_object"},
            )
            import json
            result = json.loads(response.choices[0].message.content)
            return result.get("facts", [])
        except Exception as e:
            logger.error(f"Context extraction error: {e}")
            return []

    def analyze_sentiment(self, text: str) -> float:
        """Simple sentiment analysis (-1.0 to 1.0)."""
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{
                    "role": "user",
                    "content": f"Rate the sentiment of this text on a scale from -1.0 (very negative) to 1.0 (very positive). Respond with ONLY a number.\n\nText: "{text}""
                }],
                max_tokens=10,
                temperature=0.1,
            )
            score = float(response.choices[0].message.content.strip())
            return max(-1.0, min(1.0, score))
        except Exception:
            return 0.0
