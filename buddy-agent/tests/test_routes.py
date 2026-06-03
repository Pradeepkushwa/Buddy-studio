"""Tests for API routes — no OpenAI key needed (agent is mocked)."""
import pytest
from unittest.mock import AsyncMock, patch
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["service"] == "buddy-agent"
    assert data["support_phone"]
    assert "999999" not in data["support_phone"]


@patch("app.api.routes.process_message", new_callable=AsyncMock)
def test_chat_success(mock_process):
    mock_process.return_value = {
        "reply": "Login ke liye email aur password use karo.",
        "escalate": False,
        "escalation_reason": None,
    }
    response = client.post("/chat", json={"user_id": "test_user", "message": "login kaise karu"})
    assert response.status_code == 200
    data = response.json()
    assert "reply" in data
    assert data["escalate"] is False


@patch("app.api.routes.process_message", new_callable=AsyncMock)
def test_chat_escalation(mock_process):
    mock_process.return_value = {
        "reply": "Support team se contact karo.",
        "escalate": True,
        "escalation_reason": "payment_issue",
    }
    response = client.post("/chat", json={"user_id": "test_user_2", "message": "payment stuck hai"})
    assert response.status_code == 200
    data = response.json()
    assert data["escalate"] is True
    assert data["escalation_reason"] == "payment_issue"


def test_chat_empty_message():
    response = client.post("/chat", json={"user_id": "u1", "message": ""})
    assert response.status_code == 422


def test_get_conversation_empty():
    response = client.get("/conversation/brand_new_user_xyz")
    assert response.status_code == 200
    data = response.json()
    assert data["message_count"] == 0
    assert data["messages"] == []


def test_clear_conversation():
    response = client.delete("/conversation/some_user")
    assert response.status_code == 200
    assert response.json()["status"] == "cleared"
