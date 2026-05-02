
export enum Format {
    T20_SMASH = 'T20 Challenge',
    ODI = 'One-day Shield',
    SHIELD = 'FC',
    DEVELOPMENT_T20 = 'Development T20 Cup',
    RISE_T20 = 'Rise T20 Championship',
    DEVELOPMENT_ODI = 'Development One-Day Trophy',
    RISE_ODI = 'Rise One-Day Series',
    DEVELOPMENT_FIRST_CLASS = 'Development First-Class Cup',
    RISE_FIRST_CLASS = 'Rise First-Class Series'
}

export enum PlayerRole {
    BATSMAN = 'BT',
    WICKET_KEEPER = 'WK',
    ALL_ROUNDER = 'AR',
    SPIN_BOWLER = 'SB',
    FAST_BOWLER = 'BL',
}

export enum PlayerArchetype {
    AGGRESSIVE = 'Aggressive',
    ADAPTIVE = 'Adaptive',
    BALANCED = 'Balanced',
    DEFENSIVE = 'Defensive'
}

export type BattingStyle = 'A' | 'D' | 'N' | 'NA';
export type Strategy = 'defensive' | 'balanced' | 'attacking';
export type AppState = 'MAIN_MENU' | 'TEAM_SELECTION' | 'AUCTION' | 'CAREER_HUB';
export type CareerScreen = 'DASHBOARD' | 'LEAGUES' | 'LINEUPS' | 'EDITOR' | 'NEWS' | 'STATS' | 'SETTINGS' | 'PLAYER_PROFILE' | 'MATCH_RESULT' | 'FORWARD_RESULTS' | 'AWARDS_RECORDS' | 'TRANSFERS' | 'END_OF_FORMAT' | 'COMPARISON' | 'SCHEDULE' | 'LIVE_MATCH' | 'SPONSOR_ROOM' | 'SELECT_PLAYER_FOR_COMPARISON_SLOT_1' | 'SELECT_PLAYER_FOR_COMPARISON_SLOT_2' | 'AUCTION_ROOM' | 'RETENTION' | 'PLAYER_DATABASE' | 'SEASON_SUMMARY' | 'RATING_BOARD' | 'MATCH_STRATEGY' | 'CAPTAINS_CORNER';

export interface PlayerStats {
    matches: number; runs: number; highestScore: number; average: number; strikeRate: number; ballsFaced: number; dismissals: number;
    hundreds: number; fifties: number; thirties: number; fours: number; sixes: number; fastestFifty: number; fastestHundred: number;
    wickets: number; economy: number; bestBowling: string; bestBowlingWickets: number; bestBowlingRuns: number; bowlingAverage: number;
    ballsBowled: number; runsConceded: number; threeWicketHauls: number; fiveWicketHauls: number; catches: number; runOuts: number;
    manOfTheMatchAwards: number;
    dotBallPercentage?: number;
    boundaryPercentage?: number;
    // Enhanced phase-wise stats
    ppRuns: number; ppBalls: number; ppWickets: number; ppRunsConceded: number; ppBallsBowled: number;
    midRuns: number; midBalls: number; midWickets: number; midRunsConceded: number; midBallsBowled: number;
    deathRuns: number; deathBalls: number; deathWickets: number; deathRunsConceded: number; deathBallsBowled: number;
    ones: number; twos: number; threes: number; dots: number;
    runsByPosition: Record<number, number>;
}

export interface PlayerPerformanceSummary {
    runs: number;
    wickets: number;
    matchId: string;
}

export interface PlayerCustomization {
    faceShape: number;
    skinTone: number;
    hairStyle: number;
    hairColor: string;
    facialHair: number;
    facialHairColor: string;
    beardStyle: number;
    beardColor: string;
    mustacheStyle: number;
    mustacheColor: string;
    eyeColor: string;
    accessories?: string[];
}

export interface Injury {
    type: string;
    matchesOut: number;
    isSeasonEnding: boolean;
}

export interface PlayerAttributes {
    power: number;
    timing: number;
    consistency: number;
    pace: number;
    spin: number;
    economy: number;
}

