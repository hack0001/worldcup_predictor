"use client";
import { Player } from "@/app/data/types";
import { AdminState } from "@/app/data/types";
import { calculatePlayerPoints } from "@/lib/storage";

interface Props {
  players: Player[];
  adminState: AdminState;
  currentPlayerId: string;
}

export default function Leaderboard({ players, adminState, currentPlayerId }: Props) {
  const ranked = [...players]
    .map((p) => ({ player: p, points: calculatePlayerPoints(p, adminState) }))
    .sort((a, b) => b.points - a.points);

  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div>
      <div className="card" style={{ padding: "16px 20px", marginBottom: "24px", borderColor: "rgba(245,197,24,0.4)" }}>
        <p style={{ fontSize: "13px", color: "rgba(248,244,232,0.6)", lineHeight: 1.5 }}>
          Points are awarded once the admin enters actual results. <strong style={{ color: "var(--gold)" }}>Exact score = 10pts</strong>, <strong style={{ color: "var(--cream)" }}>Correct result = 6pts</strong>, Golden Boot = +15pts, Top Assist = +10pts.
        </p>
      </div>

      {ranked.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(248,244,232,0.3)" }}>
          <p style={{ fontSize: "48px", marginBottom: "12px" }}>👥</p>
          <p>No players have joined yet. Share the link!</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {ranked.map(({ player, points }, idx) => {
            const isMe = player.id === currentPlayerId;
            return (
              <div
                key={player.id}
                className="card"
                style={{
                  padding: "16px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  borderColor: isMe ? "var(--gold)" : undefined,
                  background: isMe ? "rgba(245,197,24,0.05)" : undefined,
                  transform: idx === 0 ? "scale(1.01)" : undefined,
                }}
              >
                <div style={{
                  fontSize: idx < 3 ? "28px" : "18px",
                  width: "40px",
                  textAlign: "center",
                  fontFamily: "'Bebas Neue', sans-serif",
                  color: "rgba(248,244,232,0.3)",
                }}>
                  {idx < 3 ? medals[idx] : `#${idx + 1}`}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontWeight: 700, fontSize: "15px" }}>{player.name}</span>
                    {isMe && (
                      <span style={{
                        background: "var(--gold)",
                        color: "var(--dark)",
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "2px 6px",
                        borderRadius: "2px",
                        letterSpacing: "0.05em",
                      }}>YOU</span>
                    )}
                  </div>
                  <p style={{ fontSize: "13px", color: "rgba(248,244,232,0.5)" }}>{player.teamName}</p>
                  <div style={{ display: "flex", gap: "12px", marginTop: "4px", fontSize: "11px", color: "rgba(248,244,232,0.4)" }}>
                    {player.topScorer && <span>⚽ {player.topScorer}</span>}
                    {player.topAssist && <span>🎯 {player.topAssist}</span>}
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <div style={{
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "32px",
                    color: idx === 0 ? "var(--gold)" : "var(--cream)",
                    lineHeight: 1,
                  }}>
                    {points}
                  </div>
                  <div style={{ fontSize: "11px", color: "rgba(248,244,232,0.4)", letterSpacing: "0.05em" }}>PTS</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Scoring guide */}
      <div style={{ marginTop: "32px" }}>
        <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", marginBottom: "12px", color: "rgba(248,244,232,0.6)" }}>
          Scoring Guide
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "8px" }}>
          {[
            { label: "Exact Score", pts: "+10", color: "var(--gold)" },
            { label: "Correct Result", pts: "+6", color: "#7ec8a4" },
            { label: "Golden Boot", pts: "+15", color: "#e8a838" },
            { label: "Top Assist", pts: "+10", color: "#e8a838" },
          ].map(({ label, pts, color }) => (
            <div key={label} className="card" style={{ padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: "13px" }}>{label}</span>
              <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "22px", color }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
