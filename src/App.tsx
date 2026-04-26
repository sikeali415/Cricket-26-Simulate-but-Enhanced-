import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameData, Team, Format, MatchResult, Standing, Player, Match, Inning } from './types';
import { PLAYERS, TEAMS, GROUNDS, PRE_BUILT_SQUADS, INITIAL_SPONSORSHIPS, INITIAL_NEWS, generateSingleFormatInitialStats } from './data';
import { LoadingSpinner, generateLeagueSchedule, checkGlobalSquadUniqueness, calculateTeamRatings } from './utils';
import ConfirmModal from './components/ConfirmModal';
import { Icons } from './components/Icons';

// Components
import MainMenu from './components/MainMenu';
import TeamSelection from './components/TeamSelection';
import CareerHub from './components/CareerHub';
import AuctionRoom from './components/AuctionRoom';
import Lineups from './components/Lineups';
import Editor from './components/Editor';

export const MAX_SQUAD_SIZE = 16;
export const MIN_SQUAD_SIZE = 16;
export const MAX_FOREIGN_PLAYERS = 9;

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 3000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <motion.div 
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] bg-[#050808] flex flex-col items-center justify-center p-6 text-center overflow-hidden"
    >
      {/* Background Accents */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="relative z-10 flex flex-col items-center"
      >
        <div className="w-48 h-48 md:w-64 md:h-64 mb-8 relative">
          <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
          <div className="w-full h-full glass-card flex items-center justify-center p-8 border-2 border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.2)] rounded-[40px]">
            <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-500" />
              <text x="50" y="65" fontFamily="Outfit" fontSize="40" fontWeight="900" fill="white" textAnchor="middle">S26</text>
            </svg>
          </div>
        </div>

        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
            SIKE'S <span className="text-teal-500">SUPER SMASH</span> 26
          </h1>
          <p className="text-[10px] md:text-xs font-black text-white/30 uppercase tracking-[0.6em]">SEASON 1 // OFFICIAL_BROADCAST</p>
        </div>

        <div className="mt-12 flex items-center gap-4 text-white/20">
          <div className="flex items-center gap-2">
            <Icons.Smartphone className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-widest">PWA_READY</span>
          </div>
          <div className="w-1 h-1 rounded-full bg-white/10" />
          <div className="flex items-center gap-2">
            <Icons.Download className="w-4 h-4" />
            <span className="text-[8px] font-black uppercase tracking-widest">OFFLINE_ENABLED</span>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-8 text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">
        © 2026 SIKE_GAMES_STUDIO // ALL_RIGHTS_RESERVED
      </div>
    </motion.div>
  );
};

