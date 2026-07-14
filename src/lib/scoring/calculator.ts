import { TEAMS_BY_CODE } from "@/lib/data/teams";

export interface MatchResult {
  id?: string;
  homeTeam: string; // team code
  awayTeam: string;
  homeScore: number | null;
  awayScore: number | null;
  status: "SCHEDULED" | "LIVE" | "FINISHED";
  stage: "GROUP" | "R32" | "R16" | "QF" | "SF" | "THIRD" | "FINAL";
  group?: string;
  penaltyWinner?: string; // team code of penalty shootout winner
}

export interface GroupStanding {
  teamCode: string;
  position: number; // 1, 2, 3, 4
  advancesToKnockout: boolean;
  isThirdAdvancing: boolean; // for 3rd-place best teams
}

export interface SpecialAwards {
  mvp: string; // exact player name
  pichichi: string;
  guanteOro: string;
  mejorJoven: string;
}

export interface Bet {
  teams: string[]; // 10 team codes
  mvp: string;
  pichichi: string;
  guanteOro: string;
  mejorJoven: string;
}

export interface ScoreBreakdown {
  matchPoints: number; // wins + draws in groups
  positionPoints: number; // 1st/2nd/3rd group bonuses
  knockoutPoints: number; // R16, QF, SF, Final
  specialPoints: number; // MVP, Pichichi, etc.
  predictionPoints: number; // Quiniela points
  total: number;
  detail: string[];
}

// Points constants
const PTS = {
  WIN: 3,
  DRAW: 1,
  FIRST: 2,
  SECOND: 1,
  THIRD_ADV: 0.5,
  R32: 2,
  R16: 3,
  QF: 5,
  SF: 8,
  FINAL: 10,
  CHAMPION: 12,
  THIRD_PLACE: 3,
  SPECIAL: 5,
  PREDICTION_EXACT: 3,
  PREDICTION_TENDENCY: 1,
};

