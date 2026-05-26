import { NextRequest, NextResponse } from "next/server";

// API-Football national team IDs
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

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get("team");

  if (!team) {
    return NextResponse.json({ error: "Missing team parameter" }, { status: 400 });
  }

  const teamId = TEAM_ID_MAP[team];
  if (!teamId) {
    return NextResponse.json({ error: `Unknown team: ${team}` }, { status: 404 });
  }

  const apiKey = process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "API key not configured" }, { status: 503 });
  }

  try {
    const res = await fetch(
      `https://v3.football.api-sports.io/fixtures?team=${teamId}&last=5&status=FT`,
      {
        headers: {
          "x-apisports-key": apiKey,
          "x-rapidapi-host": "v3.football.api-sports.io",
        },
        // Vercel edge cache: revalidate every 24 hours
        next: { revalidate: 86400 },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: `API-Football error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const fixtures = data.response || [];

    const last5 = fixtures
      .slice(-5)
      .reverse()
      .map((f: Record<string, unknown>) => {
        const fixture = f.fixture as Record<string, unknown>;
        const teams = f.teams as Record<string, Record<string, unknown>>;
        const goals = f.goals as Record<string, number | null>;
        const league = f.league as Record<string, unknown>;

        const isHome = Number((teams.home as Record<string, unknown>).id) === teamId;
        const opponentInfo = isHome ? teams.away : teams.home;
        const gf = isHome ? (goals.home ?? 0) : (goals.away ?? 0);
        const ga = isHome ? (goals.away ?? 0) : (goals.home ?? 0);
        const result: "W" | "D" | "L" = gf > ga ? "W" : gf < ga ? "L" : "D";

        return {
          date: ((fixture.date as string) || "").split("T")[0],
          opponent: String((opponentInfo as Record<string, unknown>).name || ""),
          homeAway: isHome ? "H" : "A",
          goalsFor: Number(gf),
          goalsAgainst: Number(ga),
          result,
          competition: String((league as Record<string, unknown>).name || ""),
        };
      });

    const response = NextResponse.json({
      teamName: team,
      teamId,
      last5,
      fetchedAt: Date.now(),
    });

    // Tell Vercel CDN to cache for 24 hours, allow stale for 1 hour while revalidating
    response.headers.set(
      "Cache-Control",
      "public, s-maxage=86400, stale-while-revalidate=3600"
    );

    return response;
  } catch (err) {
    console.error(`Form API error for ${team}:`, err);
    return NextResponse.json({ error: "Fetch failed" }, { status: 500 });
  }
}
