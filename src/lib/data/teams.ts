export interface Team {
  code: string;
  name: string;
  flag: string;
  value: number;
  group: string;
}

export const TEAMS: Team[] = [
  // Grupo A
  { code: "MEX", name: "México", flag: "🇲🇽", value: 15, group: "A" },
  { code: "RSA", name: "Sudáfrica", flag: "🇿🇦", value: 3.6, group: "A" },
  { code: "KOR", name: "Corea del Sur", flag: "🇰🇷", value: 5.5, group: "A" },
  { code: "CZE", name: "República Checa", flag: "🇨🇿", value: 6.9, group: "A" },

  // Grupo B
  { code: "CAN", name: "Canadá", flag: "🇨🇦", value: 9.5, group: "B" },
  { code: "BIH", name: "Bosnia y Herzegovina", flag: "🇧🇦", value: 6, group: "B" },
  { code: "QAT", name: "Catar", flag: "🇶🇦", value: 2.9, group: "B" },
  { code: "SUI", name: "Suiza", flag: "🇨🇭", value: 10.7, group: "B" },

  // Grupo C
  { code: "BRA", name: "Brasil", flag: "🇧🇷", value: 20, group: "C" },
  { code: "MAR", name: "Marruecos", flag: "🇲🇦", value: 10.3, group: "C" },
  { code: "HAI", name: "Haití", flag: "🇭🇹", value: 1.5, group: "C" },
  { code: "SCO", name: "Escocia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", value: 5, group: "C" },

  // Grupo D
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸", value: 10.8, group: "D" },
  { code: "PAR", name: "Paraguay", flag: "🇵🇾", value: 5.2, group: "D" },
  { code: "AUS", name: "Australia", flag: "🇦🇺", value: 3.8, group: "D" },
  { code: "TUR", name: "Turquía", flag: "🇹🇷", value: 9.1, group: "D" },

  // Grupo E
  { code: "GER", name: "Alemania", flag: "🇩🇪", value: 18.2, group: "E" },
  { code: "CUW", name: "Curazao", flag: "🇨🇼", value: 1.7, group: "E" },
  { code: "CIV", name: "Costa de Marfil", flag: "🇨🇮", value: 4.6, group: "E" },
  { code: "ECU", name: "Ecuador", flag: "🇪🇨", value: 6.5, group: "E" },

  // Grupo F
  { code: "NED", name: "Países Bajos", flag: "🇳🇱", value: 14.6, group: "F" },
  { code: "JPN", name: "Japón", flag: "🇯🇵", value: 6.6, group: "F" },
  { code: "SWE", name: "Suecia", flag: "🇸🇪", value: 6.8, group: "F" },
  { code: "TUN", name: "Túnez", flag: "🇹🇳", value: 3, group: "F" },

  // Grupo G
  { code: "BEL", name: "Bélgica", flag: "🇧🇪", value: 14.8, group: "G" },
  { code: "EGY", name: "Egipto", flag: "🇪🇬", value: 6.4, group: "G" },
  { code: "IRN", name: "Irán", flag: "🇮🇷", value: 4.8, group: "G" },
  { code: "NZL", name: "Nueva Zelanda", flag: "🇳🇿", value: 3.1, group: "G" },

  // Grupo H
  { code: "ESP", name: "España", flag: "🇪🇸", value: 25, group: "H" },
  { code: "CPV", name: "Cabo Verde", flag: "🇨🇻", value: 1.9, group: "H" },
  { code: "KSA", name: "Arabia Saudí", flag: "🇸🇦", value: 3.4, group: "H" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾", value: 7.2, group: "H" },

  // Grupo I
  { code: "FRA", name: "Francia", flag: "🇫🇷", value: 24.5, group: "I" },
  { code: "SEN", name: "Senegal", flag: "🇸🇳", value: 4.9, group: "I" },
  { code: "IRQ", name: "Irak", flag: "🇮🇶", value: 2.4, group: "I" },
  { code: "NOR", name: "Noruega", flag: "🇳🇴", value: 12.5, group: "I" },

  // Grupo J
  { code: "ARG", name: "Argentina", flag: "🇦🇷", value: 21.7, group: "J" },
  { code: "ALG", name: "Argelia", flag: "🇩🇿", value: 5.1, group: "J" },
  { code: "AUT", name: "Austria", flag: "🇦🇹", value: 5.3, group: "J" },
  { code: "JOR", name: "Jordania", flag: "🇯🇴", value: 1.4, group: "J" },

  // Grupo K
  { code: "POR", name: "Portugal", flag: "🇵🇹", value: 17.7, group: "K" },
  { code: "COD", name: "RD del Congo", flag: "🇨🇩", value: 3.7, group: "K" },
  { code: "UZB", name: "Uzbekistán", flag: "🇺🇿", value: 2, group: "K" },
  { code: "COL", name: "Colombia", flag: "🇨🇴", value: 10.1, group: "K" },

  // Grupo L
  { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", value: 22.1, group: "L" },
  { code: "CRO", name: "Croacia", flag: "🇭🇷", value: 8.7, group: "L" },
  { code: "GHA", name: "Ghana", flag: "🇬🇭", value: 4, group: "L" },
  { code: "PAN", name: "Panamá", flag: "🇵🇦", value: 2.3, group: "L" },
];

export const TEAMS_BY_CODE: Record<string, Team> = Object.fromEntries(
  TEAMS.map((t) => [t.code, t])
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
