import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { products } from "../../data/products";
import { useCart } from "../../context/CartContext";
import { useCompare } from "../../context/CompareContext";
import { useAuth } from "../../context/AuthContext";
import styles from "./ChatBot.module.css";

interface Message {
  role: "user" | "assistant";
  content: string;
  productIds?: string[];
  timestamp: Date;
}

function buildSystemPrompt(userName?: string): string {
  const catalog = products
    .map((p) => {
      const disc = p.originalPrice
        ? Math.round((1 - p.price / p.originalPrice) * 100)
        : 0;
      return [
        p.id,
        p.name,
        p.brand,
        p.type,
        `$${p.price}${disc ? ` (-${disc}%)` : ""}`,
        `${p.rating}★ (${p.reviewCount})`,
        p.specs.display,
        p.specs.processor,
        p.specs.ram,
        p.specs.camera,
        p.specs.battery,
        p.inStock ? "in-stock" : "out-of-stock",
        p.isNew ? "NEW" : "",
      ]
        .filter(Boolean)
        .join(" | ");
    })
    .join("\n");

  const greeting = userName
    ? ` User's name: ${userName} — use it naturally.`
    : "";

  return `You are NexBot, AI shopping assistant for NexPhone smartphone store.${greeting}
Personality: warm, concise, direct — like a knowledgeable friend.

STORE: Free worldwide shipping • 30-day returns • 2-year warranty • Card or cash on delivery

CATALOG (id | name | brand | type | price | rating | display | processor | RAM | camera | battery | stock):
${catalog}

RULES:
- Replies under 150 words unless detailed comparison requested
- When recommending phones, append EXACTLY at end (nothing after): |||PRODUCTS:["id1","id2"]|||
- Only use IDs from catalog above
- End every reply with a question or action prompt`;
}

function parseResponse(raw: string): { text: string; productIds: string[] } {
  const match = raw.match(/\|\|\|PRODUCTS:\[([^\]]*)\]\|\|\|/);
  if (!match) return { text: raw.trim(), productIds: [] };
  const text = raw.replace(/\|\|\|PRODUCTS:\[([^\]]*)\]\|\|\|/, "").trim();
  try {
    const ids: string[] = JSON.parse(`[${match[1]}]`);
    return {
      text,
      productIds: ids.filter((id) => products.find((p) => p.id === id)),
    };
  } catch {
    return { text, productIds: [] };
  }
}

function InlineCard({
  productId,
  onAdd,
}: {
  productId: string;
  onAdd: (id: string) => void;
}) {
  const navigate = useNavigate();
  const p = products.find((x) => x.id === productId);
  if (!p) return null;
  const disc = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100)
    : null;
  return (
    <div
      className={styles.inlineCard}
      onClick={() => navigate(`/product/${p.id}`)}
    >
      <div className={styles.inlineImg}>
        <img src={p.image} alt={p.name} />
      </div>
      <div className={styles.inlineInfo}>
        <span className={styles.inlineBrand}>{p.brand}</span>
        <span className={styles.inlineName}>{p.name}</span>
        <div className={styles.inlineMeta}>
          <span className={styles.inlinePrice}>
            ${p.price.toLocaleString()}
          </span>
          {disc && <span className={styles.inlineDisc}>−{disc}%</span>}
          <span className={styles.inlineRating}>★ {p.rating}</span>
        </div>
      </div>
      <button
        className={styles.inlineAdd}
        onClick={(e) => {
          e.stopPropagation();
          onAdd(p.id);
        }}
        title="Add to cart"
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </button>
    </div>
  );
}

function TypingDots() {
  return (
    <div className={styles.typingDots}>
      <span />
      <span />
      <span />
    </div>
  );
}

function MsgText({ text, isUser }: { text: string; isUser: boolean }) {
  return (
    <div className={`${styles.msgText} ${isUser ? styles.msgTextUser : ""}`}>
      {text.split("\n").map((line, i) => {
        if (!line.trim()) return <br key={i} />;
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <p key={i}>
            {parts.map((p, j) =>
              p.startsWith("**") && p.endsWith("**") ? (
                <strong key={j}>{p.slice(2, -2)}</strong>
              ) : (
                p
              ),
            )}
          </p>
        );
      })}
    </div>
  );
}

const QUICK = [
  "Best phone under $500",
  "Best camera phone",
  "Compare iPhone vs Samsung",
  "Best for battery life",
  "Show me new arrivals",
  "Best flagship phones",
];