export function calculateScore(
  bet: Bet | null,
  predictions: Record<string, { homeScore: number | null; awayScore: number | null }> | null,
  matches: MatchResult[],
  standings: GroupStanding[],
  realAwards: Partial<SpecialAwards>
): ScoreBreakdown {
  const selectedTeams = new Set(bet?.teams || []);
  const breakdown: ScoreBreakdown = {
    matchPoints: 0,
    positionPoints: 0,
    knockoutPoints: 0,
    specialPoints: 0,
    predictionPoints: 0,
    total: 0,
    detail: [],
  };

  // --- GROUP STAGE MATCH POINTS ---
  for (const match of matches) {
    if (match.status !== "FINISHED") continue;
    if (match.stage !== "GROUP") continue;
    if (match.homeScore === null || match.awayScore === null) continue;

    const homeSelected = selectedTeams.has(match.homeTeam);
    const awaySelected = selectedTeams.has(match.awayTeam);

    if (match.homeScore > match.awayScore) {
      if (homeSelected) {
        breakdown.matchPoints += PTS.WIN;
        breakdown.detail.push(
          `+${PTS.WIN}p victoria ${TEAMS_BY_CODE[match.homeTeam]?.name ?? match.homeTeam}`
        );
      }
      if (awaySelected) {
        // loss — no points
      }
    } else if (match.awayScore > match.homeScore) {
      if (awaySelected) {
        breakdown.matchPoints += PTS.WIN;
        breakdown.detail.push(
          `+${PTS.WIN}p victoria ${TEAMS_BY_CODE[match.awayTeam]?.name ?? match.awayTeam}`
        );
      }
    } else {
      // draw
      if (homeSelected) {
        breakdown.matchPoints += PTS.DRAW;
        breakdown.detail.push(
          `+${PTS.DRAW}p empate ${TEAMS_BY_CODE[match.homeTeam]?.name ?? match.homeTeam}`
        );
      }
      if (awaySelected) {
        breakdown.matchPoints += PTS.DRAW;
        breakdown.detail.push(
          `+${PTS.DRAW}p empate ${TEAMS_BY_CODE[match.awayTeam]?.name ?? match.awayTeam}`
        );
      }
    }
  }

  // --- GROUP POSITION POINTS ---
  // A group has 6 matches. We only award points if all 6 are finished.
  const finishedGroupMatches = new Map<string, number>();
  for (const match of matches) {
    if (match.stage === "GROUP" && match.status === "FINISHED") {
      const group = TEAMS_BY_CODE[match.homeTeam]?.group || match.group;
      if (group) {
        finishedGroupMatches.set(group, (finishedGroupMatches.get(group) || 0) + 1);
      }
    }
  }

  for (const standing of standings) {
    if (!selectedTeams.has(standing.teamCode)) continue;
    const teamGroup = TEAMS_BY_CODE[standing.teamCode]?.group;
    if (!teamGroup || (finishedGroupMatches.get(teamGroup) || 0) < 6) {
      continue; // Group is not finished yet
    }

    const teamName = TEAMS_BY_CODE[standing.teamCode]?.name ?? standing.teamCode;

    if (standing.position === 1) {
      breakdown.positionPoints += PTS.FIRST;
      breakdown.detail.push(`+${PTS.FIRST}p 1º de grupo ${teamName}`);
    } else if (standing.position === 2) {
      breakdown.positionPoints += PTS.SECOND;
      breakdown.detail.push(`+${PTS.SECOND}p 2º de grupo ${teamName}`);
    } else if (standing.position === 3 && standing.isThirdAdvancing) {
      breakdown.positionPoints += PTS.THIRD_ADV;
      breakdown.detail.push(`+${PTS.THIRD_ADV}p 3º que pasa ${teamName}`);
    }
  }

  // --- KNOCKOUT STAGE POINTS ---
  // Points are awarded as soon as a team QUALIFIES for a round (i.e. appears in
  // the bracket), not only when the match finishes. This way, if a team has
  // reached the semi-finals but the match hasn't been played yet, they still
  // get the 8 SF points.
  // Exception: THIRD place and CHAMPION bonus require the match to finish.
  const stagePoints: Record<string, number> = {
    R32: PTS.R32,
    R16: PTS.R16,
    QF: PTS.QF,
    SF: PTS.SF,
    FINAL: PTS.FINAL,
    THIRD: PTS.THIRD_PLACE,
  };

  const stageNames: Record<string, string> = {
    R32: "32avos de final",
    R16: "Octavos de final",
    QF: "Cuartos de final",
    SF: "Semifinal",
    FINAL: "Final",
    THIRD: "3er puesto",
  };

  // Track which teams have already been awarded points for each stage
  // to avoid double-counting
  const awardedStageTeams = new Set<string>();

  for (const match of matches) {
    if (match.stage === "GROUP") continue;

    const stagePts = stagePoints[match.stage] ?? 0;
    const stageName = stageNames[match.stage] ?? match.stage;

    // For THIRD place match, only the winner gets points (requires FINISHED)
    if (match.stage === "THIRD") {
      if (match.status !== "FINISHED" || match.homeScore === null || match.awayScore === null) continue;
      let thirdWinner: string | null = null;
      if (match.homeScore! > match.awayScore!) thirdWinner = match.homeTeam;
      else if (match.awayScore! > match.homeScore!) thirdWinner = match.awayTeam;
      else if (match.penaltyWinner) thirdWinner = match.penaltyWinner;

      if (thirdWinner && selectedTeams.has(thirdWinner)) {
        const key = `${match.stage}_${thirdWinner}`;
        if (!awardedStageTeams.has(key)) {
          awardedStageTeams.add(key);
          breakdown.knockoutPoints += stagePts;
          breakdown.detail.push(
            `+${stagePts}p ${stageName} ${TEAMS_BY_CODE[thirdWinner]?.name ?? thirdWinner}`
          );
        }
      }
    } else {
      // All other knockout rounds: teams get points for REACHING this stage
      // (regardless of whether the match has been played yet)
      const homeValid = match.homeTeam && match.homeTeam !== "TBD";
      const awayValid = match.awayTeam && match.awayTeam !== "TBD";

      if (homeValid && selectedTeams.has(match.homeTeam)) {
        const key = `${match.stage}_${match.homeTeam}`;
        if (!awardedStageTeams.has(key)) {
          awardedStageTeams.add(key);
          breakdown.knockoutPoints += stagePts;
          breakdown.detail.push(
            `+${stagePts}p ${stageName} ${TEAMS_BY_CODE[match.homeTeam]?.name ?? match.homeTeam}`
          );
        }
      }
      if (awayValid && selectedTeams.has(match.awayTeam)) {
        const key = `${match.stage}_${match.awayTeam}`;
        if (!awardedStageTeams.has(key)) {
          awardedStageTeams.add(key);
          breakdown.knockoutPoints += stagePts;
          breakdown.detail.push(
            `+${stagePts}p ${stageName} ${TEAMS_BY_CODE[match.awayTeam]?.name ?? match.awayTeam}`
          );
        }
      }
    }

    // Champion bonus (requires FINISHED)
    if (match.stage === "FINAL" && match.status === "FINISHED" && match.homeScore !== null && match.awayScore !== null) {
      let winner: string | null = null;
      if (match.homeScore > match.awayScore) winner = match.homeTeam;
      else if (match.awayScore > match.homeScore) winner = match.awayTeam;
      else if (match.penaltyWinner) winner = match.penaltyWinner;

      if (winner && selectedTeams.has(winner)) {
        breakdown.knockoutPoints += PTS.CHAMPION;
        breakdown.detail.push(
          `+${PTS.CHAMPION}p CAMPEÓN ${TEAMS_BY_CODE[winner]?.name ?? winner}`
        );
      }
    }
  }

  // --- SPECIAL AWARD POINTS ---
  if (bet && realAwards.mvp && bet.mvp.toLowerCase() === realAwards.mvp.toLowerCase()) {
    breakdown.specialPoints += PTS.SPECIAL;
    breakdown.detail.push(`+${PTS.SPECIAL}p MVP acertado (${bet.mvp})`);
  }
  if (bet && realAwards.pichichi && bet.pichichi.toLowerCase() === realAwards.pichichi.toLowerCase()) {
    breakdown.specialPoints += PTS.SPECIAL;
    breakdown.detail.push(`+${PTS.SPECIAL}p Pichichi acertado (${bet.pichichi})`);
  }
  if (
    bet &&
    realAwards.guanteOro &&
    bet.guanteOro.toLowerCase() === realAwards.guanteOro.toLowerCase()
  ) {
    breakdown.specialPoints += PTS.SPECIAL;
    breakdown.detail.push(`+${PTS.SPECIAL}p Guante de Oro acertado (${bet.guanteOro})`);
  }
  if (
    bet &&
    realAwards.mejorJoven &&
    bet.mejorJoven.toLowerCase() === realAwards.mejorJoven.toLowerCase()
  ) {
    breakdown.specialPoints += PTS.SPECIAL;
    breakdown.detail.push(
      `+${PTS.SPECIAL}p Mejor Joven acertado (${bet.mejorJoven})`
    );
  }

  // --- PREDICTION (QUINIELA) POINTS ---
  if (predictions) {
    // Note: To match predictions with matches, we need match ID.
    // However, MatchResult in this file doesn't have an 'id' field!
    // We must update MatchResult to include id.
    for (const match of matches) {
      if (match.status !== "FINISHED") continue;
      if (match.homeScore === null || match.awayScore === null) continue;
      
      const pred = predictions[match.id as string];
      if (!pred || pred.homeScore === null || pred.awayScore === null) continue;

      const hName = TEAMS_BY_CODE[match.homeTeam]?.name ?? match.homeTeam;
      const aName = TEAMS_BY_CODE[match.awayTeam]?.name ?? match.awayTeam;

      if (pred.homeScore === match.homeScore && pred.awayScore === match.awayScore) {
        breakdown.predictionPoints += PTS.PREDICTION_EXACT;
        breakdown.detail.push(`+${PTS.PREDICTION_EXACT}p Pleno ${hName} ${match.homeScore}-${match.awayScore} ${aName}`);
      } else {
        const actualDiff = match.homeScore - match.awayScore;
        const predDiff = pred.homeScore - pred.awayScore;
        
        // Correct tendency: home win, away win, or draw
        if ((actualDiff > 0 && predDiff > 0) || (actualDiff < 0 && predDiff < 0) || (actualDiff === 0 && predDiff === 0)) {
          breakdown.predictionPoints += PTS.PREDICTION_TENDENCY;
          breakdown.detail.push(`+${PTS.PREDICTION_TENDENCY}p Tendencia ${hName} vs ${aName}`);
        }
      }
    }
  }

  breakdown.total =
    breakdown.matchPoints +
    breakdown.positionPoints +
    breakdown.knockoutPoints +
    breakdown.specialPoints +
    breakdown.predictionPoints;

  return breakdown;
}
