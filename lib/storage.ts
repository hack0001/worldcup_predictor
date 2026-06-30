import { supabase } from "./supabase";
import { Player, AdminState, FantasySquad, PlayerStat, POINTS, FANTASY_POINTS, KnockoutResult } from "@/app/data/types";
import { GROUPS, GROUP_MATCHES, KNOCKOUT_MATCHES } from "@/app/data/worldcup";

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
    status: player.status || "",
    league_ids: player.leagueIds || [],
    current_league_id: player.currentLeagueId || "",
    tournament_winner: player.tournamentWinner || "",
    player_of_tournament: player.playerOfTournament || "",
    group_predictions: player.groupPredictions,
    knockout_predictions: player.knockoutPredictions,
    created_at: player.createdAt,
  });
}
function dbToPlayer(data: Record<string, unknown>): Player {
  return {
    id: data.id as string, name: data.name as string, email: data.email as string,
    teamName: data.team_name as string, topScorer: (data.top_scorer as string) || "",
    topAssist: (data.top_assist as string) || "",
    avatarUrl: (data.avatar_url as string) || "",
    status: (data.status as string) || "",
    leagueIds: (data.league_ids as string[]) || [],
    currentLeagueId: (data.current_league_id as string) || "",
    tournamentWinner: (data.tournament_winner as string) || "",
    playerOfTournament: (data.player_of_tournament as string) || "",
    groupPredictions: (data.group_predictions as Player["groupPredictions"]) || {},
    knockoutPredictions: (data.knockout_predictions as Player["knockoutPredictions"]) || {},
    createdAt: data.created_at as string,
  };
}

