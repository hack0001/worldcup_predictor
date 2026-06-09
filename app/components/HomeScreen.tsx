"use client";
import { Player } from "@/app/data/types";
import { League } from "@/lib/storage";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  player: Player;
  league: League;
  onNav: (section: "predictions" | "fantasy" | "profile" | "leagueSwitch" | "admin") => void;
  adminClickCount: number;
  onAdminClick: () => void;
}

export default function HomeScreen({ player, league, onNav, adminClickCount, onAdminClick }: Props) {
  const now = new Date();
  const tournamentStart = new Date("2026-06-11T00:00:00Z");
  const daysUntil = Math.max(0, Math.ceil((tournamentStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const started = now >= tournamentStart;

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)",
        padding: "20px 16px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)" }} />
        <div style={{ position: "absolute", bottom: -30, left: -10, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", position: "relative" }}>
          <button onClick={() => onNav("profile")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
            <AvatarDisplay url={player.avatarUrl} name={player.name} size={56} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: "18px", color: "white", lineHeight: 1.2 }}>{player.name}</p>
            {player.status
              ? <p style={{ fontSize: "13px", color: "white", marginTop: "4px", background: "rgba(255,255,255,0.18)", display: "inline-block", padding: "2px 10px", borderRadius: "99px", fontStyle: "italic" }}>{player.status}</p>
              : <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "3px" }}>Tap to add a status</p>
            }
          </div>
          <button onClick={() => onNav("profile")} style={{ fontSize: "12px", color: "white", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", flexShrink: 0, fontWeight: 600 }}>
            Edit
          </button>
        </div>

        {/* Tournament title */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span style={{ fontSize: "36px" }}>🏆</span>
            <div>
              <p style={{ fontWeight: 800, fontSize: "18px", color: "white", lineHeight: 1 }}>FIFA World Cup</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "1px" }}>USA · Canada · Mexico 2026</p>
            </div>
          </div>

          {/* Countdown / live badge */}
          {started ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#ef4444", borderRadius: "99px", padding: "3px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>LIVE NOW</span>
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.12)", borderRadius: "99px", padding: "3px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize: "18px" }}>⏱</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>
                {daysUntil === 0 ? "Starts today!" : `${daysUntil} day${daysUntil !== 1 ? "s" : ""} to go`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── League pill ── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px" }}>⚽</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{league.name}</span>
          <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "6px" }}>Code: {league.code}</span>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(league.code); }} className="btn-ghost" style={{ fontSize: "11px", padding: "3px 8px" }}>Copy</button>
        <button onClick={() => onNav("leagueSwitch")} style={{ fontSize: "11px", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "3px 6px" }}>Switch ▼</button>
      </div>

      {/* ── Main nav cards ── */}
      <div style={{ flex: 1, padding: "16px" }}>
        <div style={{ display: "grid", gap: "12px" }}>

          {/* Predictions */}
          <button
            onClick={() => onNav("predictions")}
            style={{
              padding: "0", borderRadius: "14px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
              overflow: "hidden", textAlign: "left",
            }}
          >
            <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                ⚽
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "18px", color: "white" }}>Predictions</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Groups · Knockouts · Leaderboard</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>Chat · Polls · Standings</p>
              </div>
              <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)" }}>→</span>
            </div>
          </button>

          {/* Fantasy */}
          <button
            onClick={() => onNav("fantasy")}
            style={{
              padding: "0", borderRadius: "14px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              overflow: "hidden", textAlign: "left",
            }}
          >
            <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                👕
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "18px", color: "white" }}>Fantasy</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Pick your World Cup XI</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>Squad · Fantasy Leaderboard</p>
              </div>
              <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)" }}>→</span>
            </div>
          </button>

        </div>

        {/* Admin trigger */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            onClick={onAdminClick}
            style={{ fontSize: "12px", color: adminClickCount > 0 ? "var(--green)" : "var(--text-3)", background: "none", border: "1px solid var(--border)", borderRadius: "8px", cursor: "pointer", padding: "8px 16px", fontWeight: adminClickCount > 0 ? 700 : 400 }}
          >
            {adminClickCount > 0 ? `⚙️ ${5 - adminClickCount} more clicks for admin` : "⚙️ Admin"}
          </button>
        </div>
      </div>
    </div>
  );
}
