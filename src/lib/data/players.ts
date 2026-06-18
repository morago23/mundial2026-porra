// Top players per team for special award predictions
export interface Player {
  name: string;
  teamCode: string;
}

export const PLAYERS: Player[] = [
  // España
  { name: "Lamine Yamal", teamCode: "ESP" },
  { name: "Nico Williams", teamCode: "ESP" },
  { name: "Pau Cubarsí", teamCode: "ESP" },
  { name: "Rodri", teamCode: "ESP" },
  { name: "Dani Olmo", teamCode: "ESP" },
  { name: "Unai Simón", teamCode: "ESP" },

  // Francia
  { name: "Kylian Mbappé", teamCode: "FRA" },
  { name: "Warren Zaïre-Emery", teamCode: "FRA" },
  { name: "Eduardo Camavinga", teamCode: "FRA" },
  { name: "Aurélien Tchouaméni", teamCode: "FRA" },
  { name: "Bradley Barcola", teamCode: "FRA" },
  { name: "Mike Maignan", teamCode: "FRA" },

  // Argentina
  { name: "Lionel Messi", teamCode: "ARG" },
  { name: "Julián Álvarez", teamCode: "ARG" },
  { name: "Alejandro Garnacho", teamCode: "ARG" },
  { name: "Alexis Mac Allister", teamCode: "ARG" },
  { name: "Enzo Fernández", teamCode: "ARG" },
  { name: "Emiliano Martínez", teamCode: "ARG" },

  // Inglaterra
  { name: "Jude Bellingham", teamCode: "ENG" },
  { name: "Cole Palmer", teamCode: "ENG" },
  { name: "Kobbie Mainoo", teamCode: "ENG" },
  { name: "Harry Kane", teamCode: "ENG" },
  { name: "Bukayo Saka", teamCode: "ENG" },
  { name: "Phil Foden", teamCode: "ENG" },

  // Brasil
  { name: "Vinicius Jr.", teamCode: "BRA" },
  { name: "Rodrygo", teamCode: "BRA" },
  { name: "Endrick", teamCode: "BRA" },
  { name: "Raphinha", teamCode: "BRA" },
  { name: "Alisson Becker", teamCode: "BRA" },

  // Alemania
  { name: "Jamal Musiala", teamCode: "GER" },
  { name: "Florian Wirtz", teamCode: "GER" },
  { name: "Leroy Sané", teamCode: "GER" },
  { name: "Kai Havertz", teamCode: "GER" },

  // Portugal
  { name: "Cristiano Ronaldo", teamCode: "POR" },
  { name: "Rafael Leão", teamCode: "POR" },
  { name: "Bruno Fernandes", teamCode: "POR" },
  { name: "Bernardo Silva", teamCode: "POR" },
  { name: "Rúben Dias", teamCode: "POR" },

  // Países Bajos
  { name: "Xavi Simons", teamCode: "NED" },
  { name: "Cody Gakpo", teamCode: "NED" },
  { name: "Virgil van Dijk", teamCode: "NED" },
  { name: "Frenkie de Jong", teamCode: "NED" },

  // Bélgica
  { name: "Kevin De Bruyne", teamCode: "BEL" },
  { name: "Lois Openda", teamCode: "BEL" },
  { name: "Jérémy Doku", teamCode: "BEL" },
  { name: "Thibaut Courtois", teamCode: "BEL" },

  // Noruega
  { name: "Erling Haaland", teamCode: "NOR" },
  { name: "Martin Ødegaard", teamCode: "NOR" },
  { name: "Antonio Nusa", teamCode: "NOR" },

  // Croacia
  { name: "Joško Gvardiol", teamCode: "CRO" },
  { name: "Luka Modrić", teamCode: "CRO" },

  // Uruguay
  { name: "Federico Valverde", teamCode: "URU" },
  { name: "Darwin Núñez", teamCode: "URU" },
  { name: "Ronald Araújo", teamCode: "URU" },

  // Colombia
  { name: "Luis Díaz", teamCode: "COL" },
  { name: "James Rodríguez", teamCode: "COL" },
  { name: "Jhon Durán", teamCode: "COL" },

  // México
  { name: "Santiago Giménez", teamCode: "MEX" },
  { name: "Edson Álvarez", teamCode: "MEX" },

  // EEUU
  { name: "Christian Pulisic", teamCode: "USA" },
  { name: "Gio Reyna", teamCode: "USA" },
  { name: "Folarin Balogun", teamCode: "USA" },

  // Canadá
  { name: "Alphonso Davies", teamCode: "CAN" },
  { name: "Jonathan David", teamCode: "CAN" },

  // Japón
  { name: "Takefusa Kubo", teamCode: "JPN" },
  { name: "Kaoru Mitoma", teamCode: "JPN" },

  // Marruecos
  { name: "Brahim Díaz", teamCode: "MAR" },
  { name: "Achraf Hakimi", teamCode: "MAR" },

  // Turquía
  { name: "Arda Güler", teamCode: "TUR" },
  { name: "Hakan Çalhanoğlu", teamCode: "TUR" },
];

export const PLAYERS_BY_TEAM: Record<string, Player[]> = PLAYERS.reduce(
  (acc, player) => {
    if (!acc[player.teamCode]) acc[player.teamCode] = [];
    acc[player.teamCode].push(player);
    return acc;
  },
  {} as Record<string, Player[]>
);

export function searchPlayers(query: string): Player[] {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase();
  return PLAYERS.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 8);
}