export default function ChatBot() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { addToCompare } = useCompare();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: user
        ? `Hey ${user.firstName}! 👋 I'm **NexBot**, your personal phone advisor.\n\nWhat are you looking for today? Tell me your budget or what you mainly use your phone for and I'll find the perfect match!`
        : "Hi! I'm **NexBot** 👋 Your personal smartphone advisor.\n\nTell me your budget, use case, or what matters most — I'll find your perfect phone!",
      productIds: [],
      timestamp: new Date(),
    },
  ]);

  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  const handleAdd = useCallback(
    (productId: string) => {
      const p = products.find((x) => x.id === productId);
      if (p) addItem(p, p.colors[0]);
    },
    [addItem],
  );

  async function send(text: string) {
    if (!text.trim() || loading) return;
    const userMsg: Message = {
      role: "user",
      content: text.trim(),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const allMsgs = [...messages, userMsg];
    const firstUserIdx = allMsgs.findIndex((m) => m.role === "user");
    const trimmedMsgs =
      firstUserIdx >= 0 ? allMsgs.slice(firstUserIdx) : allMsgs;

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
      if (!apiKey) throw new Error("NO_KEY");

      const geminiHistory = trimmedMsgs.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [
          {
            text:
              m.role === "assistant"
                ? m.content
                    .replace(/\|\|\|PRODUCTS:\[([^\]]*)\]\|\|\|/g, "")
                    .trim()
                : m.content,
          },
        ],
      }));

      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: buildSystemPrompt(user?.firstName) }],
            },
            contents: geminiHistory,
            generationConfig: {
              maxOutputTokens: 1024,
              temperature: 0.7,
            },
          }),
        },
      );
      if (!res.ok) throw new Error(`${res.status}`);
      const data = await res.json();
      const raw =
        data.candidates?.[0]?.content?.parts?.[0]?.text ??
        "Sorry, I had trouble responding. Try again!";
      const { text: parsed, productIds } = parseResponse(raw);
      const botMsg: Message = {
        role: "assistant",
        content: parsed,
        productIds,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, botMsg]);
      if (!open) setUnread((n) => n + 1);
    } catch (err: unknown) {
      const noKey = err instanceof Error && err.message === "NO_KEY";
      const errMsg = noKey
        ? "API key not set. Add VITE_GEMINI_API_KEY to your .env file and restart the dev server. Get a free key at aistudio.google.com"
        : err instanceof Error && err.message.includes("429")
          ? "You've sent a few messages quickly — the free API allows 15 per minute. Wait 60 seconds and try again! 🕐"
          : "I'm having a little trouble connecting. Please check your internet and try again!";
      console.error("[NexBot error]", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: errMsg,
          productIds: [],
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clear() {
    setMessages([
      {
        role: "assistant",
        content: user
          ? `Chat cleared! What can I help you find today, ${user.firstName}?`
          : "Chat cleared! How can I help you find your perfect phone? 📱",
        productIds: [],
        timestamp: new Date(),
      },
    ]);
  }

  const showQuick = messages.length <= 1 && !loading;

  return (
    <>
      <button
        className={`${styles.bubble} ${open ? styles.bubbleOpen : ""}`}
        onClick={() => setOpen((o) => !o)}
        aria-label="Open AI chat assistant"
      >
        {open ? (
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="12" cy="10" r="1" fill="currentColor" />
            <circle cx="15" cy="10" r="1" fill="currentColor" />
          </svg>
        )}
        {!open && unread > 0 && <span className={styles.unread}>{unread}</span>}
      </button>

      <div className={`${styles.panel} ${open ? styles.panelOpen : ""}`}>
        <div className={styles.head}>
          <div className={styles.headLeft}>
            <div className={styles.avatar}>
              <svg
                width="17"
                height="17"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
              >
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <circle cx="12" cy="17" r="1.2" fill="currentColor" />
              </svg>
            </div>
            <div>
              <span className={styles.botName}>NexBot</span>
              <span className={styles.botStatus}>
                <span className={styles.statusDot} />
                AI Phone Advisor
              </span>
            </div>
          </div>
          <div className={styles.headRight}>
            <button
              className={styles.iconBtn}
              onClick={clear}
              title="Clear chat"
            >
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
            <button
              className={styles.iconBtn}
              onClick={() => setOpen(false)}
              title="Close"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>

        <div className={styles.msgs}>
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`${styles.msgRow} ${msg.role === "user" ? styles.msgUser : styles.msgBot}`}
            >
              {msg.role === "assistant" && (
                <div className={styles.msgAvatar}>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="5" y="2" width="14" height="20" rx="3" />
                    <circle cx="12" cy="17" r="1" fill="currentColor" />
                  </svg>
                </div>
              )}
              <div
                className={`${styles.msgBubble} ${msg.role === "user" ? styles.bubbleUser : styles.bubbleBot}`}
              >
                <MsgText text={msg.content} isUser={msg.role === "user"} />
                {msg.productIds && msg.productIds.length > 0 && (
                  <div className={styles.inlineCards}>
                    {msg.productIds.map((id) => (
                      <InlineCard key={id} productId={id} onAdd={handleAdd} />
                    ))}
                  </div>
                )}
                <span className={styles.time}>
                  {msg.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className={`${styles.msgRow} ${styles.msgBot}`}>
              <div className={styles.msgAvatar}>
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="5" y="2" width="14" height="20" rx="3" />
                  <circle cx="12" cy="17" r="1" fill="currentColor" />
                </svg>
              </div>
              <div className={`${styles.msgBubble} ${styles.bubbleBot}`}>
                <TypingDots />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {showQuick && (
          <div className={styles.quick}>
            <p className={styles.quickLabel}>Try asking:</p>
            <div className={styles.quickGrid}>
              {QUICK.map((q) => (
                <button
                  key={q}
                  className={styles.quickChip}
                  onClick={() => send(q)}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className={styles.inputRow}>
          <input
            ref={inputRef}
            className={styles.input}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send(input);
              }
            }}
            placeholder="Ask about phones, budget, specs…"
            disabled={loading}
            maxLength={500}
          />
          <button
            className={`${styles.sendBtn} ${!input.trim() || loading ? styles.sendDisabled : ""}`}
            onClick={() => send(input)}
            disabled={!input.trim() || loading}
            aria-label="Send"
          >
            <svg
              width="17"
              height="17"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <div className={styles.foot}>Powered by Google AI Studio</div>
      </div>

      {open && (
        <div className={styles.backdrop} onClick={() => setOpen(false)} />
      )}
    </>
  );
}
