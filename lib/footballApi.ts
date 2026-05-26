// Fetches team form from our own Supabase team_form table
// Admin enters this manually in the admin panel

import { supabase } from "./supabase";

export interface FormMatch {
  date: string;       // "2026-06-01"
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

// Client-side cache so we don't hammer Supabase on every render
const memCache: Record<string, { form: TeamForm; at: number }> = {};
const MEM_TTL = 5 * 60 * 1000; // 5 mins in memory

export async function fetchTeamForm(teamName: string): Promise<TeamForm | null> {
  // Memory cache
  const cached = memCache[teamName];
  if (cached && Date.now() - cached.at < MEM_TTL) return cached.form;

  try {
    const { data, error } = await supabase
      .from("team_form")
      .select("*")
      .eq("team", teamName)
      .single();

    if (error || !data) return null;

    const form: TeamForm = {
      teamName,
      last5: data.matches || [],
      updatedAt: data.updated_at,
    };

    memCache[teamName] = { form, at: Date.now() };
    return form;
  } catch {
    return null;
  }
}

export async function saveTeamForm(teamName: string, matches: FormMatch[]): Promise<void> {
  await supabase.from("team_form").upsert({
    team: teamName,
    matches,
    updated_at: new Date().toISOString(),
  });
  // Bust memory cache
  delete memCache[teamName];
}

export async function getAllTeamForms(): Promise<Record<string, TeamForm>> {
  const { data } = await supabase.from("team_form").select("*");
  const result: Record<string, TeamForm> = {};
  for (const row of data || []) {
    result[row.team] = { teamName: row.team, last5: row.matches || [], updatedAt: row.updated_at };
  }
  return result;
}

