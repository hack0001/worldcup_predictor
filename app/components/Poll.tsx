"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Player } from "@/app/data/types";
import { AvatarDisplay } from "./AvatarPicker";

interface Poll {
  id: string;
  playerId: string;
  question: string;
  options: string[];
  createdAt: string;
}

interface PollVote {
  pollId: string;
  playerId: string;
  optionIndex: number;
}

interface Props {
  poll: Poll;
  currentPlayer: Player;
  allPlayers: Player[];
  onDelete?: (id: string) => void;
}

export function PollCard({ poll, currentPlayer, allPlayers, onDelete }: Props) {
  const [votes, setVotes] = useState<PollVote[]>([]);
  const [voting, setVoting] = useState(false);

  const playerMap = Object.fromEntries(allPlayers.map(p => [p.id, p]));
  const creator = playerMap[poll.playerId];
  const myVote = votes.find(v => v.playerId === currentPlayer.id);
  const totalVotes = votes.length;

  useEffect(() => {
    // Load votes
    supabase.from("poll_votes").select("*").eq("poll_id", poll.id).then(({ data }) => {
      setVotes((data || []).map(d => ({ pollId: d.poll_id, playerId: d.player_id, optionIndex: d.option_index })));
    });

    // Subscribe to new votes
    const channel = supabase.channel(`poll-${poll.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "poll_votes", filter: `poll_id=eq.${poll.id}` }, () => {
        supabase.from("poll_votes").select("*").eq("poll_id", poll.id).then(({ data }) => {
          setVotes((data || []).map(d => ({ pollId: d.poll_id, playerId: d.player_id, optionIndex: d.option_index })));
        });
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, [poll.id]);

  const vote = async (optionIndex: number) => {
    if (myVote || voting) return;
    setVoting(true);
    await supabase.from("poll_votes").insert({ poll_id: poll.id, player_id: currentPlayer.id, option_index: optionIndex });
    setVoting(false);
  };

  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }) + " " +
      d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const isOwner = poll.playerId === currentPlayer.id;

  return (
    <div className="card" style={{ padding: "14px 16px", borderLeft: "3px solid var(--green)", marginBottom: "4px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
        <span style={{ fontSize: "16px" }}>📊</span>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: "14px", lineHeight: 1.3 }}>{poll.question}</p>
          <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>
            {creator ? `${creator.name} · ` : ""}{formatTime(poll.createdAt)} · {totalVotes} vote{totalVotes !== 1 ? "s" : ""}
          </p>
        </div>
        {isOwner && onDelete && (
          <button onClick={() => onDelete(poll.id)} style={{ fontSize: "10px", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: 0 }}>delete</button>
        )}
      </div>

      {/* Options */}
      <div style={{ display: "grid", gap: "6px" }}>
        {poll.options.map((option, i) => {
          const optionVotes = votes.filter(v => v.optionIndex === i);
          const pct = totalVotes > 0 ? Math.round((optionVotes.length / totalVotes) * 100) : 0;
          const isMyVote = myVote?.optionIndex === i;
          const hasVoted = !!myVote;
          const voters = optionVotes.map(v => playerMap[v.playerId]).filter(Boolean);

          return (
            <button
              key={i}
              onClick={() => !hasVoted && vote(i)}
              disabled={hasVoted || voting}
              style={{
                position: "relative", overflow: "hidden",
                padding: "8px 12px", borderRadius: "8px", textAlign: "left",
                border: `1.5px solid ${isMyVote ? "var(--green)" : "var(--border)"}`,
                background: isMyVote ? "var(--green-light)" : "var(--surface)",
                cursor: hasVoted ? "default" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {/* Progress bar */}
              {hasVoted && (
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${pct}%`, background: isMyVote ? "var(--green)" : "var(--border)", opacity: 0.15, transition: "width 0.4s ease", borderRadius: "6px" }} />
              )}

              <div style={{ position: "relative", display: "flex", alignItems: "center", gap: "8px" }}>
                {/* Vote indicator */}
                <div style={{ width: 18, height: 18, borderRadius: "50%", border: `2px solid ${isMyVote ? "var(--green)" : "var(--border)"}`, background: isMyVote ? "var(--green)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10 }}>
                  {isMyVote && <span style={{ color: "white", fontWeight: 700 }}>✓</span>}
                </div>

                <span style={{ flex: 1, fontSize: "13px", fontWeight: isMyVote ? 700 : 500, color: "var(--text)" }}>{option}</span>

                {hasVoted && (
                  <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                    {/* Voter avatars */}
                    <div style={{ display: "flex", gap: "2px" }}>
                      {voters.slice(0, 4).map(p => (
                        <AvatarDisplay key={p.id} url={p.avatarUrl} name={p.name} size={18} />
                      ))}
                      {voters.length > 4 && <span style={{ fontSize: "10px", color: "var(--text-3)" }}>+{voters.length - 4}</span>}
                    </div>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: isMyVote ? "var(--green)" : "var(--text-2)", minWidth: "32px", textAlign: "right" }}>{pct}%</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {!myVote && (
        <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "8px", textAlign: "center" }}>Tap an option to vote · results show after you vote</p>
      )}
    </div>
  );
}

// ── Create Poll Form ──────────────────────────────────────
interface CreatePollProps {
  currentPlayer: Player;
  onCreated: (poll: Poll) => void;
  onClose: () => void;
}

