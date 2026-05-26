import { NextRequest, NextResponse } from "next/server";

const TEAM_ID_MAP: Record<string, number> = {
  "Mexico": 16, "South Africa": 18, "South Korea": 21, "Czechia": 40,
  "Canada": 101, "Bosnia & Herzegovina": 17, "Qatar": 163, "Switzerland": 15,
  "Brazil": 6, "Morocco": 32, "Haiti": 97, "Scotland": 1178,
  "USA": 9, "Paraguay": 14, "Australia": 25, "Türkiye": 26,
  "Germany": 25, "Curaçao": 1894, "Ivory Coast": 29, "Ecuador": 13,
  "Netherlands": 5, "Japan": 22, "Sweden": 23, "Tunisia": 35,
  "Spain": 9, "Cape Verde": 1572, "Saudi Arabia": 36, "Uruguay": 7,
  "Belgium": 4, "Egypt": 30, "Iran": 34, "New Zealand": 104,
  "France": 2, "Senegal": 33, "Iraq": 156, "Norway": 20,
  "Argentina": 26, "Algeria": 31, "Austria": 16, "Jordan": 159,
  "Portugal": 27, "DR Congo": 1574, "Uzbekistan": 97, "Colombia": 11,
  "England": 10, "Croatia": 3, "Ghana": 28, "Panama": 100,
};

// Completed fixture statuses in API-Football v3
const FINISHED_STATUSES = new Set(["FT", "AET", "PEN", "FT_PEN", "AWD", "WO"]);

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get("team");
  if (!team) return NextResponse.json({ error: "Missing team" }, { status: 400 });

  const teamId = TEAM_ID_MAP[team];
  if (!teamId) return NextResponse.json({ error: `Unknown team: ${team}` }, { status: 404 });

  // Try server-only key first, fall back to public key
  const apiKey = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key" }, { status: 503 });

  try {
    // Free plan requires season parameter alongside date range
    const toDate = new Date();
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - 180);
    const from = fromDate.toISOString().split("T")[0];
    const to = toDate.toISOString().split("T")[0];
    const season = toDate.getFullYear();

    const url = `https://v3.football.api-sports.io/fixtures?team=${teamId}&season=${season}&from=${from}&to=${to}`;
    const res = await fetch(url, {
      headers: {
        "x-apisports-key": apiKey,
        "x-rapidapi-host": "v3.football.api-sports.io",
      },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      return NextResponse.json({ error: `API error: ${res.status}` }, { status: 502 });
    }

    const data = await res.json();

    // Debug: return raw response info if no fixtures
    if (!data.response || data.response.length === 0) {
      return NextResponse.json({
        teamName: team, teamId, last5: [], fetchedAt: Date.now(),
        debug: { errors: data.errors, results: data.results, paging: data.paging }
      });
    }

    // Filter to finished, sort by date desc, take last 5
    const finished = (data.response as Record<string, unknown>[])
      .filter(f => {
        const fixture = f.fixture as Record<string, unknown>;
        const status = (fixture.status as Record<string, unknown>)?.short as string;
        return FINISHED_STATUSES.has(status);
      })
      .sort((a, b) => {
        const da = ((a.fixture as Record<string, unknown>).date as string) || "";
        const db = ((b.fixture as Record<string, unknown>).date as string) || "";
        return db.localeCompare(da); // newest first
      })
      .slice(0, 5)
      .reverse(); // show oldest→newest for form display

    const last5 = finished.map(f => {
      const fixture = f.fixture as Record<string, unknown>;
      const teams = f.teams as Record<string, Record<string, unknown>>;
      const goals = f.goals as Record<string, number | null>;
      const league = f.league as Record<string, unknown>;

      const isHome = Number((teams.home as Record<string, unknown>).id) === teamId;
      const opponent = isHome ? teams.away : teams.home;
      const gf = Number(isHome ? (goals.home ?? 0) : (goals.away ?? 0));
      const ga = Number(isHome ? (goals.away ?? 0) : (goals.home ?? 0));
      const result: "W" | "D" | "L" = gf > ga ? "W" : gf < ga ? "L" : "D";
      const status = (fixture.status as Record<string, unknown>)?.short as string;

      return {
        date: ((fixture.date as string) || "").split("T")[0],
        opponent: String((opponent as Record<string, unknown>).name || ""),
        homeAway: isHome ? "H" as const : "A" as const,
        goalsFor: gf,
        goalsAgainst: ga,
        result,
        competition: String((league as Record<string, unknown>).name || ""),
        status,
      };
    });

    const response = NextResponse.json({
      teamName: team, teamId, last5, fetchedAt: Date.now(),
    });

    response.headers.set("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=3600");
    return response;

  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
