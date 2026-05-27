import { NextRequest, NextResponse } from "next/server";

// football-data.org: query the 2026 World Cup competition for team matches
// Competition code WC = FIFA World Cup, works once tournament starts
// Pre-tournament: returns empty, admin fills manually via admin panel

// Area IDs (not team IDs) — used to identify national teams in WC matches
const TEAM_TLA_MAP: Record<string, string> = {
  "England": "ENG", "France": "FRA", "Germany": "GER", "Spain": "ESP",
  "Brazil": "BRA", "Argentina": "ARG", "Portugal": "POR", "Netherlands": "NED",
  "Belgium": "BEL", "Croatia": "CRO", "Uruguay": "URU", "Mexico": "MEX",
  "USA": "USA", "Canada": "CAN", "South Korea": "KOR", "Japan": "JPN",
  "Australia": "AUS", "Morocco": "MAR", "Senegal": "SEN", "Ghana": "GHA",
  "Tunisia": "TUN", "Ivory Coast": "CIV", "Egypt": "EGY", "Algeria": "ALG",
  "Colombia": "COL", "Ecuador": "ECU", "Paraguay": "PAR", "Norway": "NOR",
  "Sweden": "SWE", "Switzerland": "SUI", "Austria": "AUT", "Serbia": "SRB",
  "Czechia": "CZE", "Scotland": "SCO", "Türkiye": "TUR", "Panama": "PAN",
  "Haiti": "HAI", "South Africa": "RSA", "Saudi Arabia": "KSA", "Qatar": "QAT",
  "Iraq": "IRQ", "Jordan": "JOR", "New Zealand": "NZL", "Uzbekistan": "UZB",
  "DR Congo": "COD", "Cape Verde": "CPV", "Curaçao": "CUW",
  "Bosnia & Herzegovina": "BIH",
};

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get("team");
  if (!team) return NextResponse.json({ error: "Missing team", last5: [] }, { status: 400 });

  const tla = TEAM_TLA_MAP[team];
  if (!tla) return NextResponse.json({ teamName: team, last5: [], note: "No TLA mapped" });

  const apiKey = process.env.FOOTBALL_API_KEY || process.env.NEXT_PUBLIC_FOOTBALL_API_KEY;
  if (!apiKey) return NextResponse.json({ teamName: team, last5: [], error: "No API key" });

  try {
    // Query the World Cup 2026 competition matches for this team
    const url = `https://api.football-data.org/v4/competitions/WC/matches?status=FINISHED`;

    const res = await fetch(url, {
      headers: { "X-Auth-Token": apiKey },
      next: { revalidate: 3600 }, // refresh every hour during tournament
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ teamName: team, last5: [], error: `API ${res.status}: ${text}` });
    }

    const data = await res.json();
    const allMatches = (data.matches || []) as Record<string, unknown>[];

    // Filter to this team's matches
    const teamMatches = allMatches.filter(m => {
      const home = m.homeTeam as Record<string, unknown>;
      const away = m.awayTeam as Record<string, unknown>;
      return (home.tla as string) === tla || (away.tla as string) === tla;
    });

    const last5 = teamMatches.slice(-5).map(m => {
      const home = m.homeTeam as Record<string, unknown>;
      const away = m.awayTeam as Record<string, unknown>;
      const ft = ((m.score as Record<string, unknown>)?.fullTime as Record<string, number>) || {};
      const isHome = (home.tla as string) === tla;
      const gf = Number(isHome ? (ft.home ?? 0) : (ft.away ?? 0));
      const ga = Number(isHome ? (ft.away ?? 0) : (ft.home ?? 0));
      const result: "W" | "D" | "L" = gf > ga ? "W" : gf < ga ? "L" : "D";
      return {
        date: ((m.utcDate as string) || "").split("T")[0],
        opponent: String(isHome ? (away.name || away.tla || "") : (home.name || home.tla || "")),
        homeAway: "N" as "H" | "A", // World Cup = neutral venue
        goalsFor: gf,
        goalsAgainst: ga,
        result,
        competition: "FIFA World Cup 2026",
      };
    });

    const response = NextResponse.json({ teamName: team, tla, last5, fetchedAt: Date.now() });
    response.headers.set("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=600");
    return response;

  } catch (err) {
    return NextResponse.json({ teamName: team, last5: [], error: String(err) });
  }
}
