"use client";
import { useState } from "react";
import { Player, FantasySquad, PlayerStat, FANTASY_POINTS } from "@/app/data/types";
import { calculateFantasyPoints } from "@/lib/storage";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  players: Player[];
  squads: FantasySquad[];
  stats: PlayerStat[];
  currentPlayerId: string;
}

function FlagImg({ country, size = 16 }: { country: string; size?: number }) {
  const code = TEAM_FLAGS[country];
  if (!code) return null;
  return <img src={`https://flagcdn.com/w20/${code}.png`} alt={country} width={size} height={Math.round(size * 0.67)} style={{ borderRadius: 2, objectFit: "cover", flexShrink: 0, display: "inline-block", verticalAlign: "middle" }} />;
}

function PlayerFlagByName({ name }: { name: string }) {
  const entry = Object.entries(SQUADS).find(([, s]) => s.players.some(p => p.name === name));
  if (!entry) return null;
  return <FlagImg country={entry[0]} size={14} />;
}

const POSITION_COLORS: Record<string, string> = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#10b981", FWD: "#ef4444" };
const medals = ["🥇", "🥈", "🥉"];
const podiumColors = ["#f59e0b", "#94a3b8", "#c97c47"];

export default function FantasyLeaderboard({ players, squads, stats, currentPlayerId }: Props) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const POS_ORDER: Record<string, number> = { GK: 0, DEF: 1, MID: 2, FWD: 3 };

  // Look up position from SQUADS data if not stored on the player
  const getPosition = (name: string, storedPos?: string): string => {
    if (storedPos && POS_ORDER[storedPos] !== undefined) return storedPos;
    for (const { players: sp } of Object.values(SQUADS)) {
      const found = sp.find((p: { name: string; position: string }) => p.name === name);
      if (found) return found.position;
    }
    return "FWD";
  };

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
          <p style={{ fontWeight: 600 }}>No players in this league yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Players need to join this league to appear here</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {ranked.map(({ player, squad, points }, idx) => {
            const isMe = player.id === currentPlayerId;
            const isTop3 = idx < 3;
            return (
              <div key={player.id} className="card" style={{ padding: "14px 18px", borderColor: isMe ? "var(--green)" : undefined, background: isMe ? "#f0fdf4" : undefined, cursor: "pointer" }}
                onClick={() => setExpandedId(expandedId === player.id ? null : player.id)}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {/* Rank */}
                  <div style={{ width: "32px", textAlign: "center", flexShrink: 0 }}>
                    {isTop3 ? <span style={{ fontSize: "22px" }}>{medals[idx]}</span> : <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-3)" }}>#{idx + 1}</span>}
                  </div>
                  {/* Avatar */}
                  <AvatarDisplay url={player.avatarUrl} name={player.name} size={52} />
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontWeight: 700, fontSize: "14px" }}>{player.name}</span>
                      {isMe && <span className="badge" style={{ background: "var(--green-light)", color: "var(--green)", fontSize: "10px" }}>YOU</span>}
                    </div>
                    <p style={{ fontSize: "12px", color: "var(--text-2)" }}>{player.teamName}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "2px" }}>{squad?.squad?.length || 0}/11 players · tap for breakdown</p>
                  </div>
                  {/* Points */}
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: "26px", fontWeight: 800, color: isTop3 ? podiumColors[idx] : "var(--text)", lineHeight: 1 }}>{points}</div>
                    <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase" }}>pts</div>
                    <div style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "2px" }}>{expandedId === player.id ? "▲" : "▼"}</div>
                  </div>
                </div>

                {/* Expanded breakdown */}
                {expandedId === player.id && squad && (
                  <div style={{ marginTop: "12px", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid var(--border)", color: "var(--text-3)", fontSize: "10px" }}>
                          <th style={{ padding: "4px 6px", textAlign: "left", fontWeight: 600 }}>Player</th>
                          <th style={{ padding: "4px 4px", textAlign: "center" }}>⚽</th>
                          <th style={{ padding: "4px 4px", textAlign: "center" }}>🅰️</th>
                          <th style={{ padding: "4px 4px", textAlign: "center" }}>🟨</th>
                          <th style={{ padding: "4px 4px", textAlign: "center" }}>Mins</th>
                          <th style={{ padding: "4px 4px", textAlign: "center", fontWeight: 800, color: "var(--green)" }}>Pts</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[...squad.squad].sort((a, b) => (POS_ORDER[getPosition(a.name, a.position)] ?? 4) - (POS_ORDER[getPosition(b.name, b.position)] ?? 4)).map(fp => {
                          const pos = getPosition(fp.name, fp.position);
                          const playerStats = stats.filter(s => s.playerName === fp.name);
                          let pts = 0, goals = 0, assists = 0, yellows = 0, mins = 0;
                          for (const s of playerStats) {
                            goals += s.goals; assists += s.assists; yellows += s.yellowCards; mins += s.minutesPlayed;
                            const gPts = pos === "FWD" ? FANTASY_POINTS.GOAL_FWD : pos === "MID" ? FANTASY_POINTS.GOAL_MID : FANTASY_POINTS.GOAL_DEF;
                            pts += s.goals * gPts + s.assists * FANTASY_POINTS.ASSIST + s.yellowCards * FANTASY_POINTS.YELLOW_CARD + s.redCards * FANTASY_POINTS.RED_CARD;
                            if ((pos === "GK" || pos === "DEF") && s.cleanSheets) pts += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_GK_DEF;
                            if (pos === "MID" && s.cleanSheets) pts += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_MID;
                            if (pos === "GK" && s.saves) pts += Math.floor(s.saves / 3) * FANTASY_POINTS.SAVE_SET;
                            if (s.minutesPlayed >= 60) pts += FANTASY_POINTS.PLAYED_60;
                            else if (s.minutesPlayed > 0) pts += FANTASY_POINTS.PLAYED_SUB_60;
                          }
                          const posColor = POSITION_COLORS[pos] || "var(--text-3)";
                          return (
                            <tr key={fp.name} style={{ borderBottom: "1px solid var(--border)" }}>
                              <td style={{ padding: "5px 6px", fontWeight: 600 }}>
                                <span style={{ fontSize: "9px", fontWeight: 800, color: posColor, marginRight: 4, background: posColor + "15", padding: "1px 4px", borderRadius: 3 }}>{pos}</span>
                                <FlagImg country={fp.country} size={12} /> {fp.name}
                              </td>
                              <td style={{ padding: "5px 4px", textAlign: "center", color: goals ? "var(--green)" : "var(--text-3)" }}>{goals || "–"}</td>
                              <td style={{ padding: "5px 4px", textAlign: "center", color: assists ? "#3b82f6" : "var(--text-3)" }}>{assists || "–"}</td>
                              <td style={{ padding: "5px 4px", textAlign: "center", color: yellows ? "#f59e0b" : "var(--text-3)" }}>{yellows || "–"}</td>
                              <td style={{ padding: "5px 4px", textAlign: "center", color: "var(--text-3)" }}>{mins || "–"}</td>
                              <td style={{ padding: "5px 4px", textAlign: "center", fontWeight: 900, color: pts > 0 ? "var(--green)" : pts < 0 ? "#ef4444" : "var(--text-3)" }}>{pts > 0 ? `+${pts}` : pts || "–"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
                {expandedId === player.id && !squad && (
                  <p style={{ marginTop: "10px", fontSize: "12px", color: "var(--text-3)", borderTop: "1px solid var(--border)", paddingTop: "10px" }}>No squad selected yet</p>
                )}
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
                      <span style={{ fontSize: "13px" }}><FlagImg country={s.country} size={14} /></span>
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
