"""
Core support agent logic.

Decision flow:
1. Small talk / greetings → friendly reply (no escalation)
2. Check escalation keywords → escalate only if critical
3. Search knowledge base → return KB answer if match found (no LLM cost)
4. Check repeat counter → escalate if same issue repeated too many times
5. Call LLM (Gemini free by default) with full conversation context
6. Parse JSON response → extract reply + escalate flag
"""
import logging
import re
from typing import Optional, Tuple

from app.config.settings import settings
from app.knowledge.base import search_knowledge_base
from app.services import memory
from app.services.llm import call_llm

logger = logging.getLogger(__name__)

# ── Escalation keyword sets ──────────────────────────────────────────────────

CRITICAL_KEYWORDS = {
    "refund", "fraud", "scam", "cheat", "money lost", "paise gaye", "data lost",
    "account hacked", "hack", "security breach", "complaint", "police", "legal",
    "consumer forum", "court",
}

FRUSTRATION_KEYWORDS = {
    "angry", "frustrated", "useless", "worst", "terrible", "pathetic", "bakwas",
    "bekar", "disgusting", "horrible", "never again", "waste of money",
    "not working", "broken", "rubbish",
}

PAYMENT_STUCK_KEYWORDS = {
    "payment stuck", "payment failed", "payment not done", "deducted but not confirmed",
    "money deducted", "paise kat gaye", "razorpay error", "transaction failed",
    "upi failed", "card declined",
}

_GREETING_RE = re.compile(
    r"^(?:hi+|hello+|hey+|namaste|hola|good\s*(?:morning|afternoon|evening)|"
    r"thanks|thank\s*you|thanku|ok+|okay+)\s*[!?.]*$",
    re.IGNORECASE,
)

_CLOSING_RE = re.compile(
    r"(?:thank\s*you|thanks|thanku|dhanyavad|shukriya|"
    r"done|sorted|resolved|all\s+set|that'?s\s+all|"
    r"ho\s+gaya|bas\s+itna|problem\s+solve|from\s+my\s+side|"
    r"no\s+more\s+(?:help|questions)|bye|goodbye)",
    re.IGNORECASE,
)

_CLOSING_BLOCKERS = (
    "but", "lekin", "still", "not working", "issue", "problem", "help me",
    "?", "kaise", "how to", "nahi", "can't", "cannot", "error", "failed",
)


def _normalize_language(language: Optional[str]) -> str:
    return "en" if (language or "hi").lower().strip() == "en" else "hi"


def _is_conversation_close(message: str) -> bool:
    msg = message.strip()
    if not msg or not _CLOSING_RE.search(msg):
        return False
    lower = msg.lower()
    return not any(blocker in lower for blocker in _CLOSING_BLOCKERS)


def _closing_reply(language: str) -> str:
    if language == "en":
        return (
            "You're welcome! Glad I could help. "
            "Message anytime if you need Buddy Studio support again. Take care! 👋"
        )
    return (
        "Koi baat nahi! Khushi hui madad karke. "
        "Kabhi bhi dubara message karna. Shubhkamnayein! 👋"
    )


def _is_small_talk(message: str) -> bool:
    msg = message.strip()
    if not msg:
        return False
    if _GREETING_RE.match(msg):
        return True
    # Single short word (e.g. a name) — not a support ticket
    if "?" not in msg and len(msg.split()) == 1 and msg.isalpha() and len(msg) <= 24:
        return True
    return False


def _small_talk_reply(language: str, message: str) -> str:
    msg_lower = message.lower().strip()
    if language == "en":
        if "thank" in msg_lower:
            return "You're welcome! Anything else I can help with for Buddy Studio?"
        return (
            "Hi! I'm Buddy from Buddy Studio support. "
            "How can I help you today — login, booking, packages, gallery, or payments?"
        )
    if "thank" in msg_lower or "dhanyavad" in msg_lower:
        return "Koi baat nahi! Buddy Studio se related aur kuch help chahiye?"
    return (
        "Namaste! Main Buddy hoon, Buddy Studio support se. "
        "Aaj kis cheez mein madad chahiye — login, booking, packages, gallery ya payment?"
    )


