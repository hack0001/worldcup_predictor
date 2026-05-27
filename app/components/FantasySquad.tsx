"use client";
import { useState, useEffect } from "react";
import { Player, FantasyPlayer, FantasySquad as FantasySquadType } from "@/app/data/types";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";
import { getFantasySquad, saveFantasySquad } from "@/lib/storage";

interface Props { player: Player; }

const POSITIONS: FantasyPlayer["position"][] = ["GK", "DEF", "MID", "FWD"];
const POSITION_LIMITS = { GK: 1, DEF: 4, MID: 3, FWD: 3 };
const POSITION_COLORS: Record<string, string> = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#10b981", FWD: "#ef4444" };

// Build flat list from SQUADS with correct positions
const ALL_PLAYERS: FantasyPlayer[] = Object.entries(SQUADS).flatMap(([country, { players }]) =>
  players.map(p => ({ name: p.name, country, position: p.position }))
);

function FlagImg({ country, size = 18 }: { country: string; size?: number }) {
  const code = TEAM_FLAGS[country];
  if (!code) return null;
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={country} width={size} height={Math.round(size * 0.67)} style={{ borderRadius: 2, objectFit: "cover", flexShrink: 0 }} />;
}

export default function FantasySquadPicker({ player }: Props) {
  const [squad, setSquad] = useState<FantasyPlayer[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [filterCountry, setFilterCountry] = useState("");
  const [filterPos, setFilterPos] = useState<FantasyPlayer["position"] | "">("");
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"squad" | "pick">("squad");

  useEffect(() => {
    getFantasySquad(player.id).then(existing => {
      if (existing?.squad?.length) setSquad(existing.squad);
      setLoading(false);
    });
  }, [player.id]);

  const persist = async (newSquad: FantasyPlayer[]) => {
    setSaving(true);
    const fs: FantasySquadType = { id: player.id, playerId: player.id, squad: newSquad, round: "group", updatedAt: new Date().toISOString() };
    await saveFantasySquad(fs);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const addPlayer = (fp: FantasyPlayer) => {
    if (squad.length >= 11) return;
    if (squad.filter(s => s.position === fp.position).length >= POSITION_LIMITS[fp.position]) return;
    if (squad.find(s => s.name === fp.name)) return;
    const next = [...squad, fp];
    setSquad(next);
    persist(next);
  };

  const removePlayer = (name: string) => {
    const next = squad.filter(s => s.name !== name);
    setSquad(next);
    persist(next);
  };

  const counts = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
  squad.forEach(p => counts[p.position]++);

  const filtered = ALL_PLAYERS.filter(p => {
    if (filterCountry && p.country !== filterCountry) return false;
    if (filterPos && p.position !== filterPos) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.country.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) return <div style={{ padding: "40px", textAlign: "center", color: "var(--text-2)" }}>Loading your squad...</div>;

  return (
    <div>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
        <div>
          <h2 style={{ fontSize: "17px", fontWeight: 700 }}>Fantasy Squad</h2>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
            Pick 1 GK · 4 DEF · 3 MID · 3 FWD
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {saving && <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Saving...</span>}
          {saved && <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>✓ Saved</span>}
          <span style={{ fontWeight: 800, fontSize: "16px", color: squad.length === 11 ? "var(--green)" : "var(--amber)" }}>
            {squad.length}/11
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
        <button className={`tab ${activeTab === "squad" ? "active" : ""}`} onClick={() => setActiveTab("squad")}>My Squad ({squad.length}/11)</button>
        <button className={`tab ${activeTab === "pick" ? "active" : ""}`} onClick={() => setActiveTab("pick")}>Pick Players</button>
      </div>

      {/* MY SQUAD */}
      {activeTab === "squad" && (
        squad.length === 0 ? (
          <div className="card" style={{ padding: "48px", textAlign: "center" }}>
            <div style={{ fontSize: "40px", marginBottom: "12px" }}>👕</div>
            <p style={{ fontWeight: 600, marginBottom: "12px" }}>No players picked yet</p>
            <button className="btn-primary" onClick={() => setActiveTab("pick")}>Pick Players →</button>
          </div>
        ) : (
          <div className="card" style={{ padding: "16px", background: "#f0fdf4", borderColor: "#bbf7d0" }}>
            {POSITIONS.map(pos => {
              const posPlayers = squad.filter(p => p.position === pos);
              const needed = POSITION_LIMITS[pos];
              return (
                <div key={pos} style={{ marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: POSITION_COLORS[pos], textTransform: "uppercase", letterSpacing: "0.05em" }}>{pos}</span>
                    <span style={{ fontSize: "10px", color: posPlayers.length === needed ? "var(--green)" : "var(--red)" }}>{posPlayers.length}/{needed}</span>
                  </div>
                  <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {posPlayers.map(p => (
                      <div key={p.name} style={{ display: "flex", alignItems: "center", gap: "5px", background: "white", border: `1.5px solid ${POSITION_COLORS[pos]}44`, borderRadius: "6px", padding: "5px 10px" }}>
                        <FlagImg country={p.country} size={16} />
                        <span style={{ fontSize: "12px", fontWeight: 600 }}>{p.name}</span>
                        <span style={{ fontSize: "9px", color: POSITION_COLORS[pos], fontWeight: 700 }}>{p.position}</span>
                        <button onClick={() => removePlayer(p.name)} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-3)", fontSize: "14px", padding: "0 0 0 2px", lineHeight: 1 }}>×</button>
                      </div>
                    ))}
                    {Array.from({ length: needed - posPlayers.length }).map((_, i) => (
                      <div key={i} style={{ border: "1.5px dashed var(--border)", borderRadius: "6px", padding: "5px 14px", fontSize: "11px", color: "var(--text-3)" }}>Empty</div>
                    ))}
                  </div>
                </div>
              );
            })}
            {squad.length < 11 && (
              <div style={{ marginTop: "8px", textAlign: "center" }}>
                <button className="btn-primary" onClick={() => setActiveTab("pick")} style={{ fontSize: "13px" }}>+ Add more players</button>
              </div>
            )}
          </div>
        )
      )}

      {/* PICK PLAYERS */}
      {activeTab === "pick" && (
        <div>
          {/* Position slots */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {POSITIONS.map(pos => (
              <div key={pos} style={{ padding: "4px 10px", borderRadius: "99px", background: POSITION_COLORS[pos] + "18", color: POSITION_COLORS[pos], border: `1px solid ${POSITION_COLORS[pos]}44`, fontSize: "12px", fontWeight: 700 }}>
                {pos}: {counts[pos]}/{POSITION_LIMITS[pos]}
              </div>
            ))}
          </div>

          {/* Filters */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 140px 100px", gap: "8px", marginBottom: "12px" }}>
            <input placeholder="🔍 Search player or country..." value={search} onChange={e => setSearch(e.target.value)} />
            <select value={filterCountry} onChange={e => setFilterCountry(e.target.value)}>
              <option value="">All countries</option>
              {Object.keys(SQUADS).sort().map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select value={filterPos} onChange={e => setFilterPos(e.target.value as FantasyPlayer["position"] | "")}>
              <option value="">All positions</option>
              {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>

          {/* Player list */}
          <div style={{ display: "grid", gap: "4px", maxHeight: "500px", overflowY: "auto" }}>
            {filtered.map(fp => {
              const inSquad = !!squad.find(s => s.name === fp.name);
              const posFull = counts[fp.position] >= POSITION_LIMITS[fp.position];
              const squadFull = squad.length >= 11;
              const disabled = !inSquad && (posFull || squadFull);

              return (
                <div key={`${fp.country}-${fp.name}`} className="card" style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", opacity: disabled ? 0.45 : 1 }}>
                  <FlagImg country={fp.country} size={20} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{fp.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "6px" }}>{fp.country}</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: POSITION_COLORS[fp.position], background: POSITION_COLORS[fp.position] + "18", padding: "2px 6px", borderRadius: "99px" }}>
                    {fp.position}
                  </span>
                  {inSquad ? (
                    <button onClick={() => removePlayer(fp.name)} className="btn-secondary" style={{ fontSize: "11px", padding: "4px 10px", color: "var(--red)", borderColor: "#fca5a5" }}>Remove</button>
                  ) : (
                    <button onClick={() => addPlayer(fp)} className="btn-primary" disabled={disabled} style={{ fontSize: "11px", padding: "4px 10px" }}>Add</button>
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
