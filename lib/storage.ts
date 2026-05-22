import { Player, AdminState } from "@/app/data/types";
import { POINTS } from "@/app/data/worldcup";

const PLAYERS_KEY = "wc2026_players";
const ADMIN_KEY = "wc2026_admin";
const CURRENT_USER_KEY = "wc2026_current";

export function getPlayers(): Player[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(PLAYERS_KEY);
  return raw ? JSON.parse(raw) : [];
}

export function savePlayers(players: Player[]) {
  localStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
}

export function getPlayer(id: string): Player | null {
  return getPlayers().find((p) => p.id === id) || null;
}

export function savePlayer(player: Player) {
  const players = getPlayers();
  const idx = players.findIndex((p) => p.id === player.id);
  if (idx >= 0) players[idx] = player;
  else players.push(player);
  savePlayers(players);
}

export function getCurrentUserId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(CURRENT_USER_KEY);
}

export function setCurrentUserId(id: string | null) {
  if (id) localStorage.setItem(CURRENT_USER_KEY, id);
  else localStorage.removeItem(CURRENT_USER_KEY);
}

export function getAdminState(): AdminState {
  if (typeof window === "undefined")
    return { isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "" };
  const raw = localStorage.getItem(ADMIN_KEY);
  return raw
    ? JSON.parse(raw)
    : { isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "" };
}

export function saveAdminState(state: AdminState) {
  localStorage.setItem(ADMIN_KEY, JSON.stringify(state));
}

export function calculatePlayerPoints(player: Player, adminState: AdminState): number {
  let total = 0;
  const results = adminState.results;

  // Group predictions
  for (const [matchId, pred] of Object.entries(player.groupPredictions)) {
    const actual = results.group[matchId];
    if (!actual) continue;
    const predHome = parseInt(pred.home);
    const predAway = parseInt(pred.away);
    const actHome = parseInt(actual.home);
    const actAway = parseInt(actual.away);
    if (isNaN(predHome) || isNaN(predAway) || isNaN(actHome) || isNaN(actAway)) continue;
    if (predHome === actHome && predAway === actAway) {
      total += POINTS.EXACT_SCORE;
    } else {
      const predResult = predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
      const actResult = actHome > actAway ? "H" : actHome < actAway ? "A" : "D";
      if (predResult === actResult) total += POINTS.CORRECT_RESULT;
    }
  }

  // Knockout predictions
  for (const [matchId, pred] of Object.entries(player.knockoutPredictions)) {
    const actual = results.knockout[matchId];
    if (!actual) continue;
    const predHome = parseInt(pred.homeScore);
    const predAway = parseInt(pred.awayScore);
    const actHome = parseInt(actual.homeScore);
    const actAway = parseInt(actual.awayScore);
    if (isNaN(predHome) || isNaN(predAway) || isNaN(actHome) || isNaN(actAway)) continue;
    if (predHome === actHome && predAway === actAway) {
      total += POINTS.EXACT_SCORE;
    } else {
      const predResult = predHome > predAway ? "H" : predHome < predAway ? "A" : "D";
      const actResult = actHome > actAway ? "H" : actHome < actAway ? "A" : "D";
      if (predResult === actResult) total += POINTS.CORRECT_RESULT;
    }
  }

  // Bonus for top scorer / assist
  if (adminState.topScorer && player.topScorer === adminState.topScorer) total += 15;
  if (adminState.topAssist && player.topAssist === adminState.topAssist) total += 10;

  return total;
}
