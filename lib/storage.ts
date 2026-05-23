import { supabase } from "./supabase";
import { Player, AdminState, FantasySquad, PlayerStat, FANTASY_POINTS } from "@/app/data/types";
import { POINTS } from "@/app/data/worldcup";

const CURRENT_USER_KEY = "wc2026_current";

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_USER_KEY, id);
  else localStorage.removeItem(CURRENT_USER_KEY);
}

// ── Players ──────────────────────────────────────────────
export async function getPlayers(): Promise<Player[]> {
  const { data } = await supabase.from("players").select("*");
  return (data || []).map(dbToPlayer);
}

export async function getPlayer(id: string): Promise<Player | null> {
  const { data } = await supabase.from("players").select("*").eq("id", id).single();
  return data ? dbToPlayer(data) : null;
}

export async function getPlayerByEmail(email: string): Promise<Player | null> {
  const { data } = await supabase.from("players").select("*").eq("email", email.toLowerCase()).single();
  return data ? dbToPlayer(data) : null;
}

export async function savePlayer(player: Player): Promise<void> {
  await supabase.from("players").upsert({
    id: player.id, name: player.name, email: player.email.toLowerCase(),
    team_name: player.teamName, top_scorer: player.topScorer, top_assist: player.topAssist,
    avatar_url: player.avatarUrl || "",
    tournament_winner: player.tournamentWinner || "",
    player_of_tournament: player.playerOfTournament || "",
    group_predictions: player.groupPredictions, knockout_predictions: player.knockoutPredictions,
    created_at: player.createdAt,
  });
}

function dbToPlayer(data: Record<string, unknown>): Player {
  return {
    id: data.id as string, name: data.name as string, email: data.email as string,
    teamName: data.team_name as string, topScorer: (data.top_scorer as string) || "",
    topAssist: (data.top_assist as string) || "",
    avatarUrl: (data.avatar_url as string) || "",
    tournamentWinner: (data.tournament_winner as string) || "",
    playerOfTournament: (data.player_of_tournament as string) || "",
    groupPredictions: (data.group_predictions as Player["groupPredictions"]) || {},
    knockoutPredictions: (data.knockout_predictions as Player["knockoutPredictions"]) || {},
    createdAt: data.created_at as string,
  };
}