const GameCover = ({ onStart, isInstallable, onInstall }: { onStart: () => void; isInstallable: boolean; onInstall: () => void }) => {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[90] bg-[#050808] flex flex-col items-center justify-center p-6 md:p-12 overflow-hidden font-sans"
        >
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center w-full max-w-md"
            >
                <div className="w-48 h-48 md:w-64 md:h-64 mb-8 relative">
                    <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
                    <div className="w-full h-full glass-card flex items-center justify-center p-8 border-2 border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.2)] rounded-[40px]">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                            <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-500" />
                            <text x="50" y="65" fontFamily="Outfit" fontSize="40" fontWeight="900" fill="white" textAnchor="middle">S26</text>
                        </svg>
                    </div>
                </div>

                <div className="text-center space-y-2 mb-12">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                        SIKE'S <span className="text-teal-500">SUPER SMASH</span> 26
                    </h1>
                    <p className="text-[10px] md:text-xs font-black text-white/30 uppercase tracking-[0.6em]">SEASON 1 // OFFICIAL_BROADCAST</p>
                </div>

                <motion.button
                    whileHover={{ scale: 1.05, y: -5 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onStart}
                    className="w-full py-5 bg-teal-500 text-black font-black uppercase tracking-[0.3em] text-sm rounded-2xl shadow-[0_10px_30px_rgba(20,184,166,0.3)] transition-all"
                >
                    INITIALIZE_SYSTEM
                </motion.button>

                <div className="mt-12 flex items-center gap-4 text-white/20">
                    <div className="flex items-center gap-2">
                        <Icons.Smartphone className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">PWA_READY</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Icons.Download className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">OFFLINE_ENABLED</span>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">
                © 2026 SIKE_GAMES_STUDIO // ALL_RIGHTS_RESERVED
            </div>
        </motion.div>
    );
};

export type AppState = 'MAIN_MENU' | 'TEAM_SELECTION' | 'AUCTION' | 'CAREER_HUB' | 'EDITOR';

export const App = () => {
  const [appState, setAppState] = useState<AppState>('MAIN_MENU');
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [showCover, setShowCover] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [hasSaveData, setHasSaveData] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'warning'
  });

  useEffect(() => {
    const savedTheme = localStorage.getItem('cricketManagerTheme') || 'dark';
    setTheme(savedTheme as 'light' | 'dark');
    const savedGame = localStorage.getItem('cricketManagerSave');
    if (savedGame) {
        setHasSaveData(true);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (theme === 'light') {
        document.documentElement.classList.remove('dark');
    } else {
        document.documentElement.classList.add('dark');
    }
    localStorage.setItem('cricketManagerTheme', theme);
  }, [theme]);

  useEffect(() => {
    if (gameData && !isLoading) {
      localStorage.setItem('cricketManagerSave', JSON.stringify(gameData));
      setHasSaveData(true);
    }
  }, [gameData, isLoading]);

  const showFeedback = (text: string, type: 'success' | 'error' = 'success') => {
    setFeedbackMessage({ text, type });
    setTimeout(() => setFeedbackMessage(null), 2500);
  };

  const saveGame = () => {
    showFeedback("Progress is saved automatically!");
  };

  const validateGameData = (data: any): GameData | null => {
    if (!data || typeof data !== 'object') return null;
    
    // Ensure basic required objects exist before checking their properties
    if (!data.schedule) data.schedule = {};
    if (!data.currentMatchIndex) data.currentMatchIndex = {};
    if (!data.standings) data.standings = {};
    if (!data.matchResults) data.matchResults = {};
    if (!data.teams) data.teams = [];
    if (!data.allPlayers) data.allPlayers = [];

    // Ensure all formats are present in keys
    const formats = Object.values(Format);
    formats.forEach(f => {
        if (!data.schedule[f]) data.schedule[f] = [];
        if (data.currentMatchIndex[f] === undefined) data.currentMatchIndex[f] = 0;
        if (!data.standings[f]) data.standings[f] = [];
        if (!data.matchResults[f]) data.matchResults[f] = [];
    });

    // Ensure other fields exist
    if (!data.awardsHistory) data.awardsHistory = [];
    if (!data.playingXIs) data.playingXIs = {};
    if (!data.bowlingPlans) data.bowlingPlans = {};
    if (!data.sponsorships) data.sponsorships = INITIAL_SPONSORSHIPS;
    if (!data.news) data.news = INITIAL_NEWS;
    if (!data.records) data.records = { batterVsBowler: [], teamVsTeam: [], playerVsTeam: [] };
    if (!data.currentSeason) data.currentSeason = 1;
    if (!data.currentFormat) data.currentFormat = Format.T20_SMASH;
    if (data.popularity === undefined) data.popularity = 50;
    if (!data.grounds) data.grounds = [...GROUNDS];
    if (!data.allTeamsData) data.allTeamsData = [...TEAMS];

    // Ensure all players have stats for all formats
    const ensurePlayerStats = (player: any) => {
        if (!player.stats) player.stats = {};
        Object.values(Format).forEach(f => {
            if (!player.stats[f]) player.stats[f] = generateSingleFormatInitialStats();
        });
    };

    if (data.allPlayers) data.allPlayers.forEach(ensurePlayerStats);
    if (data.teams) {
        data.teams.forEach((t: any) => {
            if (t.squad) t.squad.forEach(ensurePlayerStats);
            // Initialize/Update ratings
            t.ratings = calculateTeamRatings(t.squad || []);
        });
    }

    // Initialize standings ratings
    Object.values(Format).forEach(f => {
        if (data.standings[f]) {
            data.standings[f].forEach((s: any) => {
                const team = data.teams.find((t: any) => t.id === s.teamId);
                if (team && team.ratings) {
                    if (f === Format.T20_SMASH || f === Format.DEVELOPMENT_T20 || f === Format.RISE_T20) s.rating = team.ratings.t20;
                    else if (f === Format.ODI || f === Format.DEVELOPMENT_ODI || f === Format.RISE_ODI) s.rating = team.ratings.odi;
                    else s.rating = team.ratings.fc;
                }
            });
        }
    });

    // Global Uniqueness Check
    if (data.teams && data.teams.length > 0) {
        const uniqueness = checkGlobalSquadUniqueness(data.teams);
        if (!uniqueness.isValid) {
            console.warn("Found duplicate players in saved data. Cleaning up...", uniqueness.duplicates);
            const seenIds = new Set<string>();
            data.teams = data.teams.map((t: any) => ({
                ...t,
                squad: t.squad.filter((p: any) => {
                    if (seenIds.has(p.id)) return false;
                    seenIds.add(p.id);
                    return true;
                })
            }));
        }
    }

    return data as GameData;
  };

  const loadGame = () => {
    setConfirmModal({
        isOpen: true,
        title: "Load Game",
        message: "Loading a saved game will overwrite your current unsaved progress. Continue?",
        type: 'warning',
        onConfirm: () => {
            const savedGame = localStorage.getItem('cricketManagerSave');
            if (savedGame) {
                try {
                    const parsed = JSON.parse(savedGame);
                    const validated = validateGameData(parsed);
                    if (validated) {
                        setGameData(validated);
                        showFeedback("Game Loaded!", "success");
                        setAppState('CAREER_HUB');
                    } else {
                        throw new Error("Invalid game data structure");
                    }
                } catch (e) {
                    console.error("Failed to parse saved game data during load:", e);
                    localStorage.removeItem('cricketManagerSave');
                    setHasSaveData(false);
                    showFeedback("Failed to load saved game. It may be corrupt.", "error");
                }
            } else {
                showFeedback("No saved game found.", "error");
            }
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const resumeGame = () => {
    const savedGame = localStorage.getItem('cricketManagerSave');
    if (savedGame) {
        try {
            const parsed = JSON.parse(savedGame);
            const validated = validateGameData(parsed);
            if (validated) {
                setGameData(validated);
                setAppState('CAREER_HUB');
                showFeedback("Game Resumed!", "success");
            } else {
                throw new Error("Invalid game data structure");
            }
        } catch(e) {
            console.error("Failed to parse saved game data:", e);
            localStorage.removeItem('cricketManagerSave');
            setHasSaveData(false);
            showFeedback("Failed to load saved game. It may be corrupt.", "error");
        }
    }
  };

  const handleStartNewGame = () => {
    if (hasSaveData) {
        setConfirmModal({
            isOpen: true,
            title: "New Career",
            message: "Starting a new game will overwrite your saved progress. Are you sure?",
            type: 'danger',
            onConfirm: () => {
                setAppState('TEAM_SELECTION');
                setConfirmModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    } else {
        setAppState('TEAM_SELECTION');
    }
  };

  const handleOpenEditor = () => {
    if (!gameData) {
      // Provide default data if no save exists
      setGameData({
        userTeamId: '',
        teams: [],
        grounds: [...GROUNDS],
        allTeamsData: [...TEAMS],
        allPlayers: [...PLAYERS],
        schedule: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, Match[]>),
        currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
        standings: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, Standing[]>),
        matchResults: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: [] }), {} as Record<Format, MatchResult[]>),
        playingXIs: {},
        bowlingPlans: {},
        currentSeason: 1,
        currentFormat: Format.T20_SMASH,
        awardsHistory: [],
        scoreLimits: {},
        records: { batterVsBowler: [], teamVsTeam: [], playerVsTeam: [] },
        promotionHistory: [],
        popularity: 50,
        sponsorships: INITIAL_SPONSORSHIPS,
        news: INITIAL_NEWS,
        activeMatch: null,
        settings: { isDoubleRoundRobin: true }
      });
    }
    setAppState('EDITOR');
  };

  const initializeNewGame = (userTeamId: string) => {
    setIsLoading(true);
    const initialTeamsData = [...TEAMS];
    const masterPool = [...PLAYERS];
    const usedPlayerIds = new Set<string>();

    const initialTeams: Team[] = initialTeamsData.map(teamData => {
        const targetRetainedSize = 4;
        const squad: Player[] = [];
        
        // 1. Pre-built assignments
        const preBuiltIds = (PRE_BUILT_SQUADS[teamData.id] || []).slice(0, targetRetainedSize);
        preBuiltIds.forEach(pid => {
            const playerIndex = masterPool.findIndex(p => p.id === pid && !usedPlayerIds.has(pid));
            if (playerIndex !== -1) {
                const p = masterPool[playerIndex];
                const playerCopy = { ...p, currentTeamId: teamData.id, isFreeAgent: false };
                squad.push(playerCopy);
                usedPlayerIds.add(pid);
            }
        });

        // 2. Fill to target size
        while (squad.length < targetRetainedSize) {
            const availablePlayerIndex = masterPool.findIndex(p => !usedPlayerIds.has(p.id));
            if (availablePlayerIndex !== -1) {
                const p = masterPool[availablePlayerIndex];
                const playerCopy = { ...p, currentTeamId: teamData.id, isFreeAgent: false };
                squad.push(playerCopy);
                usedPlayerIds.add(p.id);
            } else {
                break;
            }
        }

        return { id: teamData.id, name: teamData.name, squad, captains: {}, purse: 100.0 };
    });

    // 3. Update master registry status
    const updatedAllPlayers = masterPool.map(p => {
        const team = initialTeams.find(t => t.squad.some(sp => sp.id === p.id));
        if (team) {
            return { ...p, currentTeamId: team.id, isFreeAgent: false };
        }
        return { ...p, isFreeAgent: true, currentTeamId: undefined };
    });

    // Final Assertion: Check for duplicates before finalizing state
    const uniquenessCheck = checkGlobalSquadUniqueness(initialTeams);
    if (!uniquenessCheck.isValid) {
        console.error("CRITICAL ERROR: Duplicate players detected during initialization!", uniquenessCheck.duplicates);
        // Emergency cleanup if somehow duplicates leaked (belt and suspenders)
        const seen = new Set<string>();
        initialTeams.forEach(t => {
            t.squad = t.squad.filter(p => {
                if (seen.has(p.id)) return false;
                seen.add(p.id);
                return true;
            });
        });
    }

    const initialStandings = (teams: Team[]) => teams.map(team => {
        const ratings = calculateTeamRatings(team.squad);
        return { 
            teamId: team.id, 
            teamName: team.name, 
            played: 0, 
            won: 0, 
            lost: 0, 
            drawn: 0, 
            points: 0, 
            netRunRate: 0, 
            runsFor: 0, 
            runsAgainst: 0,
            oversFor: 0,
            oversAgainst: 0,
            rating: ratings.t20 // Default to T20 for initial view
        };
    });

    // Calculate ratings for all teams initially
    const rankedTeamsRaw = initialTeams.map(team => {
        const ratings = calculateTeamRatings(team.squad);
        return {
            ...team,
            ratings: { t20: ratings.t20, odi: ratings.odi, fc: ratings.fc },
            overallRating: Math.round((ratings.t20 + ratings.odi + ratings.fc) / 3)
        };
    });

    // Automated Group Distribution (Odd/Even Logic)
    const sortedByRating = [...rankedTeamsRaw].sort((a, b) => b.overallRating - a.overallRating);
    const rankedTeamsWithRatings: Team[] = rankedTeamsRaw.map(team => {
        const rank = sortedByRating.findIndex(t => t.id === team.id) + 1;
        return { ...team, group: (rank % 2 !== 0 ? 'A' : 'B') as 'A' | 'B' };
    });

    const schedules = Object.values(Format).reduce((acc, format) => {
        acc[format] = generateLeagueSchedule(rankedTeamsWithRatings, format);
        return acc;
    }, {} as Record<Format, Match[]>);

    const newGameData: GameData = {
      userTeamId,
      teams: rankedTeamsWithRatings,
      grounds: [...GROUNDS],
      allTeamsData: initialTeamsData,
      allPlayers: updatedAllPlayers,
      schedule: schedules,
      currentMatchIndex: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: 0 }), {} as Record<Format, number>),
      standings: Object.values(Format).reduce((acc, f) => ({ ...acc, [f]: initialStandings(initialTeams) }), {} as Record<Format, Standing[]>),
      matchResults: Object.values(Format).reduce((acc, format) => {
        acc[format] = [];
        return acc;
      }, {} as Record<Format, MatchResult[]>),
      playingXIs: {},
      bowlingPlans: {},
      currentSeason: 1,
      currentFormat: Format.T20_SMASH, 
      awardsHistory: [],
      scoreLimits: {},
      records: {
        batterVsBowler: [],
        teamVsTeam: [],
        playerVsTeam: [],
      },
      promotionHistory: [],
      popularity: 50,
      sponsorships: INITIAL_SPONSORSHIPS,
      news: INITIAL_NEWS,
      activeMatch: null,
      settings: {
          isDoubleRoundRobin: true
      }
    };
    setGameData(newGameData);
    setAppState('AUCTION');
    setIsLoading(false);
  };

  const handleAuctionComplete = (finalTeams: Team[]) => {
      setGameData(prev => {
          if (!prev) return null;
          
          // Add ratings to final teams
          const teamsWithRatings = finalTeams.map(t => {
              const ratings = calculateTeamRatings(t.squad);
              return {
                ...t,
                ratings,
                overallRating: Math.round((ratings.t20 + ratings.odi + ratings.fc) / 3)
              };
          });

          // Synchronize allPlayers with finalTeams
          const newAllPlayers = prev.allPlayers.map(p => {
              const team = teamsWithRatings.find(t => t.squad.some(s => s.id === p.id));
              if (team) {
                  return { ...p, isFreeAgent: false, currentTeamId: team.id };
              }
              return { ...p, isFreeAgent: true, currentTeamId: undefined };
          });

          // Update standings with new ratings
          const newStandings = { ...prev.standings };
          Object.values(Format).forEach(f => {
              newStandings[f] = (newStandings[f] || []).map(s => {
                  const team = teamsWithRatings.find(t => t.id === s.teamId);
                  if (team && team.ratings) {
                      let r = team.ratings.t20;
                      if (f === Format.ODI || f === Format.DEVELOPMENT_ODI || f === Format.RISE_ODI) r = team.ratings.odi;
                      if (f === Format.SHIELD || f === Format.DEVELOPMENT_FIRST_CLASS || f === Format.RISE_FIRST_CLASS) r = team.ratings.fc;
                      return { ...s, rating: r };
                  }
                  return s;
              });
          });

          return { ...prev, teams: teamsWithRatings, allPlayers: newAllPlayers, standings: newStandings };
      });
      setAppState('CAREER_HUB');
      showFeedback("Draft Room Closed! Ready for Match 1.", "success");
  };

  const resetGame = () => {
    setConfirmModal({
        isOpen: true,
        title: "Reset Progress",
        message: "Are you sure you want to reset all progress? This cannot be undone.",
        type: 'danger',
        onConfirm: () => {
            localStorage.removeItem('cricketManagerSave');
            setGameData(null);
            setAppState('MAIN_MENU');
            setHasSaveData(false);
            showFeedback("Reset successful.", "success");
            setConfirmModal(prev => ({ ...prev, isOpen: false }));
        }
    });
  };

  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  };

  const renderContent = () => {
    if (isLoading) {
        return (
          <div className="bg-[#050808] h-full flex flex-col items-center justify-center space-y-4">
            <LoadingSpinner />
            <p className="text-[10px] font-black tracking-widest text-teal-500 uppercase">Loading Data...</p>
          </div>
        );
    }
    switch(appState) {
        case 'MAIN_MENU': return <MainMenu onStartNewGame={handleStartNewGame} onResumeGame={resumeGame} onOpenEditor={handleOpenEditor} hasSaveData={hasSaveData} />;
        case 'TEAM_SELECTION': return <TeamSelection onTeamSelected={initializeNewGame} theme={theme} />;
        case 'AUCTION': return gameData ? <AuctionRoom gameData={gameData} onAuctionComplete={handleAuctionComplete} /> : null;
        case 'CAREER_HUB': return gameData ? <CareerHub gameData={gameData} setGameData={setGameData} onResetGame={resetGame} theme={theme} setTheme={setTheme} saveGame={saveGame} loadGame={loadGame} showFeedback={showFeedback} /> : null;
        case 'EDITOR': {
             if (!gameData) return null;

             const handleUpdatePlayerAction = (p: Player) => {
                setGameData(prev => {
                    if (!prev) return null;
                    const newAllPlayers = prev.allPlayers.map(pl => pl.id === p.id ? p : pl);
                    const newTeams = prev.teams.map(team => ({
                        ...team,
                        squad: team.squad.map(pl => pl.id === p.id ? p : pl)
                    }));
                    let newActiveMatch = prev.activeMatch;
                    if (newActiveMatch) {
                        const updateInBatting = (inning: Inning) => ({
                            ...inning,
                            batting: inning.batting.map(b => b.playerId === p.id ? { ...b, playerName: p.name } : b),
                            bowling: inning.bowling.map(b => b.playerId === p.id ? { ...b, playerName: p.name } : b)
                        });
                        newActiveMatch = {
                            ...newActiveMatch,
                            innings: newActiveMatch.innings.map(updateInBatting)
                        };
                    }
                    return {
                        ...prev,
                        allPlayers: newAllPlayers,
                        teams: newTeams,
                        activeMatch: newActiveMatch
                    };
                });
            };

            const handleCreatePlayerAction = (p: Player) => {
                setGameData(prev => prev ? ({...prev, allPlayers: [...prev.allPlayers, p]}) : null);
            };

            return (
                <div className="h-full flex flex-col">
                    <div className="bg-[#050808] p-4 border-b-2 border-white/10 flex justify-between items-center">
                        <button onClick={() => setAppState('MAIN_MENU')} className="text-teal-500 font-black uppercase italic text-xs hover:text-white transition-colors flex items-center gap-2">
                            <span>← BACK_TO_MENU</span>
                        </button>
                        <span className="text-[10px] font-mono font-bold opacity-30 uppercase tracking-widest">SYSTEM_ADMIN_MODE</span>
                    </div>
                    <div className="flex-grow overflow-hidden">
                        <Editor 
                            gameData={gameData} 
                            handleUpdatePlayer={handleUpdatePlayerAction}
                            handleCreatePlayer={handleCreatePlayerAction}
                            handleUpdateGround={(code, updates) => setGameData(prev => prev ? ({...prev, grounds: prev.grounds.map(g => g.code === code ? {...g, ...(typeof updates === 'string' ? {pitch: updates} : updates)} : g)}) : null)}
                            handleUpdateScoreLimits={(groundCode, format, field, value, inning) => {
                                setGameData(prev => {
                                    if (!prev) return null;
                                    const numValue = parseInt(value, 10);
                                    const newLimits: any = JSON.parse(JSON.stringify(prev.scoreLimits || {}));
                                    if (!newLimits[groundCode]) newLimits[groundCode] = {};
                                    if (!newLimits[groundCode][format]) newLimits[groundCode][format] = {};
                                    if (!newLimits[groundCode][format][inning]) newLimits[groundCode][format][inning] = {};
                                    if (value === '' || isNaN(numValue) || numValue <= 0) delete newLimits[groundCode][format][inning][field];
                                    else newLimits[groundCode][format][inning][field] = numValue;
                                    return { ...prev, scoreLimits: newLimits };
                                });
                            }}
                        />
                    </div>
                </div>
            );
        }
        default: return <div>Error</div>;
    }
  }

  return (
    <div className="bg-slate-100 dark:bg-slate-900 min-h-screen flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full h-screen md:max-w-xl md:max-h-[932px] md:h-[90vh] bg-gray-50 dark:bg-[#050808] md:border-4 md:border-gray-300 md:dark:border-gray-700 md:rounded-[60px] md:shadow-2xl md:shadow-black/50 overflow-hidden relative text-gray-900 dark:text-gray-200 flex flex-col">
        <AnimatePresence>
          {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
          {!showSplash && showCover && <GameCover onStart={() => setShowCover(false)} isInstallable={isInstallable} onInstall={handleInstallClick} />}
        </AnimatePresence>
        {!showSplash && !showCover && renderContent()}
        {feedbackMessage && (
            <div className={`absolute bottom-28 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg z-50 shadow-lg text-white font-semibold ${feedbackMessage.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`}>
                {feedbackMessage.text}
            </div>
        )}
        <ConfirmModal 
          isOpen={confirmModal.isOpen}
          title={confirmModal.title}
          message={confirmModal.message}
          type={confirmModal.type}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
        />
      </div>
    </div>
  );
};