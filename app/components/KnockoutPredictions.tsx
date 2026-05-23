"use client";
import { Player } from "@/app/data/types";
import { KNOCKOUT_MATCHES } from "@/app/data/worldcup";
import { savePlayer } from "@/lib/storage";
import Flag from "./Flag";

interface Props {
  player: Player;
  onUpdate: (player: Player) => void;
  readonly?: boolean;
  // When admin has entered results, pass winners here for auto-populated teams
  confirmedWinners?: Record<string, string>; // matchId -> team name
}

const ROUND_CONFIG: Record<string, { label: string; icon: string; cols: number }> = {
  r32: { label: "Round of 32", icon: "⚔️", cols: 2 },
  r16: { label: "Round of 16", icon: "🔥", cols: 2 },
  qf:  { label: "Quarter Finals", icon: "⭐", cols: 1 },
  sf:  { label: "Semi Finals", icon: "🌟", cols: 1 },
  final: { label: "Final", icon: "🏆", cols: 1 },
};

export default function KnockoutPredictions({ player, onUpdate, readonly, confirmedWinners = {} }: Props) {
  const updateField = async (matchId: string, field: string, value: string) => {
    if (readonly) return;
    const isScore = field === "homeScore" || field === "awayScore";
    const v = isScore ? value.replace(/\D/g, "").slice(0, 2) : value;
    const current = player.knockoutPredictions[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
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
          <strong>New for 2026:</strong> There is now a Round of 32 before the Last 16! Enter your predicted teams and scores for each match. Teams auto-fill from confirmed results as the tournament progresses.
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
                const isFinalMatch = match.id === "final-104";
                // Use confirmed winners if available
                const confirmedHome = confirmedWinners[match.id + "_home"] || "";
                const confirmedAway = confirmedWinners[match.id + "_away"] || "";
                const displayHome = confirmedHome || pred.homeTeam;
                const displayAway = confirmedAway || pred.awayTeam;

                return (
                  <div key={match.id} className="card" style={{ padding: "12px 14px", borderColor: isFinalMatch ? "#fbbf24" : undefined, background: isFinalMatch ? "#fffbeb" : undefined }}>
                    {/* Date/venue */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                      <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 500 }}>
                        📅 {match.dateUK} · {match.timeUK}
                      </span>
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>
                        🏟️ {match.stadium}
                      </span>
                    </div>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      {match.label} <span style={{ color: "var(--text-3)", fontWeight: 400 }}>— {match.placeholder}</span>
                    </p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                        {displayHome && <Flag country={displayHome} size={16} />}
                        <input
                          type="text"
                          placeholder="Home team"
                          value={displayHome}
                          onChange={(e) => updateField(match.id, "homeTeam", e.target.value)}
                          disabled={readonly || !!confirmedHome}
                          style={{ fontSize: "12px", padding: "7px 8px", background: confirmedHome ? "#f0fdf4" : undefined }}
                        />
                      </div>
                      <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.homeScore} onChange={(e) => updateField(match.id, "homeScore", e.target.value)} disabled={readonly} style={{ fontSize: "14px" }} />
                      <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                      <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={pred.awayScore} onChange={(e) => updateField(match.id, "awayScore", e.target.value)} disabled={readonly} style={{ fontSize: "14px" }} />
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                        {displayAway && <Flag country={displayAway} size={16} />}
                        <input
                          type="text"
                          placeholder="Away team"
                          value={displayAway}
                          onChange={(e) => updateField(match.id, "awayTeam", e.target.value)}
                          disabled={readonly || !!confirmedAway}
                          style={{ fontSize: "12px", padding: "7px 8px", background: confirmedAway ? "#f0fdf4" : undefined }}
                        />
                      </div>
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
