"use client";
import { useState } from "react";
import { AdminState } from "@/app/data/types";
import { GROUPS, generateGroupMatches, KNOCKOUT_MATCHES, TOP_PLAYERS } from "@/app/data/worldcup";
import { saveAdminState } from "@/lib/storage";

interface Props {
  adminState: AdminState;
  onUpdate: (state: AdminState) => void;
  onClose: () => void;
}

const ADMIN_PASSWORD = "worldcup2026";

export default function AdminPanel({ adminState, onUpdate, onClose }: Props) {
  const [authenticated, setAuthenticated] = useState(adminState.isAdmin);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [activeRound, setActiveRound] = useState<"group" | "r16" | "qf" | "sf" | "final">("group");
  const [localState, setLocalState] = useState<AdminState>(adminState);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      const next = { ...localState, isAdmin: true };
      setLocalState(next);
    } else {
      setPwError("Wrong password.");
    }
  };

  const updateGroupResult = (matchId: string, side: "home" | "away", value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 2);
    setLocalState((s) => ({
      ...s,
      results: {
        ...s.results,
        group: {
          ...s.results.group,
          [matchId]: {
            home: side === "home" ? v : (s.results.group[matchId]?.home ?? ""),
            away: side === "away" ? v : (s.results.group[matchId]?.away ?? ""),
          },
        },
      },
    }));
  };

  const updateKnockoutResult = (matchId: string, field: string, value: string) => {
    const isScore = field === "homeScore" || field === "awayScore";
    const v = isScore ? value.replace(/\D/g, "").slice(0, 2) : value;
    const current = localState.results.knockout[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
    setLocalState((s) => ({
      ...s,
      results: {
        ...s.results,
        knockout: {
          ...s.results.knockout,
          [matchId]: { ...current, [field]: v },
        },
      },
    }));
  };

  const save = () => {
    saveAdminState(localState);
    onUpdate(localState);
  };

  if (!authenticated) {
    return (
      <div style={{ padding: "40px 20px", maxWidth: "360px", margin: "0 auto" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "var(--gold)", marginBottom: "24px" }}>
          🔐 Admin Access
        </h2>
        <form onSubmit={login}>
          <input
            type="password"
            placeholder="Admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ marginBottom: "12px" }}
          />
          {pwError && <p style={{ color: "var(--red)", fontSize: "13px", marginBottom: "12px" }}>{pwError}</p>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button className="btn-primary" type="submit">Enter</button>
            <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
          </div>
        </form>
        <p style={{ marginTop: "16px", fontSize: "12px", color: "rgba(248,244,232,0.3)" }}>
          Default password: worldcup2026 — change in code before deploying
        </p>
      </div>
    );
  }

  const rounds = ["group", "r16", "qf", "sf", "final"] as const;
  const roundLabels: Record<string, string> = {
    group: "Groups", r16: "Last 16", qf: "Quarters", sf: "Semis", final: "Final"
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "28px", color: "var(--gold)" }}>
          ⚙️ Admin — Enter Results
        </h2>
        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn-primary" onClick={save}>Save Results</button>
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Bonus results */}
      <div className="card" style={{ padding: "20px", marginBottom: "24px" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", color: "var(--gold)", marginBottom: "14px" }}>
          Tournament Awards
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
              ⚽ Golden Boot Winner
            </label>
            <select value={localState.topScorer} onChange={(e) => setLocalState({ ...localState, topScorer: e.target.value })}>
              <option value="">-- Not decided yet --</option>
              {TOP_PLAYERS.sort().map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", marginBottom: "6px", fontSize: "12px", fontWeight: 600, letterSpacing: "0.08em", color: "var(--gold)", textTransform: "uppercase" }}>
              🎯 Top Assist Winner
            </label>
            <select value={localState.topAssist} onChange={(e) => setLocalState({ ...localState, topAssist: e.target.value })}>
              <option value="">-- Not decided yet --</option>
              {TOP_PLAYERS.sort().map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "24px", overflowX: "auto" }}>
        {rounds.map((r) => (
          <button key={r} className={`tab ${activeRound === r ? "active" : ""}`} onClick={() => setActiveRound(r)}>
            {roundLabels[r]}
          </button>
        ))}
      </div>

      {activeRound === "group" && (
        <div>
          {Object.entries(GROUPS).map(([group, teams]) => {
            const matches = generateGroupMatches(group, teams);
            return (
              <div key={group} style={{ marginBottom: "24px" }}>
                <h4 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "18px", marginBottom: "10px", color: "var(--gold)" }}>
                  Group {group}
                </h4>
                <div style={{ display: "grid", gap: "8px" }}>
                  {matches.map((m) => {
                    const res = localState.results.group[m.id];
                    return (
                      <div key={m.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ flex: 1, textAlign: "right", fontSize: "13px" }}>{m.home.flag} {m.home.team}</span>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res?.home ?? ""} onChange={(e) => updateGroupResult(m.id, "home", e.target.value)} />
                        <span style={{ color: "var(--gold)", fontFamily: "'Bebas Neue'", fontSize: "14px" }}>–</span>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res?.away ?? ""} onChange={(e) => updateGroupResult(m.id, "away", e.target.value)} />
                        <span style={{ flex: 1, fontSize: "13px" }}>{m.away.flag} {m.away.team}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeRound !== "group" && (
        <div style={{ display: "grid", gap: "10px" }}>
          {KNOCKOUT_MATCHES[activeRound].map((match) => {
            const res = localState.results.knockout[match.id] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
            return (
              <div key={match.id} className="card" style={{ padding: "12px 16px" }}>
                <p style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px" }}>
                  {match.label}
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input type="text" placeholder="Home Team" value={res.homeTeam} onChange={(e) => updateKnockoutResult(match.id, "homeTeam", e.target.value)} style={{ flex: 1, fontSize: "13px" }} />
                  <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.homeScore} onChange={(e) => updateKnockoutResult(match.id, "homeScore", e.target.value)} />
                  <span style={{ color: "var(--gold)", fontFamily: "'Bebas Neue'", fontSize: "16px" }}>–</span>
                  <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.awayScore} onChange={(e) => updateKnockoutResult(match.id, "awayScore", e.target.value)} />
                  <input type="text" placeholder="Away Team" value={res.awayTeam} onChange={(e) => updateKnockoutResult(match.id, "awayTeam", e.target.value)} style={{ flex: 1, fontSize: "13px" }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginTop: "24px", textAlign: "right" }}>
        <button className="btn-primary" onClick={save}>💾 Save All Results</button>
      </div>
    </div>
  );
}
