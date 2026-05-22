export const WORLD_CUP_YEAR = 2026;

export const GROUPS: Record<string, { team: string; flag: string }[]> = {
  A: [{ team: "Mexico", flag: "🇲🇽" }, { team: "USA", flag: "🇺🇸" }, { team: "Canada", flag: "🇨🇦" }, { team: "Morocco", flag: "🇲🇦" }],
  B: [{ team: "Germany", flag: "🇩🇪" }, { team: "Japan", flag: "🇯🇵" }, { team: "Australia", flag: "🇦🇺" }, { team: "Belgium", flag: "🇧🇪" }],
  C: [{ team: "Argentina", flag: "🇦🇷" }, { team: "France", flag: "🇫🇷" }, { team: "Portugal", flag: "🇵🇹" }, { team: "Nigeria", flag: "🇳🇬" }],
  D: [{ team: "Brazil", flag: "🇧🇷" }, { team: "England", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" }, { team: "Netherlands", flag: "🇳🇱" }, { team: "South Korea", flag: "🇰🇷" }],
  E: [{ team: "Spain", flag: "🇪🇸" }, { team: "Italy", flag: "🇮🇹" }, { team: "Uruguay", flag: "🇺🇾" }, { team: "Senegal", flag: "🇸🇳" }],
  F: [{ team: "Colombia", flag: "🇨🇴" }, { team: "Denmark", flag: "🇩🇰" }, { team: "Switzerland", flag: "🇨🇭" }, { team: "Cameroon", flag: "🇨🇲" }],
  G: [{ team: "Croatia", flag: "🇭🇷" }, { team: "Ecuador", flag: "🇪🇨" }, { team: "Ghana", flag: "🇬🇭" }, { team: "Saudi Arabia", flag: "🇸🇦" }],
  H: [{ team: "Poland", flag: "🇵🇱" }, { team: "Serbia", flag: "🇷🇸" }, { team: "Ivory Coast", flag: "🇨🇮" }, { team: "Qatar", flag: "🇶🇦" }],
  I: [{ team: "Turkey", flag: "🇹🇷" }, { team: "Iran", flag: "🇮🇷" }, { team: "New Zealand", flag: "🇳🇿" }, { team: "Wales", flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿" }],
  J: [{ team: "Chile", flag: "🇨🇱" }, { team: "Algeria", flag: "🇩🇿" }, { team: "Costa Rica", flag: "🇨🇷" }, { team: "Oman", flag: "🇴🇲" }],
  K: [{ team: "Indonesia", flag: "🇮🇩" }, { team: "Austria", flag: "🇦🇹" }, { team: "Egypt", flag: "🇪🇬" }, { team: "Czech Republic", flag: "🇨🇿" }],
  L: [{ team: "Russia", flag: "🇷🇺" }, { team: "Romania", flag: "🇷🇴" }, { team: "Scotland", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿" }, { team: "Tunisia", flag: "🇹🇳" }],
};

export function generateGroupMatches(group: string, teams: { team: string; flag: string }[]) {
  const matches = [];
  for (let i = 0; i < teams.length; i++) {
    for (let j = i + 1; j < teams.length; j++) {
      matches.push({ id: `${group}-${i}-${j}`, home: teams[i], away: teams[j], round: "group", group });
    }
  }
  return matches;
}

export const KNOCKOUT_MATCHES: Record<string, { id: string; label: string; placeholder: string }[]> = {
  r16: [
    { id: "r16-1", label: "Match 1", placeholder: "1A vs 2B" }, { id: "r16-2", label: "Match 2", placeholder: "1B vs 2A" },
    { id: "r16-3", label: "Match 3", placeholder: "1C vs 2D" }, { id: "r16-4", label: "Match 4", placeholder: "1D vs 2C" },
    { id: "r16-5", label: "Match 5", placeholder: "1E vs 2F" }, { id: "r16-6", label: "Match 6", placeholder: "1F vs 2E" },
    { id: "r16-7", label: "Match 7", placeholder: "1G vs 2H" }, { id: "r16-8", label: "Match 8", placeholder: "1H vs 2G" },
    { id: "r16-9", label: "Match 9", placeholder: "1I vs 2J" }, { id: "r16-10", label: "Match 10", placeholder: "1J vs 2I" },
    { id: "r16-11", label: "Match 11", placeholder: "1K vs 2L" }, { id: "r16-12", label: "Match 12", placeholder: "1L vs 2K" },
    { id: "r16-13", label: "Match 13", placeholder: "Best 3rd #1" }, { id: "r16-14", label: "Match 14", placeholder: "Best 3rd #2" },
    { id: "r16-15", label: "Match 15", placeholder: "Best 3rd #3" }, { id: "r16-16", label: "Match 16", placeholder: "Best 3rd #4" },
  ],
  qf: [
    { id: "qf-1", label: "QF 1", placeholder: "Winner M1 vs M2" }, { id: "qf-2", label: "QF 2", placeholder: "Winner M3 vs M4" },
    { id: "qf-3", label: "QF 3", placeholder: "Winner M5 vs M6" }, { id: "qf-4", label: "QF 4", placeholder: "Winner M7 vs M8" },
    { id: "qf-5", label: "QF 5", placeholder: "Winner M9 vs M10" }, { id: "qf-6", label: "QF 6", placeholder: "Winner M11 vs M12" },
    { id: "qf-7", label: "QF 7", placeholder: "Winner M13 vs M14" }, { id: "qf-8", label: "QF 8", placeholder: "Winner M15 vs M16" },
  ],
  sf: [
    { id: "sf-1", label: "SF 1", placeholder: "Winner QF1 vs QF2" }, { id: "sf-2", label: "SF 2", placeholder: "Winner QF3 vs QF4" },
    { id: "sf-3", label: "SF 3", placeholder: "Winner QF5 vs QF6" }, { id: "sf-4", label: "SF 4", placeholder: "Winner QF7 vs QF8" },
  ],
  final: [
    { id: "final-1", label: "3rd Place Playoff", placeholder: "SF Losers" },
    { id: "final-2", label: "THE FINAL 🏆", placeholder: "SF Winners" },
  ],
};

// Players grouped by country — update as squads announced
export const SQUADS: Record<string, { flag: string; players: string[] }> = {
  "England": {
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    players: ["Jude Bellingham", "Harry Kane", "Bukayo Saka", "Phil Foden", "Marcus Rashford", "Jack Grealish", "Declan Rice", "Jordan Pickford", "Kyle Walker", "John Stones", "Trent Alexander-Arnold", "Conor Gallagher", "Ollie Watkins", "Cole Palmer", "Anthony Gordon"],
  },
  "France": {
    flag: "🇫🇷",
    players: ["Kylian Mbappé", "Antoine Griezmann", "Olivier Giroud", "Ousmane Dembélé", "Aurélien Tchouaméni", "Adrien Rabiot", "Mike Maignan", "Jules Koundé", "Raphaël Varane", "William Saliba", "Eduardo Camavinga", "Marcus Thuram", "Randal Kolo Muani", "Benjamin Pavard"],
  },
  "Spain": {
    flag: "🇪🇸",
    players: ["Lamine Yamal", "Pedri", "Rodri", "Ferran Torres", "Dani Olmo", "Álvaro Morata", "Unai Simón", "Dani Carvajal", "Aymeric Laporte", "Pau Cubarsí", "Gavi", "Nico Williams", "Fabián Ruiz", "Alejandro Grimaldo"],
  },
  "Germany": {
    flag: "🇩🇪",
    players: ["Jamal Musiala", "Florian Wirtz", "Leroy Sané", "Kai Havertz", "Thomas Müller", "Toni Kroos", "Manuel Neuer", "Antonio Rüdiger", "İlkay Gündoğan", "Joshua Kimmich", "Serge Gnabry", "Niclas Füllkrug", "Leon Goretzka", "David Raum"],
  },
  "Brazil": {
    flag: "🇧🇷",
    players: ["Vinicius Jr", "Raphinha", "Rodrygo", "Richarlison", "Gabriel Jesus", "Lucas Paquetá", "Alisson", "Marquinhos", "Casemiro", "Eder Militão", "Gabriel Martinelli", "Endrick", "Bruno Guimarães", "Danilo"],
  },
  "Argentina": {
    flag: "🇦🇷",
    players: ["Lionel Messi", "Julián Álvarez", "Lautaro Martínez", "Ángel Di María", "Rodrigo De Paul", "Emiliano Martínez", "Cristian Romero", "Lisandro Martínez", "Alejandro Garnacho", "Enzo Fernández", "Mac Allister", "Nicolás González", "Paulo Dybala", "Leandro Paredes"],
  },
  "Portugal": {
    flag: "🇵🇹",
    players: ["Cristiano Ronaldo", "Bruno Fernandes", "Rafael Leão", "João Felix", "Bernardo Silva", "Rúben Dias", "Rui Patrício", "Nuno Mendes", "Vitinha", "Otávio", "Pedro Neto", "Gonçalo Ramos", "João Cancelo", "Palhinha"],
  },
  "Netherlands": {
    flag: "🇳🇱",
    players: ["Virgil van Dijk", "Cody Gakpo", "Memphis Depay", "Frenkie de Jong", "Georginio Wijnaldum", "Matthijs de Ligt", "Jasper Cillessen", "Denzel Dumfries", "Davy Klaassen", "Steven Bergwijn", "Xavi Simons", "Wout Weghorst", "Nathan Aké", "Tijjani Reijnders"],
  },
  "Belgium": {
    flag: "🇧🇪",
    players: ["Kevin De Bruyne", "Romelu Lukaku", "Eden Hazard", "Thibaut Courtois", "Jan Vertonghen", "Toby Alderweireld", "Axel Witsel", "Yannick Carrasco", "Dries Mertens", "Jeremy Doku", "Arthur Theate", "Leandro Trossard", "Charles De Ketelaere", "Amadou Onana"],
  },
  "Italy": {
    flag: "🇮🇹",
    players: ["Federico Chiesa", "Ciro Immobile", "Marco Verratti", "Gianluigi Donnarumma", "Giorgio Chiellini", "Leonardo Bonucci", "Nicolo Barella", "Lorenzo Insigne", "Jorginho", "Giovanni Di Lorenzo", "Sandro Tonali", "Gianluca Scamacca", "Mateo Retegui", "Davide Frattesi"],
  },
  "Croatia": {
    flag: "🇭🇷",
    players: ["Luka Modrić", "Ivan Perišić", "Mateo Kovačić", "Marcelo Brozović", "Dominik Livaković", "Dejan Lovren", "Joško Gvardiol", "Mario Pašalić", "Ante Rebić", "Bruno Petković", "Andrej Kramarić", "Martin Erlic", "Borna Sosa"],
  },
  "Morocco": {
    flag: "🇲🇦",
    players: ["Achraf Hakimi", "Hakim Ziyech", "Youssef En-Nesyri", "Sofiane Boufal", "Romain Saïss", "Yassine Bounou", "Noussair Mazraoui", "Selim Amallah", "Azzedine Ounahi", "Abdelhamid Sabiri", "Sofyan Amrabat", "Nayef Aguerd"],
  },
  "Senegal": {
    flag: "🇸🇳",
    players: ["Sadio Mané", "Kalidou Koulibaly", "Édouard Mendy", "Ismaïla Sarr", "Gana Gueye", "Cheikhou Kouyaté", "Boulaye Dia", "Nampalys Mendy", "Pape Gueye", "Bamba Dieng", "Nicolas Jackson"],
  },
  "USA": {
    flag: "🇺🇸",
    players: ["Christian Pulisic", "Weston McKennie", "Tyler Adams", "Gio Reyna", "Sergiño Dest", "Matt Turner", "Tim Weah", "Brenden Aaronson", "Josh Sargent", "Ricardo Pepi", "Yunus Musah", "Antonee Robinson"],
  },
  "Mexico": {
    flag: "🇲🇽",
    players: ["Hirving Lozano", "Raúl Jiménez", "Héctor Herrera", "Guillermo Ochoa", "Carlos Vela", "Andres Guardado", "Jesús Corona", "Chucky Lozano", "Edson Álvarez", "Uriel Antuna", "Henry Martín"],
  },
  "Japan": {
    flag: "🇯🇵",
    players: ["Kaoru Mitoma", "Takumi Minamino", "Ritsu Doan", "Daichi Kamada", "Hidemasa Morita", "Shuichi Gonda", "Maya Yoshida", "Wataru Endo", "Junya Ito", "Ayase Ueda", "Ko Itakura"],
  },
  "South Korea": {
    flag: "🇰🇷",
    players: ["Son Heung-min", "Hwang Hee-chan", "Kim Min-jae", "Lee Kang-in", "Hwang In-beom", "Kim Seung-gyu", "Cho Gue-sung", "Na Sang-ho", "Jung Woo-young", "Kwon Chang-hoon"],
  },
  "Colombia": {
    flag: "🇨🇴",
    players: ["James Rodríguez", "Radamel Falcao", "Luis Díaz", "Juan Cuadrado", "Davinson Sánchez", "David Ospina", "Yerry Mina", "Matheus Uribe", "Rafael Santos Borré", "Jhon Durán"],
  },
  "Uruguay": {
    flag: "🇺🇾",
    players: ["Luis Suárez", "Edinson Cavani", "Darwin Núñez", "Federico Valverde", "José María Giménez", "Fernando Muslera", "Rodrigo Bentancur", "Ronald Araújo", "Matías Vecino", "Facundo Torres"],
  },
  "Nigeria": {
    flag: "🇳🇬",
    players: ["Victor Osimhen", "Wilfred Ndidi", "Alex Iwobi", "Kelechi Iheanacho", "Ahmed Musa", "William Troost-Ekong", "Taiwo Awoniyi", "Joe Aribo", "Samuel Chukwueze", "Emmanuel Dennis"],
  },
};

export const POINTS = {
  EXACT_SCORE: 10,
  CORRECT_RESULT: 6,
};
