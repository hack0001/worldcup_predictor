import { useState } from "react";
import { Player } from "@/app/data/types";
import { League, savePlayer } from "@/lib/storage";
import { AvatarDisplay } from "./AvatarPicker";
import { GROUP_MATCHES, KNOCKOUT_MATCHES } from "@/app/data/worldcup";

interface Props {
  player: Player;
  league: League;
  onNav: (section: "predictions" | "profile" | "leagueSwitch" | "admin" | "quiz") => void;
  onUpdate: (player: Player) => void;
  onLogout: () => void;
  adminClickCount: number;
  onAdminClick: () => void;
  confirmedTeams?: Record<string, { home: string; away: string }>;
  allPlayers?: Player[];
  adminState?: { results: { knockout: Record<string, { homeScore?: string; awayScore?: string; homeTeam?: string; awayTeam?: string; wentToPens?: boolean; penWinner?: string; wentToET?: boolean; etHomeScore?: string; etAwayScore?: string }> } };
}

function parseKickoff(dateUK: string, timeUK: string): Date {
  try {
    const [day, mon] = dateUK.split(" ");
    const [hh, mm] = timeUK.replace(/ BST| GMT/, "").split(":");
    const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const isBST = timeUK.includes("BST");
    return new Date(Date.UTC(2026, months[mon], Number(day), Number(hh) - (isBST ? 1 : 0), Number(mm)));
  } catch { return new Date(0); }
}

