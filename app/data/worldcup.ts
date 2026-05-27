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
    { id: "r32-73", label: "Match 73", placeholder: "2nd A vs 2nd B", dateUK: "28 Jun", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
    { id: "r32-76", label: "Match 76", placeholder: "1st C vs 2nd F", dateUK: "29 Jun", timeUK: "18:00 BST", stadium: "NRG Stadium", city: "Houston" },
    { id: "r32-74", label: "Match 74", placeholder: "1st E vs Best 3rd", dateUK: "29 Jun", timeUK: "21:30 BST", stadium: "Gillette Stadium", city: "Foxborough" },
    { id: "r32-75", label: "Match 75", placeholder: "1st F vs 2nd C", dateUK: "30 Jun", timeUK: "02:00 BST", stadium: "Estadio BBVA", city: "Monterrey" },
    { id: "r32-78", label: "Match 78", placeholder: "2nd E vs 2nd I", dateUK: "30 Jun", timeUK: "18:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
    { id: "r32-77", label: "Match 77", placeholder: "1st I vs Best 3rd", dateUK: "30 Jun", timeUK: "22:00 BST", stadium: "MetLife Stadium", city: "East Rutherford" },
    { id: "r32-79", label: "Match 79", placeholder: "1st A vs Best 3rd", dateUK: "1 Jul", timeUK: "02:00 BST", stadium: "Estadio Azteca", city: "Mexico City" },
    { id: "r32-80", label: "Match 80", placeholder: "1st L vs Best 3rd", dateUK: "1 Jul", timeUK: "17:00 BST", stadium: "Mercedes-Benz Stadium", city: "Atlanta" },
    { id: "r32-82", label: "Match 82", placeholder: "1st G vs Best 3rd", dateUK: "1 Jul", timeUK: "21:00 BST", stadium: "Lumen Field", city: "Seattle" },
    { id: "r32-81", label: "Match 81", placeholder: "1st D vs Best 3rd", dateUK: "2 Jul", timeUK: "01:00 BST", stadium: "Levi's Stadium", city: "Santa Clara" },
    { id: "r32-84", label: "Match 84", placeholder: "1st H vs 2nd J", dateUK: "2 Jul", timeUK: "20:00 BST", stadium: "SoFi Stadium", city: "Inglewood" },
    { id: "r32-83", label: "Match 83", placeholder: "2nd K vs 2nd L", dateUK: "3 Jul", timeUK: "00:00 BST", stadium: "BMO Field", city: "Toronto" },
    { id: "r32-85", label: "Match 85", placeholder: "1st B vs Best 3rd", dateUK: "3 Jul", timeUK: "04:00 BST", stadium: "BC Place", city: "Vancouver" },
    { id: "r32-88", label: "Match 88", placeholder: "2nd D vs 2nd G", dateUK: "3 Jul", timeUK: "19:00 BST", stadium: "AT&T Stadium", city: "Arlington" },
    { id: "r32-86", label: "Match 86", placeholder: "1st J vs 2nd H", dateUK: "3 Jul", timeUK: "23:00 BST", stadium: "Hard Rock Stadium", city: "Miami" },
    { id: "r32-87", label: "Match 87", placeholder: "1st K vs Best 3rd", dateUK: "4 Jul", timeUK: "02:30 BST", stadium: "Arrowhead Stadium", city: "Kansas City" },
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
    { name: "Jordan Pickford", position: "GK" }, { name: "Aaron Ramsdale", position: "GK" },
    { name: "John Stones", position: "DEF" }, { name: "Marc Guéhi", position: "DEF" }, { name: "Ezri Konsa", position: "DEF" }, { name: "Luke Shaw", position: "DEF" }, { name: "Kieran Trippier", position: "DEF" },
    { name: "Declan Rice", position: "MID" }, { name: "Jude Bellingham", position: "MID" }, { name: "Conor Gallagher", position: "MID" }, { name: "Phil Foden", position: "MID" }, { name: "Cole Palmer", position: "MID" }, { name: "Adam Wharton", position: "MID" },
    { name: "Harry Kane", position: "FWD" }, { name: "Bukayo Saka", position: "FWD" }, { name: "Marcus Rashford", position: "FWD" }, { name: "Jack Grealish", position: "FWD" }, { name: "Ollie Watkins", position: "FWD" }, { name: "Anthony Gordon", position: "FWD" }, { name: "Jarrod Bowen", position: "FWD" },
  ]},
  "France": { flag: "fr", players: [
    { name: "Mike Maignan", position: "GK" },
    { name: "Jules Koundé", position: "DEF" }, { name: "William Saliba", position: "DEF" }, { name: "Benjamin Pavard", position: "DEF" }, { name: "Theo Hernandez", position: "DEF" },
    { name: "Aurélien Tchouaméni", position: "MID" }, { name: "Adrien Rabiot", position: "MID" }, { name: "Eduardo Camavinga", position: "MID" },
    { name: "Kylian Mbappé", position: "FWD" }, { name: "Antoine Griezmann", position: "FWD" }, { name: "Ousmane Dembélé", position: "FWD" }, { name: "Marcus Thuram", position: "FWD" }, { name: "Randal Kolo Muani", position: "FWD" },
  ]},
  "Spain": { flag: "es", players: [
    { name: "Unai Simón", position: "GK" },
    { name: "Dani Carvajal", position: "DEF" }, { name: "Pau Cubarsí", position: "DEF" }, { name: "Aymeric Laporte", position: "DEF" }, { name: "Alejandro Grimaldo", position: "DEF" },
    { name: "Rodri", position: "MID" }, { name: "Pedri", position: "MID" }, { name: "Gavi", position: "MID" }, { name: "Fabián Ruiz", position: "MID" },
    { name: "Lamine Yamal", position: "FWD" }, { name: "Nico Williams", position: "FWD" }, { name: "Dani Olmo", position: "FWD" }, { name: "Álvaro Morata", position: "FWD" }, { name: "Ferran Torres", position: "FWD" },
  ]},
  "Germany": { flag: "de", players: [
    { name: "Manuel Neuer", position: "GK" },
    { name: "Antonio Rüdiger", position: "DEF" }, { name: "Jonathan Tah", position: "DEF" }, { name: "David Raum", position: "DEF" }, { name: "Joshua Kimmich", position: "DEF" },
    { name: "İlkay Gündoğan", position: "MID" }, { name: "Leon Goretzka", position: "MID" }, { name: "Jamal Musiala", position: "MID" }, { name: "Florian Wirtz", position: "MID" },
    { name: "Leroy Sané", position: "FWD" }, { name: "Kai Havertz", position: "FWD" }, { name: "Thomas Müller", position: "FWD" }, { name: "Niclas Füllkrug", position: "FWD" },
  ]},
  "Brazil": { flag: "br", players: [
    { name: "Alisson", position: "GK" },
    { name: "Marquinhos", position: "DEF" }, { name: "Eder Militão", position: "DEF" }, { name: "Danilo", position: "DEF" }, { name: "Guilherme Arana", position: "DEF" },
    { name: "Casemiro", position: "MID" }, { name: "Bruno Guimarães", position: "MID" }, { name: "Lucas Paquetá", position: "MID" },
    { name: "Vinicius Jr", position: "FWD" }, { name: "Raphinha", position: "FWD" }, { name: "Rodrygo", position: "FWD" }, { name: "Richarlison", position: "FWD" }, { name: "Gabriel Martinelli", position: "FWD" }, { name: "Endrick", position: "FWD" },
  ]},
  "Argentina": { flag: "ar", players: [
    { name: "Emiliano Martínez", position: "GK" },
    { name: "Cristian Romero", position: "DEF" }, { name: "Lisandro Martínez", position: "DEF" }, { name: "Nicolás Tagliafico", position: "DEF" }, { name: "Nahuel Molina", position: "DEF" },
    { name: "Rodrigo De Paul", position: "MID" }, { name: "Enzo Fernández", position: "MID" }, { name: "Mac Allister", position: "MID" },
    { name: "Lionel Messi", position: "FWD" }, { name: "Julián Álvarez", position: "FWD" }, { name: "Lautaro Martínez", position: "FWD" }, { name: "Alejandro Garnacho", position: "FWD" }, { name: "Paulo Dybala", position: "FWD" },
  ]},
  "Portugal": { flag: "pt", players: [
    { name: "Rui Patrício", position: "GK" },
    { name: "João Cancelo", position: "DEF" }, { name: "Rúben Dias", position: "DEF" }, { name: "Pepe", position: "DEF" }, { name: "Nuno Mendes", position: "DEF" },
    { name: "Vitinha", position: "MID" }, { name: "Bernardo Silva", position: "MID" }, { name: "Palhinha", position: "MID" },
    { name: "Cristiano Ronaldo", position: "FWD" }, { name: "Bruno Fernandes", position: "FWD" }, { name: "Rafael Leão", position: "FWD" }, { name: "João Felix", position: "FWD" }, { name: "Gonçalo Ramos", position: "FWD" },
  ]},
  "Netherlands": { flag: "nl", players: [
    { name: "Jasper Cillessen", position: "GK" },
    { name: "Virgil van Dijk", position: "DEF" }, { name: "Matthijs de Ligt", position: "DEF" }, { name: "Nathan Aké", position: "DEF" }, { name: "Denzel Dumfries", position: "DEF" },
    { name: "Frenkie de Jong", position: "MID" }, { name: "Tijjani Reijnders", position: "MID" }, { name: "Xavi Simons", position: "MID" },
    { name: "Cody Gakpo", position: "FWD" }, { name: "Memphis Depay", position: "FWD" }, { name: "Wout Weghorst", position: "FWD" },
  ]},
  "Belgium": { flag: "be", players: [
    { name: "Thibaut Courtois", position: "GK" },
    { name: "Toby Alderweireld", position: "DEF" }, { name: "Jan Vertonghen", position: "DEF" }, { name: "Arthur Theate", position: "DEF" }, { name: "Thomas Meunier", position: "DEF" },
    { name: "Kevin De Bruyne", position: "MID" }, { name: "Axel Witsel", position: "MID" }, { name: "Amadou Onana", position: "MID" },
    { name: "Romelu Lukaku", position: "FWD" }, { name: "Jeremy Doku", position: "FWD" }, { name: "Leandro Trossard", position: "FWD" }, { name: "Charles De Ketelaere", position: "FWD" },
  ]},
  "Morocco": { flag: "ma", players: [
    { name: "Yassine Bounou", position: "GK" },
    { name: "Achraf Hakimi", position: "DEF" }, { name: "Romain Saïss", position: "DEF" }, { name: "Nayef Aguerd", position: "DEF" }, { name: "Noussair Mazraoui", position: "DEF" },
    { name: "Sofyan Amrabat", position: "MID" }, { name: "Azzedine Ounahi", position: "MID" }, { name: "Selim Amallah", position: "MID" },
    { name: "Hakim Ziyech", position: "FWD" }, { name: "Youssef En-Nesyri", position: "FWD" }, { name: "Sofiane Boufal", position: "FWD" },
  ]},
  "Senegal": { flag: "sn", players: [
    { name: "Édouard Mendy", position: "GK" },
    { name: "Kalidou Koulibaly", position: "DEF" }, { name: "Abdou Diallo", position: "DEF" }, { name: "Formose Mendy", position: "DEF" },
    { name: "Pape Gueye", position: "MID" }, { name: "Cheikhou Kouyaté", position: "MID" }, { name: "Nampalys Mendy", position: "MID" },
    { name: "Sadio Mané", position: "FWD" }, { name: "Ismaïla Sarr", position: "FWD" }, { name: "Boulaye Dia", position: "FWD" }, { name: "Nicolas Jackson", position: "FWD" },
  ]},
  "USA": { flag: "us", players: [
    { name: "Matt Turner", position: "GK" },
    { name: "Sergiño Dest", position: "DEF" }, { name: "Walker Zimmerman", position: "DEF" }, { name: "Antonee Robinson", position: "DEF" }, { name: "Tim Ream", position: "DEF" },
    { name: "Tyler Adams", position: "MID" }, { name: "Weston McKennie", position: "MID" }, { name: "Yunus Musah", position: "MID" },
    { name: "Christian Pulisic", position: "FWD" }, { name: "Gio Reyna", position: "FWD" }, { name: "Tim Weah", position: "FWD" }, { name: "Brenden Aaronson", position: "FWD" }, { name: "Ricardo Pepi", position: "FWD" },
  ]},
  "Mexico": { flag: "mx", players: [
    { name: "Guillermo Ochoa", position: "GK" },
    { name: "Jorge Sánchez", position: "DEF" }, { name: "César Montes", position: "DEF" }, { name: "Jesús Gallardo", position: "DEF" },
    { name: "Edson Álvarez", position: "MID" }, { name: "Héctor Herrera", position: "MID" }, { name: "Andres Guardado", position: "MID" },
    { name: "Hirving Lozano", position: "FWD" }, { name: "Raúl Jiménez", position: "FWD" }, { name: "Henry Martín", position: "FWD" }, { name: "Uriel Antuna", position: "FWD" },
  ]},
  "Japan": { flag: "jp", players: [
    { name: "Shuichi Gonda", position: "GK" },
    { name: "Ko Itakura", position: "DEF" }, { name: "Maya Yoshida", position: "DEF" }, { name: "Yuto Nagatomo", position: "DEF" }, { name: "Hiroki Sakai", position: "DEF" },
    { name: "Wataru Endo", position: "MID" }, { name: "Hidemasa Morita", position: "MID" }, { name: "Daichi Kamada", position: "MID" },
    { name: "Kaoru Mitoma", position: "FWD" }, { name: "Takumi Minamino", position: "FWD" }, { name: "Ritsu Doan", position: "FWD" }, { name: "Junya Ito", position: "FWD" }, { name: "Ayase Ueda", position: "FWD" },
  ]},
  "South Korea": { flag: "kr", players: [
    { name: "Kim Seung-gyu", position: "GK" },
    { name: "Kim Min-jae", position: "DEF" }, { name: "Kim Young-gwon", position: "DEF" }, { name: "Lee Yong", position: "DEF" },
    { name: "Jung Woo-young", position: "MID" }, { name: "Hwang In-beom", position: "MID" }, { name: "Lee Kang-in", position: "MID" },
    { name: "Son Heung-min", position: "FWD" }, { name: "Hwang Hee-chan", position: "FWD" }, { name: "Cho Gue-sung", position: "FWD" },
  ]},
  "Colombia": { flag: "co", players: [
    { name: "David Ospina", position: "GK" },
    { name: "Davinson Sánchez", position: "DEF" }, { name: "Juan Cuadrado", position: "DEF" }, { name: "William Tesillo", position: "DEF" },
    { name: "James Rodríguez", position: "MID" }, { name: "Matheus Uribe", position: "MID" }, { name: "Wilmar Barrios", position: "MID" },
    { name: "Luis Díaz", position: "FWD" }, { name: "Jhon Durán", position: "FWD" }, { name: "Rafael Santos Borré", position: "FWD" },
  ]},
  "Uruguay": { flag: "uy", players: [
    { name: "Fernando Muslera", position: "GK" },
    { name: "Ronald Araújo", position: "DEF" }, { name: "José María Giménez", position: "DEF" }, { name: "Martín Cáceres", position: "DEF" },
    { name: "Rodrigo Bentancur", position: "MID" }, { name: "Federico Valverde", position: "MID" }, { name: "Matías Vecino", position: "MID" },
    { name: "Darwin Núñez", position: "FWD" }, { name: "Facundo Torres", position: "FWD" }, { name: "Maxi Gómez", position: "FWD" },
  ]},
  "Croatia": { flag: "hr", players: [
    { name: "Dominik Livaković", position: "GK" },
    { name: "Joško Gvardiol", position: "DEF" }, { name: "Dejan Lovren", position: "DEF" }, { name: "Martin Erlic", position: "DEF" }, { name: "Borna Sosa", position: "DEF" },
    { name: "Luka Modrić", position: "MID" }, { name: "Mateo Kovačić", position: "MID" }, { name: "Marcelo Brozović", position: "MID" },
    { name: "Ivan Perišić", position: "FWD" }, { name: "Andrej Kramarić", position: "FWD" }, { name: "Bruno Petković", position: "FWD" },
  ]},
  "Switzerland": { flag: "ch", players: [
    { name: "Yann Sommer", position: "GK" },
    { name: "Manuel Akanji", position: "DEF" }, { name: "Nico Elvedi", position: "DEF" }, { name: "Silvan Widmer", position: "DEF" },
    { name: "Granit Xhaka", position: "MID" }, { name: "Remo Freuler", position: "MID" }, { name: "Denis Zakaria", position: "MID" },
    { name: "Xherdan Shaqiri", position: "FWD" }, { name: "Breel Embolo", position: "FWD" }, { name: "Ruben Vargas", position: "FWD" },
  ]},
  "Ecuador": { flag: "ec", players: [
    { name: "Hernán Galíndez", position: "GK" },
    { name: "Ángelo Preciado", position: "DEF" }, { name: "Pervis Estupiñán", position: "DEF" }, { name: "Piero Hincapié", position: "DEF" },
    { name: "Moisés Caicedo", position: "MID" }, { name: "Carlos Gruezo", position: "MID" },
    { name: "Enner Valencia", position: "FWD" }, { name: "Gonzalo Plata", position: "FWD" }, { name: "Jeremy Sarmiento", position: "FWD" },
  ]},
  "Australia": { flag: "au", players: [
    { name: "Mat Ryan", position: "GK" },
    { name: "Harry Souttar", position: "DEF" }, { name: "Aziz Behich", position: "DEF" }, { name: "Nathaniel Atkinson", position: "DEF" },
    { name: "Aaron Mooy", position: "MID" }, { name: "Riley McGree", position: "MID" }, { name: "Ajdin Hrustic", position: "MID" },
    { name: "Mathew Leckie", position: "FWD" }, { name: "Mitchell Duke", position: "FWD" }, { name: "Martin Boyle", position: "FWD" },
  ]},
  "Norway": { flag: "no", players: [
    { name: "Ørjan Nyland", position: "GK" },
    { name: "Stefan Strandberg", position: "DEF" }, { name: "Leo Østigård", position: "DEF" }, { name: "Birger Meling", position: "DEF" },
    { name: "Sander Berge", position: "MID" }, { name: "Martin Ødegaard", position: "MID" }, { name: "Mathias Normann", position: "MID" },
    { name: "Erling Haaland", position: "FWD" }, { name: "Alexander Sørloth", position: "FWD" }, { name: "Mohamed Elyounoussi", position: "FWD" },
  ]},
  "Scotland": { flag: "gb-sct", players: [
    { name: "Angus Gunn", position: "GK" },
    { name: "Andrew Robertson", position: "DEF" }, { name: "Kieran Tierney", position: "DEF" }, { name: "Grant Hanley", position: "DEF" },
    { name: "Scott McTominay", position: "MID" }, { name: "Billy Gilmour", position: "MID" }, { name: "Ryan Christie", position: "MID" },
    { name: "Che Adams", position: "FWD" }, { name: "Lyndon Dykes", position: "FWD" }, { name: "Ryan Fraser", position: "FWD" },
  ]},
  "Ghana": { flag: "gh", players: [
    { name: "Richard Ofori", position: "GK" },
    { name: "Daniel Amartey", position: "DEF" }, { name: "Alexander Djiku", position: "DEF" }, { name: "Baba Rahman", position: "DEF" },
    { name: "Thomas Partey", position: "MID" }, { name: "Daniel-Kofi Kyereh", position: "MID" },
    { name: "André Ayew", position: "FWD" }, { name: "Jordan Ayew", position: "FWD" }, { name: "Mohammed Kudus", position: "FWD" },
  ]},
  "Sweden": { flag: "se", players: [
    { name: "Robin Olsen", position: "GK" },
    { name: "Victor Nilsson Lindelöf", position: "DEF" }, { name: "Ludwig Augustinsson", position: "DEF" }, { name: "Mikael Lustig", position: "DEF" },
    { name: "Emil Forsberg", position: "MID" }, { name: "Dejan Kulusevski", position: "MID" }, { name: "Albin Ekdal", position: "MID" },
    { name: "Alexander Isak", position: "FWD" }, { name: "Viktor Gyökeres", position: "FWD" },
  ]},
  "Austria": { flag: "at", players: [
    { name: "Heinz Lindner", position: "GK" },
    { name: "Stefan Posch", position: "DEF" }, { name: "David Alaba", position: "DEF" }, { name: "Philipp Lienhart", position: "DEF" },
    { name: "Marcel Sabitzer", position: "MID" }, { name: "Florian Grillitsch", position: "MID" }, { name: "Christoph Baumgartner", position: "MID" },
    { name: "Marko Arnautovic", position: "FWD" }, { name: "Michael Gregoritsch", position: "FWD" }, { name: "Sasa Kalajdzic", position: "FWD" },
  ]},
  "Canada": { flag: "ca", players: [
    { name: "Milan Borjan", position: "GK" },
    { name: "Richie Laryea", position: "DEF" }, { name: "Steven Vitória", position: "DEF" }, { name: "Alistair Johnston", position: "DEF" },
    { name: "Stephen Eustáquio", position: "MID" }, { name: "Liam Millar", position: "MID" }, { name: "Tajon Buchanan", position: "MID" },
    { name: "Alphonso Davies", position: "FWD" }, { name: "Jonathan David", position: "FWD" }, { name: "Cyle Larin", position: "FWD" },
  ]},
  "Egypt": { flag: "eg", players: [
    { name: "Ahmed El-Shenawy", position: "GK" },
    { name: "Ahmed Hegazi", position: "DEF" }, { name: "Omar Kamal", position: "DEF" }, { name: "Ahmed Fatouh", position: "DEF" },
    { name: "Tarek Hamed", position: "MID" }, { name: "Amr El-Sulaya", position: "MID" },
    { name: "Mohamed Salah", position: "FWD" }, { name: "Trezeguet", position: "FWD" }, { name: "Omar Marmoush", position: "FWD" },
  ]},
  "Algeria": { flag: "dz", players: [
    { name: "Rais M'Bolhi", position: "GK" },
    { name: "Djamel Benlamri", position: "DEF" }, { name: "Youcef Atal", position: "DEF" }, { name: "Aïssa Mandi", position: "DEF" },
    { name: "Said Benrahma", position: "MID" }, { name: "Sofiane Feghouli", position: "MID" }, { name: "Adlène Guedioura", position: "MID" },
    { name: "Riyad Mahrez", position: "FWD" }, { name: "Islam Slimani", position: "FWD" }, { name: "Baghdad Bounedjah", position: "FWD" },
  ]},
  "Ivory Coast": { flag: "ci", players: [
    { name: "Yahia Fofana", position: "GK" },
    { name: "Serge Aurier", position: "DEF" }, { name: "Wilfried Singo", position: "DEF" }, { name: "Odilon Kossounou", position: "DEF" },
    { name: "Franck Kessié", position: "MID" }, { name: "Jean Michaël Seri", position: "MID" }, { name: "Ibrahim Sangaré", position: "MID" },
    { name: "Sébastien Haller", position: "FWD" }, { name: "Nicolas Pépé", position: "FWD" }, { name: "Wilfried Zaha", position: "FWD" }, { name: "Simon Adingra", position: "FWD" },
  ]},
  "Iran": { flag: "ir", players: [
    { name: "Alireza Beiranvand", position: "GK" },
    { name: "Morteza Pouraliganji", position: "DEF" }, { name: "Ehsan Hajsafi", position: "DEF" }, { name: "Milad Mohammadi", position: "DEF" },
    { name: "Ali Karimi", position: "MID" }, { name: "Saeid Ezatolahi", position: "MID" }, { name: "Ahmad Nourollahi", position: "MID" },
    { name: "Mehdi Taremi", position: "FWD" }, { name: "Sardar Azmoun", position: "FWD" }, { name: "Karim Ansarifard", position: "FWD" },
  ]},
  "Saudi Arabia": { flag: "sa", players: [
    { name: "Mohammed Al-Owais", position: "GK" },
    { name: "Saud Abdulhamid", position: "DEF" }, { name: "Ali Al-Bulaihi", position: "DEF" }, { name: "Abdulelah Al-Amri", position: "DEF" },
    { name: "Mohammed Kanno", position: "MID" }, { name: "Salem Al-Dawsari", position: "MID" }, { name: "Sami Al-Najei", position: "MID" },
    { name: "Firas Al-Buraikan", position: "FWD" }, { name: "Saleh Al-Shehri", position: "FWD" }, { name: "Hattan Bahebri", position: "FWD" },
  ]},
  "Qatar": { flag: "qa", players: [
    { name: "Meshaal Barsham", position: "GK" },
    { name: "Pedro Miguel", position: "DEF" }, { name: "Bassam Al-Rawi", position: "DEF" }, { name: "Tarek Salman", position: "DEF" },
    { name: "Karim Boudiaf", position: "MID" }, { name: "Abdulaziz Hatem", position: "MID" },
    { name: "Akram Afif", position: "FWD" }, { name: "Almoez Ali", position: "FWD" }, { name: "Hassan Al-Haydos", position: "FWD" },
  ]},
  "Tunisia": { flag: "tn", players: [
    { name: "Aymen Dahmen", position: "GK" },
    { name: "Ali Maaloul", position: "DEF" }, { name: "Dylan Bronn", position: "DEF" }, { name: "Montassar Talbi", position: "DEF" },
    { name: "Ellyes Skhiri", position: "MID" }, { name: "Anis Slimane", position: "MID" }, { name: "Hannibal Mejbri", position: "MID" },
    { name: "Wahbi Khazri", position: "FWD" }, { name: "Youssef Msakni", position: "FWD" }, { name: "Naïm Sliti", position: "FWD" },
  ]},
  "South Africa": { flag: "za", players: [
    { name: "Ronwen Williams", position: "GK" },
    { name: "Sifiso Hlanti", position: "DEF" }, { name: "Rushine De Reuck", position: "DEF" }, { name: "Thibang Phete", position: "DEF" },
    { name: "Bongani Zungu", position: "MID" }, { name: "Teboho Mokoena", position: "MID" }, { name: "Ethan Nosi", position: "MID" },
    { name: "Percy Tau", position: "FWD" }, { name: "Themba Zwane", position: "FWD" }, { name: "Lyle Foster", position: "FWD" },
  ]},
  "Paraguay": { flag: "py", players: [
    { name: "Antony Silva", position: "GK" },
    { name: "Fabián Balbuena", position: "DEF" }, { name: "Omar Alderete", position: "DEF" }, { name: "Júnior Alonso", position: "DEF" },
    { name: "Miguel Almirón", position: "MID" }, { name: "Mathías Villasanti", position: "MID" },
    { name: "Carlos González", position: "FWD" }, { name: "Ángel Romero", position: "FWD" }, { name: "Julio Enciso", position: "FWD" },
  ]},
  "Bosnia & Herzegovina": { flag: "ba", players: [
    { name: "Ibrahim Šehić", position: "GK" },
    { name: "Sead Kolašinac", position: "DEF" }, { name: "Ermin Bičakčić", position: "DEF" }, { name: "Anel Ahmedhodžić", position: "DEF" },
    { name: "Miralem Pjanić", position: "MID" }, { name: "Armin Hodžić", position: "MID" },
    { name: "Edin Džeko", position: "FWD" }, { name: "Rade Krunić", position: "FWD" }, { name: "Dario Šarić", position: "FWD" },
  ]},
  "Türkiye": { flag: "tr", players: [
    { name: "Uğurcan Çakır", position: "GK" },
    { name: "Zeki Çelik", position: "DEF" }, { name: "Merih Demiral", position: "DEF" }, { name: "Kaan Ayhan", position: "DEF" },
    { name: "Hakan Çalhanoğlu", position: "MID" }, { name: "Salih Özcan", position: "MID" }, { name: "Okay Yokuşlu", position: "MID" },
    { name: "Arda Güler", position: "FWD" }, { name: "Kerem Aktürkoğlu", position: "FWD" }, { name: "Baris Alper Yilmaz", position: "FWD" },
  ]},
  "Serbia": { flag: "rs", players: [
    { name: "Vanja Milinković-Savić", position: "GK" },
    { name: "Strahinja Pavlović", position: "DEF" }, { name: "Nikola Milenković", position: "DEF" }, { name: "Filip Mladenović", position: "DEF" },
    { name: "Sergej Milinković-Savić", position: "MID" }, { name: "Nemanja Gudelj", position: "MID" }, { name: "Filip Kostić", position: "MID" },
    { name: "Aleksandar Mitrović", position: "FWD" }, { name: "Dušan Vlahović", position: "FWD" }, { name: "Dušan Tadić", position: "FWD" },
  ]},
  "Czechia": { flag: "cz", players: [
    { name: "Jiří Pavlenka", position: "GK" },
    { name: "Vladimír Coufal", position: "DEF" }, { name: "Ondřej Duda", position: "DEF" }, { name: "Tomáš Kalas", position: "DEF" },
    { name: "Tomáš Souček", position: "MID" }, { name: "Alex Král", position: "MID" }, { name: "Patrik Schick", position: "MID" },
    { name: "Adam Hložek", position: "FWD" }, { name: "Jan Kuchta", position: "FWD" },
  ]},
  "New Zealand": { flag: "nz", players: [
    { name: "Michael Woud", position: "GK" },
    { name: "Winston Reid", position: "DEF" }, { name: "Michael Boxall", position: "DEF" }, { name: "Liberato Cacace", position: "DEF" },
    { name: "Joe Bell", position: "MID" }, { name: "Elijah Just", position: "MID" },
    { name: "Chris Wood", position: "FWD" }, { name: "Kosta Barbarouses", position: "FWD" }, { name: "Sarpreet Singh", position: "FWD" },
  ]},
  "Iraq": { flag: "iq", players: [
    { name: "Jalal Hassan", position: "GK" },
    { name: "Ali Adnan", position: "DEF" }, { name: "Ahmed Ibrahim", position: "DEF" },
    { name: "Amjed Attwan", position: "MID" }, { name: "Humam Tariq", position: "MID" },
    { name: "Aymen Hussein", position: "FWD" }, { name: "Mohannad Ali", position: "FWD" }, { name: "Ahmed Yasin", position: "FWD" },
  ]},
  "Jordan": { flag: "jo", players: [
    { name: "Yazeed Abo Laila", position: "GK" },
    { name: "Mahmoud Rashid", position: "DEF" }, { name: "Baha Faisal", position: "DEF" },
    { name: "Musa Al-Taamari", position: "MID" }, { name: "Yazan Al-Naimat", position: "MID" },
    { name: "Hamza Al-Dardour", position: "FWD" }, { name: "Moussa Al-Taamari", position: "FWD" },
  ]},
  "Uzbekistan": { flag: "uz", players: [
    { name: "Eldorbek Suyunov", position: "GK" },
    { name: "Otabek Shukurov", position: "DEF" }, { name: "Khojiakbar Alijonov", position: "DEF" },
    { name: "Jaloliddin Masharipov", position: "MID" }, { name: "Otabek Fayzullayev", position: "MID" }, { name: "Abbosbek Fayzullayev", position: "MID" },
    { name: "Eldor Shomurodov", position: "FWD" }, { name: "Jasurbek Yakhshiboev", position: "FWD" },
  ]},
  "DR Congo": { flag: "cd", players: [
    { name: "Lionel Mpasi", position: "GK" },
    { name: "Chancel Mbemba", position: "DEF" }, { name: "Marcel Tisserand", position: "DEF" },
    { name: "Yannick Bolasie", position: "MID" }, { name: "Cédric Bakambu", position: "MID" },
    { name: "Silas Wissa", position: "FWD" }, { name: "Théo Bongonda", position: "FWD" },
  ]},
  "Cape Verde": { flag: "cv", players: [
    { name: "Vozinha", position: "GK" },
    { name: "Roberto Lopes", position: "DEF" }, { name: "Stopira", position: "DEF" },
    { name: "Garry Rodrigues", position: "MID" }, { name: "Ryan Mendes", position: "MID" },
    { name: "Djaniny", position: "FWD" }, { name: "Júnior Alves", position: "FWD" },
  ]},
  "Curaçao": { flag: "cw", players: [
    { name: "Eloy Room", position: "GK" },
    { name: "Cuco Martina", position: "DEF" }, { name: "Perr Schuurs", position: "DEF" },
    { name: "Leandro Bacuna", position: "MID" }, { name: "Rajiv van La Parra", position: "MID" },
    { name: "Quiñcy Promes", position: "FWD" }, { name: "Jurien Timber", position: "FWD" },
  ]},
  "Haiti": { flag: "ht", players: [
    { name: "Josué Duverger", position: "GK" },
    { name: "Andrew Jean-Baptiste", position: "DEF" }, { name: "Mechack Jérôme", position: "DEF" },
    { name: "Duckens Nazon", position: "MID" }, { name: "Frantzdy Pierrot", position: "MID" },
    { name: "Hervé Bazile", position: "FWD" }, { name: "Carnejy Antoine", position: "FWD" },
  ]},
  "Panama": { flag: "pa", players: [
    { name: "Luis Mejía", position: "GK" },
    { name: "Andrés Andrade", position: "DEF" }, { name: "Eric Davis", position: "DEF" }, { name: "Fidel Escobar", position: "DEF" },
    { name: "Adalberto Carrasquilla", position: "MID" }, { name: "Aníbal Godoy", position: "MID" },
    { name: "Rolando Blackburn", position: "FWD" }, { name: "Ismael Díaz", position: "FWD" }, { name: "Cecilio Waterman", position: "FWD" },
  ]},
  "Nigeria": { flag: "ng", players: [
    { name: "Francis Uzoho", position: "GK" },
    { name: "William Troost-Ekong", position: "DEF" }, { name: "Ola Aina", position: "DEF" }, { name: "Semi Ajayi", position: "DEF" },
    { name: "Wilfred Ndidi", position: "MID" }, { name: "Alex Iwobi", position: "MID" },
    { name: "Victor Osimhen", position: "FWD" }, { name: "Kelechi Iheanacho", position: "FWD" }, { name: "Samuel Chukwueze", position: "FWD" }, { name: "Emmanuel Dennis", position: "FWD" },
  ]},
};

// POINTS are defined in types.ts
