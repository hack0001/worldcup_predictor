"use client";
import { useState, useEffect } from "react";
import { Player } from "@/app/data/types";
import { League, getLeaguesByIds, getLeagueByCode, getAllLeagues, createLeague, joinLeague, savePlayer } from "@/lib/storage";

interface Props {
  player: Player;
  onLeagueSelected: (player: Player, league: League) => void;
}

export default function LeagueSelector({ player, onLeagueSelected }: Props) {
  const [myLeagues, setMyLeagues] = useState<League[]>([]);
  const [allLeagues, setAllLeagues] = useState<League[]>([]);
  const [mode, setMode] = useState<"select" | "browse" | "code" | "create">("select");
  const [joinCode, setJoinCode] = useState("");
  const [createName, setCreateName] = useState("");
  const [loading, setLoading] = useState(false);
  const [joining, setJoining] = useState<string | null>(null); // league id being joined
  const [error, setError] = useState("");
  const [joined, setJoined] = useState<string[]>([]); // ids joined this session

  useEffect(() => {
    if (player.leagueIds?.length) {
      getLeaguesByIds(player.leagueIds).then(setMyLeagues);
    }
  }, [player.leagueIds]);

  const selectLeague = async (league: League) => {
    const updated = { ...player, currentLeagueId: league.id };
    await savePlayer(updated);
    onLeagueSelected(updated, league);
  };

  const handleBrowse = async () => {
    setMode("browse");
    setError("");
    const leagues = await getAllLeagues();
    setAllLeagues(leagues);
  };

  const handleJoinById = async (league: League) => {
    setJoining(league.id);
    const updated = await joinLeague(player, league.id);
    setMyLeagues(prev => [...prev.filter(l => l.id !== league.id), league]);
    setJoined(prev => [...prev, league.id]);
    setJoining(null);
    // Auto-select if first league
    if (!player.leagueIds?.length) {
      onLeagueSelected(updated, league);
    }
  };

  const handleJoinByCode = async () => {
    if (!joinCode.trim()) return;
    setLoading(true); setError("");
    const league = await getLeagueByCode(joinCode);
    if (!league) { setError("League not found. Check the code and try again."); setLoading(false); return; }
    if (player.leagueIds?.includes(league.id)) { selectLeague(league); setLoading(false); return; }
    const updated = await joinLeague(player, league.id);
    setMyLeagues(prev => [...prev.filter(l => l.id !== league.id), league]);
    onLeagueSelected(updated, league);
    setLoading(false);
  };

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setLoading(true); setError("");
    const league = await createLeague(createName.trim(), player.id);
    if (!league) { setError("Failed to create league."); setLoading(false); return; }
    const updated = await joinLeague(player, league.id);
    setMyLeagues(prev => [...prev, league]);
    onLeagueSelected(updated, league);
    setLoading(false);
  };

  const isInLeague = (id: string) => player.leagueIds?.includes(id) || joined.includes(id);

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", background: "var(--bg)" }}>
      <div style={{ width: "100%", maxWidth: "420px" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <div style={{ fontSize: "48px", marginBottom: "8px" }}>🏆</div>
          <h1 style={{ fontSize: "22px", fontWeight: 800, marginBottom: "4px" }}>World Cup 2026</h1>
          <p style={{ fontSize: "14px", color: "var(--text-2)" }}>Welcome, {player.name}</p>
        </div>

        {/* My leagues */}
        {myLeagues.length > 0 && mode === "select" && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-2)", marginBottom: "10px" }}>Your Leagues</p>
            <div style={{ display: "grid", gap: "8px" }}>
              {myLeagues.map(league => (
                <button key={league.id} onClick={() => selectLeague(league)} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px", cursor: "pointer", textAlign: "left", width: "100%" }}>
                  <div style={{ width: 38, height: 38, borderRadius: "10px", background: "var(--green)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>⚽</div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontWeight: 700, fontSize: "14px" }}>{league.name}</p>
                    <p style={{ fontSize: "11px", color: "var(--text-3)" }}>Code: {league.code}</p>
                  </div>
                  <span style={{ fontSize: "18px", color: "var(--text-3)" }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main action buttons */}
        {mode === "select" && (
          <div style={{ display: "grid", gap: "8px" }}>
            <button className="btn-primary" onClick={handleBrowse} style={{ justifyContent: "center", padding: "13px", fontSize: "15px" }}>
              🔍 Browse & Join Leagues
            </button>
            <button className="btn-secondary" onClick={() => setMode("code")} style={{ justifyContent: "center", padding: "13px" }}>
              🔑 I have a code
            </button>
            <button className="btn-secondary" onClick={() => setMode("create")} style={{ justifyContent: "center", padding: "13px" }}>
              ➕ Create a League
            </button>
          </div>
        )}

        {/* Browse all leagues */}
        {mode === "browse" && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <button className="btn-ghost" onClick={() => setMode("select")} style={{ fontSize: "13px" }}>← Back</button>
              <h3 style={{ fontWeight: 700, fontSize: "16px" }}>All Leagues</h3>
            </div>
            {allLeagues.length === 0 && (
              <div className="card" style={{ padding: "32px", textAlign: "center", color: "var(--text-3)" }}>No leagues found</div>
            )}
            <div style={{ display: "grid", gap: "8px" }}>
              {allLeagues.map(league => {
                const alreadyIn = isInLeague(league.id);
                const isJoining = joining === league.id;
                return (
                  <div key={league.id} className="card" style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: 38, height: 38, borderRadius: "10px", background: alreadyIn ? "var(--green)" : "var(--surface2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                      {alreadyIn ? "✓" : "⚽"}
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 700, fontSize: "14px" }}>{league.name}</p>
                      <p style={{ fontSize: "11px", color: "var(--text-3)" }}>Code: {league.code}</p>
                    </div>
                    {alreadyIn ? (
                      <button className="btn-primary" onClick={() => selectLeague(league)} style={{ fontSize: "12px", padding: "5px 12px", flexShrink: 0 }}>
                        Enter →
                      </button>
                    ) : (
                      <button className="btn-secondary" onClick={() => handleJoinById(league)} disabled={isJoining} style={{ fontSize: "12px", padding: "5px 12px", flexShrink: 0 }}>
                        {isJoining ? "Joining..." : "Join"}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            {joined.length > 0 && (
              <button className="btn-primary" onClick={() => setMode("select")} style={{ width: "100%", justifyContent: "center", marginTop: "16px", padding: "12px" }}>
                Done — Select a League →
              </button>
            )}
          </div>
        )}

        {/* Join by code */}
        {mode === "code" && (
          <div className="card" style={{ padding: "20px" }}>
            <h3 style={{ fontWeight: 700, marginBottom: "14px" }}>Join with a Code</h3>
            <label className="label">League Code</label>
            <input
              placeholder="e.g. FAMILY2026"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              onKeyDown={e => e.key === "Enter" && handleJoinByCode()}
              autoFocus
              style={{ textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700 }}
            />
            {error && <p style={{ color: "var(--red)", fontSize: "12px", marginTop: "8px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button className="btn-primary" onClick={handleJoinByCode} disabled={loading || !joinCode.trim()} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Joining..." : "Join"}
              </button>
              <button className="btn-ghost" onClick={() => { setMode("select"); setError(""); setJoinCode(""); }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Create */}
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
            <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>A unique join code will be generated automatically.</p>
            {error && <p style={{ color: "var(--red)", fontSize: "12px", marginTop: "6px" }}>{error}</p>}
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button className="btn-primary" onClick={handleCreate} disabled={loading || !createName.trim()} style={{ flex: 1, justifyContent: "center" }}>
                {loading ? "Creating..." : "Create"}
              </button>
              <button className="btn-ghost" onClick={() => { setMode("select"); setError(""); setCreateName(""); }}>Cancel</button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