export function CreatePoll({ currentPlayer, onCreated, onClose }: CreatePollProps) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const updateOption = (i: number, val: string) => {
    const next = [...options];
    next[i] = val;
    setOptions(next);
  };

  const addOption = () => {
    if (options.length < 6) setOptions([...options, ""]);
  };

  const removeOption = (i: number) => {
    if (options.length > 2) setOptions(options.filter((_, idx) => idx !== i));
  };

  const submit = async () => {
    const q = question.trim();
    const opts = options.map(o => o.trim()).filter(Boolean);
    if (!q) { setError("Please enter a question"); return; }
    if (opts.length < 2) { setError("Please enter at least 2 options"); return; }

    setSaving(true);
    const { data, error: err } = await supabase.from("polls").insert({
      player_id: currentPlayer.id,
      question: q,
      options: opts,
    }).select().single();

    if (err || !data) { setError("Failed to create poll"); setSaving(false); return; }

    onCreated({ id: data.id, playerId: data.player_id, question: data.question, options: data.options, createdAt: data.created_at });
    setSaving(false);
  };

  return (
    <div className="card" style={{ padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
        <p style={{ fontWeight: 700, fontSize: "14px" }}>📊 Create a Poll</p>
        <button onClick={onClose} style={{ fontSize: "18px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", lineHeight: 1 }}>✕</button>
      </div>

      <div style={{ display: "grid", gap: "10px" }}>
        <div>
          <label className="label">Question</label>
          <input
            placeholder="e.g. Who will win Group A?"
            value={question}
            onChange={e => setQuestion(e.target.value)}
            maxLength={120}
            autoFocus
          />
        </div>

        <div>
          <label className="label">Options</label>
          <div style={{ display: "grid", gap: "6px" }}>
            {options.map((opt, i) => (
              <div key={i} style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                <input
                  placeholder={`Option ${i + 1}`}
                  value={opt}
                  onChange={e => updateOption(i, e.target.value)}
                  maxLength={60}
                  style={{ flex: 1 }}
                  onKeyDown={e => e.key === "Enter" && addOption()}
                />
                {options.length > 2 && (
                  <button onClick={() => removeOption(i)} style={{ fontSize: "16px", background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", flexShrink: 0, lineHeight: 1 }}>✕</button>
                )}
              </div>
            ))}
          </div>
          {options.length < 6 && (
            <button onClick={addOption} className="btn-ghost" style={{ marginTop: "6px", fontSize: "12px", color: "var(--green)" }}>+ Add option</button>
          )}
        </div>

        {error && <p style={{ fontSize: "12px", color: "var(--red)" }}>{error}</p>}

        <div style={{ display: "flex", gap: "8px" }}>
          <button className="btn-primary" onClick={submit} disabled={saving} style={{ flex: 1, justifyContent: "center" }}>
            {saving ? "Creating..." : "Create Poll"}
          </button>
          <button className="btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Poll Feed ─────────────────────────────────────────────
interface PollFeedProps {
  currentPlayer: Player;
  allPlayers: Player[];
}

export function PollFeed({ currentPlayer, allPlayers }: PollFeedProps) {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    supabase.from("polls").select("*").order("created_at", { ascending: false }).limit(20).then(({ data }) => {
      setPolls((data || []).map(d => ({ id: d.id, playerId: d.player_id, question: d.question, options: d.options, createdAt: d.created_at })));
      setLoading(false);
    });

    const channel = supabase.channel("polls-feed")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "polls" }, payload => {
        const d = payload.new as Record<string, unknown>;
        setPolls(prev => [{ id: d.id as string, playerId: d.player_id as string, question: d.question as string, options: d.options as string[], createdAt: d.created_at as string }, ...prev]);
      })
      .subscribe();

    return () => { channel.unsubscribe(); };
  }, []);

  const deletePoll = async (id: string) => {
    if (!confirm("Delete this poll?")) return;
    await supabase.from("polls").delete().eq("id", id);
    setPolls(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700 }}>Polls</h2>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>Anyone can create a poll — results show after you vote</p>
        </div>
        {!creating && (
          <button className="btn-primary" onClick={() => setCreating(true)} style={{ fontSize: "13px" }}>
            + New Poll
          </button>
        )}
      </div>

      {creating && (
        <div style={{ marginBottom: "16px" }}>
          <CreatePoll
            currentPlayer={currentPlayer}
            onCreated={poll => { setCreating(false); }}
            onClose={() => setCreating(false)}
          />
        </div>
      )}

      {loading && <div style={{ padding: "40px", textAlign: "center", color: "var(--text-3)" }}>Loading polls...</div>}

      {!loading && polls.length === 0 && (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <p style={{ fontSize: "40px", marginBottom: "12px" }}>📊</p>
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>No polls yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>Create a poll for your group!</p>
          <button className="btn-primary" onClick={() => setCreating(true)}>Create First Poll</button>
        </div>
      )}

      <div style={{ display: "grid", gap: "10px" }}>
        {polls.map(poll => (
          <PollCard
            key={poll.id}
            poll={poll}
            currentPlayer={currentPlayer}
            allPlayers={allPlayers}
            onDelete={deletePoll}
          />
        ))}
      </div>
    </div>
  );
}
