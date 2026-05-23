"use client";
import { useState, useEffect } from "react";
import { AdminState, PlayerStat } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES, KNOCKOUT_MATCHES, SQUADS, BRACKET_PROGRESSION, GROUP_TO_R32 } from "@/app/data/worldcup";
import { saveAdminState, getAllPlayerStats, savePlayerStat, deletePlayerStat } from "@/lib/storage";
import Flag from "./Flag";
import FlagSelect from "./FlagSelect";

interface Props {
  adminState: AdminState;
  onUpdate: (state: AdminState) => void;
  onClose: () => void;
}

const ADMIN_PASSWORD = "worldcup2026";


const ROUNDS = ["Group Stage", "Round of 32", "Round of 16", "Quarter Finals", "Semi Finals", "Final"];

export default function AdminPanel({ adminState, onUpdate, onClose }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [activeSection, setActiveSection] = useState<"results" | "stats">("results");
  const [activeGroup, setActiveGroup] = useState<string>("A");
  const [activeKnockoutRound, setActiveKnockoutRound] = useState<"r32" | "r16" | "qf" | "sf" | "final">("r32");
  const [localState, setLocalState] = useState<AdminState>(adminState);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [newStat, setNewStat] = useState({ playerName: "", country: "", goals: "0", assists: "0", cleanSheets: "0", yellowCards: "0", redCards: "0", saves: "0", minutesPlayed: "90", round: "Group Stage" });
  const [resultsTab, setResultsTab] = useState<"groups" | "knockout">("groups");

  useEffect(() => {
    if (authenticated) getAllPlayerStats().then(setStats);
  }, [authenticated]);

  const login = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) setAuthenticated(true);
    else setPwError("Wrong password.");
  };

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

          const firstMatch = newKnockout[firstSlot.matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
          newKnockout[firstSlot.matchId] = { ...firstMatch, [firstSlot.role === "home" ? "homeTeam" : "awayTeam"]: first };

          const secondMatch = newKnockout[secondSlot.matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
          newKnockout[secondSlot.matchId] = { ...secondMatch, [secondSlot.role === "home" ? "homeTeam" : "awayTeam"]: second };
        }
      }

      return { ...s, results: { ...s.results, group: newGroup, knockout: newKnockout } };
    });
  };

  const updateKnockoutResult = (matchId: string, field: string, value: string) => {
    const isScore = field === "homeScore" || field === "awayScore";
    const v = isScore ? value.replace(/\D/g, "").slice(0, 2) : value;
    const current = localState.results.knockout[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
    const updated = { ...current, [field]: v };
    
    // Auto-populate next round teams when a winner is entered
    const newKnockout = { ...localState.results.knockout, [matchId]: updated };
    
    // Find if this match feeds into a next round match
    for (const [nextMatchId, feedMatches] of Object.entries(BRACKET_PROGRESSION)) {
      const feedList = feedMatches.split(",");
      if (feedList.includes(matchId)) {
        const nextMatch = newKnockout[nextMatchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
        // Determine winner of this match
        const home = parseInt(updated.homeScore);
        const away = parseInt(updated.awayScore);
        if (!isNaN(home) && !isNaN(away) && updated.homeTeam && updated.awayTeam) {
          const winner = home > away ? updated.homeTeam : away > home ? updated.awayTeam : "";
          if (winner) {
            const isFirstFeed = feedList[0] === matchId;
            newKnockout[nextMatchId] = {
              ...nextMatch,
              homeTeam: isFirstFeed ? winner : nextMatch.homeTeam,
              awayTeam: !isFirstFeed ? winner : nextMatch.awayTeam,
            };
          }
        }
      }
    }

    setLocalState((s) => ({ ...s, results: { ...s.results, knockout: newKnockout } }));
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
      minutesPlayed: parseInt(newStat.minutesPlayed) || 0, round: newStat.round,
    };
    await savePlayerStat(stat);
    setStats([...stats, stat]);
    setNewStat({ ...newStat, playerName: "", country: "", goals: "0", assists: "0", cleanSheets: "0", yellowCards: "0", redCards: "0", saves: "0", minutesPlayed: "90" });
  };

  const removeStat = async (id: string) => {
    await deletePlayerStat(id);
    setStats(stats.filter(s => s.id !== id));
  };

  if (!authenticated) {
    return (
      <div style={{ maxWidth: "360px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, marginBottom: "20px" }}>🔐 Admin Access</h2>
        <form onSubmit={login}>
          <div style={{ display: "grid", gap: "12px" }}>
            <div>
              <label className="label">Password</label>
              <input type="password" placeholder="Enter admin password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            {pwError && <p style={{ color: "var(--red)", fontSize: "13px" }}>{pwError}</p>}
            <div style={{ display: "flex", gap: "8px" }}>
              <button className="btn-primary" type="submit">Enter</button>
              <button className="btn-secondary" type="button" onClick={onClose}>Cancel</button>
            </div>
            <p style={{ fontSize: "11px", color: "var(--text-3)" }}>Default: worldcup2026 — change in AdminPanel.tsx</p>
          </div>
        </form>
      </div>
    );
  }

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
                  const res = localState.results.knockout[match.id] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
                  return (
                    <div key={match.id} className="card" style={{ padding: "12px 14px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                        <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", textTransform: "uppercase" }}>{match.label}</p>
                        <p style={{ fontSize: "11px", color: "var(--text-3)" }}>📅 {match.dateUK} · {match.timeUK} · 🏟️ {match.stadium}</p>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                          {res.homeTeam && <Flag country={res.homeTeam} size={16} />}
                          <input type="text" placeholder="Home Team" value={res.homeTeam} onChange={(e) => updateKnockoutResult(match.id, "homeTeam", e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                        </div>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.homeScore} onChange={(e) => updateKnockoutResult(match.id, "homeScore", e.target.value)} />
                        <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                        <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.awayScore} onChange={(e) => updateKnockoutResult(match.id, "awayScore", e.target.value)} />
                        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: "5px" }}>
                          {res.awayTeam && <Flag country={res.awayTeam} size={16} />}
                          <input type="text" placeholder="Away Team" value={res.awayTeam} onChange={(e) => updateKnockoutResult(match.id, "awayTeam", e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                        </div>
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
                    {(newStat.country ? SQUADS[newStat.country].players.sort() : []).map(p => <option key={p} value={p}>{p}</option>)}
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
    </div>
  );
}
