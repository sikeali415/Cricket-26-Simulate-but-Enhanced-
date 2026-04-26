
import React from 'react';
import { Format, Player, PlayerRole, Team, Match, PlayerStats, Sponsorship, MatchResult, NewsArticle, GameData } from './types';
import { BRANDS, generateSingleFormatInitialStats, generateInitialStats, TV_CHANNELS, TOURNAMENT_LOGOS, INITIAL_SPONSORSHIPS } from './data';

export enum FormatCategory {
    T20 = 'T20',
    ODI = 'ODI',
    FIRST_CLASS = 'FIRST CLASS'
}

export const getFormatCategory = (formatName: string): FormatCategory => {
    const fn = formatName.toLowerCase();
    if (fn.includes('t20')) return FormatCategory.T20;
    if (fn.includes('one-day') || fn.includes('odi')) return FormatCategory.ODI;
    if (fn.includes('fc') || fn.includes('first-class') || fn.includes('shield')) return FormatCategory.FIRST_CLASS;
    return FormatCategory.T20;
};

export const aggregatePlayerStats = (player: Player): Record<string, PlayerStats> => {
    const aggregated: Record<string, PlayerStats> = {};
    if (!player.stats) return aggregated;

    Object.entries(player.stats).forEach(([format, stats]) => {
        if (!stats || stats.matches === 0) return;
        
        const category = getFormatCategory(format);
        if (!aggregated[category]) {
            aggregated[category] = generateSingleFormatInitialStats();
        }
        
        const cat = aggregated[category];
        cat.matches += stats.matches;
        cat.runs += stats.runs;
        cat.ballsFaced += stats.ballsFaced;
        cat.dismissals += stats.dismissals;
        cat.hundreds += stats.hundreds;
        cat.fifties += stats.fifties;
        cat.thirties += stats.thirties || 0;
        cat.fours += stats.fours;
        cat.sixes += stats.sixes;
        if (stats.highestScore > cat.highestScore) cat.highestScore = stats.highestScore;
        
        cat.wickets += stats.wickets;
        cat.ballsBowled += stats.ballsBowled;
        cat.runsConceded += stats.runsConceded;
        cat.threeWicketHauls += stats.threeWicketHauls || 0;
        cat.fiveWicketHauls += stats.fiveWicketHauls;
        
        if (stats.bestBowlingWickets > cat.bestBowlingWickets || (stats.bestBowlingWickets === cat.bestBowlingWickets && stats.bestBowlingRuns < cat.bestBowlingRuns)) {
            cat.bestBowlingWickets = stats.bestBowlingWickets;
            cat.bestBowlingRuns = stats.bestBowlingRuns;
            cat.bestBowling = stats.bestBowling;
        }

        if (stats.fastestFifty > 0 && (cat.fastestFifty === 0 || stats.fastestFifty < cat.fastestFifty)) cat.fastestFifty = stats.fastestFifty;
        if (stats.fastestHundred > 0 && (cat.fastestHundred === 0 || stats.fastestHundred < cat.fastestHundred)) cat.fastestHundred = stats.fastestHundred;
        
        cat.catches += stats.catches;
        cat.runOuts += stats.runOuts;

        // Aggregate phase stats
        cat.ppRuns += stats.ppRuns || 0;
        cat.ppBalls += stats.ppBalls || 0;
        cat.ppWickets += stats.ppWickets || 0;
        cat.ppRunsConceded += stats.ppRunsConceded || 0;
        cat.ppBallsBowled += stats.ppBallsBowled || 0;
        
        cat.midRuns += stats.midRuns || 0;
        cat.midBalls += stats.midBalls || 0;
        cat.midWickets += stats.midWickets || 0;
        cat.midRunsConceded += stats.midRunsConceded || 0;
        cat.midBallsBowled += stats.midBallsBowled || 0;
        
        cat.deathRuns += stats.deathRuns || 0;
        cat.deathBalls += stats.deathBalls || 0;
        cat.deathWickets += stats.deathWickets || 0;
        cat.deathRunsConceded += stats.deathRunsConceded || 0;
        cat.deathBallsBowled += stats.deathBallsBowled || 0;

        // Individual ball counts
        cat.ones += stats.ones || 0;
        cat.twos += stats.twos || 0;
        cat.threes += stats.threes || 0;
        cat.dots += stats.dots || 0;

        // Runs By Position
        if (stats.runsByPosition) {
            if (!cat.runsByPosition) cat.runsByPosition = {};
            Object.entries(stats.runsByPosition).forEach(([pos, runs]) => {
                const pNum = parseInt(pos);
                cat.runsByPosition[pNum] = (cat.runsByPosition[pNum] || 0) + (runs as number);
            });
        }
        cat.manOfTheMatchAwards += stats.manOfTheMatchAwards;
    });

    // Recalculate averages
    Object.values(aggregated).forEach(s => {
        s.average = s.dismissals > 0 ? s.runs / s.dismissals : s.runs;
        s.strikeRate = s.ballsFaced > 0 ? (s.runs / s.ballsFaced) * 100 : 0;
        s.bowlingAverage = s.wickets > 0 ? s.runsConceded / s.wickets : 0;
        s.economy = s.ballsBowled > 0 ? (s.runsConceded / s.ballsBowled) * 6 : 0;
    });

    return aggregated;
};

