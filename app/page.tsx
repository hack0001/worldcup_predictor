"use client";
import { useState, useEffect, useCallback } from "react";
import { Player } from "@/app/data/types";
import { AdminState } from "@/app/data/types";
import { getPlayers, getCurrentUserId, getPlayer, savePlayer, getAdminState, setCurrentUserId } from "@/lib/storage";
import SignUp from "@/app/components/SignUp";
import GroupPredictions from "@/app/components/GroupPredictions";
import KnockoutPredictions from "@/app/components/KnockoutPredictions";
import Leaderboard from "@/app/components/Leaderboard";
import AdminPanel from "@/app/components/AdminPanel";

type Tab = "groups" | "knockout" | "leaderboard" | "admin" | "profile";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [adminState, setAdminState] = useState<AdminState>({ isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "" });
  const [activeTab, setActiveTab] = useState<Tab>("leaderboard");
  const [saveStatus, setSaveStatus] = useState<"saved" | "saving" | "">("");
  const [showAdminLink, setShowAdminLink] = useState(false);
  const [adminClickCount, setAdminClickCount] = useState(0);

  useEffect(() => {
    setMounted(true);
    const id = getCurrentUserId();
    if (id) {
      const player = getPlayer(id);
      if (player) {
        setCurrentPlayer(player);
        setActiveTab("groups");
      }
    }
    setPlayers(getPlayers());
    setAdminState(getAdminState());
  }, []);

  const refreshPlayers = useCallback(() => {
    setPlayers(getPlayers());
  }, []);

  const handleSignup = (player: Player) => {
    setCurrentPlayer(player);
    setActiveTab("groups");
    refreshPlayers();
  };

  const handlePlayerUpdate = (updated: Player) => {
    savePlayer(updated);
    setCurrentPlayer(updated);
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus(""), 2000);
    refreshPlayers();
  };

  const handleAdminUpdate = (state: AdminState) => {
    setAdminState(state);
    refreshPlayers();
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setCurrentPlayer(null);
    setActiveTab("leaderboard");
  };

  const handleTitleClick = () => {
    const next = adminClickCount + 1;
    setAdminClickCount(next);
    if (next >= 5) {
      setShowAdminLink(true);
      setAdminClickCount(0);
    }
  };

  if (!mounted) return null;

  if (!currentPlayer) {
    return <SignUp onComplete={handleSignup} />;
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "groups", label: "Groups", icon: "🏟️" },
    { id: "knockout", label: "Knockouts", icon: "⚔️" },
    { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
    { id: "profile", label: "Profile", icon: "👤" },
    ...(showAdminLink ? [{ id: "admin" as Tab, label: "Admin", icon: "⚙️" }] : []),
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 16px 80px" }}>
      <div style={{ padding: "24px 0 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div onClick={handleTitleClick} style={{ cursor: "default" }}>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(28px, 6vw, 44px)", color: "var(--gold)", lineHeight: 1 }}>
            ⚽ World Cup 2026
          </h1>
          <p style={{ fontSize: "12px", color: "rgba(248,244,232,0.4)", marginTop: "2px" }}>
            Predictor · {currentPlayer.teamName}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {saveStatus === "saved" && (
            <span style={{ fontSize: "12px", color: "#7ec8a4", fontWeight: 600 }}>✓ Saved</span>
          )}
          <button className="btn-secondary" onClick={handleLogout} style={{ fontSize: "13px", padding: "7px 14px" }}>
            Switch User
          </button>
        </div>
      </div>

      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "24px", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            <span style={{ marginRight: "4px" }}>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {activeTab === "groups" && (
        <div>
          <p style={{ fontSize: "13px", color: "rgba(248,244,232,0.5)", marginBottom: "20px" }}>
            Enter your predicted scores for all Group Stage matches. Saves instantly.
          </p>
          <GroupPredictions player={currentPlayer} onUpdate={handlePlayerUpdate} />
        </div>
      )}
      {activeTab === "knockout" && (
        <KnockoutPredictions player={currentPlayer} onUpdate={handlePlayerUpdate} />
      )}
      {activeTab === "leaderboard" && (
        <Leaderboard players={players} adminState={adminState} currentPlayerId={currentPlayer.id} />
      )}
      {activeTab === "profile" && (
        <div>
          <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "24px", marginBottom: "20px", color: "var(--gold)" }}>
            Update Your Profile
          </h2>
          <SignUp onComplete={handlePlayerUpdate} existingPlayer={currentPlayer} />
        </div>
      )}
      {activeTab === "admin" && (
        <AdminPanel
          adminState={adminState}
          onUpdate={handleAdminUpdate}
          onClose={() => { setActiveTab("leaderboard"); setShowAdminLink(false); }}
        />
      )}
    </div>
  );
}
