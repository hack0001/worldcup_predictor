"use client";
import { useState, useEffect } from "react";
import { AdminState, PlayerStat, Player } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES, KNOCKOUT_MATCHES, SQUADS, BRACKET_PROGRESSION, GROUP_TO_R32 } from "@/app/data/worldcup";
import { saveAdminState, getAllPlayerStats, savePlayerStat, deletePlayerStat, getPlayers, savePlayer, sendMessage, getAllLeagues } from "@/lib/storage";
import { saveTeamForm, getAllTeamForms, FormMatch, TeamForm, bustFormCache } from "@/lib/footballApi";
import Flag from "./Flag";
import FlagSelect from "./FlagSelect";

interface Props {
  adminState: AdminState;
  onUpdate: (state: AdminState) => void;
  onClose?: () => void;
  currentPlayerId?: string;
}



const ROUNDS = ["Group Stage", "Round of 32", "Round of 16", "Quarter Finals", "Semi Finals", "Final"];

function QuickStatRow({ player, matchStat, matchId, matchLabel, onSave }: {
  player: { name: string; country: string; position: string };
  matchStat: PlayerStat | undefined;
  matchId: string;
  matchLabel: string;
  onSave: (s: PlayerStat) => void;
}) {
  const [g, setG] = useState(matchStat?.goals ?? 0);
  const [a, setA] = useState(matchStat?.assists ?? 0);
  const [y, setY] = useState(matchStat?.yellowCards ?? 0);
  const [r, setR] = useState(matchStat?.redCards ?? 0);
  const [sv, setSv] = useState(matchStat?.saves ?? 0);
  const [m, setM] = useState(matchStat?.minutesPlayed ?? 0);
  const [cs, setCs] = useState(matchStat?.cleanSheets ?? 0);
  const [og, setOg] = useState(matchStat?.ownGoals ?? 0);
  const [saving, setSaving] = useState(false);
  // Reset when match changes
  useState(() => { setG(matchStat?.goals??0); setA(matchStat?.assists??0); setY(matchStat?.yellowCards??0); setR(matchStat?.redCards??0); setSv(matchStat?.saves??0); setM(matchStat?.minutesPlayed??0); setCs(matchStat?.cleanSheets??0); });
  const isDirty = g!==(matchStat?.goals??0)||a!==(matchStat?.assists??0)||y!==(matchStat?.yellowCards??0)||r!==(matchStat?.redCards??0)||sv!==(matchStat?.saves??0)||m!==(matchStat?.minutesPlayed??0)||cs!==(matchStat?.cleanSheets??0)||og!==(matchStat?.ownGoals??0);
  const inp = (val: number, set: (n: number) => void, max = 20) => (
    <td style={{ padding: "3px 2px" }}>
      <input type="number" min={0} max={max} value={val} onChange={e => set(Math.max(0, +e.target.value))}
        style={{ width: 38, textAlign: "center", padding: "3px 2px", fontSize: "12px", border: "1px solid var(--border)", borderRadius: 4 }} />
    </td>
  );
  return (
    <tr style={{ borderBottom: "1px solid var(--border)", background: isDirty ? "var(--green-light)" : "transparent" }}>
      <td style={{ padding: "4px 8px", fontWeight: 600, fontSize: "12px", whiteSpace: "nowrap" }}>
        <span style={{ fontSize: "10px", color: "var(--text-3)", marginRight: 4 }}>{player.position}</span>
        {player.name}
      </td>
      {inp(g, setG)} {inp(a, setA)} {inp(y, setY, 3)} {inp(r, setR, 1)} {inp(sv, setSv)} {inp(m, setM, 120)} {inp(cs, setCs)} {inp(og, setOg, 3)}
      <td style={{ padding: "3px 4px" }}>
        <button onClick={async () => {
          setSaving(true);
          await onSave({ id: matchStat?.id || `${player.name}-${matchId}`, playerName: player.name, country: player.country, goals: g, assists: a, yellowCards: y, redCards: r, saves: sv, minutesPlayed: m, cleanSheets: cs, ownGoals: og, round: "group", matchId, matchLabel });
          setSaving(false);
        }} style={{ fontSize: "11px", padding: "3px 8px", borderRadius: 5, border: "none", background: isDirty ? "var(--green)" : "var(--border)", color: isDirty ? "white" : "var(--text-3)", cursor: isDirty ? "pointer" : "default", fontWeight: 700 }}>
          {saving ? "…" : "✓"}
        </button>
      </td>
    </tr>
  );
}

