export type PlayerRole = 'Batsman' | 'Bowler' | 'All-Rounder' | 'Wicket-Keeper';
export type BattingStyle = 'Aggressive' | 'Balanced' | 'Defensive';
export type BowlingType = 'Fast' | 'Spin' | 'Medium';

export interface Player {
  id: string;
  name: string;
  role: PlayerRole;
  battingSkill: number;
  bowlingSkill: number;
  fitness: number;
  confidence: number;
  rating: number;
  stats: {
    runs: number;
    balls: number;
    wickets: number;
    overs: number;
    runsConceded: number;
  };
}

export interface Team {
  id: string;
  name: string;
  logo: string;
  players: Player[];
  primaryColor: string;
  secondaryColor: string;
}

export interface TeamStats {
  played: number;
  won: number;
  lost: number;
  pts: number;
  nrr: number;
}

export type TournamentPhase = 'qualifiers' | 'league' | 'playoffs' | 'semis' | 'final';

export interface Fixture {
  id: string;
  teamAId: string;
  teamBId: string;
  phase: TournamentPhase;
  status: 'pending' | 'completed';
  winnerId?: string;
  scoreA?: number;
  scoreB?: number;
  wicketsA?: number;
  wicketsB?: number;
}

export interface TournamentState {
  version: string;
  phase: TournamentPhase;
  standings: Record<string, TeamStats>;
  fixtures: Fixture[];
  currentMatchId?: string;
  qualifiedTeams: string[]; // Teams already in the main league
  semifinalists: string[];
}

export interface MatchState {
  id: string;
  battingTeam: Team;
  bowlingTeam: Team;
  score: number;
  wickets: number;
  overs: string;
  ballsInOver: number;
  innings: 1 | 2;
  target?: number;
  status: 'prematch' | 'inprogress' | 'completed';
  recentBalls: string[];
  commentary: string[];
  strikerId: string;
  nonStrikerId: string;
  bowlerId: string;
  aggression: number; // 1-5
  playerStats: Record<string, { runs: number, balls: number, wickets: number, runsConceded: number, overs: number }>;
}

export interface BallResult {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  extraType?: 'wide' | 'noball';
  description: string;
  type: string;
}
