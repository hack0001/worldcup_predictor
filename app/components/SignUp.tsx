"use client";
import { useState } from "react";
import { Player } from "@/app/data/types";
import { getPlayers, savePlayer, setCurrentUserId } from "@/lib/storage";
import { TOP_PLAYERS } from "@/app/data/worldcup";

interface Props {
  onComplete: (player: Player) => void;
  existingPlayer?: Player | null;
}

export default function SignUp({ onComplete, existingPlayer }: Props) {
  const [form, setForm] = useState({
    name: existingPlayer?.name || "",
    email: existingPlayer?.email || "",
    teamName: existingPlayer?.teamName || "",
    topScorer: existingPlayer?.topScorer || "",
    topAssist: existingPlayer?.topAssist || "",
  });
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"signup" | "login">(existingPlayer ? "signup" : "signup");
  const [loginEmail, setLoginEmail] = useState("");

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.teamName) {
      setError("Please fill in all required fields.");
      return;
    }
    const players = getPlayers();
    const emailExists = players.find(
      (p) => p.email.toLowerCase() === form.email.toLowerCase() && p.id !== existingPlayer?.id
    );
    if (emailExists) {
      setError("That email is already registered. Use the login tab instead.");
      return;
    }
    const player: Player = {
      id: existingPlayer?.id || Date.now().toString(),
      name: form.name,
      email: form.email,
      teamName: form.teamName,
      topScorer: form.topScorer,
      topAssist: form.topAssist,
      groupPredictions: existingPlayer?.groupPredictions || {},
      knockoutPredictions: existingPlayer?.knockoutPredictions || {},
      createdAt: existingPlayer?.createdAt || new Date().toISOString(),
    };
    savePlayer(player);
    setCurrentUserId(player.id);
    onComplete(player);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const players = getPlayers();
    const found = players.find((p) => p.email.toLowerCase() === loginEmail.toLowerCase());
    if (!found) {
      setError("No account found with that email. Sign up first!");
      return;
    }
    setCurrentUserId(found.id);
    onComplete(found);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
      <div style={{ width: "100%", maxWidth: "480px" }}>
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <div style={{ fontSize: "64px", marginBottom: "8px" }}>🏆</div>
          <h1 style={{ fontSize: "52px", color: "var(--gold)", lineHeight: 1, marginBottom: "8px" }}>
            World Cup 2026
          </h1>
          <p style={{ color: "rgba(248,244,232,0.6)", fontSize: "16px", fontWeight: 500 }}>
            Predict scores · Beat your mates · Glory awaits
          </p>
        </div>

        <div className="card" style={{ padding: "32px" }}>
          {!existingPlayer && (
            <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "28px" }}>
              <button
                className={`tab ${mode === "signup" ? "active" : ""}`}
                onClick={() => { setMode("signup"); setError(""); }}
              >Sign Up</button>
              <button
                className={`tab ${mode === "login" ? "active" : ""}`}
                onClick={() => { setMode("login"); setError(""); }}
              >I Already Signed Up</button>
            </div>
          )}

          {mode === "login" ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
                  Your Email
                </label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                />
              </div>
              {error && <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "16px" }}>{error}</p>}
              <button className="btn-primary" type="submit" style={{ width: "100%" }}>
                Load My Predictions
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignup}>
              <div style={{ display: "grid", gap: "20px" }}>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
                    Your Name *
                  </label>
                  <input
                    placeholder="Enter your name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
                    Team Name *
                  </label>
                  <input
                    placeholder="e.g. World Cup Winners FC"
                    value={form.teamName}
                    onChange={(e) => setForm({ ...form, teamName: e.target.value })}
                  />
                </div>

                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "20px" }}>
                  <p style={{ fontSize: "12px", color: "rgba(248,244,232,0.5)", marginBottom: "16px", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
                    Bonus Predictions (+15 / +10 pts)
                  </p>
                  <div style={{ display: "grid", gap: "16px" }}>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
                        ⚽ Golden Boot (Top Scorer)
                      </label>
                      <select
                        value={form.topScorer}
                        onChange={(e) => setForm({ ...form, topScorer: e.target.value })}
                      >
                        <option value="">-- Pick a player --</option>
                        {TOP_PLAYERS.sort().map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
                        🎯 Top Assist Provider
                      </label>
                      <select
                        value={form.topAssist}
                        onChange={(e) => setForm({ ...form, topAssist: e.target.value })}
                      >
                        <option value="">-- Pick a player --</option>
                        {TOP_PLAYERS.sort().map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {error && <p style={{ color: "var(--red)", fontSize: "13px" }}>{error}</p>}
                <button className="btn-primary" type="submit" style={{ width: "100%" }}>
                  {existingPlayer ? "Update Profile" : "Join the Game"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "rgba(248,244,232,0.3)" }}>
          Private game · {new Date().getFullYear()} World Cup Predictor
        </p>
      </div>
    </div>
  );
}
