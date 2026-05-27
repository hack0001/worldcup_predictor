"use client";
import { useState, useEffect } from "react";
import { Player, FantasyPlayer, FantasySquad as FantasySquadType } from "@/app/data/types";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";
import { getFantasySquad, saveFantasySquad } from "@/lib/storage";

interface Props { player: Player; }

const POSITIONS: FantasyPlayer["position"][] = ["GK", "DEF", "MID", "FWD"];
const POSITION_LIMITS = { GK: 1, DEF: 4, MID: 3, FWD: 3 };
const POSITION_COLORS: Record<string, string> = { GK: "#f59e0b", DEF: "#3b82f6", MID: "#22c55e", FWD: "#ef4444" };
const POSITION_BG: Record<string, string> = { GK: "#fef3c7", DEF: "#dbeafe", MID: "#dcfce7", FWD: "#fee2e2" };

const ALL_PLAYERS: FantasyPlayer[] = Object.entries(SQUADS).flatMap(([country, { players }]) =>
  players.map(p => ({ name: p.name, country, position: p.position }))
);

function FlagImg({ country, size = 18 }: { country: string; size?: number }) {
  const code = TEAM_FLAGS[country];
  if (!code) return null;
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={country} width={size} height={Math.round(size * 0.67)} style={{ borderRadius: 2, objectFit: "cover", flexShrink: 0, display: "inline-block" }} />;
}

