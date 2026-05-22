"use client";
import { Player, FantasySquad, PlayerStat } from "@/app/data/types";
import { calculateFantasyPoints } from "@/lib/storage";
import { SQUADS } from "@/app/data/worldcup";
import { FANTASY_POINTS } from "@/app/data/types";

interface Props {
  players: Player[];
  squads: FantasySquad[];
  stats: PlayerStat[];
  currentPlayerId: string;
}

const flag = (country: string) => SQUADS[country]?.flag || "";
const POSITION_COLORS: Record<string, string> = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#10b981", FWD: "#ef4444" };
const medals = ["🥇", "🥈", "🥉"];
const podiumColors = ["#f59e0b", "#94a3b8", "#c97c47"];

export default function FantasyLeaderboard({ players, squads, stats, currentPlayerId }: Props) {
  const ranked = players
    .map(p => {
      const squad = squads.find(s => s.playerId === p.id);
      const points = squad ? calculateFantasyPoints(squad, stats) : 0;
      return { player: p, squad, points };
    })
    .sort((a, b) => b.points - a.points);

  return (
    <div>
      {/* Scoring guide */}
      <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
        <p style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "10px" }}>Fantasy Scoring</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: "6px", fontSize: "12px" }}>
          {[
            { label: "Goal (FWD)", pts: `+${FANTASY_POINTS.GOAL_FWD}` },
            { label: "Goal (MID)", pts: `+${FANTASY_POINTS.GOAL_MID}` },
            { label: "Goal (DEF/GK)", pts: `+${FANTASY_POINTS.GOAL_DEF}` },
            { label: "Assist", pts: `+${FANTASY_POINTS.ASSIST}` },
            { label: "Clean sheet (GK/DEF)", pts: `+${FANTASY_POINTS.CLEAN_SHEET_GK_DEF}` },
            { label: "Clean sheet (MID)", pts: `+${FANTASY_POINTS.CLEAN_SHEET_MID}` },
            { label: "Per 3 saves (GK)", pts: `+${FANTASY_POINTS.SAVE_SET}` },
            { label: "60+ mins", pts: `+${FANTASY_POINTS.PLAYED_60}` },
            { label: "Yellow card", pts: `${FANTASY_POINTS.YELLOW_CARD}` },
            { label: "Red card", pts: `${FANTASY_POINTS.RED_CARD}` },
          ].map(({ label, pts }) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
              <span style={{ color: "var(--text-2)" }}>{label}</span>
              <span style={{ fontWeight: 700, color: pts.startsWith("-") ? "var(--red)" : "var(--green)" }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      {ranked.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>👕</div>
          <p style={{ fontWeight: 600 }}>No fantasy squads yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Head to the Fantasy tab to pick your squad</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {ranked.map(({ player, squad, points }, idx) => {
            const isMe = player.id === currentPlayerId;
            const isTop3 = idx < 3;
            return (
              <div key={player.id} className="card" style={{ padding: "14px 18px", borderColor: isMe ? "var(--green)" : undefined, background: isMe ? "#f0fdf4" : undefined }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Rank */}
                  <div style={{ width: "32px", textAlign: "center", flexShrink: 0 }}>
                    {isTop3 ? <span style={{ fontSize: "22px" }}>{medals[idx]}</span> : <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-3)" }}>#{idx + 1}</span>}
                  </div>
                  {/* Avatar */}
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: isTop3 ? podiumColors[idx] : "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", fontWeight: 700, color: isTop3 ? "white" : "var(--text-2)", flexShrink: 0, border: `2px solid ${isTop3 ? podiumColors[idx] : "var(--border)"}` }}>
                    {player.name.charAt(0).toUpperCase()}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px" }}>{player.name}</span>
                      {isMe && <span className="badge" style={{ background: "var(--green-light)", color: "var(--green)", fontSize: "10px" }}>YOU</span>}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-2)" }}>{player.teamName}</p>
                    {squad && (
                      <div style={{ display: "flex", gap: "4px", marginTop: "6px", flexWrap: "wrap" }}>
                        {squad.squad.map(p => (
                          <span key={p.name} style={{ fontSize: "11px", background: POSITION_COLORS[p.position] + "15", color: POSITION_COLORS[p.position], border: `1px solid ${POSITION_COLORS[p.position]}33`, borderRadius: "4px", padding: "1px 5px" }}>
                            {flag(p.country)} {p.name}
                          </span>
                        ))}
                      </div>
                    )}
                    {!squad && <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>No squad picked yet</p>}
                  </div>
                  {/* Points */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: isTop3 ? podiumColors[idx] : "var(--text)", lineHeight: 1 }}>{points}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase" }}>pts</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Top performers from stats */}
      {stats.length > 0 && (
        <div style={{ marginTop: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "12px" }}>Top Performers</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "8px" }}>
            {[
              { label: "⚽ Top Scorer", key: "goals" as keyof PlayerStat },
              { label: "🎯 Top Assists", key: "assists" as keyof PlayerStat },
            ].map(({ label, key }) => {
              const sorted = [...stats].sort((a, b) => (b[key] as number) - (a[key] as number)).slice(0, 3);
              return (
                <div key={key} className="card" style={{ padding: "14px" }}>
                  <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>{label}</p>
                  {sorted.map((s, i) => (
                    <div key={s.id} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-3)", width: "16px" }}>#{i + 1}</span>
                      <span style={{ fontSize: "13px" }}>{flag(s.country)}</span>
                      <span style={{ fontSize: "13px", flex: 1 }}>{s.playerName}</span>
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--green)" }}>{s[key] as number}</span>
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
