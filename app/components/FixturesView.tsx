"use client";
import { Player } from "@/app/data/types";
import { KNOCKOUT_MATCHES, TEAM_FLAGS } from "@/app/data/worldcup";

interface Props { player: Player; confirmedTeams?: Record<string, { home: string; away: string }>; }

function parseKickoff(dateUK: string, timeUK: string): Date {
  try {
    const [day, mon] = dateUK.split(" ");
    const [hh, mm] = timeUK.replace(/ BST| GMT/, "").split(":");
    const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    return new Date(Date.UTC(2026, months[mon], Number(day), Number(hh) - (timeUK.includes("BST")?1:0), Number(mm)));
  } catch { return new Date(0); }
}

function Flag({ country, size=20 }: { country:string; size?:number }) {
  const c = TEAM_FLAGS[country];
  if (!c) return null;
  return <img src={`https://flagcdn.com/w40/${c}.png`} alt={country} width={size} height={Math.round(size*0.67)} style={{ borderRadius:2, objectFit:"cover", flexShrink:0 }} />;
}

const TV: Record<string,string> = {
  "qf-97":"ITV","qf-98":"BBC","qf-99":"ITV","qf-100":"BBC",
  "sf-101":"ITV","sf-102":"BBC","3rd-103":"BBC","final-104":"ITV",
};

export default function FixturesView({ player, confirmedTeams={} }: Props) {
  const now = new Date();
  const in2weeks = new Date(now.getTime() + 14*24*60*60*1000);

  // All remaining knockout matches in next 2 weeks
  const rounds = ["qf","sf","final"] as const;
  const allKO = rounds.flatMap(r => (KNOCKOUT_MATCHES[r]||[]).map(m => ({ ...m, round: r })));
  // Also include 3rd place if it exists
  const third = (KNOCKOUT_MATCHES as Record<string, typeof KNOCKOUT_MATCHES["qf"]>)["3rd"] || [];
  const allMatches = [...allKO, ...third.map(m => ({ ...m, round:"3rd" as const }))];

  const upcoming = allMatches.filter(m => {
    const ko = parseKickoff(m.dateUK, m.timeUK);
    return ko >= new Date(now.getTime() - 120*60*1000) && ko <= in2weeks;
  }).sort((a,b) => parseKickoff(a.dateUK,a.timeUK).getTime() - parseKickoff(b.dateUK,b.timeUK).getTime());

  const byDate: Record<string, typeof upcoming> = {};
  upcoming.forEach(m => { if (!byDate[m.dateUK]) byDate[m.dateUK]=[]; byDate[m.dateUK].push(m); });

  const roundLabel: Record<string,string> = { qf:"Quarter Final", sf:"Semi Final", final:"🏆 Final", "3rd":"3rd Place" };

  return (
    <div style={{ display:"grid", gap:"20px" }}>
      {Object.entries(byDate).map(([date, matches]) => (
        <div key={date}>
          <p style={{ fontWeight:700, fontSize:"14px", color:"var(--text-2)", marginBottom:"8px", paddingBottom:"6px", borderBottom:"1px solid var(--border)" }}>
            📅 {date}
          </p>
          <div style={{ display:"grid", gap:"8px" }}>
            {matches.map(m => {
              const home = confirmedTeams[m.id]?.home || (m as {placeholder?:string}).placeholder?.split(" vs ")[0] || "TBD";
              const away = confirmedTeams[m.id]?.away || (m as {placeholder?:string}).placeholder?.split(" vs ")[1] || "TBD";
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const diffH = Math.round((ko.getTime()-now.getTime())/3600000);
              const isLive = diffH <= 0 && diffH > -120;
              const pred = player.knockoutPredictions?.[m.id];
              const hasPred = pred?.homeScore !== undefined && pred?.homeScore !== "";
              const tv = TV[m.id];
              const label = (roundLabel as Record<string,string>)[m.round] || "Knockout";
              return (
                <div key={m.id} className="card" style={{ padding:"12px 14px", borderLeft:`3px solid ${isLive?"#ef4444":diffH<3?"#f59e0b":"var(--border)"}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
                    <div>
                      <div style={{ display:"flex", gap:"6px", alignItems:"center", marginBottom:"2px" }}>
                        <span style={{ fontSize:"10px", fontWeight:700, background:"var(--surface2)", padding:"1px 6px", borderRadius:"4px", color:"var(--text-2)" }}>{label}</span>
                        {tv && <span style={{ fontSize:"10px", fontWeight:800, padding:"1px 6px", borderRadius:"3px", background:tv==="BBC"?"#e3051b":"#f9c300", color:tv==="BBC"?"white":"black" }}>{tv}</span>}
                      </div>
                      <span style={{ fontSize:"11px", color:"var(--text-3)" }}>📍 {m.stadium}, {m.city}</span>
                    </div>
                    <span style={{ fontSize:"11px", fontWeight:700, color:isLive?"#ef4444":diffH<3?"#f59e0b":"var(--text-3)", background:isLive?"#fee2e2":"transparent", padding:isLive?"1px 6px":"0", borderRadius:"4px", flexShrink:0 }}>
                      {isLive?"🔴 LIVE":`🕐 ${m.timeUK}`}
                    </span>
                  </div>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <Flag country={home} size={22} />
                    <span style={{ fontWeight:700, fontSize:"14px", flex:1 }}>{home}</span>
                    {hasPred ? (
                      <span style={{ fontSize:"12px", fontWeight:800, color:"var(--green)", background:"var(--green-light)", padding:"2px 10px", borderRadius:"6px" }}>
                        {pred.homeScore} – {pred.awayScore}
                        {pred.goesToET?` (ET ${pred.etHomeScore}–${pred.etAwayScore})`:""}
                        {pred.goesToPens?` P:${pred.penWinner}`:""}
                      </span>
                    ) : (
                      <span style={{ fontSize:"12px", color:"var(--text-3)", fontStyle:"italic" }}>no prediction</span>
                    )}
                    <span style={{ fontWeight:700, fontSize:"14px", flex:1, textAlign:"right" }}>{away}</span>
                    <Flag country={away} size={22} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {!upcoming.length && (
        <div className="card" style={{ padding:"40px", textAlign:"center" }}>
          <p style={{ fontSize:"32px", marginBottom:"8px" }}>📅</p>
          <p style={{ fontWeight:600 }}>No upcoming fixtures in next 2 weeks</p>
        </div>
      )}
    </div>
  );
}
