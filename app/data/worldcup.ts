export const WORLD_CUP_YEAR = 2026;

// ET offset to UK time: ET is UTC-4 (BST) in summer, so UK = ET + 5hrs
function etToUK(dateStr: string, timeET: string): string {
  // Returns "DD Mon · HH:MM BST"
  const [h, mStr] = timeET.replace(' PM','').replace(' AM','').split(':');
  const isPM = timeET.includes('PM');
  let hours = parseInt(h);
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  hours += 5; // ET to BST (UTC+1, ET is UTC-4 in summer)
  const day = hours >= 24 ? 1 : 0;
  hours = hours % 24;
  const mins = mStr || '00';
  return `${hours.toString().padStart(2,'0')}:${mins} BST`;
}

export interface Match {
  id: string;
  group: string;
  home: { team: string; flag: string };
  away: { team: string; flag: string };
  dateUK: string; // e.g. "11 Jun"
  timeUK: string; // e.g. "20:00 BST"
  stadium: string;
  city: string;
}

// Real flags using flagcdn codes
export const TEAM_FLAGS: Record<string, string> = {
  "Mexico": "mx", "South Africa": "za", "South Korea": "kr", "Czechia": "cz",
  "Canada": "ca", "Bosnia & Herzegovina": "ba", "Qatar": "qa", "Switzerland": "ch",
  "Brazil": "br", "Morocco": "ma", "Haiti": "ht", "Scotland": "gb-sct",
  "USA": "us", "Paraguay": "py", "Australia": "au", "Türkiye": "tr",
  "Germany": "de", "Curaçao": "cw", "Ivory Coast": "ci", "Ecuador": "ec",
  "Netherlands": "nl", "Japan": "jp", "Sweden": "se", "Tunisia": "tn",
  "Spain": "es", "Cape Verde": "cv", "Saudi Arabia": "sa", "Uruguay": "uy",
  "Belgium": "be", "Egypt": "eg", "Iran": "ir", "New Zealand": "nz",
  "France": "fr", "Senegal": "sn", "Iraq": "iq", "Norway": "no",
  "Argentina": "ar", "Algeria": "dz", "Austria": "at", "Jordan": "jo",
  "Portugal": "pt", "DR Congo": "cd", "Uzbekistan": "uz", "Colombia": "co",
  "England": "gb-eng", "Croatia": "hr", "Ghana": "gh", "Panama": "pa",
};

export const GROUPS: Record<string, { team: string; flag: string }[]> = {
  A: [
    { team: "Mexico", flag: "mx" }, { team: "South Africa", flag: "za" },
    { team: "South Korea", flag: "kr" }, { team: "Czechia", flag: "cz" },
  ],
  B: [
    { team: "Canada", flag: "ca" }, { team: "Bosnia & Herzegovina", flag: "ba" },
    { team: "Qatar", flag: "qa" }, { team: "Switzerland", flag: "ch" },
  ],
  C: [
    { team: "Brazil", flag: "br" }, { team: "Morocco", flag: "ma" },
    { team: "Haiti", flag: "ht" }, { team: "Scotland", flag: "gb-sct" },
  ],
  D: [
    { team: "USA", flag: "us" }, { team: "Paraguay", flag: "py" },
    { team: "Australia", flag: "au" }, { team: "Türkiye", flag: "tr" },
  ],
  E: [
    { team: "Germany", flag: "de" }, { team: "Curaçao", flag: "cw" },
    { team: "Ivory Coast", flag: "ci" }, { team: "Ecuador", flag: "ec" },
  ],
  F: [
    { team: "Netherlands", flag: "nl" }, { team: "Japan", flag: "jp" },
    { team: "Sweden", flag: "se" }, { team: "Tunisia", flag: "tn" },
  ],
  G: [
    { team: "Belgium", flag: "be" }, { team: "Egypt", flag: "eg" },
    { team: "Iran", flag: "ir" }, { team: "New Zealand", flag: "nz" },
  ],
  H: [
    { team: "Spain", flag: "es" }, { team: "Cape Verde", flag: "cv" },
    { team: "Saudi Arabia", flag: "sa" }, { team: "Uruguay", flag: "uy" },
  ],
  I: [
    { team: "France", flag: "fr" }, { team: "Senegal", flag: "sn" },
    { team: "Iraq", flag: "iq" }, { team: "Norway", flag: "no" },
  ],
  J: [
    { team: "Argentina", flag: "ar" }, { team: "Algeria", flag: "dz" },
    { team: "Austria", flag: "at" }, { team: "Jordan", flag: "jo" },
  ],
  K: [
    { team: "Portugal", flag: "pt" }, { team: "DR Congo", flag: "cd" },
    { team: "Uzbekistan", flag: "uz" }, { team: "Colombia", flag: "co" },
  ],
  L: [
    { team: "England", flag: "gb-eng" }, { team: "Croatia", flag: "hr" },
    { team: "Ghana", flag: "gh" }, { team: "Panama", flag: "pa" },
  ],
};

