"""Tests for support agent logic — escalation and knowledge base."""
import pytest
from unittest.mock import AsyncMock, patch

from app.agents.support_agent import process_message, _check_escalation_keywords
from app.services import memory


def test_keyword_escalation_payment():
    should_escalate, reason = _check_escalation_keywords("payment stuck hai mera")
    assert should_escalate is True
    assert reason == "payment_issue"


def test_keyword_escalation_fraud():
    should_escalate, reason = _check_escalation_keywords("yeh fraud hai")
    assert should_escalate is True
    assert reason == "security_issue"


def test_keyword_no_escalation():
    should_escalate, reason = _check_escalation_keywords("login kaise karu")
    assert should_escalate is False
    assert reason is None


@pytest.mark.asyncio
async def test_thanks_closes_conversation():
    uid = "thanks_user"
    memory.clear_history(uid)
    with patch("app.agents.support_agent.call_llm", new_callable=AsyncMock) as mock_llm:
        result = await process_message(uid, "thanks for update", language="en")
    assert result["escalate"] is False
    assert result.get("conversation_done") is True
    assert "welcome" in result["reply"].lower() or "glad" in result["reply"].lower()
    mock_llm.assert_not_called()


@pytest.mark.asyncio
async def test_done_closes_conversation():
    uid = "done_user"
    memory.clear_history(uid)
    with patch("app.agents.support_agent.call_llm", new_callable=AsyncMock) as mock_llm:
        result = await process_message(uid, "done from my side", language="en")
    assert result.get("conversation_done") is True
    mock_llm.assert_not_called()


@pytest.mark.asyncio
async def test_greeting_no_escalation():
    uid = "greet_user"
    memory.clear_history(uid)
    with patch("app.agents.support_agent.call_llm", new_callable=AsyncMock) as mock_llm:
        result = await process_message(uid, "hii", language="en")
    assert result["escalate"] is False
    assert "buddy" in result["reply"].lower() or "help" in result["reply"].lower()
    mock_llm.assert_not_called()


@pytest.mark.asyncio
async def test_kb_login_answer_en():
    uid = "test_kb_en"
    memory.clear_history(uid)
    with patch("app.agents.support_agent.call_llm", new_callable=AsyncMock) as mock_llm:
        result = await process_message(uid, "cannot login", language="en")
    assert result["escalate"] is False
    assert "login" in result["reply"].lower() or "/login" in result["reply"].lower()
    mock_llm.assert_not_called()


@pytest.mark.asyncio
async def test_kb_login_answer():
    """KB should answer login questions without calling OpenAI."""
    uid = "test_kb_user"
    memory.clear_history(uid)
    with patch("app.agents.support_agent.call_llm", new_callable=AsyncMock) as mock_llm:
        result = await process_message(uid, "login nahi ho raha")
    assert result["escalate"] is False
    assert "email" in result["reply"].lower() or "password" in result["reply"].lower()
    mock_llm.assert_not_called()


@pytest.mark.asyncio
async def test_repeat_escalation():
    """After ESCALATION_THRESHOLD unresolved messages, agent should escalate."""
    uid = "repeat_test_user"
    memory.clear_history(uid)

    with patch("app.agents.support_agent.call_llm", new_callable=AsyncMock) as mock_llm:
        mock_llm.return_value = {
            "reply": "Main samjha nahi.",
            "escalate": False,
            "escalation_reason": None,
        }
        # Send 3 unknown messages (KB won't match "xyz nonsense")
        for _ in range(3):
            result = await process_message(uid, "xyz nonsense question")

    assert result["escalate"] is True
    assert result["escalation_reason"] == "repeat_issue"
