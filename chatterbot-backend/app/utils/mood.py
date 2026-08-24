"""Mood parsing utility for SMS replies."""
import re


def parse_mood_reply(body: str):
    """Extract a mood score (1-10) from an SMS body, or return None."""
    body = body.strip()
    match = re.match(r'^(\d{1,2})$', body)
    if match:
        score = int(match.group(1))
        if 1 <= score <= 10:
            return score
    return None
