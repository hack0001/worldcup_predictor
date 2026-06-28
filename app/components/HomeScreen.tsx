import { useState } from "react";
import { Player } from "@/app/data/types";
import { League, savePlayer } from "@/lib/storage";
import { AvatarDisplay } from "./AvatarPicker";
import { GROUP_MATCHES, KNOCKOUT_MATCHES } from "@/app/data/worldcup";

interface Props {
  player: Player;
  league: League;
  onNav: (section: "predictions" | "fantasy" | "profile" | "leagueSwitch" | "admin" | "quiz") => void;
  onUpdate: (player: Player) => void;
  onLogout: () => void;
  adminClickCount: number;
  onAdminClick: () => void;
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

export default function HomeScreen({ player, league, onNav, onUpdate, onLogout, adminClickCount, onAdminClick }: Props) {
  const [localPreds, setLocalPreds] = useState<Record<string, { home: string; away: string }>>({});
  const [localKoPreds, setLocalKoPreds] = useState<Record<string, { home: string; away: string }>>({});
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
          {/* Upcoming fixtures — inline predict */}
          {(() => {
            const now = new Date();
            const in72h = new Date(now.getTime() + 72 * 60 * 60 * 1000);
            const upcoming = GROUP_MATCHES.filter(m => {
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const pred = player.groupPredictions[m.id];
              const hasPred = pred?.home !== "" && pred?.home !== undefined && pred?.away !== "" && pred?.away !== undefined;
              return ko > now && ko <= in72h && !hasPred;
            }).slice(0, 6);
            if (!upcoming.length) return null;
            return (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)", marginBottom: "8px" }}>⏰ Predict before kickoff</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {upcoming.map(m => {
                    const home = typeof m.home === "string" ? m.home : m.home.team;
                    const away = typeof m.away === "string" ? m.away : m.away.team;
                    const ko = parseKickoff(m.dateUK, m.timeUK);
                    const diffH = Math.round((ko.getTime() - now.getTime()) / 3600000);
                    const timeLabel = diffH < 1 ? "< 1h" : diffH < 24 ? `${diffH}h` : `${m.dateUK}`;
                    const local = localPreds[m.id] || { home: "", away: "" };
                    const isSaving = saving === m.id;
                    const canSave = local.home !== "" && local.away !== "";

                    return (
                      <div key={m.id} className="card" style={{ padding: "10px 12px", borderLeft: `3px solid ${diffH < 3 ? "#ef4444" : "#f59e0b"}` }}>
                        {/* Time */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>Group {m.group} · {m.city}</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: diffH < 3 ? "#ef4444" : "#f59e0b" }}>{timeLabel} to go</span>
                        </div>
                        {/* Teams + score inputs */}
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, textAlign: "right" }}>{home}</span>
                          <input
                            type="text" inputMode="numeric" placeholder="–" maxLength={2}
                            value={local.home}
                            onChange={e => setLocalPreds(prev => ({ ...prev, [m.id]: { ...local, home: e.target.value.replace(/[^0-9]/g, "") } }))}
                            style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: "18px", padding: "6px 4px" }}
                          />
                          <span style={{ color: "var(--text-3)", fontWeight: 700 }}>–</span>
                          <input
                            type="text" inputMode="numeric" placeholder="–" maxLength={2}
                            value={local.away}
                            onChange={e => setLocalPreds(prev => ({ ...prev, [m.id]: { ...local, away: e.target.value.replace(/[^0-9]/g, "") } }))}
                            style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: "18px", padding: "6px 4px" }}
                          />
                          <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>{away}</span>
                          <button
                            type="button" onClick={() => savePred(m.id, local.home, local.away)}
                            disabled={!canSave || isSaving}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: canSave ? "var(--green)" : "var(--border)", color: canSave ? "white" : "var(--text-3)", fontWeight: 700, fontSize: "12px", cursor: canSave ? "pointer" : "default", flexShrink: 0 }}
                          >
                            {isSaving ? "..." : "✓"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Knockout R32 — inline predict all */}
          {(() => {
            const now = new Date();
            const r32 = KNOCKOUT_MATCHES.r32 || [];
            const unpredicted = r32.filter(m => {
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const pred = player.knockoutPredictions?.[m.id];
              const hasPred = pred?.homeScore !== "" && pred?.homeScore !== undefined;
              return ko > now && !hasPred;
            });
            if (!unpredicted.length) return null;
            return (
              <div>
                <p style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-2)", marginBottom: "8px" }}>⚔️ Round of 32 — add your predictions</p>
                <div style={{ display: "grid", gap: "8px" }}>
                  {unpredicted.map(m => {
                    const [homeTeam, awayTeam] = m.placeholder.split(" vs ");
                    const ko = parseKickoff(m.dateUK, m.timeUK);
                    const diffH = Math.round((ko.getTime() - now.getTime()) / 3600000);
                    const timeLabel = diffH < 1 ? "< 1h" : diffH < 24 ? `${diffH}h` : m.dateUK;
                    const local = localKoPreds[m.id] || { home: "", away: "" };
                    const isSaving = saving === m.id;
                    const canSave = local.home !== "" && local.away !== "";
                    return (
                      <div key={m.id} className="card" style={{ padding: "10px 12px", borderLeft: `3px solid ${diffH < 3 ? "#ef4444" : "#3b82f6"}` }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                          <span style={{ fontSize: "11px", color: "var(--text-3)" }}>R32 · {m.city} · {m.dateUK}</span>
                          <span style={{ fontSize: "11px", fontWeight: 700, color: diffH < 3 ? "#ef4444" : "#3b82f6" }}>{timeLabel} to go</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ flex: 1, fontSize: "13px", fontWeight: 600, textAlign: "right" }}>{homeTeam}</span>
                          <input type="text" inputMode="numeric" placeholder="–" maxLength={2}
                            value={local.home}
                            onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...local, home: e.target.value.replace(/[^0-9]/g, "") } }))}
                            style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: "18px", padding: "6px 4px" }} />
                          <span style={{ color: "var(--text-3)", fontWeight: 700 }}>–</span>
                          <input type="text" inputMode="numeric" placeholder="–" maxLength={2}
                            value={local.away}
                            onChange={e => setLocalKoPreds(prev => ({ ...prev, [m.id]: { ...local, away: e.target.value.replace(/[^0-9]/g, "") } }))}
                            style={{ width: 44, textAlign: "center", fontWeight: 800, fontSize: "18px", padding: "6px 4px" }} />
                          <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>{awayTeam}</span>
                          <button type="button"
                            onClick={() => saveKoPred(m.id, { homeTeam: homeTeam || "", awayTeam: awayTeam || "", homeScore: local.home, awayScore: local.away, goesToET: false, etHomeScore: "", etAwayScore: "", goesToPens: false, penWinner: "" })}
                            disabled={!canSave || isSaving}
                            style={{ padding: "6px 12px", borderRadius: "8px", border: "none", background: canSave ? "#3b82f6" : "var(--border)", color: canSave ? "white" : "var(--text-3)", fontWeight: 700, fontSize: "12px", cursor: canSave ? "pointer" : "default", flexShrink: 0 }}>
                            {isSaving ? "..." : "✓"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
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

          {/* Fantasy */}
          <button
            onClick={() => onNav("fantasy")}
            style={{
              padding: "0", borderRadius: "14px", border: "none", cursor: "pointer",
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              boxShadow: "0 4px 14px rgba(37,99,235,0.3)",
              overflow: "hidden", textAlign: "left",
            }}
          >
            <div style={{ padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: 52, height: 52, borderRadius: "12px", background: "rgba(255,255,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", flexShrink: 0 }}>
                👕
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 800, fontSize: "18px", color: "white" }}>Fantasy</p>
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Pick your World Cup XI</p>
                <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", marginTop: "1px" }}>Squad · Fantasy Leaderboard</p>
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
                <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.75)", marginTop: "2px" }}>Next 96 hours · your predictions</p>
              </div>
              <span style={{ fontSize: "22px", color: "rgba(255,255,255,0.6)" }}>→</span>
            </div>
          </button>

        </div>

      </div>
    </div>
  );
}
