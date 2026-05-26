// Fetches team form from our own Next.js API route (/api/form)
// which caches on Vercel's CDN for 24 hours.
// We also keep a 24h localStorage cache so repeat page loads
// don't even hit the server.

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24h
const CACHE_PREFIX = "wc2026_form_v2_";

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
  teamId: number;
  last5: FormMatch[];
  fetchedAt: number;
}

function cacheKey(teamName: string) {
  return `${CACHE_PREFIX}${teamName.replace(/\s+/g, "_")}`;
}

function getFromCache(teamName: string): TeamForm | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(cacheKey(teamName));
    if (!raw) return null;
    const parsed: TeamForm = JSON.parse(raw);
    if (Date.now() - parsed.fetchedAt > CACHE_TTL) return null;
    return parsed;
  } catch {
    return null;
  }
}

function saveToCache(form: TeamForm) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(cacheKey(form.teamName), JSON.stringify(form));
  } catch {}
}

export async function fetchTeamForm(teamName: string): Promise<TeamForm | null> {
  // 1. Check browser cache first (24h)
  const cached = getFromCache(teamName);
  if (cached) return cached;

  // 2. Hit our server API route (which is cached on Vercel CDN for 24h)
  try {
    const res = await fetch(
      `/api/form?team=${encodeURIComponent(teamName)}`,
      { cache: "no-store" } // don't double-cache in browser fetch cache
    );

    if (!res.ok) return null;

    const form: TeamForm = await res.json();
    if (!form.last5) return null;

    // Save to localStorage so next load skips the server entirely
    saveToCache(form);
    return form;
  } catch (err) {
    console.error(`Form fetch error for ${teamName}:`, err);
    return null;
  }
}