export const PITCH_MODIFIERS = {
    "Balanced Sporting Pitch": {
        [Format.T20_SMASH]: { runRate: 3.85, wicketChance: 1.20 },
        [Format.ODI]: { runRate: 2.45, wicketChance: 1.15 },
        [Format.SHIELD]: { runRate: 1.0, wicketChance: 1.0 },
        [Format.DEVELOPMENT_T20]: { runRate: 3.85, wicketChance: 1.20 },
        [Format.RISE_T20]: { runRate: 3.85, wicketChance: 1.20 },
        [Format.DEVELOPMENT_ODI]: { runRate: 2.45, wicketChance: 1.15 },
        [Format.RISE_ODI]: { runRate: 2.45, wicketChance: 1.15 },
        [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 1.0, wicketChance: 1.0 },
        [Format.RISE_FIRST_CLASS]: { runRate: 1.0, wicketChance: 1.0 },
        paceBonus: 0,
        spinBonus: 0,
        chasePenalty: 1.0,
        deterioration: 0.02,
        unpredictability: 0
    },
    "Dusty Spinner’s Haven": {
        [Format.T20_SMASH]: { runRate: 3.10, wicketChance: 1.40 },
        [Format.ODI]: { runRate: 2.10, wicketChance: 1.25 },
        [Format.SHIELD]: { runRate: 0.9, wicketChance: 1.15 },
        [Format.DEVELOPMENT_T20]: { runRate: 3.10, wicketChance: 1.40 },
        [Format.RISE_T20]: { runRate: 3.10, wicketChance: 1.40 },
        [Format.DEVELOPMENT_ODI]: { runRate: 2.10, wicketChance: 1.25 },
        [Format.RISE_ODI]: { runRate: 2.10, wicketChance: 1.25 },
        [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.9, wicketChance: 1.15 },
        [Format.RISE_FIRST_CLASS]: { runRate: 0.9, wicketChance: 1.15 },
        paceBonus: -0.05,
        spinBonus: 0.15,
        chasePenalty: 0.95,
        deterioration: 0.1,
        unpredictability: 0.005
    },
    "Green Top": {
        [Format.T20_SMASH]: { runRate: 3.30, wicketChance: 1.45 },
        [Format.ODI]: { runRate: 2.20, wicketChance: 1.30 },
        [Format.SHIELD]: { runRate: 0.85, wicketChance: 1.2 },
        [Format.DEVELOPMENT_T20]: { runRate: 3.30, wicketChance: 1.45 },
        [Format.RISE_T20]: { runRate: 3.30, wicketChance: 1.45 },
        [Format.DEVELOPMENT_ODI]: { runRate: 2.20, wicketChance: 1.30 },
        [Format.RISE_ODI]: { runRate: 2.20, wicketChance: 1.30 },
        [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.85, wicketChance: 1.2 },
        [Format.RISE_FIRST_CLASS]: { runRate: 0.85, wicketChance: 1.2 },
        paceBonus: 0.15,
        spinBonus: -0.05,
        chasePenalty: 1.0,
        deterioration: 0.05,
        unpredictability: 0
    },
    "Batting Paradise": {
        [Format.T20_SMASH]: { runRate: 4.40, wicketChance: 1.0 },
        [Format.ODI]: { runRate: 2.85, wicketChance: 1.0 },
        [Format.SHIELD]: { runRate: 1.2, wicketChance: 0.85 },
        [Format.DEVELOPMENT_T20]: { runRate: 4.40, wicketChance: 1.0 },
        [Format.RISE_T20]: { runRate: 4.40, wicketChance: 1.0 },
        [Format.DEVELOPMENT_ODI]: { runRate: 2.85, wicketChance: 1.0 },
        [Format.RISE_ODI]: { runRate: 2.85, wicketChance: 1.0 },
        [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 1.2, wicketChance: 0.85 },
        [Format.RISE_FIRST_CLASS]: { runRate: 1.2, wicketChance: 0.85 },
        paceBonus: 0,
        spinBonus: 0,
        chasePenalty: 1.0,
        deterioration: 0,
        unpredictability: 0
    },
    "Dead Slow Track": {
        [Format.T20_SMASH]: { runRate: 2.75, wicketChance: 1.30 },
        [Format.ODI]: { runRate: 2.0, wicketChance: 1.20 },
        [Format.SHIELD]: { runRate: 0.8, wicketChance: 1.1 },
        [Format.DEVELOPMENT_T20]: { runRate: 2.75, wicketChance: 1.30 },
        [Format.RISE_T20]: { runRate: 2.75, wicketChance: 1.30 },
        [Format.DEVELOPMENT_ODI]: { runRate: 2.0, wicketChance: 1.20 },
        [Format.RISE_ODI]: { runRate: 2.0, wicketChance: 1.20 },
        [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.8, wicketChance: 1.1 },
        [Format.RISE_FIRST_CLASS]: { runRate: 0.8, wicketChance: 1.1 },
        paceBonus: -0.05,
        spinBonus: 0.1,
        chasePenalty: 1.0,
        deterioration: 0.05,
        unpredictability: 0
    },
    "Cracked Worn Surface": {
        [Format.T20_SMASH]: { runRate: 3.30, wicketChance: 1.40 },
        [Format.ODI]: { runRate: 2.20, wicketChance: 1.30 },
        [Format.SHIELD]: { runRate: 0.75, wicketChance: 1.25 },
        [Format.DEVELOPMENT_T20]: { runRate: 3.30, wicketChance: 1.40 },
        [Format.RISE_T20]: { runRate: 3.30, wicketChance: 1.40 },
        [Format.DEVELOPMENT_ODI]: { runRate: 2.20, wicketChance: 1.30 },
        [Format.RISE_ODI]: { runRate: 2.20, wicketChance: 1.30 },
        [Format.DEVELOPMENT_FIRST_CLASS]: { runRate: 0.75, wicketChance: 1.25 },
        [Format.RISE_FIRST_CLASS]: { runRate: 0.75, wicketChance: 1.25 },
        paceBonus: 0.05,
        spinBonus: 0.1,
        chasePenalty: 0.98,
        deterioration: 0.15,
        unpredictability: 0.015
    },
};

