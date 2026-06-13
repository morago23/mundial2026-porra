export interface Team {
  code: string;
  name: string;
  flag: string;
  value: number;
  group: string;
  apiName: string; // Name as returned by Zafronix API
}

export const TEAMS: Team[] = [
  // Grupo A
  { code: "MEX", name: "México",           flag: "🇲🇽", value: 15,   group: "A", apiName: "Mexico" },
  { code: "RSA", name: "Sudáfrica",         flag: "🇿🇦", value: 3.6,  group: "A", apiName: "South Africa" },
  { code: "KOR", name: "Corea del Sur",     flag: "🇰🇷", value: 5.5,  group: "A", apiName: "Korea Republic" },
  { code: "CZE", name: "República Checa",   flag: "🇨🇿", value: 6.9,  group: "A", apiName: "Czechia" },

  // Grupo B
  { code: "CAN", name: "Canadá",            flag: "🇨🇦", value: 9.5,  group: "B", apiName: "Canada" },
  { code: "BIH", name: "Bosnia y Herzegovina", flag: "🇧🇦", value: 6, group: "B", apiName: "Bosnia and Herzegovina" },
  { code: "QAT", name: "Catar",             flag: "🇶🇦", value: 2.9,  group: "B", apiName: "Qatar" },
  { code: "SUI", name: "Suiza",             flag: "🇨🇭", value: 10.7, group: "B", apiName: "Switzerland" },

  // Grupo C
  { code: "BRA", name: "Brasil",            flag: "🇧🇷", value: 20,   group: "C", apiName: "Brazil" },
  { code: "MAR", name: "Marruecos",         flag: "🇲🇦", value: 10.3, group: "C", apiName: "Morocco" },
  { code: "HAI", name: "Haití",             flag: "🇭🇹", value: 1.5,  group: "C", apiName: "Haiti" },
  { code: "SCO", name: "Escocia",           flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", value: 5,    group: "C", apiName: "Scotland" },

  // Grupo D
  { code: "USA", name: "Estados Unidos",    flag: "🇺🇸", value: 10.8, group: "D", apiName: "USA" },
  { code: "PAR", name: "Paraguay",          flag: "🇵🇾", value: 5.2,  group: "D", apiName: "Paraguay" },
  { code: "AUS", name: "Australia",         flag: "🇦🇺", value: 3.8,  group: "D", apiName: "Australia" },
  { code: "TUR", name: "Turquía",           flag: "🇹🇷", value: 9.1,  group: "D", apiName: "Turkey" },

  // Grupo E
  { code: "GER", name: "Alemania",          flag: "🇩🇪", value: 18.2, group: "E", apiName: "Germany" },
  { code: "CUW", name: "Curazao",           flag: "🇨🇼", value: 1.7,  group: "E", apiName: "Curacao" },
  { code: "CIV", name: "Costa de Marfil",   flag: "🇨🇮", value: 4.6,  group: "E", apiName: "Ivory Coast" },
  { code: "ECU", name: "Ecuador",           flag: "🇪🇨", value: 6.5,  group: "E", apiName: "Ecuador" },

  // Grupo F
  { code: "NED", name: "Países Bajos",      flag: "🇳🇱", value: 14.6, group: "F", apiName: "Netherlands" },
  { code: "JPN", name: "Japón",             flag: "🇯🇵", value: 6.6,  group: "F", apiName: "Japan" },
  { code: "SWE", name: "Suecia",            flag: "🇸🇪", value: 6.8,  group: "F", apiName: "Sweden" },
  { code: "TUN", name: "Túnez",             flag: "🇹🇳", value: 3,    group: "F", apiName: "Tunisia" },

  // Grupo G
  { code: "BEL", name: "Bélgica",           flag: "🇧🇪", value: 14.8, group: "G", apiName: "Belgium" },
  { code: "EGY", name: "Egipto",            flag: "🇪🇬", value: 6.4,  group: "G", apiName: "Egypt" },
  { code: "IRN", name: "Irán",              flag: "🇮🇷", value: 4.8,  group: "G", apiName: "Iran" },
  { code: "NZL", name: "Nueva Zelanda",     flag: "🇳🇿", value: 3.1,  group: "G", apiName: "New Zealand" },

  // Grupo H
  { code: "ESP", name: "España",            flag: "🇪🇸", value: 25,   group: "H", apiName: "Spain" },
  { code: "CPV", name: "Cabo Verde",        flag: "🇨🇻", value: 1.9,  group: "H", apiName: "Cape Verde" },
  { code: "KSA", name: "Arabia Saudí",      flag: "🇸🇦", value: 3.4,  group: "H", apiName: "Saudi Arabia" },
  { code: "URU", name: "Uruguay",           flag: "🇺🇾", value: 7.2,  group: "H", apiName: "Uruguay" },

  // Grupo I
  { code: "FRA", name: "Francia",           flag: "🇫🇷", value: 24.5, group: "I", apiName: "France" },
  { code: "SEN", name: "Senegal",           flag: "🇸🇳", value: 4.9,  group: "I", apiName: "Senegal" },
  { code: "IRQ", name: "Irak",              flag: "🇮🇶", value: 2.4,  group: "I", apiName: "Iraq" },
  { code: "NOR", name: "Noruega",           flag: "🇳🇴", value: 12.5, group: "I", apiName: "Norway" },

  // Grupo J
  { code: "ARG", name: "Argentina",         flag: "🇦🇷", value: 21.7, group: "J", apiName: "Argentina" },
  { code: "ALG", name: "Argelia",           flag: "🇩🇿", value: 5.1,  group: "J", apiName: "Algeria" },
  { code: "AUT", name: "Austria",           flag: "🇦🇹", value: 5.3,  group: "J", apiName: "Austria" },
  { code: "JOR", name: "Jordania",          flag: "🇯🇴", value: 1.4,  group: "J", apiName: "Jordan" },

  // Grupo K
  { code: "POR", name: "Portugal",          flag: "🇵🇹", value: 17.7, group: "K", apiName: "Portugal" },
  { code: "COD", name: "RD del Congo",      flag: "🇨🇩", value: 3.7,  group: "K", apiName: "DR Congo" },
  { code: "UZB", name: "Uzbekistán",        flag: "🇺🇿", value: 2,    group: "K", apiName: "Uzbekistan" },
  { code: "COL", name: "Colombia",          flag: "🇨🇴", value: 10.1, group: "K", apiName: "Colombia" },

  // Grupo L
  { code: "ENG", name: "Inglaterra",        flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", value: 22.1, group: "L", apiName: "England" },
  { code: "CRO", name: "Croacia",           flag: "🇭🇷", value: 8.7,  group: "L", apiName: "Croatia" },
  { code: "GHA", name: "Ghana",             flag: "🇬🇭", value: 4,    group: "L", apiName: "Ghana" },
  { code: "PAN", name: "Panamá",            flag: "🇵🇦", value: 2.3,  group: "L", apiName: "Panama" },
];

export const TEAMS_BY_CODE: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t])
);

// Map from Zafronix API name → internal code
export const API_NAME_TO_CODE: Record<string, string> = Object.fromEntries(
  TEAMS.map((t) => [t.apiName.toLowerCase(), t.code])
);

export const GROUPS = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L"];

export const MAX_BUDGET = 115;
export const MAX_TEAMS = 10;

export function getTeamsByGroup(group: string): Team[] {
  return TEAMS.filter((t) => t.group === group);
}

export function calcTotalValue(codes: string[]): number {
  return codes.reduce((sum, code) => {
    const team = TEAMS_BY_CODE[code];
    return sum + (team ? team.value : 0);
  }, 0);
}

/** Resolve an API team name (could be apiName or already a code) to an internal code */
export function resolveTeamCode(apiNameOrCode: string): string {
  if (!apiNameOrCode) return apiNameOrCode;
  // Already a known code?
  if (TEAMS_BY_CODE[apiNameOrCode]) return apiNameOrCode;
  // Try lookup by apiName (case-insensitive)
  return API_NAME_TO_CODE[apiNameOrCode.toLowerCase()] ?? apiNameOrCode;
}
