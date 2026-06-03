"""
In-memory conversation store.

Stores per-user message history as a list of role/content dicts.
On Render restart this clears — acceptable for V1 MVP.
V2 will persist to PostgreSQL.
"""
from collections import defaultdict
from app.config.settings import settings

# { user_id: [{"role": "user"/"assistant", "content": "..."}] }
_store: dict[str, list[dict]] = defaultdict(list)

# Track how many times a user repeated the same unsolved issue
_repeat_counter: dict[str, int] = defaultdict(int)

# Preferred chat language: "hi" | "en"
_language_prefs: dict[str, str] = {}


def append_message(user_id: str, role: str, content: str) -> None:
    """Add a message to the user's conversation history."""
    _store[user_id].append({"role": role, "content": content})
    # Trim to max history to keep context window reasonable
    if len(_store[user_id]) > settings.max_history_messages:
        _store[user_id] = _store[user_id][-settings.max_history_messages:]


def get_history(user_id: str) -> list[dict]:
    """Return full message history for a user."""
    return list(_store[user_id])


def increment_repeat(user_id: str) -> int:
    """Increment repeat counter and return current count."""
    _repeat_counter[user_id] += 1
    return _repeat_counter[user_id]


def reset_repeat(user_id: str) -> None:
    """Reset repeat counter when an issue appears resolved."""
    _repeat_counter[user_id] = 0


def get_repeat_count(user_id: str) -> int:
    return _repeat_counter[user_id]


def set_language(user_id: str, language: str) -> None:
    lang = (language or "hi").lower().strip()
    _language_prefs[user_id] = "en" if lang == "en" else "hi"


def get_language(user_id: str) -> str:
    return _language_prefs.get(user_id, "hi")


def clear_history(user_id: str) -> None:
    """Clear conversation and repeat counter for a user."""
    _store[user_id] = []
    _repeat_counter[user_id] = 0