export default function HomeScreen({ player, league, onNav, onUpdate, onLogout, adminClickCount, onAdminClick, confirmedTeams = {}, allPlayers = [], adminState }: Props) {
  const [localPreds, setLocalPreds] = useState<Record<string, { home: string; away: string }>>({});
  const [localKoPreds, setLocalKoPreds] = useState<Record<string, { home: string; away: string; et?: boolean; etH?: string; etA?: string; pens?: boolean; penW?: string }>>({});
  const [localKoR16Preds, setLocalKoR16Preds] = useState<Record<string, { home: string; away: string; et?: boolean; etH?: string; etA?: string; pens?: boolean; penW?: string }>>({})
  const [saving, setSaving] = useState<string | null>(null);

  const saveKoPred = async (matchId: string, pred: { homeTeam: string; awayTeam: string; homeScore: string; awayScore: string; goesToET: boolean; etHomeScore: string; etAwayScore: string; goesToPens: boolean; penWinner: string }) => {
    if (pred.homeScore === "" || pred.awayScore === "") return;
    setSaving(matchId);
    const updated = {
      ...player,
      knockoutPredictions: { ...player.knockoutPredictions, [matchId]: pred },
    };
    await savePlayer(updated);
    onUpdate(updated);
    setLocalKoPreds(prev => { const n = { ...prev }; delete n[matchId]; return n; });
    setSaving(null);
  };

  const savePred = async (matchId: string, home: string, away: string) => {
    if (home === "" || away === "") return;
    setSaving(matchId);
    const updated = {
      ...player,
      groupPredictions: { ...player.groupPredictions, [matchId]: { home, away } },
    };
    await savePlayer(updated);
    onUpdate(updated);
    setLocalPreds(prev => { const n = { ...prev }; delete n[matchId]; return n; });
    setSaving(null);
  };
  const now = new Date();
  const tournamentStart = new Date("2026-06-11T00:00:00Z");
  const daysUntil = Math.max(0, Math.ceil((tournamentStart.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const started = now >= tournamentStart;

  return (
    <div style={{ maxWidth: "480px", margin: "0 auto", minHeight: "100vh", display: "flex", flexDirection: "column" }}>

      {/* ── Header Banner ── */}
      <div style={{
        background: "linear-gradient(135deg, #15803d 0%, #166534 50%, #14532d 100%)",
        padding: "20px 16px 24px",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Background decoration */}
        <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", overflow: "hidden" }} />
        <div style={{ position: "absolute", bottom: -30, left: 0, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />

        {/* Top row */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "16px", position: "relative" }}>
          <button onClick={() => onNav("profile")} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}>
            <AvatarDisplay url={player.avatarUrl} name={player.name} size={56} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontWeight: 800, fontSize: "18px", color: "white", lineHeight: 1.2 }}>{player.name}</p>
            {player.status
              ? <p style={{ fontSize: "13px", color: "white", marginTop: "4px", background: "rgba(255,255,255,0.18)", display: "inline-block", padding: "2px 10px", borderRadius: "99px", fontStyle: "italic" }}>{player.status}</p>
              : <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginTop: "3px" }}>Tap to add a status</p>
            }
          </div>
          <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
            <button onClick={() => onNav("profile")} style={{ fontSize: "12px", color: "white", background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 600 }}>
              Edit
            </button>
            <button onClick={onLogout} style={{ fontSize: "12px", color: "rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "8px", padding: "6px 10px", cursor: "pointer" }} title="Log out">
              ↩
            </button>
          </div>
        </div>

        {/* Tournament title */}
        <div style={{ position: "relative" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <button onClick={onAdminClick} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", lineHeight: 1, position: "relative" }}>
              <span style={{ fontSize: "36px" }}>🏆</span>
              {adminClickCount > 0 && (
                <span style={{ position: "absolute", top: -4, right: -4, background: "rgba(255,255,255,0.9)", color: "#15803d", borderRadius: "99px", fontSize: "10px", fontWeight: 800, width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {adminClickCount}
                </span>
              )}
            </button>
            <div>
              <p style={{ fontWeight: 800, fontSize: "18px", color: "white", lineHeight: 1 }}>FIFA World Cup</p>
              <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.7)", marginTop: "1px" }}>USA · Canada · Mexico 2026</p>
            </div>
          </div>

          {/* Countdown / live badge */}
          {started ? (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "5px", background: "#ef4444", borderRadius: "99px", padding: "3px 10px" }}>
              <div style={{ width: 6, height: 6, borderRadius: "50%", background: "white", animation: "pulse 1s infinite" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>LIVE NOW</span>
            </div>
          ) : (
            <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,0.12)", borderRadius: "99px", padding: "3px 12px", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span style={{ fontSize: "18px" }}>⏱</span>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "white" }}>
                {daysUntil === 0 ? "Starts today!" : `${daysUntil} day${daysUntil !== 1 ? "s" : ""} to go`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* ── League pill ── */}
      <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "8px 16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "14px" }}>⚽</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: "13px", fontWeight: 600 }}>{league.name}</span>
          <span style={{ fontSize: "11px", color: "var(--text-3)", marginLeft: "6px" }}>Code: {league.code}</span>
        </div>
        <button onClick={() => { navigator.clipboard?.writeText(league.code); }} className="btn-ghost" style={{ fontSize: "11px", padding: "3px 8px" }}>Copy</button>
        <button onClick={() => onNav("leagueSwitch")} style={{ fontSize: "11px", color: "var(--text-3)", background: "none", border: "none", cursor: "pointer", padding: "3px 6px" }}>Switch ▼</button>
      </div>

      {/* ── Main nav cards ── */}
      <div style={{ flex: 1, padding: "16px" }}>
        <div style={{ display: "grid", gap: "12px" }}>

          {/* Knockout R32 — inline predict all */}
          {(() => {
            const now = new Date();
            const TEAM_FLAGS_MAP: Record<string,string> = {
              "South Africa":"za","Canada":"ca","Germany":"de","Paraguay":"py","Netherlands":"nl","Morocco":"ma",
              "Brazil":"br","Japan":"jp","France":"fr","Sweden":"se","Ivory Coast":"ci","Norway":"no","Mexico":"mx",
              "Ecuador":"ec","England":"gb-eng","DR Congo":"cd","USA":"us","Bosnia and Herzegovina":"ba",
              "Belgium":"be","Senegal":"sn","Croatia":"hr","Portugal":"pt","Spain":"es","Austria":"at",
              "Switzerland":"ch","Algeria":"dz","Argentina":"ar","Cape Verde":"cv","Colombia":"co","Ghana":"gh",
              "Australia":"au","Egypt":"eg",
            };
            const FlagImg = ({ team }: { team: string }) => {
              const code = TEAM_FLAGS_MAP[team];
              if (!code) return null;
              return <img src={`https://flagcdn.com/w20/${code}.png`} width={20} height={14} style={{ borderRadius: 2, flexShrink: 0, objectFit: "cover" }} alt="" />;
            };
            // Show ALL R32 matches in chronological order, unpredicted and not yet kicked off
            // UK TV broadcaster per match (BBC/ITV split)
            const TV: Record<string, string> = {
              "r32-73":"BBC","r32-76":"ITV","r32-74":"BBC","r32-75":"ITV",
              "r32-78":"BBC","r32-77":"ITV","r32-79":"BBC","r32-80":"ITV",
              "r32-81":"BBC","r32-82":"ITV","r32-83":"BBC","r32-84":"ITV",
              "r32-85":"BBC","r32-86":"ITV","r32-87":"BBC","r32-88":"ITV",
            };
            const r32 = [...(KNOCKOUT_MATCHES.r32 || [])].sort((a, b) => {
              const ka = parseKickoff(a.dateUK, a.timeUK), kb = parseKickoff(b.dateUK, b.timeUK);
              return ka.getTime() - kb.getTime();
            });
            const toShow = r32.filter(m => {
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const pred = player.knockoutPredictions?.[m.id];
              const hasPred = pred?.homeScore !== "" && pred?.homeScore !== undefined;
              return ko > now && !hasPred;
            });
            if (!toShow.length) return null;
            return (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)", marginBottom: "8px" }}>⚔️ Round of 32 — predict now</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {toShow.map(m => {
                    const [homeTeam, awayTeam] = m.placeholder.split(" vs ");
                    const ko = parseKickoff(m.dateUK, m.timeUK);
                    const diffH = Math.round((ko.getTime() - now.getTime()) / 3600000);
                    const locked = diffH <= 0;
                    const timeLabel = locked ? "🔒 Started" : diffH < 1 ? "< 1h" : diffH < 24 ? `${diffH}h` : m.dateUK;
                    const lk = localKoPreds[m.id] || { home: "", away: "", et: false, etH: "", etA: "", pens: false, penW: "" };
                    const isSaving = saving === m.id;
                    const canSave = !locked && lk.home !== "" && lk.away !== "";
                    return (
                      <div key={m.id} className="card" style={{ padding: "10px 12px", borderLeft: `3px solid ${locked ? "#d1d5db" : diffH < 3 ? "#ef4444" : "#3b82f6"}`, opacity: locked ? 0.6 : 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>📍 {m.stadium}, {m.city}</span>
                            <div style={{ display: "flex", gap: "6px", marginTop: "2px", alignItems: "center" }}>
                              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>🕐 {m.timeUK} · {m.dateUK}</span>
                              {TV[m.id] && <span style={{ fontSize: "10px", fontWeight: 800, padding: "1px 6px", borderRadius: "3px", background: TV[m.id] === "BBC" ? "#e3051b" : "#f9c300", color: TV[m.id] === "BBC" ? "white" : "black" }}>{TV[m.id]}</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: locked ? "var(--text-3)" : diffH < 3 ? "#ef4444" : "#3b82f6", flexShrink: 0, marginLeft: "8px" }}>{timeLabel}</span>
                        </div>
                        {/* Score row */}
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                            {homeTeam} <FlagImg team={homeTeam} />
                          </span>
                          <input type="text" inputMode="numeric" placeholder="–" maxLength={2} disabled={locked}
                            value={lk.home}
                            onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, home: e.target.value.replace(/[^0-9]/g, "") } }))}
                            style={{ width: 40, textAlign: "center", fontWeight: 800, fontSize: "17px", padding: "5px 3px" }} />
                          <span style={{ color: "var(--text-3)", fontWeight: 700 }}>–</span>
                          <input type="text" inputMode="numeric" placeholder="–" maxLength={2} disabled={locked}
                            value={lk.away}
                            onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, away: e.target.value.replace(/[^0-9]/g, "") } }))}
                            style={{ width: 40, textAlign: "center", fontWeight: 800, fontSize: "17px", padding: "5px 3px" }} />
                          <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                            <FlagImg team={awayTeam} /> {awayTeam}
                          </span>
                        </div>
                        {/* ET / Pens toggles */}
                        {!locked && lk.home !== "" && lk.away !== "" && lk.home === lk.away && (
                          <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                            <button type="button" onClick={() => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, et: !lk.et, pens: false, penW: "" } }))}
                              style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", border: "1px solid", borderColor: lk.et ? "#f59e0b" : "var(--border)", background: lk.et ? "#fef3c7" : "var(--surface2)", color: lk.et ? "#92400e" : "var(--text-3)", cursor: "pointer", fontWeight: 700 }}>
                              {lk.et ? "✓ ET" : "+ ET"}
                            </button>
                            {lk.et && (
                              <>
                                <input type="text" inputMode="numeric" placeholder="–" maxLength={2} value={lk.etH}
                                  onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, etH: e.target.value.replace(/[^0-9]/g,"") } }))}
                                  style={{ width: 34, textAlign: "center", fontSize: "14px", fontWeight: 700, padding: "3px" }} />
                                <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                                <input type="text" inputMode="numeric" placeholder="–" maxLength={2} value={lk.etA}
                                  onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, etA: e.target.value.replace(/[^0-9]/g,"") } }))}
                                  style={{ width: 34, textAlign: "center", fontSize: "14px", fontWeight: 700, padding: "3px" }} />
                                {lk.etH !== "" && lk.etA !== "" && lk.etH === lk.etA && (
                                  <button type="button" onClick={() => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, pens: !lk.pens } }))}
                                    style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", border: "1px solid", borderColor: lk.pens ? "#ef4444" : "var(--border)", background: lk.pens ? "#fee2e2" : "var(--surface2)", color: lk.pens ? "#991b1b" : "var(--text-3)", cursor: "pointer", fontWeight: 700 }}>
                                    {lk.pens ? "✓ Pens" : "+ Pens"}
                                  </button>
                                )}
                                {lk.pens && (
                                  <select value={lk.penW} onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...lk, penW: e.target.value } }))}
                                    style={{ fontSize: "11px", padding: "3px 6px", borderRadius: "5px" }}>
                                    <option value="">Winner?</option>
                                    <option value={homeTeam}>{homeTeam}</option>
                                    <option value={awayTeam}>{awayTeam}</option>
                                  </select>
                                )}
                              </>
                            )}
                          </div>
                        )}
                        {/* Save */}
                        {!locked && (
                          <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                            <button type="button"
                              onClick={() => saveKoPred(m.id, { homeTeam: homeTeam||"", awayTeam: awayTeam||"", homeScore: lk.home, awayScore: lk.away, goesToET: lk.et||false, etHomeScore: lk.etH||"", etAwayScore: lk.etA||"", goesToPens: lk.pens||false, penWinner: lk.penW||"" })}
                              disabled={!canSave || isSaving}
                              style={{ padding: "6px 16px", borderRadius: "8px", border: "none", background: canSave ? "#3b82f6" : "var(--border)", color: canSave ? "white" : "var(--text-3)", fontWeight: 700, fontSize: "12px", cursor: canSave ? "pointer" : "default" }}>
                              {isSaving ? "..." : "✓ Save"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Knockout R16 — inline predict all */}
          {(() => {
            const now = new Date();
            const r16 = [...(KNOCKOUT_MATCHES.qf || [])].sort((a, b) =>
              parseKickoff(a.dateUK, a.timeUK).getTime() - parseKickoff(b.dateUK, b.timeUK).getTime()
            );
            const FlagImg = ({ team }: { team: string }) => {
              const codeMap: Record<string,string> = {
                "Canada":"ca","Morocco":"ma","Germany":"de","France":"fr","Brazil":"br","Ivory Coast":"ci",
                "England":"gb-eng","USA":"us","Belgium":"be","Portugal":"pt","Spain":"es","Switzerland":"ch",
                "Argentina":"ar","Colombia":"co","South Africa":"za","Netherlands":"nl","Paraguay":"py",
                "Sweden":"se","Ecuador":"ec","DR Congo":"cd","Bosnia and Herzegovina":"ba","Senegal":"sn",
                "Croatia":"hr","Austria":"at","Algeria":"dz","Cape Verde":"cv","Ghana":"gh","Australia":"au",
                "Egypt":"eg","Japan":"jp","Norway":"no","Mexico":"mx",
              };
              const c = codeMap[team];
              if (!c) return null;
              return <img src={`https://flagcdn.com/w20/${c}.png`} width={20} height={14} style={{ borderRadius: 2, flexShrink: 0, objectFit: "cover" }} alt="" />;
            };
            const TV: Record<string,string> = { "qf-97":"ITV","qf-98":"BBC","qf-99":"ITV","qf-100":"BBC" };
            const toShow = r16.filter(m => {
              const home = confirmedTeams[m.id]?.home;
              const away = confirmedTeams[m.id]?.away;
              if (!home || !away) return false;
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const pred = player.knockoutPredictions?.[m.id];
              return ko > now && !(pred?.homeScore !== "" && pred?.homeScore !== undefined);
            });
            if (!toShow.length) return null;
            return (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)", marginBottom: "8px" }}>⚔️ Round of 16 — predict now</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {toShow.map(m => {
                    const homeTeam = confirmedTeams[m.id]?.home || "";
                    const awayTeam = confirmedTeams[m.id]?.away || "";
                    const ko = parseKickoff(m.dateUK, m.timeUK);
                    const diffH = Math.round((ko.getTime() - now.getTime()) / 3600000);
                    const locked = diffH <= 0;
                    const timeLabel = locked ? "🔒 Started" : diffH < 1 ? "< 1h" : diffH < 24 ? `${diffH}h` : m.dateUK;
                    const lk = localKoR16Preds[m.id] || { home: "", away: "", et: false, etH: "", etA: "", pens: false, penW: "" };
                    const isSaving = saving === m.id;
                    const canSave = !locked && lk.home !== "" && lk.away !== "";
                    return (
                      <div key={m.id} className="card" style={{ padding: "10px 12px", borderLeft: `3px solid ${locked ? "#d1d5db" : diffH < 3 ? "#ef4444" : "#8b5cf6"}`, opacity: locked ? 0.6 : 1 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                          <div>
                            <span style={{ fontSize: "11px", color: "var(--text-3)" }}>📍 {m.stadium}, {m.city}</span>
                            <div style={{ display: "flex", gap: "6px", marginTop: "2px", alignItems: "center" }}>
                              <span style={{ fontSize: "11px", color: "var(--text-3)" }}>🕐 {m.timeUK} · {m.dateUK}</span>
                              {TV[m.id] && <span style={{ fontSize: "10px", fontWeight: 800, padding: "1px 6px", borderRadius: "3px", background: TV[m.id]==="BBC"?"#e3051b":"#f9c300", color: TV[m.id]==="BBC"?"white":"black" }}>{TV[m.id]}</span>}
                            </div>
                          </div>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: locked?"var(--text-3)":diffH<3?"#ef4444":"#8b5cf6", flexShrink: 0, marginLeft: "8px" }}>{timeLabel}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, textAlign: "right", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "4px" }}>
                            {homeTeam} <FlagImg team={homeTeam} />
                          </span>
                          <input type="text" inputMode="numeric" placeholder="–" maxLength={2} disabled={locked}
                            value={lk.home} onChange={e => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, home: e.target.value.replace(/[^0-9]/g,"") } }))}
                            style={{ width: 40, textAlign: "center", fontWeight: 800, fontSize: "17px", padding: "5px 3px" }} />
                          <span style={{ color: "var(--text-3)", fontWeight: 700 }}>–</span>
                          <input type="text" inputMode="numeric" placeholder="–" maxLength={2} disabled={locked}
                            value={lk.away} onChange={e => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, away: e.target.value.replace(/[^0-9]/g,"") } }))}
                            style={{ width: 40, textAlign: "center", fontWeight: 800, fontSize: "17px", padding: "5px 3px" }} />
                          <span style={{ flex: 1, fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
                            <FlagImg team={awayTeam} /> {awayTeam}
                          </span>
                        </div>
                        {!locked && lk.home !== "" && lk.away !== "" && lk.home === lk.away && (
                          <div style={{ marginTop: "8px", display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                            <button type="button" onClick={() => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, et: !lk.et, pens: false, penW: "" } }))}
                              style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", border: "1px solid", borderColor: lk.et?"#f59e0b":"var(--border)", background: lk.et?"#fef3c7":"var(--surface2)", color: lk.et?"#92400e":"var(--text-3)", cursor: "pointer", fontWeight: 700 }}>
                              {lk.et ? "✓ ET" : "+ ET"}
                            </button>
                            {lk.et && (<>
                              <input type="text" inputMode="numeric" placeholder="–" maxLength={2} value={lk.etH}
                                onChange={e => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, etH: e.target.value.replace(/[^0-9]/g,"") } }))}
                                style={{ width: 34, textAlign: "center", fontSize: "14px", fontWeight: 700, padding: "3px" }} />
                              <span style={{ color: "var(--text-3)", fontSize: "11px" }}>–</span>
                              <input type="text" inputMode="numeric" placeholder="–" maxLength={2} value={lk.etA}
                                onChange={e => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, etA: e.target.value.replace(/[^0-9]/g,"") } }))}
                                style={{ width: 34, textAlign: "center", fontSize: "14px", fontWeight: 700, padding: "3px" }} />
                              {lk.etH !== "" && lk.etA !== "" && lk.etH === lk.etA && (
                                <button type="button" onClick={() => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, pens: !lk.pens } }))}
                                  style={{ fontSize: "11px", padding: "3px 8px", borderRadius: "5px", border: "1px solid", borderColor: lk.pens?"#ef4444":"var(--border)", background: lk.pens?"#fee2e2":"var(--surface2)", color: lk.pens?"#991b1b":"var(--text-3)", cursor: "pointer", fontWeight: 700 }}>
                                  {lk.pens ? "✓ Pens" : "+ Pens"}
                                </button>
                              )}
                              {lk.pens && (
                                <select value={lk.penW} onChange={e => setLocalKoR16Preds(prev => ({ ...prev, [m.id]: { ...lk, penW: e.target.value } }))}
                                  style={{ fontSize: "11px", padding: "3px 6px", borderRadius: "5px" }}>
                                  <option value="">Winner?</option>
                                  <option value={homeTeam}>{homeTeam}</option>
                                  <option value={awayTeam}>{awayTeam}</option>
                                </select>
                              )}
                            </>)}
                          </div>
                        )}
                        {!locked && (
                          <div style={{ marginTop: "8px", display: "flex", justifyContent: "flex-end" }}>
                            <button type="button"
                              onClick={() => saveKoPred(m.id, { homeTeam, awayTeam, homeScore: lk.home, awayScore: lk.away, goesToET: lk.et||false, etHomeScore: lk.etH||"", etAwayScore: lk.etA||"", goesToPens: lk.pens||false, penWinner: lk.penW||"" })}
                              disabled={!canSave || isSaving}
                              style={{ padding: "6px 16px", borderRadius: "8px", border: "none", background: canSave?"#8b5cf6":"var(--border)", color: canSave?"white":"var(--text-3)", fontWeight: 700, fontSize: "12px", cursor: canSave?"pointer":"default" }}>
                              {isSaving ? "..." : "✓ Save"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Remaining knockout rounds — QF/SF/3rd/Final quick predict */}
          {(() => {
            const now = new Date();
            const codeMap: Record<string,string> = {
              "Morocco":"ma","France":"fr","Spain":"es","Belgium":"be","Norway":"no",
              "England":"gb-eng","Argentina":"ar","Switzerland":"ch",
            };
            const FlagImg = ({ team }: { team: string }) => {
              const code = codeMap[team]; if (!code) return null;
              return <img src={`https://flagcdn.com/w20/${code}.png`} width={20} height={14} style={{ borderRadius:2, flexShrink:0, objectFit:"cover" }} alt="" />;
            };
            const TV: Record<string,string> = {
              "sf-101":"ITV","sf-102":"BBC","3rd-103":"BBC","final-104":"ITV",
            };
            const roundLabel: Record<string,string> = { sf:"Semi Finals", "3rd":"3rd Place Play-off", final:"🏆 Final" };
            const rounds = [
              { key:"sf", matches: KNOCKOUT_MATCHES.sf||[] },
              { key:"3rd", matches: (KNOCKOUT_MATCHES as Record<string,typeof KNOCKOUT_MATCHES["sf"]>)["3rd"]||[] },
              { key:"final", matches: KNOCKOUT_MATCHES.final||[] },
            ];
            const sections = rounds.flatMap(r => r.matches.map(m => ({ ...m, roundKey: r.key }))).filter(m => {
              const home = confirmedTeams[m.id]?.home;
              const away = confirmedTeams[m.id]?.away;
              if (!home || !away) return false;
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const pred = player.knockoutPredictions?.[m.id];
              return ko > now && !(pred?.homeScore !== "" && pred?.homeScore !== undefined);
            }).sort((a,b) => parseKickoff(a.dateUK,a.timeUK).getTime()-parseKickoff(b.dateUK,b.timeUK).getTime());
            if (!sections.length) return null;
            // Group by round
            const byRound: Record<string, typeof sections> = {};
            sections.forEach(m => { if (!byRound[m.roundKey]) byRound[m.roundKey]=[]; byRound[m.roundKey].push(m); });
            return (
              <div style={{ display:"grid", gap:"16px" }}>
                {Object.entries(byRound).map(([rk, matches]) => (
                  <div key={rk}>
                    <p style={{ fontSize:"13px", fontWeight:700, color:"var(--text-2)", marginBottom:"8px" }}>
                      {rk==="final"?"🏆":rk==="3rd"?"🥉":"🏅"} {roundLabel[rk]||rk} — predict now
                    </p>
                    <div style={{ display:"grid", gap:"8px" }}>
                      {matches.map(m => {
                        const homeTeam = confirmedTeams[m.id]?.home||"";
                        const awayTeam = confirmedTeams[m.id]?.away||"";
                        const ko = parseKickoff(m.dateUK,m.timeUK);
                        const diffH = Math.round((ko.getTime()-now.getTime())/3600000);
                        const locked = diffH<=0;
                        const timeLabel = locked?"🔒 Started":diffH<1?"< 1h":diffH<24?`${diffH}h`:m.dateUK;
                        const accent = rk==="final"?"#f59e0b":rk==="3rd"?"#cd7c2e":"#8b5cf6";
                        const lk = localKoR16Preds[m.id]||{home:"",away:"",et:false,etH:"",etA:"",pens:false,penW:""};
                        const canSave = !locked && lk.home!=="" && lk.away!=="";
                        const tv = TV[m.id];
                        return (
                          <div key={m.id} className="card" style={{padding:"10px 12px",borderLeft:`3px solid ${locked?"#d1d5db":diffH<3?"#ef4444":accent}`,opacity:locked?0.6:1}}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"8px"}}>
                              <div>
                                <span style={{fontSize:"11px",color:"var(--text-3)"}}>📍 {m.stadium}, {m.city}</span>
                                <div style={{display:"flex",gap:"6px",marginTop:"2px",alignItems:"center"}}>
                                  <span style={{fontSize:"11px",color:"var(--text-3)"}}>🕐 {m.timeUK} · {m.dateUK}</span>
                                  {tv && <span style={{fontSize:"10px",fontWeight:800,padding:"1px 6px",borderRadius:"3px",background:tv==="BBC"?"#e3051b":"#f9c300",color:tv==="BBC"?"white":"black"}}>{tv}</span>}
                                </div>
                              </div>
                              <span style={{fontSize:"11px",fontWeight:700,color:locked?"var(--text-3)":diffH<3?"#ef4444":accent,flexShrink:0,marginLeft:"8px"}}>{timeLabel}</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                              <span style={{flex:1,fontSize:"12px",fontWeight:600,textAlign:"right",display:"flex",alignItems:"center",justifyContent:"flex-end",gap:"4px"}}>
                                {homeTeam} <FlagImg team={homeTeam}/>
                              </span>
                              <input type="text" inputMode="numeric" placeholder="–" maxLength={2} disabled={locked}
                                value={lk.home} onChange={e=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,home:e.target.value.replace(/[^0-9]/g,"")}}))}
                                style={{width:40,textAlign:"center",fontWeight:800,fontSize:"17px",padding:"5px 3px"}}/>
                              <span style={{color:"var(--text-3)",fontWeight:700}}>–</span>
                              <input type="text" inputMode="numeric" placeholder="–" maxLength={2} disabled={locked}
                                value={lk.away} onChange={e=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,away:e.target.value.replace(/[^0-9]/g,"")}}))}
                                style={{width:40,textAlign:"center",fontWeight:800,fontSize:"17px",padding:"5px 3px"}}/>
                              <span style={{flex:1,fontSize:"12px",fontWeight:600,display:"flex",alignItems:"center",gap:"4px"}}>
                                <FlagImg team={awayTeam}/> {awayTeam}
                              </span>
                            </div>
                            {!locked && lk.home!=="" && lk.away!=="" && lk.home===lk.away && (
                              <div style={{marginTop:"8px",display:"flex",gap:"6px",alignItems:"center",flexWrap:"wrap"}}>
                                <button type="button" onClick={()=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,et:!lk.et,pens:false,penW:""}}))}
                                  style={{fontSize:"11px",padding:"3px 8px",borderRadius:"5px",border:"1px solid",borderColor:lk.et?"#f59e0b":"var(--border)",background:lk.et?"#fef3c7":"var(--surface2)",color:lk.et?"#92400e":"var(--text-3)",cursor:"pointer",fontWeight:700}}>
                                  {lk.et?"✓ ET":"+ ET"}
                                </button>
                                {lk.et && (<>
                                  <input type="text" inputMode="numeric" placeholder="–" maxLength={2} value={lk.etH}
                                    onChange={e=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,etH:e.target.value.replace(/[^0-9]/g,"")}}))}
                                    style={{width:34,textAlign:"center",fontSize:"14px",fontWeight:700,padding:"3px"}}/>
                                  <span style={{color:"var(--text-3)",fontSize:"11px"}}>–</span>
                                  <input type="text" inputMode="numeric" placeholder="–" maxLength={2} value={lk.etA}
                                    onChange={e=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,etA:e.target.value.replace(/[^0-9]/g,"")}}))}
                                    style={{width:34,textAlign:"center",fontSize:"14px",fontWeight:700,padding:"3px"}}/>
                                  {lk.etH!=="" && lk.etA!=="" && lk.etH===lk.etA && (
                                    <button type="button" onClick={()=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,pens:!lk.pens}}))}
                                      style={{fontSize:"11px",padding:"3px 8px",borderRadius:"5px",border:"1px solid",borderColor:lk.pens?"#ef4444":"var(--border)",background:lk.pens?"#fee2e2":"var(--surface2)",color:lk.pens?"#991b1b":"var(--text-3)",cursor:"pointer",fontWeight:700}}>
                                      {lk.pens?"✓ Pens":"+ Pens"}
                                    </button>
                                  )}
                                  {lk.pens && (
                                    <select value={lk.penW} onChange={e=>setLocalKoR16Preds(prev=>({...prev,[m.id]:{...lk,penW:e.target.value}}))}
                                      style={{fontSize:"11px",padding:"3px 6px",borderRadius:"5px"}}>
                                      <option value="">Winner?</option>
                                      <option value={homeTeam}>{homeTeam}</option>
                                      <option value={awayTeam}>{awayTeam}</option>
                                    </select>
                                  )}
                                </>)}
                              </div>
                            )}
                            {!locked && (
                              <div style={{marginTop:"8px",display:"flex",justifyContent:"flex-end"}}>
                                <button type="button"
                                  onClick={()=>saveKoPred(m.id,{homeTeam,awayTeam,homeScore:lk.home,awayScore:lk.away,goesToET:lk.et||false,etHomeScore:lk.etH||"",etAwayScore:lk.etA||"",goesToPens:lk.pens||false,penWinner:lk.penW||""})}
                                  disabled={!canSave||saving===m.id}
                                  style={{padding:"6px 16px",borderRadius:"8px",border:"none",background:canSave?accent:"var(--border)",color:canSave?"white":"var(--text-3)",fontWeight:700,fontSize:"12px",cursor:canSave?"pointer":"default"}}>
                                  {saving===m.id?"...":"✓ Save"}
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
          {/* Predictions */}
          <button
            onClick={() => onNav("predictions")}
            style={{
              padding: "0", borderRadius: "14px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #16a34a, #15803d)",
              boxShadow: "0 4px 14px rgba(22,163,74,0.3)",
              overflow: "hidden", textAlign: "left",
            }}
          >
            <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                ⚽
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "18px", color: "white" }}>Predictions</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Groups · Knockouts · Leaderboard</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>Chat · Polls · Standings</p>
              </div>
              <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)" }}>→</span>
            </div>
          </button>

          {/* Quiz */}
          <button
            onClick={() => onNav("quiz" as Parameters<typeof onNav>[0])}
            style={{ padding: "0", borderRadius: "14px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #7c3aed, #6d28d9)", boxShadow: "0 4px 14px rgba(124,58,237,0.3)", overflow: "hidden", textAlign: "left" }}
          >
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>🧠</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "18px", color: "white" }}>World Cup Quiz <span style={{ fontSize: "11px", background: "#ef4444", borderRadius: "99px", padding: "2px 7px", fontWeight: 700, verticalAlign: "middle", marginLeft: "4px" }}>NEW</span></p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>19 knockout questions · fresh slate</p>
              </div>
              <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)" }}>→</span>
            </div>
          </button>

          {/* Fixtures */}
          <button
            onClick={() => onNav("fixtures" as Parameters<typeof onNav>[0])}
            style={{ padding: "0", borderRadius: "14px", border: "none", cursor: "pointer", background: "linear-gradient(135deg, #0369a1, #0284c7)", boxShadow: "0 4px 14px rgba(3,105,161,0.3)", overflow: "hidden", textAlign: "left" }}
          >
            <div style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>📅</div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "18px", color: "white" }}>Fixtures</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Upcoming matches · stadium · channel</p>
              </div>
              <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)" }}>→</span>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
}
