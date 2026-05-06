
import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Match, GameData, MatchResult, Strategy, LiveMatchState, Player, Ground, Message, Format, PlayerRole } from '../types';
import { useLiveMatch } from '../hooks/useLiveMatch';
import { Icons } from './Icons';
import { TV_CHANNELS, INITIAL_SPONSORSHIPS, TOURNAMENT_LOGOS } from '../data';
import { getPlayerById, generateAutoBowlingPlan, getPlayerPhaseTags } from '../utils';
import { PlayerAvatar } from './PlayerAvatar';
import { ModernMatchUI } from './ModernMatchUI';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

interface LiveMatchScreenProps {
    match: Match;
    gameData: GameData;
    onMatchComplete: (result: MatchResult) => void;
    onExit: (stateToSave?: LiveMatchState) => void;
    savedState?: LiveMatchState | null;
    startMode?: 'play' | 'simulate';
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
}

const StrategyToggle = ({ label, value, onChange }: { label: string, value: Strategy, onChange: (s: Strategy) => void }) => (
    <div className="flex flex-col items-center bg-white/[0.03] rounded-lg p-1 flex-1 border border-white/5">
        <span className="text-[7px] text-white/40 uppercase font-black tracking-widest mb-0.5">{label}</span>
        <div className="flex bg-black/40 rounded-md p-0.5 w-full justify-center">
            {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                <button
                    key={s}
                    onClick={() => onChange(s)}
                    className={`px-0.5 py-0.5 text-[7px] uppercase font-black rounded transition-all flex-1 ${value === s 
                        ? s === 'attacking' ? 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.3)]' : s === 'defensive' ? 'bg-blue-500 text-white shadow-[0_0_10px_rgba(59,130,246,0.3)]' : 'bg-teal-500 text-black shadow-[0_0_10px_rgba(20,184,166,0.3)]' 
                        : 'text-white/20 hover:text-white/40'}`}
                >
                    {s.slice(0,3)}
                </button>
            ))}
        </div>
    </div>
);

