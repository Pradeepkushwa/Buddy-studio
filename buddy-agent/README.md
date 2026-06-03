# Buddy Agent

AI-powered support assistant for Buddy Studio — built with FastAPI + **Google Gemini (free tier)** by default.

## Architecture

```
User (Browser)
     |
     v
React ChatWidget (floating bubble — Buddy Studio frontend)
     |  POST /chat
     v
Buddy Agent — Python FastAPI  ←── this repo
     |
     +──> Knowledge Base (instant, free)
     |
     +──> Google Gemini (free — when KB has no match)
     |
     v
{ reply, escalate }
```

## Quick Start (Local)

```bash
# 1. Clone Buddy Studio monorepo and enter agent folder
git clone https://github.com/Pradeepkushwa/Buddy-studio.git
cd Buddy-studio/buddy-agent

# 2. Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies
pip install -r requirements.txt

# 4. Set environment variables
cp .env.example .env
# Edit .env — add GEMINI_API_KEY from https://aistudio.google.com/apikey

# 5. Run
uvicorn app.main:app --reload --port 8000
```

API docs available at: http://localhost:8000/docs

## API Reference

### `GET /health`
Returns service health status.

### `POST /chat`
```json
{
  "user_id": "user_123",
  "message": "login nahi ho raha"
}
```
Response:
```json
{
  "reply": "Login ke liye...",
  "escalate": false,
  "escalation_reason": null
}
```

### `GET /conversation/{user_id}`
Returns stored conversation history.

### `DELETE /conversation/{user_id}`
Clears conversation history.

## Agent Decision Flow

```
User message
     |
     v
[1] Escalation keyword check
     |── critical/payment/angry → escalate immediately
     |
     v
[2] Knowledge base search
     |── match found → return KB answer (no LLM cost)
     |
     v
[3] Repeat counter check
     |── >= 3 unresolved → escalate
     |
     v
[4] OpenAI GPT-4o-mini call
     |── JSON response with reply + escalate flag
     v
Return response
```

## Escalation

Agent escalates (shows support contact) when:
- Keywords: `refund`, `fraud`, `payment stuck`, `data lost`, `angry`, `complaint`
- Same issue repeated 3+ times
- LLM flags low confidence

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `LLM_PROVIDER` | No | `gemini` | `gemini`, `openai`, or `none` |
| `GEMINI_API_KEY` | Yes (if gemini) | — | Free key from Google AI Studio |
| `GEMINI_MODEL` | No | `gemini-flash-latest` | Gemini model name |
| `OPENAI_API_KEY` | Yes (if openai) | — | Only when using paid OpenAI |
| `SUPPORT_PHONE` | No | `+91-9999999999` | Support phone / WhatsApp |
| `ALLOWED_ORIGINS` | No | `*` | CORS origins (comma-separated) |
| `ESCALATION_THRESHOLD` | No | `3` | Repeat messages before escalation |

## Running Tests

```bash
pip install pytest pytest-asyncio
pytest tests/ -v
```

## Deployment on Render

1. Push this repo to GitHub
2. Go to Render → New → Web Service → connect your repo
3. Build command: `pip install -r requirements.txt`
4. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
5. Add environment variable: `OPENAI_API_KEY` (secret)
6. Update `ALLOWED_ORIGINS` with your frontend URL

Or use the included `render.yaml` for one-click deploy.

## V2 Roadmap

- [ ] PostgreSQL for persistent conversation history
- [ ] RAG with vector database for richer knowledge
- [ ] LangGraph for multi-step agent workflows
- [ ] WhatsApp / Email integration
- [ ] Ticket creation on escalation
- [ ] Human handoff
