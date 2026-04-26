
import { useState, useEffect, useCallback, useRef } from 'react';
import { GameData, Match, Player, Format, Team, Inning, MatchResult, PlayerRole, BattingPerformance, BowlingPerformance, Strategy, LiveMatchState } from '../types';
import { PITCH_MODIFIERS, formatOvers, getPlayerById, generateAutoXI, getBatterTier, BATTING_PROFILES, getCommentary, generateAutoBowlingPlan } from '../utils';

export const useLiveMatch = (
    match: Match,
    gameData: GameData,
    onMatchComplete: (result: MatchResult) => void,
    initialState?: LiveMatchState | null
) => {
    const [state, setState] = useState<LiveMatchState | null>(initialState || null);
    const matchIdRef = useRef<string | number | null>(initialState ? initialState.match.matchNumber : null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null); 
    const [allPlayers, setAllPlayers] = useState<Player[]>([]);
    const [groundPitch, setGroundPitch] = useState("Balanced Sporting Pitch");
    const [groundCode, setGroundCode] = useState("KCG");

    // Initialization
    useEffect(() => {
        if (state) {
             // Restore players context if resuming
             const teamAData = gameData.teams.find(t => t.id === state.match.teamAId) || gameData.teams.find(t => t.name === state.match.teamA);
             const teamBData = gameData.teams.find(t => t.id === state.match.teamBId) || gameData.teams.find(t => t.name === state.match.teamB);
             
             if (teamAData && teamBData) {
                 const allP = [...teamAData.squad, ...teamBData.squad];
                 // Hydrate full player objects
                 const hydratedPlayers = allP.map(p => gameData.allPlayers.find(gp => gp.id === p.id) || p);
                 setAllPlayers(hydratedPlayers);
             }
             return;
        }

        if (matchIdRef.current === match.matchNumber) return;

        const teamAData = gameData.teams.find(t => t.name === match.teamA);
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        
        if (!teamAData || !teamBData) {
            console.error("Teams not found for live match:", match.teamA, match.teamB);
            return;
        }

        const getPlayingXI = (team: Team) => {
            const customXI = gameData.playingXIs?.[team.id]?.[gameData.currentFormat];
            if (customXI && customXI.length === 11) {
                const xiPlayers = customXI.map(id => team.squad.find(p => p.id === id)).filter(Boolean) as Player[];
                if (xiPlayers.length === 11) return xiPlayers;
            }
            return generateAutoXI(team.squad, gameData.currentFormat);
        };

        const teamAPlayers = getPlayingXI(teamAData);
        const teamBPlayers = getPlayingXI(teamBData);
        const matchPlayers = [...teamAPlayers, ...teamBPlayers];
        setAllPlayers(matchPlayers);

        const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround);
        setGroundPitch(homeGround?.pitch || "Balanced Sporting Pitch");
        setGroundCode(homeGround?.code || "KCG");

        const initInning = (team: Team, opponent: Team): Inning => {
            const battingLineup: BattingPerformance[] = team.squad.map((p, i) => {
                const d = getPlayerById(p.id, matchPlayers);
                return { 
                    playerId: d.id, playerName: d.name, runs: 0, balls: 0, fours: 0, sixes: 0, 
                    isOut: false, dismissalText: 'not out', dismissal: { type: 'not out', bowlerId: '' }, 
                    battingOrder: i + 1,
                    ppRuns: 0, ppBalls: 0, midRuns: 0, midBalls: 0, deathRuns: 0, deathBalls: 0,
                    ones: 0, twos: 0, threes: 0, dots: 0
                };
            });
            
            const bowlingLineup: BowlingPerformance[] = opponent.squad
                .filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(getPlayerById(p.id, matchPlayers).role))
                .map(p => {
                     const d = getPlayerById(p.id, matchPlayers);
                     return { 
                        playerId: d.id, playerName: d.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0,
                        ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                     };
                });

            if (bowlingLineup.length === 0) {
                 const p = getPlayerById(opponent.squad[0].id, matchPlayers);
                 bowlingLineup.push({ 
                    playerId: p.id, playerName: p.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0,
                    ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                 });
            }

            return {
                teamId: team.id,
                teamName: team.name,
                score: 0,
                wickets: 0,
                overs: '0.0',
                batting: battingLineup,
                bowling: bowlingLineup,
                extras: 0
            };
        };

        const teamA = { ...teamAData, squad: teamAPlayers };
        const teamB = { ...teamBData, squad: teamBPlayers };
        
        const firstInning = initInning(teamA, teamB);
        const secondInning = initInning(teamB, teamA);
        
        matchIdRef.current = match.matchNumber;
        
        setState({
            status: 'toss',
            match: { ...match, teamAId: teamA.id, teamBId: teamB.id }, // Ensure IDs are set
            currentInningIndex: 0,
            innings: [firstInning, secondInning],
            target: null,
            currentBatters: { strikerId: teamAPlayers[0].id, nonStrikerId: teamAPlayers[1].id },
            currentBowlerId: secondInning.bowling[0].playerId, 
            recentBalls: [],
            commentary: ["Welcome to the live coverage!", "The players are walking out to the middle."],
            battingTeam: teamA,
            bowlingTeam: teamB,
            requiredRunRate: 0,
            currentPartnership: { runs: 0, balls: 0 },
            fallOfWickets: [],
            waitingFor: 'openers',
            strategies: { batting: 'balanced', bowling: 'balanced' },
            autoPlayType: null,
            tossWinnerId: null,
            tossDecision: null,
        });

    }, [match, gameData, state]);

    const startMatch = (winnerId: string, decision: 'bat' | 'bowl') => {
        console.log("startMatch called with:", winnerId, decision);
        setState((prev: LiveMatchState | null) => {
            if (!prev) {
                console.error("startMatch: prev state is null");
                return null;
            }
            console.log("startMatch: updating state to ready");
            // Determine who bats first
            let battingTeam, bowlingTeam;
            const teamA = prev.battingTeam.id === prev.match.teamAId ? prev.battingTeam : prev.bowlingTeam;
            const teamB = prev.battingTeam.id === prev.match.teamBId ? prev.battingTeam : prev.bowlingTeam;

            if (winnerId === teamA.id) {
                battingTeam = decision === 'bat' ? teamA : teamB;
                bowlingTeam = decision === 'bat' ? teamB : teamA;
            } else {
                battingTeam = decision === 'bat' ? teamB : teamA;
                bowlingTeam = decision === 'bat' ? teamA : teamB;
            }

            // Re-initialize innings with correct order
            const initInning = (team: Team, opponent: Team): Inning => {
                const battingLineup: BattingPerformance[] = team.squad.map((p, i) => {
                    const d = getPlayerById(p.id, allPlayers);
                    return { 
                        playerId: d.id, playerName: d.name, runs: 0, balls: 0, fours: 0, sixes: 0, 
                        isOut: false, dismissalText: 'not out', dismissal: { type: 'not out', bowlerId: '' }, 
                        battingOrder: i + 1,
                        ppRuns: 0, ppBalls: 0, midRuns: 0, midBalls: 0, deathRuns: 0, deathBalls: 0,
                        ones: 0, twos: 0, threes: 0, dots: 0
                    };
                });
                
                const bowlingLineup: BowlingPerformance[] = opponent.squad
                    .filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(getPlayerById(p.id, allPlayers).role))
                    .map(p => {
                         const d = getPlayerById(p.id, allPlayers);
                         return { 
                            playerId: d.id, playerName: d.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0,
                            ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                         };
                    });

                if (bowlingLineup.length === 0) {
                     const p = getPlayerById(opponent.squad[0].id, allPlayers);
                     bowlingLineup.push({ 
                        playerId: p.id, playerName: p.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0,
                        ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                     });
                }

                return {
                    teamId: team.id,
                    teamName: team.name,
                    score: 0,
                    wickets: 0,
                    overs: '0.0',
                    batting: battingLineup,
                    bowling: bowlingLineup,
                    extras: 0
                };
            };

            const firstInning = initInning(battingTeam, bowlingTeam);
            const secondInning = initInning(bowlingTeam, battingTeam);
            let innings = [firstInning, secondInning];

            if (gameData.currentFormat === Format.SHIELD) {
                const thirdInning = initInning(battingTeam, bowlingTeam);
                const fourthInning = initInning(bowlingTeam, battingTeam);
                innings = [firstInning, secondInning, thirdInning, fourthInning];
            }

            // Auto-select initial batters and bowler for AI
            const openers = { strikerId: firstInning.batting[0].playerId, nonStrikerId: firstInning.batting[1].playerId };
            const bowlerId = firstInning.bowling[0].playerId;
            let waitingFor: LiveMatchState['waitingFor'] = null;
            
            const isUserBatting = battingTeam.id === gameData.userTeamId;
            if (isUserBatting) {
                waitingFor = 'openers';
            } else {
                // AI starts: Defaults already set above
                if (bowlingTeam.id === gameData.userTeamId) {
                    waitingFor = 'bowler';
                }
            }

            const initialBowlingPlan = generateAutoBowlingPlan(bowlingTeam.squad, gameData.currentFormat);

            return {
                ...prev,
                status: 'ready',
                tossWinnerId: winnerId,
                tossDecision: decision,
                battingTeam,
                bowlingTeam,
                innings,
                currentInningIndex: 0,
                currentBatters: openers,
                currentBowlerId: bowlerId,
                waitingFor: waitingFor,
                autoPlayType: null, 
                bowlingPlan: initialBowlingPlan,
                commentary: [
                    `Match Started!`,
                    `${winnerId === teamA.id ? teamA.name : teamB.name} won the toss and elected to ${decision}.`,
                    ...prev.commentary
                ]
            };
        });
    };

    const playBall = useCallback(() => {
        setState((prevState: LiveMatchState | null) => {
            if (!prevState || prevState.status === 'completed') {
                 stopAutoPlay();
                 return prevState;
            }
            
            if (prevState.waitingFor) {
                // If in match simulation mode, force selection
                if (prevState.autoPlayType === 'match') {
                    // Fallthrough to auto-select logic below...
                } else {
                    stopAutoPlay();
                    return prevState;
                }
            }
            
            // Create a performance-friendly shallow clone
            const newState = { ...prevState };
            newState.innings = [...prevState.innings];
            newState.innings[prevState.currentInningIndex] = { ...prevState.innings[prevState.currentInningIndex] };
            const currentInning = newState.innings[newState.currentInningIndex];
            
            // Shallow clone nested arrays we plan to modify
            currentInning.batting = [...currentInning.batting];
            currentInning.bowling = [...currentInning.bowling];
            
            const { currentInningIndex, innings, battingTeam, bowlingTeam, currentBatters, currentBowlerId, target, strategies } = newState;
            
            const pitchMods = PITCH_MODIFIERS[groundPitch as keyof typeof PITCH_MODIFIERS] || PITCH_MODIFIERS["Balanced Sporting Pitch"];
            const formatMods = pitchMods[gameData.currentFormat] || pitchMods[Format.T20_SMASH];
            
            const strikerIdx = currentInning.batting.findIndex(b => b.playerId === currentBatters.strikerId);
            const nonStrikerIdx = currentInning.batting.findIndex(b => b.playerId === currentBatters.nonStrikerId);
            const bowlerIdx = currentInning.bowling.findIndex(b => b.playerId === currentBowlerId);

            // Ensure indices are valid
            if (strikerIdx === -1 || bowlerIdx === -1) {
                stopAutoPlay();
                return prevState;
            }

            // Clone the specific performance objects
            currentInning.batting[strikerIdx] = { ...currentInning.batting[strikerIdx] };
            if (nonStrikerIdx !== -1) currentInning.batting[nonStrikerIdx] = { ...currentInning.batting[nonStrikerIdx] };
            currentInning.bowling[bowlerIdx] = { ...currentInning.bowling[bowlerIdx] };

            let striker = currentInning.batting[strikerIdx];
            let bowler = currentInning.bowling[bowlerIdx];
            
            // --- EMERGENCY AUTO-SELECT FOR MATCH SIMULATION ---
            if (newState.autoPlayType === 'match') {
                if (!striker) {
                    // Pick next available batter
                    const nextB = currentInning.batting.find(b => !b.isOut && b.playerId !== currentBatters.nonStrikerId);
                    if (nextB) {
                        newState.currentBatters.strikerId = nextB.playerId;
                        striker = nextB;
                        newState.waitingFor = null;
                    }
                }
                if (!bowler) {
                    // Pick next available bowler
                    const nextBowler = currentInning.bowling.find(b => b.ballsBowled < (gameData.currentFormat.includes('T20') ? 24 : 60));
                    if (nextBowler) {
                        newState.currentBowlerId = nextBowler.playerId;
                        bowler = nextBowler;
                        newState.waitingFor = null;
                    }
                }
            }

            if (!striker || !bowler) {
                 stopAutoPlay();
                 return newState;
            }

            const strikerDetails = getPlayerById(currentBatters.strikerId, allPlayers);
            const bowlerDetails = getPlayerById(currentBowlerId, allPlayers);

            // --- SKILL BASED PENALTIES ---
            // Bowlers with low skill (secondarySkill < 40) are more prone to extras and boundaries
            const lowSkillBowler = bowlerDetails.secondarySkill < 40;
            const extraChance = lowSkillBowler ? 0.08 : 0.03; // Chance for Wide or No Ball
            
            let runs = 0;
            let isOut = false;
            let ballLabel = "";
            let commentary = "";
            let isExtra = false;

            if (Math.random() < extraChance) {
                isExtra = true;
                const isWide = Math.random() > 0.3; // 70% chance it's a wide
                runs = 1; // 1 run for the extra
                currentInning.score += runs;
                currentInning.extras += runs;
                bowler.runsConceded += runs;
                // Note: Balls bowled doesn't increment for wides/no-balls in most formats for the bowler's over count, 
                // but for simplicity we'll follow standard rules: ballsBowled stays same, score increases.
                
                ballLabel = isWide ? "wd" : "nb";
                commentary = isWide 
                    ? `${bowlerDetails.name} bowls a wide. Down the leg side.` 
                    : `${bowlerDetails.name} oversteps. No ball! Free hit (if applicable).`;
                
                newState.recentBalls = [ballLabel, ...newState.recentBalls].slice(0, 12);
                newState.commentary = [commentary, ...newState.commentary].slice(0, 50);
                
                // Don't proceed with normal ball logic
                return newState;
            }

            // AI Strategy
            const isUserBatting = battingTeam.id === gameData.userTeamId;
            if (!isUserBatting) {
                const runsNeeded = target ? target - currentInning.score : 0;
                const ballsLeft = (gameData.currentFormat.includes('T20') ? 120 : 300) - (currentInning.bowling.reduce((a,b)=>a+b.ballsBowled,0));
                if (target && (runsNeeded / (ballsLeft/6)) > 8) strategies.batting = 'attacking';
                else if (target && (runsNeeded / (ballsLeft/6)) < 4) strategies.batting = 'defensive';
                else strategies.batting = Math.random() > 0.7 ? 'attacking' : 'balanced';
            }
            
            if (battingTeam.id !== gameData.userTeamId && bowlingTeam.id === gameData.userTeamId) {
                 const recentWickets = newState.fallOfWickets.filter(w => w.score > currentInning.score - 20).length;
                 if (recentWickets > 0) strategies.bowling = 'attacking';
                 else if ((currentInning.score / (parseFloat(currentInning.overs)||1)) > 10) strategies.bowling = 'defensive';
                 else strategies.bowling = 'balanced';
            }

            let strategyRunMod = 1.0;
            let strategyWicketMod = 1.0;

            if (strategies.batting === 'attacking') { strategyRunMod *= 1.5; strategyWicketMod *= 1.2; }
            else if (strategies.batting === 'defensive') { strategyRunMod *= 0.7; strategyWicketMod *= 0.6; }

            if (strategies.bowling === 'attacking') { strategyWicketMod *= 1.2; strategyRunMod *= 1.3; } 
            else if (strategies.bowling === 'defensive') { strategyWicketMod *= 0.8; strategyRunMod *= 0.8; }

            const batterProfile = getPlayerById(striker.playerId, allPlayers).customProfiles?.[gameData.currentFormat] || BATTING_PROFILES[gameData.currentFormat][getBatterTier(strikerDetails.battingSkill)][strikerDetails.style] || BATTING_PROFILES[gameData.currentFormat]['tier3']['N'];
            
            const expectedRunsPerBall = (batterProfile.sr / 100) * (target !== null ? pitchMods.chasePenalty : 1) * strategyRunMod;
            const baseWicketProb = (batterProfile.avg > 0 ? expectedRunsPerBall / batterProfile.avg : 0.05) * strategyWicketMod;
            let wicketProbability = baseWicketProb * formatMods.wicketChance;
            
            // Low skill bowler penalty: harder to get wickets, easier to concede boundaries
            if (lowSkillBowler) {
                wicketProbability *= 0.8;
            }

            const currentOvers = currentInning.bowling.reduce((a,b)=>a+b.ballsBowled,0) / 6;
            const isT20 = gameData.currentFormat.includes('T20');
            const isODI = gameData.currentFormat.includes('ODI');
            const isPowerplay = isT20 && currentOvers < 6;
            const isDeathOvers = isT20 && currentOvers >= 15;

            // Reduce wicket probability if score is too low to prevent sub-100 scores
            if (isT20 && currentInning.score < 100 && currentOvers > 12) {
                wicketProbability *= 0.6;
            } else if (isODI && currentInning.score < 150 && currentOvers > 35) {
                wicketProbability *= 0.6;
            }

            wicketProbability = Math.max(0.005, Math.min(0.5, wicketProbability));

            runs = 0;
            isOut = false;
            ballLabel = "";
            commentary = "";

            if (Math.random() < wicketProbability) {
                isOut = true;
                ballLabel = "W";
                commentary = getCommentary(0, true, strikerDetails.name, bowlerDetails.name);
            } else {
                const rand = Math.random();
                let p_dot=0.4, p_1=0.35, p_2=0.1, p_3=0.03, p_4=0.08, p_6=0.04;
                
                if (isT20) {
                    p_dot = 0.35; p_1 = 0.35; p_2 = 0.08; p_3 = 0.02; p_4 = 0.12; p_6 = 0.08;
                    if (isPowerplay) {
                        p_dot = 0.40; p_1 = 0.25; p_4 = 0.20; p_6 = 0.10;
                    } else if (isDeathOvers) {
                        p_dot = 0.25; p_1 = 0.30; p_4 = 0.20; p_6 = 0.20;
                    }
                } else if (isODI) {
                    p_dot = 0.45; p_1 = 0.40; p_2 = 0.05; p_3 = 0.02; p_4 = 0.06; p_6 = 0.02;
                }

                if (strategies.batting === 'attacking') { 
                    p_dot *= 0.7; p_1 *= 0.9; p_4 *= 1.5; p_6 *= 1.8; 
                }
                if (strategies.batting === 'defensive') { 
                    p_dot *= 1.3; p_4 *= 0.5; p_6 *= 0.2; 
                }

                // Low skill bowler penalty: more boundaries
                if (lowSkillBowler) {
                    p_4 *= 1.4;
                    p_6 *= 1.4;
                    p_dot *= 0.8;
                }

                const totalP = p_dot+p_1+p_2+p_3+p_4+p_6;
                const normalizedRand = rand * totalP;

                if (normalizedRand < p_dot) runs = 0;
                else if (normalizedRand < p_dot+p_1) runs = 1;
                else if (normalizedRand < p_dot+p_1+p_2) runs = 2;
                else if (normalizedRand < p_dot+p_1+p_2+p_3) runs = 3;
                else if (normalizedRand < p_dot+p_1+p_2+p_3+p_4) runs = 4;
                else runs = 6;
                
                ballLabel = runs.toString();
                commentary = getCommentary(runs, false, strikerDetails.name, bowlerDetails.name);
            }

            currentInning.score += runs;
            bowler.runsConceded += runs;
            bowler.ballsBowled++;
            striker.runs += runs;
            striker.balls++;
            newState.currentPartnership.runs += runs;
            newState.currentPartnership.balls++;

            // Phase tracking
            const totalBallsInInning = currentInning.bowling.reduce((acc, b) => acc + (b.ballsBowled || 0), 0);
            const currentOverNum = Math.floor((totalBallsInInning - 1) / 6) + 1;
            const fmt = gameData.currentFormat.toLowerCase();
            const isT20Sim = fmt.includes('t20') || fmt.includes('t10') || fmt.includes('hundred');
            const isODISim = fmt.includes('odi') || fmt.includes('one-day');
            const isShieldSim = fmt.includes('shield') || fmt.includes('fc') || fmt.includes('first-class') || fmt.includes('test');
            
            let phase: 'PP' | 'MID' | 'DEATH' | null = 'MID';
            if (isT20Sim) {
                if (currentOverNum <= 6) phase = 'PP';
                else if (currentOverNum >= 16) phase = 'DEATH';
            } else if (isODISim) {
                if (currentOverNum <= 10) phase = 'PP';
                else if (currentOverNum >= 41) phase = 'DEATH';
            } else if (isShieldSim) {
                phase = null; 
            }

            if (phase === 'PP') {
                striker.ppRuns = (striker.ppRuns || 0) + runs;
                striker.ppBalls = (striker.ppBalls || 0) + 1;
                bowler.ppRuns = (bowler.ppRuns || 0) + runs;
                bowler.ppBalls = (bowler.ppBalls || 0) + 1;
            } else if (phase === 'MID') {
                striker.midRuns = (striker.midRuns || 0) + runs;
                striker.midBalls = (striker.midBalls || 0) + 1;
                bowler.midRuns = (bowler.midRuns || 0) + runs;
                bowler.midBalls = (bowler.midBalls || 0) + 1;
            } else if (phase === 'DEATH') {
                striker.deathRuns = (striker.deathRuns || 0) + runs;
                striker.deathBalls = (striker.deathBalls || 0) + 1;
                bowler.deathRuns = (bowler.deathRuns || 0) + runs;
                bowler.deathBalls = (bowler.deathBalls || 0) + 1;
            }

            if (runs === 0 && !isOut) striker.dots = (striker.dots || 0) + 1;
            if (runs === 1) striker.ones = (striker.ones || 0) + 1;
            if (runs === 2) striker.twos = (striker.twos || 0) + 1;
            if (runs === 3) striker.threes = (striker.threes || 0) + 1;
            if (runs === 4) striker.fours = (striker.fours || 0) + 1;
            if (runs === 6) striker.sixes = (striker.sixes || 0) + 1;

            if (isOut) {
                currentInning.wickets++;
                bowler.wickets++;
                
                if (phase === 'PP') bowler.ppWickets = (bowler.ppWickets || 0) + 1;
                else if (phase === 'MID') bowler.midWickets = (bowler.midWickets || 0) + 1;
                else if (phase === 'DEATH') bowler.deathWickets = (bowler.deathWickets || 0) + 1;

                striker.isOut = true;
                striker.dismissalText = `b ${bowlerDetails.name}`;
                
                newState.fallOfWickets.push({
                    score: currentInning.score,
                    wicket: currentInning.wickets,
                    over: formatOvers(bowler.ballsBowled + (parseInt(currentInning.overs.split('.')[0]) * 6)),
                    player: strikerDetails.name
                });

                if (currentInning.wickets < 10) {
                     const isUserBattingNow = battingTeam.id === gameData.userTeamId;
                     if (isUserBattingNow && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                         newState.waitingFor = 'batter'; 
                         stopAutoPlay();
                     } else {
                         // Auto Select Batter
                         const nextBatter = currentInning.batting.find(b => !b.isOut && b.playerId !== currentBatters.strikerId && b.playerId !== currentBatters.nonStrikerId);
                         if (nextBatter) {
                             newState.currentBatters.strikerId = nextBatter.playerId;
                             newState.commentary.unshift(`${nextBatter.playerName} comes to the crease.`);
                         }
                     }
                }
            } else {
                if (runs % 2 !== 0) {
                    const temp = currentBatters.strikerId;
                    currentBatters.strikerId = currentBatters.nonStrikerId;
                    currentBatters.nonStrikerId = temp;
                }
            }

            newState.recentBalls = [ballLabel, ...newState.recentBalls].slice(0, 12);
            newState.commentary = [commentary, ...newState.commentary].slice(0, 50);

            const totalBalls = innings[currentInningIndex].bowling.reduce((acc, b) => acc + b.ballsBowled, 0);
            currentInning.overs = formatOvers(totalBalls);
            bowler.overs = formatOvers(bowler.ballsBowled);

            const maxOvers = (gameData.currentFormat.includes('T20')) ? 20 : (gameData.currentFormat.includes('ODI') || gameData.currentFormat.includes('List')) ? 50 : 90;
            const maxBalls = maxOvers * 6;

            // End of Over Logic
            if (totalBalls % 6 === 0 && totalBalls < maxBalls) { 
                if (!isOut) {
                    const temp = currentBatters.strikerId;
                    currentBatters.strikerId = currentBatters.nonStrikerId;
                    currentBatters.nonStrikerId = temp;
                }
                
                newState.commentary.unshift(`End of over ${totalBalls/6}. ${battingTeam.name} are ${currentInning.score}/${currentInning.wickets}.`);
                
                if (currentInning.wickets < 10) {
                     const isUserBowlingNow = bowlingTeam.id === gameData.userTeamId;
                     if (isUserBowlingNow && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                         // Don't overwrite waitingFor if we're already waiting for a batter
                         if (newState.waitingFor !== 'batter') {
                            newState.waitingFor = 'bowler';
                            stopAutoPlay(); 
                         }
                     } else {
                         // Auto Select Bowler (Either AI or for full auto sim)
                         const overLimit = (gameData.currentFormat.includes('T20') ? 4 : 10);
                         const validBowlers = currentInning.bowling.filter(b => b.playerId !== currentBowlerId && b.ballsBowled < overLimit * 6);
                         
                         let nextBowler = validBowlers.sort((a,b) => {
                             const pa = getPlayerById(a.playerId, allPlayers);
                             const pb = getPlayerById(b.playerId, allPlayers);
                             return pb.secondarySkill - pa.secondarySkill;
                         })[0];

                         if (!nextBowler) {
                             nextBowler = currentInning.bowling.find(b => b.playerId !== currentBowlerId) || currentInning.bowling[0];
                         }

                         if (nextBowler) {
                            newState.currentBowlerId = nextBowler.playerId;
                            newState.commentary.unshift(`${nextBowler.playerName} will bowl the next over.`);
                         }
                     }
                }
            }

            let matchEnded = false;
            let resultText = "";

            const isShield = gameData.currentFormat === Format.SHIELD;
            const isInningEnd = currentInning.wickets >= 10 || totalBalls >= maxBalls || currentInning.declared || (target !== null && currentInning.score > target);

            if (isInningEnd) {
                newState.waitingFor = null;
                if (newState.autoPlayType !== 'match') stopAutoPlay();
                
                // Save fall of wickets to the inning object
                currentInning.fallOfWickets = [...newState.fallOfWickets];
                newState.fallOfWickets = []; // Clear for next inning

                const nextInningIndex = currentInningIndex + 1;
                const isLastInning = nextInningIndex >= innings.length;
                const isTargetReached = target !== null && currentInning.score > target;

                // Check for Innings Victory in Shield
                let isInningsVictory = false;
                if (isShield) {
                    if (currentInningIndex === 2 && newState.followOn) {
                        // Team B (batting 3rd after follow-on) is all out and still trails Team A's 1st inning score
                        if (innings[2].score + innings[1].score < innings[0].score && currentInning.wickets >= 10) {
                            isInningsVictory = true;
                        }
                    } else if (currentInningIndex === 2 && !newState.followOn) {
                         // Team A (batting 3rd) is all out and still trails Team B's 1st inning score
                         if (innings[0].score + innings[2].score < innings[1].score && currentInning.wickets >= 10) {
                             isInningsVictory = true;
                         }
                    }
                }

                if (isLastInning || isTargetReached || isInningsVictory) {
                    newState.status = 'completed';
                    matchEnded = true;
                    
                    if (isShield) {
                        const teamAScore = innings[0].score + (newState.followOn ? 0 : (innings[2]?.score || 0));
                        const teamBScore = innings[1].score + (newState.followOn ? (innings[2]?.score || 0) : (innings[3]?.score || 0));
                        
                        if (isInningsVictory) {
                            const winner = (currentInningIndex === 2 && newState.followOn) ? bowlingTeam.name : bowlingTeam.name;
                            const margin = (currentInningIndex === 2 && newState.followOn) ? (innings[0].score - (innings[1].score + innings[2].score)) : (innings[1].score - (innings[0].score + innings[2].score));
                            resultText = `${winner} won by an inning and ${margin} runs`;
                        } else if (teamAScore > teamBScore) {
                            resultText = `${innings[0].teamName} won by ${teamAScore - teamBScore} runs`;
                        } else if (teamBScore > teamAScore) {
                            if (currentInningIndex === 3 || (currentInningIndex === 2 && isTargetReached)) {
                                resultText = `${innings[1].teamName} won by ${10 - currentInning.wickets} wickets`;
                            } else {
                                resultText = `${innings[1].teamName} won`;
                            }
                        } else {
                            resultText = "Match Drawn";
                        }
                    } else {
                        if (currentInning.score > target!) {
                            resultText = `${battingTeam.name} won by ${10 - currentInning.wickets} wickets`;
                        } else if (currentInning.score === target!) {
                            resultText = "Match Tied";
                        } else {
                            resultText = `${bowlingTeam.name} won by ${target! - currentInning.score} runs`;
                        }
                    }
                } else {
                    // Transition to next inning
                    newState.currentInningIndex = nextInningIndex;
                    
                    // Check for follow-on
                    let shouldSwap = true;
                    if (isShield && currentInningIndex === 1) {
                        const lead = innings[0].score - innings[1].score;
                        if (lead >= 200) {
                            newState.followOn = true;
                            shouldSwap = false; // Team B bats again
                            newState.commentary.unshift(`${newState.bowlingTeam.name} have enforced the follow-on!`);
                        }
                    }

                    if (shouldSwap) {
                        const prevBattingTeam = newState.battingTeam;
                        newState.battingTeam = newState.bowlingTeam;
                        newState.bowlingTeam = prevBattingTeam;
                    }

                    // Update Target
                    if (isShield) {
                        if (nextInningIndex === 3) {
                            // 4th inning target
                            if (newState.followOn) {
                                // Team A bats 4th
                                newState.target = (innings[1].score + innings[2].score) - innings[0].score;
                            } else {
                                // Team B bats 4th
                                newState.target = (innings[0].score + innings[2].score) - innings[1].score;
                            }
                        } else if (nextInningIndex === 2 && newState.followOn) {
                            // Team B batting 3rd, still behind Team A's 1st inning score
                            newState.target = null; // They are just batting to clear the deficit
                        } else {
                            newState.target = null;
                        }
                    } else {
                        newState.target = innings[0].score;
                    }
                    
                    const nextInning = innings[nextInningIndex];
                    const nextBatters = nextInning.batting.slice(0, 2);
                    const nextBowler = nextInning.bowling[0];
                    
                    newState.currentBatters = { strikerId: nextBatters[0]?.playerId || '', nonStrikerId: nextBatters[1]?.playerId || '' };
                    newState.currentBowlerId = nextBowler?.playerId || '';
                    
                    newState.recentBalls = [];
                    newState.currentPartnership = { runs: 0, balls: 0 };
                    newState.commentary.unshift(`Innings Break! ${newState.battingTeam.name} to bat.`);
                    if (newState.target) newState.commentary.unshift(`Target is ${newState.target + 1}.`);
                    
                    if (newState.battingTeam.id === gameData.userTeamId && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                        newState.waitingFor = 'openers';
                    } else {
                         newState.commentary.unshift(`Auto-selected openers.`);
                         if (newState.bowlingTeam.id === gameData.userTeamId && newState.autoPlayType !== 'inning' && newState.autoPlayType !== 'match') {
                             newState.waitingFor = 'bowler';
                         }
                    }
                }
            }

            if (matchEnded && match) {
                stopAutoPlay(); // Ensure stopped
                const teamAData = gameData.teams.find(t => t.id === match.teamAId) || gameData.teams.find(t => t.name === match.teamA);
                const teamBData = gameData.teams.find(t => t.id === match.teamBId) || gameData.teams.find(t => t.name === match.teamB);

                const result: MatchResult = {
                    matchNumber: match.matchNumber,
                    summary: resultText,
                    firstInning: innings[0],
                    secondInning: innings[1],
                    thirdInning: innings[2],
                    fourthInning: innings[3],
                    winnerId: resultText.includes(innings[0].teamName) ? innings[0].teamId : (resultText.includes(innings[1].teamName) ? innings[1].teamId : null),
                    loserId: resultText.includes(innings[0].teamName) ? innings[1].teamId : (resultText.includes(innings[1].teamName) ? innings[0].teamId : null),
                    isDraw: resultText.includes("Drawn"),
                    manOfTheMatch: { playerId: '', playerName: 'TBD', teamId: '', summary: '' },
                    tossWinnerId: newState.tossWinnerId || undefined,
                    tossDecision: newState.tossDecision || undefined,
                    teamACaptainId: teamAData?.captains[gameData.currentFormat],
                    teamBCaptainId: teamBData?.captains[gameData.currentFormat]
                };
                let bestPerf = -1;
                innings.forEach(inn => {
                    if (!inn) return;
                    inn.batting.forEach(b => { if (b.runs > bestPerf) { bestPerf = b.runs; result.manOfTheMatch = { playerId: b.playerId, playerName: b.playerName, teamId: inn.teamId, summary: `${b.runs} runs` } } });
                });
                
                setTimeout(() => onMatchComplete(result), 2000);
            }

            return newState;
        });
    }, [allPlayers, gameData, groundPitch, onMatchComplete, match]);

    const stopAutoPlay = () => {
        if (autoPlayRef.current) {
            clearInterval(autoPlayRef.current);
            autoPlayRef.current = null;
        }
        setState((prev: LiveMatchState | null) => prev ? { ...prev, autoPlayType: null } : null);
    };

    const playOver = () => {
        let balls = 0;
        stopAutoPlay();
        
        setState((prev: LiveMatchState | null) => prev ? { ...prev, autoPlayType: 'regular' } : null);

        autoPlayRef.current = setInterval(() => {
            playBall();
            balls++;
            if (balls >= 6) {
                if (autoPlayRef.current) clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
                setState((prev: LiveMatchState | null) => prev ? { ...prev, autoPlayType: null } : null);
            }
        }, 100);
    };

    const autoSimulate = () => {
        if (autoPlayRef.current) return;
        setState((prev: LiveMatchState | null) => prev ? { ...prev, autoPlayType: 'regular' } : null);
        autoPlayRef.current = setInterval(() => {
            playBall();
        }, 50);
    };
    
    const simulateInning = () => {
         stopAutoPlay();
         setState((prev: LiveMatchState | null) => prev ? { ...prev, autoPlayType: 'inning' } : null);
         autoPlayRef.current = setInterval(() => {
            playBall();
        }, 10); 
    };

    const simulateMatch = () => {
        stopAutoPlay();
        setState((prev: LiveMatchState | null) => prev ? { ...prev, autoPlayType: 'match' } : null);
        autoPlayRef.current = setInterval(() => {
           playBall();
       }, 5); 
   };
    
    useEffect(() => {
        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, []);

    const setBattingStrategy = (s: Strategy) => setState((prev: LiveMatchState | null) => prev ? { ...prev, strategies: { ...prev.strategies, batting: s } } : null);
    const setBowlingStrategy = (s: Strategy) => setState((prev: LiveMatchState | null) => prev ? { ...prev, strategies: { ...prev.strategies, bowling: s } } : null);

    const selectOpeners = (strikerId: string, nonStrikerId: string) => {
        setState((prev: LiveMatchState | null) => {
            if (!prev) return null;
            
            return {
                ...prev,
                currentBatters: { strikerId, nonStrikerId },
                currentPartnership: { runs: 0, balls: 0 },
                waitingFor: null,
            };
        });
    };

    const selectNextBatter = (batterId: string) => {
        setState((prev: LiveMatchState | null) => {
            if (!prev) return null;
            const currentInning = prev.innings[prev.currentInningIndex];
            
            const newBatters = { ...prev.currentBatters };
            if (prev.waitingFor === 'striker') {
                if (batterId !== prev.currentBatters.strikerId) {
                    const temp = newBatters.strikerId;
                    newBatters.strikerId = newBatters.nonStrikerId;
                    newBatters.nonStrikerId = temp;
                }
            } else {
                const strikerOut = currentInning.batting.find(b => b.playerId === prev.currentBatters.strikerId)?.isOut;
                if (strikerOut) newBatters.strikerId = batterId;
                else newBatters.nonStrikerId = batterId;
            }

            const totalBalls = currentInning.bowling.reduce((acc, b) => acc + b.ballsBowled, 0);
            let nextWaitingFor: LiveMatchState['waitingFor'] = null;
            let nextBowlerId = prev.currentBowlerId;
            
            if (totalBalls % 6 === 0 && totalBalls > 0) {
                 if (prev.bowlingTeam.id === gameData.userTeamId && prev.autoPlayType !== 'inning' && prev.autoPlayType !== 'match') {
                      nextWaitingFor = 'bowler';
                 } else {
                      const overLimit = (gameData.currentFormat.includes('T20') ? 4 : 10);
                      const validBowlers = currentInning.bowling.filter(b => b.playerId !== prev.currentBowlerId && b.ballsBowled < overLimit * 6);
                      
                      const nextBowler = validBowlers.sort((a,b) => {
                           const pa = getPlayerById(a.playerId, allPlayers);
                           const pb = getPlayerById(b.playerId, allPlayers);
                           return pb.secondarySkill - pa.secondarySkill;
                      })[0] || currentInning.bowling.find(b => b.playerId !== prev.currentBowlerId);
                      
                      if (nextBowler) nextBowlerId = nextBowler.playerId;
                 }
            }

            return {
                ...prev,
                currentBatters: newBatters, 
                currentBowlerId: nextBowlerId,
                currentPartnership: { runs: 0, balls: 0 },
                waitingFor: nextWaitingFor,
                commentary: [`${getPlayerById(batterId, allPlayers).name} is the new batter.`, ...prev.commentary]
            };
        });
    };

    const selectNextBowler = (bowlerId: string) => {
        setState((prev: LiveMatchState | null) => {
            if (!prev) return null;
            return {
                ...prev,
                currentBowlerId: bowlerId,
                waitingFor: null,
                commentary: [`${getPlayerById(bowlerId, allPlayers).name} comes into the attack.`, ...prev.commentary]
            };
        });
    };

    const declareInning = () => {
        setState((prev: LiveMatchState | null) => {
            if (!prev || prev.status !== 'inprogress' || gameData.currentFormat !== Format.SHIELD) return prev;
            const newState = { ...prev };
            newState.innings[newState.currentInningIndex].declared = true;
            newState.commentary.unshift(`${newState.battingTeam.name} have declared their innings!`);
            return newState;
        });
    };

    const beginMatch = () => {
        setState((prev: LiveMatchState | null) => prev ? { ...prev, status: 'inprogress' } : null);
    };

    const swapPlayers = (teamId: string, player1Id: string, player2Id: string) => {
        setState((prev: LiveMatchState | null) => {
            if (!prev) return null;
            const newState = JSON.parse(JSON.stringify(prev)) as LiveMatchState;
            const team = newState.battingTeam.id === teamId ? newState.battingTeam : newState.bowlingTeam;
            
            const idx1 = team.squad.findIndex(p => p.id === player1Id);
            const idx2 = team.squad.findIndex(p => p.id === player2Id);
            
            if (idx1 !== -1 && idx2 !== -1) {
                const temp = team.squad[idx1];
                team.squad[idx1] = team.squad[idx2];
                team.squad[idx2] = temp;
            }
            
            // Also need to update the innings lineups if they were already initialized
            newState.innings.forEach(inning => {
                if (inning.teamId === teamId) {
                    const bIdx1 = inning.batting.findIndex(b => b.playerId === player1Id);
                    const bIdx2 = inning.batting.findIndex(b => b.playerId === player2Id);
                    if (bIdx1 !== -1 && bIdx2 !== -1) {
                        const temp = inning.batting[bIdx1];
                        inning.batting[bIdx1] = inning.batting[bIdx2];
                        inning.batting[bIdx2] = temp;
                    }
                } else {
                    // It's the bowling team for this inning
                    const boIdx1 = inning.bowling.findIndex(b => b.playerId === player1Id);
                    const boIdx2 = inning.bowling.findIndex(b => b.playerId === player2Id);
                    if (boIdx1 !== -1 && boIdx2 !== -1) {
                        const temp = inning.bowling[boIdx1];
                        inning.bowling[boIdx1] = inning.bowling[boIdx2];
                        inning.bowling[boIdx2] = temp;
                    }
                }
            });

            return newState;
        });
    };

    const updateBattingOrder = (playerIds: string[]) => {
        setState((prev: LiveMatchState | null) => {
            if (!prev) return null;
            const newState = { ...prev };
            newState.innings = newState.innings.map(inning => {
                if (inning.teamId === gameData.userTeamId) {
                    // Create a new batting lineup based on the provided player IDs
                    const newBatting = playerIds.map((id, index) => {
                        const existing = inning.batting.find(b => b.playerId === id);
                        if (existing) {
                            return { ...existing, battingOrder: index + 1 };
                        }
                        const p = getPlayerById(id, allPlayers);
                        return { 
                            playerId: p.id, 
                            playerName: p.name, 
                            runs: 0, 
                            balls: 0, 
                            fours: 0, 
                            sixes: 0, 
                            isOut: false, 
                            dismissalText: 'not out', 
                            dismissal: { type: 'not out' as const, bowlerId: '' }, 
                            battingOrder: index + 1,
                            ppRuns: 0, ppBalls: 0, midRuns: 0, midBalls: 0, deathRuns: 0, deathBalls: 0,
                            ones: 0, twos: 0, threes: 0, dots: 0
                        };
                    });
                    
                    // If there are players in the squad not in the playerIds list, add them at the end
                    const squadPlayerIds = prev.battingTeam.id === gameData.userTeamId 
                        ? prev.battingTeam.squad.map(p => p.id)
                        : prev.bowlingTeam.squad.map(p => p.id);
                    
                    const remainingIds = squadPlayerIds.filter(id => !playerIds.includes(id));
                    remainingIds.forEach((id, idx) => {
                        const existing = inning.batting.find(b => b.playerId === id);
                        const p = getPlayerById(id, allPlayers);
                        newBatting.push(existing ? { ...existing, battingOrder: playerIds.length + idx + 1 } : {
                            playerId: p.id, 
                            playerName: p.name, 
                            runs: 0, 
                            balls: 0, 
                            fours: 0, 
                            sixes: 0, 
                            isOut: false, 
                            dismissalText: 'not out', 
                            dismissal: { type: 'not out', bowlerId: '' }, 
                            battingOrder: playerIds.length + idx + 1,
                            ppRuns: 0, ppBalls: 0, midRuns: 0, midBalls: 0, deathRuns: 0, deathBalls: 0,
                            ones: 0, twos: 0, threes: 0, dots: 0
                        });
                    });

                    return { ...inning, batting: newBatting };
                }
                return inning;
            });
            return newState;
        });
    };

    const updateBowlingPlan = (plan: Record<number, string>) => {
        setState((prev: LiveMatchState | null) => prev ? { ...prev, bowlingPlan: plan } : null);
    };

    const autoAssignOvers = () => {
        setState((prev: LiveMatchState | null) => {
            if (!prev) return null;
            const currentInning = prev.innings[prev.currentInningIndex];
            const bowlers = currentInning.bowling.map(b => getPlayerById(b.playerId, allPlayers));
            const plan = generateAutoBowlingPlan(bowlers, gameData.currentFormat);
            return { ...prev, bowlingPlan: plan };
        });
    };

    const requestBowlerChange = () => {
        setState((prev: LiveMatchState | null) => {
            if (!prev || prev.status !== 'inprogress' || prev.waitingFor) return prev;
            return { ...prev, waitingFor: 'bowler' };
        });
    };

    return {
        state,
        playBall,
        playOver,
        autoSimulate,
        simulateInning,
        simulateMatch,
        setBattingStrategy,
        setBowlingStrategy,
        selectOpeners,
        selectNextBatter,
        selectNextBowler,
        declareInning,
        stopAutoPlay,
        startMatch,
        beginMatch,
        swapPlayers,
        requestBowlerChange,
        updateBowlingPlan,
        updateBattingOrder,
        autoAssignOvers
    };
};