const PreMatchPanel = ({ match, gameData, onStart, onSimulate, onEditLineup, onEditBowlingPlan, setGameData }: { match: Match, gameData: GameData, onStart: () => void, onSimulate: () => void, onEditLineup: () => void, onEditBowlingPlan: () => void, setGameData: any }) => {
    const sponsorship = gameData.sponsorships?.[gameData.currentFormat] || INITIAL_SPONSORSHIPS[gameData.currentFormat];
    const teamA = gameData.teams.find(t => t.name === match.teamA);
    const teamB = gameData.teams.find(t => t.name === match.teamB);
    const ground = gameData.grounds.find(g => g.code === (gameData.allTeamsData.find(t => t.name === match.teamA)?.homeGround || 'KCG'));
    
    const getWeatherIcon = (w?: string) => {
        switch(w) {
            case 'Sunny': return '☀️';
            case 'Overcast': return '☁️';
            case 'Rainy': return '🌧️';
            case 'Humid': return '🌫️';
            default: return '🌤️';
        }
    };

    return (
        <div className="absolute inset-0 z-[120] bg-[#050808] flex flex-col p-2 font-sans overflow-y-auto scrollbar-hide">
            {/* Header */}
            <header className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 ${sponsorship.logoColor} p-1 bg-white/5 rounded-lg border border-white/10`} dangerouslySetInnerHTML={{__html: sponsorship.tournamentLogo || TOURNAMENT_LOGOS[0].svg}}></div>
                    <div>
                        <p className="text-[5px] font-black text-teal-500 uppercase tracking-[0.4em] mb-0.5">{gameData.currentFormat} // PRE_MATCH</p>
                        <h1 className="text-xs font-black italic uppercase tracking-tighter text-white leading-none">{sponsorship.tournamentName}</h1>
                    </div>
                </div>
                <div className="w-8 h-4 opacity-20" dangerouslySetInnerHTML={{__html: sponsorship.tvLogo || ''}}></div>
            </header>

            <div className="flex-grow flex flex-col justify-center space-y-2 py-1">
                <div className="flex items-center justify-between px-1">
                    <motion.div 
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center space-y-1 w-1/3"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500/20 to-blue-600/20 flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.1)] border border-white/10 overflow-hidden relative group">
                            <div className="absolute inset-0 bg-teal-500/10 animate-pulse" />
                            <div className="w-5 h-5 relative z-10" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamA?.id)?.logo || ''}}></div>
                        </div>
                        <h2 className="text-[8px] font-black uppercase tracking-tighter italic text-center text-white leading-tight">{teamA?.name}</h2>
                        <div className="px-1 py-0.5 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[4px] font-black text-white/40 uppercase tracking-widest">HOME</span>
                        </div>
                    </motion.div>

                    <div className="flex flex-col items-center">
                        <div className="text-lg font-black italic text-white/5 tracking-tighter mb-0.5">VS</div>
                        <div className="w-px h-3 bg-gradient-to-b from-transparent via-teal-500/40 to-transparent" />
                    </div>

                    <motion.div 
                        initial={{ x: 20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        className="flex flex-col items-center space-y-1 w-1/3"
                    >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center border border-white/10 overflow-hidden relative">
                            <div className="w-5 h-5 relative z-10" dangerouslySetInnerHTML={{__html: gameData.allTeamsData.find(t => t.id === teamB?.id)?.logo || ''}}></div>
                        </div>
                        <h2 className="text-[8px] font-black uppercase tracking-tighter italic text-center text-white leading-tight">{teamB?.name}</h2>
                        <div className="px-1 py-0.5 bg-white/5 rounded-full border border-white/10">
                            <span className="text-[4px] font-black text-white/40 uppercase tracking-widest">AWAY</span>
                        </div>
                    </motion.div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 mx-auto w-full max-w-xs backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[5px] font-black text-white/20 uppercase tracking-[0.3em]">MATCH_PREVIEW_ANALYSIS</span>
                        <div className="flex gap-1">
                            <span className="text-[5px] font-black text-teal-500 uppercase tracking-widest">{match.group || 'Tournament'} Match</span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 flex flex-col items-center">
                            <p className="text-[4px] font-black text-white/20 uppercase tracking-widest mb-0.5">TEAM_RATING</p>
                            <p className="text-sm font-black text-teal-500 italic uppercase leading-none">{teamA?.overallRating || 0}</p>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5 flex flex-col items-center">
                            <p className="text-[4px] font-black text-white/20 uppercase tracking-widest mb-0.5">TEAM_RATING</p>
                            <p className="text-sm font-black text-white italic uppercase leading-none">{teamB?.overallRating || 0}</p>
                        </div>
                    </div>
                    
                    <div className="bg-black/60 p-2 rounded-lg border border-white/5 space-y-1.5">
                         <div className="flex justify-between items-center px-1">
                            <span className="text-[5px] font-black text-white/30 uppercase tracking-widest">HEAD_TO_HEAD_RECORD</span>
                            <span className="text-[5px] font-black text-teal-500 uppercase tracking-widest">LAST 5: 3 - 2</span>
                         </div>
                         <div className="flex items-center gap-1">
                            {[1,1,1,0,0].map((w,i) => (
                                <div key={i} className={`h-0.5 flex-1 rounded-full ${w ? 'bg-teal-500' : 'bg-red-500/40'}`} />
                            ))}
                         </div>
                    </div>
                </div>

                <div className="bg-white/[0.02] border border-white/5 rounded-xl p-2 mx-auto w-full max-w-xs backdrop-blur-xl">
                    <div className="flex justify-between items-center mb-1.5">
                        <span className="text-[5px] font-black text-white/20 uppercase tracking-[0.3em]">GROUND_TELEMETRY</span>
                        <div className="flex gap-1">
                            {[1,2,3].map(i => <div key={i} className="w-0.5 h-0.5 bg-teal-500/40 rounded-full" />)}
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-1.5">
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                            <p className="text-[5px] font-black text-white/20 uppercase tracking-widest mb-0.5">PITCH_SURFACE</p>
                            <p className="text-[8px] font-black text-teal-500 italic uppercase">{ground?.pitch}</p>
                            <p className="text-[6px] text-white/10 mt-0.5 uppercase font-bold">FAVORS: {ground?.pitch.includes('Spin') ? 'SPIN' : ground?.pitch.includes('Green') ? 'PACE' : 'BAT'}</p>
                        </div>
                        <div className="bg-black/40 p-1.5 rounded-lg border border-white/5">
                            <p className="text-[5px] font-black text-white/20 uppercase tracking-widest mb-0.5">ATMOSPHERE</p>
                            <p className="text-[8px] font-black text-white italic uppercase flex items-center gap-1">
                                <span className="text-xs">{getWeatherIcon(ground?.weather)}</span> {ground?.weather || 'CLEAR'}
                            </p>
                            <p className="text-[6px] text-white/10 mt-0.5 uppercase font-bold">{ground?.outfieldSpeed || 'MED'} OUTFIELD</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-1.5 space-y-1.5">
                <div className="flex items-center justify-between px-2 py-1 bg-white/[0.03] rounded-lg border border-white/5 mb-1">
                    <span className="text-[7px] font-black text-white/40 uppercase tracking-widest">TACTICAL_AUTO_ARRIVAL</span>
                    <div 
                        className={`w-8 h-4 rounded-full p-0.5 transition-colors cursor-pointer ${gameData.autoArrivalDisabled ? 'bg-white/10' : 'bg-teal-500'}`}
                        onClick={() => setGameData((prev: GameData | null) => prev ? { ...prev, autoArrivalDisabled: !prev.autoArrivalDisabled } : null)}
                    >
                        <div className={`w-3 h-3 bg-white rounded-full transition-transform ${gameData.autoArrivalDisabled ? 'translate-x-0' : 'translate-x-4'}`} />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-2 mb-1">
                    <button 
                        onClick={onEditLineup}
                        className="bg-white/5 border border-white/10 text-white font-black py-2.5 px-4 rounded-xl uppercase tracking-[0.2em] text-[8px] hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group shadow-xl"
                    >
                        EDIT SQUAD & LINEUP
                        <Icons.Settings className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                    </button>
                </div>
                <button 
                    onClick={onStart}
                    className="w-full bg-teal-500 text-black font-black py-2.5 px-4 rounded-lg uppercase tracking-[0.2em] text-[7px] hover:bg-teal-400 transition-all duration-500 shadow-[0_10px_30px_rgba(20,184,166,0.2)] active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                    PLAY MATCH
                    <Icons.PlayMatch className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                    onClick={onSimulate}
                    className="w-full bg-white/5 border border-white/10 text-white font-black py-2 px-4 rounded-lg uppercase tracking-[0.2em] text-[7px] hover:bg-white/10 transition-all active:scale-[0.98] flex items-center justify-center gap-2 group"
                >
                    SIMULATE WITH PLAY
                    <Icons.FastForward className="w-2.5 h-2.5 group-hover:translate-x-1 transition-transform" />
                </button>
            </div>
        </div>
    );
};

const AutoArrivalNotification = ({ playerName, onOverride, secondsLeft }: { playerName: string, onOverride: () => void, secondsLeft: number }) => (
    <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-30 bg-slate-900/90 border border-teal-500/50 rounded-lg shadow-2xl p-2.5 flex items-center gap-3 animate-slide-up min-w-[240px]">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-teal-900 flex items-center justify-center text-teal-400 animate-pulse">
            <Icons.User className="w-4 h-4" />
        </div>
        <div className="flex-grow">
            <p className="text-[8px] text-teal-400 uppercase font-black tracking-widest">Next Batter Arriving</p>
            <p className="text-white font-black text-sm leading-tight">{playerName}</p>
        </div>
        <div className="flex flex-col items-end gap-0.5">
            <span className="text-[10px] font-mono text-slate-400">{secondsLeft}s</span>
            <div className="text-[7px] text-gray-500 uppercase font-black">Click to skip</div>
        </div>
    </div>
);

// --- Bowling Plan Editor --- (Actually user asked to remove assistant from match, so removing MatchChat)
interface BowlingPlanEditorProps {
    state: LiveMatchState;
    gameData: GameData;
    updateBowlingPlan: (plan: Record<number, string>) => void;
    onClose: () => void;
}

const BowlingPlanEditor = ({ state, gameData, updateBowlingPlan, onClose }: BowlingPlanEditorProps) => {
    const teamId = gameData.userTeamId;
    const bowlingTeam = state.bowlingTeam.id === teamId ? state.bowlingTeam : state.battingTeam;
    const format = gameData.currentFormat;
    const maxOvers = format === Format.T20_SMASH ? 20 : (format === Format.ODI ? 50 : 90);
    
    const bowlers = bowlingTeam.squad.filter(p => [PlayerRole.FAST_BOWLER, PlayerRole.SPIN_BOWLER, PlayerRole.ALL_ROUNDER].includes(p.role));
    
    const [localPlan, setLocalPlan] = useState<Record<number, string>>(state.bowlingPlan || {});

    const handleSelectBowler = (over: number, bowlerId: string) => {
        setLocalPlan(prev => ({ ...prev, [over]: bowlerId }));
    };

    const handleAuto = () => {
        const plan = generateAutoBowlingPlan(bowlingTeam.squad, format);
        setLocalPlan(plan);
    };

    const handleSave = () => {
        updateBowlingPlan(localPlan);
        onClose();
    };

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[140] bg-[#050808] flex flex-col p-4"
        >
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                    <h2 className="text-sm font-black italic uppercase tracking-tighter text-white">BOWLING_STRATEGY</h2>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleAuto} className="px-3 py-1 bg-teal-500 text-black text-[7px] font-black uppercase rounded-lg shadow-lg">AUTO_DISTRIBUTE</button>
                    <button onClick={onClose} className="p-1.5 bg-white/5 rounded-lg border border-white/10">
                        <Icons.X className="h-4 w-4 text-white/40" />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-hide">
                {Array.from({ length: maxOvers }, (_, i) => i + 1).map(over => (
                    <div key={over} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-2 rounded-xl">
                        <div className="w-8 h-8 rounded-lg bg-black/40 flex items-center justify-center border border-white/10">
                            <span className="text-[10px] font-mono font-black text-teal-500">{over}</span>
                        </div>
                        <div className="flex-grow">
                            <select 
                                value={localPlan[over] || ''} 
                                onChange={(e) => handleSelectBowler(over, e.target.value)}
                                className="w-full bg-transparent border-none text-[9px] font-black text-white focus:ring-0 outline-none uppercase tracking-widest"
                            >
                                <option value="" className="bg-slate-900">Select Bowler</option>
                                {bowlers.map(b => (
                                    <option key={b.id} value={b.id} className="bg-slate-900">
                                        {b.name} ({b.role})
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                ))}
            </div>

            <button 
                onClick={handleSave}
                className="mt-4 w-full bg-red-500 text-white font-black py-3 rounded-xl uppercase tracking-[0.2em] text-[8px] shadow-lg shadow-red-500/20"
            >
                APPLY_BOWLING_PLAN
            </button>
        </motion.div>
    );
};

interface BattingOrderEditorProps {
    state: LiveMatchState;
    gameData: GameData;
    battingOrderSelection: string[];
    setBattingOrderSelection: React.Dispatch<React.SetStateAction<string[]>>;
    updateBattingOrder: (order: string[]) => void;
    setShowBattingOrderEditor: (show: boolean) => void;
    beginMatch: () => void;
}

const BattingOrderEditor = ({ state, gameData, battingOrderSelection, setBattingOrderSelection, updateBattingOrder, setShowBattingOrderEditor, beginMatch }: BattingOrderEditorProps) => {
    const userTeam = state.battingTeam.id === gameData.userTeamId ? state.battingTeam : state.bowlingTeam;
    
    const togglePlayer = (playerId: string) => {
        setBattingOrderSelection(prev => {
            if (prev.includes(playerId)) {
                return prev.filter(id => id !== playerId);
            }
            if (prev.length >= 11) return prev;
            return [...prev, playerId];
        });
    };

    const handleConfirm = () => {
        if (battingOrderSelection.length < 11) {
            // Auto-fill remaining players if not all selected
            const remaining = userTeam.squad
                .map(p => p.id)
                .filter(id => !battingOrderSelection.includes(id));
            const fullOrder = [...battingOrderSelection, ...remaining];
            updateBattingOrder(fullOrder);
        } else {
            updateBattingOrder(battingOrderSelection);
        }
        setShowBattingOrderEditor(false);
        beginMatch();
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-[150] bg-[#050808] flex flex-col p-6 overflow-y-auto"
        >
            <div className="max-w-2xl mx-auto w-full">
                <div className="mb-6 text-center">
                    <h2 className="text-2xl font-black italic text-white uppercase tracking-tighter">Set Batting Order</h2>
                    <p className="text-teal-500 font-bold tracking-widest text-[10px] uppercase mt-1">Click players in sequence (1-11)</p>
                </div>

                <div className="grid grid-cols-1 gap-2 mb-6">
                    {userTeam.squad.slice(0, 11).map((player, idx) => {
                        const orderIndex = battingOrderSelection.indexOf(player.id);
                        return (
                            <button 
                                key={player.id}
                                onClick={() => togglePlayer(player.id)}
                                className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                                    orderIndex !== -1 
                                        ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_15px_rgba(20,184,166,0.2)]' 
                                        : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-base ${
                                        orderIndex !== -1 ? 'bg-black text-teal-500' : 'bg-white/10 text-white/40'
                                    }`}>
                                        {orderIndex !== -1 ? orderIndex + 1 : '-'}
                                    </div>
                                    <div className="text-left">
                                        <p className="font-black uppercase italic text-sm">{player.name}</p>
                                        <p className={`text-[8px] font-bold uppercase tracking-widest ${orderIndex !== -1 ? 'text-black/60' : 'text-white/40'}`}>
                                            {player.role}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                <button 
                    onClick={handleConfirm}
                    disabled={battingOrderSelection.length === 0}
                    className="w-full bg-teal-500 text-black py-6 rounded-3xl font-black uppercase italic tracking-tighter text-2xl shadow-[0_0_30px_rgba(20,184,166,0.3)] disabled:opacity-50 disabled:grayscale transition-all"
                >
                    CONFIRM LINEUP & START 🏏
                </button>
            </div>
        </motion.div>
    );
};

