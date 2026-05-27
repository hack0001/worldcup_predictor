"use client";
import { useState } from "react";
import { Player, AdminState, POINTS } from "@/app/data/types";
import { calculatePlayerPoints } from "@/lib/storage";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  players: Player[];
  adminState: AdminState;
  currentPlayerId: string;
}

function PlayerFlag({ name }: { name: string }) {
  const entry = Object.entries(SQUADS).find(([, s]) => s.players.some(p => p.name === name));
  if (!entry) return null;
  const code = TEAM_FLAGS[entry[0]];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      alt={entry[0]}
      style={{ width: 14, height: 10, borderRadius: 2, objectFit: "cover", verticalAlign: "middle", flexShrink: 0 }}
    />
  );
}

function CountryFlag({ country }: { country: string }) {
  const code = TEAM_FLAGS[country];
  if (!code) return null;
  return (
    <img
      src={`https://flagcdn.com/w20/${code}.png`}
      alt={country}
      style={{ width: 16, height: 11, borderRadius: 2, objectFit: "cover", verticalAlign: "middle", flexShrink: 0 }}
    />
  );
}

const SCORING_GUIDE = [
  { section: "Group Stage", rows: [
    { label: "Correct result", pts: POINTS.GROUP_CORRECT_RESULT },
    { label: "Correct score", pts: POINTS.GROUP_CORRECT_SCORE },
    { label: "Correct group winner", pts: POINTS.GROUP_CORRECT_WINNER },
    { label: "Correct runner-up", pts: POINTS.GROUP_CORRECT_RUNNER_UP },
    { label: "Correct 3rd place", pts: POINTS.GROUP_CORRECT_THIRD },
  ]},
  { section: "Round of 32 & Last 16", rows: [
    { label: "Correct result", pts: POINTS.EARLY_KO_CORRECT_RESULT },
    { label: "Correct score", pts: POINTS.EARLY_KO_CORRECT_SCORE },
    { label: "Correct qualifier", pts: POINTS.EARLY_KO_CORRECT_QUALIFIER },
  ]},
  { section: "Quarter Finals, Semis & Final", rows: [
    { label: "Correct result", pts: POINTS.LATE_KO_CORRECT_RESULT },
    { label: "Correct score", pts: POINTS.LATE_KO_CORRECT_SCORE },
    { label: "Correct quarter-finalist", pts: POINTS.CORRECT_QUARTER_FINALIST },
    { label: "Correct semi-finalist", pts: POINTS.CORRECT_SEMI_FINALIST },
    { label: "Correct finalist", pts: POINTS.CORRECT_FINALIST },
    { label: "Correct winner 🏆", pts: POINTS.CORRECT_WINNER },
  ]},
  { section: "Extra Time & Penalties", rows: [
    { label: "Predicts extra time", pts: POINTS.PREDICTS_ET },
    { label: "Correct ET score", pts: POINTS.CORRECT_ET_SCORE },
    { label: "Predicts penalties", pts: POINTS.PREDICTS_PENS },
    { label: "Correct penalty winner", pts: POINTS.CORRECT_PEN_WINNER },
  ]},
  { section: "Tournament Awards", rows: [
    { label: "Golden Boot", pts: POINTS.GOLDEN_BOOT },
    { label: "Top Assist", pts: POINTS.TOP_ASSIST },
    { label: "Player of Tournament", pts: POINTS.PLAYER_OF_TOURNAMENT },
    { label: "Tournament Winner", pts: POINTS.TOURNAMENT_WINNER },
  ]},
];

