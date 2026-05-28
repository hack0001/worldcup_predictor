"use client";
import { useState, useEffect, useRef } from "react";
import { Player } from "@/app/data/types";
import { Message, getMessages, sendMessage, deleteMessage, subscribeToMessages } from "@/lib/storage";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  currentPlayer: Player;
  allPlayers: Player[];
  isAdmin?: boolean;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " + d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const QUICK_REACTIONS = ["⚽", "🔥", "😂", "😬", "👏", "🤦", "💀", "🏆"];

export default function GroupChat({ currentPlayer, allPlayers, isAdmin }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const playerMap = Object.fromEntries(allPlayers.map(p => [p.id, p]));

  // Load initial messages
  useEffect(() => {
    getMessages(100).then(msgs => {
      setMessages(msgs);
      setLoading(false);
    });
  }, []);

  // Subscribe to new messages in real time
  useEffect(() => {
    const channel = subscribeToMessages(msg => {
      setMessages(prev => [...prev, msg]);
    });
    return () => { channel.unsubscribe(); };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setInput("");
    await sendMessage(currentPlayer.id, trimmed);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  // Group consecutive messages from same player
  const grouped = messages.map((msg, i) => ({
    ...msg,
    isFirst: i === 0 || messages[i - 1].playerId !== msg.playerId,
    isLast: i === messages.length - 1 || messages[i + 1].playerId !== msg.playerId,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: "400px", maxHeight: "700px" }}>
      {/* Header */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "20px" }}>💬</span>
        <div>
          <p style={{ fontWeight: 700, fontSize: "14px" }}>Group Chat</p>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>{allPlayers.length} players · messages are live for everyone</p>
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: "6px" }}>
          {allPlayers.map(p => (
            <AvatarDisplay key={p.id} url={p.avatarUrl} name={p.name} size={24} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
        {loading && (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>Loading messages...</div>
        )}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>👋</p>
            <p style={{ fontWeight: 600, marginBottom: "4px" }}>No messages yet</p>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Be the first to say something!</p>
          </div>
        )}
        {grouped.map(msg => {
          const sender = playerMap[msg.playerId];
          const isMe = msg.playerId === currentPlayer.id;
          const canDelete = isMe || isAdmin;

          return (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: isMe ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: "8px",
                padding: `${msg.isFirst ? "8px" : "2px"} 12px ${msg.isLast ? "4px" : "2px"}`,
              }}
            >
              {/* Avatar — only on first message in group */}
              <div style={{ width: 32, flexShrink: 0, marginBottom: "2px" }}>
                {msg.isLast && sender && (
                  <AvatarDisplay url={sender.avatarUrl} name={sender?.name || "?"} size={32} />
                )}
              </div>

              {/* Bubble */}
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                {/* Name + time on first */}
                {msg.isFirst && !isMe && sender && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "3px", marginLeft: "4px" }}>
                    {sender.name}
                    {sender.status && <span style={{ fontWeight: 400, color: "var(--text-3)" }}> · {sender.status}</span>}
                  </span>
                )}
                <div style={{ position: "relative", display: "inline-block" }}>
                  <div
                    style={{
                      background: isMe ? "var(--green)" : "var(--surface)",
                      color: isMe ? "white" : "var(--text)",
                      border: isMe ? "none" : "1px solid var(--border)",
                      borderRadius: isMe
                        ? `12px 12px ${msg.isLast ? "2px" : "12px"} 12px`
                        : `12px 12px 12px ${msg.isLast ? "2px" : "12px"}`,
                      padding: "8px 12px",
                      fontSize: "14px",
                      lineHeight: 1.5,
                      wordBreak: "break-word",
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
                {msg.isLast && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", padding: "0 4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-3)" }}>{formatTime(msg.createdAt)}</span>
                    {canDelete && (
                      <button onClick={() => handleDelete(msg.id)} style={{ fontSize: "10px", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                        delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Quick reactions */}
      <div style={{ display: "flex", gap: "4px", padding: "8px 12px 4px", overflowX: "auto" }}>
        {QUICK_REACTIONS.map(emoji => (
          <button
            key={emoji}
            onClick={() => send(emoji)}
            style={{ fontSize: "20px", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", flexShrink: 0 }}
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ display: "flex", gap: "8px", padding: "8px 12px 12px" }}>
        <div style={{ flexShrink: 0 }}>
          <AvatarDisplay url={currentPlayer.avatarUrl} name={currentPlayer.name} size={32} />
        </div>
        <input
          ref={inputRef}
          type="text"
          placeholder="Say something..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={sending}
          maxLength={300}
          style={{ flex: 1, borderRadius: "20px", padding: "8px 16px" }}
        />
        <button
          className="btn-primary"
          onClick={() => send(input)}
          disabled={!input.trim() || sending}
          style={{ borderRadius: "20px", padding: "8px 16px", flexShrink: 0 }}
        >
          Send
        </button>
      </div>
    </div>
  );
}
