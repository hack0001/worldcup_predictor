"use client";
import { Player } from "@/app/data/types";
import { GROUP_MATCHES, TEAM_FLAGS } from "@/app/data/worldcup";

interface Props { player: Player; }

function parseKickoff(dateUK: string, timeUK: string): Date {
  try {
    const [day, mon] = dateUK.split(" ");
    const [hh, mm] = timeUK.replace(/ BST| GMT/, "").split(":");
    const months: Record<string, number> = { Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11 };
    const isBST = timeUK.includes("BST");
    return new Date(Date.UTC(2026, months[mon], Number(day), Number(hh) - (isBST ? 1 : 0), Number(mm)));
  } catch { return new Date(0); }
}

function FlagImg({ country, size = 18 }: { country: string; size?: number }) {
  const code = TEAM_FLAGS[country];
  if (!code) return <span style={{ width: size, display: "inline-block" }} />;
  return <img src={`https://flagcdn.com/w40/${code}.png`} alt={country} width={size} height={Math.round(size * 0.67)} style={{ borderRadius: 2, objectFit: "cover", verticalAlign: "middle", flexShrink: 0 }} />;
}

export default function FixturesView({ player }: Props) {
  const now = new Date();
  const in96h = new Date(now.getTime() + 96 * 60 * 60 * 1000);

  const upcoming = GROUP_MATCHES.filter(m => {
    const ko = parseKickoff(m.dateUK, m.timeUK);
    return ko >= now && ko <= in96h;
  });

  // Group by date
  const byDate: Record<string, typeof upcoming> = {};
  upcoming.forEach(m => {
    const key = m.dateUK;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(m);
  });

  if (!upcoming.length) {
    return (
      <div className="card" style={{ padding: "40px", textAlign: "center" }}>
        <p style={{ fontSize: "32px", marginBottom: "8px" }}>📅</p>
        <p style={{ fontWeight: 600 }}>No fixtures in next 96 hours</p>
      </div>
    );
  }

  return (
    <div style={{ display: "grid", gap: "20px" }}>
      {Object.entries(byDate).map(([date, matches]) => (
        <div key={date}>
          <p style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-2)", marginBottom: "8px", paddingBottom: "6px", borderBottom: "1px solid var(--border)" }}>
            📅 {date}
          </p>
          <div style={{ display: "grid", gap: "8px" }}>
            {matches.map(m => {
              const home = typeof m.home === "string" ? m.home : m.home.team;
              const away = typeof m.away === "string" ? m.away : m.away.team;
              const ko = parseKickoff(m.dateUK, m.timeUK);
              const diffH = Math.round((ko.getTime() - now.getTime()) / 3600000);
              const pred = player.groupPredictions[m.id];
              const hasPred = pred?.home !== undefined && pred?.away !== undefined;
              const isLive = ko <= now && now.getTime() - ko.getTime() < 120 * 60 * 1000;

              return (
                <div key={m.id} className="card" style={{ padding: "12px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", color: "var(--text-3)" }}>Group {m.group} · {m.stadium}, {m.city}</span>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: isLive ? "#ef4444" : diffH < 3 ? "#f59e0b" : "var(--text-3)", background: isLive ? "#fee2e2" : "transparent", padding: isLive ? "1px 6px" : "0", borderRadius: "4px" }}>
                      {isLive ? "🔴 LIVE" : `${m.timeUK} · ${diffH < 24 ? `${diffH}h` : diffH < 48 ? "tomorrow" : date}`}
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <FlagImg country={home} size={22} />
                    <span style={{ fontWeight: 700, fontSize: "14px", flex: 1 }}>{home}</span>
                    {hasPred ? (
                      <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                        <span style={{ fontSize: "12px", fontWeight: 800, color: "var(--green)", background: "var(--green-light)", padding: "2px 10px", borderRadius: "6px" }}>{pred.home} – {pred.away}</span>
                      </div>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--text-3)", fontStyle: "italic" }}>no prediction</span>
                    )}
                    <span style={{ fontWeight: 700, fontSize: "14px", flex: 1, textAlign: "right" }}>{away}</span>
                    <FlagImg country={away} size={22} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
