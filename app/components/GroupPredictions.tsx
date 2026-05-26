"use client";
import { useState } from "react";
import { Player } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";
import TeamFormBadge from "./TeamFormBadge";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
}

export default function GroupPredictions({ player, onUpdate, readonly }: Props) {
  const [activeGroup, setActiveGroup] = useState("A");

  const updateScore = async (matchId: string, side: "home" | "away", value: string) => {
    if (readonly) return;
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
                return (
                  <div key={match.id} className="card" style={{ padding: "10px 14px", borderColor: filled ? "#bbf7d0" : undefined }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "7px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK}</span>
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>🏟️ {match.stadium}, {match.city}</span>
                    </div>
                    {/* Inline form row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <Flag country={match.home.team} size={14} />
                        <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{match.home.team}</span>
                        <TeamFormBadge teamName={match.home.team} inline />
                      </div>
                      <span style={{ fontSize: "10px", color: "var(--text-3)" }}>vs</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", flexDirection: "row-reverse" }}>
                        <Flag country={match.away.team} size={14} />
                        <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{match.away.team}</span>
                        <TeamFormBadge teamName={match.away.team} inline />
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flex: 1, textAlign: "right", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <Flag country={match.home.team} /> {match.home.team}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred?.home ?? ""} onChange={e => updateScore(match.id, "home", e.target.value)} disabled={readonly} />
                        <span style={{ color: "var(--text-3)", fontSize: "11px" }}>—</span>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred?.away ?? ""} onChange={e => updateScore(match.id, "away", e.target.value)} disabled={readonly} />
                      </div>
                      <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Flag country={match.away.team} /> {match.away.team}
                      </span>
                    </div>
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
