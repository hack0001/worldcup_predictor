"use client";
import { useState, useEffect } from "react";
import { Player, AdminState } from "@/app/data/types";
import { KNOCKOUT_MATCHES, BRACKET_PROGRESSION } from "@/app/data/worldcup";
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

type Section = "home" | "predictions" | "profile" | "admin" | "adminLogin" | "leagueSwitch" | "quiz" | "fixtures";
type PredTab = "groups" | "knockout" | "board" | "standings" | "teams" | "chat" | "polls";
type FanTab = "squad" | "board";

export default function App() {
  const [currentPlayer, setCurrentPlayer] = useState<Player | null>(null);
  const [currentLeague, setCurrentLeague] = useState<League | null>(null);
  const [leaguePlayers, setLeaguePlayers] = useState<Player[]>([]);
  const [allPlayers, setAllPlayers] = useState<Player[]>([]);
  const [fantasySquads, setFantasySquads] = useState<Awaited<ReturnType<typeof getAllFantasySquads>>>([]);
  const [adminState, setAdminState] = useState<AdminState>({
    isAdmin: false, results: { group: {}, knockout: {} },
    topScorer: "", topAssist: "", tournamentWinner: "", playerOfTournament: "",
    predictionsLocked: false, lockTime: null, fantasyLocked: false, bonusLocked: false,
  });
  const [playerStats, setPlayerStats] = useState<Awaited<ReturnType<typeof getAllPlayerStats>>>([]);
  const [section, setSection] = useState<Section>("home");
  const [predTab, setPredTab] = useState<PredTab>("board");
  const [unreadCount, setUnreadCount] = useState(0);
  const [fanTab, setFanTab] = useState<FanTab>("squad");

  // Track unread messages — count messages newer than last read, filtered by current league
  useEffect(() => {
    if (!currentPlayer?.id || !currentLeague?.id) return;
    const storageKey = `chat_read_${currentPlayer.id}_${currentLeague.id}`;
    const checkUnread = async () => {
      // If on chat tab, mark all as read and reset count
      if (section === "predictions" && predTab === "chat") {
        const { data } = await supabase.from("messages").select("id").eq("league_id", currentLeague.id).order("created_at", { ascending: false }).limit(1);
        if (data?.[0]) localStorage.setItem(storageKey, data[0].id);
        setUnreadCount(0);
        return;
      }
      const lastReadId = localStorage.getItem(storageKey);
      if (!lastReadId) {
        // Never read — count all
        const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("league_id", currentLeague.id);
        setUnreadCount(count || 0);
        return;
      }
      // Count messages newer than lastReadId
      const { data: lastMsg } = await supabase.from("messages").select("created_at").eq("id", lastReadId).single();
      if (!lastMsg) { setUnreadCount(0); return; }
      const { count } = await supabase.from("messages").select("id", { count: "exact", head: true })
        .eq("league_id", currentLeague.id)
        .gt("created_at", lastMsg.created_at);
      setUnreadCount(count || 0);
    };
    checkUnread();
    const interval = setInterval(checkUnread, 20000);
    return () => clearInterval(interval);
  }, [section, predTab, currentPlayer?.id, currentLeague?.id]);
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

  // Refresh fantasy stats when switching to the board tab — fires once per tab switch, not on every render
  useEffect(() => {
    if (fanTab === "board") {
      getAllPlayerStats().then(setPlayerStats);
      getAllFantasySquads().then(squads => {
        setFantasySquads(squads);
        // Load ALL players who have a squad with at least 1 player picked
        const pickedPlayerIds = new Set(squads.filter(s => s.squad?.length > 0).map(s => s.playerId));
        if (pickedPlayerIds.size > 0) {
          getPlayers().then(all => setAllPlayers(all.filter(p => pickedPlayerIds.has(p.id))));
        }
      });
    }
  }, [fanTab]);

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

  const confirmedTeams = (() => {
    const teams: Record<string, { home: string; away: string }> = {};
    const kr = adminState.results.knockout || {};

    // Helper: get winner of a match by position (home/away)
    const getWinner = (matchId: string): { home: string; away: string; winner: string | null } => {
      // For R32, team names come from placeholder
      const r32Match = (KNOCKOUT_MATCHES.r32 || []).find(m => m.id === matchId);
      const r = kr[matchId];
      let home = r?.homeTeam || "";
      let away = r?.awayTeam || "";
      // Fill from placeholder if blank
      if ((!home || !away) && r32Match?.placeholder?.includes(" vs ") && !r32Match.placeholder.startsWith("W")) {
        const parts = r32Match.placeholder.split(" vs ");
        home = home || parts[0];
        away = away || parts[1];
      }
      if (!r || !r.homeScore || !r.awayScore) return { home, away, winner: null };
      const ah = parseInt(r.homeScore), aa = parseInt(r.awayScore);
      if (isNaN(ah) || isNaN(aa)) return { home, away, winner: null };
      if (r.wentToPens && r.penWinner) return { home, away, winner: r.penWinner };
      if (r.wentToET && r.etHomeScore && r.etAwayScore) {
        const eh = parseInt(r.etHomeScore), ea = parseInt(r.etAwayScore);
        if (!isNaN(eh) && !isNaN(ea) && eh !== ea) return { home, away, winner: eh > ea ? home : away };
      }
      if (ah !== aa) return { home, away, winner: ah > aa ? home : away };
      return { home, away, winner: null };
    };

    // R32 — from placeholder directly
    for (const m of (KNOCKOUT_MATCHES.r32 || [])) {
      const r = kr[m.id];
      let home = r?.homeTeam || "";
      let away = r?.awayTeam || "";
      if ((!home || !away) && m.placeholder?.includes(" vs ") && !m.placeholder.startsWith("W")) {
        const parts = m.placeholder.split(" vs ");
        home = home || parts[0];
        away = away || parts[1];
      }
      teams[m.id] = { home, away };
    }

    // R16+ — derive winners from completed R32/R16 results via BRACKET_PROGRESSION
    for (const [nextId, feedStr] of Object.entries(BRACKET_PROGRESSION)) {
      const [feed1, feed2] = feedStr.split(",");
      const w1 = getWinner(feed1);
      const w2 = getWinner(feed2);
      const stored = kr[nextId];
      // 3rd place uses losers of semis, not winners
      if (nextId === "3rd-103") {
        const loser1 = w1.winner ? (w1.winner === w1.home ? w1.away : w1.home) : "";
        const loser2 = w2.winner ? (w2.winner === w2.home ? w2.away : w2.home) : "";
        teams[nextId] = { home: stored?.homeTeam || loser1, away: stored?.awayTeam || loser2 };
      } else {
        teams[nextId] = { home: stored?.homeTeam || w1.winner || "", away: stored?.awayTeam || w2.winner || "" };
      }
    }

    return teams;
  })();


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
      confirmedTeams={confirmedTeams}
      allPlayers={leaguePlayers}
      adminState={adminState as {results:{knockout:Record<string,{homeScore?:string;awayScore?:string;homeTeam?:string;awayTeam?:string;wentToPens?:boolean;penWinner?:string;wentToET?:boolean;etHomeScore?:string;etAwayScore?:string}>}}}
    />
  );


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
            <button key={t.id} onClick={() => setPredTab(t.id as PredTab)} style={{
              padding: "8px 12px", fontSize: "12px", fontWeight: predTab === t.id ? 800 : 500,
              border: "none", cursor: "pointer", whiteSpace: "nowrap", borderRadius: "8px 8px 0 0",
              background: predTab === t.id ? "var(--bg)" : "transparent",
              color: predTab === t.id ? "var(--green)" : "rgba(255,255,255,0.7)",
              borderBottom: predTab === t.id ? "3px solid var(--green)" : "3px solid transparent",
              position: "relative",
            }}>
              {t.emoji} {t.label}
              {t.id === "chat" && unreadCount > 0 && (
                <span style={{ position: "absolute", top: 2, right: 2, minWidth: 18, height: 18, borderRadius: "99px", background: "#ef4444", border: "2px solid white", color: "white", fontSize: "10px", fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px" }}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
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
        {predTab === "knockout" && <KnockoutPredictions player={currentPlayer} onUpdate={updatePlayer} readonly={adminState.predictionsLocked} confirmedTeams={confirmedTeams} allPlayers={leaguePlayers} adminState={adminState as {results:{knockout:Record<string,{homeScore?:string;awayScore?:string;homeTeam?:string;awayTeam?:string}>}}} />}
        {predTab === "standings" && <GroupStandings adminState={adminState} />}
        {predTab === "teams" && <TeamInfo />}
        {predTab === "chat" && <GroupChat currentPlayer={currentPlayer} allPlayers={leaguePlayers} isAdmin={showAdmin} leagueId={currentLeague.id} />}
        {predTab === "polls" && <PollFeed currentPlayer={currentPlayer} allPlayers={leaguePlayers} leagueId={currentLeague.id} />}
      </div>
    </div>
  );

  // Fantasy section
  if (section === "fixtures") return (
    <div style={{ maxWidth: "700px", margin: "0 auto" }}>
      <div style={{ background: "linear-gradient(135deg, #0369a1, #0284c7)", padding: "16px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <button onClick={() => setSection("home")} style={{ color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "5px 10px", cursor: "pointer", fontSize: "13px" }}>← Home</button>
          <p style={{ fontWeight: 800, fontSize: "16px", color: "white", flex: 1 }}>📅 Upcoming Fixtures</p>
        </div>
      </div>
      <div style={{ padding: "16px" }}>
        <FixturesView player={currentPlayer} confirmedTeams={confirmedTeams} />
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
        <AdminPanel adminState={adminState} onUpdate={setAdminState} currentPlayerId={currentPlayer.id} confirmedTeams={confirmedTeams} />
      </div>
    </div>
  );

  return null;
}
