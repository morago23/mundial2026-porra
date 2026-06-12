// Top players per team for special award predictions
export interface Player {
  name: string;
  teamCode: string;
}

export const PLAYERS: Player[] = [
  // España
  { name: "Pedri", teamCode: "ESP" },
  { name: "Lamine Yamal", teamCode: "ESP" },
  { name: "Álvaro Morata", teamCode: "ESP" },
  { name: "Rodri", teamCode: "ESP" },
  { name: "Dani Olmo", teamCode: "ESP" },
  { name: "Mikel Oyarzabal", teamCode: "ESP" },
  { name: "Unai Simón", teamCode: "ESP" },

  // Francia
  { name: "Kylian Mbappé", teamCode: "FRA" },
  { name: "Antoine Griezmann", teamCode: "FRA" },
  { name: "Ousmane Dembélé", teamCode: "FRA" },
  { name: "Eduardo Camavinga", teamCode: "FRA" },
  { name: "Aurélien Tchouaméni", teamCode: "FRA" },
  { name: "Mike Maignan", teamCode: "FRA" },

  // Argentina
  { name: "Lionel Messi", teamCode: "ARG" },
  { name: "Julián Álvarez", teamCode: "ARG" },
  { name: "Rodrigo De Paul", teamCode: "ARG" },
  { name: "Alexis Mac Allister", teamCode: "ARG" },
  { name: "Enzo Fernández", teamCode: "ARG" },
  { name: "Emiliano Martínez", teamCode: "ARG" },

  // Inglaterra
  { name: "Jude Bellingham", teamCode: "ENG" },
  { name: "Harry Kane", teamCode: "ENG" },
  { name: "Bukayo Saka", teamCode: "ENG" },
  { name: "Phil Foden", teamCode: "ENG" },
  { name: "Jordan Pickford", teamCode: "ENG" },
  { name: "Marcus Rashford", teamCode: "ENG" },

  // Brasil
  { name: "Vinicius Jr.", teamCode: "BRA" },
  { name: "Rodrygo", teamCode: "BRA" },
  { name: "Raphinha", teamCode: "BRA" },
  { name: "Endrick", teamCode: "BRA" },
  { name: "Alisson Becker", teamCode: "BRA" },
  { name: "Casemiro", teamCode: "BRA" },

  // Alemania
  { name: "Jamal Musiala", teamCode: "GER" },
  { name: "Florian Wirtz", teamCode: "GER" },
  { name: "Leroy Sané", teamCode: "GER" },
  { name: "Kai Havertz", teamCode: "GER" },
  { name: "Manuel Neuer", teamCode: "GER" },
  { name: "Thomas Müller", teamCode: "GER" },

  // Portugal
  { name: "Cristiano Ronaldo", teamCode: "POR" },
  { name: "Bruno Fernandes", teamCode: "POR" },
  { name: "Bernardo Silva", teamCode: "POR" },
  { name: "João Félix", teamCode: "POR" },
  { name: "Rafael Leão", teamCode: "POR" },
  { name: "Rúben Dias", teamCode: "POR" },

  // Países Bajos
  { name: "Virgil van Dijk", teamCode: "NED" },
  { name: "Memphis Depay", teamCode: "NED" },
  { name: "Frenkie de Jong", teamCode: "NED" },
  { name: "Xavi Simons", teamCode: "NED" },
  { name: "Cody Gakpo", teamCode: "NED" },

  // Bélgica
  { name: "Romelu Lukaku", teamCode: "BEL" },
  { name: "Kevin De Bruyne", teamCode: "BEL" },
  { name: "Yannick Carrasco", teamCode: "BEL" },
  { name: "Lois Openda", teamCode: "BEL" },
  { name: "Thibaut Courtois", teamCode: "BEL" },

  // Noruega
  { name: "Erling Haaland", teamCode: "NOR" },
  { name: "Martin Ødegaard", teamCode: "NOR" },
  { name: "Alexander Sørloth", teamCode: "NOR" },

  // Croacia
  { name: "Luka Modrić", teamCode: "CRO" },
  { name: "Ivan Perišić", teamCode: "CRO" },
  { name: "Andrej Kramarić", teamCode: "CRO" },
  { name: "Dominik Livaković", teamCode: "CRO" },

  // Uruguay
  { name: "Federico Valverde", teamCode: "URU" },
  { name: "Darwin Núñez", teamCode: "URU" },
  { name: "Luis Suárez", teamCode: "URU" },
  { name: "Ronald Araújo", teamCode: "URU" },

  // Colombia
  { name: "James Rodríguez", teamCode: "COL" },
  { name: "Luis Díaz", teamCode: "COL" },
  { name: "Falcao", teamCode: "COL" },
  { name: "Jhon Córdoba", teamCode: "COL" },

  // México
  { name: "Hirving Lozano", teamCode: "MEX" },
  { name: "Raúl Jiménez", teamCode: "MEX" },
  { name: "Carlos Vela", teamCode: "MEX" },
  { name: "Guillermo Ochoa", teamCode: "MEX" },

  // EEUU
  { name: "Christian Pulisic", teamCode: "USA" },
  { name: "Tyler Adams", teamCode: "USA" },
  { name: "Gio Reyna", teamCode: "USA" },
  { name: "Weston McKennie", teamCode: "USA" },
  { name: "Matt Turner", teamCode: "USA" },

  // Canadá
  { name: "Alphonso Davies", teamCode: "CAN" },
  { name: "Jonathan David", teamCode: "CAN" },
  { name: "Cyle Larin", teamCode: "CAN" },

  // Japón
  { name: "Takumi Minamino", teamCode: "JPN" },
  { name: "Kaoru Mitoma", teamCode: "JPN" },
  { name: "Daichi Kamada", teamCode: "JPN" },

  // Marruecos
  { name: "Hakim Ziyech", teamCode: "MAR" },
  { name: "Achraf Hakimi", teamCode: "MAR" },
  { name: "Youssef En-Nesyri", teamCode: "MAR" },
  { name: "Sofyan Amrabat", teamCode: "MAR" },

  // Senegal
  { name: "Sadio Mané", teamCode: "SEN" },
  { name: "Édouard Mendy", teamCode: "SEN" },
  { name: "Ismaïla Sarr", teamCode: "SEN" },

  // Suiza
  { name: "Granit Xhaka", teamCode: "SUI" },
  { name: "Xherdan Shaqiri", teamCode: "SUI" },
  { name: "Breel Embolo", teamCode: "SUI" },
  { name: "Yann Sommer", teamCode: "SUI" },

  // Turquía
  { name: "Hakan Çalhanoğlu", teamCode: "TUR" },
  { name: "Arda Güler", teamCode: "TUR" },
  { name: "Burak Yılmaz", teamCode: "TUR" },

  // Austria
  { name: "Marcel Sabitzer", teamCode: "AUT" },
  { name: "David Alaba", teamCode: "AUT" },
  { name: "Marko Arnautović", teamCode: "AUT" },

  // Ecuador
  { name: "Moisés Caicedo", teamCode: "ECU" },
  { name: "Enner Valencia", teamCode: "ECU" },
  { name: "Piero Hincapié", teamCode: "ECU" },

  // Ghana
  { name: "Jordan Ayew", teamCode: "GHA" },
  { name: "André Ayew", teamCode: "GHA" },
  { name: "Thomas Partey", teamCode: "GHA" },
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