export const COMMENTARY_TEMPLATES = {
    '0': ["Defended solidly back to the bowler.", "No run, straight to the fielder.", "Beaten! Lovely delivery.", "Leaves it alone outside off.", "Solid defense, respects the good ball."],
    '1': ["Pushed into the gap for a single.", "Quick single taken.", "Worked away to square leg for one.", "Edged but safe, they take a run.", "Tapped to mid-on for a sharp single."],
    '2': ["Driven through covers, they'll come back for two.", "Good running, two runs added.", "Flicked away, easy couple.", "Punched off the back foot for a brace."],
    '3': ["Great placement! They push hard for three.", "Stopped just inside the boundary, three runs saved.", "Timed well, but the outfield is slow. Three runs."],
    '4': ["FOUR! Glorious shot through the covers!", "Smashed down the ground for FOUR!", "Edged and four! Lucky boundary.", "FOUR! Pulled away with power.", "Beautiful drive, races to the fence for FOUR!"],
    '6': ["SIX! That's huge! Out of the ground!", "SIX! Clean strike over long-on!", "Maximum! He's picked the length early.", "Top edge... and it flies for SIX!", "Launched into the stands! massive hit!"],
    'W': ["OUT! Clean bowled! What a delivery!", "Caught! Straight to the fielder.", "LBW! That looked plumb.", "Run out! Mix up in the middle!", "Edged and taken! The keeper makes no mistake."],
    'Wd': ["Wide ball, too far outside off.", "Drifting down leg, called wide.", "Wayward delivery, signaled wide."],
    'Nb': ["No ball! Overstepping.", "No ball for height, free hit coming up."],
};

export const getCommentary = (runs: number, isOut: boolean, batterName: string, bowlerName: string, extraType?: string) => {
    if (isOut) {
        const templates = COMMENTARY_TEMPLATES['W'];
        return templates[Math.floor(Math.random() * templates.length)].replace('bowler', bowlerName).replace('striker', batterName);
    }
    if (extraType === 'Wd') return COMMENTARY_TEMPLATES['Wd'][Math.floor(Math.random() * COMMENTARY_TEMPLATES['Wd'].length)];
    if (extraType === 'Nb') return COMMENTARY_TEMPLATES['Nb'][Math.floor(Math.random() * COMMENTARY_TEMPLATES['Nb'].length)];
    const key = runs > 6 ? '6' : runs.toString() as keyof typeof COMMENTARY_TEMPLATES;
    const templates = COMMENTARY_TEMPLATES[key] || COMMENTARY_TEMPLATES['0'];
    return templates[Math.floor(Math.random() * templates.length)];
};

export const getRoleColor = (role: PlayerRole) => {
    switch (role) {
        case PlayerRole.BATSMAN: return 'text-blue-500 dark:text-blue-400';
        case PlayerRole.WICKET_KEEPER: return 'text-green-600 dark:text-green-400';
        case PlayerRole.ALL_ROUNDER: return 'text-yellow-600 dark:text-yellow-400';
        case PlayerRole.SPIN_BOWLER: return 'text-purple-600 dark:text-purple-400';
        case PlayerRole.FAST_BOWLER: return 'text-red-600 dark:text-red-400';
        default: return 'text-gray-500 dark:text-gray-400';
    }
};

export const getRoleFullName = (role: PlayerRole) => {
    switch (role) {
        case PlayerRole.BATSMAN: return 'Batsman';
        case PlayerRole.WICKET_KEEPER: return 'Wicket-Keeper';
        case PlayerRole.ALL_ROUNDER: return 'All-Rounder';
        case PlayerRole.SPIN_BOWLER: return 'Spin Bowler';
        case PlayerRole.FAST_BOWLER: return 'Fast Bowler';
        default: return 'Player';
    }
};

export const formatOvers = (balls: number) => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return `${overs}.${remainingBalls}`;
}

export const getPlayerById = (id: string, allPlayers: Player[]) => {
    const player = allPlayers.find(p => p.id === id);
    if (!player) return { id: 'unknown', name: 'Unknown Player', role: PlayerRole.BATSMAN, battingSkill: 30, secondarySkill: 30, style: 'N', stats: {} } as any as Player;
    return player;
};

