"use client";
import { useState, useEffect } from "react";
import { Player } from "@/app/data/types";
import { League, getLeaguesByIds, getLeagueByCode, createLeague, joinLeague, savePlayer } from "@/lib/storage";

interface Props {
  player: Player;
  onLeagueSelected: (player: Player, league: League) => void;
}

export default function LeagueSelector({ player, onLeagueSelected }: Props) {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [mode, setMode] = useState<"select" | "join" | "create">("select");
  const [joinCode, setJoinCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (player.leagueIds?.length) {
      getLeaguesByIds(player.leagueIds).then(setLeagues);
    }
  }, [player.leagueIds]);

  const selectLeague = async (league: League) => {
    const updated = { ...player, currentLeagueId: league.id };
    await savePlayer(updated);
    onLeagueSelected(updated, league);
  };

  const handleJoin = async () => {
    if (!joinCode.trim()) return;
    setLoading(true); setError("");
    const league = await getLeagueByCode(joinCode);
    if (!league) { setError("League not found. Check the code and try again."); setLoading(false); return; }
    if (player.leagueIds?.includes(league.id)) { selectLeague(league); setLoading(false); return; }
    const updated = await joinLeague(player, league.id);
    setLeagues(prev => [...prev.filter(l => l.id !== league.id), league]);
    onLeagueSelected(updated, league);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setLoading(true); setError("");
    const league = await createLeague(createName.trim(), player.id);
    if (!league) { setError("Failed to create league."); setLoading(false); return; }
    const updated = await joinLeague(player, league.id);
    setLeagues(prev => [...prev, league]);
    onLeagueSelected(updated, league);
    setLoading(false);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: "400px" }}>
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏆</div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>World Cup 2026</h1>
          <p style={{ fontSize: "14px", color: "var(--text-2)" }}>Welcome back, {player.name}</p>
        </div>

        {/* Existing leagues */}
        {leagues.length > 0 && mode === "select" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "10px" }}>Your Leagues</p>
            <div style={{ display: "grid", gap: "8px" }}>
              {leagues.map(league => (
                <button key={league.id} onClick={() => selectLeague(league)} className="card" style={{ padding: "16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", border: "1.5px solid var(--border)", textAlign: "left", width: "100%" }}>
                  <div style={{ width: 40, height: 40, borderRadius: "10px", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>⚽</div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: "15px" }}>{league.name}</p>
                    <p style={{ fontSize: "12px", color: "var(--text-3)" }}>Code: {league.code}</p>
                  </div>
                  <span style={{ marginLeft: "auto", fontSize: "18px", color: "var(--text-3)" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Join / Create */}
        {mode === "select" && (
          <div style={{ display: "grid", gap: "8px" }}>
            <button className="btn-primary" onClick={() => setMode("join")} style={{ justifyContent: "center", padding: "13px" }}>
              Join a League
            </button>
            <button className="btn-secondary" onClick={() => setMode("create")} style={{ justifyContent: "center", padding: "13px" }}>
              Create a League
            </button>
          </div>
        )}

        {mode === "join" && (
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "14px" }}>Join a League</h3>
            <label className="label">League Code</label>
            <input
              placeholder="e.g. FAMILY2026"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleJoin()}
              autoFocus
              style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}
            />
            {error && <p style={{ color: "var(--red)", fontSize: "12px", marginTop: "8px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button className="btn-primary" onClick={handleJoin} disabled={loading || !joinCode.trim()} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Joining..." : "Join League"}
              </button>
              <button className="btn-ghost" onClick={() => { setMode("select"); setError(""); setJoinCode(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {mode === "create" && (
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "14px" }}>Create a League</h3>
            <label className="label">League Name</label>
            <input
              placeholder="e.g. Family League"
              value={createName}
              onChange={e => setCreateName(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleCreate()}
              autoFocus
            />
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>
              A unique join code will be generated for others to use.
            </p>
            {error && <p style={{ color: "var(--red)", fontSize: "12px", marginTop: "6px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button className="btn-primary" onClick={handleCreate} disabled={loading || !createName.trim()} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Creating..." : "Create League"}
              </button>
              <button className="btn-ghost" onClick={() => { setMode("select"); setError(""); setCreateName(""); }}>Cancel</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