export interface Player {
    id: string; name: string; nationality: string; role: PlayerRole; archetype?: PlayerArchetype; battingSkill: number; secondarySkill: number;
    rating?: number;
    style: BattingStyle; isOpener: boolean; isForeign: boolean; teamName?: string;
    auctionPrice?: number;
    age?: number; fielding?: number; accuracy?: number;
    potential?: number; form?: number; fitness?: number; stamina?: number;
    isEmerging?: boolean;
    yearsInTeam?: number; // Track years in a team for emerging status
    basePrice?: number; // In PKR Lacs
    attributes?: PlayerAttributes;
    customProfiles?: { [key in Format]?: { avg: number; sr: number } };
    stats: Record<Format, PlayerStats>;
    recentPerformances: PlayerPerformanceSummary[];
    customization?: PlayerCustomization;
    avatarUrl?: string;
    avatarSeed?: string;
    imageUrl?: string;
    injury?: Injury;
    currentTeamId?: string;
    isFreeAgent?: boolean;
}

export interface Team {
    id: string; name: string; squad: Player[]; captains: { [key in Format]?: string };
    purse: number; // In PKR Crore (stored as number, e.g., 50.0)
    nextYearBudgetReduction?: number; // Penalty for swapping great players
    mentality?: number;
    color?: string;
    overallRating?: number;
    group?: 'A' | 'B' | 'Round-Robin' | 'Super Sixes' | 'Super Six' | 'Group A' | 'Group B' | 'Eliminated';
    initialGroup?: 'A' | 'B';
    ratings?: {
        t20: number;
        odi: number;
        fc: number;
    };
}

export interface TeamData {
    id: string; name: string; homeGround: string; logo: string; isYouthTeam: boolean;
    overallRating?: number;
    group?: 'A' | 'B' | 'Round-Robin' | 'Super Sixes' | 'Super Six' | 'Group A' | 'Group B' | 'Eliminated';
    initialGroup?: 'A' | 'B';
    ratings?: {
        t20: number;
        odi: number;
        fc: number;
    };
}

export interface Ground {
    name: string; code: string; pitch: string; dimensions?: string; weather?: 'Sunny' | 'Overcast' | 'Rainy' | 'Humid' | 'Dry';
    boundarySize?: 'Small' | 'Medium' | 'Large'; outfieldSpeed?: 'Fast' | 'Medium' | 'Slow' | 'Lightning'; capacity?: number;
}

export interface Match {
    matchNumber: number | string; teamA: string; teamAId?: string; vs: string; teamB: string; teamBId?: string; date: string; group: 'Group A' | 'Group B' | 'Round-Robin' | 'Super Sixes' | 'Super Six' | 'Semi-Finals' | 'Final';
}

export interface Inning {
    teamId: string; teamName: string; score: number; wickets: number; overs: string; batting: BattingPerformance[]; bowling: BowlingPerformance[]; extras: number; recentBalls?: string[];
    isCompleted?: boolean; declared?: boolean;
    fallOfWickets?: { score: number, wicket: number, over: string, player: string }[];
}

export interface BattingPerformance {
    playerId: string; playerName: string; runs: number; balls: number; fours: number; sixes: number; isOut: boolean; dismissalText: string; dismissal: { type: 'not out' | 'bowled' | 'caught'; bowlerId: string; fielderId?: string; }; ballsToFifty?: number; ballsToHundred?: number;
    battingOrder: number;
    // Phase-wise performance tracking
    ppRuns: number; ppBalls: number;
    midRuns: number; midBalls: number;
    deathRuns: number; deathBalls: number;
    ones: number; twos: number; threes: number; dots: number;
}

export interface BowlingPerformance {
    playerId: string; playerName: string; overs: string; maidens: number; runsConceded: number; wickets: number; ballsBowled: number;
    // Phase-wise performance tracking
    ppRuns: number; ppBalls: number; ppWickets: number;
    midRuns: number; midBalls: number; midWickets: number;
    deathRuns: number; deathBalls: number; deathWickets: number;
}

export interface MatchResult {
    matchNumber: number | string; winnerId: string | null; loserId: string | null; isDraw?: boolean; summary: string; firstInning: Inning; secondInning: Inning; thirdInning?: Inning; fourthInning?: Inning; manOfTheMatch: { playerId: string; playerName: string; teamId: string; summary: string; }; tossWinnerId?: string; tossDecision?: 'bat' | 'bowl';
    teamACaptainId?: string;
    teamBCaptainId?: string;
}

