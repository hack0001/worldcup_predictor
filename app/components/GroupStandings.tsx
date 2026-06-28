"use client";
import { useState } from "react";
import { AdminState } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES } from "@/app/data/worldcup";
import Flag from "./Flag";

interface Props {
  adminState: AdminState;
}

interface Standing {
  team: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  gf: number;
  ga: number;
  gd: number;
  pts: number;
}

function calcStandings(group: string, results: AdminState["results"]["group"]): Standing[] {
  const teams = GROUPS[group];
  const standings: Record<string, Standing> = {};
  teams.forEach(t => {
    standings[t.team] = { team: t.team, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, gd: 0, pts: 0 };
  });

  const matches = GROUP_MATCHES.filter(m => m.group === group);
  for (const m of matches) {
    const res = results[m.id];
    if (!res || res.home === "" || res.away === "") continue;
    const h = parseInt(res.home), a = parseInt(res.away);
    if (isNaN(h) || isNaN(a)) continue;
    standings[m.home.team].played++;
    standings[m.away.team].played++;
    standings[m.home.team].gf += h;
    standings[m.home.team].ga += a;
    standings[m.away.team].gf += a;
    standings[m.away.team].ga += h;
    standings[m.home.team].gd += h - a;
    standings[m.away.team].gd += a - h;
    if (h > a) {
      standings[m.home.team].won++; standings[m.home.team].pts += 3;
      standings[m.away.team].lost++;
    } else if (a > h) {
      standings[m.away.team].won++; standings[m.away.team].pts += 3;
      standings[m.home.team].lost++;
    } else {
      standings[m.home.team].drawn++; standings[m.home.team].pts++;
      standings[m.away.team].drawn++; standings[m.away.team].pts++;
    }
  }

  return Object.values(standings).sort((a, b) =>
    b.pts - a.pts || b.gd - a.gd || b.gf - a.gf || a.team.localeCompare(b.team)
  );
}

const FORM_COLORS: Record<string, string> = {
  W: "#16a34a", D: "#ca8a04", L: "#dc2626",
};

function getForm(team: string, group: string, results: AdminState["results"]["group"]): string[] {
  const matches = GROUP_MATCHES.filter(m => m.group === group && (m.home.team === team || m.away.team === team));
  return matches.map(m => {
    const res = results[m.id];
    if (!res || res.home === "" || res.away === "") return "";
    const h = parseInt(res.home), a = parseInt(res.away);
    if (isNaN(h) || isNaN(a)) return "";
    const isHome = m.home.team === team;
    if (h === a) return "D";
    if (isHome ? h > a : a > h) return "W";
    return "L";
  }).filter(Boolean);
}