export default function Leaderboard({ players, adminState, currentPlayerId }: Props) {
  const [showScoring, setShowScoring] = useState(false);

  const ranked = [...players]
    .map(p => { const r = calculatePlayerPoints(p, adminState); return { player: p, points: r.total, breakdown: r.breakdown }; })
    .sort((a, b) => b.points - a.points);

  const medals = ["🥇", "🥈", "🥉"];
  const podiumColors = ["#f59e0b", "#94a3b8", "#c97c47"];

  return (
    <div>
      {/* Scoring guide toggle */}
      <div style={{ marginBottom: "16px" }}>
        <button
          className="btn-secondary"
          onClick={() => setShowScoring(!showScoring)}
          style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "6px" }}
        >
          📋 {showScoring ? "Hide" : "Show"} Scoring Guide
        </button>
      </div>

      {showScoring && (
        <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, marginBottom: "16px" }}>Scoring Guide</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
            {SCORING_GUIDE.map(({ section, rows }) => (
              <div key={section}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>{section}</p>
                <div style={{ display: "grid", gap: "4px" }}>
                  {rows.map(({ label, pts }) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: "1px solid var(--border)" }}>
                      <span style={{ fontSize: "12px", color: "var(--text-2)" }}>{label}</span>
                      <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--green)", minWidth: "32px", textAlign: "right" }}>+{pts}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {ranked.length === 0 ? (
        <div className="card" style={{ padding: "48px", textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>👥</div>
          <p style={{ fontWeight: 600, marginBottom: "4px" }}>No players yet</p>
          <p style={{ fontSize: "13px", color: "var(--text-2)" }}>Share the link with your mates to get started</p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "10px" }}>
          {ranked.map(({ player, points, breakdown }, idx) => {
            const isMe = player.id === currentPlayerId;
            const isTop3 = idx < 3;
            return (
              <div
                key={player.id}
                className="card"
                style={{
                  padding: "16px 18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  borderColor: isMe ? "var(--green)" : isTop3 ? podiumColors[idx] + "44" : undefined,
                  background: isMe ? "#f0fdf4" : undefined,
                }}
              >
                {/* Rank */}
                <div style={{ width: "36px", textAlign: "center", flexShrink: 0 }}>
                  {isTop3
                    ? <span style={{ fontSize: "28px" }}>{medals[idx]}</span>
                    : <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-3)" }}>#{idx + 1}</span>
                  }
                </div>

                {/* Avatar — bigger! */}
                <AvatarDisplay url={player.avatarUrl} name={player.name} size={56} />

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flexWrap: "wrap", marginBottom: "2px" }}>
                    <span style={{ fontWeight: 800, fontSize: "16px" }}>{player.name}</span>
                    {isMe && <span className="badge" style={{ background: "var(--green-light)", color: "var(--green)", fontSize: "10px" }}>YOU</span>}
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "6px" }}>{player.teamName}</p>

                  {/* Predictions */}
                  <div style={{ display: "flex", gap: "10px", fontSize: "11px", color: "var(--text-3)", flexWrap: "wrap" }}>
                    {player.topScorer && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        ⚽ <PlayerFlag name={player.topScorer} /> {player.topScorer}
                      </span>
                    )}
                    {player.topAssist && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        🎯 <PlayerFlag name={player.topAssist} /> {player.topAssist}
                      </span>
                    )}
                    {player.tournamentWinner && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        🏆 <CountryFlag country={player.tournamentWinner} /> {player.tournamentWinner}
                      </span>
                    )}
                    {player.playerOfTournament && (
                      <span style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                        ⭐ <PlayerFlag name={player.playerOfTournament} /> {player.playerOfTournament}
                      </span>
                    )}
                  </div>

                  {/* Points breakdown */}
                  {Object.keys(breakdown).length > 0 && (
                    <div style={{ marginTop: "6px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {Object.entries(breakdown).map(([key, pts]) => (
                        <span key={key} style={{ fontSize: "10px", background: "var(--green-light)", color: "var(--green)", padding: "1px 6px", borderRadius: "10px", fontWeight: 600 }}>
                          +{pts} {key}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Points */}
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <div style={{
                    fontSize: "36px",
                    fontWeight: 900,
                    color: isTop3 ? podiumColors[idx] : "var(--text)",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                  }}>{points}</div>
                  <div style={{ fontSize: "10px", color: "var(--text-3)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>pts</div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmed awards */}
      {(adminState.topScorer || adminState.topAssist || adminState.tournamentWinner || adminState.playerOfTournament) && (
        <div className="card" style={{ padding: "16px 18px", marginTop: "20px", background: "#fffbeb", borderColor: "#fde68a" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, color: "#92400e", marginBottom: "10px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
            🏅 Tournament Awards — Confirmed
          </p>
          <div style={{ display: "flex", gap: "20px", flexWrap: "wrap" }}>
            {adminState.topScorer && (
              <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                ⚽ Golden Boot: <PlayerFlag name={adminState.topScorer} /> <strong>{adminState.topScorer}</strong>
              </span>
            )}
            {adminState.topAssist && (
              <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                🎯 Top Assist: <PlayerFlag name={adminState.topAssist} /> <strong>{adminState.topAssist}</strong>
              </span>
            )}
            {adminState.tournamentWinner && (
              <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                🏆 Winner: <CountryFlag country={adminState.tournamentWinner} /> <strong>{adminState.tournamentWinner}</strong>
              </span>
            )}
            {adminState.playerOfTournament && (
              <span style={{ fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
                ⭐ POTT: <PlayerFlag name={adminState.playerOfTournament} /> <strong>{adminState.playerOfTournament}</strong>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
