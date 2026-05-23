"use client";
import { Player, AdminState } from "@/app/data/types";
import { calculatePlayerPoints } from "@/lib/storage";
import { SQUADS } from "@/app/data/worldcup";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  players: Player[];
  adminState: AdminState;
  currentPlayerId: string;
}

function getPlayerCountryFlag(playerName: string): string {
  for (const [, squad] of Object.entries(SQUADS)) {
    if (squad.players.includes(playerName)) return squad.flag;
  }
  return "";
}

export default function Leaderboard({ players, adminState, currentPlayerId }: Props) {
  const ranked = [...players]
    .map((p) => ({ player: p, points: calculatePlayerPoints(p, adminState) }))
    .sort((a, b) => b.points - a.points);

  const medals = ["🥇", "🥈", "🥉"];
  const podiumColors = ["#f59e0b", "#94a3b8", "#c97c47"];

  return (
    <div>
      {/* Scoring info strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "20px" }}>
        {[
          { label: "Exact Score", pts: "+10", color: "var(--green)" },
          { label: "Correct Result", pts: "+6", color: "var(--blue)" },
          { label: "Golden Boot", pts: "+15", color: "var(--gold)" },
          { label: "Top Assist", pts: "+10", color: "var(--gold)" },
          { label: "Tournament Winner", pts: "+25", color: "var(--purple)" },
          { label: "Player of Tournament", pts: "+20", color: "var(--purple)" },
        ].map(({ label, pts, color }) => (
          <div key={label} className="card" style={{ padding: "12px", textAlign: "center" }}>
            <div style={{ fontSize: "18px", fontWeight: 800, color }}>{pts}</div>
            <div style={{ fontSize: "11px", color: "var(--text-2)", marginTop: "2px", fontWeight: 500 }}>{label}</div>
          </div>
        ))}
      </div>

      {ranked.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>No players yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Share the link with your mates to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "8px" }}>
          {ranked.map(({ player, points }, idx) => {
            const isMe = player.id === currentPlayerId;
            const isTop3 = idx < 3;
            const scorerFlag = player.topScorer ? getPlayerCountryFlag(player.topScorer) : "";
            const assistFlag = player.topAssist ? getPlayerCountryFlag(player.topAssist) : "";
            return (
              <div key={player.id} className="card" style={{ padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px", borderColor: isMe ? "var(--green)" : undefined, background: isMe ? "#f0fdf4" : undefined }}>
                {/* Rank */}
                <div style={{ width: "32px", textAlign: "center", flexShrink: 0 }}>
                  {isTop3 ? (
                    <span style={{ fontSize: "22px" }}>{medals[idx]}</span>
                  ) : (
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-3)" }}>#{idx + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <AvatarDisplay url={player.avatarUrl} name={player.name} size={36} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: "14px" }}>{player.name}</span>
                    {isMe && <span className="badge" style={{ background: "var(--green-light)", color: "var(--green)", fontSize: "10px" }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "1px" }}>{player.teamName}</p>
                  <div style={{ display: "flex", gap: "10px", marginTop: "4px", fontSize: "11px", color: "var(--text-3)", flexWrap: "wrap" }}>
                    {player.topScorer && <span>⚽ {scorerFlag} {player.topScorer}</span>}
                    {player.topAssist && <span>🎯 {assistFlag} {player.topAssist}</span>}
                    {player.tournamentWinner && <span>🏆 {player.tournamentWinner}</span>}
                    {player.playerOfTournament && <span>⭐ {player.playerOfTournament}</span>}
                  </div>
                </div>

                {/* Points */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{ fontSize: "26px", fontWeight: 800, color: isTop3 ? podiumColors[idx] : "var(--text)", lineHeight: 1 }}>{points}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {(adminState.topScorer || adminState.topAssist || adminState.tournamentWinner || adminState.playerOfTournament) ? (
        <div className="card" style={{ padding: "16px 18px", marginTop: "20px", background: "#fffbeb", borderColor: "#fde68a" }}>
          <p style={{ fontSize: "12px", fontWeight: 700, color: "#92400e", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Tournament Awards — Confirmed</p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {adminState.topScorer && <span style={{ fontSize: "13px" }}>⚽ Golden Boot: <strong>{adminState.topScorer}</strong></span>}
            {adminState.topAssist && <span style={{ fontSize: "13px" }}>🎯 Top Assist: <strong>{adminState.topAssist}</strong></span>}
            {adminState.tournamentWinner && <span style={{ fontSize: "13px" }}>🏆 Winner: <strong>{adminState.tournamentWinner}</strong></span>}
            {adminState.playerOfTournament && <span style={{ fontSize: "13px" }}>⭐ POTT: <strong>{adminState.playerOfTournament}</strong></span>}
          </div>
        </div>
      ) : null}
    </div>
  );
}