def _check_escalation_keywords(message: str) -> Tuple[bool, Optional[str]]:
    msg = message.lower()

    if any(kw in msg for kw in CRITICAL_KEYWORDS):
        return True, "security_issue"
    if any(kw in msg for kw in PAYMENT_STUCK_KEYWORDS):
        return True, "payment_issue"
    if any(kw in msg for kw in FRUSTRATION_KEYWORDS):
        return True, "angry_user"
    return False, None


def _build_escalation_reply(reason: str, language: str) -> str:
    phone = settings.support_phone
    if language == "en":
        return (
            "This needs our support team's help.\n\n"
            f"📞 Call / WhatsApp: {phone}\n"
            "⏰ Mon–Sat, 10 AM – 7 PM\n\n"
            "They'll assist you as soon as possible."
        )
    return (
        "Is issue ke liye humari support team aapki madad karegi.\n\n"
        f"📞 Call / WhatsApp: {phone}\n"
        "⏰ Mon–Sat, 10 AM – 7 PM\n\n"
        "Team se connect karo — woh jald help karenge!"
    )


def _substitute_placeholders(text: str) -> str:
    return text.replace("[SUPPORT_PHONE_PLACEHOLDER]", settings.support_phone)


async def process_message(
    user_id: str,
    message: str,
    language: Optional[str] = None,
) -> dict:
    lang = _normalize_language(language)
    memory.set_language(user_id, lang)

    # 0. Thanks / done — end conversation politely
    if _is_conversation_close(message):
        reply = _closing_reply(lang)
        memory.append_message(user_id, "user", message)
        memory.append_message(user_id, "assistant", reply)
        memory.reset_repeat(user_id)
        logger.info("Conversation close user=%s", user_id)
        return {
            "reply": reply,
            "escalate": False,
            "escalation_reason": None,
            "conversation_done": True,
        }

    # 1. Greetings / small talk — never escalate
    if _is_small_talk(message):
        reply = _small_talk_reply(lang, message)
        memory.append_message(user_id, "user", message)
        memory.append_message(user_id, "assistant", reply)
        memory.reset_repeat(user_id)
        logger.info("Small talk user=%s", user_id)
        return {
            "reply": reply,
            "escalate": False,
            "escalation_reason": None,
            "conversation_done": False,
        }

    # 2. Keyword-based escalation
    should_escalate, reason = _check_escalation_keywords(message)
    if should_escalate:
        reply = _build_escalation_reply(reason, lang)
        memory.append_message(user_id, "user", message)
        memory.append_message(user_id, "assistant", reply)
        logger.info("Keyword escalation user=%s reason=%s", user_id, reason)
        return {
            "reply": reply,
            "escalate": True,
            "escalation_reason": reason,
            "conversation_done": False,
        }

    # 3. Knowledge base
    kb_answer = search_knowledge_base(message, lang)
    if kb_answer:
        reply = _substitute_placeholders(kb_answer)
        memory.append_message(user_id, "user", message)
        memory.append_message(user_id, "assistant", reply)
        memory.reset_repeat(user_id)
        logger.info("KB hit user=%s lang=%s", user_id, lang)
        return {
            "reply": reply,
            "escalate": False,
            "escalation_reason": None,
            "conversation_done": False,
        }

    # 4. Repeat-issue escalation
    repeat_count = memory.increment_repeat(user_id)
    if repeat_count >= settings.escalation_threshold:
        reason = "repeat_issue"
        reply = _build_escalation_reply(reason, lang)
        memory.append_message(user_id, "user", message)
        memory.append_message(user_id, "assistant", reply)
        memory.reset_repeat(user_id)
        logger.info("Repeat escalation user=%s count=%d", user_id, repeat_count)
        return {
            "reply": reply,
            "escalate": True,
            "escalation_reason": reason,
            "conversation_done": False,
        }

    # 5. LLM (Gemini / OpenAI / none)
    memory.append_message(user_id, "user", message)
    result = await call_llm(user_id, lang)
    memory.append_message(user_id, "assistant", result["reply"])

    if result["escalate"]:
        logger.info("LLM escalation user=%s reason=%s", user_id, result.get("escalation_reason"))

    if "conversation_done" not in result:
        result["conversation_done"] = False
    return result
