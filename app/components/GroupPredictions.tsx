"use client";
import { Player } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
}

export default function GroupPredictions({ player, onUpdate, readonly }: Props) {
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

  return (
    <div>
      <div className="card" style={{ padding: "14px 18px", marginBottom: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>Predictions filled</span>
          <span style={{ fontSize: "13px", color: "var(--text-2)" }}>{countFilled} / {totalMatches}</span>
        </div>
        <div style={{ height: "6px", background: "var(--border)", borderRadius: "99px", overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${(countFilled / totalMatches) * 100}%`, background: "var(--green)", borderRadius: "99px", transition: "width 0.3s" }} />
        </div>
      </div>

      {Object.entries(GROUPS).map(([group, teams]) => {
        const matches = GROUP_MATCHES.filter(m => m.group === group);
        const groupFilled = matches.filter(m => {
          const p = player.groupPredictions[m.id];
          return p?.home !== "" && p?.away !== "" && p?.home !== undefined;
        }).length;

        return (
          <div key={group} style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <div style={{ width: "26px", height: "26px", background: "var(--green)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 700, flexShrink: 0 }}>
                {group}
              </div>
              <span style={{ fontWeight: 700, fontSize: "14px" }}>Group {group}</span>
              <div style={{ display: "flex", gap: "8px", marginLeft: "4px", flexWrap: "wrap" }}>
                {teams.map(t => (
                  <span key={t.team} style={{ fontSize: "12px", color: "var(--text-3)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                    <Flag country={t.team} size={14} /> {t.team}
                  </span>
                ))}
              </div>
              <span className="badge" style={{ background: groupFilled === matches.length ? "#dcfce7" : "var(--bg)", color: groupFilled === matches.length ? "var(--green)" : "var(--text-3)", border: "1px solid var(--border)", marginLeft: "auto", flexShrink: 0 }}>
                {groupFilled}/{matches.length}
              </span>
            </div>

            <div style={{ display: "grid", gap: "5px" }}>
              {matches.map((match) => {
                const pred = player.groupPredictions[match.id];
                const filled = pred?.home !== "" && pred?.away !== "" && pred?.home !== undefined;
                return (
                  <div key={match.id} className="card" style={{ padding: "10px 14px", borderColor: filled ? "#bbf7d0" : undefined }}>
                    {/* Date/venue row */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 500 }}>
                        📅 {match.dateUK} · {match.timeUK}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                        🏟️ {match.stadium}, {match.city}
                      </span>
                    </div>
                    {/* Score row */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ flex: 1, textAlign: "right", fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "6px" }}>
                        <Flag country={match.home.team} /> {match.home.team}
                      </span>
                      <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred?.home ?? ""} onChange={(e) => updateScore(match.id, "home", e.target.value)} disabled={readonly} />
                        <span style={{ color: "var(--text-3)", fontSize: "11px", fontWeight: 600 }}>—</span>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred?.away ?? ""} onChange={(e) => updateScore(match.id, "away", e.target.value)} disabled={readonly} />
                      </div>
                      <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        <Flag country={match.away.team} /> {match.away.team}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
