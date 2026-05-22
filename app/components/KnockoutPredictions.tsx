"use client";
import { Player } from "@/app/data/types";
import { KNOCKOUT_MATCHES } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
}

const ROUND_CONFIG: Record<string, { label: string; icon: string; cols: number }> = {
  r16: { label: "Round of 16", icon: "⚔️", cols: 2 },
  qf: { label: "Quarter Finals", icon: "🔥", cols: 2 },
  sf: { label: "Semi Finals", icon: "⭐", cols: 1 },
  final: { label: "Final", icon: "🏆", cols: 1 },
};

export default function KnockoutPredictions({ player, onUpdate, readonly }: Props) {
  const updateField = async (matchId: string, field: string, value: string) => {
    if (readonly) return;
    const current = player.knockoutPredictions[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
    const isScore = field === "homeScore" || field === "awayScore";
    const v = isScore ? value.replace(/\D/g, "").slice(0, 2) : value;
    const updated = {
      ...player,
      knockoutPredictions: { ...player.knockoutPredictions, [matchId]: { ...current, [field]: v } },
    };
    onUpdate(updated);
    await savePlayer(updated);
  };

  return (
    <div>
      <div className="card" style={{ padding: "14px 18px", marginBottom: "20px", background: "#fffbeb", borderColor: "#fde68a" }}>
        <p style={{ fontSize: "13px", color: "#92400e" }}>
          <strong>Tip:</strong> Enter the teams you predict to qualify AND the score. Teams are revealed as the tournament progresses — make your best guess now!
        </p>
      </div>

      {Object.entries(KNOCKOUT_MATCHES).map(([round, matches]) => {
        const { label, icon, cols } = ROUND_CONFIG[round];
        const isFinal = round === "final";
        return (
          <div key={round} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>{icon}</span>
              <h3 style={{ fontSize: isFinal ? "18px" : "15px", fontWeight: 700 }}>{label}</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "8px" }}>
              {matches.map((match) => {
                const pred = player.knockoutPredictions[match.id] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
                const isFinalMatch = match.id === "final-2";
                return (
                  <div key={match.id} className="card" style={{ padding: "12px 14px", borderColor: isFinalMatch ? "#fbbf24" : undefined, background: isFinalMatch ? "#fffbeb" : undefined }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {match.label} <span style={{ color: "var(--text-3)", fontWeight: 400 }}>— {match.placeholder}</span>
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="text" placeholder="Home team" value={pred.homeTeam} onChange={(e) => updateField(match.id, "homeTeam", e.target.value)} disabled={readonly} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                      <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.homeScore} onChange={(e) => updateField(match.id, "homeScore", e.target.value)} disabled={readonly} style={{ fontSize: "14px" }} />
                      <span style={{ color: "var(--text-3)", fontSize: "11px", fontWeight: 600 }}>–</span>
                      <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.awayScore} onChange={(e) => updateField(match.id, "awayScore", e.target.value)} disabled={readonly} style={{ fontSize: "14px" }} />
                      <input type="text" placeholder="Away team" value={pred.awayTeam} onChange={(e) => updateField(match.id, "awayTeam", e.target.value)} disabled={readonly} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
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
