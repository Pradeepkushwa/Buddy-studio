# Buddy Agent — Render deploy (existing Buddy Studio safe)

Yeh guide **3rd service** add karti hai. Purana **Rails backend** aur **React frontend** change nahi hote — sirf frontend par ek env variable add hoti hai.

## Repo structure (after move)

```
Buddy-studio/
├── backend/          ← existing Rails (Render — mat chhedo)
├── frontend/         ← existing React (Render — sirf 1 env add)
└── buddy-agent/      ← naya Python FastAPI (Render — nayi service)
```

---

## Part A — Git: code push (ek baar)

### 1. Local paths update

Agent ab yahan hai:

```bash
cd Buddy-studio/buddy-agent
source venv/bin/activate   # pehle se hai to same
uvicorn app.main:app --reload --port 8000
```

Frontend (dusre terminal):

```bash
cd Buddy-studio/frontend
npm start
```

### 2. Commit + push

```bash
cd Buddy-studio
git add buddy-agent/ frontend/src/components/ frontend/src/App.js frontend/src/App.css frontend/.env.example
git status   # .env / venv / node_modules staged NA hon
git commit -m "Add buddy-agent inside monorepo and chat widget integration"
git push origin main
```

> **Note:** `frontend/.env` aur `buddy-agent/.env` git mein nahi jaate (secrets).

---

## Part B — Render: nayi Web Service (buddy-agent)

### Step 1 — Dashboard

1. [render.com](https://render.com) → login  
2. **New +** → **Web Service**  
3. Repo select karo: **Buddy-studio** (same repo jahan backend/frontend hain)

### Step 2 — Service settings (important)

| Field | Value |
|--------|--------|
| **Name** | `buddy-agent` (ya `buddy-studio-agent`) |
| **Region** | Wahi jo backend/frontend (e.g. Singapore) |
| **Branch** | `main` |
| **Root Directory** | `buddy-agent` ← **zaroori** — monorepo |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| **Health Check Path** | `/health` |

### Step 3 — Environment variables (buddy-agent service)

| Key | Value | Secret? |
|-----|--------|---------|
| `LLM_PROVIDER` | `gemini` | No |
| `GEMINI_API_KEY` | Google AI Studio se key | **Yes** |
| `GEMINI_MODEL` | `gemini-flash-latest` | No |
| `SUPPORT_PHONE` | `+91-XXXXXXXXXX` (apna asli number) | No |
| `SUPPORT_WHATSAPP` | `+91-XXXXXXXXXX` | No |
| `ALLOWED_ORIGINS` | Apna **live frontend URL** | No |

**ALLOWED_ORIGINS example:**

```
https://buddy-studio-frontend.onrender.com
```

Agar custom domain hai:

```
https://www.tumhara-domain.com,https://buddy-studio-frontend.onrender.com
```

> Local test ke liye agent `.env` mein `http://localhost:3000` rakho — production Render par sirf live URL.

### Step 4 — Deploy

1. **Create Web Service**  
2. Deploy complete hone do → URL milega jaise: `https://buddy-agent-xxxx.onrender.com`  
3. Test: browser mein `https://YOUR-AGENT-URL/health` → `"status":"ok"` aur sahi `support_phone` (jo Render par set kiya)

---

## Part C — Existing frontend service (sirf env — code break nahi)

Purani React service **rebuild** hogi, lekin Rails touch nahi.

### Step 1 — Frontend env on Render

Existing **frontend** Web Service → **Environment**:

| Key | Value |
|-----|--------|
| `REACT_APP_AGENT_URL` | `https://buddy-agent-xxxx.onrender.com` (Step B ka URL) |
| `REACT_APP_SUPPORT_PHONE` | `+91-XXXXXXXXXX` (same as agent) |

`REACT_APP_API_URL` — **change mat karo** (Rails backend URL same rehna chahiye).

### Step 2 — Manual deploy frontend

Frontend service → **Manual Deploy** → **Deploy latest commit**  
(taaki naye env build mein embed ho jayein)

### Step 3 — Verify

1. Live site kholo → chat bubble dikhe  
2. Message bhejo → reply aaye  
3. Escalation par sahi support number dikhe (placeholder 999/XXXX nahi)

---

## Part D — Kya mat karna (break se bachne ke liye)

| Mat karo | Kyon |
|----------|------|
| Backend Root Directory change | Rails alag folder mein hai |
| Backend env delete / rename | API break ho jayegi |
| Frontend `REACT_APP_API_URL` badalna bina reason | Login/booking break |
| Agent ko frontend ke andar build karna | Alag service sahi hai |
| `ALLOWED_ORIGINS=*` production mein | Security risk — sirf apna frontend URL |

---

## Part E — Rollback (agar kuch galat ho)

1. Frontend se `REACT_APP_AGENT_URL` hata do → purana site chalega, chat agent off  
2. Ya frontend ko pichhle commit par redeploy  
3. `buddy-agent` service **suspend** kar sakte ho — backend/frontend par asar nahi

---

## Quick checklist

- [ ] `buddy-agent` folder `Buddy-studio/buddy-agent` mein hai  
- [ ] Git push `main` par ho gaya  
- [ ] Render: nayi service, **Root Directory = `buddy-agent`**  
- [ ] `GEMINI_API_KEY` + `ALLOWED_ORIGINS` set  
- [ ] Frontend: `REACT_APP_AGENT_URL` = agent URL  
- [ ] Frontend redeploy  
- [ ] `/health` + live chat test  

---

## Local vs production

| | Local | Render |
|--|--------|--------|
| Agent | `http://localhost:8000` | `https://buddy-agent-xxx.onrender.com` |
| Frontend env | `frontend/.env` | Render dashboard env |
| CORS | `localhost:3000` in agent `.env` | Live frontend URL in `ALLOWED_ORIGINS` |
