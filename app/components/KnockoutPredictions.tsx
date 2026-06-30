"use client";
import { useState, useEffect } from "react";
import { Player, KnockoutPrediction } from "@/app/data/types";
import { KNOCKOUT_MATCHES, GROUPS } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
  confirmedTeams?: Record<string, { home: string; away: string }>;
  allPlayers?: Player[];
  adminState?: { results: { knockout: Record<string, { homeScore?: string; awayScore?: string; homeTeam?: string; awayTeam?: string }> } };
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

export default function KnockoutPredictions({ player, onUpdate, readonly, confirmedTeams = {}, allPlayers = [], adminState }: Props) {
  const [activeRound, setActiveRound] = useState<RoundId>("r32");
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const isMatchLocked = (dateUK: string, timeUK: string): boolean => {
    try {
      const [day, mon] = dateUK.split(" ");
      const [hh, mm] = timeUK.replace(/ BST| GMT/, "").split(":");
      const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
      const isBST = timeUK.includes("BST");
      const kickoff = new Date(Date.UTC(2026, months[mon], Number(day), Number(hh) - (isBST ? 1 : 0), Number(mm)));
      return now >= new Date(kickoff.getTime() - 5 * 60 * 1000);
    } catch { return false; }
  };

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
          const locked = isMatchLocked(match.dateUK, match.timeUK);
          const isDisabled = readonly || !hasTeams || locked;

          return (
            <div key={match.id} className="card" style={{ padding: "14px", borderColor: locked ? "#fde68a" : isFinal ? "#fbbf24" : hasTeams ? "#bbf7d0" : undefined, background: isFinal ? "#fffbeb" : undefined, opacity: hasTeams ? 1 : 0.5 }}>
              {/* Date/venue */}
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span style={{ fontSize: "10px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK}</span>
                {locked
                  ? <span style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", background: "#fef3c7", padding: "1px 6px", borderRadius: "4px" }}>🔒 Locked</span>
                  : <span style={{ fontSize: "10px", color: "var(--text-3)" }}>🏟️ {match.stadium}</span>
                }
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
                <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.homeScore} onChange={e => scoreInput(match.id, "homeScore", e.target.value)} disabled={isDisabled} style={{ fontSize: "14px", opacity: hasTeams ? 1 : 0.4 }} />
                <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.awayScore} onChange={e => scoreInput(match.id, "awayScore", e.target.value)} disabled={isDisabled} style={{ fontSize: "14px", opacity: hasTeams ? 1 : 0.4 }} />
                <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                  {awayTeam && <Flag country={awayTeam} size={16} />}
                  <span style={{ fontSize: "12px", fontWeight: 600 }}>
                    {awayTeam || <span style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "11px" }}>{match.placeholder.split(" vs ")[1]}</span>}
                  </span>
                </div>
              </div>

              {/* ET + Pens — only relevant when FT is a draw */}
              {hasTeams && (() => {
                const ftH = parseInt(pred.homeScore), ftA = parseInt(pred.awayScore);
                const ftFilled = !isNaN(ftH) && !isNaN(ftA) && pred.homeScore !== "" && pred.awayScore !== "";
                const ftDraw = ftFilled && ftH === ftA;
                const ftWin = ftFilled && !ftDraw;

                // ET validation
                const etH = parseInt(pred.etHomeScore), etA = parseInt(pred.etAwayScore);
                const etFilled = !isNaN(etH) && !isNaN(etA) && pred.etHomeScore !== "" && pred.etAwayScore !== "";
                const etDraw = etFilled && etH === etA;

                // ET scores can't be less than FT scores
                const etHomeTooLow = etFilled && etH < ftH;
                const etAwayTooLow = etFilled && etA < ftA;
                const etInvalid = etHomeTooLow || etAwayTooLow;

                // Auto-clear ET/pens if FT is no longer a draw
                if (!ftDraw && (pred.goesToET || pred.goesToPens)) {
                  update(match.id, { goesToET: false, goesToPens: false, penWinner: "" });
                }
                // Auto-clear pens if ET is no longer a draw
                if (pred.goesToET && etFilled && !etDraw && pred.goesToPens) {
                  update(match.id, { goesToPens: false, penWinner: "" });
                }

                return (
                <div style={{ borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                  {ftWin && (
                    <p style={{ fontSize: "11px", color: "var(--green)", fontWeight: 600 }}>✓ {ftH > ftA ? homeTeam : awayTeam} win — no ET needed</p>
                  )}

                  {/* FT Draw — ET required */}
                  {ftDraw && (
                    <>
                      {!pred.goesToET && !isDisabled && (
                        <div style={{ padding: "6px 10px", borderRadius: "6px", background: "#fee2e2", border: "1px solid #fca5a5", marginBottom: "8px" }}>
                          <p style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b" }}>⚠️ Score is a draw — you must select Extra Time</p>
                        </div>
                      )}
                      <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isDisabled ? "default" : "pointer", fontSize: "12px", fontWeight: 500, marginBottom: pred.goesToET ? "8px" : 0 }}>
                        <input type="checkbox" checked={pred.goesToET} disabled={isDisabled}
                          onChange={e => update(match.id, { goesToET: e.target.checked, goesToPens: e.target.checked ? pred.goesToPens : false })}
                          style={{ width: 14, height: 14, accentColor: "var(--green)" }} />
                        Goes to extra time?
                        <span style={{ color: "var(--green)", fontWeight: 700, fontSize: "11px" }}>+8pts if correct</span>
                      </label>
                    </>
                  )}

                  {pred.goesToET && (
                    <div style={{ paddingLeft: "22px", display: "grid", gap: "8px" }}>
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "5px" }}>
                          ET score (after 120 mins) — must be ≥ FT score
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-2)", minWidth: "60px", textAlign: "right" }}>{homeTeam}</span>
                          <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.etHomeScore}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                              if (v !== "" && parseInt(v) < ftH) return; // block lower than FT
                              scoreInput(match.id, "etHomeScore", v);
                            }}
                            disabled={isDisabled}
                            style={{ fontSize: "13px", borderColor: etHomeTooLow ? "#ef4444" : undefined }} />
                          <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                          <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.etAwayScore}
                            onChange={e => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 2);
                              if (v !== "" && parseInt(v) < ftA) return; // block lower than FT
                              scoreInput(match.id, "etAwayScore", v);
                            }}
                            disabled={isDisabled}
                            style={{ fontSize: "13px", borderColor: etAwayTooLow ? "#ef4444" : undefined }} />
                          <span style={{ fontSize: "11px", color: "var(--text-2)" }}>{awayTeam}</span>
                        </div>
                        {etInvalid && <p style={{ fontSize: "10px", color: "#ef4444", marginTop: "4px" }}>ET score can't be lower than FT score</p>}
                      </div>

                      {/* ET Draw — Pens required */}
                      {etFilled && etDraw && (
                        <>
                          {!pred.goesToPens && !isDisabled && (
                            <div style={{ padding: "6px 10px", borderRadius: "6px", background: "#fee2e2", border: "1px solid #fca5a5" }}>
                              <p style={{ fontSize: "11px", fontWeight: 700, color: "#991b1b" }}>⚠️ ET is a draw — you must select Penalties</p>
                            </div>
                          )}
                          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: isDisabled ? "default" : "pointer", fontSize: "12px", fontWeight: 500, marginBottom: pred.goesToPens ? "6px" : 0 }}>
                            <input type="checkbox" checked={pred.goesToPens} disabled={isDisabled}
                              onChange={e => update(match.id, { goesToPens: e.target.checked, penWinner: "" })}
                              style={{ width: 14, height: 14, accentColor: "var(--green)" }} />
                            Goes to penalties?
                            <span style={{ color: "var(--green)", fontWeight: 700, fontSize: "11px" }}>+10pts if correct</span>
                          </label>
                        </>
                      )}

                      {etFilled && !etDraw && !etInvalid && (
                        <p style={{ fontSize: "11px", color: "var(--green)", fontWeight: 600 }}>✓ {etH > etA ? homeTeam : awayTeam} win in ET — no penalties needed</p>
                      )}

                      {pred.goesToPens && (
                        <div style={{ paddingLeft: "22px" }}>
                          {!pred.penWinner && !isDisabled && (
                            <p style={{ fontSize: "11px", color: "#991b1b", fontWeight: 700, marginBottom: "4px" }}>⚠️ Must pick a penalty winner</p>
                          )}
                          <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "5px" }}>Who wins on penalties?</p>
                          <select value={pred.penWinner} onChange={e => update(match.id, { penWinner: e.target.value })} disabled={isDisabled} style={{ fontSize: "12px", padding: "6px 8px", borderColor: !pred.penWinner ? "#f59e0b" : undefined }}>
                            <option value="">-- Pick winner --</option>
                            {[homeTeam, awayTeam].map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                );
              })()}

              {!hasTeams && (
                <p style={{ fontSize: "10px", color: "var(--text-3)", textAlign: "center" }}>Unlocks when previous round results are entered</p>
              )}

              {/* Everyone's predictions when locked */}
              {locked && allPlayers.length > 0 && (() => {
                const result = adminState?.results?.knockout?.[match.id];
                const preds = allPlayers.filter(p => {
                  const pr = p.knockoutPredictions?.[match.id];
                  return pr?.homeScore !== undefined && pr?.homeScore !== "";
                });
                if (!preds.length && !result?.homeScore) return null;
                const getOutcome = (h: string, a: string) => Number(h) > Number(a) ? "H" : Number(h) < Number(a) ? "A" : "D";
                return (
                  <div style={{ marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed var(--border)" }}>
                    {result?.homeScore && (
                      <div style={{ textAlign: "center", marginBottom: "8px", padding: "6px", background: "#fef9c3", borderRadius: "8px", border: "1px solid #fde047" }}>
                        <p style={{ fontSize: "10px", fontWeight: 700, color: "#854d0e", marginBottom: "1px", textTransform: "uppercase", letterSpacing: "0.06em" }}>Final Score</p>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#713f12" }}>{result.homeTeam}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                            <input className="score-input" value={result.homeScore || "–"} readOnly disabled style={{ background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e", fontWeight: 900, fontSize: "14px" }} />
                            <span style={{ color: "#92400e" }}>–</span>
                            <input className="score-input" value={result.awayScore || "–"} readOnly disabled style={{ background: "#fef3c7", borderColor: "#f59e0b", color: "#92400e", fontWeight: 900, fontSize: "14px" }} />
                          </div>
                          <span style={{ fontSize: "13px", fontWeight: 700, color: "#713f12" }}>{result.awayTeam}</span>
                        </div>
                      </div>
                    )}
                    {preds.length > 0 && (
                      <>
                        <p style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Predictions</p>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                          {preds.map(p => {
                            const pr = p.knockoutPredictions[match.id];
                            const isMe = p.id === player.id;
                            const correct = result?.homeScore && pr.homeScore === result.homeScore && pr.awayScore === result.awayScore;
                            const correctResult = result?.homeScore && !correct && getOutcome(pr.homeScore, pr.awayScore) === getOutcome(result.homeScore!, result.awayScore!);
                            const indicator = correct ? "✅" : result?.homeScore ? (correctResult ? "🟡" : "❌") : null;
                            const isDraw = pr.homeScore === pr.awayScore;
                            // Determine who they predicted to win via ET/pens
                            let predictedWinner: string | null = null;
                            let winnerVia: "ET" | "Pens" | null = null;
                            if (isDraw && pr.goesToET) {
                              const eh = parseInt(pr.etHomeScore), ea = parseInt(pr.etAwayScore);
                              if (!isNaN(eh) && !isNaN(ea) && eh !== ea) {
                                predictedWinner = eh > ea ? pr.homeTeam : pr.awayTeam;
                                winnerVia = "ET";
                              } else if (!isNaN(eh) && !isNaN(ea) && eh === ea && pr.goesToPens && pr.penWinner) {
                                predictedWinner = pr.penWinner;
                                winnerVia = "Pens";
                              }
                            }
                            return (
                              <div key={p.id} style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "4px 8px", borderRadius: "8px", background: correct ? "#dcfce7" : isMe ? "var(--green-light)" : "var(--surface2)", border: `1px solid ${correct ? "#22c55e" : isMe ? "var(--green)" : "var(--border)"}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                                  <AvatarDisplay url={p.avatarUrl} name={p.name} size={18} />
                                  <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? "var(--green)" : "var(--text-2)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name.split(" ")[0]}</span>
                                  <span style={{ fontSize: "11px", fontWeight: 800, flexShrink: 0 }}>{pr.homeScore}–{pr.awayScore}</span>
                                  {indicator && <span style={{ fontSize: "11px", flexShrink: 0 }}>{indicator}</span>}
                                </div>
                                {predictedWinner && (
                                  <div style={{ fontSize: "10px", color: "var(--text-3)", paddingLeft: "23px" }}>
                                    🏆 {predictedWinner} <span style={{ opacity: 0.7 }}>(via {winnerVia})</span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>
                );
              })()}
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
