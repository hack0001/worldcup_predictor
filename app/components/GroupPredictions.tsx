"use client";
import { Player } from "@/app/data/types";
import { GROUPS, generateGroupMatches } from "@/app/data/worldcup";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
}

export default function GroupPredictions({ player, onUpdate, readonly }: Props) {
  const updateScore = (matchId: string, side: "home" | "away", value: string) => {
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
  };

  return (
    <div>
      {Object.entries(GROUPS).map(([group, teams]) => {
        const matches = generateGroupMatches(group, teams);
        return (
          <div key={group} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px" }}>
              <div style={{
                background: "var(--gold)",
                color: "var(--dark)",
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: "20px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                {group}
              </div>
              <div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "20px", letterSpacing: "0.05em" }}>
                  Group {group}
                </h3>
                <p style={{ fontSize: "12px", color: "rgba(248,244,232,0.4)" }}>
                  {teams.map((t) => `${t.flag} ${t.team}`).join(" · ")}
                </p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "8px" }}>
              {matches.map((match) => {
                const pred = player.groupPredictions[match.id];
                return (
                  <div
                    key={match.id}
                    className="card"
                    style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: "12px" }}
                  >
                    <span style={{ flex: 1, textAlign: "right", fontSize: "14px", fontWeight: 600 }}>
                      {match.home.flag} {match.home.team}
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                      <input
                        className="score-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="–"
                        value={pred?.home ?? ""}
                        onChange={(e) => updateScore(match.id, "home", e.target.value)}
                        disabled={readonly}
                      />
                      <span style={{ color: "var(--gold)", fontFamily: "'Bebas Neue'", fontSize: "18px" }}>vs</span>
                      <input
                        className="score-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="–"
                        value={pred?.away ?? ""}
                        onChange={(e) => updateScore(match.id, "away", e.target.value)}
                        disabled={readonly}
                      />
                    </div>
                    <span style={{ flex: 1, fontSize: "14px", fontWeight: 600 }}>
                      {match.away.flag} {match.away.team}
                    </span>
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
