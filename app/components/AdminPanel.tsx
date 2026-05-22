"use client";
import { useState, useEffect } from "react";
import { AdminState, PlayerStat } from "@/app/data/types";
import { GROUPS, generateGroupMatches, KNOCKOUT_MATCHES, SQUADS } from "@/app/data/worldcup";
import { saveAdminState, getAllPlayerStats, savePlayerStat, deletePlayerStat } from "@/lib/storage";

interface Props {
  adminState: AdminState;
  onUpdate: (state: AdminState) => void;
  onClose: () => void;
}

const ADMIN_PASSWORD = "worldcup2026";

function PlayerPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [selectedCountry, setSelectedCountry] = useState<string>(() => Object.entries(SQUADS).find(([, s]) => s.players.includes(value))?.[0] || "");
  const countries = Object.keys(SQUADS).sort();
  const players = selectedCountry ? SQUADS[selectedCountry].players.sort() : [];
  return (
    <div>
      <label className="label">{label}</label>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
        <select value={selectedCountry} onChange={(e) => { setSelectedCountry(e.target.value); onChange(""); }}>
          <option value="">Country...</option>
          {countries.map((c) => <option key={c} value={c}>{SQUADS[c].flag} {c}</option>)}
        </select>
        <select value={value} onChange={(e) => onChange(e.target.value)} disabled={!selectedCountry}>
          <option value="">Player...</option>
          {players.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
}

const ROUNDS = ["Group Stage", "Round of 16", "Quarter Finals", "Semi Finals", "Final"];

export default function AdminPanel({ adminState, onUpdate, onClose }: Props) {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [pwError, setPwError] = useState("");
  const [activeSection, setActiveSection] = useState<"results" | "stats">("results");
  const [activeRound, setActiveRound] = useState<"group" | "r16" | "qf" | "sf" | "final">("group");
  const [localState, setLocalState] = useState<AdminState>(adminState);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stats, setStats] = useState<PlayerStat[]>([]);
  const [newStat, setNewStat] = useState({ playerName: "", country: "", goals: "0", assists: "0", cleanSheets: "0", yellowCards: "0", redCards: "0", saves: "0", minutesPlayed: "90", round: "Group Stage" });

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
    setLocalState((s) => ({ ...s, results: { ...s.results, group: { ...s.results.group, [matchId]: { home: side === "home" ? v : (s.results.group[matchId]?.home ?? ""), away: side === "away" ? v : (s.results.group[matchId]?.away ?? "") } } } }));
  };

  const updateKnockoutResult = (matchId: string, field: string, value: string) => {
    const isScore = field === "homeScore" || field === "awayScore";
    const v = isScore ? value.replace(/\D/g, "").slice(0, 2) : value;
    const current = localState.results.knockout[matchId] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
    setLocalState((s) => ({ ...s, results: { ...s.results, knockout: { ...s.results.knockout, [matchId]: { ...current, [field]: v } } } }));
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

  const roundTabs = ["group", "r16", "qf", "sf", "final"] as const;
  const roundLabels: Record<string, string> = { group: "Groups", r16: "Last 16", qf: "Quarters", sf: "Semis", final: "Final" };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700 }}>⚙️ Admin Panel</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {saved && <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>✓ Saved</span>}
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>

      {/* Section toggle */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
        <button className={activeSection === "results" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("results")}>📊 Match Results</button>
        <button className={activeSection === "stats" ? "btn-primary" : "btn-secondary"} onClick={() => setActiveSection("stats")}>👕 Player Stats</button>
      </div>

      {/* ── RESULTS SECTION ── */}
      {activeSection === "results" && (
        <div>
          {/* Awards */}
          <div className="card" style={{ padding: "18px", marginBottom: "20px" }}>
            <p style={{ fontWeight: 700, marginBottom: "14px" }}>Tournament Awards</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <PlayerPicker label="⚽ Golden Boot Winner" value={localState.topScorer} onChange={(v) => setLocalState({ ...localState, topScorer: v })} />
              <PlayerPicker label="🎯 Top Assist Winner" value={localState.topAssist} onChange={(v) => setLocalState({ ...localState, topAssist: v })} />
            </div>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "20px", overflowX: "auto" }}>
            {roundTabs.map((r) => <button key={r} className={`tab ${activeRound === r ? "active" : ""}`} onClick={() => setActiveRound(r)}>{roundLabels[r]}</button>)}
          </div>

          {activeRound === "group" && (
            <div>
              {Object.entries(GROUPS).map(([group, teams]) => {
                const matches = generateGroupMatches(group, teams);
                return (
                  <div key={group} style={{ marginBottom: "20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                      <div style={{ width: "24px", height: "24px", background: "var(--green)", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "12px", fontWeight: 700 }}>{group}</div>
                      <span style={{ fontWeight: 700, fontSize: "13px" }}>Group {group}</span>
                      <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{teams.map(t => `${t.flag} ${t.team}`).join(" · ")}</span>
                    </div>
                    <div style={{ display: "grid", gap: "5px" }}>
                      {matches.map((m) => {
                        const res = localState.results.group[m.id];
                        return (
                          <div key={m.id} className="card" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ flex: 1, textAlign: "right", fontSize: "12px", fontWeight: 500 }}>{m.home.flag} {m.home.team}</span>
                            <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res?.home ?? ""} onChange={(e) => updateGroupResult(m.id, "home", e.target.value)} style={{ fontSize: "14px" }} />
                            <span style={{ color: "var(--text-3)", fontSize: "12px" }}>–</span>
                            <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res?.away ?? ""} onChange={(e) => updateGroupResult(m.id, "away", e.target.value)} style={{ fontSize: "14px" }} />
                            <span style={{ flex: 1, fontSize: "12px", fontWeight: 500 }}>{m.away.flag} {m.away.team}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeRound !== "group" && (
            <div style={{ display: "grid", gap: "8px" }}>
              {KNOCKOUT_MATCHES[activeRound].map((match) => {
                const res = localState.results.knockout[match.id] || { homeTeam: "", awayTeam: "", homeScore: "", awayScore: "" };
                return (
                  <div key={match.id} className="card" style={{ padding: "12px 14px" }}>
                    <p style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-2)", marginBottom: "8px", textTransform: "uppercase" }}>{match.label}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <input type="text" placeholder="Home Team" value={res.homeTeam} onChange={(e) => updateKnockoutResult(match.id, "homeTeam", e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                      <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.homeScore} onChange={(e) => updateKnockoutResult(match.id, "homeScore", e.target.value)} />
                      <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                      <input className="score-input" type="text" inputMode="numeric" placeholder="–" value={res.awayScore} onChange={(e) => updateKnockoutResult(match.id, "awayScore", e.target.value)} />
                      <input type="text" placeholder="Away Team" value={res.awayTeam} onChange={(e) => updateKnockoutResult(match.id, "awayTeam", e.target.value)} style={{ flex: 1, fontSize: "12px", padding: "7px 8px" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div style={{ marginTop: "20px", textAlign: "right" }}>
            <button className="btn-primary" onClick={saveResults} disabled={saving}>{saving ? "Saving..." : "💾 Save Results"}</button>
          </div>
        </div>
      )}

      {/* ── STATS SECTION ── */}
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
                    {Object.keys(SQUADS).sort().map(c => <option key={c} value={c}>{SQUADS[c].flag} {c}</option>)}
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

          {/* Existing stats */}
          <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>Entered Stats ({stats.length})</h3>
          {stats.length === 0 ? (
            <p style={{ color: "var(--text-3)", fontSize: "13px" }}>No stats entered yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "6px" }}>
              {stats.map(s => (
                <div key={s.id} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <span style={{ fontSize: "16px" }}>{SQUADS[s.country]?.flag}</span>
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