// ── Avatar ────────────────────────────────────────────────
export async function uploadAvatar(playerId: string, file: File): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${playerId}.${ext}`;
  const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
  if (error) { console.error("Avatar upload error:", error); return null; }
  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  return `${data.publicUrl}?t=${Date.now()}`;
}

// ── Admin ─────────────────────────────────────────────────
export async function getAdminState(): Promise<AdminState> {
  const { data } = await supabase.from("admin_state").select("*").eq("id", 1).single();
  if (!data) return { isAdmin: false, results: { group: {}, knockout: {} }, topScorer: "", topAssist: "", tournamentWinner: "", playerOfTournament: "", predictionsLocked: false, lockTime: null, fantasyLocked: false, bonusLocked: false };
  return {
    isAdmin: false,
    results: data.results || { group: {}, knockout: {} },
    topScorer: data.top_scorer || "",
    topAssist: data.top_assist || "",
    tournamentWinner: data.tournament_winner || "",
    playerOfTournament: data.player_of_tournament || "",
    predictionsLocked: data.predictions_locked || false,
    lockTime: data.lock_time || null,
    fantasyLocked: data.fantasy_locked || false,
    bonusLocked: data.bonus_locked || false,
  };
}
export async function saveAdminState(state: AdminState): Promise<void> {
  await supabase.from("admin_state").upsert({
    id: 1, results: state.results,
    top_scorer: state.topScorer, top_assist: state.topAssist,
    tournament_winner: state.tournamentWinner || "",
    player_of_tournament: state.playerOfTournament || "",
    predictions_locked: state.predictionsLocked,
    lock_time: state.lockTime,
    fantasy_locked: state.fantasyLocked || false,
    bonus_locked: state.bonusLocked || false,
  });
}
export function isPredictionLocked(adminState: AdminState): boolean {
  if (adminState.predictionsLocked) return true;
  if (adminState.lockTime) return new Date() >= new Date(adminState.lockTime);
  return false;
}

// ── Fantasy ───────────────────────────────────────────────
export async function getFantasySquad(playerId: string): Promise<FantasySquad | null> {
  const { data, error } = await supabase.from("fantasy_squads").select("*").eq("player_id", playerId).maybeSingle();
  if (error) { console.error("getFantasySquad error:", error.message); return null; }
  if (!data) return null;
  return { id: data.id, playerId: data.player_id, squad: data.squad || [], history: data.history || [], transfers: data.transfers || [], round: data.round, updatedAt: data.updated_at };
}
export async function getAllFantasySquads(): Promise<FantasySquad[]> {
  const { data } = await supabase.from("fantasy_squads").select("*");
  return (data || []).map(d => ({ id: d.id, playerId: d.player_id, squad: d.squad || [], history: d.history || [], transfers: d.transfers || [], round: d.round, updatedAt: d.updated_at }));
}
export async function saveFantasySquad(squad: FantasySquad): Promise<void> {
  const { error } = await supabase.from("fantasy_squads").upsert({ id: squad.playerId, player_id: squad.playerId, squad: squad.squad, history: squad.history || [], transfers: squad.transfers || [], round: squad.round, updated_at: new Date().toISOString() });
  if (error) console.error("saveFantasySquad error:", error.message);
}

// ── Player Stats ──────────────────────────────────────────
export async function getAllPlayerStats(): Promise<PlayerStat[]> {
  const { data } = await supabase.from("player_stats").select("*");
  return (data || []).map(d => ({
    id: d.id as string, playerName: d.player_name as string, country: d.country as string,
    goals: (d.goals as number) || 0, assists: (d.assists as number) || 0,
    cleanSheets: (d.clean_sheets as number) || 0, yellowCards: (d.yellow_cards as number) || 0,
    redCards: (d.red_cards as number) || 0, saves: (d.saves as number) || 0,
    minutesPlayed: (d.minutes_played as number) || 0, ownGoals: (d.own_goals as number) || 0, round: d.round as string,
    matchId: d.match_id as string || undefined,
    matchLabel: d.match_label as string || undefined,
  }));
}

export async function savePlayerStat(stat: PlayerStat): Promise<void> {
  // Per-match: upsert by player_name + match_id (unique combo)
  // If no matchId, fall back to deleting all rows for player (legacy behaviour)
  if (stat.matchId) {
    const { error } = await supabase.from("player_stats").upsert({
      id: stat.id, player_name: stat.playerName, country: stat.country,
      goals: stat.goals, assists: stat.assists, clean_sheets: stat.cleanSheets,
      yellow_cards: stat.yellowCards, red_cards: stat.redCards, saves: stat.saves,
      minutes_played: stat.minutesPlayed, own_goals: stat.ownGoals || 0, round: stat.round,
      match_id: stat.matchId, match_label: stat.matchLabel || "",
    }, { onConflict: "player_name,match_id" });
    if (error) console.error("Upsert error:", error.message, error.code);
  } else {
    const { error: delErr } = await supabase.from("player_stats").delete().eq("player_name", stat.playerName);
    if (delErr) console.error("Delete error:", delErr);
    const { error: insErr } = await supabase.from("player_stats").insert({
      id: stat.id, player_name: stat.playerName, country: stat.country,
      goals: stat.goals, assists: stat.assists, clean_sheets: stat.cleanSheets,
      yellow_cards: stat.yellowCards, red_cards: stat.redCards, saves: stat.saves,
      minutes_played: stat.minutesPlayed, own_goals: stat.ownGoals || 0, round: stat.round,
    });
    if (insErr) console.error("Insert error:", insErr.message, insErr.code);
  }
}
export async function deletePlayerStat(id: string): Promise<void> {
  await supabase.from("player_stats").delete().eq("id", id);
}

// ── Group standings helper ────────────────────────────────
function calcGroupStandings(group: string, groupResults: AdminState["results"]["group"]) {
  const teams = GROUPS[group];
  const s: Record<string, { pts: number; gd: number; gf: number }> = {};
  teams.forEach(t => { s[t.team] = { pts: 0, gd: 0, gf: 0 }; });
  for (const m of GROUP_MATCHES.filter(m => m.group === group)) {
    const r = groupResults[m.id];
    if (!r || r.home === "" || r.away === "") continue;
    const h = parseInt(r.home), a = parseInt(r.away);
    if (isNaN(h) || isNaN(a)) continue;
    s[m.home.team].gf += h; s[m.away.team].gf += a;
    s[m.home.team].gd += h - a; s[m.away.team].gd += a - h;
    if (h > a) { s[m.home.team].pts += 3; }
    else if (a > h) { s[m.away.team].pts += 3; }
    else { s[m.home.team].pts++; s[m.away.team].pts++; }
  }
  return Object.entries(s)
    .sort(([, a], [, b]) => b.pts - a.pts || b.gd - a.gd || b.gf - a.gf)
    .map(([team]) => team);
}

function isGroupComplete(group: string, groupResults: AdminState["results"]["group"]) {
  return GROUP_MATCHES.filter(m => m.group === group).every(m => {
    const r = groupResults[m.id];
    return r && r.home !== "" && r.away !== "";
  });
}

// Which round does a knockout match belong to?
function getKnockoutRound(matchId: string): "early" | "late" {
  const earlyRounds = ["r32", "r16"];
  for (const r of earlyRounds) {
    if (KNOCKOUT_MATCHES[r]?.some(m => m.id === matchId)) return "early";
  }
  return "late";
}

// What position (qf/sf/final) is this match?
function getKnockoutStage(matchId: string): "r32" | "r16" | "qf" | "sf" | "final" | null {
  for (const [round, matches] of Object.entries(KNOCKOUT_MATCHES)) {
    if (matches.some(m => m.id === matchId)) return round as "r32" | "r16" | "qf" | "sf" | "final";
  }
  return null;
}

// ── Main points calculator ────────────────────────────────
export function calculatePlayerPoints(player: Player, adminState: AdminState): { total: number; breakdown: Record<string, number> } {
  let total = 0;
  const breakdown: Record<string, number> = {};
  const add = (key: string, pts: number) => { if (pts) { breakdown[key] = (breakdown[key] || 0) + pts; total += pts; } };
  const gr = adminState.results.group;
  const kr = adminState.results.knockout;

  // ── Group stage match results ──
  for (const [matchId, pred] of Object.entries(player.groupPredictions)) {
    const actual = gr[matchId];
    if (!actual) continue;
    const [ph, pa, ah, aa] = [parseInt(pred.home), parseInt(pred.away), parseInt(actual.home), parseInt(actual.away)];
    if (isNaN(ph) || isNaN(pa) || isNaN(ah) || isNaN(aa)) continue;
    if (ph === ah && pa === aa) {
      add("Group correct scores", POINTS.GROUP_CORRECT_SCORE);
    } else {
      const pr = ph > pa ? "H" : ph < pa ? "A" : "D";
      const ar = ah > aa ? "H" : ah < aa ? "A" : "D";
      if (pr === ar) add("Group correct results", POINTS.GROUP_CORRECT_RESULT);
    }
  }

  // ── Group winners / runners-up / 3rd ──
  for (const group of Object.keys(GROUPS)) {
    if (!isGroupComplete(group, gr)) continue;
    const standings = calcGroupStandings(group, gr);
    const [first, second, third] = standings;
    // Find what player predicted for this group
    const groupMatches = GROUP_MATCHES.filter(m => m.group === group);
    // We infer from predictions: who does player have winning most matches?
    // Simpler: check player's prediction for the group winner by scanning all match results
    // Actually — for group positions we compare admin standings vs player's implied standings
    // Player implied standings from their own predictions
    const pStandings = calcGroupStandings(group, Object.fromEntries(
      groupMatches.map(m => [m.id, { home: player.groupPredictions[m.id]?.home || "", away: player.groupPredictions[m.id]?.away || "" }])
    ));
    if (pStandings[0] === first) add("Correct group winners", POINTS.GROUP_CORRECT_WINNER);
    if (pStandings[1] === second) add("Correct group runners-up", POINTS.GROUP_CORRECT_RUNNER_UP);
    if (pStandings[2] === third) add("Correct 3rd place", POINTS.GROUP_CORRECT_THIRD);
  }

  // ── Knockout matches ──
  for (const [matchId, pred] of Object.entries(player.knockoutPredictions)) {
    const actual = kr[matchId];
    if (!actual || !actual.homeTeam) continue;

    const stage = getKnockoutStage(matchId);
    const isEarly = stage === "r32" || stage === "r16";
    const isLate = stage === "qf" || stage === "sf" || stage === "final";

    const ph = parseInt(pred.homeScore), pa = parseInt(pred.awayScore);
    const ah = parseInt(actual.homeScore), aa = parseInt(actual.awayScore);
    const validScores = !isNaN(ph) && !isNaN(pa) && !isNaN(ah) && !isNaN(aa);

    // Only score if result has actually been entered
    if (!validScores) continue;

    const exactScore = ph === ah && pa === aa;
    const pr = ph > pa ? "H" : ph < pa ? "A" : "D";
    const ar = ah > aa ? "H" : ah < aa ? "A" : "D";
    const correctResult = pr === ar;

      if (isEarly) {
        if (exactScore) add("KO correct scores (R32/R16)", POINTS.EARLY_KO_CORRECT_SCORE);
        else if (correctResult) add("KO correct results (R32/R16)", POINTS.EARLY_KO_CORRECT_RESULT);
      } else if (isLate) {
        if (exactScore) add("KO correct scores (QF/SF/Final)", POINTS.LATE_KO_CORRECT_SCORE);
        else if (correctResult) add("KO correct results (QF/SF/Final)", POINTS.LATE_KO_CORRECT_RESULT);
      }

    // ET prediction — only meaningful if the user predicted a draw at FT (i.e. they explicitly engaged with ET)
    if (actual.wentToET !== undefined) {
      const userPredictedDraw = ph === pa; // FT prediction was a draw
      if (userPredictedDraw && pred.goesToET === actual.wentToET) add("Predicts extra time", POINTS.PREDICTS_ET);
      if (userPredictedDraw && actual.wentToET && pred.goesToET) {
        const eh = parseInt(pred.etHomeScore), ea = parseInt(pred.etAwayScore);
        const aeh = parseInt(actual.etHomeScore), aea = parseInt(actual.etAwayScore);
        if (!isNaN(eh) && !isNaN(ea) && !isNaN(aeh) && !isNaN(aea) && eh === aeh && ea === aea) {
          add("Correct ET score", POINTS.CORRECT_ET_SCORE);
        }
      }
    }

    // Penalties prediction — only meaningful if user predicted ET ended in a draw (i.e. they explicitly engaged with pens)
    if (actual.wentToPens !== undefined) {
      const eh = parseInt(pred.etHomeScore), ea = parseInt(pred.etAwayScore);
      const userPredictedETDraw = pred.goesToET && !isNaN(eh) && !isNaN(ea) && eh === ea;
      if (userPredictedETDraw && pred.goesToPens === actual.wentToPens) add("Predicts penalties", POINTS.PREDICTS_PENS);
      if (userPredictedETDraw && actual.wentToPens && pred.goesToPens && pred.penWinner && actual.penWinner) {
        if (pred.penWinner === actual.penWinner) add("Correct penalty winner", POINTS.CORRECT_PEN_WINNER);
      }
    }

    // Correct qualifier
    // Correct qualifier - only award if actual result has valid scores
    const actualHomeScore = parseInt(actual.homeScore);
    const actualAwayScore = parseInt(actual.awayScore);
    if (isNaN(actualHomeScore) || isNaN(actualAwayScore)) continue; // no result yet

    const winner = actual.wentToPens
      ? actual.penWinner
      : actual.wentToET
        ? (parseInt(actual.etHomeScore) > parseInt(actual.etAwayScore) ? actual.homeTeam : actual.awayTeam)
        : (actualHomeScore > actualAwayScore ? actual.homeTeam : actual.awayTeam);

    const predWinner = (() => {
      const ftH = parseInt(pred.homeScore), ftA = parseInt(pred.awayScore);
      if (isNaN(ftH) || isNaN(ftA)) return null;
      if (ftH !== ftA) {
        // FT winner — no ET needed
        return ftH > ftA ? pred.homeTeam : pred.awayTeam;
      }
      // FT draw — must have ET
      if (!pred.goesToET) return null; // draw with no ET = incomplete prediction
      const etH = parseInt(pred.etHomeScore), etA = parseInt(pred.etAwayScore);
      if (isNaN(etH) || isNaN(etA)) return null; // ET scores not filled
      if (etH !== etA) {
        return etH > etA ? pred.homeTeam : pred.awayTeam;
      }
      // ET draw — must have pens
      if (!pred.goesToPens || !pred.penWinner) return null; // pens not filled
      return pred.penWinner;
    })();

    if (winner && predWinner && winner === predWinner) {
      if (isEarly) add("Correct qualifier (R32/R16)", POINTS.EARLY_KO_CORRECT_QUALIFIER);
      if (stage === "qf") add("Correct quarter-finalist", POINTS.CORRECT_QUARTER_FINALIST);
      if (stage === "sf") add("Correct semi-finalist", POINTS.CORRECT_SEMI_FINALIST);
      if (stage === "final") add("Correct finalist", POINTS.CORRECT_FINALIST);
    }
  } // end for knockout matches

  // ── Tournament awards ──
  if (adminState.topScorer && player.topScorer === adminState.topScorer) add("Golden Boot", POINTS.GOLDEN_BOOT);
  if (adminState.topAssist && player.topAssist === adminState.topAssist) add("Top Assist", POINTS.TOP_ASSIST);
  if (adminState.playerOfTournament && player.playerOfTournament === adminState.playerOfTournament) add("Player of Tournament", POINTS.PLAYER_OF_TOURNAMENT);
  if (adminState.tournamentWinner && player.tournamentWinner === adminState.tournamentWinner) add("Tournament Winner", POINTS.TOURNAMENT_WINNER);

  return { total, breakdown };
} // end calculatePlayerPoints

// ── Fantasy points ────────────────────────────────────────
export function calculateFantasyPoints(squad: FantasySquad, stats: PlayerStat[]): number {
  let total = 0;

  // Build match kickoff lookup from GROUP_MATCHES + KNOCKOUT_MATCHES
  const MONTHS: Record<string, number> = {Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11};
  const matchKickoff: Record<string, Date> = {};
  const allMatches = [...GROUP_MATCHES, ...(KNOCKOUT_MATCHES.r32||[]), ...(KNOCKOUT_MATCHES.r16||[]), ...(KNOCKOUT_MATCHES.qf||[]), ...(KNOCKOUT_MATCHES.sf||[]), ...(KNOCKOUT_MATCHES.final||[])];
  for (const m of allMatches) {
    try {
      const [day, mon] = m.dateUK.split(" ");
      const [hh, mm] = m.timeUK.replace(/ BST| GMT/, "").split(":");
      const isBST = m.timeUK.includes("BST");
      matchKickoff[m.id] = new Date(Date.UTC(2026, MONTHS[mon], +day, +hh - (isBST ? 1 : 0), +mm));
    } catch { /* ignore */ }
  }

  // Score both current squad and removed players (history)
  const allPlayers = [...squad.squad, ...(squad.history || [])];

  for (const fp of allPlayers) {
    const addedAt = fp.addedAt ? new Date(fp.addedAt) : new Date(0); // beginning of time if original squad
    const removedAt = fp.removedAt ? new Date(fp.removedAt) : new Date(9999, 0); // far future if still active

    for (const s of stats.filter(s => s.playerName === fp.name)) {
      // Check if this match was played while player was in the squad
      const ko = s.matchId ? matchKickoff[s.matchId] : null;
      if (ko && (ko < addedAt || ko >= removedAt)) continue; // outside their window — skip

      if (fp.position === "FWD") total += s.goals * FANTASY_POINTS.GOAL_FWD;
      else if (fp.position === "MID") total += s.goals * FANTASY_POINTS.GOAL_MID;
      else total += s.goals * FANTASY_POINTS.GOAL_DEF;
      total += s.assists * FANTASY_POINTS.ASSIST;
      if (fp.position === "GK" || fp.position === "DEF") total += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_GK_DEF;
      else if (fp.position === "MID") total += s.cleanSheets * FANTASY_POINTS.CLEAN_SHEET_MID;
      total += s.yellowCards * FANTASY_POINTS.YELLOW_CARD;
      total += s.redCards * FANTASY_POINTS.RED_CARD;
      if (fp.position === "GK") total += Math.floor(s.saves / 3) * FANTASY_POINTS.SAVE_SET;
      if (s.ownGoals) total += s.ownGoals * FANTASY_POINTS.OWN_GOAL;
      if (s.minutesPlayed >= 60) total += FANTASY_POINTS.PLAYED_60;
      else if (s.minutesPlayed > 0) total += FANTASY_POINTS.PLAYED_SUB_60;
    }
  }
  return total;
}

// ── Messages ──────────────────────────────────────────────
export interface Message {
  id: string;
  playerId: string;
  content: string;
  gifUrl?: string;
  pollId?: string;
  createdAt: string;
}

export async function getMessages(limit = 100, leagueId?: string): Promise<Message[]> {
  let q = supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(limit);
  if (leagueId) q = q.eq("league_id", leagueId);
  const { data } = await q;
  return (data || []).map(d => ({
    id: d.id, playerId: d.player_id, content: d.content,
    gifUrl: d.gif_url || "", pollId: d.poll_id || "", createdAt: d.created_at,
  }));
}

export async function sendMessage(playerId: string, content: string, gifUrl?: string, pollId?: string, leagueId?: string): Promise<void> {
  const { error } = await supabase.from("messages").insert({ player_id: playerId, content, gif_url: gifUrl || "", poll_id: pollId || null, league_id: leagueId || "" });
  if (error) console.error("sendMessage error:", error.message);
}

export async function deleteMessage(id: string): Promise<void> {
  await supabase.from("messages").delete().eq("id", id);
}

export function subscribeToMessages(callback: (msg: Message) => void) {
  return supabase
    .channel("messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, payload => {
      const d = payload.new as Record<string, unknown>;
      callback({ id: d.id as string, playerId: d.player_id as string, content: d.content as string, gifUrl: (d.gif_url as string) || "", pollId: (d.poll_id as string) || "", createdAt: d.created_at as string });
    })
    .subscribe();
}

// ── GIF message type ──────────────────────────────────────
// Messages with gifUrl are GIF messages, content stores the search term

// ── Message Reactions ─────────────────────────────────────
export interface Reaction {
  messageId: string;
  playerId: string;
  emoji: string;
}

export async function getReactions(messageIds: string[]): Promise<Reaction[]> {
  if (!messageIds.length) return [];
  const { data } = await supabase.from("message_reactions").select("*").in("message_id", messageIds);
  return (data || []).map(d => ({ messageId: d.message_id, playerId: d.player_id, emoji: d.emoji }));
}

export async function toggleReaction(messageId: string, playerId: string, emoji: string): Promise<void> {
  const { data } = await supabase.from("message_reactions").select("id")
    .eq("message_id", messageId).eq("player_id", playerId).eq("emoji", emoji).maybeSingle();
  if (data) {
    await supabase.from("message_reactions").delete().eq("id", data.id);
  } else {
    await supabase.from("message_reactions").insert({ message_id: messageId, player_id: playerId, emoji });
  }
}

export function subscribeToReactions(callback: (r: Reaction, deleted: boolean) => void) {
  return supabase.channel("reactions")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "message_reactions" }, p => {
      const d = p.new as Record<string, unknown>;
      callback({ messageId: d.message_id as string, playerId: d.player_id as string, emoji: d.emoji as string }, false);
    })
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "message_reactions" }, p => {
      const d = p.old as Record<string, unknown>;
      callback({ messageId: d.message_id as string, playerId: d.player_id as string, emoji: d.emoji as string }, true);
    })
    .subscribe();
}

// ── Leagues ────────────────────────────────────────────────
export interface League {
  id: string;
  name: string;
  code: string;
  createdBy: string;
  createdAt: string;
}

export async function getLeague(id: string): Promise<League | null> {
  const { data } = await supabase.from("leagues").select("*").eq("id", id).maybeSingle();
  if (!data) return null;
  return { id: data.id, name: data.name, code: data.code, createdBy: data.created_by, createdAt: data.created_at };
}

export async function getLeaguesByIds(ids: string[]): Promise<League[]> {
  if (!ids.length) return [];
  const { data } = await supabase.from("leagues").select("*").in("id", ids);
  return (data || []).map(d => ({ id: d.id, name: d.name, code: d.code, createdBy: d.created_by, createdAt: d.created_at }));
}

export async function getLeagueByCode(code: string): Promise<League | null> {
  const { data } = await supabase.from("leagues").select("*").eq("code", code.toUpperCase().trim()).maybeSingle();
  if (!data) return null;
  return { id: data.id, name: data.name, code: data.code, createdBy: data.created_by, createdAt: data.created_at };
}

export async function getAllLeagues(): Promise<League[]> {
  const { data } = await supabase.from("leagues").select("*").order("created_at", { ascending: true });
  return (data || []).map(d => ({ id: d.id, name: d.name, code: d.code, createdBy: d.created_by, createdAt: d.created_at }));
}

export async function createLeague(name: string, createdBy: string): Promise<League | null> {
  const code = name.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8) + Math.floor(Math.random() * 1000);
  const { data, error } = await supabase.from("leagues").insert({ name, code, created_by: createdBy }).select().single();
  if (error || !data) return null;
  return { id: data.id, name: data.name, code: data.code, createdBy: data.created_by, createdAt: data.created_at };
}

export async function joinLeague(player: Player, leagueId: string): Promise<Player> {
  const newIds = [...new Set([...player.leagueIds, leagueId])];
  const updated = { ...player, leagueIds: newIds, currentLeagueId: leagueId };
  await savePlayer(updated);
  return updated;
}

const ORIGINAL_LEAGUE_ID = "aaaaaaaa-0000-0000-0000-000000000001";

function dbToPlayerFull(d: Record<string, unknown>): Player {
  return {
    id: d.id as string, name: d.name as string, email: d.email as string,
    teamName: d.team_name as string, topScorer: (d.top_scorer as string) || "",
    topAssist: (d.top_assist as string) || "", avatarUrl: (d.avatar_url as string) || "",
    status: (d.status as string) || "", tournamentWinner: (d.tournament_winner as string) || "",
    playerOfTournament: (d.player_of_tournament as string) || "",
    groupPredictions: (d.group_predictions as Player["groupPredictions"]) || {},
    knockoutPredictions: (d.knockout_predictions as Player["knockoutPredictions"]) || {},
    createdAt: d.created_at as string,
    leagueIds: (d.league_ids as string[]) || [],
    currentLeagueId: (d.current_league_id as string) || "",
  };
}

export async function getPlayersInLeague(leagueId: string): Promise<Player[]> {
  const { data } = await supabase
    .from("players")
    .select("*")
    .filter("league_ids", "cs", `["${leagueId}"]`);
  return (data || []).map(d => dbToPlayerFull(d as Record<string, unknown>));
}