const LiveMatchScreen: React.FC<LiveMatchScreenProps> = ({ match, gameData, onMatchComplete, onExit, savedState, startMode = 'play', setGameData }) => {
    const { state, playBall, playOver, autoSimulate, simulateInning, simulateMatch, setBattingStrategy, setBowlingStrategy, selectOpeners, selectNextBatter, selectNextBowler, startMatch, beginMatch, declareInning, stopAutoPlay, swapPlayers, requestBowlerChange, updateBowlingPlan, updateBattingOrder } = useLiveMatch(match, gameData, onMatchComplete, savedState);
    const commentaryRef = useRef<HTMLDivElement>(null);
    const [lastBallSpeed, setLastBallSpeed] = useState<string>("-");
    
    // Match Centre State
    const [showMatchCentre, setShowMatchCentre] = useState(false);
    const [showBattingOrderEditor, setShowBattingOrderEditor] = useState(false);
    const [showCaptainsCorner, setShowCaptainsCorner] = useState(false);
    const [activeTab, setActiveTab] = useState<'scorecard' | 'commentary' | 'analysis' | 'stats'>('scorecard');
    const [scorecardSort, setScorecardSort] = useState<'order' | 'runs'>('order');
    const [statsSearchQuery, setStatsSearchQuery] = useState('');
    
    const [selectedOpener1, setSelectedOpener1] = useState('');
    const [selectedOpener2, setSelectedOpener2] = useState('');
    const [selectedBatter, setSelectedBatter] = useState('');
    const [selectedBowler, setSelectedBowler] = useState('');
    const [tossState, setTossState] = useState<'coin' | 'result'>('coin');
    const [showPreMatch, setShowPreMatch] = useState(() => state?.status === 'ready' && !savedState);
    const [showLineupEditor, setShowLineupEditor] = useState(false);
    const [battingOrderSelection, setBattingOrderSelection] = useState<string[]>([]);
    const [showBowlingEditor, setShowBowlingEditor] = useState(false);

    const groundPitch = useMemo(() => gameData.grounds.find(g => g.name === state?.match.vs)?.pitch || 'Balanced', [state, gameData.grounds]);
    const groundCode = useMemo(() => gameData.grounds.find(g => g.name === state?.match.vs)?.code || 'GND', [state, gameData.grounds]);

    // Auto-Simulation effect
    useEffect(() => {
        if (state?.status === 'inprogress' && startMode === 'simulate' && !state.autoPlayType) {
            simulateMatch();
        }
    }, [state?.status, startMode, state?.autoPlayType, simulateMatch]);

    const sponsorship = gameData.sponsorships?.[gameData.currentFormat];
    const tvChannelData = TV_CHANNELS.find(t => t.name === sponsorship?.tvChannel);
    const tvLogo = sponsorship?.tvLogo;
    const tvColor = tvChannelData?.color || 'text-white';

    // Auto-select / Pre-fill logic (Simplified for Manual Selection)
    useEffect(() => {
        if (!state) return;
        
        if (state.waitingFor === 'openers') {
             const currentInning = state.innings[state.currentInningIndex];
             const available = currentInning.batting.filter(b => !b.isOut);
             if (available.length >= 2) {
                 setTimeout(() => {
                    setSelectedOpener1(available[0].playerId);
                    setSelectedOpener2(available[1].playerId);
                 }, 0);
             }
        } else if (state.waitingFor === 'batter' || state.waitingFor === 'bowler') {
            const currentInning = state.innings[state.currentInningIndex];
            if (state.waitingFor === 'batter') {
                const nextP = currentInning.batting.find(b => !b.isOut && b.playerId !== state.currentBatters.strikerId && b.playerId !== state.currentBatters.nonStrikerId);
                if (nextP) {
                    setTimeout(() => setSelectedBatter(nextP.playerId), 0);
                }
            } else if (state.waitingFor === 'bowler') {
                const overLimit = gameData.currentFormat.includes('T20') ? 4 : 10;
                const validBowlers = currentInning.bowling.filter(b => b.playerId !== state.currentBowlerId && b.ballsBowled < overLimit * 6);
                if (validBowlers[0]) {
                    setTimeout(() => setSelectedBowler(validBowlers[0].playerId), 0);
                }
            }
        }
    }, [state, gameData.currentFormat, setSelectedBatter, setSelectedBowler, setSelectedOpener1, setSelectedOpener2]);

    const handleDragEnd = (result: DropResult) => {
        if (!result.destination || !state) return;
        const { source, destination } = result;
        if (source.index === destination.index) return;
        
        const teamId = gameData.userTeamId;
        const team = state.battingTeam.id === teamId ? state.battingTeam : state.bowlingTeam;
        
        const player1Id = team.squad[source.index].id;
        const player2Id = team.squad[destination.index].id;
        
        swapPlayers(teamId, player1Id, player2Id);
    };



    const lastBallCountRef = useRef(0);
    useEffect(() => {
        if (state?.recentBalls.length && state.recentBalls.length !== lastBallCountRef.current) {
            lastBallCountRef.current = state.recentBalls.length;
            const baseSpeed = 130;
            const variation = Math.floor(Math.random() * 25) - 10;
            setTimeout(() => setLastBallSpeed(`${baseSpeed + variation} km/h`), 0);
        }
    }, [state?.recentBalls.length]);

    // --- PREDICTIONS & STATS CALCULATIONS ---
    const predictions = useMemo(() => {
        if (!state) return null;
        const { innings, currentInningIndex, target, battingTeam, bowlingTeam, currentBatters } = state;
        const currentInning = innings[currentInningIndex];
        const maxOvers = gameData.currentFormat.includes('T20') ? 20 : 50;
        const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + (parseFloat(currentInning.overs) % 1 * 10);
        const ballsRemaining = (maxOvers * 6) - ballsBowled;
        const currentRunRate = ballsBowled > 0 ? (currentInning.score / ballsBowled) * 6 : 6;
        
        // Win Probability
        let winProb: number;
        if (target) {
            const runsNeeded = target - currentInning.score;
            const wicketsLeft = 10 - currentInning.wickets;
            
            if (runsNeeded <= 0) {
                winProb = 100;
            } else if (ballsRemaining <= 0 || wicketsLeft <= 0) {
                winProb = 0;
            } else {
                const reqRate = (runsNeeded / ballsRemaining) * 6;
                const parRate = maxOvers === 20 ? 8.5 : 6.0;
                const rateDiff = parRate - reqRate;
                
                // Base probability on wickets left and rate diff
                winProb = 30 + (wicketsLeft * 6) + (rateDiff * 10);
            }
        } else {
            // Batting first
            const projScore = currentInning.score + (currentRunRate * (ballsRemaining/6));
            const parScore = maxOvers === 20 ? 175 : 290;
            winProb = 50 + ((projScore - parScore) / 3);
        }
        winProb = Math.max(1, Math.min(99, winProb));

        // Projected Scores
        const projCurrent = Math.round(currentInning.score + (currentRunRate * (ballsRemaining/6)));
        const proj6 = Math.round(currentInning.score + (6 * (ballsRemaining/6)));
        const proj8 = Math.round(currentInning.score + (8 * (ballsRemaining/6)));
        const proj10 = Math.round(currentInning.score + (10 * (ballsRemaining/6)));

        // Player Prediction
        const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
        let playerProj = 0;
        if (striker) {
            // Assume they face 40% of remaining balls if top order, less if tail
            const expectedBalls = ballsRemaining * 0.4; 
            const currentSR = striker.balls > 0 ? (striker.runs / striker.balls) : 0.8; // Default 80 SR
            playerProj = Math.round(striker.runs + (expectedBalls * currentSR));
        }

        return {
            winProb: Math.round(winProb),
            projCurrent,
            proj6,
            proj8,
            proj10,
            playerProj
        };
    }, [state, gameData.currentFormat]);


    if (!state) return <div className="h-full flex items-center justify-center bg-slate-900 text-white">Loading Match...</div>;

    const { battingTeam, bowlingTeam, innings, currentInningIndex, currentBatters, currentBowlerId, recentBalls, commentary, target, waitingFor, strategies } = state;
    
    const isUserBatting = battingTeam?.id === gameData.userTeamId;
    const isUserBowling = bowlingTeam?.id === gameData.userTeamId;

    const handleExit = () => {
        // If match not finished, save state
        if (state.status !== 'completed') {
            onExit(state);
        } else {
            onExit();
        }
    };

    if (showPreMatch && state.status === 'ready') {
        return (
            <>
                <PreMatchPanel 
                    match={match} 
                    gameData={gameData} 
                    onStart={() => { setShowPreMatch(false); beginMatch(); }} 
                    onSimulate={() => {
                        setShowPreMatch(false);
                        beginMatch();
                        // The useEffect will handle the simulation start once status is 'inprogress'
                    }}
                    onEditLineup={() => setShowLineupEditor(true)}
                    onEditBowlingPlan={() => setShowBowlingEditor(true)}
                    setGameData={setGameData}
                />
                
                <AnimatePresence>
                    {showBowlingEditor && state && (
                        <BowlingPlanEditor 
                            state={state} 
                            gameData={gameData} 
                            updateBowlingPlan={updateBowlingPlan} 
                            onClose={() => setShowBowlingEditor(false)} 
                        />
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {showLineupEditor && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="absolute inset-0 z-[130] bg-[#050808] flex flex-col p-6"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-black italic uppercase tracking-tighter text-white">EDIT_LINEUP</h2>
                                <button onClick={() => setShowLineupEditor(false)} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                                    <Icons.X className="h-6 w-6 text-white/40" />
                                </button>
                            </div>
                            
                            <p className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-6">Drag to reorder your playing XI</p>
                            
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="lineup">
                                    {(provided) => (
                                        <div 
                                            {...provided.droppableProps} 
                                            ref={provided.innerRef}
                                            className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide"
                                        >
                                            <div className="sticky top-0 z-10 bg-[#050808] pb-3">
                                                <div className="flex items-center gap-3 px-3 py-2 bg-teal-500/10 border border-teal-500/20 rounded-xl">
                                                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">PLAYING_XI</span>
                                                </div>
                                            </div>

                                            {(state.battingTeam.id === gameData.userTeamId ? state.battingTeam : state.bowlingTeam).squad.map((player, index) => (
                                                <React.Fragment key={player.id}>
                                                    {index === 11 && (
                                                        <div className="sticky top-0 z-10 bg-[#050808] py-3">
                                                            <div className="flex items-center gap-3 px-3 py-2 bg-white/5 border border-white/10 rounded-xl">
                                                                <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">BENCH</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                    <Draggable draggableId={player.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                                                                    snapshot.isDragging 
                                                                    ? 'bg-teal-500 border-teal-400 shadow-2xl scale-105 z-50' 
                                                                    : index < 11 
                                                                        ? 'bg-white/[0.03] border-white/5'
                                                                        : 'bg-white/[0.01] border-white/5 opacity-60'
                                                                }`}
                                                            >
                                                                <div className="flex items-center gap-4">
                                                                    <span className="text-[15px] font-mono font-black text-white/20 w-6">{index + 1}</span>
                                                                    <div className="w-12 h-12 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                                                        <PlayerAvatar player={player} size="sm" />
                                                                    </div>
                                                                    <div>
                                                                        <p className={`text-[15px] font-black uppercase italic tracking-tighter ${snapshot.isDragging ? 'text-black' : 'text-white'}`}>{player.name}</p>
                                                                        <p className={`text-[9px] font-black uppercase tracking-widest ${snapshot.isDragging ? 'text-black/60' : 'text-white/40'}`}>{player.role}</p>
                                                                    </div>
                                                                </div>
                                                                <div className={`text-[15px] font-black italic ${snapshot.isDragging ? 'text-black/40' : 'text-white/10'}`}>:::</div>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                </React.Fragment>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                            
                            <button 
                                onClick={() => setShowLineupEditor(false)}
                                className="mt-6 w-full bg-teal-500 text-black font-black py-5 rounded-2xl uppercase tracking-[0.2em] text-[12px] shadow-lg"
                            >
                                SAVE_LINEUP
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </>
        );
    }

    if (state.status === 'toss') {
        return (
            <div className="absolute inset-0 z-[100] bg-[#050808] flex flex-col items-center justify-center p-8 text-white overflow-hidden">
                {/* Background Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-teal-500/10 blur-[150px] rounded-full pointer-events-none" />
                
                <div className="relative z-10 flex flex-col items-center max-w-lg w-full">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="bg-teal-500 text-black px-3 py-1 font-black text-[12px] uppercase tracking-widest">LIVE BROADCAST</div>
                        <span className="text-[12px] font-mono font-bold opacity-40 uppercase tracking-widest">MATCH DAY // TOSS</span>
                    </div>
                    
                    <h2 className="text-7xl font-black italic uppercase tracking-tighter mb-16 text-center leading-none">THE <span className="text-teal-500">TOSS</span></h2>
                    
                    <div className="bg-white/5 backdrop-blur-xl p-12 rounded-[60px] border border-white/10 w-full text-center shadow-2xl">
                        {tvLogo && (
                            <div className={`absolute -top-12 -right-6 w-28 h-28 opacity-80 ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                        )}
                        
                        <div className="flex justify-between items-center mb-16 px-6">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-4xl font-black italic mb-3 border border-white/10">
                                    {match.teamA[0]}
                                </div>
                                <p className="text-[12px] font-black uppercase tracking-widest opacity-60">{match.teamA}</p>
                            </div>
                            <div className="text-lg font-mono font-bold opacity-20 uppercase tracking-widest">VS</div>
                            <div className="text-center">
                                <div className="w-24 h-24 bg-white/5 rounded-3xl flex items-center justify-center text-4xl font-black italic mb-3 border border-white/10">
                                    {match.teamB[0]}
                                </div>
                                <p className="text-[12px] font-black uppercase tracking-widest opacity-60">{match.teamB}</p>
                            </div>
                        </div>

                        {tossState === 'coin' ? (
                            <motion.button 
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => {
                                    const winnerId = Math.random() > 0.5 ? gameData.teams.find(t => t.name === match.teamA)?.id : gameData.teams.find(t => t.name === match.teamB)?.id;
                                    const winnerTeam = gameData.teams.find(t => t.id === winnerId);

                                    if (!winnerTeam) {
                                        console.error('Toss winner not found!');
                                        return;
                                    }

                                    if (winnerTeam.id === gameData.userTeamId) {
                                        setTossState('result');
                                    } else {
                                        const decision = Math.random() > 0.5 ? 'bat' : 'bowl';
                                        startMatch(winnerTeam.id, decision);
                                        if (decision === 'bowl') {
                                            setShowBattingOrderEditor(true);
                                        }
                                    }
                                }}
                                className="w-full bg-teal-500 text-black font-black py-12 rounded-[60px] text-6xl uppercase italic tracking-tighter shadow-[0_0_80px_rgba(20,184,166,0.4)] hover:invert transition-all"
                            >
                                FLIP COIN 🪙
                            </motion.button>
                        ) : (
                            <div className="space-y-12 animate-fade-in">
                                <div>
                                    <p className="text-teal-400 font-black text-6xl uppercase italic tracking-tighter">YOU WON THE TOSS!</p>
                                    <p className="text-white/40 text-[15px] font-black uppercase tracking-widest mt-3">SELECT YOUR STRATEGY</p>
                                </div>
                                <div className="flex gap-8">
                                    <button 
                                        onClick={() => { 
                                            console.log("User chose to bat"); 
                                            startMatch(gameData.userTeamId, 'bat'); 
                                            setShowBattingOrderEditor(true);
                                        }} 
                                        className="flex-1 bg-white text-black py-12 rounded-[40px] font-black uppercase italic tracking-tighter text-4xl hover:bg-teal-500 transition-all"
                                    >
                                        BAT 🏏
                                    </button>
                                    <button 
                                        onClick={() => { 
                                            console.log("User chose to bowl"); 
                                            startMatch(gameData.userTeamId, 'bowl'); 
                                        }} 
                                        className="flex-1 bg-white/10 text-white border border-white/10 py-12 rounded-[40px] font-black uppercase italic tracking-tighter text-4xl hover:bg-white/20 transition-all"
                                    >
                                        BOWL ⚾
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }


    if (showBattingOrderEditor && state) return (
        <BattingOrderEditor 
            state={state} 
            gameData={gameData} 
            battingOrderSelection={battingOrderSelection}
            setBattingOrderSelection={setBattingOrderSelection}
            updateBattingOrder={updateBattingOrder}
            setShowBattingOrderEditor={setShowBattingOrderEditor}
            beginMatch={beginMatch}
        />
    );

    if (!state || !innings || innings.length === 0) {
        console.warn('LiveMatchScreen: Innings data not available yet.');
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                <div className="w-16 h-16 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4" />
                <h2 className="text-2xl font-black italic uppercase tracking-tighter">Initializing Match...</h2>
                <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">Preparing the field and players</p>
            </div>
        );
    }

    // Ensure currentInningIndex is valid
    if (currentInningIndex < 0 || currentInningIndex >= innings.length) {
        console.error('LiveMatchScreen: Invalid currentInningIndex:', currentInningIndex);
        return (
            <div className="h-full flex flex-col items-center justify-center bg-slate-900 text-white p-8">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-red-500">Error: Invalid Inning State</h2>
                <p className="text-xs font-mono opacity-40 uppercase tracking-widest mt-2">Something went wrong with the match initialization</p>
            </div>
        );
    }

    const currentInning = innings[currentInningIndex];
    console.log("LiveMatchScreen state status:", state.status);
    const striker = currentInning.batting.find(b => b.playerId === currentBatters.strikerId);
    const nonStriker = currentInning.batting.find(b => b.playerId === currentBatters.nonStrikerId);
    const bowler = currentInning.bowling.find(b => b.playerId === currentBowlerId);

    const runRate = parseFloat(currentInning.overs) > 0 ? (currentInning.score / parseFloat(currentInning.overs)).toFixed(2) : "0.00";
    let reqRate: string | null = null;
    let runsNeeded: number | null = null;
    let ballsRemaining: number | null = null;
    
    const isT20 = gameData.currentFormat.includes('T20');
    const isODI = gameData.currentFormat.includes('ODI') || gameData.currentFormat.includes('One-Day');
    const maxOvers = isT20 ? 20 : isODI ? 50 : 0;
    const totalBalls = maxOvers * 6;
    const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + Math.round((parseFloat(currentInning.overs) % 1) * 10);

    if (target) {
        runsNeeded = target - currentInning.score + 1;
        ballsRemaining = Math.max(0, totalBalls - ballsBowled);
        if (ballsRemaining > 0) {
             reqRate = (runsNeeded / (ballsRemaining/6)).toFixed(2);
        } else {
            reqRate = "∞";
        }
    } else if (totalBalls > 0) {
        // First inning remaining balls
        ballsRemaining = Math.max(0, totalBalls - ballsBowled);
    }

    const fielders = [
        { x: 160, y: 80 }, { x: 240, y: 80 }, { x: 100, y: 160 }, { x: 300, y: 160 },
        { x: 120, y: 280 }, { x: 280, y: 280 }, { x: 200, y: 340 }, { x: 60, y: 200 }, { x: 340, y: 200 }
    ];

    const lastBall = recentBalls.length > 0 ? recentBalls[0] : null;
    const isWicket = lastBall === 'W';
    const isBoundary = lastBall === '4' || lastBall === '6';

    // --- Selection Modals ---
    const renderSelectionModal = (title: string, options: any[], onSelect: (id: any) => void, onConfirm: () => void, selectedValue: string, setValue: (v: string) => void, extraSelect?: any) => {
        if (state.autoPlayType === 'inning' || state.autoPlayType === 'match') return <div className="absolute inset-0 bg-black/50 z-50 flex items-center justify-center text-white font-black animate-pulse text-[10px] uppercase tracking-widest">Simulating...</div>;
        
        // Sorting logic: if it's a bowler selection, sort by secondarySkill (bowling skill)
        const isBowlerSelection = title.toLowerCase().includes('bowler');
        const sortedOptions = [...options].sort((a, b) => {
            const pA = getPlayerById(a.playerId, gameData.allPlayers);
            const pB = getPlayerById(b.playerId, gameData.allPlayers);
            if (isBowlerSelection) {
                return pB.secondarySkill - pA.secondarySkill;
            }
            // For batters, sort by battingSkill
            return pB.battingSkill - pA.battingSkill;
        });

        return (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 bg-slate-950/95 z-[200] flex flex-col p-6 backdrop-blur-xl"
            >
                <div className="flex items-center gap-3 mb-6 p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                    <Icons.Settings className="w-5 h-5 text-teal-500 animate-spin-slow" />
                    <div>
                        <h3 className="text-lg font-black italic uppercase tracking-tighter text-white leading-none">{title}</h3>
                        <p className="text-[8px] text-teal-500 font-black uppercase tracking-[0.4em] mt-1">
                            {isBowlerSelection ? `Choose bowler for ${bowlingTeam.name}` : `Choose batter for ${battingTeam.name}`}
                        </p>
                    </div>
                </div>

                <div className="flex-grow overflow-y-auto pr-2 custom-scrollbar">
                    <div className="grid grid-cols-1 gap-3">
                        {sortedOptions.map(p => {
                            const pDetails = getPlayerById(p.playerId, gameData.allPlayers);
                            const skill = isBowlerSelection ? pDetails.secondarySkill : pDetails.battingSkill;
                            const isSelected = selectedValue === p.playerId;
                            
                            const fitness = pDetails.fitness || 100;
                            const form = pDetails.form || 50;
                            const isInjured = pDetails.injury || fitness < 40;
                            const isExhausted = fitness < 60;
                            const isHot = form > 80;

                            return (
                                <motion.button
                                    key={p.playerId}
                                    disabled={!!isInjured}
                                    whileHover={isInjured ? {} : { scale: 1.02 }}
                                    whileTap={isInjured ? {} : { scale: 0.98 }}
                                    onClick={() => setValue(p.playerId)}
                                    className={`relative flex items-center gap-4 p-4 rounded-2xl border transition-all text-left overflow-hidden ${
                                        isSelected 
                                            ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_30px_rgba(20,184,166,0.3)]' 
                                            : isInjured 
                                                ? 'bg-red-500/10 border-red-500/30 opacity-50 cursor-not-allowed'
                                                : 'bg-white/5 border-white/10 text-white hover:bg-white/10'
                                    } ${isHot && !isSelected ? 'shadow-[inset_0_0_15px_rgba(20,184,166,0.2)] border-teal-500/30' : ''}`}
                                >
                                    {/* Effects Layer */}
                                    {isInjured && (
                                        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
                                    )}
                                    {isHot && !isSelected && (
                                        <div className="absolute inset-0 bg-teal-500/5 backdrop-blur-[1px] pointer-events-none" />
                                    )}

                                    <PlayerAvatar player={pDetails} size="md" />
                                    
                                    <div className="flex-grow">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <p className="font-black uppercase italic text-lg leading-tight">{pDetails.name}</p>
                                                    {isInjured && <Icons.AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />}
                                                    {isHot && <span className="text-[6px] bg-teal-500 text-black px-1 rounded font-black">PEAK</span>}
                                                </div>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <p className={`text-[9px] font-bold uppercase tracking-widest ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                                                        {pDetails.role}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 ml-2">
                                                        <span className={`flex items-center gap-0.5 text-[7px] font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-black/20 text-black' : isExhausted ? 'bg-yellow-500/20 text-yellow-500' : 'bg-white/5 text-white/40'}`}>
                                                            🔋 {fitness}%
                                                        </span>
                                                        <span className={`text-[7px] font-black px-1.5 py-0.5 rounded ${isSelected ? 'bg-black/20 text-black' : isHot ? 'bg-teal-500/20 text-teal-400' : 'bg-white/5 text-white/40'}`}>
                                                            🔥 {form}%
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className={`text-[10px] font-black uppercase opacity-60 ${isSelected ? 'text-black' : 'text-white'}`}>Skill</span>
                                                <span className={`text-xl font-black italic ${isSelected ? 'text-black' : 'text-teal-500'}`}>{skill}</span>
                                            </div>
                                        </div>

                                        <div className={`mt-3 grid grid-cols-3 gap-2 p-2 rounded-xl border ${isSelected ? 'bg-black/5 border-black/10' : 'bg-black/40 border-white/5'}`}>
                                            {isBowlerSelection ? (
                                                <>
                                                    <div className="text-center">
                                                        <p className={`text-[6px] font-black uppercase ${isSelected ? 'text-black/40' : 'opacity-40'}`}>Pace</p>
                                                        <p className={`text-[10px] font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>{pDetails.role === 'BL' ? pDetails.secondarySkill : Math.floor(pDetails.secondarySkill * 0.7)}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[6px] font-black uppercase ${isSelected ? 'text-black/40' : 'opacity-40'}`}>Spin</p>
                                                        <p className={`text-[10px] font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>{pDetails.role === 'SB' ? pDetails.secondarySkill : Math.floor(pDetails.secondarySkill * 0.5)}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[6px] font-black uppercase ${isSelected ? 'text-black/40' : 'opacity-40'}`}>Econ</p>
                                                        <p className={`text-[10px] font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>{pDetails.accuracy || 65}</p>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="text-center">
                                                        <p className={`text-[6px] font-black uppercase ${isSelected ? 'text-black/40' : 'opacity-40'}`}>Power</p>
                                                        <p className={`text-[10px] font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>{pDetails.battingSkill + (pDetails.archetype === 'Aggressive' ? 5 : 0)}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[6px] font-black uppercase ${isSelected ? 'text-black/40' : 'opacity-40'}`}>Timing</p>
                                                        <p className={`text-[10px] font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>{pDetails.battingSkill + (pDetails.archetype === 'Balanced' ? 5 : 0)}</p>
                                                    </div>
                                                    <div className="text-center">
                                                        <p className={`text-[6px] font-black uppercase ${isSelected ? 'text-black/40' : 'opacity-40'}`}>Cons</p>
                                                        <p className={`text-[10px] font-black uppercase italic ${isSelected ? 'text-black' : 'text-white'}`}>{Math.floor((pDetails.rating || pDetails.battingSkill) * 0.9)}</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {isBowlerSelection && p.overs && (
                                            <div className={`mt-2 flex gap-4 text-[10px] font-bold uppercase tracking-widest ${isSelected ? 'text-black/60' : 'text-white/40'}`}>
                                                <span>Overs: {p.overs}</span>
                                                <span>Wickets: {p.wickets}</span>
                                                <span>Econ: {p.economy?.toFixed(2) || '0.00'}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {getPlayerPhaseTags(pDetails.stats[gameData.currentFormat] || {} as any).map(tag => (
                                                <span key={tag} className={`text-[6px] font-black px-1.5 py-0.5 rounded-full border ${isSelected ? 'bg-black/10 border-black/20 text-black' : 'bg-teal-500/10 border-teal-500/20 text-teal-400'}`}>
                                                    {tag.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/20 p-2 rounded-full">
                                            <Icons.PlayMatch className="w-4 h-4" />
                                        </div>
                                    )}
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button 
                        disabled={!selectedValue}
                        onClick={onConfirm}
                        className="flex-grow bg-teal-500 hover:bg-teal-400 text-black font-black py-5 rounded-2xl text-sm uppercase tracking-[0.2em] disabled:opacity-50 disabled:grayscale transition-all shadow-2xl flex items-center justify-center gap-3 group"
                    >
                        CONFIRM_STRATEGY
                        <Icons.ArrowRightLeft className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </motion.div>
        );
    };

    // --- Match Centre Overlay ---
    const renderMatchCentre = () => (
        <div className="absolute inset-0 bg-[#050808]/95 z-40 flex flex-col p-6 animate-fade-in backdrop-blur-3xl">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">MATCH_CENTRE</h2>
                </div>
                <button onClick={() => setShowMatchCentre(false)} className="p-2.5 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-all">
                    <Icons.X className="h-6 w-6 text-white/40" />
                </button>
            </div>
            
            <div className="flex bg-white/[0.03] rounded-2xl p-1 mb-6 border border-white/5">
                {['scorecard', 'commentary', 'analysis', 'stats'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all duration-500 ${activeTab === tab ? 'bg-white text-black shadow-xl' : 'text-white/30 hover:text-white hover:bg-white/5'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide">
                {activeTab === 'stats' && (
                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="SEARCH PLAYER..."
                                value={statsSearchQuery}
                                onChange={(e) => setStatsSearchQuery(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50 transition-all"
                            />
                            <Icons.Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                        </div>

                        <div className="space-y-2">
                             <h4 className="text-[8px] font-black text-teal-500 uppercase tracking-widest px-1">MATCH_SQUAD_STATS</h4>
                             {gameData.allPlayers
                                .filter(p => {
                                    const inMatch = battingTeam.squad.some(s => s.id === p.id) || bowlingTeam.squad.some(s => s.id === p.id);
                                    if (!inMatch) return false;
                                    if (statsSearchQuery) return p.name.toLowerCase().includes(statsSearchQuery.toLowerCase());
                                    return true;
                                })
                                .sort((a, b) => b.battingSkill - a.battingSkill)
                                .map(p => {
                                    const stats = p.stats[gameData.currentFormat];
                                    return (
                                        <div key={p.id} className="bg-white/[0.02] border border-white/5 p-3 rounded-2xl flex items-center justify-between group hover:bg-white/5 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-black/40 border border-white/10 overflow-hidden">
                                                    <PlayerAvatar player={p} size="sm" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase italic text-white leading-tight">{p.name}</p>
                                                    <p className="text-[7px] font-black text-white/30 uppercase tracking-widest">{p.role}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="text-right">
                                                    <p className="text-[6px] text-white/20 uppercase font-black">Batting</p>
                                                    <p className="text-[10px] font-black text-teal-500">{stats?.runs || 0}r @ {stats?.average.toFixed(1) || '0.0'}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[6px] text-white/20 uppercase font-black">Bowling</p>
                                                    <p className="text-[10px] font-black text-blue-500">{stats?.wickets || 0}w @ {stats?.economy.toFixed(1) || '0.0'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })
                             }
                        </div>
                    </div>
                )}
                {activeTab === 'scorecard' && (
                    <div className="space-y-3">
                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                            <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-1.5">
                                <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-teal-500">Batting - {battingTeam.name}</h3>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setScorecardSort(prev => prev === 'order' ? 'runs' : 'order')}
                                        className="text-[6px] font-black text-teal-500 uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-1.5 py-0.5 rounded border border-white/5"
                                    >
                                        SORT: {scorecardSort === 'order' ? 'BATTING_ORDER' : 'MOST_RUNS'}
                                    </button>
                                    {battingTeam.id === gameData.userTeamId && state.status === 'inprogress' && (
                                        <button 
                                            onClick={() => setShowBattingOrderEditor(true)}
                                            className="text-[6px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors bg-white/5 px-1.5 py-0.5 rounded border border-white/5 flex items-center gap-1"
                                        >
                                            <Icons.ArrowRightLeft className="w-1.5 h-1.5" />
                                            EDIT_ORDER
                                        </button>
                                    )}
                                    <div className="text-2xl text-teal-500 font-mono font-black tracking-tighter drop-shadow-[0_0_10px_rgba(20,184,166,0.3)]">
                                        {currentInning.score}/{currentInning.wickets}
                                        <span className="text-white/30 text-[10px] italic ml-2 font-black uppercase">Overs: {currentInning.overs}</span>
                                    </div>
                                </div>
                            </div>
                            <table className="w-full text-[9px]">
                                <thead>
                                    <tr className="text-white/20 text-left border-b border-white/5">
                                        <th className="pb-1 font-black uppercase tracking-widest text-[7px]">Batter</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">R</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">B</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">4s</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">6s</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">SR</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[...currentInning.batting]
                                        .sort((a, b) => {
                                            if (scorecardSort === 'runs') return b.runs - a.runs;
                                            return 0; // Keep original order
                                        })
                                        .map((b, idx) => {
                                            const isBatting = b.playerId === currentBatters.strikerId || b.playerId === currentBatters.nonStrikerId;
                                            const hasBatted = b.isOut || isBatting || b.runs > 0 || b.balls > 0;
                                            
                                            if (!hasBatted) return null;

                                            return (
                                                <tr key={b.playerId} className={`border-b border-white/[0.02] ${b.isOut ? 'text-white/30' : 'text-white'}`}>
                                                    <td className="py-1.5">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="text-[7px] text-white/10 font-mono w-2">{currentInning.batting.findIndex(pb => pb.playerId === b.playerId) + 1}</span>
                                                            <div className="flex flex-col">
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="font-black italic uppercase tracking-tighter">
                                                                        {b.playerName} {b.playerId === currentBatters.strikerId ? '*' : ''}
                                                                    </span>
                                                                    <span className="text-[6px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-1 rounded">
                                                                        AVG: {gameData.allPlayers.find(p => p.id === b.playerId)?.stats?.[gameData.currentFormat]?.average.toFixed(1) || '0.0'}
                                                                    </span>
                                                                </div>
                                                                <span className="text-[6px] text-teal-500/60 font-black uppercase tracking-widest">
                                                                    {b.isOut ? b.dismissalText : isBatting ? 'BATTING' : ''}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="text-right font-black text-[10px]">{b.runs}</td>
                                                    <td className="text-right opacity-40">{b.balls}</td>
                                                    <td className="text-right opacity-40">{b.fours}</td>
                                                    <td className="text-right opacity-40">{b.sixes}</td>
                                                    <td className="text-right font-mono text-[8px] text-teal-500/60">{b.balls > 0 ? Math.round((b.runs/b.balls)*100) : 0}</td>
                                                </tr>
                                            );
                                        })}
                                </tbody>
                            </table>
                            
                            {/* Did Not Bat Section */}
                            {currentInning.batting.some(b => !b.isOut && b.playerId !== currentBatters.strikerId && b.playerId !== currentBatters.nonStrikerId && b.runs === 0 && b.balls === 0) && (
                                <div className="mt-2 pt-1.5 border-t border-white/5">
                                    <p className="text-[6px] font-black text-white/20 uppercase tracking-widest mb-0.5">DID_NOT_BAT</p>
                                    <p className="text-[8px] text-white/40 italic font-medium">
                                        {currentInning.batting
                                            .filter(b => !b.isOut && b.playerId !== currentBatters.strikerId && b.playerId !== currentBatters.nonStrikerId && b.runs === 0 && b.balls === 0)
                                            .map(b => b.playerName)
                                            .join(', ')}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-blue-500 mb-2 border-b border-white/5 pb-1.5">Bowling - {bowlingTeam.name}</h3>
                            <table className="w-full text-[9px]">
                                <thead>
                                    <tr className="text-white/20 text-left border-b border-white/5">
                                        <th className="pb-1 font-black uppercase tracking-widest text-[7px]">Bowler</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">O</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">M</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">R</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">W</th>
                                        <th className="text-right pb-1 font-black uppercase tracking-widest text-[7px]">ECN</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentInning.bowling.filter(b => parseFloat(b.overs) > 0 || b.playerId === currentBowlerId).map(b => (
                                        <tr key={b.playerId} className="border-b border-white/[0.02] text-white">
                                            <td className="py-1.5">
                                                <div className="flex flex-col">
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="font-black italic uppercase tracking-tighter">
                                                            {b.playerName} {b.playerId === currentBowlerId ? '🥎' : ''}
                                                        </span>
                                                        <span className="text-[6px] font-black text-white/20 uppercase tracking-widest bg-white/5 px-1 rounded">
                                                            ECN: {gameData.allPlayers.find(p => p.id === b.playerId)?.stats?.[gameData.currentFormat]?.economy.toFixed(1) || '0.0'}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="text-right font-mono">{b.overs}</td>
                                            <td className="text-right">{b.maidens}</td>
                                            <td className="text-right">{b.runsConceded}</td>
                                            <td className="text-right font-black text-[10px] text-teal-500">{b.wickets}</td>
                                            <td className="text-right font-mono text-[8px] text-blue-500/60">{b.ballsBowled > 0 ? ((b.runsConceded/b.ballsBowled)*6).toFixed(1) : '0.0'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Fall of Wickets */}
                        {state.fallOfWickets.length > 0 && (
                            <div className="bg-white/[0.02] rounded-xl p-2.5 border border-white/5">
                                <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-red-500 mb-2 border-b border-white/5 pb-1.5">Fall of Wickets</h3>
                                <div className="flex flex-wrap gap-1.5">
                                    {state.fallOfWickets.map((fow, i) => (
                                        <div key={i} className="bg-black/40 px-2 py-1 rounded-lg border border-white/5 text-[8px]">
                                            <span className="font-black text-white">{fow.score}-{fow.wicket}</span>
                                            <span className="text-white/20 ml-1 font-bold">({fow.player}, {fow.over} ov)</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'commentary' && (
                    <div className="space-y-1.5" ref={commentaryRef}>
                        {commentary.map((line, i) => (
                            <div key={i} className="bg-white/[0.02] p-2 rounded-lg text-[9px] font-mono text-white/60 border-l-2 border-teal-500/40 backdrop-blur-sm">
                                {line}
                            </div>
                        ))}
                    </div>
                )}

                {activeTab === 'analysis' && predictions && (
                    <div className="space-y-3">
                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-white mb-2.5">WIN_PROBABILITY</h3>
                            <div className="h-2 bg-white/5 rounded-full overflow-hidden relative border border-white/5">
                                <div className="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)] transition-all duration-1000" style={{ width: `${battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%` }}></div>
                            </div>
                            <div className="flex justify-between text-[8px] mt-1.5 font-black uppercase tracking-widest">
                                <span className="text-teal-500">{gameData.userTeamId === battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id === gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                                <span className="text-white/20">{gameData.userTeamId !== battingTeam.id ? battingTeam.name : bowlingTeam.name} {battingTeam.id !== gameData.userTeamId ? predictions.winProb : 100 - predictions.winProb}%</span>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-white mb-2.5">PROJECTED_SCORE</h3>
                            <div className="grid grid-cols-2 gap-2 text-center">
                                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-0.5">CURRENT_RATE</div>
                                    <div className="text-base font-black text-white italic">{predictions.projCurrent}</div>
                                </div>
                                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-0.5">AT_8_RPO</div>
                                    <div className="text-base font-black text-white italic">{predictions.proj8}</div>
                                </div>
                                <div className="bg-black/40 p-2 rounded-lg border border-white/5">
                                    <div className="text-[6px] text-white/20 uppercase font-black tracking-widest mb-0.5">AT_10_RPO</div>
                                    <div className="text-base font-black text-white italic">{predictions.proj10}</div>
                                </div>
                                 <div className="bg-teal-500/10 p-2 rounded-lg border border-teal-500/20">
                                    <div className="text-[6px] text-teal-500 uppercase font-black tracking-widest mb-0.5">SAFE_SCORE</div>
                                    <div className="text-base font-black text-teal-500 italic">{gameData.currentFormat.includes('T20') ? 175 : 285}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                            <h3 className="text-[9px] font-black italic uppercase tracking-tighter text-white mb-2">PLAYER_PREDICTION</h3>
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/60 font-black italic uppercase tracking-tighter">{striker?.playerName} TO_SCORE</span>
                                <span className="text-xl font-black text-teal-500 italic tracking-tighter">{predictions.playerProj}</span>
                            </div>
                            <p className="text-[6px] text-white/20 mt-1 uppercase font-black tracking-widest">BASED_ON_CURRENT_SR_AND_SITUATION</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );

    const renderBattingOrderEditor = () => (
        <div className="absolute inset-0 bg-black/95 z-50 flex flex-col p-6 animate-fade-in backdrop-blur-3xl overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Batting_Order_Editor</h2>
                </div>
                <button onClick={() => setShowBattingOrderEditor(false)} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                    <Icons.X className="h-6 w-6 text-white/40" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 scrollbar-hide pb-20">
                <Reorder.Group axis="y" values={currentInning.batting} onReorder={(newOrder) => updateBattingOrder(newOrder.map(b => b.playerId))} className="space-y-2">
                    {currentInning.batting.map((player, index) => {
                        const isOut = player.isOut;
                        const isBatting = player.playerId === currentBatters.strikerId || player.playerId === currentBatters.nonStrikerId;
                        
                        return (
                            <Reorder.Item 
                                key={player.playerId} 
                                value={player}
                                dragListener={!isOut && !isBatting}
                                className={`p-4 rounded-2xl flex items-center gap-4 border transition-all ${
                                    isBatting ? 'bg-teal-500/20 border-teal-500/40 text-teal-400' :
                                    isOut ? 'bg-white/5 border-white/5 text-white/20 opacity-50 grayscale' :
                                    'bg-white/[0.03] border-white/10 text-white cursor-grab active:cursor-grabbing hover:bg-white/10'
                                }`}
                            >
                                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-black italic border border-white/5">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <div className="text-sm font-black italic uppercase tracking-tighter">{player.playerName}</div>
                                    <div className="text-[8px] font-black uppercase tracking-widest opacity-60">
                                        {isOut ? `OUT - ${player.dismissalText}` : isBatting ? 'CURRENTLY_BATTING' : 'WAITING_TO_BAT'}
                                    </div>
                                </div>
                                {!isOut && !isBatting && (
                                    <div className="text-white/20">
                                        <Icons.ArrowRightLeft className="w-4 h-4 rotate-90" />
                                    </div>
                                )}
                            </Reorder.Item>
                        );
                    })}
                </Reorder.Group>
            </div>

            <div className="absolute bottom-6 left-6 right-6">
                <button 
                    onClick={() => setShowBattingOrderEditor(false)}
                    className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] shadow-2xl"
                >
                    Save_Configuration
                </button>
            </div>
        </div>
    );

    const renderCaptainsCorner = () => {
        const team = gameData.allTeamsData.find(t => t.id === gameData.userTeamId);
        
        return (
            <div className="absolute inset-0 bg-black/95 z-50 flex flex-col p-6 animate-fade-in backdrop-blur-3xl overflow-hidden">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-teal-500 rounded-full" />
                        <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">Captains_Corner</h2>
                    </div>
                    <button onClick={() => setShowCaptainsCorner(false)} className="p-2.5 bg-white/5 rounded-xl border border-white/10">
                        <Icons.X className="h-6 w-6 text-white/40" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-1 space-y-6">
                    {/* Team Info */}
                    <div className="flex items-center gap-5 p-5 bg-white/[0.03] rounded-3xl border border-white/10">
                        <div className="w-20 h-20 p-4 bg-black/40 rounded-2xl border border-white/10" dangerouslySetInnerHTML={{ __html: team?.logo || '' }} />
                        <div>
                            <p className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-1">COMMAND_CENTRE</p>
                            <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white">{team?.name}</h3>
                            <p className="text-[8px] font-bold text-white/30 uppercase tracking-[0.2em]">Strategy: Balanced</p>
                        </div>
                    </div>

                    {/* Quick Tactics */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="p-4 bg-teal-500/10 border border-teal-500/20 rounded-2xl">
                            <Icons.Zap className="w-5 h-5 text-teal-500 mb-2" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Aggressive</h4>
                            <p className="text-[8px] text-white/40 leading-tight">High risk, high reward play. Force the initiative.</p>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                            <Icons.Shield className="w-5 h-5 text-blue-500 mb-2" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Defensive</h4>
                            <p className="text-[8px] text-white/40 leading-tight">Safety first mentality. Minimize wicket loss.</p>
                        </div>
                    </div>

                    {/* Analysis Section - Removed as per user request */}
                    
                    {/* Match Intel - Enhanced */}
                    <div className="p-5 bg-gradient-to-br from-red-600/20 to-transparent rounded-3xl border border-red-600/10">
                        <div className="flex items-center gap-2 mb-3">
                            <Icons.Activity className="w-4 h-4 text-red-500" />
                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Opponent_Weakness</h4>
                        </div>
                        <p className="text-[9px] text-white/60 leading-relaxed italic italic font-medium">
                            The opposition's death bowling has been shaky. If we can keep 3-4 wickets in hand for the last 5 overs, we have a massive advantage.
                        </p>
                    </div>
                </div>

                <div className="mt-6 flex gap-3">
                    <button 
                        onClick={() => setShowCaptainsCorner(false)}
                        className="flex-grow bg-teal-500 text-black font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-xs transition-all shadow-xl"
                    >
                        Return_to_Field
                    </button>
                    <button 
                        onClick={() => { setShowCaptainsCorner(false); setShowMatchCentre(true); }}
                        className="flex-grow bg-white/5 border border-white/10 text-white font-black py-4 rounded-2xl uppercase tracking-[0.2em] text-[10px] transition-all"
                    >
                        View_Scorecard
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-white font-sans overflow-hidden relative">
            <AnimatePresence>
                {tvLogo && (
                    <motion.div 
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="absolute top-20 right-6 z-20 flex flex-col items-end pointer-events-none"
                    >
                        <div className={`w-28 h-20 opacity-80 flex items-center justify-end ${tvColor}`} dangerouslySetInnerHTML={{ __html: tvLogo }} />
                        <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-sm flex items-center gap-2 shadow-2xl">
                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse shadow-[0_0_8px_#ffffff]"></span>
                            LIVE STREAM
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {waitingFor === 'openers' && renderSelectionModal("Select Opening Pair", currentInning.batting.filter(p => !p.isOut && p.playerId !== selectedOpener1), (id) => setSelectedOpener2(id), () => { selectOpeners(selectedOpener1, selectedOpener2); setSelectedOpener1(''); setSelectedOpener2(''); }, selectedOpener2, setSelectedOpener2, (
                <div className="mb-4">
                    <label className="text-[10px] text-teal-500 font-black uppercase tracking-widest block mb-2">Striker</label>
                    <select className="w-full p-4 bg-black/60 border border-white/10 text-white rounded-2xl focus:border-teal-500 transition-all outline-none" value={selectedOpener1} onChange={e => setSelectedOpener1(e.target.value)}>
                        <option value="">Select Batter...</option>
                        {currentInning.batting.filter(p => !p.isOut).map(p => <option key={p.playerId} value={p.playerId}>{p.playerName}</option>)}
                    </select>
                </div>
            ))}
            {waitingFor === 'striker' && renderSelectionModal("Select Striker", [currentInning.batting.find(b => b.playerId === currentBatters.strikerId), currentInning.batting.find(b => b.playerId === currentBatters.nonStrikerId)].filter(Boolean) as any[], (id) => setSelectedBatter(id), () => { selectNextBatter(selectedBatter); setSelectedBatter(''); }, selectedBatter, setSelectedBatter)}
            {waitingFor === 'batter' && renderSelectionModal("Select Next Batter", currentInning.batting.filter(p => !p.isOut && p.playerId !== currentBatters.nonStrikerId && p.playerId !== currentBatters.strikerId), (id) => setSelectedBatter(id), () => { selectNextBatter(selectedBatter); setSelectedBatter(''); }, selectedBatter, setSelectedBatter)}
            {waitingFor === 'bowler' && renderSelectionModal("Select Next Bowler", currentInning.bowling.filter(p => p.playerId !== currentBowlerId), (id) => setSelectedBowler(id), () => { selectNextBowler(selectedBowler); setSelectedBowler(''); }, selectedBowler, setSelectedBowler)}

            <AnimatePresence>
                {showMatchCentre && renderMatchCentre()}
                {showBattingOrderEditor && renderBattingOrderEditor()}
                {showCaptainsCorner && renderCaptainsCorner()}
            </AnimatePresence>

            {/* TOP BROADCAST BAR */}
            <div className="bg-[#050808] p-6 flex justify-between items-center z-20 border-b border-white/5 flex-shrink-0 relative overflow-hidden h-20">
                 <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-teal-500/5 via-transparent to-transparent pointer-events-none" />
                 
                 <div className="flex items-center gap-6 relative z-10">
                     <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/10 rotate-3 shadow-xl">
                        <span className="text-teal-500 font-black text-lg italic drop-shadow-lg">SC</span>
                     </div>
                     <div className="flex flex-col">
                         <div className="flex items-center gap-3 mb-0.5">
                            <p className="text-[7px] font-black text-teal-400 uppercase tracking-[0.6em] animate-pulse">SIMULATION CRICKET</p>
                            <span className="text-[7px] text-white/20 font-mono">MANAGER_CORE_V0.0.1</span>
                         </div>
                         <h2 className="text-xl font-black italic uppercase tracking-tighter text-white leading-none">
                            {match.teamA} <span className="text-white/20 not-italic mx-1 text-[10px]">V</span> {match.teamB}
                         </h2>
                     </div>
                 </div>

                 <div className="flex items-center gap-8 relative z-10">
                     <div className="bg-white/5 px-5 py-1 rounded-xl border border-white/10 flex flex-col items-center shadow-inner">
                        <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em] mb-0.5">OVERS</p>
                        <p className="text-2xl font-black text-teal-500 tracking-tighter leading-none">{currentInning.overs}</p>
                     </div>
                     <button 
                        onClick={handleExit} 
                        className="bg-zinc-900/80 hover:bg-zinc-800 text-[8px] font-black text-white tracking-[0.2em] px-6 py-3 rounded-xl border border-white/10 transition-all active:scale-95 shadow-2xl flex items-center gap-2 group"
                     >
                        {state.status === 'completed' ? 'EXIT_MATCH' : 'SAVE_EXIT'}
                        <Icons.X className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                     </button>
                 </div>
                 
                 <div className="absolute bottom-0 left-0 w-full h-[2px] flex">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${battingTeam.id === gameData.userTeamId ? (predictions?.winProb || 50) : 100 - (predictions?.winProb||50)}%` }}
                        className="h-full bg-teal-500 shadow-[0_0_20px_#14b8a6]" 
                    />
                    <div className="h-full bg-white/5 flex-1" />
                 </div>
            </div>

            <ModernMatchUI 
                state={state}
                gameData={gameData}
                onSetBattingStrategy={setBattingStrategy}
                onSetBowlingStrategy={setBowlingStrategy}
                onPlayBall={playBall}
                onPlayOver={playOver}
                onShowMatchCentre={() => setShowMatchCentre(true)}
            />


                    











            <div className="bg-black/90 border-t border-white/5 p-3 flex justify-around items-center h-16">
                {[
                    { icon: Icons.Home, label: 'HOME' },
                    { icon: Icons.Activity, label: 'STATS' },
                    { icon: Icons.Database, label: 'DATABASE' },
                    { icon: Icons.Trophy, label: 'AWARDS' },
                    { icon: Icons.Settings, label: 'SETTINGS' }
                ].map(item => (
                    <div key={item.label} className="flex flex-col items-center gap-1 opacity-20 hover:opacity-100 transition-opacity cursor-pointer">
                        <item.icon className="w-4 h-4 text-white" />
                        <span className="text-[6px] font-black text-white tracking-widest">{item.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default LiveMatchScreen;
