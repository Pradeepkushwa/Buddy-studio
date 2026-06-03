import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import BuddyAgentIcon from './BuddyAgentIcon';

const AGENT_URL = process.env.REACT_APP_AGENT_URL || 'http://localhost:8000';
const DEFAULT_SUPPORT_PHONE = '+91-XXXXXXXXXX';

const BUBBLE_SIZE = 58;
const WINDOW_GAP = 14;
const IDLE_MS = 60_000;
const CLOSE_AFTER_DONE_MS = 2200;
const DRAG_THRESHOLD = 6;

/** Above Instagram float (bottom 28px + 54px height + gap) */
const DEFAULT_POS = { bottom: 96, right: 28 };

const COPY = {
  hi: {
    greeting:
      "Namaste! 👋 Main Buddy hoon, aapka support assistant.\n\nAaj main aapki kya madad kar sakta hoon?",
    placeholder: 'Apna sawaal yahan likhein...',
    escalationTitle: 'Aur madad chahiye?',
    escalationSub: 'Support team se connect karo',
    error:
      'Maafi chahta hoon, abhi kuch technical problem hai. Thodi der baad try karo.',
    footer: 'Buddy AI · Enter se bhejo',
    langToggleTitle: 'Switch to English',
    langLabel: 'EN',
    dragHint: 'Pakad ke kahin bhi shift karo',
  },
  en: {
    greeting:
      "Hi! 👋 I'm Buddy, your Buddy Studio support assistant.\n\nHow can I help you today?",
    placeholder: 'Type your question here...',
    escalationTitle: 'Need more help?',
    escalationSub: 'Contact our support team',
    error: 'Sorry, something went wrong. Please try again in a moment.',
    footer: 'Buddy AI · Press Enter to send',
    langToggleTitle: 'हिंदी में बदलें',
    langLabel: 'हि',
    dragHint: 'Drag to move anywhere',
  },
};

function generateSessionId() {
  return 'anon_' + Math.random().toString(36).slice(2, 10) + '_' + Date.now();
}

function readStoredLang() {
  const stored = sessionStorage.getItem('buddy_chat_lang');
  return stored === 'en' ? 'en' : 'hi';
}

