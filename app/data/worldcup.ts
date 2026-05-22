export const WORLD_CUP_YEAR = 2026;

export const GROUPS: Record<string, { team: string; flag: string }[]> = {
  A: [
    { team: "Mexico", flag: "🇲🇽" },
    { team: "USA", flag: "🇺🇸" },
    { team: "Canada", flag: "🇨🇦" },
    { team: "Morocco", flag: "🇲🇦" },
  ],
  B: [
    { team: "Germany", flag: "🇩🇪" },
    { team: "Japan", flag: "🇯🇵" },
    { team: "Australia", flag: "🇦🇺" },
    { team: "Belgium", flag: "🇧🇪" },
  ],
  C: [
    { team: "Argentina", flag: "🇦🇷" },
    { team: "France", flag: "🇫🇷" },
    { team: "Portugal", flag: "🇵🇹" },
    { team: "Nigeria", flag: "🇳🇬" },
  ],
  D: [
    { team: "Brazil", flag: "🇧🇷" },
    { team: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
    { team: "Netherlands", flag: "🇳🇱" },
    { team: "South Korea", flag: "🇰🇷" },
  ],
  E: [
    { team: "Spain", flag: "🇪🇸" },
    { team: "Italy", flag: "🇮🇹" },
    { team: "Uruguay", flag: "🇺🇾" },
    { team: "Senegal", flag: "🇸🇳" },
  ],
  F: [
    { team: "Colombia", flag: "🇨🇴" },
    { team: "Denmark", flag: "🇩🇰" },
    { team: "Switzerland", flag: "🇨🇭" },
    { team: "Cameroon", flag: "🇨🇲" },
  ],
  G: [
    { team: "Croatia", flag: "🇭🇷" },
    { team: "Ecuador", flag: "🇪🇨" },
    { team: "Ghana", flag: "🇬🇭" },
    { team: "Saudi Arabia", flag: "🇸🇦" },
  ],
  H: [
    { team: "Poland", flag: "🇵🇱" },
    { team: "Serbia", flag: "🇷🇸" },
    { team: "Ivory Coast", flag: "🇨🇮" },
    { team: "Qatar", flag: "🇶🇦" },
  ],
  I: [
    { team: "Turkey", flag: "🇹🇷" },
    { team: "Iran", flag: "🇮🇷" },
    { team: "New Zealand", flag: "🇳🇿" },
    { team: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" },
  ],
  J: [
    { team: "Chile", flag: "🇨🇱" },
    { team: "Algeria", flag: "🇩🇿" },
    { team: "Costa Rica", flag: "🇨🇷" },
    { team: "Oman", flag: "🇴🇲" },
  ],
  K: [
    { team: "Indonesia", flag: "🇮🇩" },
    { team: "Austria", flag: "🇦🇹" },
    { team: "Egypt", flag: "🇪🇬" },
    { team: "Czech Republic", flag: "🇨🇿" },
  ],
  L: [
    { team: "Russia", flag: "🇷🇺" },
    { team: "Romania", flag: "🇷🇴" },
    { team: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" },
    { team: "Tunisia", flag: "🇹🇳" },
  ],
};

export function generateGroupMatches(group: string, teams: { team: string; flag: string }[]) {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({
        id: `${group}-${i}-${j}`,
        home: teams[i],
        away: teams[j],
        round: "group",
        group,
      });
    }
  }
  return matches;
}

export const KNOCKOUT_MATCHES: Record<string, { id: string; label: string; placeholder: string }[]> = {
  r16: [
    { id: "r16-1", label: "Match 1", placeholder: "1A vs 2B" },
    { id: "r16-2", label: "Match 2", placeholder: "1B vs 2A" },
    { id: "r16-3", label: "Match 3", placeholder: "1C vs 2D" },
    { id: "r16-4", label: "Match 4", placeholder: "1D vs 2C" },
    { id: "r16-5", label: "Match 5", placeholder: "1E vs 2F" },
    { id: "r16-6", label: "Match 6", placeholder: "1F vs 2E" },
    { id: "r16-7", label: "Match 7", placeholder: "1G vs 2H" },
    { id: "r16-8", label: "Match 8", placeholder: "1H vs 2G" },
    { id: "r16-9", label: "Match 9", placeholder: "1I vs 2J" },
    { id: "r16-10", label: "Match 10", placeholder: "1J vs 2I" },
    { id: "r16-11", label: "Match 11", placeholder: "1K vs 2L" },
    { id: "r16-12", label: "Match 12", placeholder: "1L vs 2K" },
    { id: "r16-13", label: "Match 13", placeholder: "Best 3rd #1" },
    { id: "r16-14", label: "Match 14", placeholder: "Best 3rd #2" },
    { id: "r16-15", label: "Match 15", placeholder: "Best 3rd #3" },
    { id: "r16-16", label: "Match 16", placeholder: "Best 3rd #4" },
  ],
  qf: [
    { id: "qf-1", label: "QF 1", placeholder: "Winner M1 vs M2" },
    { id: "qf-2", label: "QF 2", placeholder: "Winner M3 vs M4" },
    { id: "qf-3", label: "QF 3", placeholder: "Winner M5 vs M6" },
    { id: "qf-4", label: "QF 4", placeholder: "Winner M7 vs M8" },
    { id: "qf-5", label: "QF 5", placeholder: "Winner M9 vs M10" },
    { id: "qf-6", label: "QF 6", placeholder: "Winner M11 vs M12" },
    { id: "qf-7", label: "QF 7", placeholder: "Winner M13 vs M14" },
    { id: "qf-8", label: "QF 8", placeholder: "Winner M15 vs M16" },
  ],
  sf: [
    { id: "sf-1", label: "SF 1", placeholder: "Winner QF1 vs QF2" },
    { id: "sf-2", label: "SF 2", placeholder: "Winner QF3 vs QF4" },
    { id: "sf-3", label: "SF 3", placeholder: "Winner QF5 vs QF6" },
    { id: "sf-4", label: "SF 4", placeholder: "Winner QF7 vs QF8" },
  ],
  final: [
    { id: "final-1", label: "3rd Place Playoff", placeholder: "SF Losers" },
    { id: "final-2", label: "THE FINAL 🏆", placeholder: "SF Winners" },
  ],
};

export const TOP_PLAYERS = [
  "Kylian Mbappé", "Erling Haaland", "Vinicius Jr", "Jude Bellingham",
  "Lionel Messi", "Cristiano Ronaldo", "Bukayo Saka", "Phil Foden",
  "Pedri", "Lamine Yamal", "Marcus Rashford", "Harry Kane",
  "Romelu Lukaku", "Leroy Sané", "Kaoru Mitoma", "Rodri",
  "Federico Valverde", "Raphinha", "Son Heung-min",
  "Khvicha Kvaratskhelia", "Ferran Torres", "Dani Olmo", "Florian Wirtz",
  "Jamal Musiala", "Antoine Griezmann", "Darwin Núñez", "Victor Osimhen",
  "João Felix", "Rafael Leão", "Diogo Jota", "Bruno Fernandes",
  "Kevin De Bruyne", "Alejandro Garnacho", "Cody Gakpo",
  "Denzel Dumfries", "Richarlison", "Gabriel Jesus",
];

export const POINTS = {
  EXACT_SCORE: 10,
  CORRECT_RESULT: 6,
};