// All group stage matches with real dates/times/venues (UK times = ET + 5hrs BST)
export const GROUP_MATCHES: Match[] = [
  // June 11
  { id: "A-0-1", group: "A", home: { team: "Mexico", flag: "mx" }, away: { team: "South Africa", flag: "za" }, dateUK: "11 Jun", timeUK: "20:00 BST", stadium: "Estadio Azteca", city: "Mexico City" },
  { id: "A-2-3", group: "A", home: { team: "South Korea", flag: "kr" }, away: { team: "Czechia", flag: "cz" }, dateUK: "12 Jun", timeUK: "03:00 BST", stadium: "Estadio Akron", city: "Zapopan" },
  // June 12
  { id: "B-0-1", group: "B", home: { team: "Canada", flag: "ca" }, away: { team: "Bosnia & Herzegovina", flag: "ba" }, dateUK: "12 Jun", timeUK: "20:00 BST", stadium: "BMO Field", city: "Toronto" },
  { id: "D-0-1", group: "D", home: { team: "USA", flag: "us" }, away: { team: "Paraguay", flag: "py" }, dateUK: "13 Jun", timeUK: "02:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
  // June 13
  { id: "B-2-3", group: "B", home: { team: "Qatar", flag: "qa" }, away: { team: "Switzerland", flag: "ch" }, dateUK: "13 Jun", timeUK: "20:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
  { id: "C-0-1", group: "C", home: { team: "Brazil", flag: "br" }, away: { team: "Morocco", flag: "ma" }, dateUK: "13 Jun", timeUK: "23:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
  { id: "C-2-3", group: "C", home: { team: "Haiti", flag: "ht" }, away: { team: "Scotland", flag: "gb-sct" }, dateUK: "14 Jun", timeUK: "02:00 BST", stadium: "Gillette Stadium", city: "Foxborough" },
  // June 14
  { id: "D-2-3", group: "D", home: { team: "Australia", flag: "au" }, away: { team: "Türkiye", flag: "tr" }, dateUK: "14 Jun", timeUK: "05:00 BST", stadium: "BC Place", city: "Vancouver" },
  { id: "E-0-1", group: "E", home: { team: "Germany", flag: "de" }, away: { team: "Curaçao", flag: "cw" }, dateUK: "14 Jun", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
  { id: "F-0-1", group: "F", home: { team: "Netherlands", flag: "nl" }, away: { team: "Japan", flag: "jp" }, dateUK: "14 Jun", timeUK: "21:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
  { id: "E-2-3", group: "E", home: { team: "Ivory Coast", flag: "ci" }, away: { team: "Ecuador", flag: "ec" }, dateUK: "15 Jun", timeUK: "00:00 BST", stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { id: "F-2-3", group: "F", home: { team: "Sweden", flag: "se" }, away: { team: "Tunisia", flag: "tn" }, dateUK: "15 Jun", timeUK: "03:00 BST", stadium: "Estadio BBVA", city: "Monterrey" },
  // June 15
  { id: "H-0-1", group: "H", home: { team: "Spain", flag: "es" }, away: { team: "Cape Verde", flag: "cv" }, dateUK: "15 Jun", timeUK: "17:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { id: "G-0-1", group: "G", home: { team: "Belgium", flag: "be" }, away: { team: "Egypt", flag: "eg" }, dateUK: "15 Jun", timeUK: "20:00 BST", stadium: "Lumen Field", city: "Seattle" },
  { id: "H-2-3", group: "H", home: { team: "Saudi Arabia", flag: "sa" }, away: { team: "Uruguay", flag: "uy" }, dateUK: "15 Jun", timeUK: "23:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
  { id: "G-2-3", group: "G", home: { team: "Iran", flag: "ir" }, away: { team: "New Zealand", flag: "nz" }, dateUK: "16 Jun", timeUK: "02:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
  // June 16
  { id: "I-0-1", group: "I", home: { team: "France", flag: "fr" }, away: { team: "Senegal", flag: "sn" }, dateUK: "16 Jun", timeUK: "20:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
  { id: "I-2-3", group: "I", home: { team: "Iraq", flag: "iq" }, away: { team: "Norway", flag: "no" }, dateUK: "16 Jun", timeUK: "23:00 BST", stadium: "Gillette Stadium", city: "Foxborough" },
  { id: "J-0-1", group: "J", home: { team: "Argentina", flag: "ar" }, away: { team: "Algeria", flag: "dz" }, dateUK: "17 Jun", timeUK: "02:00 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
  // June 17
  { id: "J-2-3", group: "J", home: { team: "Austria", flag: "at" }, away: { team: "Jordan", flag: "jo" }, dateUK: "17 Jun", timeUK: "05:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
  { id: "K-0-1", group: "K", home: { team: "Portugal", flag: "pt" }, away: { team: "DR Congo", flag: "cd" }, dateUK: "17 Jun", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
  { id: "L-0-1", group: "L", home: { team: "England", flag: "gb-eng" }, away: { team: "Croatia", flag: "hr" }, dateUK: "17 Jun", timeUK: "21:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
  { id: "L-2-3", group: "L", home: { team: "Ghana", flag: "gh" }, away: { team: "Panama", flag: "pa" }, dateUK: "18 Jun", timeUK: "00:00 BST", stadium: "BMO Field", city: "Toronto" },
  { id: "K-2-3", group: "K", home: { team: "Uzbekistan", flag: "uz" }, away: { team: "Colombia", flag: "co" }, dateUK: "18 Jun", timeUK: "03:00 BST", stadium: "Estadio Azteca", city: "Mexico City" },
  // June 18
  { id: "A-2-1", group: "A", home: { team: "Czechia", flag: "cz" }, away: { team: "South Africa", flag: "za" }, dateUK: "18 Jun", timeUK: "17:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { id: "B-3-1", group: "B", home: { team: "Switzerland", flag: "ch" }, away: { team: "Bosnia & Herzegovina", flag: "ba" }, dateUK: "18 Jun", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
  { id: "B-0-2", group: "B", home: { team: "Canada", flag: "ca" }, away: { team: "Qatar", flag: "qa" }, dateUK: "18 Jun", timeUK: "23:00 BST", stadium: "BC Place", city: "Vancouver" },
  { id: "A-0-2", group: "A", home: { team: "Mexico", flag: "mx" }, away: { team: "South Korea", flag: "kr" }, dateUK: "19 Jun", timeUK: "02:00 BST", stadium: "Estadio Akron", city: "Zapopan" },
  // June 19
  { id: "D-0-2", group: "D", home: { team: "USA", flag: "us" }, away: { team: "Australia", flag: "au" }, dateUK: "19 Jun", timeUK: "20:00 BST", stadium: "Lumen Field", city: "Seattle" },
  { id: "C-3-1", group: "C", home: { team: "Scotland", flag: "gb-sct" }, away: { team: "Morocco", flag: "ma" }, dateUK: "19 Jun", timeUK: "23:00 BST", stadium: "Gillette Stadium", city: "Foxborough" },
  { id: "C-0-2", group: "C", home: { team: "Brazil", flag: "br" }, away: { team: "Haiti", flag: "ht" }, dateUK: "20 Jun", timeUK: "01:30 BST", stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { id: "D-3-1", group: "D", home: { team: "Türkiye", flag: "tr" }, away: { team: "Paraguay", flag: "py" }, dateUK: "20 Jun", timeUK: "04:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
  // June 20
  { id: "F-0-2", group: "F", home: { team: "Netherlands", flag: "nl" }, away: { team: "Sweden", flag: "se" }, dateUK: "20 Jun", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
  { id: "E-0-2", group: "E", home: { team: "Germany", flag: "de" }, away: { team: "Ivory Coast", flag: "ci" }, dateUK: "20 Jun", timeUK: "21:00 BST", stadium: "BMO Field", city: "Toronto" },
  { id: "E-3-1", group: "E", home: { team: "Ecuador", flag: "ec" }, away: { team: "Curaçao", flag: "cw" }, dateUK: "21 Jun", timeUK: "01:00 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
  // June 21
  { id: "F-3-1", group: "F", home: { team: "Tunisia", flag: "tn" }, away: { team: "Japan", flag: "jp" }, dateUK: "21 Jun", timeUK: "05:00 BST", stadium: "Estadio BBVA", city: "Monterrey" },
  { id: "H-0-2", group: "H", home: { team: "Spain", flag: "es" }, away: { team: "Saudi Arabia", flag: "sa" }, dateUK: "21 Jun", timeUK: "17:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { id: "G-0-2", group: "G", home: { team: "Belgium", flag: "be" }, away: { team: "Iran", flag: "ir" }, dateUK: "21 Jun", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
  { id: "H-3-1", group: "H", home: { team: "Uruguay", flag: "uy" }, away: { team: "Cape Verde", flag: "cv" }, dateUK: "21 Jun", timeUK: "23:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
  { id: "G-3-1", group: "G", home: { team: "New Zealand", flag: "nz" }, away: { team: "Egypt", flag: "eg" }, dateUK: "22 Jun", timeUK: "02:00 BST", stadium: "BC Place", city: "Vancouver" },
  // June 22
  { id: "J-0-2", group: "J", home: { team: "Argentina", flag: "ar" }, away: { team: "Austria", flag: "at" }, dateUK: "22 Jun", timeUK: "18:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
  { id: "I-0-2", group: "I", home: { team: "France", flag: "fr" }, away: { team: "Iraq", flag: "iq" }, dateUK: "22 Jun", timeUK: "22:00 BST", stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { id: "I-3-1", group: "I", home: { team: "Norway", flag: "no" }, away: { team: "Senegal", flag: "sn" }, dateUK: "23 Jun", timeUK: "01:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
  { id: "J-3-1", group: "J", home: { team: "Jordan", flag: "jo" }, away: { team: "Algeria", flag: "dz" }, dateUK: "23 Jun", timeUK: "04:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
  // June 23
  { id: "K-0-2", group: "K", home: { team: "Portugal", flag: "pt" }, away: { team: "Uzbekistan", flag: "uz" }, dateUK: "23 Jun", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
  { id: "L-0-2", group: "L", home: { team: "England", flag: "gb-eng" }, away: { team: "Ghana", flag: "gh" }, dateUK: "23 Jun", timeUK: "21:00 BST", stadium: "Gillette Stadium", city: "Foxborough" },
  { id: "L-3-1", group: "L", home: { team: "Panama", flag: "pa" }, away: { team: "Croatia", flag: "hr" }, dateUK: "24 Jun", timeUK: "00:00 BST", stadium: "BMO Field", city: "Toronto" },
  { id: "K-3-1", group: "K", home: { team: "Colombia", flag: "co" }, away: { team: "DR Congo", flag: "cd" }, dateUK: "24 Jun", timeUK: "03:00 BST", stadium: "Estadio Akron", city: "Zapopan" },
  // June 24 (final matchday)
  { id: "B-3-0", group: "B", home: { team: "Switzerland", flag: "ch" }, away: { team: "Canada", flag: "ca" }, dateUK: "24 Jun", timeUK: "20:00 BST", stadium: "BC Place", city: "Vancouver" },
  { id: "B-1-2", group: "B", home: { team: "Bosnia & Herzegovina", flag: "ba" }, away: { team: "Qatar", flag: "qa" }, dateUK: "24 Jun", timeUK: "20:00 BST", stadium: "Lumen Field", city: "Seattle" },
  { id: "C-3-0", group: "C", home: { team: "Scotland", flag: "gb-sct" }, away: { team: "Brazil", flag: "br" }, dateUK: "24 Jun", timeUK: "23:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
  { id: "C-1-2", group: "C", home: { team: "Morocco", flag: "ma" }, away: { team: "Haiti", flag: "ht" }, dateUK: "24 Jun", timeUK: "23:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { id: "A-3-0", group: "A", home: { team: "Czechia", flag: "cz" }, away: { team: "Mexico", flag: "mx" }, dateUK: "25 Jun", timeUK: "02:00 BST", stadium: "Estadio Azteca", city: "Mexico City" },
  { id: "A-1-2", group: "A", home: { team: "South Africa", flag: "za" }, away: { team: "South Korea", flag: "kr" }, dateUK: "25 Jun", timeUK: "02:00 BST", stadium: "Estadio BBVA", city: "Monterrey" },
  // June 25
  { id: "E-1-2", group: "E", home: { team: "Curaçao", flag: "cw" }, away: { team: "Ivory Coast", flag: "ci" }, dateUK: "25 Jun", timeUK: "21:00 BST", stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { id: "E-3-0", group: "E", home: { team: "Ecuador", flag: "ec" }, away: { team: "Germany", flag: "de" }, dateUK: "25 Jun", timeUK: "21:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
  { id: "F-1-2", group: "F", home: { team: "Japan", flag: "jp" }, away: { team: "Sweden", flag: "se" }, dateUK: "26 Jun", timeUK: "00:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
  { id: "F-3-0", group: "F", home: { team: "Tunisia", flag: "tn" }, away: { team: "Netherlands", flag: "nl" }, dateUK: "26 Jun", timeUK: "00:00 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
  { id: "D-3-0", group: "D", home: { team: "Türkiye", flag: "tr" }, away: { team: "USA", flag: "us" }, dateUK: "26 Jun", timeUK: "03:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
  { id: "D-1-2", group: "D", home: { team: "Paraguay", flag: "py" }, away: { team: "Australia", flag: "au" }, dateUK: "26 Jun", timeUK: "03:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
  // June 26
  { id: "I-3-0", group: "I", home: { team: "Norway", flag: "no" }, away: { team: "France", flag: "fr" }, dateUK: "26 Jun", timeUK: "20:00 BST", stadium: "Gillette Stadium", city: "Foxborough" },
  { id: "I-1-2", group: "I", home: { team: "Senegal", flag: "sn" }, away: { team: "Iraq", flag: "iq" }, dateUK: "26 Jun", timeUK: "20:00 BST", stadium: "BMO Field", city: "Toronto" },
  { id: "H-1-2", group: "H", home: { team: "Cape Verde", flag: "cv" }, away: { team: "Saudi Arabia", flag: "sa" }, dateUK: "27 Jun", timeUK: "01:00 BST", stadium: "NRG Stadium", city: "Houston" },
  { id: "H-3-0", group: "H", home: { team: "Uruguay", flag: "uy" }, away: { team: "Spain", flag: "es" }, dateUK: "27 Jun", timeUK: "01:00 BST", stadium: "Estadio Akron", city: "Zapopan" },
  { id: "G-1-2", group: "G", home: { team: "Egypt", flag: "eg" }, away: { team: "Iran", flag: "ir" }, dateUK: "27 Jun", timeUK: "04:00 BST", stadium: "Lumen Field", city: "Seattle" },
  { id: "G-3-0", group: "G", home: { team: "New Zealand", flag: "nz" }, away: { team: "Belgium", flag: "be" }, dateUK: "27 Jun", timeUK: "04:00 BST", stadium: "BC Place", city: "Vancouver" },
  // June 27
  { id: "L-3-0", group: "L", home: { team: "Panama", flag: "pa" }, away: { team: "England", flag: "gb-eng" }, dateUK: "27 Jun", timeUK: "22:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
  { id: "L-1-2", group: "L", home: { team: "Croatia", flag: "hr" }, away: { team: "Ghana", flag: "gh" }, dateUK: "27 Jun", timeUK: "22:00 BST", stadium: "Lincoln Financial Field", city: "Philadelphia" },
  { id: "K-3-0", group: "K", home: { team: "Colombia", flag: "co" }, away: { team: "Portugal", flag: "pt" }, dateUK: "28 Jun", timeUK: "00:30 BST", stadium: "Hard Rock Stadium", city: "Miami" },
  { id: "K-1-2", group: "K", home: { team: "DR Congo", flag: "cd" }, away: { team: "Uzbekistan", flag: "uz" }, dateUK: "28 Jun", timeUK: "00:30 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  { id: "J-1-2", group: "J", home: { team: "Algeria", flag: "dz" }, away: { team: "Austria", flag: "at" }, dateUK: "28 Jun", timeUK: "03:00 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
  { id: "J-3-0", group: "J", home: { team: "Jordan", flag: "jo" }, away: { team: "Argentina", flag: "ar" }, dateUK: "28 Jun", timeUK: "03:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
];

export function generateGroupMatches(group: string, teams: { team: string; flag: string }[]) {
  return GROUP_MATCHES.filter(m => m.group === group);
}

// Knockout rounds — official FIFA bracket
// Round of 32 (new this World Cup!)
export const KNOCKOUT_MATCHES: Record<string, { id: string; label: string; placeholder: string; dateUK: string; timeUK: string; stadium: string; city: string }[]> = {
  r32: [
    { id: "r32-73", label: "Match 73", placeholder: "South Africa vs Canada", dateUK: "28 Jun", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
    { id: "r32-76", label: "Match 76", placeholder: "Brazil vs Japan", dateUK: "29 Jun", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
    { id: "r32-74", label: "Match 74", placeholder: "Germany vs Paraguay", dateUK: "29 Jun", timeUK: "21:30 BST", stadium: "Gillette Stadium", city: "Foxborough" },
    { id: "r32-75", label: "Match 75", placeholder: "Netherlands vs Morocco", dateUK: "30 Jun", timeUK: "02:00 BST", stadium: "Estadio BBVA", city: "Monterrey" },
    { id: "r32-78", label: "Match 78", placeholder: "Ivory Coast vs Norway", dateUK: "30 Jun", timeUK: "18:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
    { id: "r32-77", label: "Match 77", placeholder: "France vs Sweden", dateUK: "30 Jun", timeUK: "22:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
    { id: "r32-79", label: "Match 79", placeholder: "Mexico vs Ecuador", dateUK: "1 Jul", timeUK: "02:00 BST", stadium: "Estadio Azteca", city: "Mexico City" },
    { id: "r32-80", label: "Match 80", placeholder: "England vs DR Congo", dateUK: "1 Jul", timeUK: "17:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
    { id: "r32-82", label: "Match 82", placeholder: "Belgium vs Senegal", dateUK: "1 Jul", timeUK: "21:00 BST", stadium: "Lumen Field", city: "Seattle" },
    { id: "r32-81", label: "Match 81", placeholder: "USA vs Bosnia and Herzegovina", dateUK: "2 Jul", timeUK: "01:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
    { id: "r32-84", label: "Match 84", placeholder: "Spain vs Austria", dateUK: "2 Jul", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
    { id: "r32-83", label: "Match 83", placeholder: "Portugal vs Croatia", dateUK: "3 Jul", timeUK: "00:00 BST", stadium: "BMO Field", city: "Toronto" },
    { id: "r32-85", label: "Match 85", placeholder: "Switzerland vs Algeria", dateUK: "3 Jul", timeUK: "04:00 BST", stadium: "BC Place", city: "Vancouver" },
    { id: "r32-88", label: "Match 88", placeholder: "Australia vs Egypt", dateUK: "3 Jul", timeUK: "19:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
    { id: "r32-86", label: "Match 86", placeholder: "Argentina vs Cape Verde", dateUK: "3 Jul", timeUK: "23:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
    { id: "r32-87", label: "Match 87", placeholder: "Colombia vs Ghana", dateUK: "4 Jul", timeUK: "02:30 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
  ],
  r16: [
    { id: "r16-90", label: "R16 Match 90", placeholder: "W73 vs W75", dateUK: "4 Jul", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
    { id: "r16-89", label: "R16 Match 89", placeholder: "W74 vs W77", dateUK: "4 Jul", timeUK: "22:00 BST", stadium: "Lincoln Financial Field", city: "Philadelphia" },
    { id: "r16-91", label: "R16 Match 91", placeholder: "W76 vs W78", dateUK: "5 Jul", timeUK: "21:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
    { id: "r16-92", label: "R16 Match 92", placeholder: "W79 vs W80", dateUK: "6 Jul", timeUK: "01:00 BST", stadium: "Estadio Azteca", city: "Mexico City" },
    { id: "r16-93", label: "R16 Match 93", placeholder: "W83 vs W84", dateUK: "6 Jul", timeUK: "20:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
    { id: "r16-94", label: "R16 Match 94", placeholder: "W81 vs W82", dateUK: "7 Jul", timeUK: "01:00 BST", stadium: "Lumen Field", city: "Seattle" },
    { id: "r16-95", label: "R16 Match 95", placeholder: "W86 vs W88", dateUK: "7 Jul", timeUK: "17:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
    { id: "r16-96", label: "R16 Match 96", placeholder: "W85 vs W87", dateUK: "7 Jul", timeUK: "21:00 BST", stadium: "BC Place", city: "Vancouver" },
  ],
  qf: [
    { id: "qf-97", label: "QF 1", placeholder: "W89 vs W90", dateUK: "9 Jul", timeUK: "21:00 BST", stadium: "Gillette Stadium", city: "Foxborough" },
    { id: "qf-98", label: "QF 2", placeholder: "W93 vs W94", dateUK: "10 Jul", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
    { id: "qf-99", label: "QF 3", placeholder: "W91 vs W92", dateUK: "11 Jul", timeUK: "22:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
    { id: "qf-100", label: "QF 4", placeholder: "W95 vs W96", dateUK: "12 Jul", timeUK: "02:00 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
  ],
  sf: [
    { id: "sf-101", label: "Semi Final 1", placeholder: "W QF1 vs W QF2", dateUK: "14 Jul", timeUK: "20:00 BST", stadium: "AT&T Stadium", city: "Arlington (Dallas)" },
    { id: "sf-102", label: "Semi Final 2", placeholder: "W QF3 vs W QF4", dateUK: "15 Jul", timeUK: "20:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
  ],
  final: [
    { id: "3rd-103", label: "3rd Place", placeholder: "SF Losers", dateUK: "18 Jul", timeUK: "22:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
    { id: "final-104", label: "🏆 THE FINAL", placeholder: "SF Winners", dateUK: "19 Jul", timeUK: "20:00 BST", stadium: "MetLife Stadium", city: "East Rutherford, NJ" },
  ],
};

// The official FIFA knockout bracket progression (R32 → R16 → QF → SF → Final)
export const BRACKET_PROGRESSION: Record<string, string> = {
  "r16-90": "r32-73,r32-75",
  "r16-89": "r32-74,r32-77",
  "r16-91": "r32-76,r32-78",
  "r16-92": "r32-79,r32-80",
  "r16-93": "r32-83,r32-84",
  "r16-94": "r32-81,r32-82",
  "r16-95": "r32-86,r32-88",
  "r16-96": "r32-85,r32-87",
  "qf-97": "r16-89,r16-90",
  "qf-98": "r16-93,r16-94",
  "qf-99": "r16-91,r16-92",
  "qf-100": "r16-95,r16-96",
  "sf-101": "qf-97,qf-98",
  "sf-102": "qf-99,qf-100",
  "final-104": "sf-101,sf-102",
  "3rd-103": "sf-101,sf-102",
};

// Group standings → R32 slot mapping
// Each entry: which R32 match does the group 1st/2nd feed into, and as home or away
export type SlotRole = "home" | "away";
export interface GroupSlot { matchId: string; role: SlotRole }

export const GROUP_TO_R32: Record<string, { first: GroupSlot; second: GroupSlot }> = {
  A: { first:  { matchId: "r32-79", role: "home" }, second: { matchId: "r32-73", role: "home" } },
  B: { first:  { matchId: "r32-85", role: "home" }, second: { matchId: "r32-73", role: "away" } },
  C: { first:  { matchId: "r32-76", role: "home" }, second: { matchId: "r32-75", role: "away" } },
  D: { first:  { matchId: "r32-81", role: "home" }, second: { matchId: "r32-88", role: "home" } },
  E: { first:  { matchId: "r32-74", role: "home" }, second: { matchId: "r32-78", role: "home" } },
  F: { first:  { matchId: "r32-75", role: "home" }, second: { matchId: "r32-76", role: "away" } },
  G: { first:  { matchId: "r32-82", role: "home" }, second: { matchId: "r32-88", role: "away" } },
  H: { first:  { matchId: "r32-84", role: "home" }, second: { matchId: "r32-86", role: "away" } },
  I: { first:  { matchId: "r32-77", role: "home" }, second: { matchId: "r32-78", role: "away" } },
  J: { first:  { matchId: "r32-86", role: "home" }, second: { matchId: "r32-84", role: "away" } },
  K: { first:  { matchId: "r32-87", role: "home" }, second: { matchId: "r32-83", role: "home" } },
  L: { first:  { matchId: "r32-80", role: "home" }, second: { matchId: "r32-83", role: "away" } },
};

export type PlayerPosition = "GK" | "DEF" | "MID" | "FWD";
export interface SquadPlayer { name: string; position: PlayerPosition; }

export const SQUADS: Record<string, { flag: string; players: SquadPlayer[] }> = {
  "England": { flag: "gb-eng", players: [
    { name: "Jordan Pickford", position: "GK" }, { name: "Dean Henderson", position: "GK" }, { name: "James Trafford", position: "GK" },
    { name: "Reece James", position: "DEF" }, { name: "Ezri Konsa", position: "DEF" }, { name: "Jarell Quansah", position: "DEF" }, { name: "John Stones", position: "DEF" }, { name: "Marc Guehi", position: "DEF" }, { name: "Dan Burn", position: "DEF" }, { name: "Nico O'Reilly", position: "DEF" }, { name: "Djed Spence", position: "DEF" }, { name: "Tino Livramento", position: "DEF" },
    { name: "Declan Rice", position: "MID" }, { name: "Elliot Anderson", position: "MID" }, { name: "Kobbie Mainoo", position: "MID" }, { name: "Jordan Henderson", position: "MID" }, { name: "Morgan Rogers", position: "MID" }, { name: "Jude Bellingham", position: "MID" }, { name: "Eberechi Eze", position: "MID" },
    { name: "Harry Kane", position: "FWD" }, { name: "Ivan Toney", position: "FWD" }, { name: "Ollie Watkins", position: "FWD" }, { name: "Bukayo Saka", position: "FWD" }, { name: "Marcus Rashford", position: "FWD" }, { name: "Anthony Gordon", position: "FWD" }, { name: "Noni Madueke", position: "FWD" },
  ]},
  "France": { flag: "fr", players: [
    { name: "Mike Maignan", position: "GK" }, { name: "Robin Risser", position: "GK" }, { name: "Brice Samba", position: "GK" },
    { name: "Lucas Digne", position: "DEF" }, { name: "Malo Gusto", position: "DEF" }, { name: "Lucas Hernandez", position: "DEF" }, { name: "Theo Hernandez", position: "DEF" }, { name: "Ibrahima Konate", position: "DEF" }, { name: "Maxence Lacroix", position: "DEF" }, { name: "Jules Kounde", position: "DEF" }, { name: "William Saliba", position: "DEF" }, { name: "Dayot Upamecano", position: "DEF" },
    { name: "N'Golo Kante", position: "MID" }, { name: "Manu Kone", position: "MID" }, { name: "Adrien Rabiot", position: "MID" }, { name: "Aurelien Tchouameni", position: "MID" }, { name: "Warren Zaire-Emery", position: "MID" },
    { name: "Maghnes Akliouche", position: "FWD" }, { name: "Bradley Barcola", position: "FWD" }, { name: "Rayan Cherki", position: "FWD" }, { name: "Ousmane Dembele", position: "FWD" }, { name: "Desire Doue", position: "FWD" }, { name: "Michael Olise", position: "FWD" }, { name: "Kylian Mbappe", position: "FWD" }, { name: "Jean-Philippe Mateta", position: "FWD" }, { name: "Marcus Thuram", position: "FWD" },
  ]},
  "Spain": { flag: "es", players: [
    { name: "Unai Simon", position: "GK" }, { name: "David Raya", position: "GK" }, { name: "Joan Garcia", position: "GK" },
    { name: "Marc Cucurella", position: "DEF" }, { name: "Pau Cubarsi", position: "DEF" }, { name: "Aymeric Laporte", position: "DEF" }, { name: "Alejandro Grimaldo", position: "DEF" }, { name: "Pedro Porro", position: "DEF" }, { name: "Eric Garcia", position: "DEF" }, { name: "Marcos Llorente", position: "DEF" }, { name: "Marc Pubill", position: "DEF" },
    { name: "Gavi", position: "MID" }, { name: "Rodri", position: "MID" }, { name: "Pedri", position: "MID" }, { name: "Martin Zubimendi", position: "MID" }, { name: "Fabian Ruiz", position: "MID" }, { name: "Alex Baena", position: "MID" }, { name: "Mikel Merino", position: "MID" },
    { name: "Lamine Yamal", position: "FWD" }, { name: "Nico Williams", position: "FWD" }, { name: "Dani Olmo", position: "FWD" }, { name: "Ferran Torres", position: "FWD" }, { name: "Mikel Oyarzabal", position: "FWD" }, { name: "Yeremy Pino", position: "FWD" }, { name: "Borja Iglesias", position: "FWD" }, { name: "Victor Munoz", position: "FWD" },
  ]},
  "Germany": { flag: "de", players: [
    { name: "Manuel Neuer", position: "GK" }, { name: "Oliver Baumann", position: "GK" }, { name: "Alexander Nuebel", position: "GK" },
    { name: "Nico Schlotterbeck", position: "DEF" }, { name: "David Raum", position: "DEF" }, { name: "Nathaniel Brown", position: "DEF" }, { name: "Jonathan Tah", position: "DEF" }, { name: "Waldemar Anton", position: "DEF" }, { name: "Joshua Kimmich", position: "DEF" }, { name: "Malick Thiaw", position: "DEF" }, { name: "Antonio Rudiger", position: "DEF" },
    { name: "Pascal Gross", position: "MID" }, { name: "Leon Goretzka", position: "MID" }, { name: "Felix Nmecha", position: "MID" }, { name: "Jamal Musiala", position: "MID" }, { name: "Nadiem Amiri", position: "MID" }, { name: "Jamie Leweling", position: "MID" }, { name: "Florian Wirtz", position: "MID" }, { name: "Leroy Sane", position: "MID" }, { name: "Aleksandar Pavlovic", position: "MID" }, { name: "Angelo Stiller", position: "MID" },
    { name: "Kai Havertz", position: "FWD" }, { name: "Nick Woltemade", position: "FWD" }, { name: "Deniz Undav", position: "FWD" }, { name: "Maximilian Beier", position: "FWD" },
  ]},
  "Brazil": { flag: "br", players: [
    { name: "Alisson", position: "GK" }, { name: "Ederson", position: "GK" }, { name: "Weverton", position: "GK" },
    { name: "Alex Sandro", position: "DEF" }, { name: "Bremer", position: "DEF" }, { name: "Danilo", position: "DEF" }, { name: "Douglas Santos", position: "DEF" }, { name: "Gabriel Magalhaes", position: "DEF" }, { name: "Ibanez", position: "DEF" }, { name: "Leo Pereira", position: "DEF" }, { name: "Marquinhos", position: "DEF" }, { name: "Wesley", position: "DEF" },
    { name: "Bruno Guimaraes", position: "MID" }, { name: "Casemiro", position: "MID" }, { name: "Danilo Santos", position: "MID" }, { name: "Fabinho", position: "MID" }, { name: "Lucas Paqueta", position: "MID" },
    { name: "Endrick", position: "FWD" }, { name: "Gabriel Martinelli", position: "FWD" }, { name: "Igor Thiago", position: "FWD" }, { name: "Luiz Henrique", position: "FWD" }, { name: "Matheus Cunha", position: "FWD" }, { name: "Neymar Jr", position: "FWD" }, { name: "Raphinha", position: "FWD" }, { name: "Rayan", position: "FWD" }, { name: "Vinicius Jr", position: "FWD" },
  ]},
  "Argentina": { flag: "ar", players: [
    { name: "Emiliano Martinez", position: "GK" }, { name: "Geronimo Rulli", position: "GK" }, { name: "Juan Musso", position: "GK" },
    { name: "Leonardo Balerdi", position: "DEF" }, { name: "Gonzalo Montiel", position: "DEF" }, { name: "Nicolas Tagliafico", position: "DEF" }, { name: "Lisandro Martinez", position: "DEF" }, { name: "Cristian Romero", position: "DEF" }, { name: "Nicolas Otamendi", position: "DEF" }, { name: "Facundo Medina", position: "DEF" }, { name: "Nahuel Molina", position: "DEF" },
    { name: "Leandro Paredes", position: "MID" }, { name: "Rodrigo De Paul", position: "MID" }, { name: "Valentin Barco", position: "MID" }, { name: "Giovani Lo Celso", position: "MID" }, { name: "Exequiel Palacios", position: "MID" }, { name: "Alexis Mac Allister", position: "MID" }, { name: "Enzo Fernandez", position: "MID" },
    { name: "Julian Alvarez", position: "FWD" }, { name: "Lionel Messi", position: "FWD" }, { name: "Nicolas Gonzalez", position: "FWD" }, { name: "Thiago Almada", position: "FWD" }, { name: "Giuliano Simeone", position: "FWD" }, { name: "Nicolas Paz", position: "FWD" }, { name: "Lautaro Martinez", position: "FWD" },
  ]},
  "Portugal": { flag: "pt", players: [
    { name: "Diogo Costa", position: "GK" }, { name: "Jose Sa", position: "GK" }, { name: "Rui Silva", position: "GK" },
    { name: "Tomas Araujo", position: "DEF" }, { name: "Joao Cancelo", position: "DEF" }, { name: "Diogo Dalot", position: "DEF" }, { name: "Ruben Dias", position: "DEF" }, { name: "Goncalo Inacio", position: "DEF" }, { name: "Nuno Mendes", position: "DEF" }, { name: "Matheus Nunes", position: "DEF" }, { name: "Nelson Semedo", position: "DEF" }, { name: "Renato Veiga", position: "DEF" },
    { name: "Samuel Costa", position: "MID" }, { name: "Bruno Fernandes", position: "MID" }, { name: "Joao Neves", position: "MID" }, { name: "Ruben Neves", position: "MID" }, { name: "Bernardo Silva", position: "MID" }, { name: "Vitinha", position: "MID" },
    { name: "Francisco Conceicao", position: "FWD" }, { name: "Joao Felix", position: "FWD" }, { name: "Goncalo Guedes", position: "FWD" }, { name: "Rafael Leao", position: "FWD" }, { name: "Pedro Neto", position: "FWD" }, { name: "Goncalo Ramos", position: "FWD" }, { name: "Cristiano Ronaldo", position: "FWD" }, { name: "Francisco Trincao", position: "FWD" },
  ]},
  "Netherlands": { flag: "nl", players: [
    { name: "Mark Flekken", position: "GK" }, { name: "Robin Roefs", position: "GK" }, { name: "Bart Verbruggen", position: "GK" },
    { name: "Nathan Ake", position: "DEF" }, { name: "Virgil van Dijk", position: "DEF" }, { name: "Denzel Dumfries", position: "DEF" }, { name: "Jan Paul van Hecke", position: "DEF" }, { name: "Jurrien Timber", position: "DEF" }, { name: "Jorrel Hato", position: "DEF" }, { name: "Micky van de Ven", position: "DEF" },
    { name: "Ryan Gravenberch", position: "MID" }, { name: "Frenkie de Jong", position: "MID" }, { name: "Teun Koopmeiners", position: "MID" }, { name: "Tijjani Reijnders", position: "MID" }, { name: "Marten de Roon", position: "MID" }, { name: "Guus Til", position: "MID" }, { name: "Quinten Timber", position: "MID" }, { name: "Mats Wieffer", position: "MID" },
    { name: "Brian Brobbey", position: "FWD" }, { name: "Memphis Depay", position: "FWD" }, { name: "Cody Gakpo", position: "FWD" }, { name: "Noa Lang", position: "FWD" }, { name: "Donyell Malen", position: "FWD" }, { name: "Crysencio Summerville", position: "FWD" }, { name: "Wout Weghorst", position: "FWD" }, { name: "Justin Kluivert", position: "FWD" },
  ]},
  "Belgium": { flag: "be", players: [
    { name: "Thibaut Courtois", position: "GK" }, { name: "Senne Lammens", position: "GK" }, { name: "Mike Penders", position: "GK" },
    { name: "Timothy Castagne", position: "DEF" }, { name: "Zeno Debast", position: "DEF" }, { name: "Maxim De Cuyper", position: "DEF" }, { name: "Koni De Winter", position: "DEF" }, { name: "Brandon Mechele", position: "DEF" }, { name: "Thomas Meunier", position: "DEF" }, { name: "Nathan Ngoy", position: "DEF" }, { name: "Arthur Theate", position: "DEF" },
    { name: "Kevin De Bruyne", position: "MID" }, { name: "Amadou Onana", position: "MID" }, { name: "Nicolas Raskin", position: "MID" }, { name: "Youri Tielemans", position: "MID" }, { name: "Hans Vanaken", position: "MID" }, { name: "Axel Witsel", position: "MID" },
    { name: "Charles De Ketelaere", position: "FWD" }, { name: "Jeremy Doku", position: "FWD" }, { name: "Romelu Lukaku", position: "FWD" }, { name: "Dodi Lukebakio", position: "FWD" }, { name: "Diego Moreira", position: "FWD" }, { name: "Alexis Saelemaekers", position: "FWD" }, { name: "Leandro Trossard", position: "FWD" },
  ]},
  "Morocco": { flag: "ma", players: [
    { name: "Yassine Bounou", position: "GK" }, { name: "Munir El Kajoui", position: "GK" }, { name: "Ahmed Reda Tagnaouti", position: "GK" },
    { name: "Noussair Mazraoui", position: "DEF" }, { name: "Anas Salah-Eddine", position: "DEF" }, { name: "Achraf Hakimi", position: "DEF" }, { name: "Zakaria El Ouahdi", position: "DEF" }, { name: "Nayef Aguerd", position: "DEF" }, { name: "Chadi Riad", position: "DEF" }, { name: "Redouane Halhal", position: "DEF" }, { name: "Issa Diop", position: "DEF" },
    { name: "Samir El Mourabet", position: "MID" }, { name: "Ayoub Bouaddi", position: "MID" }, { name: "Neil El Aynaoui", position: "MID" }, { name: "Sofyan Amrabat", position: "MID" }, { name: "Azzedine Ounahi", position: "MID" }, { name: "Bilal El Khannouss", position: "MID" }, { name: "Ismael Saibari", position: "MID" },
    { name: "Abdesamad Ezzalzouli", position: "FWD" }, { name: "Soufiane Rahimi", position: "FWD" }, { name: "Ayoub El Kaabi", position: "FWD" }, { name: "Brahim Diaz", position: "FWD" }, { name: "Yassine Gessim", position: "FWD" },
  ]},
  "USA": { flag: "us", players: [
    { name: "Chris Brady", position: "GK" }, { name: "Matt Freese", position: "GK" }, { name: "Matt Turner", position: "GK" },
    { name: "Sergino Dest", position: "DEF" }, { name: "Mark McKenzie", position: "DEF" }, { name: "Tim Ream", position: "DEF" }, { name: "Chris Richards", position: "DEF" }, { name: "Antonee Robinson", position: "DEF" }, { name: "Miles Robinson", position: "DEF" }, { name: "Joe Scally", position: "DEF" }, { name: "Auston Trusty", position: "DEF" },
    { name: "Tyler Adams", position: "MID" }, { name: "Weston McKennie", position: "MID" }, { name: "Cristian Roldan", position: "MID" }, { name: "Brenden Aaronson", position: "MID" }, { name: "Christian Pulisic", position: "MID" }, { name: "Gio Reyna", position: "MID" }, { name: "Malik Tillman", position: "MID" }, { name: "Tim Weah", position: "MID" }, { name: "Alejandro Zendejas", position: "MID" },
    { name: "Folarin Balogun", position: "FWD" }, { name: "Ricardo Pepi", position: "FWD" }, { name: "Haji Wright", position: "FWD" },
  ]},
  "Mexico": { flag: "mx", players: [
    { name: "Raul Rangel", position: "GK" }, { name: "Guillermo Ochoa", position: "GK" }, { name: "Carlos Acevedo", position: "GK" },
    { name: "Jorge Sanchez", position: "DEF" }, { name: "Israel Reyes", position: "DEF" }, { name: "Cesar Montes", position: "DEF" }, { name: "Johan Vasquez", position: "DEF" }, { name: "Jesus Gallardo", position: "DEF" }, { name: "Mateo Chavez", position: "DEF" }, { name: "Edson Alvarez", position: "DEF" },
    { name: "Erik Lira", position: "MID" }, { name: "Orbelin Pineda", position: "MID" }, { name: "Alvaro Fidalgo", position: "MID" }, { name: "Brian Gutierrez", position: "MID" }, { name: "Luis Romo", position: "MID" }, { name: "Obed Vargas", position: "MID" }, { name: "Gilberto Mora", position: "MID" }, { name: "Luis Chavez", position: "MID" },
    { name: "Roberto Alvarado", position: "FWD" }, { name: "Cesar Huerta", position: "FWD" }, { name: "Julian Quinones", position: "FWD" }, { name: "Santiago Gimenez", position: "FWD" }, { name: "Raul Jimenez", position: "FWD" },
  ]},
  "Canada": { flag: "ca", players: [
    { name: "Dayne St Clair", position: "GK" }, { name: "Maxime Crepeau", position: "GK" }, { name: "Owen Goodman", position: "GK" },
    { name: "Alistair Johnston", position: "DEF" }, { name: "Derek Cornelius", position: "DEF" }, { name: "Richie Laryea", position: "DEF" }, { name: "Moise Bombito", position: "DEF" }, { name: "Alphonso Davies", position: "DEF" }, { name: "Joel Waterman", position: "DEF" }, { name: "Luc de Fougerolles", position: "DEF" },
    { name: "Stephen Eustaquio", position: "MID" }, { name: "Ismael Kone", position: "MID" }, { name: "Tajon Buchanan", position: "MID" }, { name: "Mathieu Choiniere", position: "MID" }, { name: "Ali Ahmed", position: "MID" }, { name: "Nathan Saliba", position: "MID" }, { name: "Liam Millar", position: "MID" }, { name: "Jacob Shaffelburg", position: "MID" }, { name: "Jonathan Osorio", position: "MID" },
    { name: "Jonathan David", position: "FWD" }, { name: "Cyle Larin", position: "FWD" }, { name: "Tani Oluwaseyi", position: "FWD" }, { name: "Promise David", position: "FWD" },
  ]},
  "Japan": { flag: "jp", players: [
    { name: "Tomoki Hayakawa", position: "GK" }, { name: "Keisuke Osako", position: "GK" }, { name: "Zion Suzuki", position: "GK" },
    { name: "Ko Itakura", position: "DEF" }, { name: "Hiroki Ito", position: "DEF" }, { name: "Yuto Nagatomo", position: "DEF" }, { name: "Yukinari Sugawara", position: "DEF" }, { name: "Shogo Taniguchi", position: "DEF" }, { name: "Takehiro Tomiyasu", position: "DEF" }, { name: "Tsuyoshi Watanabe", position: "DEF" },
    { name: "Ritsu Doan", position: "MID" }, { name: "Wataru Endo", position: "MID" }, { name: "Junya Ito", position: "MID" }, { name: "Daichi Kamada", position: "MID" }, { name: "Takefusa Kubo", position: "MID" }, { name: "Keito Nakamura", position: "MID" }, { name: "Ao Tanaka", position: "MID" },
    { name: "Keisuke Goto", position: "FWD" }, { name: "Daizen Maeda", position: "FWD" }, { name: "Koki Ogawa", position: "FWD" }, { name: "Ayase Ueda", position: "FWD" },
  ]},
  "South Korea": { flag: "kr", players: [
    { name: "Song Bumkeun", position: "GK" }, { name: "Jo Hyeonwoo", position: "GK" }, { name: "Kim Seung-gyu", position: "GK" },
    { name: "Jens Castrop", position: "DEF" }, { name: "Lee Hanbeom", position: "DEF" }, { name: "Kim Minjae", position: "DEF" }, { name: "Kim Moonhwan", position: "DEF" }, { name: "Kim Taehyeon", position: "DEF" }, { name: "Lee Taeseok", position: "DEF" }, { name: "Cho Wije", position: "DEF" },
    { name: "Lee Donggyeong", position: "MID" }, { name: "Hwang Heechan", position: "MID" }, { name: "Yang Hyunjun", position: "MID" }, { name: "Hwang Inbeom", position: "MID" }, { name: "Bae Junho", position: "MID" }, { name: "Lee Kangin", position: "MID" }, { name: "Paik Seungho", position: "MID" },
    { name: "Son Heungmin", position: "FWD" }, { name: "Cho Guesung", position: "FWD" }, { name: "Oh Hyeongyu", position: "FWD" },
  ]},
  "Australia": { flag: "au", players: [
    { name: "Patrick Beach", position: "GK" }, { name: "Paul Izzo", position: "GK" }, { name: "Mathew Ryan", position: "GK" },
    { name: "Aziz Behich", position: "DEF" }, { name: "Cameron Burgess", position: "DEF" }, { name: "Alessandro Circati", position: "DEF" }, { name: "Milos Degenek", position: "DEF" }, { name: "Jason Geria", position: "DEF" }, { name: "Harry Souttar", position: "DEF" },
    { name: "Cameron Devlin", position: "MID" }, { name: "Ajdin Hrustic", position: "MID" }, { name: "Jackson Irvine", position: "MID" }, { name: "Connor Metcalfe", position: "MID" }, { name: "Aiden O'Neill", position: "MID" },
    { name: "Nestory Irankunda", position: "FWD" }, { name: "Mathew Leckie", position: "FWD" }, { name: "Awer Mabil", position: "FWD" }, { name: "Cristian Volpato", position: "FWD" }, { name: "Tete Yengi", position: "FWD" },
  ]},
  "Scotland": { flag: "gb-sct", players: [
    { name: "Craig Gordon", position: "GK" }, { name: "Angus Gunn", position: "GK" }, { name: "Liam Kelly", position: "GK" },
    { name: "Grant Hanley", position: "DEF" }, { name: "Jack Hendry", position: "DEF" }, { name: "Aaron Hickey", position: "DEF" }, { name: "Dom Hyam", position: "DEF" }, { name: "Scott McKenna", position: "DEF" }, { name: "Nathan Patterson", position: "DEF" }, { name: "Andy Robertson", position: "DEF" }, { name: "Kieran Tierney", position: "DEF" },
    { name: "Ryan Christie", position: "MID" }, { name: "Lewis Ferguson", position: "MID" }, { name: "John McGinn", position: "MID" }, { name: "Scott McTominay", position: "MID" }, { name: "Billy Gilmour", position: "MID" },
    { name: "Che Adams", position: "FWD" }, { name: "Lyndon Dykes", position: "FWD" }, { name: "Lawrence Shankland", position: "FWD" }, { name: "Ross Stewart", position: "FWD" },
  ]},
  "Croatia": { flag: "hr", players: [
    { name: "Dominik Livakovic", position: "GK" }, { name: "Dominik Kotarski", position: "GK" }, { name: "Ivor Pandur", position: "GK" },
    { name: "Josko Gvardiol", position: "DEF" }, { name: "Duje Caleta-Car", position: "DEF" }, { name: "Josip Sutalo", position: "DEF" }, { name: "Josip Stanisic", position: "DEF" }, { name: "Marin Pongracic", position: "DEF" }, { name: "Martin Erlic", position: "DEF" }, { name: "Luka Vuskovic", position: "DEF" },
    { name: "Luka Modric", position: "MID" }, { name: "Mateo Kovacic", position: "MID" }, { name: "Mario Pasalic", position: "MID" }, { name: "Nikola Vlasic", position: "MID" }, { name: "Luka Sucic", position: "MID" }, { name: "Martin Baturina", position: "MID" }, { name: "Kristijan Jakic", position: "MID" },
    { name: "Ivan Perisic", position: "FWD" }, { name: "Andrej Kramaric", position: "FWD" }, { name: "Ante Budimir", position: "FWD" }, { name: "Petar Musa", position: "FWD" }, { name: "Igor Matanovic", position: "FWD" },
  ]},
  "Uruguay": { flag: "uy", players: [
    { name: "Sergio Rochet", position: "GK" }, { name: "Fernando Muslera", position: "GK" }, { name: "Santiago Mele", position: "GK" },
    { name: "Guillermo Varela", position: "DEF" }, { name: "Ronald Araujo", position: "DEF" }, { name: "Jose Maria Gimenez", position: "DEF" }, { name: "Santiago Bueno", position: "DEF" }, { name: "Sebastian Caceres", position: "DEF" }, { name: "Mathias Olivera", position: "DEF" }, { name: "Joaquin Piquerez", position: "DEF" },
    { name: "Maximiliano Araujo", position: "MID" }, { name: "Giorgian de Arrascaeta", position: "MID" }, { name: "Rodrigo Bentancur", position: "MID" }, { name: "Agustin Canobbio", position: "MID" }, { name: "Nicolas de la Cruz", position: "MID" }, { name: "Facundo Pellistri", position: "MID" }, { name: "Federico Valverde", position: "MID" }, { name: "Manuel Ugarte", position: "MID" },
    { name: "Darwin Nunez", position: "FWD" }, { name: "Rodrigo Aguirre", position: "FWD" }, { name: "Federico Vinas", position: "FWD" },
  ]},
  "Colombia": { flag: "co", players: [
    { name: "Camilo Vargas", position: "GK" }, { name: "Alvaro Montero", position: "GK" }, { name: "David Ospina", position: "GK" },
    { name: "Davinson Sanchez", position: "DEF" }, { name: "Jhon Lucumi", position: "DEF" }, { name: "Yerry Mina", position: "DEF" }, { name: "Willer Ditta", position: "DEF" }, { name: "Daniel Munoz", position: "DEF" }, { name: "Johan Mojica", position: "DEF" }, { name: "Deiver Machado", position: "DEF" },
    { name: "Richard Rios", position: "MID" }, { name: "Jefferson Lerma", position: "MID" }, { name: "Jhon Arias", position: "MID" }, { name: "Jorge Carrascal", position: "MID" }, { name: "Juan Fernando Quintero", position: "MID" }, { name: "James Rodriguez", position: "MID" },
    { name: "Juan Camilo Hernandez", position: "FWD" }, { name: "Luis Diaz", position: "FWD" }, { name: "Carlos Gomez", position: "FWD" }, { name: "Jhon Cordoba", position: "FWD" },
  ]},
  "Ecuador": { flag: "ec", players: [
    { name: "Hernan Galindez", position: "GK" }, { name: "Moises Ramirez", position: "GK" }, { name: "Gonzalo Valle", position: "GK" },
    { name: "Piero Hincapie", position: "DEF" }, { name: "Willian Pacho", position: "DEF" }, { name: "Pervis Estupinan", position: "DEF" }, { name: "Felix Torres", position: "DEF" }, { name: "Joel Ordonez", position: "DEF" }, { name: "Jackson Porozo", position: "DEF" }, { name: "Angelo Preciado", position: "DEF" },
    { name: "Moises Caicedo", position: "MID" }, { name: "Alan Franco", position: "MID" }, { name: "Kendry Paez", position: "MID" }, { name: "Gonzalo Plata", position: "MID" }, { name: "Pedro Vite", position: "MID" }, { name: "Nilson Angulo", position: "MID" },
    { name: "Enner Valencia", position: "FWD" }, { name: "Kevin Rodriguez", position: "FWD" }, { name: "Jordy Caicedo", position: "FWD" }, { name: "Anthony Valencia", position: "FWD" },
  ]},
  "Switzerland": { flag: "ch", players: [
    { name: "Marvin Keller", position: "GK" }, { name: "Gregor Kobel", position: "GK" }, { name: "Yvon Mvogo", position: "GK" },
    { name: "Manuel Akanji", position: "DEF" }, { name: "Aurele Amenda", position: "DEF" }, { name: "Eray Comert", position: "DEF" }, { name: "Nico Elvedi", position: "DEF" }, { name: "Luca Jaquez", position: "DEF" }, { name: "Miro Muheim", position: "DEF" }, { name: "Ricardo Rodriguez", position: "DEF" }, { name: "Silvan Widmer", position: "DEF" },
    { name: "Michel Aebischer", position: "MID" }, { name: "Remo Freuler", position: "MID" }, { name: "Ardon Jashari", position: "MID" }, { name: "Fabian Rieder", position: "MID" }, { name: "Djibril Sow", position: "MID" }, { name: "Granit Xhaka", position: "MID" }, { name: "Denis Zakaria", position: "MID" },
    { name: "Ruben Vargas", position: "FWD" }, { name: "Breel Embolo", position: "FWD" }, { name: "Dan Ndoye", position: "FWD" }, { name: "Noah Okafor", position: "FWD" },
  ]},
  "Norway": { flag: "no", players: [
    { name: "Orjan Nyland", position: "GK" }, { name: "Egil Selvik", position: "GK" }, { name: "Sander Tangvik", position: "GK" },
    { name: "Kristoffer Ajer", position: "DEF" }, { name: "Fredrik Bjorkan", position: "DEF" }, { name: "Leo Ostigard", position: "DEF" }, { name: "Julian Ryerson", position: "DEF" }, { name: "Marcus Holmgren Pedersen", position: "DEF" },
    { name: "Sander Berge", position: "MID" }, { name: "Oscar Bobb", position: "MID" }, { name: "Jens Petter Hauge", position: "MID" }, { name: "Antonio Nusa", position: "MID" }, { name: "Martin Odegaard", position: "MID" }, { name: "Kristian Thorstvedt", position: "MID" },
    { name: "Erling Haaland", position: "FWD" }, { name: "Alexander Sorloth", position: "FWD" }, { name: "Jorgen Strand Larsen", position: "FWD" },
  ]},
  "Sweden": { flag: "se", players: [
    { name: "Viktor Johansson", position: "GK" }, { name: "Gustaf Lagerbielke", position: "GK" }, { name: "Jacob Zetterstrom", position: "GK" },
    { name: "Hjalmar Ekdal", position: "DEF" }, { name: "Gabriel Gudmundsson", position: "DEF" }, { name: "Isak Hien", position: "DEF" }, { name: "Victor Lindelof", position: "DEF" }, { name: "Eric Smith", position: "DEF" }, { name: "Carl Starfelt", position: "DEF" }, { name: "Daniel Svensson", position: "DEF" },
    { name: "Yasin Ayari", position: "MID" }, { name: "Lucas Bergvall", position: "MID" }, { name: "Jesper Karlstrom", position: "MID" }, { name: "Mattias Svanberg", position: "MID" }, { name: "Ken Sema", position: "MID" },
    { name: "Anthony Elanga", position: "FWD" }, { name: "Viktor Gyokeres", position: "FWD" }, { name: "Alexander Isak", position: "FWD" }, { name: "Gustaf Nilsson", position: "FWD" },
  ]},
  "Austria": { flag: "at", players: [
    { name: "Patrick Pentz", position: "GK" }, { name: "Alexander Schlager", position: "GK" }, { name: "Florian Wiegele", position: "GK" },
    { name: "David Alaba", position: "DEF" }, { name: "Kevin Danso", position: "DEF" }, { name: "Marco Friedl", position: "DEF" }, { name: "Philipp Lienhart", position: "DEF" }, { name: "Stefan Posch", position: "DEF" }, { name: "Michael Svoboda", position: "DEF" },
    { name: "Christoph Baumgartner", position: "MID" }, { name: "Florian Grillitsch", position: "MID" }, { name: "Konrad Laimer", position: "MID" }, { name: "Marcel Sabitzer", position: "MID" }, { name: "Xaver Schlager", position: "MID" }, { name: "Romano Schmid", position: "MID" }, { name: "Nicolas Seiwald", position: "MID" },
    { name: "Marko Arnautovic", position: "FWD" }, { name: "Michael Gregoritsch", position: "FWD" }, { name: "Sasa Kalajdzic", position: "FWD" },
  ]},
  "Serbia": { flag: "rs", players: [
    { name: "Predrag Rajkovic", position: "GK" }, { name: "Vanja Milinkovic-Savic", position: "GK" }, { name: "Marko Dmitrovic", position: "GK" },
    { name: "Strahinja Pavlovic", position: "DEF" }, { name: "Nikola Milenkovic", position: "DEF" }, { name: "Filip Mladenovic", position: "DEF" }, { name: "Srdan Babic", position: "DEF" }, { name: "Stefan Mitrovic", position: "DEF" },
    { name: "Sergej Milinkovic-Savic", position: "MID" }, { name: "Nemanja Gudelj", position: "MID" }, { name: "Filip Kostic", position: "MID" }, { name: "Ivan Ilic", position: "MID" }, { name: "Lazar Samardzic", position: "MID" },
    { name: "Aleksandar Mitrovic", position: "FWD" }, { name: "Dusan Vlahovic", position: "FWD" }, { name: "Dusan Tadic", position: "FWD" }, { name: "Sasa Lukic", position: "FWD" },
  ]},
  "Czechia": { flag: "cz", players: [
    { name: "Lukas Hornicek", position: "GK" }, { name: "Matej Kovar", position: "GK" }, { name: "Jindrich Stanek", position: "GK" },
    { name: "Vladimir Coufal", position: "DEF" }, { name: "David Doudera", position: "DEF" }, { name: "Tomas Holes", position: "DEF" }, { name: "Robin Hranac", position: "DEF" }, { name: "David Jurasek", position: "DEF" }, { name: "Ladislav Krejci", position: "DEF" },
    { name: "Vladimir Darida", position: "MID" }, { name: "Lukas Provod", position: "MID" }, { name: "Tomas Soucek", position: "MID" }, { name: "Pavel Sulc", position: "MID" },
    { name: "Adam Hlozek", position: "FWD" }, { name: "Tomas Chory", position: "FWD" }, { name: "Jan Kuchta", position: "FWD" }, { name: "Patrik Schick", position: "FWD" },
  ]},
  "Paraguay": { flag: "py", players: [
    { name: "Orlando Gill", position: "GK" }, { name: "Roberto Fernandez", position: "GK" }, { name: "Gaston Olveira", position: "GK" },
    { name: "Juan Caceres", position: "DEF" }, { name: "Gustavo Velazquez", position: "DEF" }, { name: "Gustavo Gomez", position: "DEF" }, { name: "Junior Alonso", position: "DEF" }, { name: "Omar Alderete", position: "DEF" }, { name: "Fabian Balbuena", position: "DEF" },
    { name: "Diego Gomez", position: "MID" }, { name: "Damian Bobadilla", position: "MID" }, { name: "Braian Ojeda", position: "MID" }, { name: "Andres Cubas", position: "MID" }, { name: "Alejandro Gamarra", position: "MID" },
    { name: "Ramon Sosa", position: "FWD" }, { name: "Miguel Almiron", position: "FWD" }, { name: "Julio Enciso", position: "FWD" }, { name: "Antonio Sanabria", position: "FWD" },
  ]},
  "Bosnia & Herzegovina": { flag: "ba", players: [
    { name: "Nikola Vasilj", position: "GK" }, { name: "Martin Zlomislic", position: "GK" }, { name: "Osman Hadzikic", position: "GK" },
    { name: "Sead Kolasinac", position: "DEF" }, { name: "Amar Dedic", position: "DEF" }, { name: "Nihad Mujakic", position: "DEF" }, { name: "Nikola Katic", position: "DEF" }, { name: "Tarik Muharemovic", position: "DEF" }, { name: "Dennis Hadzikadunic", position: "DEF" },
    { name: "Amir Hadziahmetovic", position: "MID" }, { name: "Ivan Sunjic", position: "MID" }, { name: "Ivan Basic", position: "MID" }, { name: "Benjamin Tahirovic", position: "MID" }, { name: "Esmir Bajraktarevic", position: "MID" },
    { name: "Ermedin Demirovic", position: "FWD" }, { name: "Haris Tabakovic", position: "FWD" }, { name: "Edin Dzeko", position: "FWD" },
  ]},
  "Türkiye": { flag: "tr", players: [
    { name: "Altay Bayindir", position: "GK" }, { name: "Mert Gunok", position: "GK" }, { name: "Ugurcan Cakir", position: "GK" },
    { name: "Abdulkerim Bardakci", position: "DEF" }, { name: "Caglar Soyuncu", position: "DEF" }, { name: "Ferdi Kadioglu", position: "DEF" }, { name: "Merih Demiral", position: "DEF" }, { name: "Mert Muldur", position: "DEF" }, { name: "Ozan Kabak", position: "DEF" }, { name: "Zeki Celik", position: "DEF" },
    { name: "Hakan Calhanoglu", position: "MID" }, { name: "Orkun Kokcu", position: "MID" }, { name: "Salih Ozcan", position: "MID" }, { name: "Kaan Ayhan", position: "MID" },
    { name: "Arda Guler", position: "FWD" }, { name: "Baris Alper Yilmaz", position: "FWD" }, { name: "Can Uzun", position: "FWD" }, { name: "Kenan Yildiz", position: "FWD" }, { name: "Kerem Akturkoglu", position: "FWD" }, { name: "Yunus Akgun", position: "FWD" },
  ]},
  "Senegal": { flag: "sn", players: [
    { name: "Edouard Mendy", position: "GK" }, { name: "Mory Diaw", position: "GK" }, { name: "Yehvann Diouf", position: "GK" },
    { name: "Kalidou Koulibaly", position: "DEF" }, { name: "El Hadji Malick Diouf", position: "DEF" }, { name: "Mamadou Sarr", position: "DEF" }, { name: "Moussa Niakhate", position: "DEF" }, { name: "Abdoulaye Seck", position: "DEF" }, { name: "Ismail Jakobs", position: "DEF" },
    { name: "Idrissa Gana Gueye", position: "MID" }, { name: "Pape Gueye", position: "MID" }, { name: "Lamine Camara", position: "MID" }, { name: "Habib Diarra", position: "MID" }, { name: "Pape Matar Sarr", position: "MID" },
    { name: "Sadio Mane", position: "FWD" }, { name: "Ismaila Sarr", position: "FWD" }, { name: "Iliman Ndiaye", position: "FWD" }, { name: "Nicolas Jackson", position: "FWD" }, { name: "Bamba Dieng", position: "FWD" },
  ]},
  "Egypt": { flag: "eg", players: [
    { name: "Mohamed El Shenawy", position: "GK" }, { name: "Mostafa Shobeir", position: "GK" }, { name: "Mohamed Alaa", position: "GK" },
    { name: "Mohamed Abdelmonem", position: "DEF" }, { name: "Mohamed Hany", position: "DEF" }, { name: "Yasser Ibrahim", position: "DEF" }, { name: "Ahmed Fattouh", position: "DEF" }, { name: "Karim Hafez", position: "DEF" },
    { name: "Marwan Attia", position: "MID" }, { name: "Ahmed Sayed Zizo", position: "MID" }, { name: "Mahmoud Hassan Trezeguet", position: "MID" }, { name: "Emam Ashour", position: "MID" }, { name: "Ibrahim Adel", position: "MID" }, { name: "Hamdi Fathi", position: "MID" },
    { name: "Mohamed Salah", position: "FWD" }, { name: "Omar Marmoush", position: "FWD" }, { name: "Hamza Abdel Karim", position: "FWD" },
  ]},
  "Algeria": { flag: "dz", players: [
    { name: "Oussama Benbot", position: "GK" }, { name: "Melvin Masstil", position: "GK" }, { name: "Luca Zidane", position: "GK" },
    { name: "Achraf Abada", position: "DEF" }, { name: "Rayan Ait Nouri", position: "DEF" }, { name: "Ramy Bensebaini", position: "DEF" }, { name: "Samir Chergui", position: "DEF" }, { name: "Jaouen Hadjam", position: "DEF" }, { name: "Aissa Mandi", position: "DEF" }, { name: "Rafik Belghali", position: "DEF" },
    { name: "Houssem Aouar", position: "MID" }, { name: "Nabil Bentaleb", position: "MID" }, { name: "Hicham Boudaoui", position: "MID" }, { name: "Fares Chaibi", position: "MID" }, { name: "Ibrahim Maza", position: "MID" }, { name: "Ramiz Zerrouki", position: "MID" },
    { name: "Mohamed Amine Amoura", position: "FWD" }, { name: "Fares Ghedjemis", position: "FWD" }, { name: "Amine Gouiri", position: "FWD" }, { name: "Riyad Mahrez", position: "FWD" }, { name: "Nadir Benbouali", position: "FWD" },
  ]},
  "Ivory Coast": { flag: "ci", players: [
    { name: "Yahia Fofana", position: "GK" }, { name: "Mohamed Kone", position: "GK" }, { name: "Alban Lafont", position: "GK" },
    { name: "Emmanuel Agbadou", position: "DEF" }, { name: "Ousmane Diomande", position: "DEF" }, { name: "Guela Doue", position: "DEF" }, { name: "Ghislain Konan", position: "DEF" }, { name: "Odilon Kossounou", position: "DEF" }, { name: "Wilfried Singo", position: "DEF" }, { name: "Evan Ndicka", position: "DEF" },
    { name: "Seko Fofana", position: "MID" }, { name: "Franck Kessie", position: "MID" }, { name: "Ibrahim Sangare", position: "MID" }, { name: "Jean Michael Seri", position: "MID" },
    { name: "Simon Adingra", position: "FWD" }, { name: "Amad Diallo", position: "FWD" }, { name: "Nicolas Pepe", position: "FWD" }, { name: "Elye Wahi", position: "FWD" }, { name: "Evann Guessand", position: "FWD" },
  ]},
  "Ghana": { flag: "gh", players: [
    { name: "Joseph Anang", position: "GK" }, { name: "Benjamin Asare", position: "GK" }, { name: "Lawrence Ati-Zigi", position: "GK" },
    { name: "Derrick Luckassen", position: "DEF" }, { name: "Gideon Mensah", position: "DEF" }, { name: "Abdul Mumin", position: "DEF" }, { name: "Jerome Opoku", position: "DEF" }, { name: "Baba Abdul Rahman", position: "DEF" }, { name: "Alidu Seidu", position: "DEF" },
    { name: "Abdul Fatawu Issahaku", position: "MID" }, { name: "Thomas Partey", position: "MID" }, { name: "Kamal Deen Sulemana", position: "MID" },
    { name: "Jordan Ayew", position: "FWD" }, { name: "Ernest Nuamah", position: "FWD" }, { name: "Antoine Semenyo", position: "FWD" }, { name: "Inaki Williams", position: "FWD" },
  ]},
  "South Africa": { flag: "za", players: [
    { name: "Ronwen Williams", position: "GK" }, { name: "Ricardo Goss", position: "GK" }, { name: "Sipho Chaine", position: "GK" },
    { name: "Aubrey Modiba", position: "DEF" }, { name: "Khuliso Mudau", position: "DEF" }, { name: "Nkosinathi Sibisi", position: "DEF" }, { name: "Bradley Cross", position: "DEF" }, { name: "Samukele Kabini", position: "DEF" },
    { name: "Oswin Appollis", position: "MID" }, { name: "Thalente Mbatha", position: "MID" }, { name: "Relebohile Mofokeng", position: "MID" }, { name: "Jayden Adams", position: "MID" }, { name: "Teboho Mokoena", position: "MID" }, { name: "Themba Zwane", position: "MID" },
    { name: "Evidence Makgopa", position: "FWD" }, { name: "Lyle Foster", position: "FWD" }, { name: "Iqraam Rayners", position: "FWD" },
  ]},
  "Iran": { flag: "ir", players: [
    { name: "Alireza Beiranvand", position: "GK" }, { name: "Seyed Hossein Hosseini", position: "GK" }, { name: "Payam Niazmand", position: "GK" },
    { name: "Ehsan Hajsafi", position: "DEF" }, { name: "Shoja Khalilzadeh", position: "DEF" }, { name: "Milad Mohammadi", position: "DEF" }, { name: "Ali Nemati", position: "DEF" }, { name: "Ramin Rezaeian", position: "DEF" },
    { name: "Saeid Ezatolahi", position: "MID" }, { name: "Saman Ghoddos", position: "MID" }, { name: "Alireza Jahanbakhsh", position: "MID" }, { name: "Mehdi Ghaedi", position: "MID" }, { name: "Mehdi Torabi", position: "MID" },
    { name: "Mehdi Taremi", position: "FWD" }, { name: "Ali Alipour", position: "FWD" }, { name: "Amirhossein Hosseinzadeh", position: "FWD" },
  ]},
  "Saudi Arabia": { flag: "sa", players: [
    { name: "Mohamed Al Owais", position: "GK" }, { name: "Nawaf Al Aqidi", position: "GK" }, { name: "Ahmed Alkassar", position: "GK" },
    { name: "Saud Abdulhamid", position: "DEF" }, { name: "Abdulelah Al Amri", position: "DEF" }, { name: "Hassan Tambakti", position: "DEF" }, { name: "Ali Lajami", position: "DEF" }, { name: "Nawaf Boushal", position: "DEF" },
    { name: "Nasser Al Dawsari", position: "MID" }, { name: "Mohamed Kanno", position: "MID" }, { name: "Musab Al Juwayr", position: "MID" }, { name: "Khalid Al Ghannam", position: "MID" },
    { name: "Salem Al Dawsari", position: "FWD" }, { name: "Abdullah Al Hamdan", position: "FWD" }, { name: "Feras Al Brikan", position: "FWD" }, { name: "Saleh Al Shehri", position: "FWD" },
  ]},
  "Tunisia": { flag: "tn", players: [
    { name: "Sabri Ben Hessen", position: "GK" }, { name: "Abdelmouhib Chamakh", position: "GK" }, { name: "Aymen Dahman", position: "GK" },
    { name: "Ali Abdi", position: "DEF" }, { name: "Dylan Bronn", position: "DEF" }, { name: "Omar Rekik", position: "DEF" }, { name: "Montassar Talbi", position: "DEF" }, { name: "Yan Valery", position: "DEF" },
    { name: "Anis Ben Slimane", position: "MID" }, { name: "Rani Khedira", position: "MID" }, { name: "Hannibal Mejbri", position: "MID" }, { name: "Ellyes Skhiri", position: "MID" }, { name: "Ismael Gharbi", position: "MID" },
    { name: "Firas Chaouat", position: "FWD" }, { name: "Elias Saad", position: "FWD" }, { name: "Hazem Mastouri", position: "FWD" },
  ]},
  "Qatar": { flag: "qa", players: [
    { name: "Salah Zakaria", position: "GK" }, { name: "Meshaal Barsham", position: "GK" }, { name: "Mahmoud Abunada", position: "GK" },
    { name: "Boualem Khoukhi", position: "DEF" }, { name: "Pedro Miguel", position: "DEF" }, { name: "Sultan Al Brake", position: "DEF" }, { name: "Homam Al Amin", position: "DEF" }, { name: "Lucas Mendes", position: "DEF" },
    { name: "Ahmed Fathi", position: "MID" }, { name: "Assim Madibo", position: "MID" }, { name: "Abdulaziz Hatem", position: "MID" }, { name: "Karim Boudiaf", position: "MID" },
    { name: "Almoez Ali", position: "FWD" }, { name: "Akram Afif", position: "FWD" }, { name: "Edmilson Junior", position: "FWD" }, { name: "Hassan Al Haydos", position: "FWD" }, { name: "Mohammed Muntari", position: "FWD" },
  ]},
  "Iraq": { flag: "iq", players: [
    { name: "Fahad Talib", position: "GK" }, { name: "Jalal Hassan", position: "GK" }, { name: "Ahmed Basil", position: "GK" },
    { name: "Hussein Ali", position: "DEF" }, { name: "Manaf Younis", position: "DEF" }, { name: "Zaid Tahseen", position: "DEF" }, { name: "Akam Hashem", position: "DEF" }, { name: "Merchas Doski", position: "DEF" }, { name: "Ahmed Yahya", position: "DEF" },
    { name: "Kevin Yakob", position: "MID" }, { name: "Zidane Iqbal", position: "MID" }, { name: "Ibrahim Bayesh", position: "MID" }, { name: "Ahmed Qasim", position: "MID" }, { name: "Marko Farji", position: "MID" },
    { name: "Ali Jassim", position: "FWD" }, { name: "Ali Al Hamadi", position: "FWD" }, { name: "Aymen Hussein", position: "FWD" }, { name: "Mohanad Ali", position: "FWD" },
  ]},
  "Jordan": { flag: "jo", players: [
    { name: "Yazid Abulaila", position: "GK" }, { name: "Noor Bani Attiah", position: "GK" }, { name: "Abdallah Al Fakhouri", position: "GK" },
    { name: "Mohammad Abu Hashish", position: "DEF" }, { name: "Hussam Abu Dhahab", position: "DEF" }, { name: "Mohammad Abu Alnadi", position: "DEF" }, { name: "Salem Obaid", position: "DEF" }, { name: "Ehsan Haddad", position: "DEF" },
    { name: "Amer Jamous", position: "MID" }, { name: "Noor Al Rawabdeh", position: "MID" }, { name: "Ibrahim Sadeh", position: "MID" }, { name: "Mohammad Al Dawoud", position: "MID" }, { name: "Mahmoud Mardahi", position: "MID" },
    { name: "Ali Olwan", position: "FWD" }, { name: "Mousa Al Tamari", position: "FWD" }, { name: "Odeh Fakhoury", position: "FWD" }, { name: "Ibrahim Sabra", position: "FWD" },
  ]},
  "Uzbekistan": { flag: "uz", players: [
    { name: "Botirali Ergashev", position: "GK" }, { name: "Abduvohid Nematov", position: "GK" }, { name: "Utkir Yusupov", position: "GK" },
    { name: "Abdukodir Khusanov", position: "DEF" }, { name: "Khojiakbar Alijonov", position: "DEF" }, { name: "Rustamjon Ashurmatov", position: "DEF" }, { name: "Farrukh Sayfiev", position: "DEF" }, { name: "Sherzod Nasrullaev", position: "DEF" },
    { name: "Otabek Shukurov", position: "MID" }, { name: "Jaloliddin Masharipov", position: "MID" }, { name: "Azizbek Ganiev", position: "MID" }, { name: "Abbosbek Fayzullaev", position: "MID" }, { name: "Jamshid Iskanderov", position: "MID" },
    { name: "Eldor Shomurodov", position: "FWD" }, { name: "Igor Sergeev", position: "FWD" }, { name: "Oston Urunov", position: "FWD" }, { name: "Dostonbek Hamdamov", position: "FWD" },
  ]},
  "DR Congo": { flag: "cd", players: [
    { name: "Matthieu Epolo", position: "GK" }, { name: "Timothy Fayulu", position: "GK" }, { name: "Lionel Mpasi", position: "GK" },
    { name: "Dylan Batubinsika", position: "DEF" }, { name: "Gedeon Kalulu", position: "DEF" }, { name: "Joris Kayembe", position: "DEF" }, { name: "Arthur Masuaku", position: "DEF" }, { name: "Chancel Mbemba", position: "DEF" }, { name: "Aaron Wan-Bissaka", position: "DEF" },
    { name: "Gael Kakuta", position: "MID" }, { name: "Nathanael Mbuku", position: "MID" }, { name: "Samuel Moutoussamy", position: "MID" }, { name: "Noah Sadiki", position: "MID" },
    { name: "Cedric Bakambu", position: "FWD" }, { name: "Simon Banza", position: "FWD" }, { name: "Fiston Mayele", position: "FWD" }, { name: "Yoane Wissa", position: "FWD" }, { name: "Theo Bongonda", position: "FWD" },
  ]},
  "New Zealand": { flag: "nz", players: [
    { name: "Max Crocombe", position: "GK" }, { name: "Alex Paulsen", position: "GK" }, { name: "Michael Woud", position: "GK" },
    { name: "Tyler Bindon", position: "DEF" }, { name: "Michael Boxall", position: "DEF" }, { name: "Liberato Cacace", position: "DEF" }, { name: "Francis de Vries", position: "DEF" }, { name: "Finn Surman", position: "DEF" }, { name: "Tommy Smith", position: "DEF" },
    { name: "Joe Bell", position: "MID" }, { name: "Matt Garbett", position: "MID" }, { name: "Callum McCowatt", position: "MID" }, { name: "Ben Old", position: "MID" }, { name: "Sarpreet Singh", position: "MID" }, { name: "Ryan Thomas", position: "MID" },
    { name: "Kosta Barbarouses", position: "FWD" }, { name: "Ben Waine", position: "FWD" }, { name: "Chris Wood", position: "FWD" },
  ]},
  "Cape Verde": { flag: "cv", players: [
    { name: "CJ dos Santos", position: "GK" }, { name: "Marcio Rosa", position: "GK" }, { name: "Vozinha", position: "GK" },
    { name: "Logan Costa", position: "DEF" }, { name: "Roberto Lopes", position: "DEF" }, { name: "Steven Moreira", position: "DEF" }, { name: "Wagner Pina", position: "DEF" }, { name: "Stopira", position: "DEF" }, { name: "Joao Paulo Fernandes", position: "DEF" },
    { name: "Telmo Arcanjo", position: "MID" }, { name: "Deroy Duarte", position: "MID" }, { name: "Laros Duarte", position: "MID" }, { name: "Jamiro Monteiro", position: "MID" }, { name: "Kevin Pina", position: "MID" }, { name: "Yannick Semedo", position: "MID" },
    { name: "Jovane Cabral", position: "FWD" }, { name: "Dailon Livramento", position: "FWD" }, { name: "Ryan Mendes", position: "FWD" }, { name: "Garry Rodrigues", position: "FWD" }, { name: "Nuno da Costa", position: "FWD" },
  ]},
  "Curaçao": { flag: "cw", players: [
    { name: "Tyrick Bodack", position: "GK" }, { name: "Trevor Doornbusch", position: "GK" }, { name: "Eloy Room", position: "GK" },
    { name: "Riechedly Bazoer", position: "DEF" }, { name: "Joshua Brenet", position: "DEF" }, { name: "Roshon van Eijma", position: "DEF" }, { name: "Sherel Floranus", position: "DEF" }, { name: "Armando Obispo", position: "DEF" }, { name: "Shurandy Sambo", position: "DEF" },
    { name: "Juninho Bacuna", position: "MID" }, { name: "Leandro Bacuna", position: "MID" }, { name: "Livano Comenencia", position: "MID" }, { name: "Tyrese Noslin", position: "MID" },
    { name: "Tahith Chong", position: "FWD" }, { name: "Sontje Hansen", position: "FWD" }, { name: "Jurgen Locadia", position: "FWD" }, { name: "Brandley Kuwas", position: "FWD" },
  ]},
  "Haiti": { flag: "ht", players: [
    { name: "Josue Duverger", position: "GK" }, { name: "Alexandre Pierre", position: "GK" }, { name: "Johny Placide", position: "GK" },
    { name: "Ricardo Ade", position: "DEF" }, { name: "Carlens Arcus", position: "DEF" }, { name: "Hannes Delcroix", position: "DEF" }, { name: "Jean-Kevin Duverne", position: "DEF" }, { name: "Duke Lacroix", position: "DEF" },
    { name: "Jean-Ricner Bellegarde", position: "MID" }, { name: "Leverton Pierre", position: "MID" }, { name: "Danley Jean Jacques", position: "MID" }, { name: "Dominique Simon", position: "MID" },
    { name: "Wilson Isidor", position: "FWD" }, { name: "Duckens Nazon", position: "FWD" }, { name: "Frantzdy Pierrot", position: "FWD" }, { name: "Derrick Etienne Jr.", position: "FWD" },
  ]},
  "Panama": { flag: "pa", players: [
    { name: "Orlando Mosquera", position: "GK" }, { name: "Luis Mejia", position: "GK" }, { name: "Cesar Samudio", position: "GK" },
    { name: "Amir Murillo", position: "DEF" }, { name: "Fidel Escobar", position: "DEF" }, { name: "Andres Andrade", position: "DEF" }, { name: "Edgardo Farina", position: "DEF" }, { name: "Jose Cordoba", position: "DEF" }, { name: "Eric Davis", position: "DEF" },
    { name: "Anibal Godoy", position: "MID" }, { name: "Adalberto Carrasquilla", position: "MID" }, { name: "Carlos Harvey", position: "MID" }, { name: "Cesar Yanis", position: "MID" }, { name: "Alberto Quintero", position: "MID" },
    { name: "Ismael Diaz", position: "FWD" }, { name: "Cecilio Waterman", position: "FWD" }, { name: "Jose Fajardo", position: "FWD" }, { name: "Tomas Rodriguez", position: "FWD" },
  ]},
};

// POINTS are defined in types.ts