export interface Standing {
    teamId: string; teamName: string; played: number; won: number; lost: number; drawn: number; points: number; netRunRate: number; runsFor: number; runsAgainst: number;
    oversFor: number;
    oversAgainst: number;
    rating?: number;
    logo?: string;
}

export interface NewsArticle {
    id: string; headline: string; date: string; excerpt: string; content: string; type?: 'match' | 'transfer' | 'league' | 'squad';
}

export interface Award {
    season: number; format: Format; winnerTeamId: string; winnerTeamName: string;
    bestBatter: { playerId: string, playerName: string, teamName: string, runs: number };
    bestBowler: { playerId: string, playerName: string, teamName: string, wickets: number };
}

export interface ScoreLimits { maxRuns?: number; maxWickets?: number; oversPerMatch?: number; maxOversPerBowler?: number; }
export type InningLimits = { [key: number]: ScoreLimits; };

export interface BatterVsBowlerRecord { batterId: string; batterName: string; bowlerId: string; bowlerName: string; runs: number; balls: number; dismissals: number; }
export interface TeamVsTeamRecord { teamAId: string; teamBId: string; teamAName: string; teamBName: string; matches: number; teamAWins: number; }
export interface PlayerVsTeamRecord { playerId: string; playerName: string; playerRole: PlayerRole; vsTeamId: string; vsTeamName: string; runs: number; balls: number; dismissals: number; wickets: number; runsConceded: number; ballsBowled: number; }
export interface PromotionRecord { season: number; promotedTeamId: string; promotedTeamName: string; relegatedTeamId: string; relegatedTeamName: string; }

export interface Sponsorship { sponsorName: string; tournamentName: string; logoColor: string; tournamentLogo?: string; tvChannel?: string; tvLogo?: string; }
export interface Brand { name: string; color: string; style: string; logo: string; }
export interface TVChannel { id: string; name: string; logo: string; color: string; minPopularity: number; tier: 'Premium' | 'Standard' | 'Budget'; }

export interface GameData {
    userTeamId: string; teams: Team[]; grounds: Ground[]; allTeamsData: TeamData[]; allPlayers: Player[]; schedule: Record<Format, Match[]>; currentMatchIndex: Record<Format, number>; standings: Record<Format, Standing[]>; matchResults: Record<Format, MatchResult[]>; playingXIs: Record<string, Partial<Record<Format, string[]>>>; currentSeason: number; currentFormat: Format; awardsHistory: Award[]; records: { batterVsBowler: BatterVsBowlerRecord[]; teamVsTeam: TeamVsTeamRecord[]; playerVsTeam: PlayerVsTeamRecord[]; }; promotionHistory: PromotionRecord[]; popularity: number; sponsorships: Record<Format, Sponsorship>; news: NewsArticle[]; activeMatch: LiveMatchState | null; scoreLimits?: Record<string, Partial<Record<Format, InningLimits>>>; availableBrands?: Brand[]; availableTVChannels?: TVChannel[];
    bowlingPlans: Record<string, Partial<Record<Format, Record<number, string>>>>;
    autoArrivalDisabled?: boolean;
    settings: {
        isDoubleRoundRobin: boolean;
    };
}

export interface LiveMatchState {
    status: 'toss' | 'ready' | 'inprogress' | 'inning_break' | 'completed'; match: Match; currentInningIndex: number; innings: Inning[]; target: number | null; currentBatters: { strikerId: string; nonStrikerId: string }; currentBowlerId: string; recentBalls: string[]; commentary: string[]; battingTeam: Team; bowlingTeam: Team; requiredRunRate: number; currentPartnership: { runs: number, balls: number }; fallOfWickets: { score: number, wicket: number, over: string, player: string }[]; waitingFor: 'openers' | 'batter' | 'bowler' | 'batter_arrival' | 'bowler_change' | 'striker' | null; strategies: { batting: Strategy; bowling: Strategy; }; autoPlayType: 'regular' | 'inning' | 'match' | null; tossWinnerId: string | null; tossDecision: 'bat' | 'bowl' | null; followOn?: boolean;
    bowlingPlan?: Record<number, string>;
}

export interface Message { id: string; text: string; sender: 'user' | 'model' | 'bot'; timestamp?: Date; }
