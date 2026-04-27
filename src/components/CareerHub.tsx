
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, Trophy, BarChart3, Settings as SettingsIcon, Newspaper, Users, Database, LayoutGrid, ArrowRightLeft, Scale, Wallet, Gavel, Star } from 'lucide-react';
import { GameData, CareerScreen, MatchResult, Player, Format, PromotionRecord, Team, LiveMatchState, NewsArticle, Ground, Standing, Match } from '../types';
import { TEAMS, INITIAL_SPONSORSHIPS, INITIAL_NEWS } from '../data';
import { Icons } from './Icons';
import { getPlayerById, generateLeagueSchedule, negotiateSponsorships, generateMatchNews, generatePreMatchNews, simulateInjuries, updateAISquads, generateReplacementPlayer, resolveMatch } from '../utils';
import { useSimulation } from '../hooks/useSimulation';
import { db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';

// Components
import Dashboard from './Dashboard';
import Schedule from './Schedule';
import News from './News';
import Lineups from './Lineups';
import Editor from './Editor';
import Standings from './Standings';
import Stats from './Stats';
import Settings from './Settings';
import PlayerProfile from './PlayerProfile';
import MatchResultScreen from './MatchResultScreen';
import ForwardResultsScreen from './ForwardResultsScreen';
import AwardsAndRecordsScreen from './AwardsRecordsScreen';
import EndOfFormatScreen from './EndOfFormatScreen';
import Transfers from './Transfers';
import ComparisonScreen from './ComparisonScreen';
import LiveMatchScreen from './LiveMatchScreen';
import SponsorRoom from './SponsorRoom';
import AuctionRoom from './AuctionRoom';
import PlayerDatabase from './PlayerDatabase';
import SeasonSummary from './SeasonSummary';
import ModernRatingBoard from './ModernRatingBoard';
import MatchStrategy from './MatchStrategy';
import CaptainsCorner from './CaptainsCorner';

interface CareerHubProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    onResetGame: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    saveGame: () => void;
    loadGame: () => void;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const BottomNavBar = ({ activeScreen, setScreen }: { activeScreen: CareerScreen, setScreen: (screen: CareerScreen) => void }) => {
    const navItems = [
        { name: 'Home', screen: 'DASHBOARD' as CareerScreen, icon: Home },
        { name: 'Stats', screen: 'STATS' as CareerScreen, icon: BarChart3 },
        { name: 'Database', screen: 'PLAYER_DATABASE' as CareerScreen, icon: Database },
        { name: 'Awards', screen: 'AWARDS_RECORDS' as CareerScreen, icon: Trophy },
        { name: 'Settings', screen: 'SETTINGS' as CareerScreen, icon: SettingsIcon },
    ];
    return (
        <nav className="bg-[#050808]/95 border-t border-white/5 flex justify-around items-center h-16 md:h-20 backdrop-blur-3xl sticky bottom-0 z-50 px-1 md:px-2">
            {navItems.map(item => {
                const isActive = activeScreen === item.screen;
                return (
                    <button
                        key={item.name}
                        onClick={() => setScreen(item.screen)}
                        className={`flex flex-col items-center justify-center gap-0.5 md:gap-1 transition-all duration-300 w-1/5 ${isActive ? 'text-teal-500 scale-105' : 'text-white/30 hover:text-white/60'}`}
                    >
                        <div className={`p-1.5 md:p-2 rounded-lg md:rounded-xl transition-all duration-300 ${isActive ? 'bg-teal-500/10 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : ''}`}>
                            <item.icon className={`w-[18px] h-[18px] md:w-[22px] md:h-[22px] ${isActive ? 'stroke-[2.5px]' : 'stroke-[1.5px]'}`} />
                        </div>
                        <span className="text-[7px] md:text-[9px] font-black uppercase tracking-widest">{item.name}</span>
                    </button>
                );
            })}
        </nav>
    );
};

const CareerHub: React.FC<CareerHubProps> = ({ gameData, setGameData, onResetGame, theme, setTheme, saveGame, loadGame, showFeedback }) => {
    const [screen, setScreen] = useState<CareerScreen>('DASHBOARD');
    const [matchStartMode, setMatchStartMode] = useState<'play' | 'simulate'>('play');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [playerProfileFormat, setPlayerProfileFormat] = useState<Format>(gameData.currentFormat);
    const [selectedMatchResult, setSelectedMatchResult] = useState<MatchResult | null>(null);
    const [forwardSimResults, setForwardSimResults] = useState<MatchResult[]>([]);

    const [isAutoSimulating, setIsAutoSimulating] = useState(false);

    const { runSimulationForCurrentFormat, updateStatsFromMatch } = useSimulation(gameData, setGameData);

    useEffect(() => {
        if (gameData && (gameData.sponsorships === undefined || gameData.popularity === undefined || gameData.news === undefined)) {
             setGameData(prev => {
                 if (!prev) return null;
                 return {
                     ...prev,
                     popularity: prev.popularity ?? 50,
                     sponsorships: prev.sponsorships ?? INITIAL_SPONSORSHIPS,
                     news: prev.news ?? INITIAL_NEWS
                 };
             });
        }
    }, [gameData, setGameData]);

    const userTeam = useMemo(() => {
        return gameData.teams.find(t => t.id === gameData.userTeamId) || gameData.teams[0];
    }, [gameData]);

    useEffect(() => {
        if (!gameData || !gameData.schedule || !gameData.currentFormat || !gameData.currentMatchIndex) return;

        const schedule = gameData.schedule[gameData.currentFormat];
        const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];

        if (schedule && currentMatchIndex >= schedule.length) {
            const awardExists = gameData.awardsHistory?.some(a => a.season === gameData.currentSeason && a.format === gameData.currentFormat);
            
            if (!awardExists) {
                const formatStats = new Map();
                gameData.teams?.forEach(team => {
                    if (team.squad) {
                        team.squad.forEach(player => {
                            const p = getPlayerById(player.id, gameData.allPlayers || []);
                            if (p && p.stats && p.stats[gameData.currentFormat]) {
                               formatStats.set(p.id, { 
                                   runs: p.stats[gameData.currentFormat].runs || 0, 
                                   wickets: p.stats[gameData.currentFormat].wickets || 0, 
                                   teamName: team.name, 
                                   playerName: p.name 
                               })
                            }
                        });
                    }
                });

                const sortedBatters = [...formatStats.entries()].sort((a, b) => b[1].runs - a[1].runs);
                const sortedBowlers = [...formatStats.entries()].sort((a, b) => b[1].wickets - a[1].wickets);

                const finalMatch = schedule[schedule.length - 1];
                const finalMatchNumber = finalMatch?.matchNumber;
                const lastMatchResults = gameData.matchResults?.[gameData.currentFormat] || [];
                const lastMatchResult = finalMatchNumber ? lastMatchResults.find(r => r && r.matchNumber === finalMatchNumber) : null;
                const winnerTeam = gameData.teams?.find(t => t.id === lastMatchResult?.winnerId);

                const newAward = { 
                    season: gameData.currentSeason, 
                    format: gameData.currentFormat, 
                    winnerTeamId: winnerTeam?.id || '', 
                    winnerTeamName: winnerTeam?.name || 'N/A', 
                    bestBatter: { playerId: sortedBatters[0]?.[0] || '', playerName: sortedBatters[0]?.[1]?.playerName || 'N/A', teamName: sortedBatters[0]?.[1]?.teamName || 'N/A', runs: sortedBatters[0]?.[1]?.runs || 0 }, 
                    bestBowler: { playerId: sortedBowlers[0]?.[0] || '', playerName: sortedBowlers[0]?.[1]?.playerName || 'N/A', teamName: sortedBowlers[0]?.[1]?.teamName || 'N/A', wickets: sortedBowlers[0]?.[1]?.wickets || 0 } 
                };

                setGameData(prev => prev ? { ...prev, awardsHistory: [...(prev.awardsHistory || []), newAward] } : null);
                // Use setTimeout to avoid synchronous setState in effect
                setTimeout(() => setScreen('END_OF_FORMAT'), 0);
            }
        }
    }, [gameData, setGameData]);

    const updateAISquadsInData = (data: GameData) => {
        return updateAISquads(data);
    };

    const checkT20SmashTransitions = useCallback((data: GameData): GameData => {
        if (data.currentFormat !== Format.T20_SMASH) return data;
        const currentIndex = data.currentMatchIndex[Format.T20_SMASH];
        const schedule = data.schedule[Format.T20_SMASH] || [];

        // 1. Initial Group Assignment (Self-Correction for existing saves)
        const needsGroupAssignment = data.teams.some(t => !t.initialGroup);
        if (needsGroupAssignment && currentIndex < 56) {
             const teamNamesOrder = [
                'KNIGHTS', 'FALCONS', 'KINGS', 'RIDERS', 'CHARGERS', 'HAWKS', 'WARRIORS', 'EAGLES',
                'PANTHERS', 'GLADIATORS', 'STARS', 'STRIKERS', 'TITANS', 'SIXERS', 'ROYALS', 'BLAZERS'
            ];
            const updatedTeams = data.teams.map(t => {
                const idx = teamNamesOrder.indexOf(t.name.toUpperCase());
                if (idx !== -1) {
                    return { ...t, initialGroup: (idx < 8 ? 'A' : 'B') as any };
                }
                return t;
            });
            return { ...data, teams: updatedTeams };
        }

        // 2. Transition: Group Stage (56 matches) -> Super Sixes
        // If we are at 56 or more, but Super Sixes fixtures haven't been resolved from placeholders
        if (currentIndex >= 56 && currentIndex < 71) {
            const nextMatch = schedule[currentIndex];
            if (nextMatch && nextMatch.teamA === 'TBD') {
                const standings = data.standings[Format.T20_SMASH] || [];
                const teams = data.teams;

                const getTop3 = (groupName: string) => {
                    return standings
                        .filter(s => {
                            const team = teams.find(t => t.id === s.teamId);
                            return team?.initialGroup === groupName;
                        })
                        .sort((a,b) => b.points - a.points || b.netRunRate - a.netRunRate)
                        .slice(0, 3);
                };

                const topA = getTop3('A');
                const topB = getTop3('B');
                
                if (topA.length === 3 && topB.length === 3) {
                    const ssTeams = [...topA, ...topB].map(s => teams.find(t => t.id === s.teamId)!);

                    // Update team groups
                    const updatedTeams = teams.map(t => {
                        if (ssTeams.find(ss => ss.id === t.id)) {
                            return { ...t, group: 'Super Sixes' as any };
                        }
                        return t;
                    });

                    // Generate SS Fixtures
                    const ssMatches: Match[] = [];
                    for (let i = 0; i < ssTeams.length; i++) {
                        for (let j = i + 1; j < ssTeams.length; j++) {
                            ssMatches.push({
                                matchNumber: `SS${ssMatches.length + 1}`,
                                teamA: ssTeams[i].name,
                                teamAId: ssTeams[i].id,
                                vs: 'vs',
                                teamB: ssTeams[j].name,
                                teamBId: ssTeams[j].id,
                                date: `Super Sixes - Rd ${ssMatches.length + 1}`,
                                group: 'Super Sixes' as any
                            });
                        }
                    }

                    const newSchedule = [...schedule];
                    ssMatches.forEach((m, i) => {
                        newSchedule[56 + i] = m;
                    });

                    const ssNews: NewsArticle = {
                        id: `super-sixes-${data.currentSeason}`,
                        headline: "Super Sixes Stage Activated!",
                        date: new Date().toLocaleDateString(),
                        excerpt: "The battle for supremacy continues.",
                        content: `The Super Sixes are: ${ssTeams.map(t => t.name).join(', ')}.`,
                        type: 'league'
                    };

                    return { 
                        ...data, 
                        teams: updatedTeams,
                        schedule: { ...data.schedule, [Format.T20_SMASH]: newSchedule },
                        news: [ssNews, ...(data.news || [])].slice(0, 50) 
                    };
                }
            }
        }

        // 3. Transition: Super Sixes -> Knockouts Transition
        if (currentIndex >= 71 && currentIndex < 74) {
            const nextMatch = schedule[currentIndex];
            if (nextMatch && (nextMatch.teamA === '1st SS' || nextMatch.teamAId === undefined)) {
                // ... news logic etc handled in resolveMatch more dynamically, but we can add news here
                const newsId = `knockouts-start-${data.currentSeason}`;
                if (!data.news?.some(n => n.id === newsId)) {
                     const standings = data.standings[Format.T20_SMASH] || [];
                     const ssStandings = standings
                        .filter(s => {
                            const team = data.teams.find(t => t.id === s.teamId);
                            return team?.group === 'Super Sixes';
                        })
                        .sort((a,b) => b.points - a.points || b.netRunRate - a.netRunRate);

                    const top4 = ssStandings.slice(0, 4);
                    if (top4.length === 4) {
                         const knockoutsNews: NewsArticle = {
                            id: newsId,
                            headline: "T20 Smash: The Final Four!",
                            date: new Date().toLocaleDateString(),
                            excerpt: "Semi-final match-ups confirmed.",
                            content: `Road to the trophy: ${top4.map(s => s.teamName).join(', ')}.`,
                            type: 'league'
                        };
                        return { ...data, news: [knockoutsNews, ...(data.news || [])].slice(0, 50) };
                    }
                }
            }
        }
        return data;
    }, []);

    const handleUpdatePlayer = async (updatedPlayer: Player) => {
        setGameData(prevData => {
            if (!prevData) return null;
            const newAllPlayers = prevData.allPlayers.map(p => p.id === updatedPlayer.id ? updatedPlayer : p);
            const newTeams = prevData.teams.map(team => ({
                ...team,
                squad: team.squad.map(squadPlayer => newAllPlayers.find(p => p.id === squadPlayer.id) || squadPlayer)
            }));
            return { ...prevData, allPlayers: newAllPlayers, teams: newTeams };
        });

        try {
            await setDoc(doc(db, 'players', updatedPlayer.id), updatedPlayer);
        } catch (error) {
            console.error("Error saving player to Firestore:", error);
        }
    };

    const handleCreatePlayer = async (newPlayer: Player) => {
        setGameData(prevData => {
            if (!prevData) return null;
            return { ...prevData, allPlayers: [...prevData.allPlayers, newPlayer] };
        });

        try {
            await setDoc(doc(db, 'players', newPlayer.id), newPlayer);
        } catch (error) {
            console.error("Error creating player in Firestore:", error);
        }
    };

    const handleUpdateGround = (code: string, updates: string | Partial<Ground>) => {
        setGameData(prev => {
            if (!prev) return null;
            return {
                ...prev,
                grounds: prev.grounds.map(g => {
                    if (g.code === code) {
                        return typeof updates === 'string' ? { ...g, pitch: updates } : { ...g, ...updates };
                    }
                    return g;
                })
            };
        });
    };
    
    const handleUpdateScoreLimits = (groundCode: string, format: Format, field: any, value: any, inning: number) => {
        setGameData(prev => {
            if (!prev) return null;
            const numValue = parseInt(value, 10);
            const newLimits: any = JSON.parse(JSON.stringify(prev.scoreLimits || {}));
            if (!newLimits[groundCode]) newLimits[groundCode] = {};
            if (!newLimits[groundCode][format]) newLimits[groundCode][format] = {};
            if (!newLimits[groundCode][format][inning]) newLimits[groundCode][format][inning] = {};
            
            if (value === '' || isNaN(numValue) || numValue <= 0) {
                delete newLimits[groundCode][format][inning][field];
            } else {
                newLimits[groundCode][format][inning][field] = numValue;
            }
            
            return { ...prev, scoreLimits: newLimits };
        });
    };

    const handleUpdateCaptain = (teamId: string, format: Format, playerId: string) => {
        setGameData(prevData => {
            if (!prevData) return null;
            return {
                ...prevData,
                teams: prevData.teams.map(t => {
                    if (t.id === teamId) {
                        return { ...t, captains: { ...t.captains, [format]: playerId } };
                    }
                    return t;
                })
            };
        });
        showFeedback("Captain updated!");
    };

    const handleUpdatePlayingXI = (teamId: string, format: Format, newXI: string[]) => {
        setGameData(prevData => {
            if (!prevData) return null;
            const teamXIs = prevData.playingXIs[teamId] || {};
            return {
                ...prevData,
                playingXIs: {
                    ...prevData.playingXIs,
                    [teamId]: {
                        ...teamXIs,
                        [format]: newXI
                    }
                }
            };
        });
    };

    const handleUpdateBowlingPlan = (teamId: string, format: Format, newPlan: Record<number, string>) => {
        setGameData(prevData => {
            if (!prevData) return null;
            const teamPlans = prevData.bowlingPlans[teamId] || {};
            return {
                ...prevData,
                bowlingPlans: {
                    ...prevData.bowlingPlans,
                    [teamId]: {
                        ...teamPlans,
                        [format]: newPlan
                    }
                }
            };
        });
    };

    const simulateBackgroundMatches = useCallback((currentData: GameData): GameData => {
        if (!currentData || !currentData.schedule || !currentData.currentMatchIndex) return currentData;
        let updatedData = JSON.parse(JSON.stringify(currentData)) as GameData;
        const formats = Object.values(Format);
        formats.forEach(f => {
            if (f === updatedData.currentFormat) return; 

            const schedule = updatedData.schedule[f];
            let mIdx = updatedData.currentMatchIndex[f];
            if (!schedule || mIdx === undefined) return;
            
            for (let i = 0; i < 8; i++) {
                if (mIdx < schedule.length) {
                    const match = resolveMatch(schedule[mIdx], updatedData, f);
                    if (match.teamA === 'TBD' || match.teamB === 'TBD' || match.teamA.includes('st') || match.teamA.includes('nd') || match.teamA.includes('SF')) break;

                    const result = runSimulationForCurrentFormat(match, updatedData);
                    updatedData = updateStatsFromMatch(result, f, updatedData);
                    updatedData.currentMatchIndex[f]++;
                    updatedData = checkT20SmashTransitions(updatedData);
                    mIdx++;
                }
            }
        });
        return updatedData;
    }, [runSimulationForCurrentFormat, updateStatsFromMatch, checkT20SmashTransitions]);

    const handleForwardDay = useCallback(() => {
        if (!userTeam) return;
        let currentData = { ...gameData };
        let matchIndex = currentData.currentMatchIndex[currentData.currentFormat];
        const schedule = currentData.schedule[currentData.currentFormat] || [];
        const results: MatchResult[] = [];
        const newNewsItems: NewsArticle[] = [];

        currentData = simulateBackgroundMatches(currentData);

        for(let i=0; i<5; i++) {
            if (matchIndex + i < schedule.length) {
                const m = resolveMatch(schedule[matchIndex+i], currentData, currentData.currentFormat);
                if (m.teamA === userTeam.name || m.teamB === userTeam.name) {
                    const preNews = generatePreMatchNews(m, currentData);
                    newNewsItems.push(preNews);
                    break;
                }
            }
        }

        let simulatedCount = 0;
        const maxSimulations = 8;

        while (matchIndex < schedule.length && simulatedCount < maxSimulations) {
            const matchToSim = resolveMatch(schedule[matchIndex], currentData, currentData.currentFormat);
            
            if (matchToSim.teamA === 'TBD' || matchToSim.teamB === 'TBD' || matchToSim.teamA.includes('st') || matchToSim.teamA.includes('nd') || matchToSim.teamA.includes('SF')) break;

            const isUserTeamMatch = matchToSim.teamA === userTeam.name || matchToSim.teamB === userTeam.name;
            if (isUserTeamMatch) break;

            const result = runSimulationForCurrentFormat(matchToSim, currentData);
            currentData = updateStatsFromMatch(result, currentData.currentFormat, currentData);
            
            // Simulate Injuries
            currentData = simulateInjuries(currentData, result);
            // Update AI Squads
            currentData = updateAISquads(currentData);

            if (currentData.currentMatchIndex && currentData.currentMatchIndex[currentData.currentFormat] !== undefined) {
                currentData.currentMatchIndex[currentData.currentFormat]++; 
                currentData = checkT20SmashTransitions(currentData);
            }
            results.push(result);
            simulatedCount++;
            matchIndex++;
            
            if (matchToSim.group !== 'Round-Robin' || Math.random() < 0.3) {
                const sponsorship = currentData.sponsorships?.[currentData.currentFormat] || INITIAL_SPONSORSHIPS[currentData.currentFormat];
                newNewsItems.push(generateMatchNews(result, currentData.currentFormat, sponsorship));
            }
            
            matchIndex++;
        }

        if (newNewsItems.length > 0) currentData.news = [...newNewsItems, ...(currentData.news || [])].slice(0, 50);

        if (results.length > 0) {
            setForwardSimResults(results);
            setGameData(currentData); 
            setScreen('FORWARD_RESULTS');
        } else {
             if (matchIndex < schedule.length) {
                 if (newNewsItems.length > 0) {
                     setGameData(prev => prev ? { ...prev, news: [...newNewsItems, ...(prev.news || [])] } : null);
                 }
                 showFeedback("Match 1 or upcoming user match is next.", "success");
             } else {
                 showFeedback("Tournament matches completed.", "success");
             }
        }
    }, [userTeam, gameData, runSimulationForCurrentFormat, updateStatsFromMatch, checkT20SmashTransitions, setGameData, showFeedback, simulateBackgroundMatches]);

    const runOneAutoSim = useCallback(() => {
        setGameData(prev => {
            if (!prev || !userTeam) return prev;
            const currentFormat = prev.currentFormat;
            const schedule = prev.schedule[currentFormat];
            const currentIndex = prev.currentMatchIndex[currentFormat];
            
            if (currentIndex >= schedule.length) {
                setIsAutoSimulating(false);
                return prev;
            }

            const match = resolveMatch(schedule[currentIndex], prev, currentFormat);
            const isUserTeamMatch = match.teamA === userTeam.name || match.teamB === userTeam.name;

            if (isUserTeamMatch) {
                setIsAutoSimulating(false);
                return prev;
            }

            if (match.teamA === 'TBD' || match.teamB === 'TBD' || match.teamA.includes('st') || match.teamA.includes('nd') || match.teamA.includes('SF')) {
                setIsAutoSimulating(false);
                return prev;
            }

            const result = runSimulationForCurrentFormat(match, prev);
            let updatedData = updateStatsFromMatch(result, currentFormat, prev);
            updatedData = simulateInjuries(updatedData, result);
            updatedData = updateAISquads(updatedData);
            updatedData.currentMatchIndex[currentFormat]++;
            updatedData = checkT20SmashTransitions(updatedData);

            const sponsorship = updatedData.sponsorships?.[currentFormat] || INITIAL_SPONSORSHIPS[currentFormat];
            const newsItem = generateMatchNews(result, currentFormat, sponsorship);
            updatedData.news = [newsItem, ...(updatedData.news || [])].slice(0, 50);
            
            return updatedData;
        });
    }, [userTeam, runSimulationForCurrentFormat, updateStatsFromMatch, checkT20SmashTransitions, setGameData]);

    useEffect(() => {
        let timer: any;
        if (isAutoSimulating) {
            timer = setInterval(() => {
                runOneAutoSim();
            }, 800); // 800ms delay between matches for "slow simulation"
        }
        return () => clearInterval(timer);
    }, [isAutoSimulating, runOneAutoSim]);

    const handleSkipToMyMatch = () => {
        if (!userTeam) return;
        setIsAutoSimulating(true);
        showFeedback("Auto-Simulating to your match...", "success");
    };

    const handlePlayMatch = () => {
        if (!userTeam || !gameData.schedule || !gameData.currentMatchIndex) return;
        
        const schedule = gameData.schedule[gameData.currentFormat];
        const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
        if (schedule === undefined || currentMatchIndex === undefined || currentMatchIndex >= schedule.length) return;

        const matchToSim = resolveMatch(schedule[currentMatchIndex], gameData, gameData.currentFormat);

        if (matchToSim.teamA === 'TBD' || matchToSim.teamB === 'TBD' || matchToSim.teamA.includes('st') || matchToSim.teamB.includes('SF')) {
            showFeedback("Waiting for league stage to conclude.", "error");
            return;
        }

        const isUserTeamMatch = matchToSim.teamA === userTeam.name || matchToSim.teamB === userTeam.name;

        if (isUserTeamMatch) {
             setMatchStartMode('play');
             // Update AI Squads one last time before match
             const updatedData = updateAISquads(gameData);
             setGameData(updatedData);
             setScreen('MATCH_STRATEGY');
        } else {
             const result = runSimulationForCurrentFormat(matchToSim, gameData);
             let updatedData = updateStatsFromMatch(result, gameData.currentFormat, gameData);
             
             // Simulate Injuries
             updatedData = simulateInjuries(updatedData, result);
             // Update AI Squads
             updatedData = updateAISquads(updatedData);

             if (updatedData.currentMatchIndex && updatedData.currentMatchIndex[gameData.currentFormat] !== undefined) {
                 updatedData.currentMatchIndex[gameData.currentFormat]++;
                 updatedData = checkT20SmashTransitions(updatedData);
             }
             const sponsorship = updatedData.sponsorships?.[updatedData.currentFormat] || INITIAL_SPONSORSHIPS[updatedData.currentFormat];
             const newsItem = generateMatchNews(result, updatedData.currentFormat, sponsorship);
             updatedData.news = [newsItem, ...(updatedData.news || [])].slice(0, 50);
             setGameData(updatedData);
             setSelectedMatchResult(result);
             setScreen('MATCH_RESULT');
        }
    };

    const handleSimulateWithPlay = () => {
        if (!userTeam || !gameData.schedule || !gameData.currentMatchIndex) return;
        
        const schedule = gameData.schedule[gameData.currentFormat];
        const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
        if (schedule === undefined || currentMatchIndex === undefined || currentMatchIndex >= schedule.length) return;

        const matchToSim = resolveMatch(schedule[currentMatchIndex], gameData, gameData.currentFormat);

        if (matchToSim.teamA === 'TBD' || matchToSim.teamB === 'TBD' || matchToSim.teamA.includes('st') || matchToSim.teamB.includes('SF')) {
            showFeedback("Waiting for league stage to conclude.", "error");
            return;
        }

        const isUserTeamMatch = matchToSim.teamA === userTeam.name || matchToSim.teamB === userTeam.name;

        if (isUserTeamMatch) {
             setMatchStartMode('simulate');
             // Update AI Squads one last time before match
             const updatedData = updateAISquads(gameData);
             setGameData(updatedData);
             setScreen('MATCH_STRATEGY');
        } else {
             handlePlayMatch();
        }
    };

    const handleQuickSimulate = () => {
        if (!userTeam || !gameData.schedule || !gameData.currentMatchIndex) return;
        
        const schedule = gameData.schedule[gameData.currentFormat];
        const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
        if (schedule === undefined || currentMatchIndex === undefined || currentMatchIndex >= schedule.length) return;

        const matchToSim = resolveMatch(schedule[currentMatchIndex], gameData, gameData.currentFormat);

        if (matchToSim.teamA === 'TBD' || matchToSim.teamB === 'TBD' || matchToSim.teamA.includes('st') || matchToSim.teamB.includes('SF')) {
            showFeedback("Waiting for league stage to conclude.", "error");
            return;
        }

        const result = runSimulationForCurrentFormat(matchToSim, gameData);
        let updatedData = updateStatsFromMatch(result, gameData.currentFormat, gameData);
        
        // Simulate Injuries
        updatedData = simulateInjuries(updatedData, result);
        // Update AI Squads
        updatedData = updateAISquads(updatedData);

        if (updatedData.currentMatchIndex && updatedData.currentMatchIndex[gameData.currentFormat] !== undefined) {
            updatedData.currentMatchIndex[gameData.currentFormat]++;
            updatedData = checkT20SmashTransitions(updatedData);
        }
        const sponsorship = updatedData.sponsorships?.[updatedData.currentFormat] || INITIAL_SPONSORSHIPS[updatedData.currentFormat];
        const newsItem = generateMatchNews(result, updatedData.currentFormat, sponsorship);
        updatedData.news = [newsItem, ...(updatedData.news || [])].slice(0, 50);
        setGameData(updatedData);
        setSelectedMatchResult(result);
        setScreen('MATCH_RESULT');
    };

    const handleLiveMatchComplete = (result: MatchResult) => {
        let updatedData = updateStatsFromMatch(result, gameData.currentFormat, gameData);
        
        // Simulate Injuries
        updatedData = simulateInjuries(updatedData, result);
        // Update AI Squads
        updatedData = updateAISquads(updatedData);

        updatedData.currentMatchIndex[gameData.currentFormat]++;
        updatedData = checkT20SmashTransitions(updatedData);
        updatedData.activeMatch = null; 
        const sponsorship = updatedData.sponsorships?.[updatedData.currentFormat] || INITIAL_SPONSORSHIPS[updatedData.currentFormat];
        const newsItem = generateMatchNews(result, updatedData.currentFormat, sponsorship);
        updatedData.news = [newsItem, ...updatedData.news].slice(0, 50);
        setGameData(updatedData);
        setSelectedMatchResult(result);
        setScreen('MATCH_RESULT');
    };

    const handleLiveMatchExit = (stateToSave?: LiveMatchState) => {
        if (stateToSave) {
            setGameData(prev => prev ? { ...prev, activeMatch: stateToSave } : null);
            showFeedback("Match progress saved.", "success");
        } else setGameData(prev => prev ? { ...prev, activeMatch: null } : null);
        setScreen('DASHBOARD');
    }

    const handleFormatChange = useCallback((newFormat: Format) => {
        setGameData(prev => prev ? ({ ...prev, currentFormat: newFormat }) : null);
        setScreen('DASHBOARD');
    }, [setGameData]);

    const handleEndOfSeason = useCallback((retainedPlayers: Player[]) => {
        setGameData((prevData: GameData | null) => {
            if (!prevData) return null;
            
            const STARTING_PURSE = 50.0;
            const RETENTION_BUDGET = 30.0;

            const calculateAsk = (player: Player) => {
                const skill = Math.max(player.battingSkill, player.secondarySkill);
                let baseAsk = 1.0;
                if (skill > 85) baseAsk = 12.0;
                else if (skill > 80) baseAsk = 8.0;
                else if (skill > 75) baseAsk = 5.0;
                else if (skill > 70) baseAsk = 3.0;
                else if (skill > 60) baseAsk = 1.5;

                let perfMultiplier = 1.0;
                const formats = Object.values(Format);
                let totalRuns = 0;
                let totalWickets = 0;
                formats.forEach(f => {
                    const s = player.stats ? player.stats[f] : null;
                    if (s) { totalRuns += s.runs; totalWickets += s.wickets; }
                });
                if (totalRuns > 1000) perfMultiplier += 0.5;
                else if (totalRuns > 600) perfMultiplier += 0.3;
                else if (totalRuns > 300) perfMultiplier += 0.15;
                if (totalWickets > 30) perfMultiplier += 0.5;
                else if (totalWickets > 20) perfMultiplier += 0.3;
                else if (totalWickets > 10) perfMultiplier += 0.15;

                return Number((baseAsk * perfMultiplier).toFixed(2));
            };

            const userRetentionCost = retainedPlayers.reduce((sum, p) => sum + calculateAsk(p), 0);

            const newTeams = prevData.teams.map(t => {
                if (t.id === prevData.userTeamId) {
                    const reduction = t.nextYearBudgetReduction || 0;
                    return { 
                        ...t, 
                        squad: retainedPlayers, 
                        purse: Number((STARTING_PURSE + Math.max(0, RETENTION_BUDGET - userRetentionCost) - reduction).toFixed(2)),
                        nextYearBudgetReduction: 0 
                    };
                }
                
                // AI Retention Logic
                let aiRetentionSpent = 0;
                const aiRetained: Player[] = [];
                const sortedSquad = [...t.squad].sort((a,b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
                
                for (const p of sortedSquad) {
                    const ask = calculateAsk(p);
                    if (aiRetentionSpent + ask <= RETENTION_BUDGET && aiRetained.length < 6) {
                        aiRetained.push(p);
                        aiRetentionSpent += ask;
                    }
                }

                return { ...t, squad: aiRetained, purse: STARTING_PURSE + Math.max(0, RETENTION_BUDGET - aiRetentionSpent) };
            });

            const initialStandings = (teams: Team[]) => teams.map(team => ({ teamId: team.id, teamName: team.name, played: 0, won: 0, lost: 0, drawn: 0, points: 0, netRunRate: 0, runsFor: 0, runsAgainst: 0, oversFor: 0, oversAgainst: 0 }));

            const seasonNews: NewsArticle = { 
                id: `s${prevData.currentSeason}-end`, 
                headline: `Season ${prevData.currentSeason+1} Draft Room Open!`, 
                date: new Date().toLocaleDateString(), 
                excerpt: "Teams reveal retained players.", 
                content: "Windows for retention have closed. Teams are heading to the auction floor with updated budgets.", 
                type: 'league' as const
            };

            return {
                ...prevData,
                currentSeason: prevData.currentSeason + 1,
                currentFormat: Format.T20_SMASH,
                currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
                matchResults: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, MatchResult[]>),
                standings: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: initialStandings(newTeams) }), {} as Record<Format, Standing[]>),
                schedule: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: generateLeagueSchedule(newTeams, f) }), {} as Record<Format, Match[]>),
                teams: newTeams,
                news: [seasonNews, ...prevData.news].slice(0, 50)
            };
        });
        setScreen('SEASON_SUMMARY');
    }, [setGameData]);

    const handleSeasonSummaryComplete = (updatedPlayers: Player[]) => {
        setGameData(prev => {
            if (!prev) return null;
            const newTeams = prev.teams.map(team => ({
                ...team,
                squad: team.squad.map(p => updatedPlayers.find(up => up.id === p.id) || p)
            }));
            return { ...prev, allPlayers: updatedPlayers, teams: newTeams };
        });
        setScreen('AUCTION_ROOM');
    };

    const handleReplacePlayer = (playerId: string) => {
        const playerToReplace = gameData.allPlayers.find(p => p.id === playerId);
        if (!playerToReplace || !playerToReplace.injury?.isSeasonEnding) return;

        const team = gameData.teams.find(t => t.squad.some(p => p.id === playerId));
        if (!team) return;

        const replacement = generateReplacementPlayer(
            Math.max(playerToReplace.battingSkill, playerToReplace.secondarySkill),
            playerToReplace.role,
            playerToReplace.nationality
        );

        setGameData(prev => {
            if (!prev) return null;
            const newAllPlayers = [...prev.allPlayers, replacement];
            const newTeams = prev.teams.map(t => {
                if (t.id === team.id) {
                    return {
                        ...t,
                        squad: t.squad.map(p => p.id === playerId ? replacement : p)
                    };
                }
                return t;
            });
            
            // Update playing XIs if necessary
            const newPlayingXIs = { ...prev.playingXIs };
            if (newPlayingXIs[team.id]) {
                Object.keys(newPlayingXIs[team.id]).forEach(format => {
                    const xi = newPlayingXIs[team.id][format as Format];
                    if (xi) {
                        newPlayingXIs[team.id][format as Format] = xi.map(id => id === playerId ? replacement.id : id);
                    }
                });
            }

            return { ...prev, allPlayers: newAllPlayers, teams: newTeams, playingXIs: newPlayingXIs };
        });

        setSelectedPlayer(replacement);
        showFeedback(`Player replaced by ${replacement.name}!`, "success");
    };

    const [selectedTeamIdForSquad, setSelectedTeamIdForSquad] = useState<string>(gameData.userTeamId);

    const renderScreen = () => {
        const commonProps = { gameData, userTeam, setGameData, setScreen, showFeedback };
        switch(screen) {
            case 'DASHBOARD': return <Dashboard {...commonProps} handlePlayMatch={handlePlayMatch} handleForwardDay={handleForwardDay} handleSkipToMyMatch={handleSkipToMyMatch} handleQuickSimulate={handleQuickSimulate} handleSimulateWithPlay={handleSimulateWithPlay} />;
            case 'LEAGUES': return <Standings 
                gameData={gameData} 
                onViewScorecard={(result) => {
                    setSelectedMatchResult(result);
                    setScreen('MATCH_RESULT');
                }}
                onViewTeamSquad={(teamId) => {
                    setSelectedTeamIdForSquad(teamId);
                    setScreen('LINEUPS');
                }}
            />; 
            case 'SCHEDULE': return <Schedule gameData={gameData} userTeam={userTeam} viewMatchResult={result => { setSelectedMatchResult(result); setScreen('MATCH_RESULT'); }} />;
            case 'LINEUPS': return <Lineups {...commonProps} initialTeamId={selectedTeamIdForSquad} handleUpdatePlayingXI={handleUpdatePlayingXI} handleUpdateCaptain={handleUpdateCaptain} handleUpdateBowlingPlan={handleUpdateBowlingPlan} handleReplacePlayer={handleReplacePlayer} onViewPlayer={(p) => { setSelectedPlayer(p); setScreen('PLAYER_PROFILE'); }} />;
            case 'EDITOR': return <Editor {...commonProps} handleUpdatePlayer={handleUpdatePlayer} handleCreatePlayer={handleCreatePlayer} handleUpdateGround={handleUpdateGround} handleUpdateScoreLimits={handleUpdateScoreLimits} />;
            case 'PLAYER_DATABASE': return <PlayerDatabase gameData={gameData} onAddPlayer={() => setScreen('EDITOR')} onViewPlayer={(p) => { setSelectedPlayer(p); setScreen('PLAYER_PROFILE'); }} />;
            case 'NEWS': return <News news={gameData.news} />;
            case 'STATS': return <Stats gameData={gameData} viewPlayerProfile={(p, f) => { setSelectedPlayer(p); setPlayerProfileFormat(f); setScreen('PLAYER_PROFILE'); }} />;
            case 'SETTINGS': return <Settings onResetGame={onResetGame} theme={theme} setTheme={setTheme} saveGame={saveGame} loadGame={loadGame} />;
            case 'PLAYER_PROFILE': return <PlayerProfile player={selectedPlayer} onBack={() => setScreen('STATS')} initialFormat={playerProfileFormat} onUpdatePlayer={handleUpdatePlayer} onReplacePlayer={handleReplacePlayer} />;
            case 'MATCH_RESULT': return <MatchResultScreen result={selectedMatchResult} onBack={() => setScreen('DASHBOARD')} userTeamId={gameData.userTeamId} allPlayers={gameData.allPlayers} />;
            case 'FORWARD_RESULTS': return <ForwardResultsScreen results={forwardSimResults} onBack={() => setScreen('DASHBOARD')} userTeamId={gameData.userTeamId} onViewResult={result => { setSelectedMatchResult(result); setScreen('MATCH_RESULT'); }} />;
            case 'AWARDS_RECORDS': return <AwardsAndRecordsScreen gameData={gameData} />;
            case 'END_OF_FORMAT': return <EndOfFormatScreen gameData={gameData} handleFormatChange={handleFormatChange} handleEndSeason={handleEndOfSeason} />;
            case 'TRANSFERS': return <Transfers {...commonProps} />;
            case 'COMPARISON': return <ComparisonScreen gameData={gameData} />;
            case 'SPONSOR_ROOM': return <SponsorRoom gameData={gameData} setGameData={setGameData} />;
            case 'AUCTION_ROOM': return <AuctionRoom gameData={gameData} onViewPlayer={(p) => { setSelectedPlayer(p); setScreen('PLAYER_PROFILE'); }} onAuctionComplete={(teams) => { 
                setGameData(prev => prev ? { ...prev, teams } : null);
                setScreen('DASHBOARD');
            }} />;
            case 'SEASON_SUMMARY': return <SeasonSummary gameData={gameData} onContinue={handleSeasonSummaryComplete} />;
            case 'RATING_BOARD': return <ModernRatingBoard players={gameData.allPlayers} currentFormat={gameData.currentFormat} />;
            case 'CAPTAINS_CORNER': return <CaptainsCorner gameData={gameData} userTeam={userTeam} onBack={() => setScreen('DASHBOARD')} />;
            case 'MATCH_STRATEGY': {
                const schedule = gameData.schedule[gameData.currentFormat];
                const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
                const match = schedule[currentMatchIndex];
                
                const playingXIIds = gameData.playingXIs[userTeam.id]?.[gameData.currentFormat] || userTeam.squad.slice(0, 11).map(p => p.id);
                const playingXI = playingXIIds.map(id => userTeam.squad.find(p => p.id === id)).filter(Boolean) as Player[];

                return <MatchStrategy 
                    userTeam={userTeam} 
                    playingXI={playingXI}
                    match={match} 
                    format={gameData.currentFormat}
                    onComplete={(battingOrder) => {
                        handleUpdatePlayingXI(userTeam.id, gameData.currentFormat, battingOrder);
                        setScreen('LIVE_MATCH');
                    }}
                    onBack={() => setScreen('DASHBOARD')}
                />;
            }
            case 'LIVE_MATCH': {
                const schedule = gameData.schedule[gameData.currentFormat];
                const currentMatchIndex = gameData.currentMatchIndex[gameData.currentFormat];
                const match = schedule[currentMatchIndex];
                const resolvedMatch = match ? JSON.parse(JSON.stringify(match)) : null;
                if (resolvedMatch) {
                    const resolvePlaceholder = (placeholder: string) => {
                        if (['1st', '2nd', '3rd', '4th'].includes(placeholder)) {
                            const pos = parseInt(placeholder[0]);
                            return gameData.standings[gameData.currentFormat][pos-1]?.teamName || 'TBD';
                        }
                        if (placeholder.startsWith('SF')) {
                            const sfMatchNumber = placeholder.split(' ')[0];
                            const sfResult = gameData.matchResults[gameData.currentFormat].find(r => r && r.matchNumber === sfMatchNumber);
                            return gameData.teams.find(t => t.id === sfResult?.winnerId)?.name || 'TBD';
                        }
                        return placeholder;
                    };
                    resolvedMatch.teamA = resolvePlaceholder(resolvedMatch.teamA);
                    resolvedMatch.teamB = resolvePlaceholder(resolvedMatch.teamB);
                }
                return resolvedMatch ? (
                    <LiveMatchScreen match={resolvedMatch} gameData={gameData} onMatchComplete={handleLiveMatchComplete} onExit={handleLiveMatchExit} startMode={matchStartMode} setGameData={setGameData} /> 
                ) : <div className="p-4 text-center"><p>Tournament finished.</p><button onClick={() => setScreen('DASHBOARD')} className="mt-4 bg-teal-500 text-white px-4 py-2 rounded">Back</button></div>;
            }
            default: return <div>Coming Soon</div>
        }
    }

    return (
        <div className="flex flex-col h-full bg-[#050808] text-[#E4E3E0] font-sans">
            <main className="flex-grow overflow-hidden relative">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={screen}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="h-full"
                    >
                        {renderScreen()}
                    </motion.div>
                </AnimatePresence>
            </main>
            <BottomNavBar activeScreen={screen} setScreen={setScreen} />
        </div>
    );
};

export default CareerHub;
