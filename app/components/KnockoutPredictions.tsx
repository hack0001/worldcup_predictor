"use client";
import { Player } from "@/app/data/types";
import { KNOCKOUT_MATCHES } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
  // Teams confirmed by admin results — auto-populated, not user-editable
  confirmedTeams?: Record<string, { home: string; away: string }>;
}

const ROUND_CONFIG: Record<string, { label: string; icon: string; cols: number }> = {
  r32:   { label: "Round of 32",    icon: "⚔️",  cols: 2 },
  r16:   { label: "Round of 16",    icon: "🔥",  cols: 2 },
  qf:    { label: "Quarter Finals", icon: "⭐",  cols: 1 },
  sf:    { label: "Semi Finals",    icon: "🌟",  cols: 1 },
  final: { label: "Final",          icon: "🏆",  cols: 1 },
};

export default function KnockoutPredictions({ player, onUpdate, readonly, confirmedTeams = {} }: Props) {
  const updateScore = async (matchId: string, side: "homeScore" | "awayScore", value: string) => {
    if (readonly) return;
    const v = value.replace(/\D/g, "").slice(0, 2);
    const current = player.knockoutPredictions[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
    const updated = { ...player, knockoutPredictions: { ...player.knockoutPredictions, [matchId]: { ...current, [side]: v } } };
    onUpdate(updated);
    await savePlayer(updated);
  };

  return (
    <div>
      <div className="card" style={{ padding: "14px 18px", marginBottom: "20px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
        <p style={{ fontSize: "13px", color: "#166534" }}>
          <strong>Teams are filled in automatically</strong> as each round progresses — just predict the scores! New matches unlock after the admin enters group stage results.
        </p>
      </div>

      {Object.entries(KNOCKOUT_MATCHES).map(([round, matches]) => {
        const { label, icon, cols } = ROUND_CONFIG[round];
        const isFinalRound = round === "final";

        return (
          <div key={round} style={{ marginBottom: "28px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
              <span style={{ fontSize: "18px" }}>{icon}</span>
              <h3 style={{ fontSize: isFinalRound ? "18px" : "15px", fontWeight: 700 }}>{label}</h3>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: "8px" }}>
              {matches.map((match) => {
                const pred = player.knockoutPredictions[match.id] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
                const confirmed = confirmedTeams[match.id];
                const homeTeam = confirmed?.home || "";
                const awayTeam = confirmed?.away || "";
                const hasTeams = !!(homeTeam && awayTeam);
                const isFinalMatch = match.id === "final-104";

                return (
                  <div key={match.id} className="card" style={{ padding: "12px 14px", borderColor: isFinalMatch ? "#fbbf24" : hasTeams ? "#bbf7d0" : undefined, background: isFinalMatch ? "#fffbeb" : undefined, opacity: hasTeams ? 1 : 0.6 }}>
                    {/* Date / venue */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                      <span style={{ fontSize: "10px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK}</span>
                      <span style={{ fontSize: "10px", color: "var(--text-3)" }}>🏟️ {match.stadium}</span>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {match.label} <span style={{ color: "var(--text-3)", fontWeight: 400, textTransform: "none" }}>— {match.placeholder}</span>
                    </p>

                    {/* Teams + score inputs */}
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {/* Home */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px", justifyContent: "flex-end" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, textAlign: "right" }}>
                          {homeTeam || <span style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "12px" }}>{match.placeholder.split(" vs ")[0]}</span>}
                        </span>
                        {homeTeam && <Flag country={homeTeam} size={18} />}
                      </div>

                      {/* Score inputs */}
                      <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
                        <input
                          className="score-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="–"
                          value={pred.homeScore}
                          onChange={(e) => updateScore(match.id, "homeScore", e.target.value)}
                          disabled={readonly || !hasTeams}
                          style={{ fontSize: "14px", opacity: hasTeams ? 1 : 0.4 }}
                        />
                        <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                        <input
                          className="score-input"
                          type="text"
                          inputMode="numeric"
                          placeholder="–"
                          value={pred.awayScore}
                          onChange={(e) => updateScore(match.id, "awayScore", e.target.value)}
                          disabled={readonly || !hasTeams}
                          style={{ fontSize: "14px", opacity: hasTeams ? 1 : 0.4 }}
                        />
                      </div>

                      {/* Away */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "6px" }}>
                        {awayTeam && <Flag country={awayTeam} size={18} />}
                        <span style={{ fontSize: "13px", fontWeight: 600 }}>
                          {awayTeam || <span style={{ color: "var(--text-3)", fontStyle: "italic", fontSize: "12px" }}>{match.placeholder.split(" vs ")[1]}</span>}
                        </span>
                      </div>
                    </div>

                    {!hasTeams && (
                      <p style={{ fontSize: "10px", color: "var(--text-3)", marginTop: "6px", textAlign: "center" }}>
                        Unlocks when previous round results are entered
                      </p>
                    )}
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
