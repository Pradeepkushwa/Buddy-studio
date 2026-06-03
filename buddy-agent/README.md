# Buddy Agent

AI-powered support assistant for Buddy Studio — built with FastAPI + **Google Gemini (free tier)** by default.

> **Secrets:** Never commit `.env` or real API keys / phone numbers. Use `.env.example` placeholders only. Set real values locally in `.env` and on Render in the dashboard.

## Architecture

```
User (Browser)
     |
     v
React ChatWidget (floating bubble — Buddy Studio frontend)
     |  POST /chat
     v
Buddy Agent — Python FastAPI  ←── this folder
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
# 1. Clone monorepo and enter agent folder
git clone https://github.com/your-org/Buddy-studio.git
cd Buddy-studio/buddy-agent

# 2. Create virtual environment (recreate if folder was moved)
python3 -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# 3. Install dependencies (use python -m pip if `pip` not found)
python3 -m pip install -r requirements.txt

# 4. Set environment variables (local only — file is gitignored)
cp .env.example .env
# Edit .env:
#   GEMINI_API_KEY=xxxx   (real key from https://aistudio.google.com/apikey)
#   SUPPORT_PHONE=+91-XXXXXXXXXX   (your real studio number)

# 5. Run
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

## API Reference

### `GET /health`
Returns service health and `support_phone` (from env).

### `POST /chat`
```json
{
  "user_id": "user_123",
  "message": "login nahi ho raha",
  "language": "hi"
}
```
Response:
```json
{
  "reply": "Login ke liye...",
  "escalate": false,
  "escalation_reason": null,
  "conversation_done": false
}
```

### `GET /conversation/{user_id}` — history  
### `DELETE /conversation/{user_id}` — clear history

## Agent Decision Flow

```
User message
     |
     v
[0] Thanks / done → polite close
[1] Escalation keywords → escalate if critical
[2] Knowledge base → instant answer
[3] Repeat counter → escalate after threshold
[4] LLM (Gemini / OpenAI / none)
```

## Environment Variables

| Variable | Required | Example in docs | Description |
|----------|----------|-----------------|-------------|
| `LLM_PROVIDER` | No | `gemini` | `gemini`, `openai`, or `none` |
| `GEMINI_API_KEY` | Yes (if gemini) | `xxxx...` | Google AI Studio key — **secret** |
| `GEMINI_MODEL` | No | `gemini-flash-latest` | Gemini model |
| `OPENAI_API_KEY` | Yes (if openai) | `sk-xxxx...` | OpenAI key — **secret** |
| `SUPPORT_PHONE` | No | `+91-XXXXXXXXXX` | Support phone / WhatsApp |
| `ALLOWED_ORIGINS` | No | `http://localhost:3000` | CORS origins (comma-separated) |
| `ESCALATION_THRESHOLD` | No | `3` | Repeat messages before escalation |

## Running Tests

```bash
python3 -m pip install pytest pytest-asyncio
LLM_PROVIDER=none python3 -m pytest tests/ -v
```

## Deployment on Render

1. Same **Buddy-studio** repo; **Root Directory** = `buddy-agent`
2. Build: `pip install -r requirements.txt`
3. Start: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Health check: `/health`
5. Set in dashboard (secrets / real values — not in git):
   - `GEMINI_API_KEY` = your real key
   - `SUPPORT_PHONE` = your real number
   - `ALLOWED_ORIGINS` = your real frontend URL

See [../docs/DEPLOY-BUDDY-AGENT.md](../docs/DEPLOY-BUDDY-AGENT.md) for full steps.

## V2 Roadmap

- [ ] PostgreSQL for persistent conversation history
- [ ] RAG with vector database
- [ ] LangGraph workflows
- [ ] WhatsApp / Email integration
- [ ] Ticket creation on escalation
