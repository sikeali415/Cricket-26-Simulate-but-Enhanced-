import React, { useCallback } from 'react';
import { GameData, Format, PlayerRole, MatchResult, Inning, BattingPerformance, BowlingPerformance, Team, Match, Player, Standing, PlayerStats } from '../types';
import { PITCH_MODIFIERS, formatOvers, getPlayerById, generateAutoXI, getBatterTier, BATTING_PROFILES, calculatePopularityPoints } from '../utils';
import { generateSingleFormatInitialStats } from '../data';

export const useSimulation = (gameData: GameData, setGameData: React.Dispatch<React.SetStateAction<GameData | null>>) => {
    const simulateInning = useCallback((battingTeam: Team, bowlingTeam: Team, format: Format, target: number | null, pitch: string, groundCode: string, inningNumber: number, allPlayers: Player[], playerForms: Record<string, number>, bowlingPlan?: Record<number, string>): Inning => {
        const pitchMods = PITCH_MODIFIERS[pitch as keyof typeof PITCH_MODIFIERS] || PITCH_MODIFIERS["Balanced Sporting Pitch"];
        
        // Base categories for pitch modifiers
        const isT20 = format.includes('T20');
        const isODI = format.includes('One-Day') || format.includes('List-A') || format.includes('ODI');
        const baseFormat = isT20 ? Format.T20_SMASH : isODI ? Format.ODI : Format.SHIELD;
        
        const formatMods = pitchMods[baseFormat] || pitchMods[Format.T20_SMASH];
        let score = 0, wickets = 0, balls = 0;
        const extras = 0;
        
        // Determine max balls based on format - STRICTOR LIMITS
        const formatStr = format.toString();
        const isT20Match = formatStr.includes('T20');
        const isODIMatch = formatStr.includes('One-Day') || formatStr.includes('Series') || formatStr.includes('ODI') || formatStr.includes('Cup') || formatStr.includes('Trophy');
        const maxBalls = (isT20Match ? 20 : isODIMatch ? 50 : 450) * 6; // 450 overs for First Class (90 per day * 5)
        
        let limits: any = null;
        const groundLimits = gameData.scoreLimits?.[groundCode];
        if (groundLimits) {
            const formatLimits = groundLimits[format];
            if (formatLimits) {
                limits = formatLimits[inningNumber];
            }
        }
        const maxWicketsForInning = (limits?.maxWickets && limits.maxWickets > 0 && limits.maxWickets <= 10) ? limits.maxWickets : 10;

        const battingLineup: BattingPerformance[] = battingTeam.squad.map((p: Player, i: number) => { 
            const d = getPlayerById(p.id, allPlayers); 
            return { 
                playerId: d.id, 
                playerName: d.name, 
                runs: 0, 
                balls: 0, 
                fours: 0, 
                sixes: 0, 
                isOut: false, 
                dismissalText: 'not out', 
                dismissal: { type: 'not out' as const, bowlerId: '' }, 
                ballsToFifty: 0, 
                ballsToHundred: 0,
                battingOrder: i + 1,
                ppRuns: 0, ppBalls: 0, midRuns: 0, midBalls: 0, deathRuns: 0, deathBalls: 0,
                ones: 0, twos: 0, threes: 0, dots: 0
            }; 
        });
        
        const bowlingLineup = bowlingTeam.squad
            .filter((p: Player) => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(getPlayerById(p.id, allPlayers).role))
            .map((p: Player) => { 
                const d = getPlayerById(p.id, allPlayers); 
                return { 
                    playerId: d.id, 
                    playerName: d.name, 
                    overs: '0.0', 
                    maidens: 0, 
                    runsConceded: 0, 
                    wickets: 0, 
                    ballsBowled: 0,
                    role: d.role,
                    skill: d.secondarySkill,
                    ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                } 
            });
        
        if (bowlingLineup.length < 2) { 
            // Ensure at least 2 bowlers to avoid consecutive overs bug
            const p1 = getPlayerById(bowlingTeam.squad[0].id, allPlayers);
            const p2 = getPlayerById(bowlingTeam.squad[1]?.id || bowlingTeam.squad[0].id, allPlayers);
            
            if (bowlingLineup.length === 0) {
                bowlingLineup.push({ 
                    playerId: p1.id, playerName: p1.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0, role: p1.role, skill: p1.secondarySkill,
                    ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                });
            }
            if (bowlingLineup.length === 1) {
                bowlingLineup.push({ 
                    playerId: p2.id, playerName: p2.name, overs: '0.0', maidens: 0, runsConceded: 0, wickets: 0, ballsBowled: 0, role: p2.role, skill: p2.secondarySkill,
                    ppRuns: 0, ppBalls: 0, ppWickets: 0, midRuns: 0, midBalls: 0, midWickets: 0, deathRuns: 0, deathBalls: 0, deathWickets: 0
                });
            }
        }

        let onStrikeBatterIndex = 0, offStrikeBatterIndex = 1, bowlerIndex = 0, runsThisOver = 0;

        while (balls < maxBalls && wickets < maxWicketsForInning) {
            if (target && score >= target) break;
            if (limits?.maxRuns && limits.maxRuns > 0 && score >= limits.maxRuns) break;

            const onStrikeBatter = battingLineup[onStrikeBatterIndex];
            if (!onStrikeBatter) break; 
            const onStrikeBatterDetails = getPlayerById(onStrikeBatter.playerId, allPlayers);
            const currentBowler = bowlingLineup[bowlerIndex];
            const bowlerDetails = getPlayerById(currentBowler.playerId, allPlayers);

            // Form factor: Random performance variance for this match
            const batterForm = playerForms[onStrikeBatterDetails.id] || 1.0;
            const bowlerForm = playerForms[bowlerDetails.id] || 1.0;

            // Fatigue factor: Skills decrease slightly as they play more
            const batterFatigue = Math.max(0.75, 1 - (onStrikeBatter.balls / 250)) * batterForm;
            const bowlerFatigue = Math.max(0.7, 1 - (currentBowler.ballsBowled / 150)) * bowlerForm;

            // Pressure factor: In a chase, required rate affects performance
            let pressureFactor = 1.0;
            let aggressionFactor = 1.0;
            
            if (target) {
                const remainingBalls = maxBalls - balls;
                const remainingRuns = target - score;
                if (remainingBalls > 0) {
                    const requiredRR = (remainingRuns / remainingBalls) * 6;
                    
                    // Batting aggression based on required rate
                    if (isT20) {
                        if (requiredRR > 14) aggressionFactor = 2.2;
                        else if (requiredRR > 12) aggressionFactor = 1.9;
                        else if (requiredRR > 10) aggressionFactor = 1.65;
                        else if (requiredRR > 8) aggressionFactor = 1.4;
                        else if (requiredRR < 6) aggressionFactor = 0.9;
                    } else if (isODI) {
                        if (requiredRR > 10) aggressionFactor = 1.5;
                        else if (requiredRR > 8) aggressionFactor = 1.35;
                        else if (requiredRR > 6) aggressionFactor = 1.2;
                        else if (requiredRR < 4) aggressionFactor = 0.9;
                    }
                    
                    // Pressure increases wicket chance if required rate is high
                    if (requiredRR > 10) {
                        pressureFactor = 1 + (requiredRR - 10) * 0.1;
                    }
                }
            } else {
                // First innings aggression - Boosted for higher scores
                const progress = balls / maxBalls;
                if (isT20) {
                    if (progress > 0.8) aggressionFactor = 2.8; // Death overs - Boosted from 2.4
                    else if (progress > 0.5) aggressionFactor = 2.2; // Boosted from 1.9
                    else if (progress < 0.3) aggressionFactor = 2.0; // Powerplay - Boosted from 1.8
                    else aggressionFactor = 2.1; // Middle overs - Boosted from 1.85
                } else if (isODI) {
                    if (progress > 0.9) aggressionFactor = 2.4;
                    else if (progress > 0.7) aggressionFactor = 1.9;
                    else if (progress < 0.2) aggressionFactor = 1.6;
                    else aggressionFactor = 1.55;
                } else {
                    // First Class
                    aggressionFactor = 1.4;
                }

                // Subtle score normalization for T20 to hit 200-350 range
                if (isT20 && !target && balls > 0) {
                    const currentRR = (score / balls) * 6;
                    if (balls > 36) { // After 6 overs
                        if (currentRR < 12.0) aggressionFactor *= 1.4; // Nudge up more aggressively
                        if (currentRR > 22.0) aggressionFactor *= 0.8; // Nudge down only if extremely fast
                    }
                }
            }

            let batterProfile;
            const customProfile = onStrikeBatterDetails.customProfiles?.[format];
            if (customProfile && customProfile.avg > 0 && customProfile.sr > 0) {
                batterProfile = customProfile;
            } else {
                const batterTier = getBatterTier(onStrikeBatterDetails.battingSkill * batterFatigue);
                const batterStyle = onStrikeBatterDetails.archetype || onStrikeBatterDetails.style;
                batterProfile = BATTING_PROFILES[format][batterTier][batterStyle] || BATTING_PROFILES[format][batterTier]['N'];
            }

            const expectedRunsPerBall = (batterProfile.sr / 100) * aggressionFactor * (target !== null ? pitchMods.chasePenalty : 1);
            const baseWicketProb = batterProfile.avg > 0 ? expectedRunsPerBall / batterProfile.avg : 0.05;
            
            // Skill impact increased: Higher rated batters perform significantly better
            let wicketProbability = (baseWicketProb * pressureFactor)
                + (((bowlerDetails.secondarySkill * bowlerFatigue) - (onStrikeBatterDetails.battingSkill * batterFatigue)) / 450) // Reduced bowler impact slightly
                + (bowlerDetails.role === PlayerRole.FAST_BOWLER ? pitchMods.paceBonus / 2 : 0) 
                + (bowlerDetails.role === PlayerRole.SPIN_BOWLER ? pitchMods.spinBonus / 2 : 0);
            
            wicketProbability *= formatMods.wicketChance * 0.9; // Slightly reduced wicket chance for higher scores
            
            // Format specific adjustments for realism
            if (format.includes('First-Class')) {
                wicketProbability *= 0.75; // Longer games, fewer wickets per ball
            } else if (isT20) {
                wicketProbability *= 1.0; // Balanced for T20
            }

            wicketProbability = Math.max(0.003, Math.min(0.35, wicketProbability));

            balls++;
            onStrikeBatter.balls++;
            currentBowler.ballsBowled++;

            const currentOver = Math.floor((balls - 1) / 6) + 1;
            let currentPhase: 'PP' | 'MID' | 'DEATH' = 'MID';
            if (isT20) {
                if (currentOver <= 6) currentPhase = 'PP';
                else if (currentOver >= 16) currentPhase = 'DEATH';
            } else if (isODI) {
                if (currentOver <= 10) currentPhase = 'PP';
                else if (currentOver >= 41) currentPhase = 'DEATH';
            }

            if (currentPhase === 'PP') { onStrikeBatter.ppBalls++; currentBowler.ppBalls++; }
            else if (currentPhase === 'MID') { onStrikeBatter.midBalls++; currentBowler.midBalls++; }
            else { onStrikeBatter.deathBalls++; currentBowler.deathBalls++; }

            if (Math.random() < wicketProbability) {
                wickets++;
                onStrikeBatter.isOut = true;
                onStrikeBatter.dismissal = { type: 'bowled', bowlerId: currentBowler.playerId };
                onStrikeBatter.dismissalText = `b ${currentBowler.playerName}`;
                currentBowler.wickets++;
                
                if (currentPhase === 'PP') currentBowler.ppWickets++;
                else if (currentPhase === 'MID') currentBowler.midWickets++;
                else currentBowler.deathWickets++;

                onStrikeBatterIndex = Math.max(onStrikeBatterIndex, offStrikeBatterIndex) + 1;
            } else {
                let runsScored;
                // Boosted scoring probabilities for high scoring games
                let p_1 = 0.42, p_2 = 0.10, p_3 = 0.01, p_4 = 0.13, p_6 = 0.06;
                
                if (format.includes('First-Class')) {
                    p_1 = 0.28; p_2 = 0.06; p_3 = 0.01; p_4 = 0.09; p_6 = 0.01;
                }

                switch (onStrikeBatterDetails.style) {
                    case 'A': p_4 += 0.05; p_6 += 0.05; break;
                    case 'D': p_4 -= 0.04; p_6 -= 0.02; break;
                }

                const baseERPB = (p_1 * 1) + (p_2 * 2) + (p_3 * 3) + (p_4 * 4) + (p_6 * 6);
                const targetScoringERPB = expectedRunsPerBall / (1 - wicketProbability);
                const scalingFactor = baseERPB > 0 ? targetScoringERPB / baseERPB : 1;

                const p_4_scaled = p_4 * scalingFactor;
                const p_6_scaled = p_6 * scalingFactor;
                const p_2_scaled = p_2 * Math.sqrt(scalingFactor);
                const p_3_scaled = p_3 * Math.sqrt(scalingFactor);
                
                const p_scoring_new_sum = p_1 + p_2_scaled + p_3_scaled + p_4_scaled + p_6_scaled;
                let p_dot_scaled = 1 - p_scoring_new_sum;
                
                if (p_dot_scaled < 0) { p_1 += p_dot_scaled; p_dot_scaled = 0; if (p_1 < 0) p_1 = 0; }

                const totalProb = p_dot_scaled + p_1 + p_2_scaled + p_3_scaled + p_4_scaled + p_6_scaled;
                const scoringRandom = Math.random() * totalProb;
                
                const c_1 = p_dot_scaled + p_1;
                const c_2 = c_1 + p_2_scaled;
                const c_3 = c_2 + p_3_scaled;
                const c_4 = c_3 + p_4_scaled;

                if (scoringRandom < p_dot_scaled) {
                    runsScored = 0;
                    onStrikeBatter.dots++;
                }
                else if (scoringRandom < c_1) {
                    runsScored = 1;
                    onStrikeBatter.ones++;
                }
                else if (scoringRandom < c_2) {
                    runsScored = 2;
                    onStrikeBatter.twos++;
                }
                else if (scoringRandom < c_3) {
                    runsScored = 3;
                    onStrikeBatter.threes++;
                }
                else if (scoringRandom < c_4) {
                    runsScored = 4;
                    onStrikeBatter.fours++;
                }
                else {
                    runsScored = 6;
                    onStrikeBatter.sixes++;
                }

                const oldRuns = onStrikeBatter.runs;
                onStrikeBatter.runs += runsScored;

                if (oldRuns < 50 && onStrikeBatter.runs >= 50 && !onStrikeBatter.ballsToFifty) { onStrikeBatter.ballsToFifty = onStrikeBatter.balls; }
                if (oldRuns < 100 && onStrikeBatter.runs >= 100 && !onStrikeBatter.ballsToHundred) { onStrikeBatter.ballsToHundred = onStrikeBatter.balls; }

                score += runsScored;
                currentBowler.runsConceded += runsScored;
                runsThisOver += runsScored;

                if (currentPhase === 'PP') { onStrikeBatter.ppRuns += runsScored; currentBowler.ppRuns += runsScored; }
                else if (currentPhase === 'MID') { onStrikeBatter.midRuns += runsScored; currentBowler.midRuns += runsScored; }
                else { onStrikeBatter.deathRuns += runsScored; currentBowler.deathRuns += runsScored; }

                if (runsScored === 4) onStrikeBatter.fours++;
                if (runsScored === 6) onStrikeBatter.sixes++;
                
                if (runsScored % 2 !== 0) { [onStrikeBatterIndex, offStrikeBatterIndex] = [offStrikeBatterIndex, onStrikeBatterIndex]; }
            }

            if (balls % 6 === 0) {
                if (runsThisOver === 0) currentBowler.maidens++;
                
                // Dynamic Bowling Change: If over was expensive (>12 runs in T20/ODI), switch bowler
                const isExpensiveOver = (isT20 || isODI) && runsThisOver > 12;
                
                runsThisOver = 0;
                [onStrikeBatterIndex, offStrikeBatterIndex] = [offStrikeBatterIndex, onStrikeBatterIndex];
                
                const maxOversPerBowler = isT20 ? 4 : isODI ? 10 : Infinity;
                const lastBowlerIndex = bowlerIndex;
                const currentOverNumber = Math.floor(balls / 6) + 1;
                
                // Check if there's a bowling plan for this over
                let plannedBowlerIndex = -1;
                if (bowlingPlan && bowlingPlan[currentOverNumber]) {
                    const plannedBowlerId = bowlingPlan[currentOverNumber];
                    plannedBowlerIndex = bowlingLineup.findIndex(b => b.playerId === plannedBowlerId);
                    
                    // Validate: Planned bowler must not have bowled the previous over
                    if (plannedBowlerIndex === lastBowlerIndex) {
                        plannedBowlerIndex = -1; // Invalid plan (consecutive overs)
                    }
                }

                if (plannedBowlerIndex !== -1) {
                    bowlerIndex = plannedBowlerIndex;
                } else {
                    // Smarter bowling rotation (Fallback or Default)
                    let bestNextBowlerIndex = -1;
                    let bestScore = -Infinity;
                    
                    // Identify crucial overs
                    const isPowerplay = isT20 && currentOverNumber <= 6;
                    const isDeathOvers = isT20 && currentOverNumber >= 16;
                    const isCrucial = isPowerplay || isDeathOvers;

                    for (let i = 0; i < bowlingLineup.length; i++) {
                        if (i === lastBowlerIndex) continue; // Cannot bowl consecutive overs
                        if (bowlingLineup[i].ballsBowled >= maxOversPerBowler * 6) continue; // Max overs reached
                        
                        const b = bowlingLineup[i];
                        let bScore = b.skill;
                        
                        // Crucial Overs Logic: Best bowlers handle PP and Death
                        if (isCrucial) {
                            bScore += b.skill * 0.5; // Heavy weight on skill for crucial overs
                        }

                        // Prefer strike bowlers if wickets are needed
                        if (wickets < 5) {
                            if (b.role === PlayerRole.FAST_BOWLER) bScore += 10;
                        } else {
                            if (b.role === PlayerRole.SPIN_BOWLER) bScore += 5;
                        }
                        
                        // Fatigue penalty
                        bScore -= (b.ballsBowled / 6) * 2;
                        
                        // Randomness
                        bScore += Math.random() * 10;
                        
                        if (bScore > bestScore) {
                            bestScore = bScore;
                            bestNextBowlerIndex = i;
                        }
                    }
                    
                    if (bestNextBowlerIndex !== -1) {
                        bowlerIndex = bestNextBowlerIndex;
                    } else {
                        bowlerIndex = (lastBowlerIndex + 1) % bowlingLineup.length;
                    }
                }
            }
        }

        return { 
            teamId: battingTeam.id, 
            teamName: battingTeam.name, 
            score, 
            wickets, 
            overs: formatOvers(balls), 
            extras, 
            batting: battingLineup.slice(0, Math.min(battingLineup.length, wickets + 2)), 
            bowling: bowlingLineup.map(b => ({...b, overs: formatOvers(b.ballsBowled)})) 
        };
    }, [gameData.scoreLimits]);

    const runLimitedOversMatchSimulation = useCallback((match: Match, teamAPlayers: Player[], teamBPlayers: Player[], gameData: GameData): MatchResult => {
        const allPlayersInMatch = [...teamAPlayers, ...teamBPlayers]; 
        const teamAData = gameData.teams.find(t => t.name === match.teamA); 
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        if(!teamAData || !teamBData) throw new Error(`Could not find team data for match: ${match.teamA} vs ${match.teamB}`);
        
        const teamA = { ...teamAData, squad: teamAPlayers }; 
        const teamB = { ...teamBData, squad: teamBPlayers };

        const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround); 
        const pitch = homeGround?.pitch || "Balanced Sporting Pitch";
        const groundCode = homeGround?.code || "KCG";

        // Generate form for all players in the match (0.9 to 1.1)
        const playerForms: Record<string, number> = {};
        allPlayersInMatch.forEach(p => {
            playerForms[p.id] = 0.9 + (Math.random() * 0.2);
        });

        const firstInningPlan = gameData.bowlingPlans[teamB.id]?.[gameData.currentFormat];
        const secondInningPlan = gameData.bowlingPlans[teamA.id]?.[gameData.currentFormat];

        const firstInning = simulateInning(teamA, teamB, gameData.currentFormat, null, pitch, groundCode, 1, allPlayersInMatch, playerForms, firstInningPlan);
        const secondInning = simulateInning(teamB, teamA, gameData.currentFormat, firstInning.score, pitch, groundCode, 2, allPlayersInMatch, playerForms, secondInningPlan);

        let winnerId: string | null, loserId: string | null, summary: string;

        if (secondInning.score > firstInning.score) {
            winnerId = teamB.id; loserId = teamA.id; summary = `${teamB.name} won by ${10 - secondInning.wickets} wickets.`;
        } else if (firstInning.score > secondInning.score) {
            winnerId = teamA.id; loserId = teamB.id; summary = `${teamA.name} won by ${firstInning.score - secondInning.score} runs.`;
        } else { 
            if (match.group !== 'Round-Robin') {
                const teamAIndex = gameData.standings[gameData.currentFormat].findIndex(s => s.teamId === teamA.id);
                const teamBIndex = gameData.standings[gameData.currentFormat].findIndex(s => s.teamId === teamB.id);
                if (teamAIndex < teamBIndex) {
                    winnerId = teamA.id; loserId = teamB.id; summary = `Match Tied (${teamA.name} won on higher league position)`;
                } else {
                    winnerId = teamB.id; loserId = teamA.id; summary = `Match Tied (${teamB.name} won on higher league position)`;
                }
            } else {
                summary = "Match Tied."; winnerId = null; loserId = null;
            }
        }

        let motm = { playerId: '', playerName: '', teamId: '', summary: '' }, bestScore = -1;
        for (const p of firstInning.batting) { const s = p.runs + (p.runs >= 50 ? 25 : 0) + (p.runs >= 100 ? 50 : 0); if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamA.id, summary: `${p.runs}(${p.balls})` }; } }
        for (const p of secondInning.batting) { const s = p.runs * 1.2 + (p.runs >= 50 ? 30 : 0) + (p.runs >= 100 ? 60 : 0); if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamB.id, summary: `${p.runs}(${p.balls})` }; } }
        for (const p of firstInning.bowling) { const s = p.wickets * 25 + (p.wickets >= 3 ? 25 : 0) + (p.wickets >= 5 ? 50 : 0) - p.runsConceded * 0.5; if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamB.id, summary: `${p.wickets}/${p.runsConceded}` }; } }
        for (const p of secondInning.bowling) { const s = p.wickets * 20 + (p.wickets >= 3 ? 20 : 0) + (p.wickets >= 5 ? 40 : 0) - p.runsConceded * 0.5; if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: teamA.id, summary: `${p.wickets}/${p.runsConceded}` }; } }

        return { 
            matchNumber: String(match.matchNumber), 
            winnerId, 
            loserId, 
            summary, 
            firstInning, 
            secondInning, 
            manOfTheMatch: motm,
            teamACaptainId: teamAData.captains[gameData.currentFormat],
            teamBCaptainId: teamBData.captains[gameData.currentFormat]
        };
    }, [simulateInning]);

    const runFirstClassMatchSimulation = useCallback((match: Match, teamAPlayers: Player[], teamBPlayers: Player[], gameData: GameData): MatchResult => {
        const allPlayersInMatch = [...teamAPlayers, ...teamBPlayers]; 
        const teamAData = gameData.teams.find(t => t.name === match.teamA); 
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        if(!teamAData || !teamBData) throw new Error(`Could not find team data for match: ${match.teamA} vs ${match.teamB}`);
        
        const teamA = { ...teamAData, squad: teamAPlayers }; 
        const teamB = { ...teamBData, squad: teamBPlayers };

        const homeGround = gameData.grounds.find(g => g.code === gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround); 
        const pitch = homeGround?.pitch || "Balanced Sporting Pitch";
        const groundCode = homeGround?.code || "KCG";

        // Generate form for all players in the match (0.9 to 1.1)
        const playerForms: Record<string, number> = {};
        allPlayersInMatch.forEach(p => {
            playerForms[p.id] = 0.9 + (Math.random() * 0.2);
        });

        // First-Class Simulation: Multi-innings
        const teamAPlan = gameData.bowlingPlans[teamA.id]?.[gameData.currentFormat];
        const teamBPlan = gameData.bowlingPlans[teamB.id]?.[gameData.currentFormat];

        const firstInning = simulateInning(teamA, teamB, gameData.currentFormat, null, pitch, groundCode, 1, allPlayersInMatch, playerForms, teamBPlan);
        const secondInning = simulateInning(teamB, teamA, gameData.currentFormat, null, pitch, groundCode, 2, allPlayersInMatch, playerForms, teamAPlan);
        const thirdInning = simulateInning(teamA, teamB, gameData.currentFormat, null, pitch, groundCode, 3, allPlayersInMatch, playerForms, teamBPlan);
        const fourthInning = simulateInning(teamB, teamA, gameData.currentFormat, (firstInning.score + thirdInning.score - secondInning.score), pitch, groundCode, 4, allPlayersInMatch, playerForms, teamAPlan);

        let winnerId: string | null, loserId: string | null, isDraw = false, summary: string;
        const target = firstInning.score + thirdInning.score - secondInning.score + 1;
        
        if (fourthInning.score >= target) {
            winnerId = teamB.id; loserId = teamA.id; summary = `${teamB.name} won by ${10 - fourthInning.wickets} wickets.`;
        } else if (fourthInning.wickets >= 10) {
            winnerId = teamA.id; loserId = teamB.id; summary = `${teamA.name} won by ${target - 1 - fourthInning.score} runs.`;
        } else {
            if (match.group !== 'Round-Robin') {
                const teamAIndex = gameData.standings[gameData.currentFormat].findIndex(s => s.teamId === teamA.id);
                const teamBIndex = gameData.standings[gameData.currentFormat].findIndex(s => s.teamId === teamB.id);
                if (teamAIndex < teamBIndex) {
                    winnerId = teamA.id; loserId = teamB.id; summary = `Match Drawn (${teamA.name} won on higher league position)`;
                } else {
                    winnerId = teamB.id; loserId = teamA.id; summary = `Match Drawn (${teamB.name} won on higher league position)`;
                }
            } else {
                isDraw = true; summary = 'Match Drawn.'; winnerId = null; loserId = null;
            }
        }

        let motm = { playerId: '', playerName: '', teamId: '', summary: '' }, bestScore = -1;
        [firstInning, secondInning, thirdInning, fourthInning].forEach((inning, idx) => { 
            const btid = idx % 2 === 0 ? teamA.id : teamB.id; 
            const f_tid = idx % 2 === 0 ? teamB.id : teamA.id; 
            if (inning) {
                 for (const p of inning.batting) { const s = p.runs * 1.5 + (p.runs >= 50 ? 50 : 0) + (p.runs >= 100 ? 100 : 0); if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: btid, summary: `${p.runs}(${p.balls})` }; } } 
                 for (const p of inning.bowling) { const s = p.wickets * 30 + (p.wickets >= 3 ? 30 : 0) + (p.wickets >= 5 ? 75 : 0) - p.runsConceded * 0.5; if (s > bestScore) { bestScore = s; motm = { playerId: p.playerId, playerName: p.playerName, teamId: f_tid, summary: `${p.wickets}/${p.runsConceded}` }; } } 
            }
        });

        return { 
            matchNumber: String(match.matchNumber), 
            winnerId, 
            loserId, 
            isDraw, 
            summary, 
            firstInning, 
            secondInning, 
            thirdInning, 
            fourthInning, 
            manOfTheMatch: motm,
            teamACaptainId: teamAData.captains[gameData.currentFormat],
            teamBCaptainId: teamBData.captains[gameData.currentFormat]
        };
    }, [simulateInning]);

    const runSimulationForCurrentFormat = useCallback((match: Match, gameData: GameData) => {
        if (!gameData || !gameData.teams) throw new Error("Game data or teams not found");
        const teamAData = gameData.teams.find(t => t.name === match.teamA); 
        const teamBData = gameData.teams.find(t => t.name === match.teamB);
        if (!teamAData || !teamBData) throw new Error(`Team data not found for match: ${match.teamA} vs ${match.teamB}`);

        const getPlayingXI = (team: Team) => {
            const customXI = gameData.playingXIs?.[team.id]?.[gameData.currentFormat];
            if (customXI && customXI.length === 11) {
                const xiPlayers = customXI.map(id => team.squad?.find(p => p.id === id)).filter(Boolean) as Player[];
                if (xiPlayers.length === 11) return xiPlayers;
            }
            return generateAutoXI(team.squad || [], gameData.currentFormat);
        };

        const teamAPlayers = getPlayingXI(teamAData); 
        const teamBPlayers = getPlayingXI(teamBData);

        return (gameData.currentFormat.includes('First-Class')) 
            ? runFirstClassMatchSimulation(match, teamAPlayers, teamBPlayers, gameData) 
            : runLimitedOversMatchSimulation(match, teamAPlayers, teamBPlayers, gameData);
    }, [runLimitedOversMatchSimulation, runFirstClassMatchSimulation]);

    const updateStatsFromMatch = useCallback((result: MatchResult, format: Format, gameData: GameData): GameData => {
        const newGameData: GameData = { 
            ...gameData,
            allPlayers: [...gameData.allPlayers],
            standings: {
                ...gameData.standings,
                [format]: [...(gameData.standings[format] || [])]
            },
            matchResults: {
                ...gameData.matchResults,
                [format]: [...(gameData.matchResults[format] || [])]
            }
        };
        const allInnings = [result.firstInning, result.secondInning, result.thirdInning, result.fourthInning].filter(Boolean) as Inning[];

        for (const inning of allInnings) {
            for (const batPerf of inning.batting) { 
                const playerIdx = newGameData.allPlayers.findIndex(p => p.id === batPerf.playerId); 
                if (playerIdx === -1) continue; 
                
                const player = { ...newGameData.allPlayers[playerIdx] };
                if (!player.stats) player.stats = {} as Record<Format, PlayerStats>; 
                if (!player.stats[format]) player.stats[format] = generateSingleFormatInitialStats();
                
                const stats = { ...player.stats[format] }; 
                stats.matches += (inning === result.firstInning || inning === result.secondInning ? 1 : 0); 
                stats.runs += batPerf.runs; 
                stats.ballsFaced += batPerf.balls; 
                if (batPerf.isOut) stats.dismissals++; 
                if (batPerf.runs > stats.highestScore) stats.highestScore = batPerf.runs; 
                if (batPerf.runs >= 100) {
                    stats.hundreds++;
                    if (batPerf.ballsToHundred && (stats.fastestHundred === 0 || batPerf.ballsToHundred < stats.fastestHundred)) {
                        stats.fastestHundred = batPerf.ballsToHundred;
                    }
                } else if (batPerf.runs >= 50) {
                    stats.fifties++;
                    if (batPerf.ballsToFifty && (stats.fastestFifty === 0 || batPerf.ballsToFifty < stats.fastestFifty)) {
                        stats.fastestFifty = batPerf.ballsToFifty;
                    }
                }
                stats.fours += batPerf.fours; 
                stats.sixes += batPerf.sixes; 
                stats.ones += batPerf.ones || 0;
                stats.twos += batPerf.twos || 0;
                stats.threes += batPerf.threes || 0;
                stats.dots += batPerf.dots || 0;

                if (!stats.runsByPosition) {
                    stats.runsByPosition = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 };
                }
                const rbPos = { ...stats.runsByPosition };
                rbPos[batPerf.battingOrder] = (rbPos[batPerf.battingOrder] || 0) + batPerf.runs;
                stats.runsByPosition = rbPos;
                
                stats.ppRuns += batPerf.ppRuns || 0;
                stats.ppBalls += batPerf.ppBalls || 0;
                stats.midRuns += batPerf.midRuns || 0;
                stats.midBalls += batPerf.midBalls || 0;
                stats.deathRuns += batPerf.deathRuns || 0;
                stats.deathBalls += batPerf.deathBalls || 0;

                stats.average = stats.dismissals > 0 ? stats.runs / stats.dismissals : stats.runs; 
                stats.strikeRate = stats.ballsFaced > 0 ? (stats.runs / stats.ballsFaced) * 100 : 0; 
                
                player.stats = { ...player.stats, [format]: stats };
                newGameData.allPlayers[playerIdx] = player;
            }

            for (const bowlPerf of inning.bowling) { 
                const playerIdx = newGameData.allPlayers.findIndex(p => p.id === bowlPerf.playerId); 
                if (playerIdx === -1) continue; 
                
                const player = { ...newGameData.allPlayers[playerIdx] };
                if (!player.stats) player.stats = {} as Record<Format, PlayerStats>; 
                if (!player.stats[format]) player.stats[format] = generateSingleFormatInitialStats();
                
                const stats = { ...player.stats[format] }; 
                stats.wickets += bowlPerf.wickets; 
                stats.runsConceded += bowlPerf.runsConceded; 
                stats.ballsBowled += bowlPerf.ballsBowled;

                stats.ppRunsConceded += bowlPerf.ppRuns || 0;
                stats.ppBallsBowled += bowlPerf.ppBalls || 0;
                stats.ppWickets += bowlPerf.ppWickets || 0;
                
                stats.midRunsConceded += bowlPerf.midRuns || 0;
                stats.midBallsBowled += bowlPerf.midBalls || 0;
                stats.midWickets += bowlPerf.midWickets || 0;
                
                stats.deathRunsConceded += bowlPerf.deathRuns || 0;
                stats.deathBallsBowled += bowlPerf.deathBalls || 0;
                stats.deathWickets += bowlPerf.deathWickets || 0;

                stats.bowlingAverage = stats.wickets > 0 ? stats.runsConceded / stats.wickets : stats.runsConceded; 
                stats.economy = stats.ballsBowled > 0 ? (stats.runsConceded / stats.ballsBowled) * 6 : 0; 
                if (bowlPerf.wickets > stats.bestBowlingWickets || (bowlPerf.wickets === stats.bestBowlingWickets && bowlPerf.runsConceded < stats.bestBowlingRuns)) { 
                    stats.bestBowlingWickets = bowlPerf.wickets; 
                    stats.bestBowlingRuns = bowlPerf.runsConceded; 
                    stats.bestBowling = `${bowlPerf.wickets}/${bowlPerf.runsConceded}`; 
                } 
                if (bowlPerf.wickets >= 5) stats.fiveWicketHauls++; 
                else if (bowlPerf.wickets >= 3) stats.threeWicketHauls++; 

                if (!player.recentPerformances) player.recentPerformances = [];
                const rpIdx = player.recentPerformances.findIndex(rp => rp.matchId === result.matchNumber.toString());
                const newRecentPerfs = [...player.recentPerformances];
                if (rpIdx !== -1) {
                    newRecentPerfs[rpIdx] = { ...newRecentPerfs[rpIdx], wickets: bowlPerf.wickets };
                } else {
                    newRecentPerfs.push({ matchId: result.matchNumber.toString(), runs: 0, wickets: bowlPerf.wickets });
                }
                player.recentPerformances = newRecentPerfs.slice(-10);
                
                player.stats = { ...player.stats, [format]: stats };
                newGameData.allPlayers[playerIdx] = player;
            }
        }

        // Additional update for recent batting performances
        const inningsWithBatting = allInnings;
        for (const inning of inningsWithBatting) {
            for (const batPerf of inning.batting) {
                const playerIdx = newGameData.allPlayers.findIndex(p => p.id === batPerf.playerId);
                if (playerIdx === -1) continue;
                
                const player = { ...newGameData.allPlayers[playerIdx] };
                if (!player.recentPerformances) player.recentPerformances = [];
                const rpIdx = player.recentPerformances.findIndex(rp => rp.matchId === result.matchNumber.toString());
                const newRecentPerfs = [...player.recentPerformances];
                if (rpIdx !== -1) {
                    newRecentPerfs[rpIdx] = { ...newRecentPerfs[rpIdx], runs: batPerf.runs };
                } else {
                    newRecentPerfs.push({ matchId: result.matchNumber.toString(), runs: batPerf.runs, wickets: 0 });
                }
                player.recentPerformances = newRecentPerfs.slice(-10);
                newGameData.allPlayers[playerIdx] = player;
            }
        }

        const motmPlayerIdx = newGameData.allPlayers.findIndex(p => p.id === result.manOfTheMatch.playerId); 
        if (motmPlayerIdx !== -1) { 
            const p = { ...newGameData.allPlayers[motmPlayerIdx] };
            if (!p.stats) p.stats = {} as Record<Format, PlayerStats>; 
            if (!p.stats[format]) p.stats[format] = generateSingleFormatInitialStats();
            const stats = { ...p.stats[format] };
            stats.manOfTheMatchAwards++; 
            p.stats = { ...p.stats, [format]: stats };
            newGameData.allPlayers[motmPlayerIdx] = p;
        }

        newGameData.standings[format] = newGameData.standings[format].map((s: Standing) => {
            const isTeamA = s.teamId === result.firstInning.teamId;
            const isTeamB = s.teamId === result.secondInning?.teamId;

            if (isTeamA || isTeamB) {
                const newS = { ...s };
                newS.played++;
                
                const myInning = isTeamA ? result.firstInning : result.secondInning;
                const oppInning = isTeamA ? result.secondInning : result.firstInning;
                
                if (myInning && oppInning) {
                    newS.runsFor += myInning.score;
                    newS.runsAgainst += oppInning.score;

                    const maxOvers = format.includes('T20') ? 20 : 50;
                    const oversToDecimal = (overs: string) => {
                        const [ov, b] = overs.split('.').map(Number);
                        return ov + (b || 0) / 6;
                    };
                    const oversFaced = (myInning.wickets === 10) ? maxOvers : oversToDecimal(myInning.overs);
                    const oversBowled = (oppInning.wickets === 10) ? maxOvers : oversToDecimal(oppInning.overs);

                    newS.oversFor += oversFaced;
                    newS.oversAgainst += oversBowled;

                    if (newS.oversFor > 0 && newS.oversAgainst > 0) {
                        newS.netRunRate = (newS.runsFor / newS.oversFor) - (newS.runsAgainst / newS.oversAgainst);
                    }
                }

                if (result.winnerId === s.teamId) {
                    newS.won++;
                    newS.points += format.includes('First-Class') ? 4 : 2;
                }
                else if (!result.winnerId) {
                    newS.drawn++;
                    newS.points += 1;
                }
                else newS.lost++;
                return newS;
            }
            return s;
        });

        newGameData.standings[format].sort((a, b) => b.points - a.points || b.netRunRate - a.netRunRate); 
        newGameData.matchResults[format].push(result); 
        return newGameData;
    }, []);

    return { runSimulationForCurrentFormat, updateStatsFromMatch };
}