// ── Pitch View ────────────────────────────────────────────
function PlayerCard({ fp, onRemove }: { fp: FantasyPlayer; onRemove?: () => void }) {
  const code = TEAM_FLAGS[fp.country];
  const shirtColor = POSITION_COLORS[fp.position];
  const shortName = fp.name.split(" ").pop() || fp.name;

  return (
    <div
      style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", cursor: onRemove ? "pointer" : "default", minWidth: 80 }}
      onClick={onRemove}
      title={onRemove ? `Remove ${fp.name}` : fp.name}
    >
      {/* Country flag on top */}
      <div style={{ height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {code
          ? <img src={`https://flagcdn.com/w40/${code}.png`} alt={fp.country} width={28} height={19} style={{ borderRadius: 3, objectFit: "cover", border: "1.5px solid rgba(255,255,255,0.8)", boxShadow: "0 1px 4px rgba(0,0,0,0.5)" }} />
          : <div style={{ width: 28, height: 19, borderRadius: 3, background: "rgba(255,255,255,0.2)" }} />
        }
      </div>
      {/* Shirt — big */}
      <div style={{ position: "relative", width: 90, height: 90 }}>
        <svg viewBox="0 0 52 52" width={90} height={90}>
          <path d="M13,8 L5,18 L13,21 L13,44 L39,44 L39,21 L47,18 L39,8 L32,12 C30,15 22,15 20,12 Z" fill={shirtColor} />
          <path d="M20,12 C22,16 30,16 32,12" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="1.5" />
          <path d="M13,8 L5,18 L13,21" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
          <path d="M39,8 L47,18 L39,21" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="0.8" />
          <rect x="22" y="15" width="8" height="18" rx="1" fill="rgba(255,255,255,0.18)" />
          <path d="M13,8 L5,18 L13,21 L13,44 L39,44 L39,21 L47,18 L39,8 L32,12 C30,15 22,15 20,12 Z" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
        </svg>
      </div>
      {/* Name plate */}
      <div style={{ background: "rgba(0,0,0,0.82)", color: "white", borderRadius: "4px", padding: "3px 7px", fontSize: 11, fontWeight: 800, maxWidth: 84, textAlign: "center", lineHeight: 1.2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", letterSpacing: "0.03em" }}>
        {shortName}
      </div>
      {/* Position badge */}
      <div style={{ fontSize: 9, fontWeight: 800, color: "white", background: shirtColor, padding: "1px 5px", borderRadius: 3 }}>
        {fp.position}
      </div>
    </div>
  );
}

function EmptySlot({ position }: { position: FantasyPlayer["position"] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", minWidth: 80, opacity: 0.45 }}>
      <div style={{ width: 28, height: 20 }} />
      <div style={{ width: 90, height: 90, borderRadius: "8px", border: "2.5px dashed rgba(255,255,255,0.4)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 30, color: "rgba(255,255,255,0.4)", lineHeight: 1 }}>+</span>
      </div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", fontWeight: 700 }}>{position}</div>
    </div>
  );
}

function PitchView({ squad, onRemove }: { squad: FantasyPlayer[]; onRemove: (name: string) => void }) {
  const byPos: Record<string, FantasyPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  squad.forEach(p => byPos[p.position].push(p));

  const Row = ({ pos }: { pos: FantasyPlayer["position"] }) => (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px" }}>
      {byPos[pos].length > 0
        ? byPos[pos].map(p => <PlayerCard key={p.name} fp={p} onRemove={() => onRemove(p.name)} />)
        : Array.from({ length: POSITION_LIMITS[pos] }).map((_, i) => <EmptySlot key={i} position={pos} />)
      }
    </div>
  );

  return (
    <div style={{ background: "#2d8a4e", borderRadius: "10px", padding: "8px", position: "relative", border: "3px solid rgba(255,255,255,0.2)", overflow: "hidden" }}>
      {/* Clear pitch lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="1" y="1" width="98" height="98" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
        <line x1="1" y1="50" x2="99" y2="50" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="12" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.8" />
        <circle cx="50" cy="50" r="1" fill="rgba(255,255,255,0.6)" />
        <rect x="22" y="1" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" />
        <rect x="36" y="1" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        <rect x="22" y="83" width="56" height="16" fill="none" stroke="rgba(255,255,255,0.45)" strokeWidth="0.7" />
        <rect x="36" y="93" width="28" height="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        <path d="M 36,17 A 10,10 0 0,0 64,17" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
        <path d="M 36,83 A 10,10 0 0,1 64,83" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="0.6" />
      </svg>
      {/* GK at top, FWD at bottom */}
      <Row pos="GK" />
      <Row pos="DEF" />
      <Row pos="MID" />
      <Row pos="FWD" />
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────
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
          <h2 style={{ fontSize: "17px", fontWeight: 700 }}>My Fantasy Squad</h2>
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>1 GK · 4 DEF · 3 MID · 3 FWD</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {saving && <span style={{ fontSize: "12px", color: "var(--text-3)" }}>Saving...</span>}
          {saved && <span style={{ fontSize: "12px", color: "var(--green)", fontWeight: 700 }}>✓ Saved</span>}
          <span style={{ fontWeight: 800, fontSize: "16px", color: squad.length === 11 ? "var(--green)" : "#f59e0b" }}>
            {squad.length}/11
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", borderBottom: "1px solid var(--border)", marginBottom: "16px" }}>
        <button className={`tab ${activeTab === "squad" ? "active" : ""}`} onClick={() => setActiveTab("squad")}>⚽ My Squad</button>
        <button className={`tab ${activeTab === "pick" ? "active" : ""}`} onClick={() => setActiveTab("pick")}>+ Pick Players</button>
      </div>

      {/* SQUAD PITCH VIEW */}
      {activeTab === "squad" && (
        <div>
          <PitchView squad={squad} onRemove={removePlayer} />
          
          {squad.length === 0 && (
            <div style={{ textAlign: "center", marginTop: "16px" }}>
              <button className="btn-primary" onClick={() => setActiveTab("pick")}>Pick your squad →</button>
            </div>
          )}

          {squad.length > 0 && squad.length < 11 && (
            <div style={{ marginTop: "12px" }}>
              {/* Missing positions */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "10px" }}>
                {POSITIONS.map(pos => {
                  const have = counts[pos];
                  const need = POSITION_LIMITS[pos];
                  const ok = have === need;
                  return (
                    <span key={pos} style={{ padding: "3px 10px", borderRadius: "99px", fontSize: "12px", fontWeight: 700, background: ok ? POSITION_BG[pos] : "#fee2e2", color: ok ? POSITION_COLORS[pos] : "var(--red)", border: `1px solid ${ok ? POSITION_COLORS[pos] + "44" : "#fca5a5"}` }}>
                      {pos}: {have}/{need} {!ok && "⚠️"}
                    </span>
                  );
                })}
              </div>
              <button className="btn-secondary" onClick={() => setActiveTab("pick")} style={{ fontSize: "13px" }}>+ Add more players</button>
            </div>
          )}

          {squad.length === 11 && (
            <p style={{ textAlign: "center", marginTop: "10px", fontSize: "12px", color: "var(--green)", fontWeight: 600 }}>
              ✓ Squad complete! Tap any player on the pitch to remove them.
            </p>
          )}
        </div>
      )}

      {/* PICK PLAYERS */}
      {activeTab === "pick" && (
        <div>
          {/* Position slots */}
          <div style={{ display: "flex", gap: "6px", marginBottom: "12px", flexWrap: "wrap" }}>
            {POSITIONS.map(pos => (
              <div key={pos} style={{ padding: "4px 10px", borderRadius: "99px", background: POSITION_BG[pos], color: POSITION_COLORS[pos], border: `1px solid ${POSITION_COLORS[pos]}44`, fontSize: "12px", fontWeight: 700 }}>
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
                <div key={`${fp.country}-${fp.name}`} className="card" style={{ padding: "9px 14px", display: "flex", alignItems: "center", gap: "10px", opacity: disabled ? 0.4 : 1 }}>
                  <FlagImg country={fp.country} size={20} />
                  <div style={{ flex: 1 }}>
                    <span style={{ fontSize: "13px", fontWeight: 600 }}>{fp.name}</span>
                    <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "6px" }}>{fp.country}</span>
                  </div>
                  <span style={{ fontSize: "10px", fontWeight: 700, color: POSITION_COLORS[fp.position], background: POSITION_BG[fp.position], padding: "2px 7px", borderRadius: "99px", border: `1px solid ${POSITION_COLORS[fp.position]}33` }}>
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
