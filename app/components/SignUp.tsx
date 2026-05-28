"use client";
import { useState } from "react";
import { Player } from "@/app/data/types";
import { getPlayerByEmail, savePlayer, setCurrentUserId } from "@/lib/storage";
import FlagSelect from "./FlagSelect";
import AvatarPicker from "./AvatarPicker";
import Flag from "./Flag";
import { GROUPS } from "@/app/data/worldcup";

// All qualified teams flat list
const ALL_TEAMS = Object.values(GROUPS).flat().map(t => t.team).sort();

function TeamPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ position: "relative" }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{ paddingLeft: value ? "36px" : "12px" }}
        >
          <option value="">-- Pick a team --</option>
          {ALL_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        {value && (
          <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
            <Flag country={value} size={18} />
          </div>
        )}
      </div>
    </div>
  );
}

interface Props {
  onComplete: (player: Player) => void;
  existingPlayer?: Player | null;
}

type Mode = "signup" | "login";

export default function SignUp({ onComplete, existingPlayer }: Props) {
  const [mode, setMode] = useState<Mode>("signup");
  const [form, setForm] = useState({
    name: existingPlayer?.name || "",
    email: existingPlayer?.email || "",
    teamName: existingPlayer?.teamName || "",
    topScorer: existingPlayer?.topScorer || "",
    topAssist: existingPlayer?.topAssist || "",
    avatarUrl: existingPlayer?.avatarUrl || "",
    status: existingPlayer?.status || "",
    tournamentWinner: existingPlayer?.tournamentWinner || "",
    playerOfTournament: existingPlayer?.playerOfTournament || "",
  });
  const [loginEmail, setLoginEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.teamName) { setError("Please fill in all required fields."); return; }
    setLoading(true); setError("");
    const existing = await getPlayerByEmail(form.email);
    if (existing && existing.id !== existingPlayer?.id) {
      setError("That email is already registered. Use the login tab instead.");
      setLoading(false); return;
    }
    const player: Player = {
      id: existingPlayer?.id || Date.now().toString(),
      name: form.name, email: form.email, teamName: form.teamName,
      topScorer: form.topScorer, topAssist: form.topAssist,
      avatarUrl: form.avatarUrl,
      status: form.status,
      tournamentWinner: form.tournamentWinner,
      playerOfTournament: form.playerOfTournament,
      groupPredictions: existingPlayer?.groupPredictions || {},
      knockoutPredictions: existingPlayer?.knockoutPredictions || {},
      createdAt: existingPlayer?.createdAt || new Date().toISOString(),
    };
    await savePlayer(player);
    setCurrentUserId(player.id);
    onComplete(player);
    setLoading(false);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    const found = await getPlayerByEmail(loginEmail);
    if (!found) { setError("No account found with that email. Sign up first!"); setLoading(false); return; }
    setCurrentUserId(found.id);
    onComplete(found);
    setLoading(false);
  };

  if (existingPlayer) {
    return (
      <div style={{ maxWidth: "540px" }}>
        <form onSubmit={handleSignup}>
          <div className="card" style={{ padding: "24px", display: "grid", gap: "16px" }}>
            <div>
              <label className="label">Your Name *</label>
              <input placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <label className="label">Team Name *</label>
              <input placeholder="e.g. World Cup Winners FC" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} />
            </div>
            <div>
              <label className="label">Status 😄</label>
              <input placeholder="e.g. England winning it 🏴󠁧󠁢󠁥󠁮󠁧󠁿" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} maxLength={80} />
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>Shows on the leaderboard and in chat. Keep it fun!</p>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <p className="section-title" style={{ marginBottom: "4px" }}>Bonus Predictions</p>
              <p style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "16px" }}>Golden Boot +15 · Top Assist +10 · Winner +25 · POTT +20</p>
              <div style={{ display: "grid", gap: "16px" }}>
                <FlagSelect label="⚽ Golden Boot (Top Scorer)" value={form.topScorer} onChange={(v) => setForm({ ...form, topScorer: v })} />
                <FlagSelect label="🎯 Top Assist Provider" value={form.topAssist} onChange={(v) => setForm({ ...form, topAssist: v })} />
                <TeamPicker label="🏆 Tournament Winner (+25pts)" value={form.tournamentWinner} onChange={(v) => setForm({ ...form, tournamentWinner: v })} />
                <FlagSelect label="⭐ Player of the Tournament (+20pts)" value={form.playerOfTournament} onChange={(v) => setForm({ ...form, playerOfTournament: v })} />
              </div>
            </div>
            <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
              <AvatarPicker
                playerId={existingPlayer.id}
                currentUrl={form.avatarUrl}
                playerName={form.name}
                onUpdate={(url) => setForm({ ...form, avatarUrl: url })}
              />
            </div>
            {error && <p style={{ color: "var(--red)", fontSize: "13px" }}>{error}</p>}
            <button className="btn-primary" type="submit" disabled={loading}>{loading ? "Saving..." : "Update Profile"}</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ width: "64px", height: "64px", background: "var(--green)", borderRadius: "16px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px", margin: "0 auto 16px" }}>⚽</div>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--text)", marginBottom: "6px" }}>World Cup 2026 Predictor</h1>
          <p style={{ color: "var(--text-2)", fontSize: "15px" }}>Predict scores and compete with your mates</p>
        </div>

        <div className="card" style={{ overflow: "hidden" }}>
          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid var(--border)" }}>
            <button className={`tab ${mode === "signup" ? "active" : ""}`} style={{ flex: 1, textAlign: "center" }} onClick={() => { setMode("signup"); setError(""); }}>Create Account</button>
            <button className={`tab ${mode === "login" ? "active" : ""}`} style={{ flex: 1, textAlign: "center" }} onClick={() => { setMode("login"); setError(""); }}>I Already Joined</button>
          </div>

          <div style={{ padding: "24px" }}>
            {mode === "login" ? (
              <form onSubmit={handleLogin}>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label className="label">Email Address</label>
                    <input type="email" placeholder="you@example.com" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} />
                  </div>
                  {error && <p style={{ color: "var(--red)", fontSize: "13px" }}>{error}</p>}
                  <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                    {loading ? "Loading..." : "Load My Predictions"}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignup}>
                <div style={{ display: "grid", gap: "16px" }}>
                  <div>
                    <label className="label">Your Name *</label>
                    <input placeholder="Enter your name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Email Address *</label>
                    <input type="email" placeholder="you@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Team Name *</label>
                    <input placeholder="e.g. Three Lions FC" value={form.teamName} onChange={(e) => setForm({ ...form, teamName: e.target.value })} />
                  </div>
                  <div>
                    <label className="label">Status 😄</label>
                    <input placeholder="e.g. Mbappe for the golden boot 🔥" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} maxLength={80} />
                    <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>Shows on the leaderboard. Keep it fun!</p>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <p style={{ fontWeight: 700, marginBottom: "4px" }}>Bonus Predictions</p>
                    <p style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "16px" }}>Golden Boot +15 · Top Assist +10 · Winner +25 · POTT +20</p>
                    <div style={{ display: "grid", gap: "16px" }}>
                      <FlagSelect label="⚽ Golden Boot (Top Scorer)" value={form.topScorer} onChange={(v) => setForm({ ...form, topScorer: v })} />
                      <FlagSelect label="🎯 Top Assist Provider" value={form.topAssist} onChange={(v) => setForm({ ...form, topAssist: v })} />
                      <TeamPicker label="🏆 Tournament Winner (+25pts)" value={form.tournamentWinner} onChange={(v) => setForm({ ...form, tournamentWinner: v })} />
                      <FlagSelect label="⭐ Player of the Tournament (+20pts)" value={form.playerOfTournament} onChange={(v) => setForm({ ...form, playerOfTournament: v })} />
                    </div>
                  </div>
                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: "16px" }}>
                    <AvatarPicker
                      playerId={`new-${Date.now()}`}
                      currentUrl={form.avatarUrl}
                      playerName={form.name || "You"}
                      onUpdate={(url) => setForm({ ...form, avatarUrl: url })}
                    />
                  </div>
                  {error && <p style={{ color: "var(--red)", fontSize: "13px" }}>{error}</p>}
                  <button className="btn-primary" type="submit" disabled={loading} style={{ width: "100%", justifyContent: "center" }}>
                    {loading ? "Creating account..." : "Join the Game →"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
