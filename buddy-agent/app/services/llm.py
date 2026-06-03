"""
LLM provider abstraction — Gemini (free) default, OpenAI optional.
"""
import json
import logging
import re

import httpx

from app.config.settings import settings
from app.prompts.system_prompt import build_system_prompt
from app.services import memory

logger = logging.getLogger(__name__)

GEMINI_BASE = "https://generativelanguage.googleapis.com/v1beta/models"


def _parse_json_response(raw: str) -> dict:
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", raw, re.DOTALL)
        if match:
            try:
                return json.loads(match.group())
            except json.JSONDecodeError:
                pass
    return {}


def _to_gemini_contents(history: list[dict]) -> list[dict]:
    """Map internal user/assistant roles to Gemini user/model."""
    contents = []
    for msg in history:
        role = "user" if msg["role"] == "user" else "model"
        contents.append({"role": role, "parts": [{"text": msg["content"]}]})
    return contents


async def _call_gemini(user_id: str, language: str) -> dict:
    history = memory.get_history(user_id)
    url = f"{GEMINI_BASE}/{settings.gemini_model}:generateContent"
    system_prompt = build_system_prompt(language)

    payload = {
        "systemInstruction": {"parts": [{"text": system_prompt}]},
        "contents": _to_gemini_contents(history),
        "generationConfig": {
            "temperature": 0.3,
            "maxOutputTokens": 512,
            "responseMimeType": "application/json",
        },
    }

    logger.info("Calling Gemini model=%s user=%s history_len=%d", settings.gemini_model, user_id, len(history))

    async with httpx.AsyncClient(timeout=45.0) as client:
        response = await client.post(
            url,
            headers={
                "Content-Type": "application/json",
                "X-goog-api-key": settings.gemini_api_key,
            },
            json=payload,
        )
        response.raise_for_status()
        data = response.json()

    candidates = data.get("candidates") or []
    if not candidates:
        logger.warning("Gemini returned no candidates: %s", data)
        return _fallback_parse("Kuch problem ho gayi. Please dobara try karo.")

    parts = candidates[0].get("content", {}).get("parts") or []
    raw = parts[0].get("text", "{}") if parts else "{}"
    logger.debug("Gemini raw response: %s", raw[:500])

    parsed = _parse_json_response(raw)
    return {
        "reply": parsed.get("reply", raw if raw and not raw.startswith("{") else "Kuch problem ho gayi. Please dobara try karo."),
        "escalate": bool(parsed.get("escalate", False)),
        "escalation_reason": parsed.get("escalation_reason"),
    }


async def _call_openai(user_id: str, language: str) -> dict:
    from openai import AsyncOpenAI

    client = AsyncOpenAI(api_key=settings.openai_api_key)
    history = memory.get_history(user_id)
    system_prompt = build_system_prompt(language)
    messages = [{"role": "system", "content": system_prompt}] + history

    logger.info("Calling OpenAI model=%s user=%s", settings.openai_model, user_id)

    response = await client.chat.completions.create(
        model=settings.openai_model,
        messages=messages,
        temperature=0.3,
        max_tokens=512,
        response_format={"type": "json_object"},
    )

    raw = response.choices[0].message.content or "{}"
    parsed = _parse_json_response(raw)
    return {
        "reply": parsed.get("reply", "Kuch problem ho gayi. Please dobara try karo."),
        "escalate": bool(parsed.get("escalate", False)),
        "escalation_reason": parsed.get("escalation_reason"),
    }


def _fallback_parse(reply_text: str) -> dict:
    return {
        "reply": reply_text,
        "escalate": False,
        "escalation_reason": None,
    }


def _no_llm_response(language: str = "hi") -> dict:
    """When no API key / provider=none — helpful reply without forcing escalation banner."""
    if (language or "hi").lower().strip() == "en":
        reply = (
            "I need a bit more detail to help with that. "
            "Try asking about login, booking, packages, or payments — "
            f"or call us at {settings.support_phone} (Mon–Sat, 10 AM – 7 PM)."
        )
    else:
        reply = (
            "Is sawaal ke liye mujhe thodi aur detail chahiye. "
            "Login, booking, packages ya payment ke baare mein poochho — "
            f"ya call karo: {settings.support_phone} (Mon–Sat, 10 AM – 7 PM)."
        )
    return {
        "reply": reply,
        "escalate": False,
        "escalation_reason": None,
    }


async def call_llm(user_id: str, language: str = "hi") -> dict:
    """
    Call the configured LLM provider.
    Requires history to already include the latest user message.
    """
    lang = (memory.get_language(user_id) or language or "hi").lower().strip()
    if lang != "en":
        lang = "hi"

    if not settings.llm_ready():
        logger.warning("LLM not configured — KB-only fallback user=%s", user_id)
        return _no_llm_response(lang)

    provider = settings.llm_provider.lower().strip()

    try:
        if provider == "gemini":
            return await _call_gemini(user_id, lang)
        if provider == "openai":
            return await _call_openai(user_id, lang)
    except httpx.HTTPStatusError as exc:
        logger.error("LLM HTTP error provider=%s status=%s", provider, exc.response.status_code)
        return _no_llm_response(lang)
    except Exception:
        logger.exception("LLM call failed provider=%s user=%s", provider, user_id)
        return _no_llm_response(lang)

    logger.error("Unknown llm_provider=%s", provider)
    return _no_llm_response(lang)
