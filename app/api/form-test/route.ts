import { NextRequest, NextResponse } from "next/server";

// TheSportsDB team IDs for national football teams
// Free tier - no API key needed, just use key "3" in the URL
const TEAM_ID_MAP: Record<string, number> = {
  "England": 133604,
  "France": 133609,
  "Germany": 133610,
  "Spain": 133600,
  "Brazil": 133606,
  "Argentina": 133597,
  "Portugal": 133612,
  "Netherlands": 133629,
  "Belgium": 133601,
  "Croatia": 133607,
  "Uruguay": 133619,
  "Mexico": 133616,
  "USA": 133620,
  "Canada": 133605,
  "South Korea": 133615,
  "Japan": 133613,
  "Australia": 133599,
  "Morocco": 133617,
  "Senegal": 133634,
  "Ghana": 133611,
  "Tunisia": 133618,
  "Ivory Coast": 133642,
  "Egypt": 133608,
  "Algeria": 133596,
  "Colombia": 133625,
  "Ecuador": 133627,
  "Paraguay": 133631,
  "Norway": 133630,
  "Sweden": 133635,
  "Switzerland": 133636,
  "Austria": 133598,
  "Serbia": 133633,
  "Czechia": 133626,
  "Scotland": 133602,
  "Türkiye": 133637,
  "Bosnia & Herzegovina": 133622,
  "Panama": 133632,
  "South Africa": 133603,
  "Saudi Arabia": 133614,
  "Qatar": 133640,
  "Iraq": 133641,
  "Jordan": 133643,
  "New Zealand": 133644,
  "Uzbekistan": 133645,
  "DR Congo": 133646,
  "Cape Verde": 133647,
  "Curaçao": 133648,
  "Haiti": 133649,
};

export async function GET(request: NextRequest) {
  const team = request.nextUrl.searchParams.get("team");
  if (!team) return NextResponse.json({ error: "Missing team" }, { status: 400 });

  const teamId = TEAM_ID_MAP[team];
  if (!teamId) {
    return NextResponse.json({ teamName: team, last5: [], note: `No ID for: ${team}` });
  }

  try {
    // TheSportsDB - last 5 events for a team, free with key "3"
    const url = `https://www.thesportsdb.com/api/v1/json/3/eventslast.php?id=${teamId}`;

    const res = await fetch(url, { next: { revalidate: 86400 } });

    if (!res.ok) {
      return NextResponse.json({ teamName: team, last5: [], error: `HTTP ${res.status}`, url });
    }

    const data = await res.json();

    // Return raw for inspection
    return NextResponse.json({
      teamName: team,
      teamId,
      url,
      raw: data,
    });

  } catch (err) {
    return NextResponse.json({ teamName: team, last5: [], error: String(err) });
  }
}
