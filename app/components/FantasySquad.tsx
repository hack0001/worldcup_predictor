"use client";
import { useState, useEffect } from "react";
import { Player, FantasyPlayer, FantasySquad as FantasySquadType } from "@/app/data/types";
import { SQUADS } from "@/app/data/worldcup";
import { getFantasySquad, saveFantasySquad } from "@/lib/storage";

interface Props {
  player: Player;
}

const POSITIONS: FantasyPlayer["position"][] = ["GK", "DEF", "MID", "FWD"];
const POSITION_LIMITS = { GK: 1, DEF: 4, MID: 3, FWD: 3 };
const POSITION_COLORS: Record<string, string> = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#10b981", FWD: "#ef4444" };

// Build flat player list with positions from squads
const ALL_PLAYERS: FantasyPlayer[] = Object.entries(SQUADS).flatMap(([country, { players }]) =>
  players.map((name, i) => ({
    name, country,
    position: i === 0 ? "GK" : i < 5 ? "DEF" : i < 9 ? "MID" : "FWD",
  }))
);

export default function FantasySquadPicker({ player }: Props) {
  const [squad, setSquad] = useState<FantasyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterPos, setFilterPos] = useState<FantasyPlayer["position"] | "">("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"pick" | "squad">("squad");

  useEffect(() => {
    (async () => {
      const existing = await getFantasySquad(player.id);
      if (existing) setSquad(existing.squad);
      setLoading(false);
    })();
  }, [player.id]);

  const save = async (newSquad: FantasyPlayer[]) => {
    setSaving(true);
    const fantasySquad: FantasySquadType = {
      id: player.id, playerId: player.id, squad: newSquad,
      round: "group", updatedAt: new Date().toISOString(),
    };
    await saveFantasySquad(fantasySquad);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addPlayer = (fp: FantasyPlayer) => {
    if (squad.length >= 11) return;
    const posCount = squad.filter(s => s.position === fp.position).length;
    if (posCount >= POSITION_LIMITS[fp.position]) return;
    if (squad.find(s => s.name === fp.name)) return;
    const newSquad = [...squad, fp];
    setSquad(newSquad);
    save(newSquad);
  };

  const removePlayer = (name: string) => {
    const newSquad = squad.filter(s => s.name !== name);
    setSquad(newSquad);
    save(newSquad);
  };

  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  squad.forEach(p => counts[p.position]++);

  const filteredPlayers = ALL_PLAYERS.filter(p => {
    if (filterCountry && p.country !== filterCountry) return false;
    if (filterPos && p.position !== filterPos) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const flag = (country: string) => SQUADS[country]?.flag || "";

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-2)" }}>Loading your squad...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700 }}>Fantasy Squad</h2>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>Pick 11: {Object.entries(POSITION_LIMITS).map(([p, n]) => `${n} ${p}`).join(", ")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {saved && <span style={{ fontSize: "13px", color: "var(--green)", fontWeight: 600 }}>✓ Saved</span>}
          {saving && <span style={{ fontSize: "13px", color: "var(--text-2)" }}>Saving...</span>}
          <span style={{ fontSize: "13px", fontWeight: 700, color: squad.length === 11 ? "var(--green)" : "var(--amber)" }}>{squad.length}/11</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
        <button className={`tab ${activeTab === "squad" ? "active" : ""}`} onClick={() => setActiveTab("squad")}>My Squad ({squad.length}/11)</button>
        <button className={`tab ${activeTab === "pick" ? "active" : ""}`} onClick={() => setActiveTab("pick")}>Pick Players</button>
      </div>

      {activeTab === "squad" && (
        <div>
          {squad.length === 0 ? (
            <div className="card" style={{ padding: "48px", textAlign: "center" }}>
              <div style={{ fontSize: "40px", marginBottom: "12px" }}>👕</div>
              <p style={{ fontWeight: 600, marginBottom: "4px" }}>No players picked yet</p>
              <p style={{ fontSize: "13px", color: "var(--text-2)", marginBottom: "16px" }}>Go to "Pick Players" to build your squad</p>
              <button className="btn-primary" onClick={() => setActiveTab("pick")}>Pick Players →</button>
            </div>
          ) : (
            <div>
              {/* Formation visual */}
              <div className="card" style={{ padding: "20px", marginBottom: "16px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
                {POSITIONS.map(pos => {
                  const posPlayers = squad.filter(p => p.position === pos);
                  if (posPlayers.length === 0) return null;
                  return (
                    <div key={pos} style={{ marginBottom: "12px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>
                        {pos} ({posPlayers.length}/{POSITION_LIMITS[pos]})
                      </div>
                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        {posPlayers.map(p => (
                          <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "6px", background: "white", border: "1px solid var(--border)", borderRadius: "6px", padding: "6px 10px" }}>
                            <span style={{ fontSize: "13px" }}>{flag(p.country)}</span>
                            <span style={{ fontSize: "13px", fontWeight: 500 }}>{p.name}</span>
                            <span className="badge" style={{ background: POSITION_COLORS[pos] + "22", color: POSITION_COLORS[pos], fontSize: "10px" }}>{pos}</span>
                            <button onClick={() => removePlayer(p.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "14px", padding: "0 0 0 2px", lineHeight: 1 }}>×</button>
                          </div>
                        ))}
                        {/* Empty slots */}
                        {Array.from({ length: POSITION_LIMITS[pos] - posPlayers.length }).map((_, i) => (
                          <div key={i} style={{ border: "1.5px dashed var(--border)", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", color: "var(--text-3)" }}>Empty</div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {/* Missing positions */}
                {POSITIONS.filter(pos => squad.filter(p => p.position === pos).length === 0).map(pos => (
                  <div key={pos} style={{ marginBottom: "12px" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--red)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px" }}>{pos} — needs {POSITION_LIMITS[pos]}</div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {Array.from({ length: POSITION_LIMITS[pos] }).map((_, i) => (
                        <div key={i} style={{ border: "1.5px dashed #fca5a5", borderRadius: "6px", padding: "6px 14px", fontSize: "12px", color: "#fca5a5" }}>Empty</div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {squad.length < 11 && (
                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                  <button className="btn-primary" onClick={() => setActiveTab("pick")}>+ Add more players</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "pick" && (
        <div>
          {/* Position capacity */}
          <div style={{ display: "flex", gap: "8px", marginBottom: "14px", flexWrap: "wrap" }}>
            {POSITIONS.map(pos => (
              <div key={pos} className="badge" style={{ background: POSITION_COLORS[pos] + "18", color: POSITION_COLORS[pos], border: `1px solid ${POSITION_COLORS[pos]}44`, padding: "4px 10px" }}>
                {pos}: {counts[pos]}/{POSITION_LIMITS[pos]}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 120px 120px", gap: "8px", marginBottom: "12px" }}>
            <input placeholder="🔍 Search player..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="">All countries</option>
              {Object.keys(SQUADS).sort().map(c => <option key={c} value={c}>{SQUADS[c].flag} {c}</option>)}
            </select>
            <select value={filterPos} onChange={e => setFilterPos(e.target.value as FantasyPlayer["position"] | "")}>
              <option value="">All positions</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Player list */}
          <div style={{ display: "grid", gap: "4px", maxHeight: "480px", overflowY: "auto" }}>
            {filteredPlayers.map(fp => {
              const inSquad = !!squad.find(s => s.name === fp.name);
              const posCountFull = counts[fp.position] >= POSITION_LIMITS[fp.position];
              const squadFull = squad.length >= 11;
              const disabled = inSquad || posCountFull || squadFull;
              return (
                <div key={fp.name} className="card" style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: "10px", opacity: disabled && !inSquad ? 0.5 : 1 }}>
                  <span style={{ fontSize: "18px" }}>{flag(fp.country)}</span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "13px", fontWeight: 500 }}>{fp.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "6px" }}>{fp.country}</span>
                  </div>
                  <span className="badge" style={{ background: POSITION_COLORS[fp.position] + "18", color: POSITION_COLORS[fp.position], fontSize: "10px" }}>{fp.position}</span>
                  {inSquad ? (
                    <button onClick={() => removePlayer(fp.name)} className="btn-secondary" style={{ fontSize: "12px", padding: "4px 10px", color: "var(--red)", borderColor: "#fca5a5" }}>Remove</button>
                  ) : (
                    <button onClick={() => addPlayer(fp)} className="btn-primary" disabled={disabled} style={{ fontSize: "12px", padding: "4px 10px" }}>Add</button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
