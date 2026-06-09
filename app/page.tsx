"use client";
import { useState, useEffect } from "react";
import { Player, AdminState } from "@/app/data/types";
import { getAdminState, getPlayers } from "@/lib/storage";
import { League, getLeaguesByIds, getPlayersInLeague } from "@/lib/storage";

import SignUp from "@/app/components/SignUp";
import LeagueSelector from "@/app/components/LeagueSelector";
import HomeScreen from "@/app/components/HomeScreen";
import GroupPredictions from "@/app/components/GroupPredictions";
import KnockoutPredictions from "@/app/components/KnockoutPredictions";
import Leaderboard from "@/app/components/Leaderboard";
import GroupStandings from "@/app/components/GroupStandings";
import TeamInfo from "@/app/components/TeamInfo";
import GroupChat from "@/app/components/GroupChat";
import { PollFeed } from "@/app/components/Poll";
import FantasySquadPicker from "@/app/components/FantasySquad";
import FantasyLeaderboard from "@/app/components/FantasyLeaderboard";
import AdminPanel from "@/app/components/AdminPanel";
import { getAllPlayerStats } from "@/lib/storage";

type Section = "home" | "predictions" | "fantasy" | "profile" | "admin" | "leagueSwitch";
type PredTab = "groups" | "knockout" | "board" | "standings" | "teams" | "chat" | "polls";
type FanTab = "squad" | "board";

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [leaguePlayers, setLeaguePlayers] = useState<Player[]>([]);
  const [adminState, setAdminState] = useState<AdminState>({
    isAdmin: false, results: { group: {}, knockout: {} },
    topScorer: "", topAssist: "", tournamentWinner: "", playerOfTournament: "",
    predictionsLocked: false, lockTime: null,
  });
  const [playerStats, setPlayerStats] = useState<Awaited<ReturnType<typeof getAllPlayerStats>>>([]);
  const [section, setSection] = useState<Section>("home");
  const [predTab, setPredTab] = useState<PredTab>("board");
  const [fanTab, setFanTab] = useState<FanTab>("squad");
  const [adminClicks, setAdminClicks] = useState(0);
  const [showAdmin, setShowAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load persisted session
  useEffect(() => {
    const saved = localStorage.getItem("wc26_player");
    const savedLeague = localStorage.getItem("wc26_league");
    if (saved) {
      try {
        const p = JSON.parse(saved) as Player;
        setCurrentPlayer(p);
        if (savedLeague) {
          const l = JSON.parse(savedLeague) as League;
          setCurrentLeague(l);
          setSection("home");
        }
      } catch {}
    }
    setLoading(false);
  }, []);

  // Load league players + admin state when league changes
  useEffect(() => {
    if (!currentLeague) return;
    getPlayersInLeague(currentLeague.id).then(setLeaguePlayers);
    getAdminState().then(s => setAdminState(s));
    getAllPlayerStats().then(setPlayerStats);
  }, [currentLeague?.id]);

  const handlePlayerSaved = (p: Player) => {
    setCurrentPlayer(p);
    localStorage.setItem("wc26_player", JSON.stringify(p));
    // If player has leagues, show league selector; else show league selector for first time
    setSection("leagueSwitch");
  };

  const handleLeagueSelected = (p: Player, l: League) => {
    setCurrentPlayer(p);
    setCurrentLeague(l);
    localStorage.setItem("wc26_player", JSON.stringify(p));
    localStorage.setItem("wc26_league", JSON.stringify(l));
    setSection("home");
  };

  const handleAdminClick = () => {
    const next = adminClicks + 1;
    setAdminClicks(next);
    if (next >= 5) {
      const pw = prompt("Admin password:");
      if (pw === "worldcup2026") { setShowAdmin(true); setSection("admin"); }
      setAdminClicks(0);
    }
  };

  const navTo = (s: Section) => {
    if (s === "leagueSwitch") setSection("leagueSwitch");
    else setSection(s);
  };

  const updatePlayer = (p: Player) => {
    setCurrentPlayer(p);
    localStorage.setItem("wc26_player", JSON.stringify(p));
    // Refresh league players
    if (currentLeague) getPlayersInLeague(currentLeague.id).then(setLeaguePlayers);
  };

  const NavBar = ({ back, tabs, active, onTab }: { back?: () => void; tabs: {id: string; label: string; emoji: string}[]; active: string; onTab: (id: string) => void }) => (
    <div style={{ position: "sticky", top: 0, zIndex: 50, background: "var(--bg)", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", padding: "0 4px", overflowX: "auto" }}>
        {back && <button onClick={back} className="btn-ghost" style={{ fontSize: "13px", flexShrink: 0, padding: "8px 10px" }}>← Home</button>}
        {tabs.map(t => (
          <button key={t.id} onClick={() => onTab(t.id)} className={`tab ${active === t.id ? "active" : ""}`} style={{ flexShrink: 0 }}>{t.emoji} {t.label}</button>
        ))}
      </div>
    </div>
  );

  if (loading) return null;

  // Not logged in
  if (!currentPlayer) return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px" }}>
      <SignUp onComplete={handlePlayerSaved} />
    </div>
  );

  // No league yet
  if (!currentLeague || section === "leagueSwitch") return (
    <LeagueSelector player={currentPlayer} onLeagueSelected={handleLeagueSelected} />
  );

  // Home
  if (section === "home") return (
    <>
      <HomeScreen
        player={currentPlayer}
        league={currentLeague}
        onNav={navTo}
        adminClickCount={adminClicks}
        onAdminClick={handleAdminClick}
      />
      {showAdmin && (
        <div style={{ maxWidth: "700px", margin: "0 auto", padding: "0 16px 32px" }}>
          <AdminPanel adminState={adminState} onUpdate={setAdminState} />
        </div>
      )}
    </>
  );

  const confirmedTeams = Object.fromEntries(
    Object.entries(adminState.results.knockout || {}).map(([id, r]) => [id, { home: r.homeTeam || "", away: r.awayTeam || "" }])
  );

  const PRED_TABS = [
    { id: "board", label: "Leaderboard", emoji: "🏆" },
    { id: "groups", label: "Groups", emoji: "🏟️" },
    { id: "knockout", label: "Knockouts", emoji: "⚔️" },
    { id: "standings", label: "Standings", emoji: "📊" },
    { id: "teams", label: "Teams", emoji: "📋" },
    { id: "chat", label: "Chat", emoji: "💬" },
    { id: "polls", label: "Polls", emoji: "📊" },
  ];

  const FAN_TABS = [
    { id: "squad", label: "My Squad", emoji: "👕" },
    { id: "board", label: "Leaderboard", emoji: "⭐" },
  ];

  // Predictions section
  if (section === "predictions") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <NavBar back={() => setSection("home")} tabs={PRED_TABS} active={predTab} onTab={id => setPredTab(id as PredTab)} />
      <div style={{ padding: "0 16px 32px" }}>
        {predTab === "board" && <Leaderboard players={leaguePlayers} adminState={adminState} currentPlayerId={currentPlayer.id} />}
        {predTab === "groups" && <GroupPredictions player={currentPlayer} onUpdate={updatePlayer} readonly={adminState.predictionsLocked} />}
        {predTab === "knockout" && <KnockoutPredictions player={currentPlayer} onUpdate={updatePlayer} readonly={adminState.predictionsLocked} confirmedTeams={confirmedTeams} />}
        {predTab === "standings" && <GroupStandings adminState={adminState} />}
        {predTab === "teams" && <TeamInfo />}
        {predTab === "chat" && <GroupChat currentPlayer={currentPlayer} allPlayers={leaguePlayers} isAdmin={showAdmin} leagueId={currentLeague.id} />}
        {predTab === "polls" && <PollFeed currentPlayer={currentPlayer} allPlayers={leaguePlayers} leagueId={currentLeague.id} />}
      </div>
    </div>
  );

  // Fantasy section
  if (section === "fantasy") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <NavBar back={() => setSection("home")} tabs={FAN_TABS} active={fanTab} onTab={id => setFanTab(id as FanTab)} />
      <div style={{ padding: "0 16px 32px" }}>
        {fanTab === "squad" && <FantasySquadPicker player={currentPlayer} />}
        {fanTab === "board" && <FantasyLeaderboard players={leaguePlayers} squads={[]} stats={playerStats} currentPlayerId={currentPlayer.id} />}
      </div>
    </div>
  );

  // Profile
  if (section === "profile") return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px" }}>
      <button onClick={() => setSection("home")} className="btn-ghost" style={{ marginBottom: "16px", fontSize: "13px" }}>← Home</button>
      <SignUp existingPlayer={currentPlayer} onComplete={p => { updatePlayer(p); setSection("home"); }} />
    </div>
  );

  // Admin
  if (section === "admin") return (
    <div style={{ maxWidth: "700px", margin: "0 auto", padding: "20px 16px" }}>
      <button onClick={() => setSection("home")} className="btn-ghost" style={{ marginBottom: "16px", fontSize: "13px" }}>← Home</button>
      <AdminPanel adminState={adminState} onUpdate={setAdminState} />
    </div>
  );

  return null;
}