export const generateAutoXI = (squad: Player[], format: Format) => {
    const xi: Player[] = [];
    const used = new Set<string>();
    let foreignInXI = 0;

    const add = (p: Player) => {
        if (used.has(p.id)) return false;
        if (p.isForeign && foreignInXI >= 5) return false; // Increased limit to 5
        xi.push(p);
        used.add(p.id);
        if (p.isForeign) foreignInXI++;
        return true;
    };

    // 1. Mandatory Keeper
    const keeper = [...squad].sort((a,b) => b.battingSkill - a.battingSkill).find(p => p.role === PlayerRole.WICKET_KEEPER);
    if (keeper) add(keeper);

    // 2. Openers
    squad.filter(p => p.isOpener && !used.has(p.id)).sort((a,b) => b.battingSkill - a.battingSkill).slice(0, 2).forEach(add);

    // 3. Best remaining players
    const remaining = squad.filter(p => !used.has(p.id)).sort((a,b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
    remaining.forEach(p => { if (xi.length < 11) add(p); });

    // 4. Fill if still short (ignoring foreign limit)
    squad.filter(p => !used.has(p.id)).forEach(p => { if (xi.length < 11) { xi.push(p); used.add(p.id); } });

    return xi.slice(0, 11);
};

export const getBatterTier = (battingSkill: number) => {
    if (battingSkill >= 80) return 'tier1';
    if (battingSkill >= 65) return 'tier2';
    if (battingSkill >= 50) return 'tier3';
    if (battingSkill >= 30) return 'tier4';
    return 'tier5';
};

const BATTING_TIERS = {
    tier1: {
        NA: { avg: 45, sr: 110 }, N: { avg: 45, sr: 100 }, D: { avg: 40, sr: 85 }, A: { avg: 38, sr: 140 },
        Balanced: { avg: 45, sr: 100 }, Aggressive: { avg: 38, sr: 140 }, Defensive: { avg: 40, sr: 85 }, Adaptive: { avg: 42, sr: 115 }
    },
    tier2: {
        NA: { avg: 38, sr: 100 }, N: { avg: 38, sr: 90 }, D: { avg: 35, sr: 80 }, A: { avg: 32, sr: 125 },
        Balanced: { avg: 38, sr: 90 }, Aggressive: { avg: 32, sr: 125 }, Defensive: { avg: 35, sr: 80 }, Adaptive: { avg: 35, sr: 105 }
    },
    tier3: {
        NA: { avg: 30, sr: 90 }, N: { avg: 30, sr: 80 }, D: { avg: 28, sr: 75 }, A: { avg: 25, sr: 110 },
        Balanced: { avg: 30, sr: 80 }, Aggressive: { avg: 25, sr: 110 }, Defensive: { avg: 28, sr: 75 }, Adaptive: { avg: 28, sr: 95 }
    },
    tier4: {
        NA: { avg: 22, sr: 80 }, N: { avg: 22, sr: 75 }, D: { avg: 20, sr: 70 }, A: { avg: 18, sr: 100 },
        Balanced: { avg: 22, sr: 75 }, Aggressive: { avg: 18, sr: 100 }, Defensive: { avg: 20, sr: 70 }, Adaptive: { avg: 20, sr: 85 }
    },
    tier5: {
        NA: { avg: 15, sr: 75 }, N: { avg: 15, sr: 70 }, D: { avg: 12, sr: 65 }, A: { avg: 10, sr: 90 },
        Balanced: { avg: 15, sr: 70 }, Aggressive: { avg: 10, sr: 90 }, Defensive: { avg: 12, sr: 65 }, Adaptive: { avg: 12, sr: 80 }
    },
};

export const BATTING_PROFILES: any = {
    [Format.T20_SMASH]: BATTING_TIERS,
    [Format.ODI]: BATTING_TIERS,
    [Format.SHIELD]: BATTING_TIERS,
    [Format.DEVELOPMENT_T20]: BATTING_TIERS,
    [Format.RISE_T20]: BATTING_TIERS,
    [Format.DEVELOPMENT_ODI]: BATTING_TIERS,
    [Format.RISE_ODI]: BATTING_TIERS,
    [Format.DEVELOPMENT_FIRST_CLASS]: BATTING_TIERS,
    [Format.RISE_FIRST_CLASS]: BATTING_TIERS,
};

export const resolveMatch = (match: Match, gameData: GameData, format: Format): Match => {
    if (!match) return match;
    const resolved = { ...match };
    const standings = gameData.standings[format] || [];
    const teams = gameData.teams || [];

    const getTeamFromStanding = (rank: number, groupName: string) => {
        // Find teams belonging to this specific group/phase
        const filtered = standings.filter(s => {
            const team = teams.find(t => t.id === s.teamId);
            // In multi-stage, we might need to check which phase we are looking at
            // Group stage uses group A/B in team data
            // Super Six stage needs its own standings (calculated across Super Six matches only)
            if (groupName.includes('Super Six')) {
                // For simplicity, we assume Super Six standings are handled separately or we use group property
                return team?.group === 'Super Six';
            }
            const groupKey = groupName.replace('Group ', '');
            return team?.group === groupKey;
        });
        return filtered[rank - 1]?.teamName || `TBD ${groupName} ${rank}`;
    };

    const resolvePlaceholder = (placeholder: any): string => {
        if (typeof placeholder !== 'string') return placeholder;
        
        if (placeholder === '1st A') return getTeamFromStanding(1, 'Group A');
        if (placeholder === '2nd A') return getTeamFromStanding(2, 'Group A');
        if (placeholder === '3rd A') return getTeamFromStanding(3, 'Group A');
        
        if (placeholder === '1st B') return getTeamFromStanding(1, 'Group B');
        if (placeholder === '2nd B') return getTeamFromStanding(2, 'Group B');
        if (placeholder === '3rd B') return getTeamFromStanding(3, 'Group B');

        if (placeholder === '1st SS') return getTeamFromStanding(1, 'Super Six');
        if (placeholder === '2nd SS') return getTeamFromStanding(2, 'Super Six');
        if (placeholder === '3rd SS') return getTeamFromStanding(3, 'Super Six');
        if (placeholder === '4th SS') return getTeamFromStanding(4, 'Super Six');

        if (placeholder === 'SF1 Winner') {
            const sf1Res = gameData.matchResults[format]?.find(r => r && r.matchNumber === 'SF1');
            return teams.find(t => t.id === sf1Res?.winnerId)?.name || 'SF1 Winner';
        }
        if (placeholder === 'SF2 Winner') {
            const sf2Res = gameData.matchResults[format]?.find(r => r && r.matchNumber === 'SF2');
            return teams.find(t => t.id === sf2Res?.winnerId)?.name || 'SF2 Winner';
        }

        return placeholder;
    };

    resolved.teamA = resolvePlaceholder(resolved.teamA);
    resolved.teamB = resolvePlaceholder(resolved.teamB);

    return resolved;
};

export const generateAutoBowlingPlan = (squad: Player[], format: Format) => {
    const plan: Record<number, string> = {};
    const bowlers = squad.filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(p.role));
    if (bowlers.length === 0) return plan;

    const isT20 = format.includes('T20');
    const overs = isT20 ? 20 : 50;

    for (let i = 1; i <= overs; i++) {
        plan[i] = bowlers[(i - 1) % bowlers.length].id;
    }
    return plan;
};


export const LoadingSpinner = () => (
    React.createElement("div", { className: "flex justify-center items-center h-full w-full" },
        React.createElement("div", { className: "animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-500" })
    )
);

export const aggregateStats = (player: Player, formats: Format[]): PlayerStats => {
    const total = generateSingleFormatInitialStats();
    formats.forEach(f => {
        const s = player.stats[f];
        if (s) {
            total.matches += s.matches;
            total.runs += s.runs;
            total.ballsFaced += s.ballsFaced;
            total.dismissals += s.dismissals;
            if (s.highestScore > total.highestScore) total.highestScore = s.highestScore;
            total.hundreds += s.hundreds;
            total.fifties += s.fifties;
            total.thirties += s.thirties;
            total.fours += s.fours;
            total.sixes += s.sixes;
            if (s.fastestFifty > 0 && (total.fastestFifty === 0 || s.fastestFifty < total.fastestFifty)) total.fastestFifty = s.fastestFifty;
            if (s.fastestHundred > 0 && (total.fastestHundred === 0 || s.fastestHundred < total.fastestHundred)) total.fastestHundred = s.fastestHundred;
            
            total.wickets += s.wickets;
            total.ballsBowled += s.ballsBowled;
            total.runsConceded += s.runsConceded;
            total.threeWicketHauls += s.threeWicketHauls;
            total.fiveWicketHauls += s.fiveWicketHauls;
            total.catches += s.catches;
            total.runOuts += s.runOuts;
            total.manOfTheMatchAwards += s.manOfTheMatchAwards;
            
            // Aggregate phase stats
            total.ppRuns += s.ppRuns || 0;
            total.ppBalls += s.ppBalls || 0;
            total.ppWickets += s.ppWickets || 0;
            total.ppRunsConceded += s.ppRunsConceded || 0;
            total.ppBallsBowled += s.ppBallsBowled || 0;
            
            total.midRuns += s.midRuns || 0;
            total.midBalls += s.midBalls || 0;
            total.midWickets += s.midWickets || 0;
            total.midRunsConceded += s.midRunsConceded || 0;
            total.midBallsBowled += s.midBallsBowled || 0;
            
            total.deathRuns += s.deathRuns || 0;
            total.deathBalls += s.deathBalls || 0;
            total.deathWickets += s.deathWickets || 0;
            total.deathRunsConceded += s.deathRunsConceded || 0;
            total.deathBallsBowled += s.deathBallsBowled || 0;

            // Individual ball counts
            total.ones += s.ones || 0;
            total.twos += s.twos || 0;
            total.threes += s.threes || 0;
            total.dots += s.dots || 0;

            // Runs By Position
            if (s.runsByPosition) {
                if (!total.runsByPosition) total.runsByPosition = {};
                Object.entries(s.runsByPosition).forEach(([pos, runs]) => {
                    const pNum = parseInt(pos);
                    total.runsByPosition[pNum] = (total.runsByPosition[pNum] || 0) + (runs as number);
                });
            }

            if (s.bestBowlingWickets > total.bestBowlingWickets || (s.bestBowlingWickets === total.bestBowlingWickets && s.bestBowlingRuns < total.bestBowlingRuns)) {
                total.bestBowlingWickets = s.bestBowlingWickets;
                total.bestBowlingRuns = s.bestBowlingRuns;
                total.bestBowling = s.bestBowling;
            }
        }
    });
    total.average = total.dismissals > 0 ? total.runs / total.dismissals : total.runs;
    total.strikeRate = total.ballsFaced > 0 ? (total.runs / total.ballsFaced) * 100 : 0;
    total.bowlingAverage = total.wickets > 0 ? total.runsConceded / total.wickets : 0; 
    total.economy = total.ballsBowled > 0 ? (total.runsConceded / total.ballsBowled) * 6 : 0;
    return total;
};

export const generateLeagueSchedule = (teams: Team[], format: Format, doubleRoundRobin: boolean = true): Match[] => {
    const matches: Match[] = [];
    if (teams.length < 2) return [];

    if (format === Format.T20_SMASH) {
        // T20 Smash Spec: 2 groups of 8, top 3 advance to Super Six, then top 4 to knockouts
        const rankedTeams = [...teams].sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));
        const groupA: Team[] = []; 
        const groupB: Team[] = []; 

        rankedTeams.forEach((team, index) => {
            if (index % 2 === 0) groupA.push({ ...team, group: 'A' });
            else groupB.push({ ...team, group: 'B' });
        });

        // 1. Group Stage
        const generateGroupSchedule = (groupTeams: Team[], groupName: string) => {
            for (let i = 0; i < groupTeams.length; i++) {
                for (let j = i + 1; j < groupTeams.length; j++) {
                    matches.push({
                        matchNumber: matches.length + 1,
                        teamA: groupTeams[i].name,
                        teamAId: groupTeams[i].id,
                        vs: 'vs',
                        teamB: groupTeams[j].name,
                        teamBId: groupTeams[j].id,
                        date: `${groupName} Rd ${i + j}`,
                        group: groupName as any
                    });
                }
            }
        };
        generateGroupSchedule(groupA, 'Group A');
        generateGroupSchedule(groupB, 'Group B');

        // 2. Super Six League (6 teams: top 3 from A, top 3 from B)
        // We use placeholders and simulate their matches
        const superSixPlaceholders = ['1st A', '2nd A', '3rd A', '1st B', '2nd B', '3rd B'];
        for (let i = 0; i < superSixPlaceholders.length; i++) {
            for (let j = i + 1; j < superSixPlaceholders.length; j++) {
                matches.push({
                    matchNumber: matches.length + 1,
                    teamA: superSixPlaceholders[i],
                    vs: 'vs',
                    teamB: superSixPlaceholders[j],
                    date: `Super Six Rd ${i+j}`,
                    group: 'Super Six' as any
                });
            }
        }

        // 3. Knockouts
        matches.push({ matchNumber: 'SF1', teamA: '1st SS', vs: 'vs', teamB: '4th SS', date: 'Semi-Final', group: 'Semi-Finals' });
        matches.push({ matchNumber: 'SF2', teamA: '2nd SS', vs: 'vs', teamB: '3rd SS', date: 'Semi-Final', group: 'Semi-Finals' });
        matches.push({ matchNumber: 'Final', teamA: 'SF1 Winner', vs: 'vs', teamB: 'SF2 Winner', date: 'Final', group: 'Final' });

        return matches;
    }
    
    // Default Schedule Logic
    const rankedTeams = [...teams].sort((a, b) => (b.overallRating || 0) - (a.overallRating || 0));

    const groupA: Team[] = []; // Odd ranks (1st, 3rd, 5th...)
    const groupB: Team[] = []; // Even ranks (2nd, 4th, 6th...)

    rankedTeams.forEach((team, index) => {
        const rank = index + 1;
        if (rank % 2 !== 0) {
            groupA.push({ ...team, group: 'A' });
        } else {
            groupB.push({ ...team, group: 'B' });
        }
    });

    const generateGroupMatches = (groupTeams: Team[], groupName: string) => {
        let mc = 1;
        for (let i = 0; i < groupTeams.length; i++) {
            for (let j = i + 1; j < groupTeams.length; j++) {
                const addMatches = () => {
                    matches.push({
                        matchNumber: matches.length + 1,
                        teamA: groupTeams[i].name,
                        teamAId: groupTeams[i].id,
                        vs: 'vs',
                        teamB: groupTeams[j].name,
                        teamBId: groupTeams[j].id,
                        date: `${groupName} Rd ${mc}`,
                        group: groupName as any
                    });
                };

                addMatches();
                if (doubleRoundRobin) {
                    matches.push({
                        matchNumber: matches.length + 1,
                        teamA: groupTeams[j].name,
                        teamAId: groupTeams[j].id,
                        vs: 'vs',
                        teamB: groupTeams[i].name,
                        teamBId: groupTeams[i].id,
                        date: `${groupName} Rd ${mc}R`,
                        group: groupName as any
                    });
                }
                mc++;
            }
        }
    };

    generateGroupMatches(groupA, 'Group A');
    generateGroupMatches(groupB, 'Group B');

    // Add play-offs
    matches.push({ matchNumber: 'SF1', teamA: '1st A', vs: 'vs', teamB: '2nd B', date: 'Semi-Final', group: 'Semi-Finals' });
    matches.push({ matchNumber: 'SF2', teamA: '1st B', vs: 'vs', teamB: '2nd A', date: 'Semi-Final', group: 'Semi-Finals' });
    matches.push({ matchNumber: 'Final', teamA: 'SF1 Winner', vs: 'vs', teamB: 'SF2 Winner', date: 'Final', group: 'Final' });

    return matches;
};

