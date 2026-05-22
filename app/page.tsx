"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import { Player, AdminState } from "@/app/data/types";
import { getPlayers, getCurrentUserId, getPlayer, getAdminState, setCurrentUserId } from "@/lib/storage";
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
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const [ps, as] = await Promise.all([getPlayers(), getAdminState()]);
    setPlayers(ps);
    setAdminState(as);
  }, []);

  useEffect(() => {
    const init = async () => {
      const id = getCurrentUserId();
      if (id) {
        const player = await getPlayer(id);
        if (player) { setCurrentPlayer(player); setActiveTab("groups"); }
      }
      await refresh();
      setMounted(true);
      setLoading(false);
    };
    init();
  }, [refresh]);

  const handleSignup = async (player: Player) => {
    setCurrentPlayer(player);
    setActiveTab("groups");
    await refresh();
  };

  const handlePlayerUpdate = async (updated: Player) => {
    setCurrentPlayer(updated);
    await refresh();
  };

  const handleAdminUpdate = async (state: AdminState) => {
    setAdminState(state);
    await refresh();
  };

  const handleLogout = () => {
    setCurrentUserId(null);
    setCurrentPlayer(null);
    setActiveTab("leaderboard");
  };

  const handleTitleClick = () => {
    const next = adminClicks + 1;
    setAdminClicks(next);
    if (next >= 5) { setShowAdmin(true); setAdminClicks(0); }
  };

  if (!mounted || loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "var(--bg)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "40px", marginBottom: "12px" }}>⚽</div>
          <p style={{ color: "var(--text-2)", fontWeight: 500 }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentPlayer) return <SignUp onComplete={handleSignup} />;

  const tabs: { id: Tab; label: string; emoji: string }[] = [
    { id: "groups", label: "Groups", emoji: "🏟️" },
    { id: "knockout", label: "Knockouts", emoji: "⚔️" },
    { id: "leaderboard", label: "Leaderboard", emoji: "🏆" },
    { id: "profile", label: "Profile", emoji: "👤" },
    ...(showAdmin ? [{ id: "admin" as Tab, label: "Admin", emoji: "⚙️" }] : []),
  ];

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 0", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div onClick={handleTitleClick} style={{ cursor: "default", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "var(--green)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚽</div>
          <div>
            <h1 style={{ fontSize: "17px", fontWeight: 800, color: "var(--text)" }}>World Cup 2026 Predictor</h1>
            <p style={{ fontSize: "11px", color: "var(--text-3)" }}>{currentPlayer.teamName} · {currentPlayer.name}</p>
          </div>
        </div>
        <button className="btn-ghost" onClick={handleLogout} style={{ fontSize: "12px" }}>Switch user</button>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "20px", overflowX: "auto" }}>
        {tabs.map((t) => (
          <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {activeTab === "groups" && <GroupPredictions player={currentPlayer} onUpdate={handlePlayerUpdate} />}
      {activeTab === "knockout" && <KnockoutPredictions player={currentPlayer} onUpdate={handlePlayerUpdate} />}
      {activeTab === "leaderboard" && <Leaderboard players={players} adminState={adminState} currentPlayerId={currentPlayer.id} />}
      {activeTab === "profile" && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px" }}>Update Profile</h2>
          <SignUp onComplete={handlePlayerUpdate} existingPlayer={currentPlayer} />
        </div>
      )}
      {activeTab === "admin" && (
        <AdminPanel adminState={adminState} onUpdate={handleAdminUpdate} onClose={() => { setActiveTab("leaderboard"); setShowAdmin(false); }} />
      )}
    </div>
  );
}