function readStoredPosition() {
  try {
    const raw = localStorage.getItem('buddy_chat_pos');
    if (!raw) return { ...DEFAULT_POS };
    const parsed = JSON.parse(raw);
    if (typeof parsed.bottom === 'number' && typeof parsed.right === 'number') {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return { ...DEFAULT_POS };
}

function clampPosition(pos) {
  const margin = 12;
  const maxBottom = Math.max(margin, window.innerHeight - BUBBLE_SIZE - margin);
  const maxRight = Math.max(margin, window.innerWidth - BUBBLE_SIZE - margin);
  return {
    bottom: Math.min(Math.max(margin, pos.bottom), maxBottom),
    right: Math.min(Math.max(margin, pos.right), maxRight),
  };
}

function resolveSupportPhone(envValue, fromAgent) {
  const isPlaceholder = (n) =>
    !n || n.includes('XXXX') || n.includes('999999');
  if (fromAgent && !isPlaceholder(fromAgent)) return fromAgent;
  if (envValue && !isPlaceholder(envValue)) return envValue;
  return DEFAULT_SUPPORT_PHONE;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState(readStoredLang);
  const [pos, setPos] = useState(readStoredPosition);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [escalated, setEscalated] = useState(false);
  const [userId, setUserId] = useState('');
  const [hasGreeted, setHasGreeted] = useState(false);
  const [unread, setUnread] = useState(0);
  const [supportPhone, setSupportPhone] = useState(
    resolveSupportPhone(process.env.REACT_APP_SUPPORT_PHONE, null)
  );

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);
  const dragRef = useRef({ active: false, moved: false, startX: 0, startY: 0, startBottom: 0, startRight: 0 });
  const idleTimerRef = useRef(null);
  const closeTimerRef = useRef(null);

  const t = COPY[lang];
  const windowBottom = pos.bottom + BUBBLE_SIZE + WINDOW_GAP;

  const persistPosition = useCallback((next) => {
    const clamped = clampPosition(next);
    setPos(clamped);
    localStorage.setItem('buddy_chat_pos', JSON.stringify(clamped));
  }, []);

  const clearServerHistory = useCallback(() => {
    if (userId) {
      fetch(`${AGENT_URL}/conversation/${userId}`, { method: 'DELETE' }).catch(() => {});
    }
  }, [userId]);

  /** UI + agent memory reset. showGreeting=true → welcome now (↺); false → fresh on next open */
  const resetChatState = useCallback(
    ({ showGreeting = false } = {}) => {
      clearServerHistory();
      setEscalated(false);
      setInput('');
      setLoading(false);
      if (showGreeting) {
        setHasGreeted(true);
        setMessages([{ role: 'assistant', content: COPY[lang].greeting, id: Date.now() }]);
      } else {
        setHasGreeted(false);
        setMessages([]);
      }
    },
    [clearServerHistory, lang]
  );

  const closeChat = useCallback(() => {
    resetChatState();
    setOpen(false);
  }, [resetChatState]);

  const resetIdleTimer = useCallback(() => {
    if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    if (!open) return;
    idleTimerRef.current = setTimeout(closeChat, IDLE_MS);
  }, [open, closeChat]);

  useEffect(() => {
    fetch(`${AGENT_URL}/health`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.support_phone) {
          setSupportPhone(
            resolveSupportPhone(process.env.REACT_APP_SUPPORT_PHONE, data.support_phone)
          );
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user?.id) {
      setUserId(`user_${user.id}`);
    } else {
      const stored = sessionStorage.getItem('buddy_session_id') || generateSessionId();
      sessionStorage.setItem('buddy_session_id', stored);
      setUserId(stored);
    }
  }, [user]);

  useEffect(() => {
    if (open && !hasGreeted) {
      setHasGreeted(true);
      setMessages([{ role: 'assistant', content: COPY[lang].greeting, id: Date.now() }]);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, hasGreeted, lang]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  useEffect(() => {
    resetIdleTimer();
    return () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [open, input, messages, loading, resetIdleTimer]);

  useEffect(() => {
    const onResize = () => setPos((p) => clampPosition(p));
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const scheduleAutoClose = useCallback(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(closeChat, CLOSE_AFTER_DONE_MS);
  }, [closeChat]);

  const toggleLang = () => {
    const next = lang === 'hi' ? 'en' : 'hi';
    setLang(next);
    sessionStorage.setItem('buddy_chat_lang', next);
    setMessages([{ role: 'assistant', content: COPY[next].greeting, id: Date.now() }]);
    setEscalated(false);
    setInput('');
    resetIdleTimer();
  };

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || loading || !userId) return;

    const userMsg = { role: 'user', content: text, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    resetIdleTimer();

    try {
      const res = await fetch(`${AGENT_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, message: text, language: lang }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();
      const botMsg = { role: 'assistant', content: data.reply, id: Date.now() + 1, escalate: data.escalate };
      setMessages((prev) => [...prev, botMsg]);

      if (data.escalate) setEscalated(true);
      if (!open) setUnread((n) => n + 1);

      if (data.conversation_done) {
        scheduleAutoClose();
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: COPY[lang].error, id: Date.now() + 2 },
      ]);
    } finally {
      setLoading(false);
      resetIdleTimer();
    }
  }, [input, loading, userId, open, lang, scheduleAutoClose, resetIdleTimer]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleClose = () => closeChat();

  const handleReset = () => {
    resetChatState({ showGreeting: true });
    resetIdleTimer();
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    dragRef.current = {
      active: true,
      moved: false,
      startX: e.clientX,
      startY: e.clientY,
      startBottom: pos.bottom,
      startRight: pos.right,
      pointerId: e.pointerId,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = dragRef.current;
    if (!d.active) return;

    const dx = e.clientX - d.startX;
    const dy = e.clientY - d.startY;

    if (!d.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;
    d.moved = true;

    persistPosition({
      bottom: d.startBottom - dy,
      right: d.startRight - dx,
    });
  };

  const onPointerUp = (e) => {
    const d = dragRef.current;
    if (!d.active) return;
    d.active = false;

    try {
      e.currentTarget.releasePointerCapture(d.pointerId);
    } catch {
      /* ignore */
    }

    if (!d.moved) {
      setOpen((wasOpen) => {
        if (wasOpen) {
          resetChatState();
          return false;
        }
        return true;
      });
    }
  };

  const wrapStyle = {
    bottom: `${pos.bottom}px`,
    right: `${pos.right}px`,
  };

  const windowStyle = {
    bottom: `${windowBottom}px`,
    right: `${pos.right}px`,
  };

  return (
    <div className="chat-launcher-wrap" style={wrapStyle} ref={wrapRef}>
      <button
        type="button"
        className={`chat-bubble ${dragRef.current.moved ? 'chat-bubble-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        aria-label={open ? 'Close support chat' : 'Open support chat'}
        title={open ? 'Close chat' : `Buddy Support — ${t.dragHint}`}
      >
        <BuddyAgentIcon size={34} />
        {!open && unread > 0 && <span className="chat-bubble-badge">{unread}</span>}
        {open && <span className="chat-bubble-pulse" aria-hidden="true" />}
      </button>

      {open && (
        <div className="chat-window" style={windowStyle}>
          <div className="chat-header">
            <div className="chat-header-left">
              <div className="chat-avatar">
                <BuddyAgentIcon size={28} />
              </div>
              <div>
                <div className="chat-agent-name">Buddy Support</div>
                <div className="chat-agent-status">
                  <span className="chat-online-dot" /> Online
                </div>
              </div>
            </div>
            <div className="chat-header-actions">
              <button
                type="button"
                className="chat-lang-btn"
                onClick={toggleLang}
                title={t.langToggleTitle}
                aria-label={t.langToggleTitle}
              >
                {t.langLabel}
              </button>
              <button type="button" className="chat-btn-icon" onClick={handleReset} title="Start new chat">
                ↺
              </button>
              <button type="button" className="chat-btn-icon" onClick={handleClose} title="Close">
                ✕
              </button>
            </div>
          </div>

          {escalated && (
            <div className="chat-escalation-banner">
              <strong>📞 {t.escalationTitle}</strong>
              <div className="chat-escalation-sub">{t.escalationSub}</div>
              <div className="chat-escalation-phone">
                <a href={`tel:${supportPhone}`}>{supportPhone}</a>
                {' · '}
                <a
                  href={`https://wa.me/${supportPhone.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  WhatsApp
                </a>
              </div>
              <div className="chat-escalation-hours">Mon–Sat, 10 AM – 7 PM</div>
            </div>
          )}

          <div className="chat-messages" onScroll={resetIdleTimer} onClick={resetIdleTimer}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-message chat-message-${msg.role} ${msg.escalate ? 'chat-message-escalated' : ''}`}
              >
                {msg.role === 'assistant' && (
                  <div className="chat-msg-avatar">
                    <BuddyAgentIcon size={22} />
                  </div>
                )}
                <div className="chat-bubble-text">
                  {msg.content.split('\n').map((line, i, arr) => (
                    <span key={i}>
                      {line}
                      {i < arr.length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-message chat-message-assistant">
                <div className="chat-msg-avatar">
                  <BuddyAgentIcon size={22} />
                </div>
                <div className="chat-bubble-text chat-typing">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                resetIdleTimer();
              }}
              onKeyDown={handleKeyDown}
              placeholder={t.placeholder}
              rows={1}
              maxLength={2000}
              disabled={loading}
            />
            <button
              type="button"
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={!input.trim() || loading}
              aria-label="Send message"
            >
              ➤
            </button>
          </div>
          <div className="chat-footer">{t.footer}</div>
        </div>
      )}
    </div>
  );
}