export const negotiateSponsorships = (popularity: number): Record<Format, Sponsorship> => {
    const newSponsorships: any = {};
    Object.values(Format).forEach(f => {
        newSponsorships[f] = { ...INITIAL_SPONSORSHIPS[f] || INITIAL_SPONSORSHIPS[Format.T20_SMASH] };
    });
    return newSponsorships;
};

export const generateMatchNews = (result: MatchResult, format: string, sponsorship: Sponsorship): NewsArticle => ({
    id: `news-${Date.now()}`,
    headline: `Match Result: ${result.summary}`,
    date: new Date().toLocaleDateString(),
    excerpt: result.summary,
    content: result.summary,
    type: 'match'
});

export const generatePreMatchNews = (match: Match, gameData: GameData): NewsArticle => ({
    id: `news-pre-${Date.now()}`,
    headline: `Upcoming: ${match.teamA} vs ${match.teamB}`,
    date: new Date().toLocaleDateString(),
    excerpt: "Pre-match report.",
    content: "Analysis incoming.",
    type: 'match'
});

export interface PlayerRanking {
    player: Player;
    points: number;
    teamName: string;
}

export const calculatePlayerRankings = (players: Player[], format: Format, teams: Team[]) => {
    const scoredPlayers = players.map(p => {
        const stats = p.stats[format];
        const points = stats ? (stats.runs * 1) + (stats.wickets * 25) + (stats.manOfTheMatchAwards * 100) : 0;
        return { player: p, points, teamName: teams.find(t => t.squad.some(ps => ps.id === p.id))?.name || 'Free Agent' };
    }).sort((a,b) => b.points - a.points);
    return { batters: scoredPlayers, bowlers: scoredPlayers, allRounders: scoredPlayers };
};

