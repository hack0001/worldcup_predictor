"use client";
import { useState, useEffect } from "react";
import { Player, FantasyPlayer, FantasySquad as FantasySquadType, PlayerStat, FANTASY_POINTS } from "@/app/data/types";
import { SQUADS, TEAM_FLAGS } from "@/app/data/worldcup";
import { getFantasySquad, saveFantasySquad, getAllPlayerStats } from "@/lib/storage";

interface Props { player: Player; fantasyLocked?: boolean; }

const POSITIONS: FantasyPlayer["position"][] = ["GK", "DEF", "MID", "FWD"];
const FORMATIONS: Record<string, { DEF: number; MID: number; FWD: number; label: string }> = {
  "4-3-3": { DEF: 4, MID: 3, FWD: 3, label: "4-3-3" },
  "4-4-2": { DEF: 4, MID: 4, FWD: 2, label: "4-4-2" },
  "4-5-1": { DEF: 4, MID: 5, FWD: 1, label: "4-5-1" },
  "3-5-2": { DEF: 3, MID: 5, FWD: 2, label: "3-5-2" },
  "3-4-3": { DEF: 3, MID: 4, FWD: 3, label: "3-4-3" },
};
const DEFAULT_FORMATION = "4-3-3";
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
function PlayerCard({ fp, onRemove, points }: { fp: FantasyPlayer; onRemove?: () => void; points?: { pts: number; breakdown: string } }) {
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
      {/* Points badge */}
      {points !== undefined && (
        <div title={points.breakdown} style={{ fontSize: 10, fontWeight: 900, color: points.pts > 0 ? "#15803d" : points.pts < 0 ? "#ef4444" : "rgba(255,255,255,0.6)", background: points.pts !== 0 ? "white" : "rgba(255,255,255,0.15)", padding: "1px 6px", borderRadius: 3, minWidth: 24, textAlign: "center" }}>
          {points.pts > 0 ? `+${points.pts}` : points.pts === 0 ? "–" : points.pts}
        </div>
      )}
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

function PitchView({ squad, onRemove, positionLimits, getPlayerPoints }: { squad: FantasyPlayer[]; onRemove: (name: string) => void; positionLimits: { GK: number; DEF: number; MID: number; FWD: number; label?: string }; getPlayerPoints?: (fp: FantasyPlayer) => { pts: number; breakdown: string } }) {
  const byPos: Record<string, FantasyPlayer[]> = { GK: [], DEF: [], MID: [], FWD: [] };
  squad.forEach(p => byPos[p.position].push(p));

  const Row = ({ pos }: { pos: FantasyPlayer["position"] }) => (
    <div style={{ display: "flex", justifyContent: "space-around", alignItems: "flex-start", padding: "10px 4px" }}>
      {byPos[pos].length > 0
        ? byPos[pos].map(p => <PlayerCard key={p.name} fp={p} onRemove={() => onRemove(p.name)} points={getPlayerPoints ? getPlayerPoints(p) : undefined} />)
        : Array.from({ length: positionLimits[pos] || 0 }).map((_, i) => <EmptySlot key={i} position={pos} />)
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
export default function FantasySquadPicker({ player, fantasyLocked = false }: Props) {
  const [squad, setSquad] = useState<FantasyPlayer[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStat[]>([]);
  const [formation, setFormation] = useState(DEFAULT_FORMATION);
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
      if ((existing as { formation?: string })?.formation) setFormation((existing as { formation?: string }).formation!);
      setLoading(false);
    });
    getAllPlayerStats().then(setPlayerStats);
  }, [player.id]);

  const POSITION_LIMITS = { GK: 1, ...FORMATIONS[formation] };
  const isLocked = fantasyLocked && squad.length >= 11;

  const getPlayerPoints = (fp: FantasyPlayer): { pts: number; breakdown: string } => {
    const s = playerStats.find(s => s.playerName === fp.name);
    if (!s) return { pts: 0, breakdown: "" };
    let pts = 0;
    const parts: string[] = [];
    const goalPts = fp.position === "FWD" ? FANTASY_POINTS.GOAL_FWD : fp.position === "MID" ? FANTASY_POINTS.GOAL_MID : FANTASY_POINTS.GOAL_DEF;
    if (s.goals) { pts += s.goals * goalPts; parts.push(`${s.goals}⚽+${s.goals * goalPts}`); }
    if (s.assists) { pts += s.assists * FANTASY_POINTS.ASSIST; parts.push(`${s.assists}🅰️+${s.assists * FANTASY_POINTS.ASSIST}`); }
    if ((fp.position === "GK" || fp.position === "DEF") && s.cleanSheets) { pts += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_GK_DEF; parts.push(`${s.cleanSheets}🧤+${s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_GK_DEF}`); }
    if (s.yellowCards) { pts += s.yellowCards * FANTASY_POINTS.YELLOW_CARD; parts.push(`${s.yellowCards}🟨${s.yellowCards * FANTASY_POINTS.YELLOW_CARD}`); }
    if (s.redCards) { pts += s.redCards * FANTASY_POINTS.RED_CARD; parts.push(`${s.redCards}🟥${s.redCards * FANTASY_POINTS.RED_CARD}`); }
    if (fp.position === "GK" && s.saves) { const sp = Math.floor(s.saves / 3) * FANTASY_POINTS.SAVE_SET; pts += sp; parts.push(`${s.saves}saves+${sp}`); }
    if (s.minutesPlayed >= 60) { pts += FANTASY_POINTS.PLAYED_60; parts.push(`mins+${FANTASY_POINTS.PLAYED_60}`); }
    else if (s.minutesPlayed > 0) { pts += FANTASY_POINTS.PLAYED_SUB_60; parts.push(`mins+${FANTASY_POINTS.PLAYED_SUB_60}`); }
    return { pts, breakdown: parts.join(" ") };
  };

  const totalPoints = squad.reduce((sum, fp) => sum + getPlayerPoints(fp).pts, 0);

  const persist = async (newSquad: FantasyPlayer[], newFormation = formation) => {
    setSaving(true);
    const fs = { id: player.id, playerId: player.id, squad: newSquad, formation: newFormation, round: "group", updatedAt: new Date().toISOString() } as FantasySquadType & { formation: string };
    await saveFantasySquad(fs as unknown as FantasySquadType);
    setSaved(true); setSaving(false);
    setTimeout(() => setSaved(false), 2000);
  };

  const changeFormation = (newFormation: string) => {
    if (isLocked) return;
    const newLimits = { GK: 1, ...FORMATIONS[newFormation] };
    // Remove players that exceed new limits
    const counts: Record<string, number> = { GK: 0, DEF: 0, MID: 0, FWD: 0 };
    const kept: FantasyPlayer[] = [];
    squad.forEach(p => {
      if (counts[p.position] < (Number(newLimits[p.position as keyof typeof newLimits]) || 0)) {
        kept.push(p);
        counts[p.position]++;
      }
    });
    setFormation(newFormation);
    setSquad(kept);
    persist(kept, newFormation);
  };

  const addPlayer = (fp: FantasyPlayer) => {
    if (isLocked) return;
    if (squad.length >= 11) return;
    if (squad.filter(s => s.position === fp.position).length >= Number(POSITION_LIMITS[fp.position as keyof typeof POSITION_LIMITS] || 0)) return;
    if (squad.find(s => s.name === fp.name)) return;
    const next = [...squad, fp];
    setSquad(next);
    persist(next);
  };

  const removePlayer = (name: string) => {
    if (isLocked) return;
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
          <p style={{ fontSize: "12px", color: "var(--text-2)", marginTop: "2px" }}>
            1 GK · {FORMATIONS[formation].DEF} DEF · {FORMATIONS[formation].MID} MID · {FORMATIONS[formation].FWD} FWD
          </p>
        </div>
        {isLocked && (
          <div style={{ background: "#fee2e2", border: "1px solid #fca5a5", borderRadius: "8px", padding: "8px 14px", marginBottom: "12px", display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "16px" }}>🔒</span>
            <p style={{ fontSize: "13px", fontWeight: 600, color: "#991b1b" }}>Your squad is locked — selections can no longer be changed.</p>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Formation picker */}
          <div style={{ display: "flex", gap: "3px", flexWrap: "wrap", justifyContent: "flex-end" }}>
            {Object.keys(FORMATIONS).map(f => (
              <button
                key={f}
                onClick={() => changeFormation(f)}
                style={{
                  fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "6px",
                  border: `1.5px solid ${formation === f ? "var(--green)" : "var(--border)"}`,
                  background: formation === f ? "var(--green)" : "var(--surface)",
                  color: formation === f ? "white" : "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                {f}
              </button>
            ))}
          </div>
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
          {/* Total points banner */}
          {playerStats.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", background: "linear-gradient(135deg,#15803d,#166534)", borderRadius: "10px", marginBottom: "10px" }}>
              <div>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Total Fantasy Points</p>
                <p style={{ fontSize: "28px", fontWeight: 900, color: "white", lineHeight: 1 }}>{totalPoints}</p>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{squad.filter(fp => getPlayerPoints(fp).pts > 0).length} players scoring</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.7)" }}>{squad.length}/11 selected</p>
              </div>
            </div>
          )}
          <PitchView squad={squad} onRemove={removePlayer} positionLimits={POSITION_LIMITS} getPlayerPoints={getPlayerPoints} />
          
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
                  const need = POSITION_LIMITS[pos as keyof typeof POSITION_LIMITS] || 0;
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
                {pos}: {counts[pos]}/{POSITION_LIMITS[pos as keyof typeof POSITION_LIMITS] || 0}
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
              const posFull = counts[fp.position] >= Number(POSITION_LIMITS[fp.position as keyof typeof POSITION_LIMITS] || 0);
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
