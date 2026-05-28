"use client";
export const dynamic = "force-dynamic";
import { useState, useEffect, useCallback } from "react";
import { Player, AdminState, FantasySquad, PlayerStat } from "@/app/data/types";
import { getPlayers, getCurrentUserId, getPlayer, getAdminState, setCurrentUserId, getAllFantasySquads, getAllPlayerStats, isPredictionLocked } from "@/lib/storage";
import SignUp from "@/app/components/SignUp";
import GroupPredictions from "@/app/components/GroupPredictions";
import KnockoutPredictions from "@/app/components/KnockoutPredictions";
import Leaderboard from "@/app/components/Leaderboard";
import FantasySquadPicker from "@/app/components/FantasySquad";
import FantasyLeaderboard from "@/app/components/FantasyLeaderboard";
import AdminPanel from "@/app/components/AdminPanel";
import { AvatarDisplay } from "@/app/components/AvatarPicker";
import GroupStandings from "@/app/components/GroupStandings";
import TeamInfo from "@/app/components/TeamInfo";
import GroupChat from "@/app/components/GroupChat";
import { PollFeed } from "@/app/components/Poll";

type Tab = "groups" | "knockout" | "predictor-board" | "standings" | "teams" | "chat" | "polls" | "fantasy" | "fantasy-board" | "profile" | "admin";

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [adminState, setAdminState] = useState<AdminState>({ isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "", tournamentWinner: "", playerOfTournament: "", predictionsLocked: false, lockTime: null });
  const [fantasySquads, setFantasySquads] = useState<FantasySquad[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("predictor-board");
  const [showAdmin, setShowAdmin] = useState(false);
  const [adminClicks, setAdminClicks] = useState(0);

  const refresh = useCallback(async () => {
    const [ps, as, fs, stats] = await Promise.all([getPlayers(), getAdminState(), getAllFantasySquads(), getAllPlayerStats()]);
    setPlayers(ps); setAdminState(as); setFantasySquads(fs); setPlayerStats(stats);
  }, []);

  useEffect(() => {
    const init = async () => {
      const id = getCurrentUserId();
      if (id) {
        const player = await getPlayer(id);
        if (player) { setCurrentPlayer(player); setActiveTab("predictor-board"); }
      }
      await refresh();
      setMounted(true); setLoading(false);
    };
    init();
  }, [refresh]);

  const handleSignup = async (player: Player) => { setCurrentPlayer(player); setActiveTab("groups"); await refresh(); };
  const handlePlayerUpdate = async (updated: Player) => { setCurrentPlayer(updated); await refresh(); };
  const handleAdminUpdate = async (state: AdminState) => { setAdminState(state); await refresh(); };
  const handleLogout = () => { setCurrentUserId(null); setCurrentPlayer(null); setActiveTab("predictor-board"); };
  const handleTitleClick = () => { const n = adminClicks + 1; setAdminClicks(n); if (n >= 5) { setShowAdmin(true); setAdminClicks(0); } };

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

  const tabs: { id: Tab; label: string; emoji: string; group?: string }[] = [
    { id: "groups", label: "Groups", emoji: "🏟️", group: "predict" },
    { id: "knockout", label: "Knockouts", emoji: "⚔️", group: "predict" },
    { id: "standings", label: "Standings", emoji: "📊", group: "predict" },
    { id: "teams", label: "Teams & Form", emoji: "📋", group: "predict" },
    { id: "chat", label: "Chat", emoji: "💬", group: "predict" },
    { id: "polls", label: "Polls", emoji: "📊", group: "predict" },
    { id: "predictor-board", label: "Predictor Board", emoji: "🏆", group: "predict" },
    { id: "fantasy", label: "My Squad", emoji: "👕", group: "fantasy" },
    { id: "fantasy-board", label: "Fantasy Board", emoji: "⭐", group: "fantasy" },
    { id: "profile", label: "Profile", emoji: "👤", group: "other" },
    ...(showAdmin ? [{ id: "admin" as Tab, label: "Admin", emoji: "⚙️", group: "other" }] : []),
  ];

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto", padding: "0 16px 80px" }}>
      {/* Header */}
      <div style={{ padding: "20px 0 0", marginBottom: "4px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px" }}>
        <div onClick={handleTitleClick} style={{ cursor: "default", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: "36px", height: "36px", background: "var(--green)", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>⚽</div>
          <div>
            <h1 style={{ fontSize: "17px", fontWeight: 800 }}>World Cup 2026</h1>
            <p style={{ fontSize: "11px", color: "var(--text-3)" }}>{currentPlayer.teamName}</p>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {isPredictionLocked(adminState) && (
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--red)", display: "flex", alignItems: "center", gap: "4px" }}>
              🔒 Locked
            </span>
          )}
          <AvatarDisplay url={currentPlayer.avatarUrl} name={currentPlayer.name} size={32} />
          <button className="btn-ghost" onClick={handleLogout} style={{ fontSize: "12px" }}>Switch user</button>
        </div>
      </div>

      {/* Tab groups */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "20px", overflowX: "auto" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 10px", whiteSpace: "nowrap" }}>Predictor</span>
          {tabs.filter(t => t.group === "predict").map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.emoji} {t.label}</button>
          ))}
          <div style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 4px" }} />
          <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "0 10px", whiteSpace: "nowrap" }}>Fantasy</span>
          {tabs.filter(t => t.group === "fantasy").map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.emoji} {t.label}</button>
          ))}
          <div style={{ width: "1px", height: "20px", background: "var(--border)", margin: "0 4px" }} />
          {tabs.filter(t => t.group === "other").map(t => (
            <button key={t.id} className={`tab ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>

      {activeTab === "groups" && (
        <div>
          {isPredictionLocked(adminState) && (
            <div className="card" style={{ padding: "12px 16px", marginBottom: "16px", background: "#fef2f2", borderColor: "#fca5a5", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🔒</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--red)" }}>Predictions are locked</p>
                <p style={{ fontSize: "12px", color: "var(--text-2)" }}>The tournament has started — no more changes can be made.</p>
              </div>
            </div>
          )}
          <GroupPredictions player={currentPlayer} onUpdate={handlePlayerUpdate} readonly={isPredictionLocked(adminState)} />
        </div>
      )}
      {activeTab === "knockout" && (
        <div>
          {isPredictionLocked(adminState) && (
            <div className="card" style={{ padding: "12px 16px", marginBottom: "16px", background: "#fef2f2", borderColor: "#fca5a5", display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🔒</span>
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--red)" }}>Predictions are locked</p>
                <p style={{ fontSize: "12px", color: "var(--text-2)" }}>The tournament has started — no more changes can be made.</p>
              </div>
            </div>
          )}
          <KnockoutPredictions
            player={currentPlayer}
            onUpdate={handlePlayerUpdate}
            readonly={isPredictionLocked(adminState)}
            confirmedTeams={Object.fromEntries(
              Object.entries(adminState.results.knockout).map(([matchId, r]) => [
                matchId,
                { home: r.homeTeam || "", away: r.awayTeam || "" }
              ])
            )}
          />
        </div>
      )}
      {activeTab === "predictor-board" && <Leaderboard players={players} adminState={adminState} currentPlayerId={currentPlayer.id} />}
      {activeTab === "standings" && <GroupStandings adminState={adminState} />}
      {activeTab === "teams" && <TeamInfo />}
      {activeTab === "chat" && (
        <GroupChat currentPlayer={currentPlayer} allPlayers={players} isAdmin={showAdmin} />
      )}
      {activeTab === "polls" && (
        <PollFeed currentPlayer={currentPlayer} allPlayers={players} />
      )}
      {activeTab === "fantasy" && <FantasySquadPicker player={currentPlayer} />}
      {activeTab === "fantasy-board" && <FantasyLeaderboard players={players} squads={fantasySquads} stats={playerStats} currentPlayerId={currentPlayer.id} />}
      {activeTab === "profile" && (
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700, marginBottom: "16px" }}>Update Profile</h2>
          <SignUp onComplete={handlePlayerUpdate} existingPlayer={currentPlayer} />
        </div>
      )}
      {activeTab === "admin" && (
        <AdminPanel adminState={adminState} onUpdate={handleAdminUpdate} onClose={() => { setActiveTab("predictor-board"); setShowAdmin(false); }} />
      )}
    </div>
  );
}
