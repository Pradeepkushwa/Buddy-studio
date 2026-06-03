import logging
from fastapi import APIRouter, HTTPException, Request
from slowapi import Limiter
from slowapi.util import get_remote_address

from app.agents.support_agent import process_message
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    ConversationHistory,
    ConversationMessage,
    HealthResponse,
)
from app.config.settings import settings
from app.services import memory

logger = logging.getLogger(__name__)

router = APIRouter()
limiter = Limiter(key_func=get_remote_address)


@router.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Render health check endpoint."""
    return HealthResponse(support_phone=settings.support_phone)


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
@limiter.limit("30/minute")
async def chat(request: Request, body: ChatRequest):
    """
    Main chat endpoint.

    Accepts a user_id and message, returns an AI reply with an escalation flag.
    If escalate=true the frontend should show the support contact details.
    """
    logger.info("Chat request: user_id=%s message_len=%d", body.user_id, len(body.message))

    try:
        result = await process_message(
            user_id=body.user_id,
            message=body.message,
            language=body.language,
        )
    except Exception as exc:
        logger.exception("Unexpected error processing message for user=%s", body.user_id)
        raise HTTPException(status_code=500, detail="Agent encountered an error. Please try again.") from exc

    return ChatResponse(
        reply=result["reply"],
        escalate=result["escalate"],
        escalation_reason=result.get("escalation_reason"),
        conversation_done=bool(result.get("conversation_done")),
    )


@router.get("/conversation/{user_id}", response_model=ConversationHistory, tags=["Conversation"])
async def get_conversation(user_id: str):
    """Return stored conversation history for a user."""
    if not user_id or len(user_id) > 128:
        raise HTTPException(status_code=400, detail="Invalid user_id")

    history = memory.get_history(user_id)
    messages = [ConversationMessage(role=m["role"], content=m["content"]) for m in history]

    return ConversationHistory(
        user_id=user_id,
        messages=messages,
        message_count=len(messages),
    )


@router.delete("/conversation/{user_id}", tags=["Conversation"])
async def clear_conversation(user_id: str):
    """Clear conversation history for a user (e.g. when chat widget is closed/reset)."""
    memory.clear_history(user_id)
    return {"status": "cleared", "user_id": user_id}