export const calculatePopularityPoints = (result: MatchResult, format: Format, userTeamId: string): number => {
    if (result.winnerId === userTeamId) return 3;
    if (result.isDraw) return 1;
    return 0;
};

export const checkGlobalSquadUniqueness = (teams: Team[]) => {
    const allPlayerIds = new Set<string>();
    const duplicates = new Set<string>();
    teams.forEach(t => {
        if (t.squad) {
            t.squad.forEach(p => {
                if (allPlayerIds.has(p.id)) duplicates.add(p.id);
                allPlayerIds.add(p.id);
            });
        }
    });
    return {
        isValid: duplicates.size === 0,
        duplicates: Array.from(duplicates)
    };
};

export const calculateTeamRatings = (squad: Player[]) => {
    if (!squad || squad.length === 0) return { t20: 0, odi: 0, fc: 0 };
    
    // Sort players by total skill to get the strongest potential XI for each format
    // In a real app, you might want more complex logic (e.g. ensuring a keeper and enough bowlers)
    const top11T20 = [...squad].sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill)).slice(0, 11);
    const top11ODI = [...squad].sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill)).slice(0, 11);
    const top11FC = [...squad].sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill)).slice(0, 11);

    const calcRating = (players: Player[]) => {
        const total = players.reduce((sum, p) => sum + (p.battingSkill + p.secondarySkill), 0);
        return Math.round(total / (players.length * 2));
    };

    const ratings = {
        t20: calcRating(top11T20),
        odi: calcRating(top11ODI),
        fc: calcRating(top11FC)
    };

    const overall = Math.round((ratings.t20 + ratings.odi + ratings.fc) / 3);

    return {
        ...ratings,
        overall
    };
};

export const getBattingStyleLabel = (style: string) => {
    switch (style) {
        case 'A': return 'Aggressive';
        case 'D': return 'Defensive';
        case 'N': return 'Balanced';
        case 'NA': return 'N/A';
        default: return 'Balanced';
    }
};

export const BATTING_STYLE_OPTIONS = ['A', 'D', 'N', 'NA'];

export const hashString = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash);
};

export const getAvatarUrl = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

