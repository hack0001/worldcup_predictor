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

// The official FIFA knockout bracket progression
// Maps who feeds into each R32 match, used for auto-populating teams
export const BRACKET_PROGRESSION: Record<string, string> = {
  // R32 feeds into R16
  "r16-90": "r32-73,r32-75",
  "r16-89": "r32-74,r32-77",
  "r16-91": "r32-76,r32-78",
  "r16-92": "r32-79,r32-80",
  "r16-93": "r32-83,r32-84",
  "r16-94": "r32-81,r32-82",
  "r16-95": "r32-86,r32-88",
  "r16-96": "r32-85,r32-87",
  // R16 feeds into QF
  "qf-97": "r16-89,r16-90",
  "qf-98": "r16-93,r16-94",
  "qf-99": "r16-91,r16-92",
  "qf-100": "r16-95,r16-96",
  // QF feeds into SF
  "sf-101": "qf-97,qf-98",
  "sf-102": "qf-99,qf-100",
  // SF feeds into Final
  "final-104": "sf-101,sf-102",
  "3rd-103": "sf-101,sf-102",
};

export const SQUADS: Record<string, { flag: string; players: string[] }> = {
  "England": { flag: "gb-eng", players: ["Jude Bellingham", "Harry Kane", "Bukayo Saka", "Phil Foden", "Marcus Rashford", "Jack Grealish", "Declan Rice", "Jordan Pickford", "Kyle Walker", "John Stones", "Trent Alexander-Arnold", "Conor Gallagher", "Ollie Watkins", "Cole Palmer", "Anthony Gordon"] },
  "France": { flag: "fr", players: ["Kylian Mbappé", "Antoine Griezmann", "Ousmane Dembélé", "Aurélien Tchouaméni", "Adrien Rabiot", "Mike Maignan", "Jules Koundé", "William Saliba", "Eduardo Camavinga", "Marcus Thuram", "Randal Kolo Muani", "Benjamin Pavard"] },
  "Spain": { flag: "es", players: ["Lamine Yamal", "Pedri", "Rodri", "Ferran Torres", "Dani Olmo", "Álvaro Morata", "Unai Simón", "Dani Carvajal", "Pau Cubarsí", "Gavi", "Nico Williams", "Fabián Ruiz", "Alejandro Grimaldo"] },
  "Germany": { flag: "de", players: ["Jamal Musiala", "Florian Wirtz", "Leroy Sané", "Kai Havertz", "Thomas Müller", "Manuel Neuer", "Antonio Rüdiger", "İlkay Gündoğan", "Joshua Kimmich", "Serge Gnabry", "Niclas Füllkrug", "Leon Goretzka"] },
  "Brazil": { flag: "br", players: ["Vinicius Jr", "Raphinha", "Rodrygo", "Richarlison", "Gabriel Jesus", "Lucas Paquetá", "Alisson", "Marquinhos", "Casemiro", "Eder Militão", "Gabriel Martinelli", "Endrick", "Bruno Guimarães"] },
  "Argentina": { flag: "ar", players: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Ángel Di María", "Rodrigo De Paul", "Emiliano Martínez", "Cristian Romero", "Lisandro Martínez", "Alejandro Garnacho", "Enzo Fernández", "Mac Allister", "Paulo Dybala"] },
  "Portugal": { flag: "pt", players: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão", "João Felix", "Bernardo Silva", "Rúben Dias", "Rui Patrício", "Nuno Mendes", "Vitinha", "Pedro Neto", "Gonçalo Ramos", "João Cancelo", "Palhinha"] },
  "Netherlands": { flag: "nl", players: ["Virgil van Dijk", "Cody Gakpo", "Memphis Depay", "Frenkie de Jong", "Matthijs de Ligt", "Jasper Cillessen", "Denzel Dumfries", "Xavi Simons", "Wout Weghorst", "Nathan Aké", "Tijjani Reijnders"] },
  "Belgium": { flag: "be", players: ["Kevin De Bruyne", "Romelu Lukaku", "Thibaut Courtois", "Jeremy Doku", "Arthur Theate", "Leandro Trossard", "Charles De Ketelaere", "Amadou Onana", "Yannick Carrasco"] },
  "Morocco": { flag: "ma", players: ["Achraf Hakimi", "Hakim Ziyech", "Youssef En-Nesyri", "Sofiane Boufal", "Romain Saïss", "Yassine Bounou", "Noussair Mazraoui", "Azzedine Ounahi", "Sofyan Amrabat", "Nayef Aguerd"] },
  "Senegal": { flag: "sn", players: ["Sadio Mané", "Kalidou Koulibaly", "Édouard Mendy", "Ismaïla Sarr", "Boulaye Dia", "Nicolas Jackson", "Pape Gueye", "Famara Diédhiou"] },
  "USA": { flag: "us", players: ["Christian Pulisic", "Weston McKennie", "Tyler Adams", "Gio Reyna", "Sergiño Dest", "Matt Turner", "Tim Weah", "Brenden Aaronson", "Ricardo Pepi", "Yunus Musah", "Antonee Robinson"] },
  "Mexico": { flag: "mx", players: ["Hirving Lozano", "Raúl Jiménez", "Guillermo Ochoa", "Edson Álvarez", "Henry Martín", "Uriel Antuna", "Jorge Sánchez"] },
  "Japan": { flag: "jp", players: ["Kaoru Mitoma", "Takumi Minamino", "Ritsu Doan", "Daichi Kamada", "Hidemasa Morita", "Shuichi Gonda", "Wataru Endo", "Junya Ito", "Ayase Ueda"] },
  "South Korea": { flag: "kr", players: ["Son Heung-min", "Hwang Hee-chan", "Kim Min-jae", "Lee Kang-in", "Hwang In-beom", "Cho Gue-sung", "Na Sang-ho"] },
  "Colombia": { flag: "co", players: ["James Rodríguez", "Luis Díaz", "Juan Cuadrado", "Davinson Sánchez", "David Ospina", "Jhon Durán", "Rafael Santos Borré"] },
  "Uruguay": { flag: "uy", players: ["Darwin Núñez", "Federico Valverde", "José María Giménez", "Fernando Muslera", "Rodrigo Bentancur", "Ronald Araújo", "Facundo Torres"] },
  "Nigeria": { flag: "ng", players: ["Victor Osimhen", "Wilfred Ndidi", "Alex Iwobi", "Kelechi Iheanacho", "Samuel Chukwueze", "Emmanuel Dennis"] },
  "Croatia": { flag: "hr", players: ["Luka Modrić", "Mateo Kovačić", "Marcelo Brozović", "Dominik Livaković", "Joško Gvardiol", "Andrej Kramarić", "Martin Erlic"] },
  "Switzerland": { flag: "ch", players: ["Granit Xhaka", "Xherdan Shaqiri", "Yann Sommer", "Manuel Akanji", "Silvan Widmer", "Ruben Vargas", "Breel Embolo"] },
  "Ecuador": { flag: "ec", players: ["Enner Valencia", "Moisés Caicedo", "Pervis Estupiñán", "Gonzalo Plata", "Ángelo Preciado", "Jeremy Sarmiento"] },
  "Australia": { flag: "au", players: ["Mathew Leckie", "Mitchell Duke", "Aaron Mooy", "Mat Ryan", "Harry Souttar", "Ajdin Hrustic", "Martin Boyle"] },
  "Norway": { flag: "no", players: ["Erling Haaland", "Martin Ødegaard", "Alexander Sørloth", "Ørjan Nyland", "Stefan Strandberg", "Sander Berge"] },
  "Scotland": { flag: "gb-sct", players: ["Andrew Robertson", "Scott McTominay", "Kieran Tierney", "Angus Gunn", "Ryan Christie", "Billy Gilmour", "Che Adams"] },
  "Ghana": { flag: "gh", players: ["Jordan Ayew", "André Ayew", "Thomas Partey", "Richard Ofori", "Daniel-Kofi Kyereh", "Mohammed Kudus"] },
  "Sweden": { flag: "se", players: ["Victor Nilsson Lindelöf", "Alexander Isak", "Emil Forsberg", "Robin Olsen", "Dejan Kulusevski", "Viktor Gyökeres"] },
  "Turkey": { flag: "tr", players: ["Hakan Çalhanoğlu", "Arda Güler", "Burak Yılmaz", "Uğurcan Çakır", "Merih Demiral", "Kerem Aktürkoğlu", "Zeki Çelik"] },
  "Austria": { flag: "at", players: ["Marcel Sabitzer", "David Alaba", "Marko Arnautovic", "Heinz Lindner", "Stefan Posch", "Christoph Baumgartner"] },
  "Iran": { flag: "ir", players: ["Sardar Azmoun", "Mehdi Taremi", "Alireza Beiranvand", "Morteza Pouraliganji", "Ali Karimi", "Karim Ansarifard"] },
  "Egypt": { flag: "eg", players: ["Mohamed Salah", "Ahmed El-Shenawy", "Ahmed Hegazi", "Trezeguet", "Amr El-Sulaya", "Omar Marmoush"] },
  "Algeria": { flag: "dz", players: ["Riyad Mahrez", "Islam Slimani", "Youcef Atal", "Rais M'Bolhi", "Djamel Benlamri", "Said Benrahma"] },
  "Canada": { flag: "ca", players: ["Alphonso Davies", "Jonathan David", "Cyle Larin", "Milan Borjan", "Stephen Eustáquio", "Tajon Buchanan"] },
  "Portugal (squad)": { flag: "pt", players: [] },
};

export const POINTS = {
  EXACT_SCORE: 10,
  CORRECT_RESULT: 6,
};