export default function GroupStandings({ adminState }: Props) {
  const [activeGroup, setActiveGroup] = useState("A");
  const groupKeys = Object.keys(GROUPS);
  const results = adminState.results.group;
  const hasAnyResults = Object.keys(results).length > 0;

  const standings = calcStandings(activeGroup, results);
  const matches = GROUP_MATCHES.filter(m => m.group === activeGroup);
  const playedCount = matches.filter(m => {
    const r = results[m.id];
    return r && r.home !== "" && r.away !== "";
  }).length;

  return (
    <div>
      {!hasAnyResults && (
        <div className="card" style={{ padding: "16px 18px", marginBottom: "20px", background: "#fffbeb", borderColor: "#fde68a" }}>
          <p style={{ fontSize: "13px", color: "#92400e" }}>
            Standings will update automatically once the admin enters match results.
          </p>
        </div>
      )}

      {/* Group selector */}
      <div style={{ display: "flex", gap: "4px", flexWrap: "wrap", marginBottom: "16px" }}>
        {groupKeys.map(g => {
          const gMatches = GROUP_MATCHES.filter(m => m.group === g);
          const played = gMatches.filter(m => {
            const r = results[m.id];
            return r && r.home !== "" && r.away !== "";
          }).length;
          return (
            <button
              key={g}
              onClick={() => setActiveGroup(g)}
              style={{
                width: "40px", height: "40px", borderRadius: "8px",
                border: "1.5px solid",
                borderColor: activeGroup === g ? "var(--green)" : "var(--border)",
                background: activeGroup === g ? "var(--green)" : "var(--surface)",
                color: activeGroup === g ? "white" : "var(--text)",
                fontWeight: 700, fontSize: "14px", cursor: "pointer",
                position: "relative",
              }}
            >
              {g}
              {played > 0 && activeGroup !== g && (
                <span style={{ position: "absolute", top: -4, right: -4, width: 14, height: 14, borderRadius: "50%", background: "var(--blue)", fontSize: 8, color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700 }}>{played}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Group header */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
        <div style={{ width: "28px", height: "28px", background: "var(--green)", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "13px", fontWeight: 700 }}>
          {activeGroup}
        </div>
        <span style={{ fontWeight: 700, fontSize: "15px" }}>Group {activeGroup} Standings</span>
        <span style={{ fontSize: "12px", color: "var(--text-3)" }}>{playedCount}/{matches.length} played</span>
      </div>

      {/* Standings table */}
      <div className="card" style={{ overflow: "hidden", marginBottom: "20px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
          <thead>
            <tr style={{ background: "var(--surface2)", borderBottom: "1px solid var(--border)" }}>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>#</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-2)", fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Team</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>P</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>W</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>D</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>L</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>GF</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>GA</th>
              <th style={{ padding: "8px 8px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>GD</th>
              <th style={{ padding: "8px 12px", textAlign: "center", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>Pts</th>
              <th style={{ padding: "8px 12px", textAlign: "left", fontWeight: 700, color: "var(--text-2)", fontSize: "11px" }}>Form</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((s, idx) => {
              const qualified = idx < 2;
              const maybeThird = idx === 2;
              const form = getForm(s.team, activeGroup, results);
              return (
                <tr
                  key={s.team}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    background: qualified ? "#f0fdf4" : maybeThird ? "#fffbeb" : undefined,
                  }}
                >
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: qualified ? "var(--green)" : maybeThird ? "#ca8a04" : "var(--text-3)" }}>
                    {idx + 1}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <Flag country={s.team} size={18} />
                      <span style={{ fontWeight: 600 }}>{s.team}</span>
                      {idx === 0 && playedCount === matches.length && <span style={{ fontSize: "10px", background: "var(--green)", color: "white", padding: "1px 5px", borderRadius: "3px", fontWeight: 700 }}>QUALIFIED</span>}
                      {idx === 1 && playedCount === matches.length && <span style={{ fontSize: "10px", background: "var(--green)", color: "white", padding: "1px 5px", borderRadius: "3px", fontWeight: 700 }}>QUALIFIED</span>}
                    </div>
                  </td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>{s.played}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>{s.won}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>{s.drawn}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>{s.lost}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>{s.gf}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center" }}>{s.ga}</td>
                  <td style={{ padding: "10px 8px", textAlign: "center", fontWeight: 600, color: s.gd > 0 ? "var(--green)" : s.gd < 0 ? "var(--red)" : "var(--text)" }}>
                    {s.gd > 0 ? `+${s.gd}` : s.gd}
                  </td>
                  <td style={{ padding: "10px 12px", textAlign: "center", fontWeight: 800, fontSize: "16px" }}>{s.pts}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: "3px" }}>
                      {form.map((f, i) => (
                        <span key={i} style={{ width: 18, height: 18, borderRadius: "3px", background: FORM_COLORS[f], color: "white", fontSize: "9px", fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{f}</span>
                      ))}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ padding: "8px 12px", display: "flex", gap: "16px", borderTop: "1px solid var(--border)", background: "var(--surface2)" }}>
          <span style={{ fontSize: "11px", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 10, height: 10, background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "2px", display: "inline-block" }} /> Qualify (top 2)
          </span>
          <span style={{ fontSize: "11px", color: "var(--text-3)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ width: 10, height: 10, background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "2px", display: "inline-block" }} /> May qualify (best 3rd)
          </span>
        </div>
      </div>

      {/* Recent results for this group */}
      {playedCount > 0 && (
        <div>
          <h3 style={{ fontSize: "14px", fontWeight: 700, marginBottom: "10px" }}>Results</h3>
          <div style={{ display: "grid", gap: "5px" }}>
            {matches.filter(m => {
              const r = results[m.id];
              return r && r.home !== "" && r.away !== "";
            }).map(m => {
              const r = results[m.id];
              const h = parseInt(r.home), a = parseInt(r.away);
              return (
                <div key={m.id} className="card" style={{ padding: "8px 14px", display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ flex: 1, textAlign: "right", fontSize: "13px", fontWeight: h > a ? 700 : 400, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "5px" }}>
                    <Flag country={m.home.team} size={16} /> {m.home.team}
                  </span>
                  <span style={{ fontWeight: 800, fontSize: "16px", minWidth: "48px", textAlign: "center", color: "var(--text)" }}>{r.home} – {r.away}</span>
                  <span style={{ flex: 1, fontSize: "13px", fontWeight: a > h ? 700 : 400, display: "flex", alignItems: "center", gap: "5px" }}>
                    <Flag country={m.away.team} size={16} /> {m.away.team}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px" }}>
        <button className="btn-secondary" onClick={() => setActiveGroup(groupKeys[groupKeys.indexOf(activeGroup) - 1])} disabled={activeGroup === groupKeys[0]} style={{ fontSize: "13px", padding: "7px 14px" }}>
          ← Group {groupKeys[groupKeys.indexOf(activeGroup) - 1]}
        </button>
        <button className="btn-secondary" onClick={() => setActiveGroup(groupKeys[groupKeys.indexOf(activeGroup) + 1])} disabled={activeGroup === groupKeys[groupKeys.length - 1]} style={{ fontSize: "13px", padding: "7px 14px" }}>
          Group {groupKeys[groupKeys.indexOf(activeGroup) + 1]} →
        </button>
      </div>

      {/* Best third-place table */}
      {(() => {
        // Get all third-place teams and their stats
        const thirds = Object.entries(GROUPS).map(([group, teams]) => {
          const gMatches = GROUP_MATCHES.filter(m => m.group === group);
          const allComplete = gMatches.every(m => results[m.id]?.home !== undefined && results[m.id]?.away !== undefined);
          if (!allComplete) return null;
          const teamStats: Record<string, {pts:number;gd:number;gf:number;ga:number;yc:number}> = {};
          teams.forEach(t => teamStats[t.team] = {pts:0,gd:0,gf:0,ga:0,yc:0});
          gMatches.forEach(m => {
            const r = results[m.id]; if (!r) return;
            const h = parseInt(r.home), a = parseInt(r.away);
            if (isNaN(h)||isNaN(a)) return;
            teamStats[m.home.team].gf+=h; teamStats[m.home.team].ga+=a; teamStats[m.home.team].gd+=h-a;
            teamStats[m.away.team].gf+=a; teamStats[m.away.team].ga+=h; teamStats[m.away.team].gd+=a-h;
            if (h>a){teamStats[m.home.team].pts+=3;}else if(h<a){teamStats[m.away.team].pts+=3;}else{teamStats[m.home.team].pts+=1;teamStats[m.away.team].pts+=1;}
          });
          const sorted = teams.map(t=>({team:t.team,...teamStats[t.team]})).sort((a,b)=>b.pts-a.pts||b.gd-a.gd||b.gf-a.gf);
          return {group, team: sorted[2]};
        }).filter(Boolean) as {group:string;team:{team:string;pts:number;gd:number;gf:number;ga:number}}[];

        if (thirds.length === 0) return null;

        const sorted = [...thirds].sort((a,b)=>b.team.pts-a.team.pts||b.team.gd-a.team.gd||b.team.gf-a.team.gf);
        const qualified = new Set(sorted.slice(0,8).map(t=>t.team.team));

        return (
          <div className="card" style={{ padding: "14px 16px", marginTop: "16px" }}>
            <p style={{ fontWeight: 700, fontSize: "13px", marginBottom: "10px" }}>🏅 Best Third-Place Teams</p>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px" }}>
                <thead>
                  <tr style={{ borderBottom: "2px solid var(--border)", background: "var(--surface2)" }}>
                    <th style={{ padding: "5px 6px", textAlign: "left", width: 20 }}>#</th>
                    <th style={{ padding: "5px 6px", textAlign: "left" }}>Team</th>
                    <th style={{ padding: "5px 6px", textAlign: "center", fontWeight: 700 }}>Grp</th>
                    <th style={{ padding: "5px 6px", textAlign: "center", fontWeight: 700 }}>Pts</th>
                    <th style={{ padding: "5px 6px", textAlign: "center" }}>GD</th>
                    <th style={{ padding: "5px 6px", textAlign: "center" }}>GF</th>
                    <th style={{ padding: "5px 6px", textAlign: "center" }}>GA</th>
                  </tr>
                </thead>
                <tbody>
                  {sorted.map(({group, team}, i) => {
                    const q = qualified.has(team.team);
                    return (
                      <tr key={team.team} style={{ borderBottom: "1px solid var(--border)", background: q ? "var(--green-light)" : i >= 8 ? "#fee2e2" : "transparent" }}>
                        <td style={{ padding: "5px 6px", fontWeight: 700, color: q ? "var(--green)" : "var(--text-3)" }}>{i+1}</td>
                        <td style={{ padding: "5px 6px", fontWeight: 600, display: "flex", alignItems: "center", gap: "5px" }}>
                          <Flag country={team.team} size={14} />
                          {team.team}
                          {q && <span style={{ fontSize: "9px", background: "var(--green)", color: "white", borderRadius: "3px", padding: "1px 4px", fontWeight: 700 }}>Q</span>}
                        </td>
                        <td style={{ padding: "5px 6px", textAlign: "center", color: "var(--text-3)" }}>{group}</td>
                        <td style={{ padding: "5px 6px", textAlign: "center", fontWeight: 900 }}>{team.pts}</td>
                        <td style={{ padding: "5px 6px", textAlign: "center", color: team.gd > 0 ? "var(--green)" : team.gd < 0 ? "#ef4444" : "var(--text-3)" }}>{team.gd > 0 ? `+${team.gd}` : team.gd}</td>
                        <td style={{ padding: "5px 6px", textAlign: "center" }}>{team.gf}</td>
                        <td style={{ padding: "5px 6px", textAlign: "center" }}>{team.ga}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {thirds.length < 12 && <p style={{ fontSize: "11px", color: "var(--text-3)", marginTop: "6px" }}>Showing {thirds.length}/12 groups — table updates as group results are entered</p>}
            </div>
          </div>
        );
      })()}
    </div>
  );
}
