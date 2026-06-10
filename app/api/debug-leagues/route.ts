import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  // Get first 5 players and their raw league_ids
  const { data: players } = await supabase
    .from("players")
    .select("id, name, league_ids, current_league_id")
    .limit(5);

  // Try contains query for original league
  const ORIG = "aaaaaaaa-0000-0000-0000-000000000001";
  const { data: inLeague } = await supabase
    .from("players")
    .select("id, name, league_ids")
    .contains("league_ids", [ORIG]);

  // Try filter query as alternative
  const { data: withFilter } = await supabase
    .from("players")
    .select("id, name, league_ids")
    .filter("league_ids", "cs", `["${ORIG}"]`);

  return NextResponse.json({
    sample_players: players,
    contains_result_count: inLeague?.length,
    filter_result_count: withFilter?.length,
    contains_results: inLeague?.map(p => p.name),
    filter_results: withFilter?.map(p => p.name),
  });
}