export const getRoleBorderClass = (role: PlayerRole) => {
    switch (role) {
        case PlayerRole.BATSMAN: return 'border-blue-500/50';
        case PlayerRole.WICKET_KEEPER: return 'border-green-500/50';
        case PlayerRole.ALL_ROUNDER: return 'border-yellow-500/50';
        case PlayerRole.SPIN_BOWLER: return 'border-purple-500/50';
        case PlayerRole.FAST_BOWLER: return 'border-red-500/50';
        default: return 'border-white/10';
    }
};

export const getPerformanceTier = (score: number) => {
    if (score >= 80) return { label: 'Elite', color: 'text-teal-400' };
    if (score >= 60) return { label: 'Strong', color: 'text-blue-400' };
    if (score >= 40) return { label: 'Relay', color: 'text-yellow-400' };
    return { label: 'Struggling', color: 'text-red-400' };
};

export const calculateInjuryProbability = (fitness: number, matchesOut: number = 0) => {
    if (matchesOut > 0) return 0; // Already injured
    const baseProb = 0.02; // Reduced base chance
    if (fitness < 20) return 0.8; // High chance if extremely fatigued
    if (fitness < 40) return 0.4;
    if (fitness < 60) return 0.1;
    return baseProb;
};

export const isTeamonLosingStreak = (teamId: string, format: Format, gameData: GameData): boolean => {
    const results = gameData.matchResults[format] || [];
    const teamResults = results
        .filter(r => r.winnerId === teamId || r.loserId === teamId)
        .slice(-2); // Check last 2 matches
    
    if (teamResults.length < 2) return false;
    return teamResults.every(r => r.loserId === teamId);
};

