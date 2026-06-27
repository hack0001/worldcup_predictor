"use client";
import React, { useState, useEffect, useRef } from "react";
import { Player } from "@/app/data/types";
import { Message, getMessages, sendMessage, deleteMessage, subscribeToMessages, getReactions, toggleReaction, subscribeToReactions, Reaction } from "@/lib/storage";
import { supabase } from "@/lib/supabase";
import { AvatarDisplay } from "./AvatarPicker";
import GifPicker from "./GifPicker";
import EmojiPicker from "./EmojiPicker";
import { PollCard, CreatePoll } from "./Poll";

interface Props {
  currentPlayer: Player;
  allPlayers: Player[];
  isAdmin?: boolean;
  leagueId?: string;
}

interface Poll {
  id: string;
  playerId: string;
  question: string;
  options: string[];
  createdAt: string;
}

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const isToday = d.toDateString() === now.toDateString();
  if (isToday) return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " +
    d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

const QUICK_REACTIONS = ["⚽", "🔥", "😂", "😬", "👏", "🤦", "💀", "🏆"];

export default function GroupChat({ currentPlayer, allPlayers, isAdmin, leagueId }: Props) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [polls, setPolls] = useState<Record<string, Poll>>({});
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [readReceipts, setReadReceipts] = useState<Record<string, string[]>>({}); // messageId -> [playerId]
  const [showEmojiFor, setShowEmojiFor] = useState<string | null>(null); // messageId
  const [sending, setSending] = useState(false);
  const [showGif, setShowGif] = useState(false);
  const [showPoll, setShowPoll] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const initialScrollDone = useRef(false);

  const playerMap = Object.fromEntries(allPlayers.map(p => [p.id, p]));

  // Load messages
  useEffect(() => {
    getMessages(100, leagueId).then(async msgs => {
      setMessages(msgs);
      setLoading(false);
      const ids = msgs.map(m => m.id);
      getReactions(ids).then(setReactions);
      if (ids.length > 0) {
        const { data: rdata } = await supabase.from("message_reads").select("message_id, player_id").in("message_id", ids);
        const rr: Record<string, string[]> = {};
        (rdata || []).forEach((r: { message_id: string; player_id: string }) => {
          if (!rr[r.message_id]) rr[r.message_id] = [];
          rr[r.message_id].push(r.player_id);
        });
        setReadReceipts(rr);
      }
      if (msgs.length > 0) {
        const latest = msgs[msgs.length - 1];
        await supabase.from("message_reads").upsert({ message_id: latest.id, player_id: currentPlayer.id }, { onConflict: "message_id,player_id" });
        localStorage.setItem(`chat_read_${currentPlayer.id}`, latest.id);
      }
      const pollIds = [...new Set(msgs.map(m => m.pollId).filter(Boolean))];
      if (pollIds.length > 0) {
        const { data } = await supabase.from("polls").select("*").in("id", pollIds as string[]);
        const pollMap: Record<string, Poll> = {};
        (data || []).forEach(d => { pollMap[d.id] = { id: d.id, playerId: d.player_id, question: d.question, options: d.options, createdAt: d.created_at }; });
        setPolls(pollMap);
      }

    });
  }, [leagueId]);

  const handleScroll = () => {};



  const endRefCallback = (node: HTMLDivElement | null) => {
    (messagesEndRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
  };

  // Subscribe to new messages
  useEffect(() => {
    const channel = subscribeToMessages(async msg => {
      setMessages(prev => [...prev, msg]);
      // Auto-mark as read since chat is open
      await supabase.from("message_reads").upsert({ message_id: msg.id, player_id: currentPlayer.id }, { onConflict: "message_id,player_id" });
      localStorage.setItem(`chat_read_${currentPlayer.id}`, msg.id);
      setReadReceipts(prev => {
        const readers = prev[msg.id] || [];
        if (!readers.includes(currentPlayer.id)) return { ...prev, [msg.id]: [...readers, currentPlayer.id] };
        return prev;
      });
      if (msg.pollId) {
        const { data } = await supabase.from("polls").select("*").eq("id", msg.pollId).single();
        if (data) setPolls(prev => ({ ...prev, [data.id]: { id: data.id, playerId: data.player_id, question: data.question, options: data.options, createdAt: data.created_at } }));
      }
    });
    return () => { channel.unsubscribe(); };
  }, []);

  // Subscribe to reactions
  useEffect(() => {
    const channel = subscribeToReactions((r, deleted) => {
      setReactions(prev => deleted
        ? prev.filter(x => !(x.messageId === r.messageId && x.playerId === r.playerId && x.emoji === r.emoji))
        : [...prev.filter(x => !(x.messageId === r.messageId && x.playerId === r.playerId && x.emoji === r.emoji)), r]
      );
    });
    return () => { channel.unsubscribe(); };
  }, []);



  const send = async (content: string, gifUrl?: string, pollId?: string) => {
    const trimmed = content.trim();
    if ((!trimmed && !gifUrl && !pollId) || sending) return;
    setSending(true);
    setInput("");
    setShowGif(false);
    setShowPoll(false);
    await sendMessage(currentPlayer.id, trimmed || (gifUrl ? "GIF" : "📊 Poll"), gifUrl, pollId, leagueId);
    setSending(false);
    inputRef.current?.focus();
  };

  const handleReaction = async (messageId: string, emoji: string) => {
    setShowEmojiFor(null);
    // Check if user already reacted to this message with any emoji
    const existing = reactions.find(r => r.messageId === messageId && r.playerId === currentPlayer.id);
    if (existing) {
      if (existing.emoji === emoji) {
        // Same emoji — toggle off
        await toggleReaction(messageId, currentPlayer.id, emoji);
      } else {
        // Different emoji — remove old, add new
        await supabase.from("message_reactions")
          .delete()
          .eq("message_id", messageId)
          .eq("player_id", currentPlayer.id);
        await supabase.from("message_reactions")
          .insert({ message_id: messageId, player_id: currentPlayer.id, emoji });
      }
    } else {
      await toggleReaction(messageId, currentPlayer.id, emoji);
    }
  };

  const handlePollCreated = (poll: Poll) => {
    setPolls(prev => ({ ...prev, [poll.id]: poll }));
    send("", undefined, poll.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this message?")) return;
    await deleteMessage(id);
    setMessages(prev => prev.filter(m => m.id !== id));
  };

  const grouped = messages.map((msg, i) => ({
    ...msg,
    isFirst: i === 0 || messages[i - 1].playerId !== msg.playerId,
    isLast: i === messages.length - 1 || messages[i + 1].playerId !== msg.playerId,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 200px)", minHeight: "420px", maxHeight: "720px" }}>

      {/* Header */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
        <span style={{ fontSize: "20px" }}>💬</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: "14px" }}>Group Chat</p>
          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>{allPlayers.length} players · live for everyone</p>
        </div>
        <div style={{ display: "flex", gap: "5px" }}>
          {allPlayers.slice(0, 8).map(p => (
            <AvatarDisplay key={p.id} url={p.avatarUrl} name={p.name} size={24} />
          ))}
        </div>
      </div>

      {/* Messages */}
      <div ref={messagesContainerRef} onScroll={handleScroll} style={{ flex: 1, overflowY: "auto", minHeight: 0, display: "flex", flexDirection: "column-reverse" as React.CSSProperties["flexDirection"] }}>
        {loading && <div style={{ textAlign: "center", padding: "40px", color: "var(--text-3)" }}>Loading...</div>}
        {!loading && messages.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>👋</p>
            <p style={{ fontWeight: 600, marginBottom: "4px" }}>No messages yet</p>
            <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Say something or create a poll!</p>
          </div>
        )}

        {grouped.map(msg => {
          const sender = playerMap[msg.playerId];
          const isMe = msg.playerId === currentPlayer.id;
          const canDelete = isMe || isAdmin;
          const isGif = !!msg.gifUrl;
          const isPoll = !!msg.pollId;
          const poll = isPoll ? polls[msg.pollId!] : null;

          // Poll messages render full-width (not in a bubble)
          if (isPoll) {
            return (
              <div key={msg.id} style={{ padding: "6px 12px" }}>
                {msg.isFirst && sender && (
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <AvatarDisplay url={sender.avatarUrl} name={sender.name} size={22} />
                    <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)" }}>
                      {sender.name} started a poll
                    </span>
                    <span style={{ fontSize: "10px", color: "var(--text-3)" }}>· {formatTime(msg.createdAt)}</span>
                  </div>
                )}
                {poll ? (
                  <PollCard poll={poll} currentPlayer={currentPlayer} allPlayers={allPlayers} />
                ) : (
                  <div className="card" style={{ padding: "12px", borderLeft: "3px solid var(--green)" }}>
                    <p style={{ fontSize: "13px", color: "var(--text-3)" }}>📊 Loading poll...</p>
                  </div>
                )}
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              style={{ display: "flex", flexDirection: isMe ? "row-reverse" : "row", alignItems: "flex-end", gap: "8px", padding: `${msg.isFirst ? "8px" : "2px"} 12px ${msg.isLast ? "4px" : "2px"}` }}
              onMouseLeave={() => { if (showEmojiFor === msg.id) setShowEmojiFor(null); }}
            >
              <div style={{ width: 32, flexShrink: 0 }}>
                {msg.isLast && sender && <AvatarDisplay url={sender.avatarUrl} name={sender.name || "?"} size={32} />}
              </div>
              <div style={{ maxWidth: "72%", display: "flex", flexDirection: "column", alignItems: isMe ? "flex-end" : "flex-start" }}>
                {msg.isFirst && !isMe && sender && (
                  <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "3px", marginLeft: "4px" }}>
                    {sender.name}
                    {sender.status && <span style={{ fontWeight: 400, color: "var(--text-3)" }}> · {sender.status}</span>}
                  </span>
                )}

                {/* Bubble + hover react button */}
                {(() => {
                  const alreadyReacted = reactions.some(r => r.messageId === msg.id && r.playerId === currentPlayer.id);
                  return (
                    <div style={{ position: "relative", display: "inline-block" }}
                      onMouseEnter={e => { if (!alreadyReacted) { const b = e.currentTarget.querySelector<HTMLElement>(".react-btn"); if (b) b.style.opacity = "1"; }}}
                      onMouseLeave={e => { const b = e.currentTarget.querySelector<HTMLElement>(".react-btn"); if (b) b.style.opacity = "0"; }}
                    >
                  {isGif ? (
                    <div style={{ borderRadius: "12px", overflow: "hidden", border: "2px solid var(--border)", cursor: "pointer" }}
                      onClick={() => window.open(msg.gifUrl, "_blank")}>
                      <img src={msg.gifUrl} alt="GIF" style={{ display: "block", maxWidth: "min(240px, 65vw)", maxHeight: "200px", objectFit: "cover" }} loading="lazy" />
                    </div>
                  ) : (
                    <div style={{
                      background: isMe ? "var(--green)" : "var(--surface)",
                      color: isMe ? "white" : "var(--text)",
                      border: isMe ? "none" : "1px solid var(--border)",
                      borderRadius: isMe ? `12px 12px ${msg.isLast ? "2px" : "12px"} 12px` : `12px 12px 12px ${msg.isLast ? "2px" : "12px"}`,
                      padding: "8px 12px", fontSize: "14px", lineHeight: 1.5, wordBreak: "break-word",
                    }}>
                      {msg.content}
                    </div>
                  )}

                  {/* React button — hidden until hover, hidden if already reacted */}
                  {!alreadyReacted && (
                    <button
                      className="react-btn"
                      onClick={() => setShowEmojiFor(showEmojiFor === msg.id ? null : msg.id)}
                      style={{
                        position: "absolute",
                        [isMe ? "left" : "right"]: "-32px",
                        top: "50%", transform: "translateY(-50%)",
                        fontSize: "13px", background: "var(--surface)", border: "1px solid var(--border)",
                        borderRadius: "99px", cursor: "pointer", padding: "2px 6px", lineHeight: 1,
                        opacity: showEmojiFor === msg.id ? 1 : 0,
                        transition: "opacity 0.15s",
                        whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "2px",
                      }}
                      title="Add reaction"
                    >
                      <span>😊</span>
                      <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)" }}>+</span>
                    </button>
                  )}
                </div>
                  );
                })()}

                {/* Time + delete */}
                {msg.isLast && (
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "3px", padding: "0 4px" }}>
                    <span style={{ fontSize: "10px", color: "var(--text-3)" }}>{formatTime(msg.createdAt)}</span>
                    {canDelete && (
                      <button onClick={() => handleDelete(msg.id)} style={{ fontSize: "10px", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>delete</button>
                    )}
                    {/* Read receipts - show avatars of who has read */}
                    {(() => {
                      const readers = (readReceipts[msg.id] || []).filter(id => id !== currentPlayer.id);
                      if (!readers.length) return null;
                      return (
                        <div style={{ display: "flex", gap: "2px", marginLeft: "auto" }}>
                          {readers.slice(0, 5).map(id => {
                            const p = playerMap[id];
                            if (!p) return null;
                            return <AvatarDisplay key={id} url={p.avatarUrl} name={p.name} size={14} />;
                          })}
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* Emoji picker for this message */}
                {showEmojiFor === msg.id && (
                  <div style={{ zIndex: 100, marginTop: "4px" }}>
                    <EmojiPicker onSelect={emoji => handleReaction(msg.id, emoji)} onClose={() => setShowEmojiFor(null)} />
                  </div>
                )}

                {/* Reaction pills — show on every message */}
                {(() => {
                  const msgReactions = reactions.filter(r => r.messageId === msg.id);
                  if (!msgReactions.length) return null;
                  const grouped: Record<string, { count: number; mine: boolean; players: string[] }> = {};
                  msgReactions.forEach(r => {
                    if (!grouped[r.emoji]) grouped[r.emoji] = { count: 0, mine: false, players: [] };
                    grouped[r.emoji].count++;
                    grouped[r.emoji].players.push(r.playerId);
                    if (r.playerId === currentPlayer.id) grouped[r.emoji].mine = true;
                  });
                  return (
                    <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginTop: "4px", padding: "0 4px" }}>
                      {Object.entries(grouped).map(([emoji, { count, mine, players }]) => {
                        const names = players.map(id => playerMap[id]?.name || "Someone").join(", ");
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(msg.id, emoji)}
                            title={names}
                            style={{
                              fontSize: "12px", padding: "2px 7px", borderRadius: "99px",
                              border: `1.5px solid ${mine ? "var(--green)" : "var(--border)"}`,
                              background: mine ? "var(--green-light)" : "var(--surface)",
                              cursor: "pointer", display: "flex", alignItems: "center", gap: "3px",
                              lineHeight: 1.4,
                            }}
                          >
                            <span style={{ fontSize: "14px" }}>{emoji}</span>
                            <span style={{ fontWeight: 700, color: mine ? "var(--green)" : "var(--text-2)", fontSize: "11px" }}>{count}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })}

      </div>

      {/* GIF Picker */}
      {showGif && (
        <div style={{ flexShrink: 0, padding: "0 12px 8px" }}>
          <GifPicker onSelect={gifUrl => send("", gifUrl)} onClose={() => setShowGif(false)} />
        </div>
      )}

      {/* Poll Creator */}
      {showPoll && (
        <div style={{ flexShrink: 0, padding: "0 12px 8px" }}>
          <CreatePoll currentPlayer={currentPlayer} onCreated={handlePollCreated} onClose={() => setShowPoll(false)} leagueId={leagueId} />
        </div>
      )}

      {/* Quick reactions */}
      {!showGif && !showPoll && (
        <div style={{ display: "flex", gap: "4px", padding: "8px 12px 4px", overflowX: "auto", flexShrink: 0 }}>
          {QUICK_REACTIONS.map(emoji => (
            <button
              key={emoji}
              onClick={() => { setInput(prev => prev + emoji); inputRef.current?.focus(); }}
              style={{ fontSize: "20px", padding: "4px 8px", borderRadius: "8px", border: "1px solid var(--border)", background: "var(--surface)", cursor: "pointer", flexShrink: 0 }}
              title="Add to message"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Input row */}
      <div style={{ display: "flex", gap: "8px", padding: "8px 12px 12px", alignItems: "center", flexShrink: 0 }}>
        <AvatarDisplay url={currentPlayer.avatarUrl} name={currentPlayer.name} size={32} />
        <button onClick={() => { setShowGif(v => !v); setShowPoll(false); }} style={{ fontSize: "13px", fontWeight: 700, padding: "6px 10px", borderRadius: "8px", flexShrink: 0, border: "1px solid var(--border)", background: showGif ? "var(--green)" : "var(--surface)", color: showGif ? "white" : "var(--text-2)", cursor: "pointer" }}>
          GIF
        </button>
        <button onClick={() => { setShowPoll(v => !v); setShowGif(false); }} style={{ fontSize: "13px", fontWeight: 700, padding: "6px 10px", borderRadius: "8px", flexShrink: 0, border: "1px solid var(--border)", background: showPoll ? "var(--green)" : "var(--surface)", color: showPoll ? "white" : "var(--text-2)", cursor: "pointer" }}>
          📊
        </button>
        <input
          ref={inputRef}
          type="text"
          placeholder="Say something..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(input); } }}
          disabled={sending}
          maxLength={300}
          style={{ flex: 1, borderRadius: "20px", padding: "8px 16px" }}
        />
        <button className="btn-primary" onClick={() => send(input)} disabled={!input.trim() || sending} style={{ borderRadius: "20px", padding: "8px 16px", flexShrink: 0 }}>
          Send
        </button>
      </div>
    </div>
  );
}
