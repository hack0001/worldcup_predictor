"use client";
import { useState, useEffect } from "react";
import { Player, AdminState } from "@/app/data/types";
import { KNOCKOUT_MATCHES } from "@/app/data/worldcup";
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
import WorldCupQuiz from "@/app/components/WorldCupQuiz";
import FixturesView from "@/app/components/FixturesView";
import { AvatarDisplay } from "@/app/components/AvatarPicker";
import FantasySquadPicker from "@/app/components/FantasySquad";
import FantasyLeaderboard from "@/app/components/FantasyLeaderboard";
import AdminPanel from "@/app/components/AdminPanel";
import { supabase } from "@/lib/supabase";
import { getAllPlayerStats, getAllFantasySquads } from "@/lib/storage";

type Section = "home" | "predictions" | "fantasy" | "profile" | "admin" | "adminLogin" | "leagueSwitch" | "quiz" | "fixtures";
type PredTab = "groups" | "knockout" | "board" | "standings" | "teams" | "chat" | "polls";
type FanTab = "squad" | "board";

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [leaguePlayers, setLeaguePlayers] = useState<Player[]>([]);
  const [fantasySquads, setFantasySquads] = useState<Awaited<ReturnType<typeof getAllFantasySquads>>>([]);
  const [adminState, setAdminState] = useState<AdminState>({
    isAdmin: false, results: { group: {}, knockout: {} },
    topScorer: "", topAssist: "", tournamentWinner: "", playerOfTournament: "",
    predictionsLocked: false, lockTime: null, fantasyLocked: false, bonusLocked: false,
  });
  const [playerStats, setPlayerStats] = useState<Awaited<ReturnType<typeof getAllPlayerStats>>>([]);
  const [section, setSection] = useState<Section>("home");
  const [predTab, setPredTab] = useState<PredTab>("board");
  const [unreadChat, setUnreadChat] = useState(false);
  const [fanTab, setFanTab] = useState<FanTab>("squad");

  // Check for unread messages when not on chat tab
  useEffect(() => {
    if (section !== "predictions" || predTab === "chat") { setUnreadChat(false); return; }
    const lastRead = localStorage.getItem(`chat_read_${currentPlayer?.id}`);
    const checkUnread = async () => {
      const { data } = await supabase.from("messages").select("id").order("created_at", { ascending: false }).limit(1);
      if (data?.[0] && data[0].id !== lastRead) setUnreadChat(true);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 30000);
    return () => clearInterval(interval);
  }, [section, predTab, currentPlayer?.id]);
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
        // Always re-fetch from DB to get fresh leagueIds
        import("@/lib/storage").then(({ getPlayerByEmail }) => {
          getPlayerByEmail(p.email).then(fresh => {
            const player = fresh || p;
            setCurrentPlayer(player);
            localStorage.setItem("wc26_player", JSON.stringify(player));
            if (savedLeague) {
              const l = JSON.parse(savedLeague) as League;
              setCurrentLeague(l);
              setSection("home");
            }
            setLoading(false);
          });
        });
      } catch {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  // Load league players + admin state when league changes
  useEffect(() => {
    if (!currentLeague) return;
    getPlayersInLeague(currentLeague.id).then(setLeaguePlayers);
    getAdminState().then(s => setAdminState(s));
    getAllPlayerStats().then(setPlayerStats);
    getAllFantasySquads().then(setFantasySquads);
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

  const [adminPwInput, setAdminPwInput] = useState("");
  const [adminPwError, setAdminPwError] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("wc26_player");
    localStorage.removeItem("wc26_league");
    setCurrentPlayer(null);
    setCurrentLeague(null);
    setSection("home");
    setShowAdmin(false);
    setAdminClicks(0);
  };

  const handleAdminClick = () => {
    const next = adminClicks + 1;
    setAdminClicks(next);
    if (next >= 5) {
      setSection("adminLogin");
      setAdminClicks(0);
    }
  };

  const handleAdminLogin = () => {
    if (adminPwInput === "worldcup2026") {
      setShowAdmin(true);
      setSection("admin");
      setAdminPwInput("");
      setAdminPwError(false);
    } else {
      setAdminPwError(true);
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

  // No league yet — show selector
  if (!currentLeague || section === "leagueSwitch") return (
    <LeagueSelector player={currentPlayer} onLeagueSelected={handleLeagueSelected} />
  );

  // Home
  if (section === "home") return (
    <HomeScreen
      player={currentPlayer}
      league={currentLeague}
      onNav={navTo}
      onUpdate={updatePlayer}
      onLogout={handleLogout}
      adminClickCount={adminClicks}
      onAdminClick={handleAdminClick}
    />
  );

  const confirmedTeams = Object.fromEntries([
    // Auto-populate R32 from the now-confirmed placeholder text
    ...(KNOCKOUT_MATCHES.r32 || []).map(m => {
      const adminResult = adminState.results.knockout?.[m.id];
      const parts = m.placeholder.split(" vs ");
      return [m.id, {
        home: adminResult?.homeTeam || parts[0] || "",
        away: adminResult?.awayTeam || parts[1] || "",
      }];
    }),
    // Later rounds come from admin results only
    ...Object.entries(adminState.results.knockout || {})
      .filter(([id]) => !id.startsWith("r32-"))
      .map(([id, r]) => [id, { home: r.homeTeam || "", away: r.awayTeam || "" }])
  ]);

  const PRED_TABS = [
    { id: "board", label: "Leaderboard", emoji: "🏆" },
    { id: "knockout", label: "Knockouts", emoji: "⚔️" },
    { id: "chat", label: "Chat", emoji: "💬" },
    { id: "groups", label: "Groups", emoji: "🏟️" },
    { id: "standings", label: "Standings", emoji: "📊" },
    { id: "teams", label: "Teams", emoji: "📋" },
    { id: "polls", label: "Polls", emoji: "🗳️" },
  ];

  const FAN_TABS = [
    { id: "squad", label: "My Squad", emoji: "👕" },
    { id: "board", label: "Leaderboard", emoji: "⭐" },
  ];

  // Predictions section
  if (section === "predictions") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #15803d 0%, #166534 100%)", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <button onClick={() => setSection("home")} style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "13px" }}>← Home</button>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: "16px", color: "white" }}>⚽ Predictions</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{currentLeague.name}</p>
          </div>
          <AvatarDisplay url={currentPlayer.avatarUrl} name={currentPlayer.name} size={32} />
        </div>
        {/* Tabs inside header */}
        <div style={{ display: "flex", gap: "2px", overflowX: "auto", paddingBottom: "0" }}>
          {PRED_TABS.map(t => (
            <button key={t.id} onClick={() => { setPredTab(t.id as PredTab); if (t.id === "chat") setUnreadChat(false); }} style={{
              padding: "8px 12px", fontSize: "12px", fontWeight: predTab === t.id ? 800 : 500,
              border: "none", cursor: "pointer", whiteSpace: "nowrap", borderRadius: "8px 8px 0 0",
              background: predTab === t.id ? "var(--bg)" : "transparent",
              color: predTab === t.id ? "var(--green)" : "rgba(255,255,255,0.7)",
              borderBottom: predTab === t.id ? "3px solid var(--green)" : "3px solid transparent",
              position: "relative",
            }}>
              {t.emoji} {t.label}
              {t.id === "chat" && unreadChat && (
                <span style={{ position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: "50%", background: "#ef4444", border: "1.5px solid white" }} />
              )}
            </button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 32px" }}>
        {predTab === "board" && <Leaderboard
          players={leaguePlayers.some(p => p.id === currentPlayer.id) ? leaguePlayers : [...leaguePlayers, currentPlayer]}
          adminState={adminState}
          currentPlayerId={currentPlayer.id}
        />}
        {predTab === "groups" && <GroupPredictions player={currentPlayer} onUpdate={updatePlayer} readonly={adminState.predictionsLocked} allPlayers={leaguePlayers} adminState={adminState} />}
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
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <button onClick={() => setSection("home")} style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "13px" }}>← Home</button>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: "16px", color: "white" }}>👕 Fantasy</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>{currentLeague.name}</p>
          </div>
          <AvatarDisplay url={currentPlayer.avatarUrl} name={currentPlayer.name} size={32} />
        </div>
        <div style={{ display: "flex", gap: "2px", overflowX: "auto" }}>
          {FAN_TABS.map(t => (
            <button key={t.id} onClick={() => setFanTab(t.id as FanTab)} style={{
              padding: "8px 16px", fontSize: "12px", fontWeight: fanTab === t.id ? 800 : 500,
              border: "none", cursor: "pointer", whiteSpace: "nowrap", borderRadius: "8px 8px 0 0",
              background: fanTab === t.id ? "var(--bg)" : "transparent",
              color: fanTab === t.id ? "#3b82f6" : "rgba(255,255,255,0.7)",
              borderBottom: fanTab === t.id ? "3px solid #3b82f6" : "3px solid transparent",
            }}>{t.emoji} {t.label}</button>
          ))}
        </div>
      </div>
      <div style={{ padding: "16px 16px 32px" }}>
        {fanTab === "squad" && <FantasySquadPicker player={currentPlayer} fantasyLocked={adminState.fantasyLocked} />}
        {fanTab === "board" && (() => {
          // Refresh stats every time board is viewed
          getAllPlayerStats().then(setPlayerStats);
          getAllFantasySquads().then(setFantasySquads);
          return <FantasyLeaderboard
            players={leaguePlayers.some(p => p.id === currentPlayer.id) ? leaguePlayers : [...leaguePlayers, currentPlayer]}
            squads={fantasySquads}
            stats={playerStats}
            currentPlayerId={currentPlayer.id}
          />;
        })()}
      </div>
    </div>
  );

  // Fixtures
  if (section === "fixtures") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #0369a1, #0284c7)", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <button onClick={() => setSection("home")} style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "13px" }}>← Home</button>
          <p style={{ fontWeight: 800, fontSize: "16px", color: "white", flex: 1 }}>📅 Upcoming Fixtures</p>
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <FixturesView player={currentPlayer} />
      </div>
    </div>
  );

  // Quiz
  if (section === "quiz") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #7c3aed, #6d28d9)", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <button onClick={() => setSection("home")} style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "13px" }}>← Home</button>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: "16px", color: "white" }}>🧠 World Cup Quiz</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>20 questions · compare with everyone</p>
          </div>
          <AvatarDisplay url={currentPlayer.avatarUrl} name={currentPlayer.name} size={32} />
        </div>
      </div>
      <div style={{ padding: "16px 16px 32px" }}>
        <WorldCupQuiz player={currentPlayer} allPlayers={leaguePlayers} />
      </div>
    </div>
  );

  // Profile
  if (section === "profile") return (
    <div style={{ maxWidth: "480px", margin: "0 auto", padding: "20px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
        <button onClick={() => setSection("home")} className="btn-ghost" style={{ fontSize: "13px" }}>← Home</button>
        <button onClick={() => { if (confirm("Log out? You'll need your email to log back in.")) handleLogout(); }} className="btn-ghost" style={{ fontSize: "13px", color: "var(--red)" }}>Log out</button>
      </div>
      <SignUp existingPlayer={currentPlayer} onComplete={p => { updatePlayer(p); setSection("home"); }} bonusLocked={adminState.bonusLocked} />
    </div>
  );

  // Admin login
  if (section === "adminLogin") return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "0 16px" }}>
      <div className="card" style={{ padding: "28px 24px", textAlign: "center" }}>
        <div style={{ fontSize: "40px", marginBottom: "12px" }}>🔐</div>
        <h2 style={{ fontWeight: 800, fontSize: "18px", marginBottom: "6px" }}>Admin Access</h2>
        <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "20px" }}>Enter the admin password to continue</p>
        <input
          type="password"
          placeholder="Password"
          value={adminPwInput}
          onChange={e => { setAdminPwInput(e.target.value); setAdminPwError(false); }}
          onKeyDown={e => e.key === "Enter" && handleAdminLogin()}
          autoFocus
          style={{ marginBottom: "8px", textAlign: "center", letterSpacing: "0.1em" }}
        />
        {adminPwError && <p style={{ fontSize: "12px", color: "var(--red)", marginBottom: "8px" }}>Incorrect password</p>}
        <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
          <button className="btn-primary" onClick={handleAdminLogin} style={{ flex: 1 }}>Enter</button>
          <button className="btn-secondary" onClick={() => setSection("home")}>Cancel</button>
        </div>
      </div>
    </div>
  );

  // Admin
  if (section === "admin") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)", padding: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <button onClick={() => setSection("home")} style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "13px" }}>← Home</button>
          <div style={{ flex: 1 }}>
            <p style={{ fontWeight: 800, fontSize: "16px", color: "white" }}>⚙️ Admin Panel</p>
            <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.6)" }}>Manage the league</p>
          </div>
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <AdminPanel adminState={adminState} onUpdate={setAdminState} />
      </div>
    </div>
  );

  return null;
}
