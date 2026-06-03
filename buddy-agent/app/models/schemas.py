from typing import Literal, Optional

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=128, description="Unique user identifier")
    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    language: Literal["hi", "en"] = Field(
        default="hi",
        description="Preferred reply language from chat widget toggle",
    )

    model_config = {
        "json_schema_extra": {
            "example": {"user_id": "user_123", "message": "login nahi ho raha", "language": "hi"}
        }
    }


class ChatResponse(BaseModel):
    reply: str
    escalate: bool = False
    escalation_reason: Optional[str] = None
    conversation_done: bool = False


class ConversationMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ConversationHistory(BaseModel):
    user_id: str
    messages: list[ConversationMessage]
    message_count: int


class HealthResponse(BaseModel):
    status: str = "ok"
    service: str = "buddy-agent"
    version: str = "1.0.0"
    support_phone: str = ""