// ── Avatar Upload ─────────────────────────────────────────
export async function uploadAvatar(playerId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${playerId}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
  if (error) { console.error("Avatar upload error:", error); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Add cache-bust so updated images show immediately
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── Admin ─────────────────────────────────────────────────
export async function getAdminState(): Promise<AdminState> {
  const { data } = await supabase.from("admin_state").select("*").eq("id", 1).single();
  if (!data) return { isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "", tournamentWinner: "", playerOfTournament: "", predictionsLocked: false, lockTime: null };
  return {
    isAdmin: false,
    results: data.results || { group: {}, knockout: {} },
    topScorer: data.top_scorer || "",
    topAssist: data.top_assist || "",
    tournamentWinner: data.tournament_winner || "",
    playerOfTournament: data.player_of_tournament || "",
    predictionsLocked: data.predictions_locked || false,
    lockTime: data.lock_time || null,
  };
}

export async function saveAdminState(state: AdminState): Promise<void> {
  await supabase.from("admin_state").upsert({
    id: 1, results: state.results, top_scorer: state.topScorer, top_assist: state.topAssist,
    tournament_winner: state.tournamentWinner || "",
    player_of_tournament: state.playerOfTournament || "",
    predictions_locked: state.predictionsLocked,
    lock_time: state.lockTime,
  });
}

// ── Lock check ────────────────────────────────────────────
export function isPredictionLocked(adminState: AdminState): boolean {
  if (adminState.predictionsLocked) return true;
  if (adminState.lockTime) {
    return new Date() >= new Date(adminState.lockTime);
  }
  return false;
}

// ── Fantasy Squads ────────────────────────────────────────
export async function getFantasySquad(playerId: string): Promise<FantasySquad | null> {
  const { data } = await supabase.from("fantasy_squads").select("*").eq("player_id", playerId).single();
  if (!data) return null;
  return { id: data.id, playerId: data.player_id, squad: data.squad || [], round: data.round, updatedAt: data.updated_at };
}

export async function getAllFantasySquads(): Promise<FantasySquad[]> {
  const { data } = await supabase.from("fantasy_squads").select("*");
  return (data || []).map((d) => ({ id: d.id, playerId: d.player_id, squad: d.squad || [], round: d.round, updatedAt: d.updated_at }));
}

export async function saveFantasySquad(squad: FantasySquad): Promise<void> {
  await supabase.from("fantasy_squads").upsert({ id: squad.playerId, player_id: squad.playerId, squad: squad.squad, round: squad.round, updated_at: new Date().toISOString() });
}

// ── Player Stats ──────────────────────────────────────────
export async function getAllPlayerStats(): Promise<PlayerStat[]> {
  const { data } = await supabase.from("player_stats").select("*");
  return (data || []).map(dbToStat);
}

export async function savePlayerStat(stat: PlayerStat): Promise<void> {
  await supabase.from("player_stats").upsert({
    id: stat.id, player_name: stat.playerName, country: stat.country,
    goals: stat.goals, assists: stat.assists, clean_sheets: stat.cleanSheets,
    yellow_cards: stat.yellowCards, red_cards: stat.redCards, saves: stat.saves,
    minutes_played: stat.minutesPlayed, round: stat.round,
  });
}

export async function deletePlayerStat(id: string): Promise<void> {
  await supabase.from("player_stats").delete().eq("id", id);
}

function dbToStat(data: Record<string, unknown>): PlayerStat {
  return {
    id: data.id as string, playerName: data.player_name as string, country: data.country as string,
    goals: (data.goals as number) || 0, assists: (data.assists as number) || 0,
    cleanSheets: (data.clean_sheets as number) || 0, yellowCards: (data.yellow_cards as number) || 0,
    redCards: (data.red_cards as number) || 0, saves: (data.saves as number) || 0,
    minutesPlayed: (data.minutes_played as number) || 0, round: data.round as string,
  };
}

// ── Points Calculators ────────────────────────────────────
export function calculatePlayerPoints(player: Player, adminState: AdminState): number {
  let total = 0;
  const results = adminState.results;
  for (const [matchId, pred] of Object.entries(player.groupPredictions)) {
    const actual = results.group[matchId];
    if (!actual) continue;
    const [ph, pa, ah, aa] = [parseInt(pred.home), parseInt(pred.away), parseInt(actual.home), parseInt(actual.away)];
    if (isNaN(ph) || isNaN(pa) || isNaN(ah) || isNaN(aa)) continue;
    if (ph === ah && pa === aa) { total += POINTS.EXACT_SCORE; continue; }
    const pr = ph > pa ? "H" : ph < pa ? "A" : "D";
    const ar = ah > aa ? "H" : ah < aa ? "A" : "D";
    if (pr === ar) total += POINTS.CORRECT_RESULT;
  }
  for (const [matchId, pred] of Object.entries(player.knockoutPredictions)) {
    const actual = results.knockout[matchId];
    if (!actual) continue;
    const [ph, pa, ah, aa] = [parseInt(pred.homeScore), parseInt(pred.awayScore), parseInt(actual.homeScore), parseInt(actual.awayScore)];
    if (isNaN(ph) || isNaN(pa) || isNaN(ah) || isNaN(aa)) continue;
    if (ph === ah && pa === aa) { total += POINTS.EXACT_SCORE; continue; }
    const pr = ph > pa ? "H" : ph < pa ? "A" : "D";
    const ar = ah > aa ? "H" : ah < aa ? "A" : "D";
    if (pr === ar) total += POINTS.CORRECT_RESULT;
  }
  if (adminState.topScorer && player.topScorer === adminState.topScorer) total += 15;
  if (adminState.topAssist && player.topAssist === adminState.topAssist) total += 10;
  if (adminState.tournamentWinner && player.tournamentWinner === adminState.tournamentWinner) total += 25;
  if (adminState.playerOfTournament && player.playerOfTournament === adminState.playerOfTournament) total += 20;
  return total;
}

export function calculateFantasyPoints(squad: FantasySquad, stats: PlayerStat[]): number {
  let total = 0;
  for (const fp of squad.squad) {
    const playerStats = stats.filter((s) => s.playerName === fp.name);
    for (const s of playerStats) {
      if (fp.position === "FWD") total += s.goals * FANTASY_POINTS.GOAL_FWD;
      else if (fp.position === "MID") total += s.goals * FANTASY_POINTS.GOAL_MID;
      else if (fp.position === "DEF") total += s.goals * FANTASY_POINTS.GOAL_DEF;
      else if (fp.position === "GK") total += s.goals * FANTASY_POINTS.GOAL_GK;
      total += s.assists * FANTASY_POINTS.ASSIST;
      if (fp.position === "GK" || fp.position === "DEF") total += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_GK_DEF;
      else if (fp.position === "MID") total += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_MID;
      total += s.yellowCards * FANTASY_POINTS.YELLOW_CARD;
      total += s.redCards * FANTASY_POINTS.RED_CARD;
      if (fp.position === "GK") total += Math.floor(s.saves / 3) * FANTASY_POINTS.SAVE_SET;
      if (s.minutesPlayed >= 60) total += FANTASY_POINTS.PLAYED_60;
      else if (s.minutesPlayed > 0) total += FANTASY_POINTS.PLAYED_SUB_60;
    }
  }
  return total;
}