export default function AdminPanel({ adminState, onUpdate, onClose, currentPlayerId = "admin" }: Props) {
  const [authenticated] = useState(true); // Auth handled by page-level login
  const [activeSection, setActiveSection] = useState<"results" | "stats" | "users" | "form" | "leagues" | "autofill">("results");
  const [viewingUser, setViewingUser] = useState<Player | null>(null);
  const [userFantasySquads, setUserFantasySquads] = useState<Record<string, string[]>>({});
  const [fetchedStats, setFetchedStats] = useState<null | {
    name: string; country: string; goals: number; assists: number;
    yellowCards: number; redCards: number; minutesPlayed: number;
    approved: boolean; noMatch: boolean;
  }[]>(null);
  const [squadPlayers, setSquadPlayers] = useState<{name: string; country: string; position: string; pickedBy: string[]}[]>([]);
  const [showSquadList, setShowSquadList] = useState(false);
  const [selectedMatchForStats, setSelectedMatchForStats] = useState<string>("");
  const [fetchingStats, setFetchingStats] = useState(false);
  const [allLeagues, setAllLeagues] = useState<{ id: string; name: string; code: string; created_at: string }[]>([]);
  const [leaguePlayerCounts, setLeaguePlayerCounts] = useState<Record<string, number>>({});
  const [editingLeague, setEditingLeague] = useState<{ id: string; name: string; code: string } | null>(null);
  const [assigningLeague, setAssigningLeague] = useState<string | null>(null);
  const [overridePreds, setOverridePreds] = useState<Record<string, { home: string; away: string }>>({});
  const [savingOverride, setSavingOverride] = useState<string | null>(null); // league id being assigned
  const [activeGroup, setActiveGroup] = useState<string>("A");
  const [activeKnockoutRound, setActiveKnockoutRound] = useState<"r32" | "r16" | "qf" | "sf" | "final">("r32");
  const [localState, setLocalState] = useState<AdminState>(adminState);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [users, setUsers] = useState<Player[]>([]);
  const [editingUser, setEditingUser] = useState<Player | null>(null);
  const [teamForms, setTeamForms] = useState<Record<string, TeamForm>>({});
  const [activeFormGroup, setActiveFormGroup] = useState("A");
  const [editingTeam, setEditingTeam] = useState<string | null>(null);
  const [editingMatches, setEditingMatches] = useState<FormMatch[]>([]);
  const [newStat, setNewStat] = useState({ playerName: "", country: "", goals: "0", assists: "0", cleanSheets: "0", yellowCards: "0", redCards: "0", saves: "0", minutesPlayed: "90", round: "Group Stage" });
  const [resultsTab, setResultsTab] = useState<"groups" | "knockout">("groups");

  useEffect(() => {
    if (authenticated) {
      getAllPlayerStats().then(setStats);
      getPlayers().then(async players => {
        setUsers(players);
        // Load fantasy squads for all users
        const { supabase } = await import("@/lib/supabase");
        const { data } = await supabase.from("fantasy_squads").select("player_id, squad");
        if (data) {
          const map: Record<string, string[]> = {};
          data.forEach(row => {
            const squad = (row.squad as { name: string }[]) || [];
            map[row.player_id] = squad.map(p => p.name);
          });
          setUserFantasySquads(map);
        }
        // Load all leagues
        const { data: leagueData } = await supabase.from("leagues").select("*").order("created_at");
        if (leagueData) {
          setAllLeagues(leagueData);
          // Count players per league
          const counts: Record<string, number> = {};
          players.forEach(p => {
            (p.leagueIds || []).forEach((id: string) => {
              counts[id] = (counts[id] || 0) + 1;
            });
          });
          setLeaguePlayerCounts(counts);
        }
      });
      getAllTeamForms().then(setTeamForms);
    }
  }, [authenticated]);


  const updateGroupResult = (matchId: string, side: "home" | "away", value: string) => {
    const v = value.replace(/\D/g, "").slice(0, 2);
    setLocalState((s) => {
      const newGroup = {
        ...s.results.group,
        [matchId]: {
          home: side === "home" ? v : (s.results.group[matchId]?.home ?? ""),
          away: side === "away" ? v : (s.results.group[matchId]?.away ?? ""),
        },
      };

      // Recalculate group standings and auto-populate R32 slots
      const newKnockout = { ...s.results.knockout };

      for (const [group, teams] of Object.entries(GROUPS)) {
        const groupMatches = GROUP_MATCHES.filter(m => m.group === group);

        // Calculate points/GD for each team
        const standings: Record<string, { pts: number; gd: number; gf: number }> = {};
        teams.forEach(t => { standings[t.team] = { pts: 0, gd: 0, gf: 0 }; });

        for (const m of groupMatches) {
          const res = newGroup[m.id];
          if (!res || res.home === "" || res.away === "") continue;
          const h = parseInt(res.home), a = parseInt(res.away);
          if (isNaN(h) || isNaN(a)) continue;
          standings[m.home.team].gf += h;
          standings[m.away.team].gf += a;
          standings[m.home.team].gd += h - a;
          standings[m.away.team].gd += a - h;
          if (h > a) { standings[m.home.team].pts += 3; }
          else if (a > h) { standings[m.away.team].pts += 3; }
          else { standings[m.home.team].pts += 1; standings[m.away.team].pts += 1; }
        }

        const sorted = Object.entries(standings)
          .sort(([, a], [, b]) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf);

        const allPlayed = groupMatches.every(m => {
          const res = newGroup[m.id];
          return res && res.home !== "" && res.away !== "";
        });

        // Only populate R32 when all group games have scores
        if (allPlayed && GROUP_TO_R32[group]) {
          const first = sorted[0][0];
          const second = sorted[1][0];
          const { first: firstSlot, second: secondSlot } = GROUP_TO_R32[group];

          const firstMatch = newKnockout[firstSlot.matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "", wentToET: false, etHomeScore: "", etAwayScore: "", wentToPens: false, penWinner: "" };
          newKnockout[firstSlot.matchId] = { ...firstMatch, [firstSlot.role === "home" ? "homeTeam" : "awayTeam"]: first };

          const secondMatch = newKnockout[secondSlot.matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "", wentToET: false, etHomeScore: "", etAwayScore: "", wentToPens: false, penWinner: "" };
          newKnockout[secondSlot.matchId] = { ...secondMatch, [secondSlot.role === "home" ? "homeTeam" : "awayTeam"]: second };
        }
      }

      return { ...s, results: { ...s.results, group: newGroup, knockout: newKnockout } };
    });
  };

  const updateKnockoutResult = (matchId: string, field: string, value: string | boolean) => {
    const isScore = ["homeScore", "awayScore", "etHomeScore", "etAwayScore"].includes(field);
    const v = isScore && typeof value === "string" ? value.replace(/\D/g, "").slice(0, 2) : value;
    let current = localState.results.knockout[matchId] || { ...EMPTY_KO_RESULT };
    // If this is the first edit and team names aren't set yet, pre-fill from R32 placeholder
    if (!current.homeTeam && !current.awayTeam) {
      const match = (KNOCKOUT_MATCHES.r32 || []).find(m => m.id === matchId);
      if (match?.placeholder?.includes(" vs ")) {
        const [ph, pa] = match.placeholder.split(" vs ");
        current = { ...current, homeTeam: ph, awayTeam: pa };
      }
    }
    const updated = { ...current, [field]: v };

    const newKnockout = { ...localState.results.knockout, [matchId]: updated };

    // Auto-populate next round: determine winner based on pens > ET > normal time
    for (const [nextMatchId, feedMatches] of Object.entries(BRACKET_PROGRESSION)) {
      const feedList = feedMatches.split(",");
      if (!feedList.includes(matchId)) continue;
      const nextMatch = newKnockout[nextMatchId] || { ...EMPTY_KO_RESULT };
      let winner = "";
      if (updated.wentToPens && updated.penWinner) {
        winner = updated.penWinner;
      } else if (updated.wentToET) {
        const h = parseInt(updated.etHomeScore), a = parseInt(updated.etAwayScore);
        if (!isNaN(h) && !isNaN(a) && h !== a) winner = h > a ? updated.homeTeam : updated.awayTeam;
      } else {
        const h = parseInt(updated.homeScore), a = parseInt(updated.awayScore);
        if (!isNaN(h) && !isNaN(a) && updated.homeTeam && updated.awayTeam) {
          winner = h > a ? updated.homeTeam : a > h ? updated.awayTeam : "";
        }
      }
      if (winner) {
        const isFirstFeed = feedList[0] === matchId;
        newKnockout[nextMatchId] = { ...nextMatch, homeTeam: isFirstFeed ? winner : nextMatch.homeTeam, awayTeam: !isFirstFeed ? winner : nextMatch.awayTeam };
      }
    }

    setLocalState(s => ({ ...s, results: { ...s.results, knockout: newKnockout } }));
  };

  const saveResults = async () => {
    setSaving(true);
    await saveAdminState(localState);
    onUpdate(localState);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addStat = async () => {
    if (!newStat.playerName || !newStat.country) return;
    const stat: PlayerStat = {
      id: `${newStat.playerName}-${newStat.round}-${Date.now()}`,
      playerName: newStat.playerName, country: newStat.country,
      goals: parseInt(newStat.goals) || 0, assists: parseInt(newStat.assists) || 0,
      cleanSheets: parseInt(newStat.cleanSheets) || 0, yellowCards: parseInt(newStat.yellowCards) || 0,
      redCards: parseInt(newStat.redCards) || 0, saves: parseInt(newStat.saves) || 0,
      minutesPlayed: parseInt(newStat.minutesPlayed) || 0, ownGoals: 0, round: newStat.round,
    };
    try {
      await savePlayerStat(stat);
      getAllPlayerStats().then(freshStats => {
        setStats(freshStats);
        const saved = freshStats.find(s => s.playerName === stat.playerName);
        if (!saved) alert(`⚠️ Save may have failed — ${stat.playerName} not found after save. Check browser console for errors.`);
      });
      setNewStat({ ...newStat, playerName: "", country: "", goals: "0", assists: "0", cleanSheets: "0", yellowCards: "0", redCards: "0", saves: "0", minutesPlayed: "90" });
    } catch (e) {
      alert(`Save failed: ${e}`);
    }
  };

  const removeStat = async (id: string) => {
    await deletePlayerStat(id);
    setStats(stats.filter(s => s.id !== id));
  };


  const EMPTY_KO_RESULT = { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "", wentToET: false, etHomeScore: "", etAwayScore: "", wentToPens: false, penWinner: "" };
  const knockoutRoundTabs: { id: "r32" | "r16" | "qf" | "sf" | "final"; label: string }[] = [
    { id: "r32", label: "Round of 32" }, { id: "r16", label: "Last 16" },
    { id: "qf", label: "Quarters" }, { id: "sf", label: "Semis" }, { id: "final", label: "Final" },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>⚙️ Admin Panel</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {saved && <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>✓ Saved</span>}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button className={activeSection === "results" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("results")}>📊 Match Results</button>
        <button className={activeSection === "stats" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("stats")}>👕 Player Stats</button>
        <button className={activeSection === "form" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("form")}>📋 Team Form</button>
        <button className={activeSection === "users" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("users")}>👥 Users ({users.length})</button>
        <button className={activeSection === "leagues" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("leagues")}>🏆 Leagues</button>
        <button className={activeSection === "autofill" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("autofill")}>⚡ Auto-fill</button>
      </div>

      {activeSection === "results" && (
        <div>
          {/* Lock Controls */}
          <div className="card" style={{ padding: "18px", marginBottom: "16px", borderColor: localState.predictionsLocked ? "#fca5a5" : "#bbf7d0", background: localState.predictionsLocked ? "#fef2f2" : "#f0fdf4" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: localState.predictionsLocked ? "var(--red)" : "var(--green)" }}>
                  {localState.predictionsLocked ? "🔒 Predictions Locked" : "🔓 Predictions Open"}
                </p>
                <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
                  {localState.predictionsLocked
                    ? "Players cannot edit their predictions."
                    : "Players can still change their predictions."}
                </p>
              </div>
              <button
                className={localState.predictionsLocked ? "btn-secondary" : "btn-primary"}
                onClick={() => setLocalState({ ...localState, predictionsLocked: !localState.predictionsLocked })}
                style={{ background: localState.predictionsLocked ? undefined : "var(--red)", borderColor: localState.predictionsLocked ? undefined : "var(--red)" }}
              >
                {localState.predictionsLocked ? "🔓 Unlock Predictions" : "🔒 Lock All Predictions Now"}
              </button>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid var(--border)" }}>
              <label className="label">Auto-lock date & time (UK time)</label>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <input
                  type="datetime-local"
                  value={localState.lockTime ? new Date(localState.lockTime).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setLocalState({ ...localState, lockTime: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  style={{ flex: 1 }}
                />
                {localState.lockTime && (
                  <button className="btn-ghost" onClick={() => setLocalState({ ...localState, lockTime: null })} style={{ color: "var(--red)", flexShrink: 0 }}>Clear</button>
                )}
              </div>
              <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "4px" }}>
                Tournament starts 11 Jun 2026 · 20:00 BST. Set this to lock automatically at kick-off.
              </p>
            </div>
          </div>

          {/* Fantasy Squad Lock */}
          <div className="card" style={{ padding: "18px", marginBottom: "16px", borderColor: "#dbeafe", background: adminState.fantasyLocked ? "#f0fdf4" : "#eff6ff" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: adminState.fantasyLocked ? "var(--green)" : "#1e40af" }}>
                  👕 Fantasy Squad Lock {adminState.fantasyLocked ? "— 🔒 LOCKED" : ""}
                </p>
                {adminState.fantasyLocked
                  ? <p style={{ fontSize: "12px", color: "var(--green)", marginTop: "2px" }}>Squads are locked. Only players with incomplete squads can still edit.</p>
                  : <p style={{ fontSize: "12px", color: "#3730a3", marginTop: "2px" }}>
                      Locks all complete squads (11 players). Players with fewer than 11 can still edit.
                      {" "}Currently: {Object.values(userFantasySquads).filter(s => s.length >= 11).length} complete, {Object.values(userFantasySquads).filter(s => s.length < 11).length} incomplete.
                    </p>
                }
              </div>
              <button
                className="btn-secondary"
                style={{ background: adminState.fantasyLocked ? "#ef4444" : "#1d4ed8", borderColor: adminState.fantasyLocked ? "#ef4444" : "#1d4ed8", color: "white", flexShrink: 0 }}
                onClick={async () => {
                  const newLocked = !adminState.fantasyLocked;
                  if (newLocked && !confirm(`Lock all complete fantasy squads? Players with 11 picks can no longer change them.`)) return;
                  const updated = { ...adminState, fantasyLocked: newLocked };
                  await saveAdminState(updated);
                  onUpdate(updated);
                }}
              >
                {adminState.fantasyLocked ? "🔓 Unlock Squads" : "🔒 Lock Fantasy Squads"}
              </button>
            </div>
          </div>

          {/* Bonus Predictions Lock */}
          <div className="card" style={{ padding: "18px", marginBottom: "16px", borderColor: "#fde68a", background: adminState.bonusLocked ? "#f0fdf4" : "#fffbeb" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "14px", color: adminState.bonusLocked ? "var(--green)" : "#92400e" }}>
                  🏆 Bonus Predictions Lock {adminState.bonusLocked ? "— 🔒 LOCKED" : ""}
                </p>
                {adminState.bonusLocked
                  ? <p style={{ fontSize: "12px", color: "var(--green)", marginTop: "2px" }}>
                      Bonus picks (Golden Boot, Top Assist, Winner, POTT) are locked. Only filled-in picks are locked — empty ones can still be entered.
                    </p>
                  : (() => {
                      const filled = users.filter(u => u.topScorer || u.topAssist || u.tournamentWinner || u.playerOfTournament).length;
                      const allFilled = users.filter(u => u.topScorer && u.topAssist && u.tournamentWinner && u.playerOfTournament).length;
                      return <p style={{ fontSize: "12px", color: "#92400e", marginTop: "2px" }}>
                        Locks Golden Boot, Top Assist, Tournament Winner, Player of Tournament.
                        {" "}{allFilled}/{users.length} players fully completed, {filled}/{users.length} have at least one.
                      </p>;
                    })()
                }
              </div>
              <button
                className="btn-secondary"
                style={{ background: adminState.bonusLocked ? "#22c55e" : "#f59e0b", borderColor: adminState.bonusLocked ? "#22c55e" : "#f59e0b", color: "white", flexShrink: 0 }}
                onClick={async () => {
                  const newLocked = !adminState.bonusLocked;
                  if (newLocked && !confirm("Lock all bonus predictions? Players who have filled them in can't change them. Empty picks can still be entered.")) return;
                  const updated = { ...adminState, bonusLocked: newLocked };
                  await saveAdminState(updated);
                  onUpdate(updated);
                }}
              >
                {adminState.bonusLocked ? "🔓 Unlock Bonus Picks" : "🔒 Lock Bonus Picks"}
              </button>
            </div>
          </div>

          {/* Data Repair — fix knockout predictions missing homeTeam/awayTeam */}
          <div className="card" style={{ padding: "14px 16px", marginBottom: "16px", borderLeft: "3px solid #ef4444" }}>
            <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>🔧 Repair Knockout Predictions</p>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "8px" }}>Fixes missing homeTeam/awayTeam in saved knockout predictions — required for correct qualifier scoring. Safe to run multiple times.</p>
            <button className="btn-secondary" style={{ fontSize: "12px" }} onClick={async () => {
              // Build team name lookup from R32 placeholders + later round admin results
              const teamLookup: Record<string, { home: string; away: string }> = {};
              for (const m of (KNOCKOUT_MATCHES.r32 || [])) {
                if (m.placeholder?.includes(" vs ")) {
                  const [h, a] = m.placeholder.split(" vs ");
                  teamLookup[m.id] = { home: h, away: a };
                }
              }
              // Later rounds from admin results
              for (const [id, r] of Object.entries(adminState.results.knockout || {})) {
                if (r.homeTeam && r.awayTeam) teamLookup[id] = { home: r.homeTeam, away: r.awayTeam };
              }

              let fixed = 0, players = 0;
              for (const u of users) {
                const preds = u.knockoutPredictions || {};
                let changed = false;
                const newPreds = { ...preds };
                for (const [matchId, pred] of Object.entries(preds)) {
                  const teams = teamLookup[matchId];
                  if (!teams) continue;
                  if (!pred.homeTeam || !pred.awayTeam) {
                    newPreds[matchId] = { ...pred, homeTeam: pred.homeTeam || teams.home, awayTeam: pred.awayTeam || teams.away };
                    fixed++;
                    changed = true;
                  }
                }
                if (changed) {
                  const updated = { ...u, knockoutPredictions: newPreds };
                  await savePlayer(updated);
                  setUsers(prev => prev.map(p => p.id === u.id ? updated : p));
                  players++;
                }
              }
              alert(`✅ Repaired ${fixed} prediction(s) across ${players} player(s).`);
            }}>🔧 Run Repair</button>
          </div>

          {/* Broadcast Message */}
          <div className="card" style={{ padding: "14px 16px", marginBottom: "16px" }}>
            <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px" }}>📢 Broadcast to Chat</p>
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "8px" }}>Send a message to all leagues simultaneously from admin</p>
            {[
              "🚨 The Round of 32 has started! Head to the Knockouts tab to enter your predictions NOW before matches kick off!",
              "🔒 Bonus predictions (Golden Boot, Top Assist, Winner, Player of Tournament) are now locked!",
              "👕 Fantasy squad selections are now locked — no more changes!",
            ].map(msg => (
              <button key={msg} className="btn-secondary" style={{ display: "block", width: "100%", textAlign: "left", marginBottom: "6px", fontSize: "12px", padding: "8px 10px" }}
                onClick={async () => {
                  if (!confirm(`Send to all leagues: "${msg.substring(0,60)}..."`)) return;
                  // Send to all known league IDs + no league
                  const leagues = await getAllLeagues();
                  for (const l of leagues) {
                    await sendMessage(currentPlayerId, `📢 ${msg}`, "", "", l.id);
                  }
                  alert("Sent!");
                }}>
                {msg.substring(0, 80)}…
              </button>
            ))}
          </div>

          {/* Awards */}
          <div className="card" style={{ padding: "18px", marginBottom: "20px" }}>
            <p style={{ fontWeight: 700, marginBottom: "14px" }}>Tournament Awards</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <FlagSelect label="⚽ Golden Boot Winner (+15pts)" value={localState.topScorer} onChange={(v) => setLocalState({ ...localState, topScorer: v })} />
              <FlagSelect label="🎯 Top Assist Winner (+10pts)" value={localState.topAssist} onChange={(v) => setLocalState({ ...localState, topAssist: v })} />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "14px" }}>
              <div>
                <label className="label">🏆 Tournament Winner (+25pts)</label>
                <div style={{ position: "relative" }}>
                  <select
                    value={localState.tournamentWinner || ""}
                    onChange={e => setLocalState({ ...localState, tournamentWinner: e.target.value })}
                    style={{ paddingLeft: localState.tournamentWinner ? "36px" : "12px" }}
                  >
                    <option value="">-- Not decided yet --</option>
                    {Object.values(GROUPS).flat().map(t => t.team).sort().map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  {localState.tournamentWinner && (
                    <div style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <Flag country={localState.tournamentWinner} size={18} />
                    </div>
                  )}
                </div>
              </div>
              <FlagSelect label="⭐ Player of Tournament (+20pts)" value={localState.playerOfTournament || ""} onChange={(v) => setLocalState({ ...localState, playerOfTournament: v })} />
            </div>
          </div>

          {/* Groups / Knockout toggle */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <button className={resultsTab === "groups" ? "btn-primary" : "btn-secondary"} onClick={() => setResultsTab("groups")} style={{ fontSize: "13px", padding: "7px 14px" }}>Group Stage</button>
            <button className={resultsTab === "knockout" ? "btn-primary" : "btn-secondary"} onClick={() => setResultsTab("knockout")} style={{ fontSize: "13px", padding: "7px 14px" }}>Knockout Rounds</button>
          </div>

          {resultsTab === "groups" && (
            <div>
              {/* Group selector */}
              <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
                {Object.keys(GROUPS).map(g => (
                  <button key={g} onClick={() => setActiveGroup(g)} style={{ width: "36px", height: "36px", borderRadius: "6px", border: "1.5px solid", borderColor: activeGroup === g ? "var(--green)" : "var(--border)", background: activeGroup === g ? "var(--green)" : "white", color: activeGroup === g ? "white" : "var(--text)", fontWeight: 700, fontSize: "13px", cursor: "pointer" }}>
                    {g}
                  </button>
                ))}
              </div>

              {/* Matches for selected group */}
              {(() => {
                const groupMatches = GROUP_MATCHES.filter(m => m.group === activeGroup);
                return (
                  <div style={{ display: "grid", gap: "6px" }}>
                    {groupMatches.map((m) => {
                      const res = localState.results.group[m.id];
                      return (
                        <div key={m.id} className="card" style={{ padding: "10px 14px" }}>
                          <div style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px" }}>
                            📅 {m.dateUK} · {m.timeUK} · 🏟️ {m.stadium}, {m.city}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ flex: 1, textAlign: "right", fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px" }}>
                              <Flag country={m.home.team} size={16} /> {m.home.team}
                            </span>
                            <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res?.home ?? ""} onChange={(e) => updateGroupResult(m.id, "home", e.target.value)} style={{ fontSize: "14px" }} />
                            <span style={{ color: "var(--text-3)", fontSize: "12px" }}>–</span>
                            <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res?.away ?? ""} onChange={(e) => updateGroupResult(m.id, "away", e.target.value)} style={{ fontSize: "14px" }} />
                            <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                              <Flag country={m.away.team} size={16} /> {m.away.team}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}

          {resultsTab === "knockout" && (
            <div>
              <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "16px", overflowX: "auto" }}>
                {knockoutRoundTabs.map((r) => <button key={r.id} className={`tab ${activeKnockoutRound === r.id ? "active" : ""}`} onClick={() => setActiveKnockoutRound(r.id)}>{r.label}</button>)}
              </div>
              <div className="card" style={{ padding: "12px 14px", marginBottom: "12px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                <p style={{ fontSize: "12px", color: "#166534" }}>
                  💡 When you enter the score and teams for a match, the winner automatically fills into the next round.
                </p>
              </div>
              <div style={{ display: "grid", gap: "8px" }}>
                {KNOCKOUT_MATCHES[activeKnockoutRound].map((match) => {
                  const stored = localState.results.knockout[match.id];
                  // Pre-fill team names from confirmed placeholder whenever they're empty — even if a result record already exists
                  let res = stored ? { ...stored } : { ...EMPTY_KO_RESULT };
                  if ((!res.homeTeam || !res.awayTeam) && match.placeholder?.includes(" vs ")) {
                    const [ph, pa] = match.placeholder.split(" vs ");
                    res = { ...res, homeTeam: res.homeTeam || ph, awayTeam: res.awayTeam || pa };
                  }
                  return (
                    <div key={match.id} className="card" style={{ padding: "14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase" }}>{match.label}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK}</p>
                      </div>

                      {/* Teams + normal time score */}
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                          {res.homeTeam && <Flag country={res.homeTeam} size={16} />}
                          <input type="text" placeholder="Home Team" value={res.homeTeam} onChange={e => updateKnockoutResult(match.id, "homeTeam", e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                        </div>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.homeScore} onChange={e => updateKnockoutResult(match.id, "homeScore", e.target.value)} />
                        <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.awayScore} onChange={e => updateKnockoutResult(match.id, "awayScore", e.target.value)} />
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                          {res.awayTeam && <Flag country={res.awayTeam} size={16} />}
                          <input type="text" placeholder="Away Team" value={res.awayTeam} onChange={e => updateKnockoutResult(match.id, "awayTeam", e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                        </div>
                      </div>

                      {/* ET checkbox */}
                      <div style={{ borderTop: "1px solid var(--border)", paddingTop: "8px" }}>
                        <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", marginBottom: res.wentToET ? "8px" : 0 }}>
                          <input type="checkbox" checked={!!res.wentToET} onChange={e => updateKnockoutResult(match.id, "wentToET", e.target.checked)} style={{ width: 14, height: 14, accentColor: "var(--green)" }} />
                          Went to extra time?
                        </label>
                        {res.wentToET && (
                          <div style={{ paddingLeft: "22px" }}>
                            <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "5px" }}>Score after extra time (cumulative)</p>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                              <span style={{ fontSize: "11px", minWidth: "60px", textAlign: "right", color: "var(--text-2)" }}>{res.homeTeam || "Home"}</span>
                              <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.etHomeScore} onChange={e => updateKnockoutResult(match.id, "etHomeScore", e.target.value)} />
                              <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                              <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.etAwayScore} onChange={e => updateKnockoutResult(match.id, "etAwayScore", e.target.value)} />
                              <span style={{ fontSize: "11px", color: "var(--text-2)" }}>{res.awayTeam || "Away"}</span>
                            </div>
                            <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "12px", marginBottom: res.wentToPens ? "8px" : 0 }}>
                              <input type="checkbox" checked={!!res.wentToPens} onChange={e => updateKnockoutResult(match.id, "wentToPens", e.target.checked)} style={{ width: 14, height: 14, accentColor: "var(--green)" }} />
                              Went to penalties?
                            </label>
                            {res.wentToPens && (
                              <div style={{ paddingLeft: "22px" }}>
                                <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "5px" }}>Penalty winner</p>
                                <select value={res.penWinner} onChange={e => updateKnockoutResult(match.id, "penWinner", e.target.value)} style={{ fontSize: "12px", padding: "6px 8px" }}>
                                  <option value="">-- Select winner --</option>
                                  {[res.homeTeam, res.awayTeam].filter(Boolean).map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button className="btn-primary" onClick={saveResults} disabled={saving}>{saving ? "Saving..." : "💾 Save All Results"}</button>
          </div>
        </div>
      )}

      {activeSection === "stats" && (
        <div>
          {/* ── Squad Players List ── */}
          <div className="card" style={{ padding: "14px 16px", marginBottom: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "13px" }}>👕 Fantasy Squad Selections</p>
                <p style={{ fontSize: "11px", color: "var(--text-3)" }}>All players picked by at least one user</p>
              </div>
              <button className="btn-secondary" style={{ fontSize: "12px" }} onClick={() => {
                const map: Record<string, { country: string; position: string; pickedBy: string[] }> = {};
                users.forEach(u => {
                  const squad = userFantasySquads[u.id] || [];
                  squad.forEach(playerName => {
                    if (!map[playerName]) {
                      let country = "Unknown", position = "FWD";
                      for (const [c, { players }] of Object.entries(SQUADS)) {
                        const p = (players as {name:string;position:string}[]).find(p => p.name === playerName);
                        if (p) { country = c; position = p.position; break; }
                      }
                      map[playerName] = { country, position, pickedBy: [] };
                    }
                    map[playerName].pickedBy.push(u.name);
                  });
                });
                setSquadPlayers(Object.entries(map).map(([name, v]) => ({ name, ...v })).sort((a,b) => b.pickedBy.length - a.pickedBy.length));
                setShowSquadList(s => !s);
              }}>{showSquadList ? "Hide" : `Show ${(() => { const s=new Set<string>(); users.forEach(u=>(userFantasySquads[u.id]||[]).forEach(n=>s.add(n))); return s.size; })()} players`}</button>
            </div>
            {showSquadList && squadPlayers.length > 0 && (
              <div style={{ marginTop: "12px", overflowX: "auto" }}>
                {/* Unknown / unmatched players warning */}
                {(() => {
                  const unknowns = squadPlayers.filter(p => p.country === "Unknown");
                  if (!unknowns.length) return null;
                  return (
                    <div style={{ marginBottom: "10px", padding: "10px 12px", background: "#fef9c3", borderRadius: "8px", border: "1px solid #fde047" }}>
                      <p style={{ fontWeight: 700, fontSize: "12px", color: "#92400e", marginBottom: "6px" }}>⚠️ {unknowns.length} unrecognised player{unknowns.length!==1?"s":""} — not in SQUADS data</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                        {unknowns.map(p => (
                          <span key={p.name} style={{ fontSize: "11px", background: "#fef3c7", border: "1px solid #f59e0b", borderRadius: "99px", padding: "2px 8px" }}>
                            {p.name} <span style={{ color: "#92400e" }}>({p.pickedBy.join(", ")})</span>
                          </span>
                        ))}
                      </div>
                      <p style={{ fontSize: "11px", color: "#92400e", marginTop: "6px" }}>These names don't match any player in the master squad list. They may be typos or duplicates. Go to Admin → Users → View → Fantasy Squad to fix a specific user's picks.</p>
                    </div>
                  );
                })()}
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                  <thead>
                    <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--surface2)" }}>
                      <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700, color: "var(--text-2)" }}>Player</th>
                      <th style={{ padding: "6px 10px", textAlign: "left", fontWeight: 700, color: "var(--text-2)" }}>Country</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)" }}>Pos</th>
                      <th style={{ padding: "6px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)" }}>Picked by</th>
                    </tr>
                  </thead>
                  <tbody>
                    {squadPlayers.map(p => (
                      <tr key={p.name} style={{ borderBottom: "1px solid var(--border)", background: p.country === "Unknown" ? "#fffbeb" : "transparent" }}>
                        <td style={{ padding: "6px 10px", fontWeight: 600 }}>
                          {p.name}
                          {p.country === "Unknown" && <span style={{ fontSize: "9px", color: "#92400e", marginLeft: "4px" }}>⚠️</span>}
                        </td>
                        <td style={{ padding: "6px 10px", color: p.country === "Unknown" ? "#92400e" : "var(--text-2)" }}>{p.country}</td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <span style={{ fontSize: "10px", fontWeight: 700, padding: "1px 5px", borderRadius: "3px", background: ({GK:"#fef3c7",DEF:"#dbeafe",MID:"#dcfce7",FWD:"#fee2e2"} as Record<string,string>)[p.position]||"var(--surface2)", color: ({GK:"#92400e",DEF:"#1e40af",MID:"#166534",FWD:"#991b1b"} as Record<string,string>)[p.position]||"var(--text)" }}>{p.position}</span>
                        </td>
                        <td style={{ padding: "6px 8px", textAlign: "center" }}>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: "var(--green)" }}>{p.pickedBy.length}</span>
                          <span style={{ fontSize: "10px", color: "var(--text-3)", marginLeft: "4px" }}>({p.pickedBy.join(", ")})</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Fetch from API-Football ── */}
          <div className="card" style={{ padding: "14px 16px", marginBottom: "16px", borderLeft: "3px solid #3b82f6" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "13px" }}>⚡ Import Stats from API-Football</p>
                <p style={{ fontSize: "11px", color: "var(--text-3)" }}>Goals auto-fetched · edit assists/cards inline · squad picks only</p>
              </div>
              <button className="btn-primary" style={{ fontSize: "12px", flexShrink: 0 }} disabled={fetchingStats} onClick={async () => {
                setFetchingStats(true); setFetchedStats(null);
                const API_KEY = "9a8fadd79ce9721d14754b6f6551195b";
                const NAME_MAP: Record<string, string> = {
                  "Julián Quiñones":"Julian Quinones","Raúl Jiménez":"Raul Jimenez",
                  "Hwang In-Beom":"Hwang Inbeom","Oh Hyeon-Gyu":"Oh Hyeongyu",
                  "Ladislav Krejcí":"Ladislav Krejci","Jovo Lukić":"Jovo Lukic",
                  "Vinícius Júnior":"Vinicius Jr","Giovanni Reyna":"Gio Reyna",
                  "Viktor Gyökeres":"Viktor Gyokeres","Damián Bobadilla":"Damian Bobadilla",
                };
                const squadSet = new Set<string>();
                users.forEach(u => (userFantasySquads[u.id]||[]).forEach(n => squadSet.add(n)));

                type P = { goals:number; assists:number; yellowCards:number; redCards:number; minutesPlayed:number; country:string };
                const playerMap: Record<string, P> = {};
                const extractName = (raw: string) => NAME_MAP[raw] || raw;

                const addToMap = (name: string, country: string, g: number, a: number, y: number, r: number, mins: number) => {
                  if (!playerMap[name]) playerMap[name] = { goals:0, assists:0, yellowCards:0, redCards:0, minutesPlayed:0, country };
                  playerMap[name].goals += g;
                  playerMap[name].assists += a;
                  playerMap[name].yellowCards += y;
                  playerMap[name].redCards += r;
                  playerMap[name].minutesPlayed += mins;
                };

                try {
                  // Step 1: Get completed WC 2026 fixture IDs from API-Football
                  const fixtRes = await fetch(
                    "https://v3.football.api-sports.io/fixtures?league=1&season=2026&status=FT",
                    { headers: { "x-apisports-key": API_KEY } }
                  );
                  const fixtData = await fixtRes.json();
                  const fixtureIds: number[] = (fixtData.response || []).map((f: {fixture:{id:number}}) => f.fixture.id);

                  if (fixtureIds.length > 0) {
                    // Step 2: Fetch player stats per fixture
                    for (const fid of fixtureIds) {
                      const pRes = await fetch(
                        `https://v3.football.api-sports.io/fixtures/players?fixture=${fid}`,
                        { headers: { "x-apisports-key": API_KEY } }
                      );
                      const pData = await pRes.json();
                      for (const team of (pData.response || [])) {
                        const country = team.team?.name || "";
                        for (const pe of (team.players || [])) {
                          const name = extractName(pe.player?.name || "");
                          const s = pe.statistics?.[0];
                          if (!s) continue;
                          addToMap(name, country,
                            s.goals?.total || 0,
                            s.goals?.assists || 0,
                            s.cards?.yellow || 0,
                            s.cards?.red || 0,
                            s.games?.minutes || 0
                          );
                        }
                      }
                      await new Promise(r => setTimeout(r, 200));
                    }
                  }

                  // Always supplement goals from openfootball (more reliable for goals)
                  const ofRes = await fetch("https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json");
                  const ofData = await ofRes.json();
                  for (const m of ofData.matches || []) {
                    if (!m.score) continue;
                    for (const g of [...(m.goals1||[]),...(m.goals2||[])]) {
                      if (g.name?.includes("(o.g.)")) continue;
                      const name = extractName(g.name.replace(/\s*\(.*\)/,"").trim());
                      if (!playerMap[name]) {
                        const sq = Object.entries(SQUADS).find(([,s]) => (s.players as {name:string}[]).some(p=>p.name===name));
                        playerMap[name] = { goals:0, assists:0, yellowCards:0, redCards:0, minutesPlayed:0, country:sq?.[0]||"" };
                      }
                      // Use max to avoid double-counting if API already has it
                      playerMap[name].goals = Math.max(playerMap[name].goals, (playerMap[name].goals > 0 ? playerMap[name].goals : 0) + (fixtureIds.length === 0 ? 1 : 0));
                      if (fixtureIds.length === 0) playerMap[name].goals += 1;
                    }
                  }
                  // If API had no fixtures, use openfootball goals directly
                  if (fixtureIds.length === 0) {
                    for (const m of ofData.matches || []) {
                      if (!m.score) continue;
                      for (const g of [...(m.goals1||[]),...(m.goals2||[])]) {
                        if (g.name?.includes("(o.g.)")) continue;
                        const name = extractName(g.name.replace(/\s*\(.*\)/,"").trim());
                        addToMap(name, "", 1, 0, 0, 0, 0);
                      }
                    }
                  }

                  // Build results filtered to squad picks only
                  const results = Object.entries(playerMap)
                    .filter(([name]) => squadSet.has(name))
                    .map(([name, p]) => {
                      const squadInfo = Object.entries(SQUADS).find(([,s]) => (s.players as {name:string}[]).some(pl=>pl.name===name));
                      const existing = stats.find(s => s.playerName === name);
                      return {
                        name, country: squadInfo?.[0]||p.country,
                        goals: p.goals,
                        assists: p.assists || existing?.assists || 0,
                        yellowCards: p.yellowCards || existing?.yellowCards || 0,
                        redCards: p.redCards || existing?.redCards || 0,
                        minutesPlayed: p.minutesPlayed || existing?.minutesPlayed || 0,
                        approved: !!squadInfo,
                        noMatch: !squadInfo,
                      };
                    })
                    .filter(p => p.goals>0||p.assists>0||p.yellowCards>0||p.minutesPlayed>0)
                    .sort((a,b) => b.goals-a.goals||b.assists-a.assists||b.yellowCards-a.yellowCards);

                  setFetchedStats(results.length > 0 ? results : null);
                  if (results.length === 0) alert("No stats found for squad picks. API may have returned no data — try again or use openfootball fallback.");
                } catch(e) { alert("Fetch failed — check console."); console.error(e); }
                setFetchingStats(false);
              }}>{fetchingStats ? "Fetching..." : "🔄 Fetch Stats"}</button>
            </div>

            {fetchedStats && (
              <div style={{ marginTop: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <p style={{ fontSize: "12px", color: "var(--text-2)" }}>
                    {fetchedStats.filter(s=>s.approved).length} pre-approved (in squads) · {fetchedStats.filter(s=>s.noMatch).length} unrecognised
                  </p>
                  <div style={{ display: "flex", gap: "6px" }}>
                    <button className="btn-ghost" style={{ fontSize: "11px" }} onClick={() => setFetchedStats(prev => prev!.map(s => ({...s, approved: !s.noMatch})))}>Select all</button>
                    <button className="btn-ghost" style={{ fontSize: "11px" }} onClick={() => setFetchedStats(prev => prev!.map(s => ({...s, approved: false})))}>Clear all</button>
                  </div>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--surface2)" }}>
                        <th style={{ padding: "7px 8px", width: 28 }}></th>
                        <th style={{ padding: "7px 10px", textAlign: "left", fontWeight: 700, color: "var(--text-2)" }}>Player</th>
                        <th style={{ padding: "7px 8px", textAlign: "left", fontWeight: 700, color: "var(--text-2)" }}>Country</th>
                        <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "var(--green)" }}>⚽</th>
                        <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "#3b82f6" }}>🅰️</th>
                        <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "#f59e0b" }}>🟨</th>
                        <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "#ef4444" }}>🟥</th>
                        <th style={{ padding: "7px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-3)" }}>Mins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fetchedStats.map((s, i) => (
                        <tr key={s.name} style={{ borderBottom: "1px solid var(--border)", background: s.noMatch ? "#fffbeb" : s.approved ? "var(--green-light)" : "transparent", opacity: s.noMatch ? 0.6 : 1 }}>
                          <td style={{ padding: "6px 8px", textAlign: "center" }}>
                            <input type="checkbox" checked={s.approved} disabled={s.noMatch} onChange={e => setFetchedStats(prev => prev!.map((x,j)=>j===i?{...x,approved:e.target.checked}:x))} />
                          </td>
                          <td style={{ padding: "6px 10px", fontWeight: 600 }}>
                            {s.name}
                            {s.noMatch && <span style={{ fontSize: "9px", color: "#92400e", marginLeft: "4px" }}>⚠️</span>}
                          </td>
                          <td style={{ padding: "6px 10px", color: "var(--text-2)" }}>{s.country}</td>
                          <td style={{ padding: "4px 6px", textAlign: "center", fontWeight: 700, color: "var(--green)" }}>{s.goals}</td>
                          <td style={{ padding: "4px 4px", textAlign: "center" }}>
                            <input type="number" min={0} max={10} value={s.assists} onChange={e => setFetchedStats(prev => prev!.map((x,j)=>j===i?{...x,assists:+e.target.value}:x))} style={{ width:36, textAlign:"center", padding:"2px", fontSize:"12px" }} />
                          </td>
                          <td style={{ padding: "4px 4px", textAlign: "center" }}>
                            <input type="number" min={0} max={3} value={s.yellowCards} onChange={e => setFetchedStats(prev => prev!.map((x,j)=>j===i?{...x,yellowCards:+e.target.value}:x))} style={{ width:36, textAlign:"center", padding:"2px", fontSize:"12px" }} />
                          </td>
                          <td style={{ padding: "4px 4px", textAlign: "center" }}>
                            <input type="number" min={0} max={1} value={s.redCards} onChange={e => setFetchedStats(prev => prev!.map((x,j)=>j===i?{...x,redCards:+e.target.value}:x))} style={{ width:36, textAlign:"center", padding:"2px", fontSize:"12px" }} />
                          </td>
                          <td style={{ padding: "4px 4px", textAlign: "center" }}>
                            <input type="number" min={0} max={120} value={s.minutesPlayed} onChange={e => setFetchedStats(prev => prev!.map((x,j)=>j===i?{...x,minutesPlayed:+e.target.value}:x))} style={{ width:48, textAlign:"center", padding:"2px", fontSize:"12px" }} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div style={{ display: "flex", gap: "8px", marginTop: "10px", alignItems: "center" }}>
                  <button className="btn-primary" style={{ fontSize: "12px" }} onClick={async () => {
                    const toSave = fetchedStats.filter(s => s.approved);
                    for (const s of toSave) {
                      const existing = stats.find(st => st.playerName === s.name);
                      const stat: PlayerStat = {
                        id: existing?.id || `${s.country}-${s.name}`.replace(/[\s\W]/g,"-").toLowerCase(),
                        playerName: s.name, country: s.country,
                        goals: s.goals, assists: s.assists,
                        yellowCards: s.yellowCards, redCards: s.redCards,
                        minutesPlayed: s.minutesPlayed,
                        cleanSheets: existing?.cleanSheets||0, saves: existing?.saves||0,
                        ownGoals: existing?.ownGoals||0, round: "group",
                      };
                      await savePlayerStat(stat);
                    }
                    getAllPlayerStats().then(setStats);
                    setFetchedStats(null);
                    alert(`Saved ${toSave.length} player stats.`);
                  }}>✅ Approve & Save ({fetchedStats.filter(s=>s.approved).length})</button>
                  <button className="btn-ghost" style={{ fontSize: "12px" }} onClick={() => setFetchedStats(null)}>Cancel</button>
                  <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "auto" }}>Saves merge with existing — won't overwrite GK clean sheets/saves</span>
                </div>
              </div>
            )}
          </div>

          {/* Per-match stats entry for squad picks */}
          {(() => {
            // Build squad player map
            const squadMap = new Map<string, { country: string; position: string }>();
            users.forEach(u => {
              (userFantasySquads[u.id] || []).forEach(name => {
                if (!squadMap.has(name)) {
                  let country = "Unknown", position = "FWD";
                  for (const [c, { players }] of Object.entries(SQUADS)) {
                    const p = (players as {name:string;position:string}[]).find(p => p.name === name);
                    if (p) { country = c; position = p.position; break; }
                  }
                  squadMap.set(name, { country, position });
                }
              });
            });
            const squadList = Array.from(squadMap.entries())
              .map(([name, v]) => ({ name, ...v }))
              .sort((a, b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name));
            if (!squadList.length) return null;

            // Get completed matches
            const completedMatches = GROUP_MATCHES.filter(m => {
              const result = adminState.results?.group?.[m.id];
              return result?.home !== undefined;
            });

            return (
              <div className="card" style={{ padding: "14px 16px", marginBottom: "16px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>⚽ Per-Match Player Stats</p>
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "10px" }}>Select a match, then enter stats for each squad player who played. Totals auto-accumulate.</p>

                {/* Match selector */}
                <div style={{ marginBottom: "12px" }}>
                  <label className="label">Select Match</label>
                  <select value={selectedMatchForStats || ""} onChange={e => setSelectedMatchForStats(e.target.value)}
                    style={{ fontSize: "13px", padding: "6px 10px", borderRadius: 6, border: "1px solid var(--border)", width: "100%" }}>
                    <option value="">— pick a match —</option>
                    {GROUP_MATCHES.map(m => {
                      const home = typeof m.home === "string" ? m.home : (m.home as {team:string}).team;
                      const away = typeof m.away === "string" ? m.away : (m.away as {team:string}).team;
                      const hasResult = !!adminState.results?.group?.[m.id];
                      return (
                        <option key={m.id} value={m.id}>
                          {hasResult ? "✓ " : ""}{home} vs {away} ({m.dateUK})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {selectedMatchForStats && (() => {
                  const match = GROUP_MATCHES.find(m => m.id === selectedMatchForStats);
                  if (!match) return null;
                  const homeTeam = typeof match.home === "string" ? match.home : (match.home as {team:string}).team;
                  const awayTeam = typeof match.away === "string" ? match.away : (match.away as {team:string}).team;
                  const matchLabel = `${homeTeam} vs ${awayTeam}`;
                  // Filter squad to players from these two teams
                  const matchPlayers = squadList.filter(p => p.country === homeTeam || p.country === awayTeam);

                  if (!matchPlayers.length) return (
                    <p style={{ fontSize: "12px", color: "var(--text-3)" }}>No fantasy squad players from {homeTeam} or {awayTeam}</p>
                  );

                  return (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                        <thead>
                          <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--surface2)" }}>
                            <th style={{ padding: "6px 8px", textAlign: "left" }}>Player</th>
                            <th style={{ padding: "6px 4px", textAlign: "center", color: "var(--green)" }}>⚽</th>
                            <th style={{ padding: "6px 4px", textAlign: "center", color: "#3b82f6" }}>🅰️</th>
                            <th style={{ padding: "6px 4px", textAlign: "center", color: "#f59e0b" }}>🟨</th>
                            <th style={{ padding: "6px 4px", textAlign: "center", color: "#ef4444" }}>🟥</th>
                            <th style={{ padding: "6px 4px", textAlign: "center" }}>Saves</th>
                            <th style={{ padding: "6px 4px", textAlign: "center" }}>Mins</th>
                            <th style={{ padding: "6px 4px", textAlign: "center" }}>CS</th>
                            <th style={{ padding: "6px 4px", textAlign: "center", color: "#ef4444" }}>OG</th>
                            <th style={{ padding: "6px 4px", width: 40 }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {matchPlayers.map(p => {
                            const matchStat = stats.find(s => s.playerName === p.name && s.matchId === selectedMatchForStats);
                            return (
                              <QuickStatRow key={p.name} player={p} matchStat={matchStat} matchId={selectedMatchForStats} matchLabel={matchLabel} onSave={async (s) => {
                                await savePlayerStat(s);
                                getAllPlayerStats().then(setStats);
                              }} />
                            );
                          })}
                        </tbody>
                      </table>
                      <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "8px" }}>
                        ✓ = saved for this match. Points accumulate across all matches automatically.
                      </p>
                    </div>
                  );
                })()}
              </div>
            );
          })()}

          <div className="card" style={{ padding: "20px", marginBottom: "20px" }}>
            <p style={{ fontWeight: 700, marginBottom: "16px" }}>Add Player Performance</p>
            <div style={{ display: "grid", gap: "12px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div>
                  <label className="label">Country</label>
                  <select value={newStat.country} onChange={e => setNewStat({ ...newStat, country: e.target.value, playerName: "" })}>
                    <option value="">Select country...</option>
                    {Object.keys(SQUADS).sort().map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Player</label>
                  <select value={newStat.playerName} onChange={e => setNewStat({ ...newStat, playerName: e.target.value })} disabled={!newStat.country}>
                    <option value="">Select player...</option>
                    {(newStat.country ? [...SQUADS[newStat.country].players].sort((a,b) => a.name.localeCompare(b.name)) : []).map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">Round</label>
                <select value={newStat.round} onChange={e => setNewStat({ ...newStat, round: e.target.value })}>
                  {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
                {[
                  { key: "goals", label: "Goals" }, { key: "assists", label: "Assists" },
                  { key: "cleanSheets", label: "Clean Sheets" }, { key: "minutesPlayed", label: "Minutes" },
                  { key: "yellowCards", label: "Yellows" }, { key: "redCards", label: "Reds" },
                  { key: "saves", label: "Saves (GK)" },
                ].map(({ key, label }) => (
                  <div key={key}>
                    <label className="label">{label}</label>
                    <input type="number" min="0" value={(newStat as Record<string, string>)[key]} onChange={e => setNewStat({ ...newStat, [key]: e.target.value })} style={{ padding: "7px 8px" }} />
                  </div>
                ))}
              </div>
              <button className="btn-primary" onClick={addStat} disabled={!newStat.playerName}>+ Add Entry</button>
            </div>
          </div>

          <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>Entered Stats ({stats.length})</h3>
          {stats.length === 0 ? (
            <p style={{ color: "var(--text-3)", fontSize: "13px" }}>No stats entered yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "6px" }}>
              {stats.map(s => (
                <div key={s.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Flag country={s.country} size={18} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, fontSize: "13px" }}>{s.playerName}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "6px" }}>{s.round}</span>
                    <div style={{ fontSize: "11px", color: "var(--text-2)", marginTop: "2px", display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {s.goals > 0 && <span>⚽ {s.goals}g</span>}
                      {s.assists > 0 && <span>🎯 {s.assists}a</span>}
                      {s.cleanSheets > 0 && <span>🧤 {s.cleanSheets}cs</span>}
                      {s.yellowCards > 0 && <span>🟨 {s.yellowCards}</span>}
                      {s.redCards > 0 && <span>🟥 {s.redCards}</span>}
                      {s.saves > 0 && <span>✋ {s.saves}sv</span>}
                      <span>⏱ {s.minutesPlayed}min</span>
                    </div>
                  </div>
                  <button onClick={() => removeStat(s.id)} className="btn-ghost" style={{ color: "var(--red)", fontSize: "12px" }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── USERS SECTION ── */}
      {activeSection === "users" && (
        <div>
          {/* User detail modal */}
          {viewingUser && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                <div>
                  <h3 style={{ fontSize: "15px", fontWeight: 700 }}>{viewingUser.name}</h3>
                  <p style={{ fontSize: "12px", color: "var(--text-2)" }}>{viewingUser.teamName} · {viewingUser.email}</p>
                </div>
                <button className="btn-secondary" onClick={() => setViewingUser(null)} style={{ fontSize: "12px" }}>← Back to users</button>
              </div>

              {/* Bonus predictions */}
              <div className="card" style={{ padding: "14px", marginBottom: "12px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>🎯 Bonus Predictions</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "13px" }}>
                  <div><span style={{ color: "var(--text-3)" }}>Golden Boot:</span> <strong>{viewingUser.topScorer || "—"}</strong></div>
                  <div><span style={{ color: "var(--text-3)" }}>Top Assist:</span> <strong>{viewingUser.topAssist || "—"}</strong></div>
                  <div><span style={{ color: "var(--text-3)" }}>Tournament Winner:</span> <strong>{viewingUser.tournamentWinner || "—"}</strong></div>
                  <div><span style={{ color: "var(--text-3)" }}>Player of Tournament:</span> <strong>{viewingUser.playerOfTournament || "—"}</strong></div>
                </div>
              </div>

              {/* Group predictions - editable by admin */}
              <div className="card" style={{ padding: "14px", marginBottom: "12px" }}>
                <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "4px" }}>
                  ⚽ Group Predictions ({Object.keys(viewingUser.groupPredictions).length} of {GROUP_MATCHES.length} matches)
                </p>
                <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "10px" }}>Click any score to override it on behalf of this player.</p>
                {Object.entries(GROUPS).map(([group, teams]) => {
                  const groupMatches = GROUP_MATCHES.filter(m => m.group === group);
                  return (
                    <div key={group} style={{ marginBottom: "10px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", marginBottom: "5px" }}>GROUP {group}</p>
                      {groupMatches.map(m => {
                        const pred = viewingUser.groupPredictions[m.id];
                        const homeTeam = typeof m.home === "string" ? m.home : (m.home as {team: string}).team;
                        const awayTeam = typeof m.away === "string" ? m.away : (m.away as {team: string}).team;
                        const editing = overridePreds[m.id];
                        const isSaving = savingOverride === m.id;
                        const vals = editing || { home: pred?.home ?? "", away: pred?.away ?? "" };
                        return (
                          <div key={m.id} style={{ display: "flex", gap: "6px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
                            <span style={{ flex: 1, textAlign: "right", fontSize: "12px" }}>{homeTeam}</span>
                            <input
                              type="text" inputMode="numeric" maxLength={2}
                              value={vals.home}
                              onChange={e => setOverridePreds(prev => ({ ...prev, [m.id]: { ...vals, home: e.target.value.replace(/[^0-9]/g,"") } }))}
                              style={{ width: 36, textAlign: "center", fontWeight: 800, fontSize: "14px", padding: "3px 2px", border: editing ? "2px solid var(--green)" : "1px solid var(--border)", borderRadius: "4px" }}
                              placeholder="–"
                            />
                            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>–</span>
                            <input
                              type="text" inputMode="numeric" maxLength={2}
                              value={vals.away}
                              onChange={e => setOverridePreds(prev => ({ ...prev, [m.id]: { ...vals, away: e.target.value.replace(/[^0-9]/g,"") } }))}
                              style={{ width: 36, textAlign: "center", fontWeight: 800, fontSize: "14px", padding: "3px 2px", border: editing ? "2px solid var(--green)" : "1px solid var(--border)", borderRadius: "4px" }}
                              placeholder="–"
                            />
                            <span style={{ flex: 1, fontSize: "12px" }}>{awayTeam}</span>
                            {editing && (
                              <button
                                onClick={async () => {
                                  setSavingOverride(m.id);
                                  const updated = { ...viewingUser, groupPredictions: { ...viewingUser.groupPredictions, [m.id]: { home: vals.home, away: vals.away } } };
                                  await savePlayer(updated);
                                  setViewingUser(updated);
                                  setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
                                  setOverridePreds(prev => { const n = {...prev}; delete n[m.id]; return n; });
                                  setSavingOverride(null);
                                }}
                                disabled={isSaving}
                                style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", border: "none", background: "var(--green)", color: "white", cursor: "pointer", flexShrink: 0, fontWeight: 700 }}
                              >{isSaving ? "…" : "✓"}</button>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
                {Object.keys(viewingUser.groupPredictions).length === 0 && (
                  <p style={{ fontSize: "12px", color: "var(--text-3)" }}>No group predictions yet — use the inputs above to add them.</p>
                )}
              </div>


              {/* Knockout Predictions - editable */}
              {(() => {
                const months: Record<string,number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
                const parseKO = (d: string, t: string) => {
                  const [day,mon]=d.split(" "); const [hh,mm]=t.replace(/ BST| GMT/,"").split(":");
                  return new Date(Date.UTC(2026,months[mon],+day,+hh-(t.includes("BST")?1:0),+mm));
                };
                const rounds: {key: "r32"|"r16"|"qf"|"sf"|"final"; label: string}[] = [
                  {key:"r32",label:"Round of 32"},{key:"r16",label:"Round of 16"},
                  {key:"qf",label:"Quarter Finals"},{key:"sf",label:"Semi Finals"},{key:"final",label:"Final"},
                ];
                const koPreds = viewingUser.knockoutPredictions || {};
                const allKoMatches = rounds.flatMap(r => (KNOCKOUT_MATCHES[r.key]||[]).map(m => ({...m, roundLabel: r.label})));
                const now = new Date();
                return (
                  <div className="card" style={{ padding: "14px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <p style={{ fontWeight: 700, fontSize: "13px" }}>
                        ⚔️ Knockout Predictions ({Object.keys(koPreds).length} filled)
                      </p>
                      <button className="btn-secondary" style={{ fontSize: "11px" }} onClick={async () => {
                        if (!confirm(`Auto-fill all missing knockout predictions for ${viewingUser.name} with 1-1?`)) return;
                        const newPreds = { ...koPreds };
                        allKoMatches.forEach(m => {
                          const ph = (m as {placeholder?:string}).placeholder;
                          const home = ph ? ph.split(" vs ")[0] : (m as {homeTeam?:string}).homeTeam || "";
                          const away = ph ? ph.split(" vs ")[1] : (m as {awayTeam?:string}).awayTeam || "";
                          if (home && away && !newPreds[m.id]) {
                            const _koS = [["0","0"],["0","1"],["1","0"],["1","1"],["1","2"],["2","1"]];
                            const _s = _koS[Math.floor(Math.random()*_koS.length)];
                            const _isDraw = _s[0]===_s[1], _b=parseInt(_s[0]);
                            const _etOpts: [number,number][] = [[_b,_b],[_b+1,_b],[_b,_b+1],[_b+1,_b+1]];
                            const [_eh,_ea] = _isDraw ? _etOpts[Math.floor(Math.random()*_etOpts.length)] : [0,0];
                            const _etDraw = _isDraw && _eh===_ea;
                            newPreds[m.id] = {homeTeam:home,awayTeam:away,homeScore:_s[0],awayScore:_s[1],goesToET:_isDraw,etHomeScore:_isDraw?String(_eh):"",etAwayScore:_isDraw?String(_ea):"",goesToPens:_etDraw,penWinner:_etDraw?(Math.random()<0.5?home:away):""};
                          }
                        });
                        const updated = { ...viewingUser, knockoutPredictions: newPreds };
                        await savePlayer(updated);
                        setViewingUser(updated);
                        setUsers(prev => prev.map(u => u.id===updated.id ? updated : u));
                      }}>⚡ Auto-fill all</button>
                    </div>
                    <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "10px" }}>Click scores to override. Only shows matches with confirmed teams.</p>
                    {rounds.map(({key, label}) => {
                      const matches = (KNOCKOUT_MATCHES[key]||[]).filter(m => {
                        const home = (m as {placeholder?:string}).placeholder?.split(" vs ")[0] || (m as {homeTeam?:string}).homeTeam;
                        return !!home;
                      });
                      if (!matches.length) return null;
                      return (
                        <div key={key} style={{ marginBottom: "10px" }}>
                          <p style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", marginBottom: "5px" }}>{label.toUpperCase()}</p>
                          {matches.map(m => {
                            const ph = (m as {placeholder?:string}).placeholder;
                            const homeTeam = ph ? ph.split(" vs ")[0] : (m as {homeTeam?:string}).homeTeam || "TBD";
                            const awayTeam = ph ? ph.split(" vs ")[1] : (m as {awayTeam?:string}).awayTeam || "TBD";
                            const pred = koPreds[m.id];
                            const ko = parseKO(m.dateUK, m.timeUK);
                            const locked = ko <= now;
                            const diffH = Math.round((ko.getTime()-now.getTime())/3600000);
                            const needsAutoFill = !pred && diffH <= 4 && diffH > -120;
                            return (
                              <div key={m.id} style={{ display: "flex", gap: "6px", alignItems: "center", padding: "5px 0", borderBottom: "1px solid var(--border)", background: needsAutoFill ? "#fef9c3" : "transparent" }}>
                                <div style={{ flex: 1, fontSize: "11px", textAlign: "right", color: "var(--text-2)" }}>{homeTeam}</div>
                                <input type="text" inputMode="numeric" maxLength={2}
                                  value={pred?.homeScore ?? ""}
                                  disabled={locked}
                                  onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g,"");
                                    const cur = koPreds[m.id] || {homeTeam,awayTeam,homeScore:"",awayScore:"",goesToET:false,etHomeScore:"",etAwayScore:"",goesToPens:false,penWinner:""};
                                    setViewingUser(u => u ? {...u, knockoutPredictions:{...u.knockoutPredictions,[m.id]:{...cur,homeScore:val}}} : u);
                                  }}
                                  style={{ width:36, textAlign:"center", fontWeight:800, fontSize:"14px", padding:"3px 2px", border:`2px solid ${pred ? "var(--green)" : "var(--border)"}`, borderRadius:"4px" }} />
                                <span style={{ fontSize:"11px", color:"var(--text-3)" }}>–</span>
                                <input type="text" inputMode="numeric" maxLength={2}
                                  value={pred?.awayScore ?? ""}
                                  disabled={locked}
                                  onChange={e => {
                                    const val = e.target.value.replace(/[^0-9]/g,"");
                                    const cur = koPreds[m.id] || {homeTeam,awayTeam,homeScore:"",awayScore:"",goesToET:false,etHomeScore:"",etAwayScore:"",goesToPens:false,penWinner:""};
                                    setViewingUser(u => u ? {...u, knockoutPredictions:{...u.knockoutPredictions,[m.id]:{...cur,awayScore:val}}} : u);
                                  }}
                                  style={{ width:36, textAlign:"center", fontWeight:800, fontSize:"14px", padding:"3px 2px", border:`2px solid ${pred ? "var(--green)" : "var(--border)"}`, borderRadius:"4px" }} />
                                <div style={{ flex:1, fontSize:"11px", color:"var(--text-2)" }}>{awayTeam}</div>
                                {needsAutoFill && <span style={{ fontSize:"9px", color:"#92400e", background:"#fde047", padding:"1px 5px", borderRadius:"3px", flexShrink:0 }}>⚠️ &lt;4h</span>}
                                {(pred || viewingUser.knockoutPredictions[m.id]?.homeScore !== undefined) && (
                                  <button onClick={async () => {
                                    const cur = viewingUser.knockoutPredictions[m.id] || {homeTeam,awayTeam,homeScore:"",awayScore:"",goesToET:false,etHomeScore:"",etAwayScore:"",goesToPens:false,penWinner:""};
                                    const updated = { ...viewingUser, knockoutPredictions: { ...viewingUser.knockoutPredictions, [m.id]: cur } };
                                    await savePlayer(updated);
                                    setUsers(prev => prev.map(u => u.id===updated.id ? updated : u));
                                  }} style={{ fontSize:"11px", padding:"3px 8px", borderRadius:"5px", border:"none", background:"var(--green)", color:"white", cursor:"pointer", flexShrink:0, fontWeight:700 }}>✓</button>
                                )}
                                {!pred && !locked && !(viewingUser.knockoutPredictions[m.id]?.homeScore) && (
                                  <button onClick={async () => {
                                    const _koScores = [["0","0"],["0","1"],["1","0"],["1","1"],["1","2"],["2","1"]];
                                    const _s = _koScores[Math.floor(Math.random()*_koScores.length)];
                                    const _isDraw = _s[0]===_s[1], _b=parseInt(_s[0]);
                                    const _etOpts: [number,number][] = [[_b,_b],[_b+1,_b],[_b,_b+1],[_b+1,_b+1]];
                                    const [_eh,_ea] = _isDraw ? _etOpts[Math.floor(Math.random()*_etOpts.length)] : [0,0];
                                    const _etDraw = _isDraw && _eh===_ea;
                                    const newPred = {homeTeam,awayTeam,homeScore:_s[0],awayScore:_s[1],goesToET:_isDraw,etHomeScore:_isDraw?String(_eh):"",etAwayScore:_isDraw?String(_ea):"",goesToPens:_etDraw,penWinner:_etDraw?(Math.random()<0.5?homeTeam:awayTeam):""};
                                    const updated = { ...viewingUser, knockoutPredictions: { ...viewingUser.knockoutPredictions, [m.id]: newPred } };
                                    await savePlayer(updated);
                                    setViewingUser(updated);
                                    setUsers(prev => prev.map(u => u.id===updated.id ? updated : u));
                                  }} style={{ fontSize:"11px", padding:"3px 8px", borderRadius:"5px", border:"none", background:"#f59e0b", color:"white", cursor:"pointer", flexShrink:0, fontWeight:700 }}>⚡</button>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                  </div>
                );
              })()}

              {/* Fantasy squad - editable */}
              <div className="card" style={{ padding: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                  <p style={{ fontWeight: 700, fontSize: "13px" }}>
                    👕 Fantasy Squad ({(userFantasySquads[viewingUser.id] || []).length}/11 players)
                  </p>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
                  {(userFantasySquads[viewingUser.id] || []).map(name => {
                    const entry = Object.entries(SQUADS).find(([, s]) => s.players.some(p => p.name === name));
                    const pos = entry?.[1]?.players.find(p => p.name === name)?.position;
                    const posColors: Record<string, string> = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#22c55e", FWD: "#ef4444" };
                    const isUnknown = !entry;
                    return (
                      <span key={name} style={{ display: "inline-flex", alignItems: "center", gap: "4px", fontSize: "12px", padding: "3px 8px", borderRadius: "99px", background: isUnknown ? "#fef9c3" : (posColors[pos || "FWD"] + "15"), color: isUnknown ? "#92400e" : posColors[pos || "FWD"], border: `1px solid ${isUnknown ? "#fde047" : (posColors[pos || "FWD"] + "33")}`, fontWeight: 600 }}>
                        {pos && <span style={{ fontSize: "10px", opacity: 0.8 }}>{pos}</span>}
                        {name}
                        {isUnknown && <span style={{ fontSize: "10px" }}>⚠️</span>}
                        <button onClick={async () => {
                          const newSquad = (userFantasySquads[viewingUser.id] || []).filter(n => n !== name);
                          const { supabase } = await import("@/lib/supabase");
                          const { data: existing } = await supabase.from("fantasy_squads").select("squad").eq("player_id", viewingUser.id).single();
                          const fullSquad = (existing?.squad as {name:string;position:string;country:string}[] || []).filter(p => p.name !== name);
                          await supabase.from("fantasy_squads").upsert({ id: viewingUser.id, player_id: viewingUser.id, squad: fullSquad, round: "group", updated_at: new Date().toISOString() });
                          setUserFantasySquads(prev => ({ ...prev, [viewingUser.id]: newSquad }));
                        }} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit", opacity: 0.6, fontSize: "12px", padding: "0", lineHeight: 1 }}>×</button>
                      </span>
                    );
                  })}
                  {(userFantasySquads[viewingUser.id] || []).length === 0 && (
                    <p style={{ fontSize: "12px", color: "var(--text-3)" }}>No fantasy squad picked yet</p>
                  )}
                </div>
                {/* Add player search */}
                {(userFantasySquads[viewingUser.id] || []).length < 11 && (() => {
                  const existing = new Set(userFantasySquads[viewingUser.id] || []);
                  const allPlayers = Object.entries(SQUADS).flatMap(([country, { players }]) =>
                    (players as {name:string;position:string}[]).map(p => ({ name: p.name, position: p.position, country }))
                  ).filter(p => !existing.has(p.name));
                  return (
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "6px" }}>Add player:</p>
                      <select style={{ fontSize: "12px", padding: "4px 8px", borderRadius: "6px", border: "1px solid var(--border)", width: "100%" }}
                        defaultValue=""
                        onChange={async e => {
                          const val = e.target.value;
                          if (!val) return;
                          const [name, position, country] = val.split("|");
                          const newEntry = { name, position, country };
                          const { supabase } = await import("@/lib/supabase");
                          const { data: existing } = await supabase.from("fantasy_squads").select("squad").eq("player_id", viewingUser.id).single();
                          const fullSquad = [...(existing?.squad as {name:string;position:string;country:string}[] || []), newEntry];
                          await supabase.from("fantasy_squads").upsert({ id: viewingUser.id, player_id: viewingUser.id, squad: fullSquad, round: "group", updated_at: new Date().toISOString() });
                          setUserFantasySquads(prev => ({ ...prev, [viewingUser.id]: [...(prev[viewingUser.id] || []), name] }));
                          e.target.value = "";
                        }}>
                        <option value="">— select player to add —</option>
                        {["GK","DEF","MID","FWD"].map(pos => (
                          <optgroup key={pos} label={pos}>
                            {allPlayers.filter(p => p.position === pos).sort((a,b) => a.country.localeCompare(b.country) || a.name.localeCompare(b.name)).map(p => (
                              <option key={p.name} value={`${p.name}|${p.position}|${p.country}`}>{p.name} ({p.country})</option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Users list */}
          {!viewingUser && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <p style={{ fontSize: "13px", color: "var(--text-2)" }}>
                  {users.length} player{users.length !== 1 ? "s" : ""} registered.
                </p>
                <button className="btn-secondary" style={{ fontSize: "12px" }} onClick={async () => {
                  if (!confirm("Auto-fill missing predictions for all players who haven't predicted matches kicking off within 3 hours? Uses random 0-0/0-1/1-0/1-1/1-2/2-1.")) return;
                  const now = new Date();
                  const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
                  let filled = 0;
                  for (const u of users) {
                    const missing = GROUP_MATCHES.filter(m => {
                      if (u.groupPredictions[m.id]) return false;
                      const [day, mon] = m.dateUK.split(" ");
                      const [hh, mm] = m.timeUK.replace(/ BST| GMT/,"").split(":");
                      const isBST = m.timeUK.includes("BST");
                      const ko = new Date(Date.UTC(2026, months[mon], Number(day), Number(hh)-(isBST?1:0), Number(mm)));
                      const diffH = (ko.getTime() - now.getTime()) / 3600000;
                      return diffH <= 3 && diffH > -120; // within 3h before or 2h after
                    });
                    if (!missing.length) continue;
                    const newPreds = { ...u.groupPredictions };
                    const scores = [["0","0"],["0","1"],["1","0"],["1","1"],["1","2"],["2","1"]]; missing.forEach(m => { const s = scores[Math.floor(Math.random()*scores.length)]; newPreds[m.id] = { home: s[0], away: s[1] }; });
                    const updated = { ...u, groupPredictions: newPreds };
                    await savePlayer(updated);
                    setUsers(prev => prev.map(p => p.id === u.id ? updated : p));
                    filled += missing.length;
                  }
                  alert(`Auto-filled ${filled} missing prediction${filled !== 1 ? "s" : ""}.`);
                }}>⚡ Auto-fill missing</button>
              </div>

              {/* Missing predictions alert */}
              {(() => {
                // Count how many R32 matches have confirmed teams (predictable)
                const r32Predictable = (KNOCKOUT_MATCHES.r32 || []).filter(m => m.placeholder?.includes(" vs ")).length;
                const incomplete = users.filter(u => {
                  const gDone = Object.keys(u.groupPredictions).length;
                  const koDone = Object.keys(u.knockoutPredictions || {}).filter(id => {
                    const p = u.knockoutPredictions[id];
                    return p?.homeScore !== undefined && p?.homeScore !== "";
                  }).length;
                  return gDone < GROUP_MATCHES.length || koDone < r32Predictable ||
                    !u.topScorer || !u.tournamentWinner || !u.playerOfTournament;
                });
                if (!incomplete.length) return (
                  <div className="card" style={{ padding: "10px 14px", marginBottom: "12px", borderLeft: "3px solid var(--green)", fontSize: "13px" }}>
                    ✅ All players have completed their predictions!
                  </div>
                );
                return (
                  <div className="card" style={{ padding: "12px 14px", marginBottom: "12px", borderLeft: "3px solid #f59e0b" }}>
                    <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "8px", color: "#92400e" }}>⚠️ Incomplete predictions ({incomplete.length} player{incomplete.length !== 1 ? "s" : ""})</p>
                    <div style={{ display: "grid", gap: "4px" }}>
                      {incomplete.map(u => {
                        const missing: string[] = [];
                        const gDone = Object.keys(u.groupPredictions).length;
                        const koDone = Object.keys(u.knockoutPredictions || {}).filter(id => {
                          const p = u.knockoutPredictions[id];
                          return p?.homeScore !== undefined && p?.homeScore !== "";
                        }).length;
                        if (gDone < GROUP_MATCHES.length) missing.push(`${GROUP_MATCHES.length - gDone} group matches`);
                        if (koDone < r32Predictable) missing.push(`${r32Predictable - koDone} R32 matches`);
                        if (!u.topScorer) missing.push("Golden Boot");
                        if (!u.topAssist) missing.push("Top Assist");
                        if (!u.tournamentWinner) missing.push("Tournament Winner");
                        if (!u.playerOfTournament) missing.push("Player of Tournament");
                        return (
                          <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px" }}>
                            <span style={{ fontWeight: 600, minWidth: "100px" }}>{u.name}</span>
                            <span style={{ color: "var(--text-3)" }}>missing: {missing.join(", ")}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}
              <div style={{ display: "grid", gap: "8px" }}>
                {users.map(u => (
                  <div key={u.id} className="card" style={{ padding: "14px 16px" }}>
                    {editingUser?.id === u.id ? (
                      <div style={{ display: "grid", gap: "10px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                          <div>
                            <label className="label">Name</label>
                            <input value={editingUser.name} onChange={e => setEditingUser({ ...editingUser, name: e.target.value })} />
                          </div>
                          <div>
                            <label className="label">Team Name</label>
                            <input value={editingUser.teamName} onChange={e => setEditingUser({ ...editingUser, teamName: e.target.value })} />
                          </div>
                        </div>
                        <div>
                          <label className="label">Email</label>
                          <input type="email" value={editingUser.email} onChange={e => setEditingUser({ ...editingUser, email: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">Status</label>
                          <input placeholder="e.g. England winning it 🏴󠁧󠁢󠁥󠁮󠁧󠁿" value={editingUser.status || ""} onChange={e => setEditingUser({ ...editingUser, status: e.target.value })} maxLength={80} />
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button className="btn-primary" onClick={async () => {
                            await savePlayer(editingUser);
                            setUsers(users.map(us => us.id === editingUser.id ? editingUser : us));
                            setEditingUser(null);
                          }}>Save</button>
                          <button className="btn-secondary" onClick={() => setEditingUser(null)}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontWeight: 600, fontSize: "14px" }}>{u.name}</p>
                          <p style={{ fontSize: "12px", color: "var(--text-2)" }}>{u.teamName}</p>
                          <div style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "3px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <span>⚽ {u.topScorer || "—"}</span>
                            <span>🎯 {u.topAssist || "—"}</span>
                            <span>🏆 {u.tournamentWinner || "—"}</span>
                            <span>{Object.keys(u.groupPredictions).length}/{GROUP_MATCHES.length} group</span>
                            <span>{Object.keys(u.knockoutPredictions).length} KO preds</span>
                            <span>👕 {(userFantasySquads[u.id] || []).length}/11 squad</span>
                          </div>
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button className="btn-primary" onClick={() => setViewingUser(u)} style={{ fontSize: "12px", padding: "5px 12px" }}>View</button>
                          <button className="btn-secondary" onClick={() => setEditingUser(u)} style={{ fontSize: "12px", padding: "5px 10px" }}>Edit</button>
                          <button className="btn-secondary" style={{ fontSize: "12px", padding: "5px 10px" }} title="Auto-fill missing predictions with random 1-1/2-1/1-2" onClick={async () => {
                            if (!confirm(`Auto-fill ALL missing predictions for ${u.name} with random scores (1-1, 2-1, or 1-2)?`)) return;
                            const scores = [["0","0"],["0","1"],["1","0"],["1","1"],["1","2"],["2","1"]];
                            const newPreds = { ...u.groupPredictions };
                            GROUP_MATCHES.forEach(m => { if (!newPreds[m.id]) { const s = scores[Math.floor(Math.random()*scores.length)]; newPreds[m.id] = { home: s[0], away: s[1] }; } });
                            const updated = { ...u, groupPredictions: newPreds };
                            await savePlayer(updated);
                            setUsers(prev => prev.map(p => p.id === u.id ? updated : p));
                          }}>⚡ Fill</button>
                          <button
                            className="btn-ghost"
                            style={{ color: "var(--red)", fontSize: "12px" }}
                            onClick={async () => {
                              if (!confirm(`Delete ${u.name}? This cannot be undone.`)) return;
                              const { supabase } = await import("@/lib/supabase");
                              await supabase.from("players").delete().eq("id", u.id);
                              setUsers(users.filter(us => us.id !== u.id));
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TEAM FORM SECTION ── */}
      {activeSection === "form" && (
        <div>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>
            Enter the last 5 matches for each team. These show as form badges on match cards and the Teams tab.
          </p>

          {/* Group selector */}
          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
            {Object.keys(GROUPS).map(g => {
              const filled = GROUPS[g].filter(t => teamForms[t.team]?.last5?.length > 0).length;
              return (
                <button key={g} onClick={() => setActiveFormGroup(g)} style={{ width: "40px", height: "40px", borderRadius: "8px", border: "1.5px solid", borderColor: activeFormGroup === g ? "var(--green)" : "var(--border)", background: activeFormGroup === g ? "var(--green)" : "var(--surface)", color: activeFormGroup === g ? "white" : "var(--text)", fontWeight: 700, fontSize: "14px", cursor: "pointer", position: "relative" }}>
                  {g}
                  {filled > 0 && activeFormGroup !== g && (
                    <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--green)", fontSize: 8, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>{filled}</span>
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gap: "10px" }}>
            {GROUPS[activeFormGroup].map(({ team }) => {
              const existing = teamForms[team];
              const isEditing = editingTeam === team;

              const EMPTY_MATCH: FormMatch = { date: "", opponent: "", homeAway: "H", goalsFor: 0, goalsAgainst: 0, result: "W", competition: "" };

              const startEditing = () => {
                setEditingTeam(team);
                const matches = existing?.last5?.length ? [...existing.last5] : Array(5).fill(null).map(() => ({ ...EMPTY_MATCH }));
                // Pad to 5
                while (matches.length < 5) matches.push({ ...EMPTY_MATCH });
                setEditingMatches(matches.slice(0, 5));
              };

              const updateMatch = (i: number, field: keyof FormMatch, value: string | number) => {
                const updated = [...editingMatches];
                updated[i] = { ...updated[i], [field]: value };
                // Auto-calc result from scores
                if (field === "goalsFor" || field === "goalsAgainst") {
                  const gf = field === "goalsFor" ? Number(value) : updated[i].goalsFor;
                  const ga = field === "goalsAgainst" ? Number(value) : updated[i].goalsAgainst;
                  updated[i].result = gf > ga ? "W" : gf < ga ? "L" : "D";
                }
                setEditingMatches(updated);
              };

              const saveForm = async () => {
                const validMatches = editingMatches.filter(m => m.opponent && m.date);
                await saveTeamForm(team, validMatches);
                bustFormCache(team);
                // Refresh all forms so the UI updates immediately
                const updated = await getAllTeamForms();
                setTeamForms(updated);
                setEditingTeam(null);
              };

              const RESULT_COLORS: Record<string, string> = { W: "#16a34a", D: "#ca8a04", L: "#dc2626" };

              return (
                <div key={team} className="card" style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: isEditing ? "14px" : 0 }}>
                    <Flag country={team} size={20} />
                    <span style={{ fontWeight: 700, fontSize: "14px", flex: 1 }}>{team}</span>
                    {/* Show existing form badges */}
                    {!isEditing && existing?.last5?.length > 0 && (
                      <div style={{ display: "flex", gap: "3px" }}>
                        {existing.last5.map((m, i) => (
                          <span key={i} style={{ width: 20, height: 20, borderRadius: "3px", background: RESULT_COLORS[m.result], color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            {m.result}
                          </span>
                        ))}
                      </div>
                    )}
                    {!isEditing && !existing?.last5?.length && (
                      <span style={{ fontSize: "11px", color: "var(--text-3)" }}>No form entered</span>
                    )}
                    {!isEditing && (
                      <button className="btn-secondary" onClick={startEditing} style={{ fontSize: "12px", padding: "5px 10px" }}>
                        {existing?.last5?.length ? "Edit" : "+ Add Form"}
                      </button>
                    )}
                  </div>

                  {isEditing && (
                    <div>
                      <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "10px" }}>Enter matches oldest → newest. Result auto-fills from score.</p>
                      <div style={{ display: "grid", gap: "6px" }}>
                        {editingMatches.map((m, i) => (
                          <div key={i} style={{ display: "grid", gridTemplateColumns: "80px 1fr 60px 32px 12px 32px 60px auto", gap: "5px", alignItems: "center" }}>
                            <input type="date" value={m.date} onChange={e => updateMatch(i, "date", e.target.value)} style={{ fontSize: "11px", padding: "5px 6px" }} />
                            <input type="text" placeholder="Opponent" value={m.opponent} onChange={e => updateMatch(i, "opponent", e.target.value)} style={{ fontSize: "11px", padding: "5px 6px" }} />
                            <input type="text" placeholder="Competition" value={m.competition} onChange={e => updateMatch(i, "competition", e.target.value)} style={{ fontSize: "11px", padding: "5px 6px" }} />
                            <input type="number" min={0} max={20} value={m.goalsFor} onChange={e => updateMatch(i, "goalsFor", parseInt(e.target.value) || 0)} style={{ fontSize: "13px", padding: "5px 4px", textAlign: "center" }} />
                            <span style={{ textAlign: "center", color: "var(--text-3)", fontSize: "12px" }}>–</span>
                            <input type="number" min={0} max={20} value={m.goalsAgainst} onChange={e => updateMatch(i, "goalsAgainst", parseInt(e.target.value) || 0)} style={{ fontSize: "13px", padding: "5px 4px", textAlign: "center" }} />
                            <select value={m.homeAway} onChange={e => updateMatch(i, "homeAway", e.target.value)} style={{ fontSize: "11px", padding: "5px 6px" }}>
                              <option value="H">Home</option>
                              <option value="A">Away</option>
                            </select>
                            <span style={{ width: 22, height: 22, borderRadius: "3px", background: RESULT_COLORS[m.result], color: "white", fontSize: 10, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              {m.result}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                        <button className="btn-primary" onClick={saveForm} style={{ fontSize: "12px" }}>Save</button>
                        <button className="btn-secondary" onClick={() => setEditingTeam(null)} style={{ fontSize: "12px" }}>Cancel</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
      {activeSection === "leagues" && (
        <div>
          <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>
            {allLeagues.length} league{allLeagues.length !== 1 ? "s" : ""} · click Edit to rename or change code · Add Player to assign users manually.
          </p>
          <div style={{ display: "grid", gap: "10px" }}>
            {allLeagues.map(league => {
              const members = users.filter(u => (u.leagueIds || []).includes(league.id));
              const nonMembers = users.filter(u => !(u.leagueIds || []).includes(league.id));
              const isEditing = editingLeague?.id === league.id;
              const isAssigning = assigningLeague === league.id;
              return (
                <div key={league.id} className="card" style={{ padding: "14px 16px" }}>
                  {isEditing ? (
                    <div style={{ display: "grid", gap: "8px" }}>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                        <div>
                          <label className="label">League Name</label>
                          <input value={editingLeague.name} onChange={e => setEditingLeague({ ...editingLeague, name: e.target.value })} />
                        </div>
                        <div>
                          <label className="label">Join Code</label>
                          <input value={editingLeague.code} onChange={e => setEditingLeague({ ...editingLeague, code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 12) })} style={{ textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button className="btn-primary" style={{ fontSize: "12px" }} onClick={async () => {
                          const { supabase } = await import("@/lib/supabase");
                          await supabase.from("leagues").update({ name: editingLeague.name, code: editingLeague.code }).eq("id", league.id);
                          setAllLeagues(prev => prev.map(l => l.id === league.id ? { ...l, name: editingLeague.name, code: editingLeague.code } : l));
                          setEditingLeague(null);
                        }}>Save</button>
                        <button className="btn-secondary" style={{ fontSize: "12px" }} onClick={() => setEditingLeague(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>⚽</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                            <p style={{ fontWeight: 700, fontSize: "15px" }}>{league.name}</p>
                            <span style={{ fontSize: "12px", fontWeight: 800, letterSpacing: "0.08em", color: "var(--green)", background: "var(--green-light)", padding: "1px 7px", borderRadius: "4px" }}>{league.code}</span>
                          </div>
                          <p style={{ fontSize: "12px", color: "var(--text-3)", marginBottom: "8px" }}>
                            {members.length} player{members.length !== 1 ? "s" : ""} · Created {new Date(league.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                          </p>
                          {members.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginBottom: "8px" }}>
                              {members.map(u => (
                                <span key={u.id} style={{ fontSize: "11px", padding: "2px 8px", borderRadius: "99px", background: "var(--surface2)", border: "1px solid var(--border)", display: "flex", alignItems: "center", gap: "4px" }}>
                                  {u.name}
                                  {u.currentLeagueId === league.id && <span style={{ color: "var(--green)" }}>●</span>}
                                  <button onClick={async () => {
                                    if (!confirm(`Remove ${u.name} from ${league.name}?`)) return;
                                    const { supabase } = await import("@/lib/supabase");
                                    const newIds = (u.leagueIds || []).filter(id => id !== league.id);
                                    await supabase.from("players").update({ league_ids: newIds }).eq("id", u.id);
                                    setUsers(prev => prev.map(p => p.id === u.id ? { ...p, leagueIds: newIds } : p));
                                  }} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--red)", fontSize: "12px", padding: "0 2px", lineHeight: 1 }}>×</button>
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                          <button className="btn-secondary" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => setEditingLeague({ id: league.id, name: league.name, code: league.code })}>Edit</button>
                          <button className="btn-secondary" style={{ fontSize: "12px", padding: "4px 10px" }} onClick={() => setAssigningLeague(isAssigning ? null : league.id)}>+ Add Player</button>
                          {nonMembers.length > 0 && (
                            <button className="btn-secondary" style={{ fontSize: "12px", padding: "4px 10px", color: "var(--green)", borderColor: "var(--green)" }} onClick={async () => {
                              if (!confirm(`Add all ${nonMembers.length} unassigned players to ${league.name}?`)) return;
                              const { supabase } = await import("@/lib/supabase");
                              for (const u of nonMembers) {
                                const newIds = [...new Set([...(u.leagueIds || []), league.id])];
                                await supabase.from("players").update({ league_ids: newIds }).eq("id", u.id);
                              }
                              setUsers(prev => prev.map(u => nonMembers.find(nm => nm.id === u.id)
                                ? { ...u, leagueIds: [...new Set([...(u.leagueIds || []), league.id])] }
                                : u
                              ));
                            }}>+ Add All ({nonMembers.length})</button>
                          )}
                          <button className="btn-ghost" style={{ color: "var(--red)", fontSize: "12px" }} onClick={async () => {
                            if (!confirm(`Delete "${league.name}"? Players will lose access.`)) return;
                            const { supabase } = await import("@/lib/supabase");
                            await supabase.from("leagues").delete().eq("id", league.id);
                            setAllLeagues(prev => prev.filter(l => l.id !== league.id));
                          }}>Delete</button>
                        </div>
                      </div>
                      {isAssigning && nonMembers.length > 0 && (
                        <div style={{ marginTop: "10px", padding: "10px", background: "var(--bg)", borderRadius: "8px", border: "1px solid var(--border)" }}>
                          <p style={{ fontSize: "12px", fontWeight: 600, marginBottom: "8px", color: "var(--text-2)" }}>Add player to {league.name}:</p>
                          <div style={{ display: "grid", gap: "4px" }}>
                            {nonMembers.map(u => (
                              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                <span style={{ flex: 1, fontSize: "13px" }}>{u.name}</span>
                                <span style={{ fontSize: "11px", color: "var(--text-3)" }}>{u.teamName}</span>
                                <button className="btn-primary" style={{ fontSize: "11px", padding: "3px 10px" }} onClick={async () => {
                                  const { supabase } = await import("@/lib/supabase");
                                  const newIds = [...new Set([...(u.leagueIds || []), league.id])];
                                  await supabase.from("players").update({ league_ids: newIds }).eq("id", u.id);
                                  setUsers(prev => prev.map(p => p.id === u.id ? { ...p, leagueIds: newIds } : p));
                                }}>Add</button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      {isAssigning && nonMembers.length === 0 && (
                        <p style={{ fontSize: "12px", color: "var(--text-3)", marginTop: "8px" }}>All players are already in this league.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            {allLeagues.length === 0 && (
              <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-3)", fontSize: "13px" }}>
                No leagues yet. Run the migration SQL to create the Original League.
              </div>
            )}
          </div>
        </div>
      )}
      {activeSection === "autofill" && (() => {
        const now = new Date();
        const in96h = new Date(now.getTime() + 96*60*60*1000);
        const months: Record<string,number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
        const parseKO = (d: string, t: string) => {
          const [day,mon]=d.split(" "); const [hh,mm]=t.replace(/ BST| GMT/,"").split(":");
          return new Date(Date.UTC(2026,months[mon],+day,+hh-(t.includes("BST")?1:0),+mm));
        };
        const upcoming = GROUP_MATCHES.filter(m => { const ko=parseKO(m.dateUK,m.timeUK); return ko>=now&&ko<=in96h; });
        const r32Upcoming = (KNOCKOUT_MATCHES.r32||[]).filter(m => { const ko=parseKO(m.dateUK,m.timeUK); return ko>=now&&ko<=in96h; });
        const scores = [["0","0"],["0","1"],["1","0"],["1","1"],["1","2"],["2","1"]];
        const KO_SCORES = [["0","0"],["0","1"],["1","0"],["1","1"],["1","2"],["2","1"]];
        const randScore = () => KO_SCORES[Math.floor(Math.random()*KO_SCORES.length)];
        const makeKOPred = (homeTeam: string, awayTeam: string) => {
          const s = randScore();
          const isDraw = s[0] === s[1];
          if (!isDraw) return { homeTeam, awayTeam, homeScore:s[0], awayScore:s[1], goesToET:false, etHomeScore:"", etAwayScore:"", goesToPens:false, penWinner:"" };
          // Draw — pick ET score (>= FT score, could be same or one more each)
          const base = parseInt(s[0]);
          const etOptions: [number,number][] = [[base,base],[base+1,base],[base,base+1],[base+1,base+1]];
          const [etH,etA] = etOptions[Math.floor(Math.random()*etOptions.length)];
          const etDraw = etH === etA;
          if (!etDraw) return { homeTeam, awayTeam, homeScore:s[0], awayScore:s[1], goesToET:true, etHomeScore:String(etH), etAwayScore:String(etA), goesToPens:false, penWinner:"" };
          // ET draw — goes to pens, pick winner
          const penWinner = Math.random() < 0.5 ? homeTeam : awayTeam;
          return { homeTeam, awayTeam, homeScore:s[0], awayScore:s[1], goesToET:true, etHomeScore:String(etH), etAwayScore:String(etA), goesToPens:true, penWinner };
        };
        return (
          <div>
            <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "12px" }}>
              Matches in the next 96 hours · shows players who haven't predicted · click Auto-fill or fill all at once
            </p>
            {upcoming.length === 0 && r32Upcoming.length === 0 && <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-3)" }}>No matches in next 96 hours</div>}
            <div style={{ display: "grid", gap: "10px" }}>
              {upcoming.map(m => {
                const home = typeof m.home==="string"?m.home:(m.home as {team:string}).team;
                const away = typeof m.away==="string"?m.away:(m.away as {team:string}).team;
                const ko = parseKO(m.dateUK, m.timeUK);
                const diffH = Math.round((ko.getTime()-now.getTime())/3600000);
                const missing = users.filter(u => !u.groupPredictions?.[m.id]);
                const done = users.filter(u => u.groupPredictions?.[m.id]);
                return (
                  <div key={m.id} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${diffH<3?"#ef4444":"#f59e0b"}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                      <div>
                        <p style={{ fontWeight: 700, fontSize: "14px" }}>{home} vs {away}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-3)" }}>Group {m.group} · {m.dateUK} {m.timeUK} · {diffH}h away</p>
                      </div>
                      <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                        <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700 }}>✓ {done.length}</span>
                        {missing.length > 0 && (
                          <button className="btn-primary" style={{ fontSize: "11px", padding: "3px 10px" }} onClick={async () => {
                            if (!confirm(`Auto-fill ${home} vs ${away} for ${missing.length} player(s)?`)) return;
                            for (const u of missing) {
                              const s = scores[Math.floor(Math.random()*scores.length)];
                              const updated = { ...u, groupPredictions: { ...u.groupPredictions, [m.id]: { home: s[0], away: s[1] } } };
                              await savePlayer(updated);
                              setUsers(prev => prev.map(p => p.id===u.id ? updated : p));
                            }
                          }}>⚡ Fill {missing.length} missing</button>
                        )}
                      </div>
                    </div>
                    {missing.length > 0 && (
                      <div>
                        <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Missing:</p>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                          {missing.map(u => (
                            <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "4px", background: "#fee2e2", borderRadius: "99px", padding: "2px 8px", fontSize: "11px" }}>
                              <span>{u.name}</span>
                              <button onClick={async () => {
                                const s = scores[Math.floor(Math.random()*scores.length)];
                                const updated = { ...u, groupPredictions: { ...u.groupPredictions, [m.id]: { home: s[0], away: s[1] } } };
                                await savePlayer(updated);
                                setUsers(prev => prev.map(p => p.id===u.id ? updated : p));
                              }} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontWeight: 700, fontSize: "11px", padding: "0 2px" }}>⚡</button>
                            </div>
                          ))}
                        </div>
                        {done.length > 0 && (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                            {done.map(u => {
                              const pr = u.groupPredictions[m.id];
                              return <span key={u.id} style={{ fontSize: "11px", background: "var(--green-light)", borderRadius: "99px", padding: "2px 8px", color: "var(--green)", fontWeight: 600 }}>{u.name}: {pr.home}-{pr.away}</span>;
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    {missing.length === 0 && <p style={{ fontSize: "11px", color: "var(--green)", fontWeight: 600 }}>✅ All {done.length} players predicted</p>}
                  </div>
                );
              })}
            </div>

            {/* Knockout R32 predictions */}
            <div style={{ marginTop: "20px" }}>
              <p style={{ fontWeight: 700, fontSize: "14px", marginBottom: "4px" }}>⚔️ Round of 32 Predictions</p>
              <p style={{ fontSize: "12px", color: "var(--text-2)", marginBottom: "12px" }}>All R32 matches — shows who hasn't entered knockout predictions yet · autofill uses 1-1 score</p>
              <div style={{ display: "grid", gap: "10px" }}>
                {(KNOCKOUT_MATCHES.r32 || []).sort((a, b) => parseKO(a.dateUK, a.timeUK).getTime() - parseKO(b.dateUK, b.timeUK).getTime()).map(m => {
                  const [home, away] = m.placeholder.split(" vs ");
                  const ko = parseKO(m.dateUK, m.timeUK);
                  const kicked = ko <= now;
                  const diffH = Math.round((ko.getTime() - now.getTime()) / 3600000);
                  const missing = users.filter(u => {
                    const p = u.knockoutPredictions?.[m.id];
                    return !p?.homeScore && !p?.awayScore;
                  });
                  const done = users.filter(u => {
                    const p = u.knockoutPredictions?.[m.id];
                    return p?.homeScore !== undefined && p?.homeScore !== "";
                  });
                  return (
                    <div key={m.id} className="card" style={{ padding: "14px 16px", borderLeft: `3px solid ${kicked ? "#d1d5db" : diffH < 3 ? "#ef4444" : "#3b82f6"}` }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "6px" }}>
                        <div>
                          <p style={{ fontWeight: 700, fontSize: "14px" }}>{home} vs {away}</p>
                          <p style={{ fontSize: "11px", color: "var(--text-3)" }}>R32 · {m.dateUK} {m.timeUK} {kicked ? "· 🔒 Kicked off" : `· ${diffH}h away`}</p>
                        </div>
                        <span style={{ fontSize: "11px", color: "var(--green)", fontWeight: 700, flexShrink: 0 }}>✓ {done.length}</span>
                        {missing.length > 0 && (
                          <button className="btn-primary" style={{ fontSize: "11px", padding: "3px 10px", flexShrink: 0 }}
                            onClick={async () => {
                              if (!confirm(`Auto-fill ${home} vs ${away} for ${missing.length} missing player(s) with 1-1?`)) return;
                              for (const u of missing) {
                                const defaultPred = makeKOPred(home||"", away||"");
                                const updated = { ...u, knockoutPredictions: { ...u.knockoutPredictions, [m.id]: defaultPred } };
                                await savePlayer(updated);
                                setUsers(prev => prev.map(p => p.id===u.id ? updated : p));
                              }
                            }}>⚡ Fill {missing.length}</button>
                        )}
                      </div>
                      {missing.length > 0 ? (
                        <div>
                          <p style={{ fontSize: "11px", color: "var(--text-3)", marginBottom: "4px" }}>Missing ({missing.length}):</p>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px" }}>
                            {missing.map(u => (
                              <div key={u.id} style={{ display: "flex", alignItems: "center", gap: "2px", background: "#fee2e2", borderRadius: "99px", padding: "2px 6px 2px 8px" }}>
                                <span style={{ fontSize: "11px", color: "#991b1b", fontWeight: 600 }}>{u.name}</span>
                                <button onClick={async () => {
                                  const defaultPred = makeKOPred(home||"", away||"");
                                  const updated = { ...u, knockoutPredictions: { ...u.knockoutPredictions, [m.id]: defaultPred } };
                                  await savePlayer(updated);
                                  setUsers(prev => prev.map(p => p.id===u.id ? updated : p));
                                }} style={{ background: "none", border: "none", cursor: "pointer", color: "#991b1b", fontWeight: 700, fontSize: "11px", padding: "0 2px", lineHeight: 1 }}>⚡</button>
                              </div>
                            ))}
                          </div>
                          {done.length > 0 && (
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "4px" }}>
                              {done.map(u => {
                                const p = u.knockoutPredictions[m.id];
                                return <span key={u.id} style={{ fontSize: "11px", background: "var(--green-light)", borderRadius: "99px", padding: "2px 8px", color: "var(--green)", fontWeight: 600 }}>{u.name}: {p.homeScore}–{p.awayScore}</span>;
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <p style={{ fontSize: "11px", color: "var(--green)", fontWeight: 600 }}>✅ All {done.length} players predicted</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}