export const getSmartAILineup = (team: Team, format: Format, group?: string, forceReshuffle: boolean = false) => {
    const squad = [...team.squad];
    
    // 1. Filter out injured players
    const available = squad.filter(p => !p.injury && (p.fitness || 100) >= 30);
    
    // 2. Select the best XI based on Skill + Form + Potential
    // If reshuffling, we put more weight on FORM
    const bestXI = [...available].sort((a, b) => {
        const baseSkillA = Math.max(a.battingSkill, a.secondarySkill);
        const baseSkillB = Math.max(b.battingSkill, b.secondarySkill);
        
        const formMultiplierA = forceReshuffle ? ((a.form || 50) / 40) : ((a.form || 50) / 50);
        const formMultiplierB = forceReshuffle ? ((b.form || 50) / 40) : ((b.form || 50) / 50);

        return (baseSkillB * formMultiplierB) - (baseSkillA * formMultiplierA);
    }).slice(0, 11);

    // 3. Ensure role balance (1 Keeper, at least 5 Bowlers)
    const xi = [...bestXI];
    const bench = available.filter(p => !xi.find(x => x.id === p.id));

    // Ensure Wicket-Keeper
    if (!xi.some(p => p.role === PlayerRole.WICKET_KEEPER)) {
        const bestBKeeper = [...available].sort((a,b) => b.battingSkill - a.battingSkill).find(p => p.role === PlayerRole.WICKET_KEEPER);
        if (bestBKeeper) {
            // Find lowest rated player in XI to replace
            const lowestIdx = xi.reduce((minIdx, p, idx, arr) => 
                Math.max(p.battingSkill, p.secondarySkill) < Math.max(arr[minIdx].battingSkill, arr[minIdx].secondarySkill) ? idx : minIdx, 0);
            xi[lowestIdx] = bestBKeeper;
        }
    }

    // Ensure 5 Bowlers
    const getBowlersCount = (list: Player[]) => list.filter(p => [PlayerRole.ALL_ROUNDER, PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER].includes(p.role)).length;
    const bowlersCount = getBowlersCount(xi);
    
    if (bowlersCount < 5) {
        const potentialBowlers = available
            .filter(p => !xi.some(x => x.id === p.id) && [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(p.role))
            .sort((a,b) => b.secondarySkill - a.secondarySkill);

        for (let i = 0; i < 5 - bowlersCount; i++) {
            if (potentialBowlers[i]) {
                const lowestNonBowlerIdx = xi.findIndex(p => p.role === PlayerRole.BATSMAN);
                if (lowestNonBowlerIdx !== -1) {
                    xi[lowestNonBowlerIdx] = potentialBowlers[i];
                }
            }
        }
    }

    // 4. Proper Batting Order Sorting
    return xi.sort((a, b) => {
        const getOrderRank = (p: Player) => {
            if (p.isOpener) return 1;
            if (p.role === PlayerRole.BATSMAN) return 2;
            if (p.role === PlayerRole.WICKET_KEEPER) return 3;
            if (p.role === PlayerRole.ALL_ROUNDER) return 4;
            return 5; // Bowlers at the bottom
        };

        const rankA = getOrderRank(a);
        const rankB = getOrderRank(b);

        if (rankA !== rankB) return rankA - rankB;
        
        // Within same rank, sort by batting skill
        return b.battingSkill - a.battingSkill;
    });
};

export const simulateInjuries = (gameData: GameData, result: MatchResult): GameData => {
    const newData = { ...gameData };
    
    // Update Fitness and Form for all players in match
    const updateStats = (perfs: { playerId: string, balls?: number, ballsBowled?: number, runs?: number, wickets?: number }[]) => {
        perfs.forEach(p => {
            const pIdx = newData.allPlayers.findIndex(ap => ap.id === p.playerId);
            if (pIdx !== -1) {
                const player = newData.allPlayers[pIdx];
                
                // Fatigue calculation
                const workload = (p.balls || 0) + (p.ballsBowled || 0);
                const fitnessLoss = Math.floor(workload / 10) + (workload > 120 ? 10 : 0);
                const newFitness = Math.max(0, (player.fitness || 100) - fitnessLoss);

                // Form calculation
                const performance = (p.runs || 0) + (p.wickets || 0) * 20;
                let formChange = 0;
                if (performance > 50) formChange = 10;
                else if (performance < 10) formChange = -10;
                const newForm = Math.max(0, Math.min(100, (player.form || 50) + formChange));

                // Natural recovery for others
                newData.allPlayers[pIdx] = { 
                    ...player, 
                    fitness: newFitness, 
                    form: newForm,
                    stamina: Math.max(0, (player.stamina || 100) - fitnessLoss)
                };

                // Check for random injury based on fatigue
                const injuryProb = calculateInjuryProbability(newFitness);
                if (Math.random() < injuryProb * 0.1) {
                    newData.allPlayers[pIdx].injury = {
                        type: ['Torn ACL', 'Hamstring', 'Back Strain', 'Fracture'][Math.floor(Math.random() * 4)],
                        matchesOut: Math.floor(Math.random() * 5) + 1,
                        isSeasonEnding: Math.random() < 0.05
                    };
                    newData.allPlayers[pIdx].fitness = 30; // Mark as injured
                }
            }
        });
    };

    const firstInnPerfs = [
        ...result.firstInning.batting.map(b => ({ playerId: b.playerId, balls: b.balls, runs: b.runs })),
        ...result.firstInning.bowling.map(b => ({ playerId: b.playerId, ballsBowled: b.ballsBowled * 6, wickets: b.wickets }))
    ];
    const secondInnPerfs = [
        ...result.secondInning.batting.map(b => ({ playerId: b.playerId, balls: b.balls, runs: b.runs })),
        ...result.secondInning.bowling.map(b => ({ playerId: b.playerId, ballsBowled: b.ballsBowled * 6, wickets: b.wickets }))
    ];

    updateStats(firstInnPerfs);
    updateStats(secondInnPerfs);

    // Natural recovery for players NOT in match
    const playedIds = new Set([...firstInnPerfs, ...secondInnPerfs].map(p => p.playerId));
    newData.allPlayers.forEach((p, idx) => {
        if (!playedIds.has(p.id)) {
            newData.allPlayers[idx] = {
                ...p,
                fitness: Math.min(100, (p.fitness || 100) + 15),
                stamina: Math.min(100, (p.stamina || 100) + 15)
            };
            if (p.injury) {
                const newMatchesOut = p.injury.matchesOut - 1;
                if (newMatchesOut <= 0) {
                    delete newData.allPlayers[idx].injury;
                    newData.allPlayers[idx].fitness = 70;
                } else {
                    newData.allPlayers[idx].injury = { ...p.injury, matchesOut: newMatchesOut };
                }
            }
        }
    });

    return newData;
};

/**
 * Determines phase-specific mastery tags for a player based on their stats
 */
export const getPlayerPhaseTags = (stats: PlayerStats): string[] => {
    const tags: string[] = [];
    
    // Batting Tags
    const ppSR = stats.ppBalls > 12 ? (stats.ppRuns / stats.ppBalls) * 100 : 0;
    const midSR = stats.midBalls > 12 ? (stats.midRuns / stats.midBalls) * 100 : 0;
    const deathSR = stats.deathBalls > 12 ? (stats.deathRuns / stats.deathBalls) * 100 : 0;
    const midAvg = stats.midBalls > 30 ? stats.midRuns / Math.max(1, stats.dismissals * 0.4) : 0; // rough estimation

    if (ppSR > 145) tags.push('Powerplay Master');
    if (midAvg > 45) tags.push('Middle Overs Anchor');
    if (deathSR > 180) tags.push('Death Overs Finisher');

    // Bowling Tags
    const ppEco = stats.ppBallsBowled > 12 ? (stats.ppRunsConceded / stats.ppBallsBowled) * 6 : 99;
    const deathEco = stats.deathBallsBowled > 12 ? (stats.deathRunsConceded / stats.deathBallsBowled) * 6 : 99;
    const deathWktsScale = stats.deathWickets / Math.max(1, stats.matches);

    if (ppEco < 7.0 && stats.ppBallsBowled > 30) tags.push('PP Specialist');
    if (deathEco < 9.0 && stats.deathBallsBowled > 30) tags.push('Death Bowler');
    if (deathWktsScale > 0.5) tags.push('Death Wicket Taker');

    return tags;
};

export const updateAISquads = (gameData: GameData): GameData => {
    const newData = { ...gameData };
    const userTeamId = gameData.userTeamId;

    // We update the global playingXIs in GameData
    newData.teams.forEach(team => {
        if (team.id === userTeamId) return;
        
        const losingStreak = isTeamonLosingStreak(team.id, gameData.currentFormat, newData);
        const smartLineup = getSmartAILineup(team, gameData.currentFormat, team.group, losingStreak);
        const playingXIIds = smartLineup.map(p => p.id);
        
        if (!newData.playingXIs[team.id]) newData.playingXIs[team.id] = {};
        newData.playingXIs[team.id]![gameData.currentFormat] = playingXIIds;
    });

    return newData;
};

export const generateReplacementPlayer = (skillValue: number, role: PlayerRole, nationality: string): Player => {
    const id = `player-gen-${Date.now()}`;
    return {
        id,
        name: 'New Talent',
        nationality: nationality || 'Pakistan',
        role: role || PlayerRole.BATSMAN,
        battingSkill: skillValue,
        secondarySkill: 50,
        style: 'N',
        isOpener: false,
        isForeign: false,
        teamName: 'Unknown',
        stats: generateInitialStats(),
        recentPerformances: []
    } as any as Player;
};

export const validateMatchPlan = (playingXI: string[], squad: Player[]) => {
    if (playingXI.length !== 11) return { isValid: false, reason: 'Must select 11 players.' };
    const players = playingXI.map(id => squad.find(p => p.id === id)).filter(Boolean) as Player[];
    if (players.length !== 11) return { isValid: false, reason: 'Some selected players not in squad.' };
    
    const keeper = players.find(p => p.role === PlayerRole.WICKET_KEEPER);
    if (!keeper) return { isValid: false, reason: 'Must have at least 1 Wicket-Keeper.' };

    const bowlers = players.filter(p => [PlayerRole.ALL_ROUNDER, PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER].includes(p.role));
    if (bowlers.length < 5) return { isValid: false, reason: 'Must have at least 5 bowling options.' };

    return { isValid: true };
};
