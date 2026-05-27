import { NextRequest, NextResponse } from "next/server";

// football-data.org national team IDs
const TEAM_ID_MAP: Record<string, number> = {
  "England": 66,
  "France": 23,
  "Germany": 759,
  "Spain": 760,
  "Brazil": 764,
  "Argentina": 762,
  "Portugal": 765,
  "Netherlands": 761,
  "Belgium": 763,
  "Croatia": 799,
  "Uruguay": 788,
  "Mexico": 787,
  "USA": 768,
  "Canada": 769,
  "South Korea": 772,
  "Japan": 771,
  "Australia": 770,
  "Morocco": 1978,
  "Senegal": 1975,
  "Ghana": 1992,
  "Tunisia": 1979,
  "Ivory Coast": 1977,
  "Egypt": 1990,
  "Algeria": 1970,
  "Colombia": 786,
  "Ecuador": 785,
  "Paraguay": 783,
  "Norway": 780,
  "Sweden": 779,
  "Switzerland": 777,
  "Austria": 776,
  "Serbia": 802,
  "Czechia": 798,
  "Scotland": 773,
  "Türkiye": 803,
  "Bosnia & Herzegovina": 801,
  "Panama": 790,
  "Haiti": 789,
  "South Africa": 1988,
  "Saudi Arabia": 1976,
  "Qatar": 1991,
  "Iraq": 1993,
  "Jordan": 1994,
  "New Zealand": 1995,
  "Uzbekistan": 1980,
  "DR Congo": 1989,
  "Cape Verde": 1996,
  "Curaçao": 1997,
};

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get("team");
  if (!team) return NextResponse.json({ error: "Missing team", last5: [] }, { status: 400 });

  const teamId = TEAM_ID_MAP[team];
  if (!teamId) {
    return NextResponse.json({ teamName: team, last5: [], note: `No ID mapped for: ${team}` });
  }

  const apiKey = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "No API key", last5: [] });

  try {
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const url = `https://api.football-data.org/v4/teams/${teamId}/matches?status=FINISHED&dateFrom=${from}&dateTo=${to}&limit=10`;

    const res = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `API ${res.status}: ${text}`, last5: [], teamId });
    }

    const data = await res.json();
    const matches = (data.matches || []) as Record<string, unknown>[];

    const last5 = matches
      .filter(m => (m.status as string) === "FINISHED")
      .slice(-5)
      .map(m => {
        const home = m.homeTeam as Record<string, unknown>;
        const away = m.awayTeam as Record<string, unknown>;
        const ft = ((m.score as Record<string, unknown>)?.fullTime as Record<string, number>) || {};
        const isHome = Number(home.id) === teamId;
        const gf = Number(isHome ? (ft.home ?? 0) : (ft.away ?? 0));
        const ga = Number(isHome ? (ft.away ?? 0) : (ft.home ?? 0));
        const result: "W" | "D" | "L" = gf > ga ? "W" : gf < ga ? "L" : "D";
        return {
          date: ((m.utcDate as string) || "").split("T")[0],
          opponent: String(isHome ? (away.shortName || away.name || "") : (home.shortName || home.name || "")),
          homeAway: isHome ? "H" as const : "A" as const,
          goalsFor: gf,
          goalsAgainst: ga,
          result,
          competition: String(((m.competition as Record<string, unknown>)?.name) || ""),
        };
      });

    const response = NextResponse.json({ teamName: team, teamId, last5, fetchedAt: Date.now() });
    response.headers.set("Cache-Control", "public, s-maxage=86400, stale-while-revalidate=3600");
    return response;

  } catch (err) {
    return NextResponse.json({ error: String(err), last5: [] });
  }
}
