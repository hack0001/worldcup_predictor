"use client";
import { useState } from "react";
import { Player, KnockoutPrediction } from "@/app/data/types";
import { KNOCKOUT_MATCHES, GROUPS } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
  confirmedTeams?: Record<string, { home: string; away: string }>;
}

const ROUND_TABS = [
  { id: "r32",   label: "Round of 32",    icon: "⚔️" },
  { id: "r16",   label: "Round of 16",    icon: "🔥" },
  { id: "qf",    label: "Quarter Finals", icon: "⭐" },
  { id: "sf",    label: "Semi Finals",    icon: "🌟" },
  { id: "final", label: "Final",          icon: "🏆" },
] as const;

type RoundId = typeof ROUND_TABS[number]["id"];

const EMPTY_PRED: KnockoutPrediction = {
  homeTeam: "", awayTeam: "", homeScore: "", awayScore: "",
  goesToET: false, etHomeScore: "", etAwayScore: "",
  goesToPens: false, penWinner: "",
};

export default function KnockoutPredictions({ player, onUpdate, readonly, confirmedTeams = {} }: Props) {
  const [activeRound, setActiveRound] = useState<RoundId>("r32");

  const update = async (matchId: string, patch: Partial<KnockoutPrediction>) => {
    if (readonly) return;
    const current = player.knockoutPredictions[matchId] || { ...EMPTY_PRED };
    const updated = { ...player, knockoutPredictions: { ...player.knockoutPredictions, [matchId]: { ...current, ...patch } } };
    onUpdate(updated);
    await savePlayer(updated);
  };

  const scoreInput = (matchId: string, field: "homeScore" | "awayScore" | "etHomeScore" | "etAwayScore", value: string) =>
    update(matchId, { [field]: value.replace(/\D/g, "").slice(0, 2) });

  // Count filled predictions per round
  const countFilled = (roundId: string) => {
    const matches = KNOCKOUT_MATCHES[roundId] || [];
    return matches.filter(m => {
      const pred = player.knockoutPredictions[m.id];
      const teams = confirmedTeams[m.id];
      return teams?.home && teams?.away && pred?.homeScore !== "" && pred?.homeScore !== undefined;
    }).length;
  };

  const matches = KNOCKOUT_MATCHES[activeRound] || [];

  return (
    <div>
      <div className="card" style={{ padding: "12px 16px", marginBottom: "16px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
        <p style={{ fontSize: "13px", color: "#166534" }}>
          <strong>Teams fill in automatically</strong> as each round is played. Predict the score — and whether it goes to extra time or penalties for bonus points!
        </p>
      </div>

      {/* Round tabs */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
        {ROUND_TABS.map(tab => {
          const total = (KNOCKOUT_MATCHES[tab.id] || []).length;
          const filled = countFilled(tab.id);
          const allUnlocked = (KNOCKOUT_MATCHES[tab.id] || []).every(m => confirmedTeams[m.id]?.home && confirmedTeams[m.id]?.away);
          const done = allUnlocked && filled === total;
          const isActive = activeRound === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveRound(tab.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: "1.5px solid",
                borderColor: isActive ? "var(--green)" : done ? "#bbf7d0" : "var(--border)",
                background: isActive ? "var(--green)" : done ? "#f0fdf4" : "var(--surface)",
                color: isActive ? "white" : done ? "var(--green)" : "var(--text)",
                fontWeight: 600, fontSize: "13px", cursor: "pointer",
                display: "flex", alignItems: "center", gap: "5px",
                transition: "all 0.15s",
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
              {filled > 0 && !isActive && (
                <span style={{ fontSize: "10px", background: isActive ? "rgba(255,255,255,0.3)" : "var(--green)", color: "white", padding: "1px 5px", borderRadius: "10px" }}>
                  {filled}/{total}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active round matches */}
      <div style={{ display: "grid", gridTemplateColumns: activeRound === "r32" || activeRound === "r16" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr", gap: "10px" }}>
        {matches.map(match => {
          const pred = player.knockoutPredictions[match.id] || { ...EMPTY_PRED };
          const confirmed = confirmedTeams[match.id];
          const homeTeam = confirmed?.home || "";
          const awayTeam = confirmed?.away || "";
          const hasTeams = !!(homeTeam && awayTeam);
          const isFinal = match.id === "final-104";

          return (
            <div key={match.id} className="card" style={{ padding: "14px", borderColor: isFinal ? "#fbbf24" : hasTeams ? "#bbf7d0" : undefined, background: isFinal ? "#fffbeb" : undefined, opacity: hasTeams ? 1 : 0.5 }}>
              {/* Date/venue */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK}</span>
                <span style={{ fontSize: "10px", color: "var(--text-3)" }}>🏟️ {match.stadium}</span>
              </div>
              <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                {match.label} <span style={{ color: "var(--text-3)", fontWeight: 400, textTransform: "none" }}>— {match.placeholder}</span>
              </p>

              {/* Normal time score */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: hasTeams ? "10px" : 0 }}>
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px", justifyContent: "flex-end" }}>
                  {homeTeam && <Flag country={homeTeam} size={16} />}
                  <span style={{ fontSize: "12px", fontWeight: 600, textAlign: "right" }}>
                    {homeTeam || <span style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "11px" }}>{match.placeholder.split(" vs ")[0]}</span>}
                  </span>
                </div>
                <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.homeScore} onChange={e => scoreInput(match.id, "homeScore", e.target.value)} disabled={readonly || !hasTeams} style={{ fontSize: "14px", opacity: hasTeams ? 1 : 0.4 }} />
                <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.awayScore} onChange={e => scoreInput(match.id, "awayScore", e.target.value)} disabled={readonly || !hasTeams} style={{ fontSize: "14px", opacity: hasTeams ? 1 : 0.4 }} />
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                  {awayTeam && <Flag country={awayTeam} size={16} />}
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>
                    {awayTeam || <span style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "11px" }}>{match.placeholder.split(" vs ")[1]}</span>}
                  </span>
                </div>
              </div>

              {/* ET + Pens */}
              {hasTeams && (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: readonly ? "default" : "pointer", fontSize: "12px", fontWeight: 500, marginBottom: pred.goesToET ? "8px" : 0 }}>
                    <input type="checkbox" checked={pred.goesToET} disabled={readonly}
                      onChange={e => update(match.id, { goesToET: e.target.checked, goesToPens: e.target.checked ? pred.goesToPens : false })}
                      style={{ width: 14, height: 14, accentColor: "var(--green)" }} />
                    Goes to extra time?
                    <span style={{ color: "var(--green)", fontWeight: 700, fontSize: "11px" }}>+8pts if correct</span>
                  </label>

                  {pred.goesToET && (
                    <div style={{ paddingLeft: "22px", display: "grid", gap: "8px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "5px" }}>ET score (after 120 mins)</p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-2)", minWidth: "60px", textAlign: "right" }}>{homeTeam}</span>
                          <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.etHomeScore} onChange={e => scoreInput(match.id, "etHomeScore", e.target.value)} disabled={readonly} style={{ fontSize: "13px" }} />
                          <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                          <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.etAwayScore} onChange={e => scoreInput(match.id, "etAwayScore", e.target.value)} disabled={readonly} style={{ fontSize: "13px" }} />
                          <span style={{ fontSize: "11px", color: "var(--text-2)" }}>{awayTeam}</span>
                        </div>
                      </div>

                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: readonly ? "default" : "pointer", fontSize: "12px", fontWeight: 500, marginBottom: pred.goesToPens ? "6px" : 0 }}>
                        <input type="checkbox" checked={pred.goesToPens} disabled={readonly}
                          onChange={e => update(match.id, { goesToPens: e.target.checked, penWinner: "" })}
                          style={{ width: 14, height: 14, accentColor: "var(--green)" }} />
                        Goes to penalties?
                        <span style={{ color: "var(--green)", fontWeight: 700, fontSize: "11px" }}>+10pts if correct</span>
                      </label>

                      {pred.goesToPens && (
                        <div style={{ paddingLeft: "22px" }}>
                          <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "5px" }}>Who wins on penalties?</p>
                          <select value={pred.penWinner} onChange={e => update(match.id, { penWinner: e.target.value })} disabled={readonly} style={{ fontSize: "12px", padding: "6px 8px" }}>
                            <option value="">-- Pick winner --</option>
                            {[homeTeam, awayTeam].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!hasTeams && (
                <p style={{ fontSize: "10px", color: "var(--text-3)", textAlign: "center" }}>Unlocks when previous round results are entered</p>
              )}
            </div>
          );
        })}
      </div>

      {/* Round navigation */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        {(() => {
          const idx = ROUND_TABS.findIndex(t => t.id === activeRound);
          const prev = ROUND_TABS[idx - 1];
          const next = ROUND_TABS[idx + 1];
          return (
            <>
              <button className="btn-secondary" onClick={() => prev && setActiveRound(prev.id)} disabled={!prev} style={{ fontSize: "13px", padding: "7px 14px" }}>
                {prev ? `← ${prev.icon} ${prev.label}` : ""}
              </button>
              <button className="btn-secondary" onClick={() => next && setActiveRound(next.id)} disabled={!next} style={{ fontSize: "13px", padding: "7px 14px" }}>
                {next ? `${next.icon} ${next.label} →` : ""}
              </button>
            </>
          );
        })()}
      </div>
    </div>
  );
}
