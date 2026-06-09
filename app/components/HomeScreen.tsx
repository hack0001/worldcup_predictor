"use client";
import { Player } from "@/app/data/types";
import { League } from "@/lib/storage";
import { AvatarDisplay } from "./AvatarPicker";

interface Props {
  player: Player;
  league: League;
  onNav: (section: "predictions" | "fantasy" | "profile" | "leagueSwitch") => void;
  adminClickCount: number;
  onAdminClick: () => void;
}

export default function HomeScreen({ player, league, onNav, adminClickCount, onAdminClick }: Props) {
  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
        <button onClick={() => onNav("profile")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}>
          <AvatarDisplay url={player.avatarUrl} name={player.name} size={48} />
        </button>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 700, fontSize: "16px" }}>{player.name}</p>
          <button onClick={() => onNav("leagueSwitch")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ fontSize: "12px", color: "var(--text-3)" }}>⚽ {league.name}</span>
            <span style={{ fontSize: "10px", color: "var(--text-3)" }}>▼</span>
          </button>
        </div>
        <button onClick={() => onNav("profile")} className="btn-ghost" style={{ fontSize: "12px" }}>Profile</button>
      </div>

      {/* League code share */}
      <div className="card" style={{ padding: "12px 16px", marginBottom: "24px", display: "flex", alignItems: "center", gap: "10px", borderLeft: "3px solid var(--green)" }}>
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "1px" }}>Invite friends with code</p>
          <p style={{ fontWeight: 800, fontSize: "18px", letterSpacing: "0.1em" }}>{league.code}</p>
        </div>
        <button
          className="btn-secondary"
          style={{ fontSize: "12px" }}
          onClick={() => { navigator.clipboard?.writeText(league.code); }}
        >
          Copy
        </button>
      </div>

      {/* Main nav cards */}
      <div style={{ display: "grid", gap: "12px", marginBottom: "12px" }}>
        <button
          onClick={() => onNav("predictions")}
          style={{ padding: "22px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #16a34a, #15803d)", border: "none", cursor: "pointer", textAlign: "left", color: "white", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <span style={{ fontSize: "40px" }}>⚽</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: "18px" }}>Predictions</p>
            <p style={{ fontSize: "13px", opacity: 0.85, marginTop: "2px" }}>Groups · Knockouts · Leaderboard · Chat</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: "24px", opacity: 0.7 }}>→</span>
        </button>

        <button
          onClick={() => onNav("fantasy")}
          style={{ padding: "22px 20px", borderRadius: "12px", background: "linear-gradient(135deg, #2563eb, #1d4ed8)", border: "none", cursor: "pointer", textAlign: "left", color: "white", display: "flex", alignItems: "center", gap: "16px" }}
        >
          <span style={{ fontSize: "40px" }}>👕</span>
          <div>
            <p style={{ fontWeight: 800, fontSize: "18px" }}>Fantasy</p>
            <p style={{ fontSize: "13px", opacity: 0.85, marginTop: "2px" }}>My Squad · Fantasy Leaderboard</p>
          </div>
          <span style={{ marginLeft: "auto", fontSize: "24px", opacity: 0.7 }}>→</span>
        </button>
      </div>

      {/* Secret admin click */}
      <button
        onClick={onAdminClick}
        style={{ width: "100%", background: "none", border: "none", padding: "8px", cursor: "default", fontSize: "11px", color: adminClickCount > 0 ? "var(--text-3)" : "transparent" }}
      >
        {adminClickCount > 0 ? `${5 - adminClickCount} more clicks for admin` : "·"}
      </button>
    </div>
  );
}
