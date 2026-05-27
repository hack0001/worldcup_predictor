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
function PlayerCard({ fp, onRemove, small = false }: { fp: FantasyPlayer; onRemove?: () => void; small?: boolean }) {
  const code = TEAM_FLAGS[fp.country];
  const shirtColor = POSITION_COLORS[fp.position];
  const shortName = fp.name.split(" ").pop() || fp.name;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "3px", cursor: onRemove ? "pointer" : "default" }} onClick={onRemove}>
      {/* Shirt */}
      <div style={{ position: "relative", width: small ? 44 : 52, height: small ? 44 : 52 }}>
        <svg viewBox="0 0 52 52" width={small ? 44 : 52} height={small ? 44 : 52}>
          {/* Shirt body */}
          <path d="M13,8 L5,18 L13,21 L13,44 L39,44 L39,21 L47,18 L39,8 L32,12 C30,14 22,14 20,12 Z" fill={shirtColor} stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
          {/* Collar */}
          <path d="M20,12 C22,16 30,16 32,12" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" />
          {/* Sleeves */}
          <path d="M13,8 L5,18 L13,21" fill={shirtColor} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          <path d="M39,8 L47,18 L39,21" fill={shirtColor} stroke="rgba(255,255,255,0.3)" strokeWidth="0.5" />
          {/* Chest stripe */}
          <rect x="21" y="16" width="10" height="16" rx="1" fill="rgba(255,255,255,0.15)" />
        </svg>
        {/* Country flag badge */}
        {code && (
          <img src={`https://flagcdn.com/w20/${code}.png`} alt={fp.country}
            style={{ position: "absolute", bottom: 0, right: 0, width: 16, height: 11, borderRadius: 2, border: "1.5px solid white", objectFit: "cover" }} />
        )}
      </div>
      {/* Name plate */}
      <div style={{
        background: "rgba(0,0,0,0.75)", color: "white", borderRadius: "3px",
        padding: "2px 5px", fontSize: small ? 9 : 10, fontWeight: 700,
        maxWidth: small ? 56 : 66, textAlign: "center", lineHeight: 1.2,
        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        letterSpacing: "0.02em",
      }}>
        {shortName}
      </div>
      {/* Position badge */}
      <div style={{ fontSize: 8, fontWeight: 800, color: shirtColor, background: "rgba(255,255,255,0.9)", padding: "1px 4px", borderRadius: 2 }}>
        {fp.position}
      </div>
      {onRemove && (
        <div style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", cursor: "pointer" }}>tap to remove</div>
      )}
    </div>
  );
}

function EmptySlot({ position }: { position: FantasyPlayer["position"] }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
      <div style={{ width: 48, height: 48, borderRadius: "50%", border: "2px dashed rgba(255,255,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 20, opacity: 0.4 }}>+</span>
      </div>
      <div style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", fontWeight: 700 }}>{position}</div>
    </div>
  );
}

function PitchView({ squad, onRemove }: { squad: FantasyPlayer[]; onRemove: (name: string) => void }) {
  const byPos: Record<string, FantasyPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  squad.forEach(p => byPos[p.position].push(p));

  const rowStyle = (count: number): React.CSSProperties => ({
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    padding: "8px 4px",
  });

  return (
    <div style={{
      background: "linear-gradient(180deg, #2d8a4e 0%, #1f6b3a 25%, #2d8a4e 50%, #1f6b3a 75%, #2d8a4e 100%)",
      borderRadius: "8px",
      padding: "12px 8px",
      position: "relative",
      border: "2px solid rgba(255,255,255,0.2)",
      overflow: "hidden",
    }}>
      {/* Pitch lines */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="0" y="0" width="100" height="100" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
        <line x1="0" y1="50" x2="100" y2="50" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <circle cx="50" cy="50" r="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <rect x="20" y="0" width="60" height="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <rect x="20" y="86" width="60" height="14" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <rect x="35" y="0" width="30" height="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
        <rect x="35" y="94" width="30" height="6" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="0.5" />
      </svg>

      {/* FWD row */}
      <div style={rowStyle(byPos.FWD.length)}>
        {byPos.FWD.length > 0
          ? byPos.FWD.map(p => <PlayerCard key={p.name} fp={p} onRemove={() => onRemove(p.name)} />)
          : Array.from({ length: POSITION_LIMITS.FWD }).map((_, i) => <EmptySlot key={i} position="FWD" />)}
      </div>
      {/* MID row */}
      <div style={rowStyle(byPos.MID.length)}>
        {byPos.MID.length > 0
          ? byPos.MID.map(p => <PlayerCard key={p.name} fp={p} onRemove={() => onRemove(p.name)} />)
          : Array.from({ length: POSITION_LIMITS.MID }).map((_, i) => <EmptySlot key={i} position="MID" />)}
      </div>
      {/* DEF row */}
      <div style={rowStyle(byPos.DEF.length)}>
        {byPos.DEF.length > 0
          ? byPos.DEF.map(p => <PlayerCard key={p.name} fp={p} onRemove={() => onRemove(p.name)} />)
          : Array.from({ length: POSITION_LIMITS.DEF }).map((_, i) => <EmptySlot key={i} position="DEF" />)}
      </div>
      {/* GK row */}
      <div style={{ ...rowStyle(1), marginTop: "4px" }}>
        {byPos.GK.length > 0
          ? byPos.GK.map(p => <PlayerCard key={p.name} fp={p} onRemove={() => onRemove(p.name)} />)
          : <EmptySlot position="GK" />}
      </div>
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
