import { supabase } from "./supabase";
import { Player, AdminState } from "@/app/data/types";
import { POINTS } from "@/app/data/worldcup";

// Current user stored in localStorage (just the ID)
const CURRENT_USER_KEY = "wc2026_current";

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_USER_KEY, id);
  else localStorage.removeItem(CURRENT_USER_KEY);
}

export async function getPlayers(): Promise<Player[]> {
  const { data, error } = await supabase.from("players").select("*");
  if (error) { console.error(error); return []; }
  return (data || []).map(dbToPlayer);
}

export async function getPlayer(id: string): Promise<Player | null> {
  const { data, error } = await supabase.from("players").select("*").eq("id", id).single();
  if (error || !data) return null;
  return dbToPlayer(data);
}

export async function getPlayerByEmail(email: string): Promise<Player | null> {
  const { data, error } = await supabase.from("players").select("*").eq("email", email.toLowerCase()).single();
  if (error || !data) return null;
  return dbToPlayer(data);
}

export async function savePlayer(player: Player): Promise<void> {
  const { error } = await supabase.from("players").upsert({
    id: player.id,
    name: player.name,
    email: player.email.toLowerCase(),
    team_name: player.teamName,
    top_scorer: player.topScorer,
    top_assist: player.topAssist,
    group_predictions: player.groupPredictions,
    knockout_predictions: player.knockoutPredictions,
    created_at: player.createdAt,
  });
  if (error) console.error("Save player error:", error);
}

export async function getAdminState(): Promise<AdminState> {
  const { data, error } = await supabase.from("admin_state").select("*").eq("id", 1).single();
  if (error || !data) return { isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "" };
  return {
    isAdmin: false,
    results: data.results || { group: {}, knockout: {} },
    topScorer: data.top_scorer || "",
    topAssist: data.top_assist || "",
  };
}

export async function saveAdminState(state: AdminState): Promise<void> {
  const { error } = await supabase.from("admin_state").upsert({
    id: 1,
    results: state.results,
    top_scorer: state.topScorer,
    top_assist: state.topAssist,
  });
  if (error) console.error("Save admin error:", error);
}

function dbToPlayer(data: Record<string, unknown>): Player {
  return {
    id: data.id as string,
    name: data.name as string,
    email: data.email as string,
    teamName: data.team_name as string,
    topScorer: (data.top_scorer as string) || "",
    topAssist: (data.top_assist as string) || "",
    groupPredictions: (data.group_predictions as Player["groupPredictions"]) || {},
    knockoutPredictions: (data.knockout_predictions as Player["knockoutPredictions"]) || {},
    createdAt: data.created_at as string,
  };
}

export function calculatePlayerPoints(player: Player, adminState: AdminState): number {
  let total = 0;
  const results = adminState.results;

  for (const [matchId, pred] of Object.entries(player.groupPredictions)) {
    const actual = results.group[matchId];
    if (!actual) continue;
    const predHome = parseInt(pred.home), predAway = parseInt(pred.away);
    const actHome = parseInt(actual.home), actAway = parseInt(actual.away);
    if (isNaN(predHome) || isNaN(predAway) || isNaN(actHome) || isNaN(actAway)) continue;
    if (predHome === actHome && predAway === actAway) {
      total += POINTS.EXACT_SCORE;
    } else {
      const predResult = predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
      const actResult = actHome > actAway ? "H" : actHome < actAway ? "A" : "D";
      if (predResult === actResult) total += POINTS.CORRECT_RESULT;
    }
  }

  for (const [matchId, pred] of Object.entries(player.knockoutPredictions)) {
    const actual = results.knockout[matchId];
    if (!actual) continue;
    const predHome = parseInt(pred.homeScore), predAway = parseInt(pred.awayScore);
    const actHome = parseInt(actual.homeScore), actAway = parseInt(actual.awayScore);
    if (isNaN(predHome) || isNaN(predAway) || isNaN(actHome) || isNaN(actAway)) continue;
    if (predHome === actHome && predAway === actAway) {
      total += POINTS.EXACT_SCORE;
    } else {
      const predResult = predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
      const actResult = actHome > actAway ? "H" : actHome < actAway ? "A" : "D";
      if (predResult === actResult) total += POINTS.CORRECT_RESULT;
    }
  }

  if (adminState.topScorer && player.topScorer === adminState.topScorer) total += 15;
  if (adminState.topAssist && player.topAssist === adminState.topAssist) total += 10;

  return total;
}
