// Team form stored in Supabase team_form table, entered by admin

import { supabase } from "./supabase";

export interface FormMatch {
  date: string;
  opponent: string;
  homeAway: "H" | "A";
  goalsFor: number;
  goalsAgainst: number;
  result: "W" | "D" | "L";
  competition: string;
}

export interface TeamForm {
  teamName: string;
  last5: FormMatch[];
  updatedAt: string;
}

// Module-level cache: team name → {form, fetchedAt}
const cache: Record<string, { form: TeamForm | null; at: number }> = {};
const TTL = 60 * 1000; // 1 minute — short so admin edits show quickly

export function bustFormCache(teamName?: string) {
  if (teamName) delete cache[teamName];
  else Object.keys(cache).forEach(k => delete cache[k]);
}

export async function fetchTeamForm(teamName: string): Promise<TeamForm | null> {
  const hit = cache[teamName];
  if (hit && Date.now() - hit.at < TTL) return hit.form;

  try {
    // Use .eq + .maybeSingle() instead of .single() — returns null instead of error when no row
    const { data, error } = await supabase
      .from("team_form")
      .select("*")
      .eq("team", teamName)
      .maybeSingle();

    if (error) {
      console.error("fetchTeamForm error:", teamName, error.message);
      cache[teamName] = { form: null, at: Date.now() };
      return null;
    }

    if (!data) {
      cache[teamName] = { form: null, at: Date.now() };
      return null;
    }

    const form: TeamForm = {
      teamName,
      last5: data.matches || [],
      updatedAt: data.updated_at,
    };

    cache[teamName] = { form, at: Date.now() };
    return form;
  } catch (e) {
    console.error("fetchTeamForm exception:", teamName, e);
    cache[teamName] = { form: null, at: Date.now() };
    return null;
  }
}

export async function saveTeamForm(teamName: string, matches: FormMatch[]): Promise<void> {
  const { error } = await supabase.from("team_form").upsert({
    team: teamName,
    matches,
    updated_at: new Date().toISOString(),
  });
  if (error) console.error("saveTeamForm error:", teamName, error.message);
  // Always bust cache after save
  bustFormCache(teamName);
}

export async function getAllTeamForms(): Promise<Record<string, TeamForm>> {
  try {
    const { data, error } = await supabase.from("team_form").select("*");
    if (error) { console.error("getAllTeamForms error:", error.message); return {}; }
    const result: Record<string, TeamForm> = {};
    for (const row of data || []) {
      const form = { teamName: row.team, last5: row.matches || [], updatedAt: row.updated_at };
      result[row.team] = form;
      cache[row.team] = { form, at: Date.now() };
    }
    return result;
  } catch (e) {
    console.error("getAllTeamForms exception:", e);
    return {};
  }
}
