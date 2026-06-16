"use client";
import { useState, useEffect } from "react";
import { Player } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";
import { AvatarDisplay } from "./AvatarPicker";
import { getAllTeamForms, TeamForm } from "@/lib/footballApi";

const RESULT_COLORS: Record<string, string> = { W: "#16a34a", D: "#ca8a04", L: "#dc2626" };

function InlineForm({ form }: { form?: TeamForm }) {
  if (!form?.last5?.length) return <span style={{ fontSize: "9px", color: "var(--text-3)" }}>–</span>;
  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {form.last5.map((m, i) => (
        <span key={i} title={`${m.result} ${m.goalsFor}–${m.goalsAgainst} vs ${m.opponent}`} style={{ width: 14, height: 14, borderRadius: "2px", background: RESULT_COLORS[m.result] || "#999", color: "white", fontSize: 7, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {m.result}
        </span>
      ))}
    </div>
  );
}

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
  allPlayers?: Player[];
  adminState?: { results: { group: Record<string, { home: string; away: string }> } };
}

export default function GroupPredictions({ player, onUpdate, readonly, allPlayers = [], adminState }: Props) {
  const [activeGroup, setActiveGroup] = useState("A");
  const [forms, setForms] = useState<Record<string, TeamForm>>({});
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    getAllTeamForms().then(setForms);
    // Update clock every minute so locks apply in real time
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Parse "11 Jun" + "20:00 BST" into a Date — lock 5 mins before kickoff
  const isMatchLocked = (dateUK: string, timeUK: string): boolean => {
    try {
      const [day, mon] = dateUK.split(" ");
      const [hh, mm] = timeUK.replace(/ BST| GMT/, "").split(":");
      const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
      // BST = UTC+1, so subtract 1 hour to get UTC
      const isBST = timeUK.includes("BST");
      const kickoff = new Date(Date.UTC(2026, months[mon], Number(day), Number(hh) - (isBST ? 1 : 0), Number(mm)));
      // Lock 5 minutes before kickoff
      return now >= new Date(kickoff.getTime() - 5 * 60 * 1000);
    } catch { return false; }
  };

  const updateScore = async (matchId: string, side: "home" | "away", value: string, dateUK: string, timeUK: string) => {
    if (readonly || isMatchLocked(dateUK, timeUK)) return;
    const v = value.replace(/\D/g, "").slice(0, 2);
    const updated = {
      ...player,
      groupPredictions: {
        ...player.groupPredictions,
        [matchId]: {
          home: side === "home" ? v : (player.groupPredictions[matchId]?.home ?? ""),
          away: side === "away" ? v : (player.groupPredictions[matchId]?.away ?? ""),
        },
      },
    };
    onUpdate(updated);
    await savePlayer(updated);
  };

  const totalMatches = GROUP_MATCHES.length;
  const countFilled = GROUP_MATCHES.filter(m => {
    const p = player.groupPredictions[m.id];
    return p?.home !== "" && p?.away !== "" && p?.home !== undefined;
  }).length;

  const groupKeys = Object.keys(GROUPS);

  return (
    <div>
      {/* Progress */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Predictions filled</span>
          <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{countFilled} / {totalMatches}</span>
        </div>
        <div style={{ height: "5px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(countFilled / totalMatches) * 100}%`, background: "var(--green)", borderRadius: "99px", transition: "width 0.3s" }} />
        </div>
      </div>

      {/* Group tabs */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
        {groupKeys.map(g => {
          const gMatches = GROUP_MATCHES.filter(m => m.group === g);
          const filled = gMatches.filter(m => {
            const p = player.groupPredictions[m.id];
            return p?.home !== "" && p?.away !== "" && p?.home !== undefined;
          }).length;
          const done = filled === gMatches.length;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              style={{
                width: "40px", height: "40px", borderRadius: "8px",
                border: "1.5px solid",
                borderColor: activeGroup === g ? "var(--green)" : done ? "#bbf7d0" : "var(--border)",
                background: activeGroup === g ? "var(--green)" : done ? "#f0fdf4" : "var(--surface)",
                color: activeGroup === g ? "white" : done ? "var(--green)" : "var(--text)",
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
                position: "relative",
              }}
            >
              {g}
              {done && activeGroup !== g && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 12, height: 12, borderRadius: "50%", background: "var(--green)", fontSize: 8, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>✓</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active group */}
      {(() => {
        const teams = GROUPS[activeGroup];
        const matches = GROUP_MATCHES.filter(m => m.group === activeGroup);
        return (
          <div>
            {/* Group header */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <div style={{ width: "28px", height: "28px", background: "var(--green)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 700 }}>
                {activeGroup}
              </div>
              <span style={{ fontWeight: 700, fontSize: "15px" }}>Group {activeGroup}</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {teams.map(t => (
                  <span key={t.team} style={{ fontSize: "12px", color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Flag country={t.team} size={14} /> {t.team}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gap: "6px" }}>
              {matches.map(match => {
                const pred = player.groupPredictions[match.id];
                const filled = pred?.home !== "" && pred?.away !== "" && pred?.home !== undefined;
                const locked = isMatchLocked(match.dateUK, match.timeUK);
                const result = adminState?.results?.group?.[match.id];
                return (
                  <div key={match.id} className="card" style={{ padding: "10px 14px", borderColor: locked ? "#fde68a" : filled ? "#bbf7d0" : undefined, opacity: locked ? 0.85 : 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK}</span>
                      {locked
                        ? <span style={{ fontSize: "10px", fontWeight: 700, color: "#92400e", background: "#fef3c7", padding: "1px 6px", borderRadius: "4px" }}>🔒 Locked</span>
                        : <span style={{ fontSize: "11px", color: "var(--text-3)" }}>🏟️ {match.stadium}, {match.city}</span>
                      }
                    </div>
                    {/* Inline form row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <Flag country={match.home.team} size={13} />
                        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>{match.home.team}</span>
                        <InlineForm form={forms[match.home.team]} />
                      </div>
                      <span style={{ fontSize: "10px", color: "var(--text-3)" }}>vs</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexDirection: "row-reverse" }}>
                        <Flag country={match.away.team} size={13} />
                        <span style={{ fontSize: "10px", color: "var(--text-3)" }}>{match.away.team}</span>
                        <InlineForm form={forms[match.away.team]} />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flex: 1, textAlign: "right", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <Flag country={match.home.team} /> {match.home.team}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0, flexDirection: "column", minWidth: "60px" }}>
                        {locked && result ? (
                          <div style={{ textAlign: "center" }}>
                            <p style={{ fontSize: "9px", fontWeight: 700, color: "#92400e", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "1px" }}>Final Score</p>
                            <p style={{ fontSize: "20px", fontWeight: 900, color: "#713f12", lineHeight: 1 }}>{result.home}–{result.away}</p>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred?.home ?? ""} onChange={e => updateScore(match.id, "home", e.target.value, match.dateUK, match.timeUK)} disabled={readonly || locked} />
                            <span style={{ color: "var(--text-3)", fontSize: "11px" }}>—</span>
                            <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred?.away ?? ""} onChange={e => updateScore(match.id, "away", e.target.value, match.dateUK, match.timeUK)} disabled={readonly || locked} />
                          </div>
                        )}
                      </div>
                      <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Flag country={match.away.team} /> {match.away.team}
                      </span>
                    </div>
                    {/* Everyone's predictions below match row - mobile friendly */}
                    {locked && allPlayers.length > 0 && (() => {
                      const preds = allPlayers.filter(p => {
                        const pr = p.groupPredictions?.[match.id];
                        return pr?.home !== undefined && pr?.away !== undefined;
                      });
                      if (!preds.length && !result) return null;
                      return (
                        <div style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px dashed var(--border)" }}>

                          {preds.length > 0 && (
                            <>
                              <p style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Predictions</p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px" }}>
                                {preds.map(p => {
                                  const pr = p.groupPredictions[match.id];
                                  const isMe = p.id === player.id;
                                  const correct = result && pr.home === result.home && pr.away === result.away;
                                  const getOutcome = (h: string, a: string) => Number(h) > Number(a) ? "H" : Number(h) < Number(a) ? "A" : "D";
                                  const correctResult = result && !correct && getOutcome(pr.home, pr.away) === getOutcome(result.home, result.away);
                                  const indicator = correct ? "✅" : result ? (correctResult ? "🟡" : "❌") : null;
                                  return (
                                    <div key={p.id} style={{ display: "flex", alignItems: "center", gap: "6px", padding: "4px 8px", borderRadius: "8px", background: correct ? "#dcfce7" : isMe ? "var(--green-light)" : "var(--surface2)", border: `1px solid ${correct ? "#22c55e" : isMe ? "var(--green)" : "var(--border)"}` }}>
                                      <AvatarDisplay url={p.avatarUrl} name={p.name} size={20} />
                                      <span style={{ fontSize: "11px", fontWeight: 600, color: isMe ? "var(--green)" : "var(--text-2)", minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{p.name.split(" ")[0]}</span>
                                      <span style={{ fontSize: "12px", fontWeight: 800, color: correct ? "#166534" : isMe ? "var(--green)" : "var(--text)", flexShrink: 0 }}>{pr.home}–{pr.away}</span>
                                      {indicator && <span style={{ fontSize: "12px", flexShrink: 0 }}>{indicator}</span>}
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

            {/* Group nav */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
              <button
                className="btn-secondary"
                onClick={() => setActiveGroup(groupKeys[groupKeys.indexOf(activeGroup) - 1])}
                disabled={activeGroup === groupKeys[0]}
                style={{ fontSize: "13px", padding: "7px 14px" }}
              >
                ← Group {groupKeys[groupKeys.indexOf(activeGroup) - 1]}
              </button>
              <button
                className="btn-secondary"
                onClick={() => setActiveGroup(groupKeys[groupKeys.indexOf(activeGroup) + 1])}
                disabled={activeGroup === groupKeys[groupKeys.length - 1]}
                style={{ fontSize: "13px", padding: "7px 14px" }}
              >
                Group {groupKeys[groupKeys.indexOf(activeGroup) + 1]} →
              </button>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
