"use client";
import { Player } from "@/app/data/types";
import { KNOCKOUT_MATCHES } from "@/app/data/worldcup";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
}

const ROUND_LABELS: Record<string, { label: string; icon: string }> = {
  r16: { label: "Round of 16", icon: "⚔️" },
  qf: { label: "Quarter Finals", icon: "🔥" },
  sf: { label: "Semi Finals", icon: "⭐" },
  final: { label: "Final", icon: "🏆" },
};

export default function KnockoutPredictions({ player, onUpdate, readonly }: Props) {
  const updateField = (matchId: string, field: string, value: string) => {
    if (readonly) return;
    const current = player.knockoutPredictions[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
    const isScore = field === "homeScore" || field === "awayScore";
    const v = isScore ? value.replace(/\D/g, "").slice(0, 2) : value;
    const updated = {
      ...player,
      knockoutPredictions: {
        ...player.knockoutPredictions,
        [matchId]: { ...current, [field]: v },
      },
    };
    onUpdate(updated);
  };

  return (
    <div>
      <div className="card" style={{ padding: "16px 20px", marginBottom: "24px", borderColor: "rgba(245,197,24,0.4)" }}>
        <p style={{ fontSize: "13px", color: "rgba(248,244,232,0.6)", lineHeight: 1.5 }}>
          For knockout matches, enter the teams you predict to play AND the score. 
          Teams qualify as the tournament progresses — make your best guesses now!
        </p>
      </div>

      {Object.entries(KNOCKOUT_MATCHES).map(([round, matches]) => {
        const { label, icon } = ROUND_LABELS[round];
        const isFinal = round === "final";
        return (
          <div key={round} style={{ marginBottom: "32px" }}>
            <h3 style={{
              fontFamily: "'Bebas Neue', sans-serif",
              fontSize: isFinal ? "28px" : "22px",
              color: isFinal ? "var(--gold)" : "var(--cream)",
              marginBottom: "12px",
              letterSpacing: "0.05em",
            }}>
              {icon} {label}
            </h3>

            <div style={{ display: "grid", gap: "10px", gridTemplateColumns: round === "r16" ? "repeat(auto-fill, minmax(300px, 1fr))" : "1fr" }}>
              {matches.map((match) => {
                const pred = player.knockoutPredictions[match.id] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
                const isFinalMatch = match.id === "final-2";
                return (
                  <div
                    key={match.id}
                    className="card"
                    style={{
                      padding: "14px 16px",
                      borderColor: isFinalMatch ? "var(--gold)" : undefined,
                      background: isFinalMatch ? "rgba(245,197,24,0.05)" : undefined,
                    }}
                  >
                    <p style={{ fontSize: "11px", color: "var(--gold)", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px" }}>
                      {match.label} <span style={{ color: "rgba(248,244,232,0.3)" }}>— {match.placeholder}</span>
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <input
                        type="text"
                        placeholder="Home Team"
                        value={pred.homeTeam}
                        onChange={(e) => updateField(match.id, "homeTeam", e.target.value)}
                        disabled={readonly}
                        style={{ flex: 1, fontSize: "13px" }}
                      />
                      <input
                        className="score-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="–"
                        value={pred.homeScore}
                        onChange={(e) => updateField(match.id, "homeScore", e.target.value)}
                        disabled={readonly}
                      />
                      <span style={{ color: "var(--gold)", fontFamily: "'Bebas Neue'", fontSize: "16px", flexShrink: 0 }}>vs</span>
                      <input
                        className="score-input"
                        type="text"
                        inputMode="numeric"
                        placeholder="–"
                        value={pred.awayScore}
                        onChange={(e) => updateField(match.id, "awayScore", e.target.value)}
                        disabled={readonly}
                      />
                      <input
                        type="text"
                        placeholder="Away Team"
                        value={pred.awayTeam}
                        onChange={(e) => updateField(match.id, "awayTeam", e.target.value)}
                        disabled={readonly}
                        style={{ flex: 1, fontSize: "13px" }}
                      />
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
