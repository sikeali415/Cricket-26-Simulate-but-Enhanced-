
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameData, Player, Team, Format, CareerScreen, PlayerRole } from '../types';
import { getRoleColor, getRoleFullName, getSmartAILineup, getPlayerPhaseTags } from '../utils';
import { Icons } from './Icons';

interface LineupsProps {
    gameData: GameData;
    userTeam: Team;
    initialTeamId?: string;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    setScreen: (screen: CareerScreen) => void;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
    handleUpdatePlayingXI: (teamId: string, format: Format, newXI: string[]) => void;
    handleUpdateCaptain: (teamId: string, format: Format, playerId: string) => void;
    handleUpdateBowlingPlan: (teamId: string, format: Format, plan: Record<number, string>) => void;
    handleReplacePlayer?: (playerId: string) => void;
    onViewPlayer?: (player: Player) => void;
}

const Lineups: React.FC<LineupsProps> = ({ 
    gameData, 
    userTeam, 
    initialTeamId,
    setGameData, 
    setScreen, 
    showFeedback,
    handleUpdatePlayingXI,
    handleUpdateCaptain,
    handleUpdateBowlingPlan,
    handleReplacePlayer,
    onViewPlayer
}) => {
    const [selectedTeamId, setSelectedTeamId] = useState(initialTeamId || userTeam.id);
    const currentFormat = gameData.currentFormat;

    const selectedTeam = gameData.teams.find(t => t.id === selectedTeamId) || userTeam;
    const isUserTeam = selectedTeam.id === userTeam.id;

    const playingXIIds = gameData.playingXIs[selectedTeam.id]?.[currentFormat] || selectedTeam.squad.slice(0, 11).map(p => p.id);
    const playingXI = playingXIIds.map(id => selectedTeam.squad.find(p => p.id === id)).filter(Boolean) as Player[];

    const togglePlayer = (player: Player) => {
        if (!isUserTeam) return;
        if (player.injury) {
            showFeedback(`${player.name} is injured and cannot be selected`, "error");
            return;
        }
        const isSelected = playingXIIds.includes(player.id);
        let newXIIds = [...playingXIIds];

        if (isSelected) {
            newXIIds = newXIIds.filter(id => id !== player.id);
        } else {
            if (newXIIds.length >= 11) {
                showFeedback("Maximum 11 players allowed in the XI", "error");
                return;
            }
            newXIIds.push(player.id);
        }

        handleUpdatePlayingXI(selectedTeam.id, currentFormat, newXIIds);
    };

    const autoOptimize = () => {
        if (!isUserTeam) return;
        const optimizedXI = getSmartAILineup(selectedTeam, currentFormat, selectedTeam.group);
        handleUpdatePlayingXI(selectedTeam.id, currentFormat, optimizedXI.map(p => p.id));
        showFeedback("Lineup optimized for balance and form!", "success");
    };

    const replaceInjured = () => {
        if (!isUserTeam) return;
        const injuredInXI = playingXI.filter(p => p.injury);
        if (injuredInXI.length === 0) {
            showFeedback("No injured players in the current XI", "success");
            return;
        }

        const newXIIds = [...playingXIIds].filter(id => !injuredInXI.some(p => p.id === id));
        const bench = selectedTeam.squad.filter(p => !newXIIds.includes(p.id) && !p.injury && (p.fitness || 100) > 40);

        injuredInXI.forEach(injured => {
            const replacement = bench
                .sort((a, b) => {
                    const skillA = a.role === injured.role ? Math.max(a.battingSkill, a.secondarySkill) * 1.5 : Math.max(a.battingSkill, a.secondarySkill);
                    const skillB = b.role === injured.role ? Math.max(b.battingSkill, b.secondarySkill) * 1.5 : Math.max(b.battingSkill, b.secondarySkill);
                    return skillB - skillA;
                })
                .find(p => !newXIIds.includes(p.id));
            
            if (replacement) {
                newXIIds.push(replacement.id);
            }
        });

        // Re-sort using smart AI ordering
        const finalPlayers = newXIIds.map(id => selectedTeam.squad.find(p => p.id === id)).filter(Boolean) as Player[];
        const sortedXI = getSmartAILineup({ ...selectedTeam, squad: finalPlayers }, currentFormat, selectedTeam.group);
        
        handleUpdatePlayingXI(selectedTeam.id, currentFormat, sortedXI.map(p => p.id));
        showFeedback(`${injuredInXI.length} injured player(s) replaced!`, "success");
    };

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <div className="p-6 relative z-10 border-b border-white/5 bg-black/20 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                             <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-teal-500/60">SQUAD_MANAGEMENT // v2.7.0</h2>
                             {playingXI.some(p => p.injury) && (
                                 <motion.div 
                                    animate={{ opacity: [1, 0.4, 1] }} 
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="flex items-center gap-1 text-[7px] font-black text-red-500 bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20"
                                >
                                    <Icons.AlertTriangle className="w-2 h-2" />
                                    INJURY_WARNING
                                </motion.div>
                             )}
                        </div>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">
                            TEAM <span className="text-teal-500">LINEUPS</span>
                        </h1>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-2">
                        {isUserTeam && (
                            <div className="flex items-center gap-2 mr-4">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={autoOptimize}
                                    className="flex items-center gap-1.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white/60 hover:text-white px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                >
                                    <Icons.Zap className="w-3 h-3 text-teal-500" />
                                    OPTIMIZE
                                </motion.button>
                                {playingXI.some(p => p.injury) && (
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={replaceInjured}
                                        className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-500 px-3 py-2 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all"
                                    >
                                        <Icons.ForwardMatch className="w-3 h-3" />
                                        REPLACE_INJURED
                                    </motion.button>
                                )}
                            </div>
                        )}
                        
                        <div className="flex flex-col gap-1.5 min-w-[160px]">
                            <label className="text-[7px] font-black uppercase tracking-widest text-white/30 ml-1">SELECT_TEAM</label>
                            <select 
                                value={selectedTeamId}
                                onChange={(e) => setSelectedTeamId(e.target.value)}
                                className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-[10px] font-black uppercase tracking-widest text-teal-500 focus:outline-none focus:border-teal-500/50 appearance-none cursor-pointer"
                            >
                                {gameData.teams.map(t => (
                                    <option key={t.id} value={t.id} className="bg-[#050808] text-white">
                                        {t.name} {t.id === userTeam.id ? '(USER)' : ''}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="flex justify-between items-center mt-6">
                    <div className="flex items-center gap-4">
                        <span className="text-[9px] font-black text-white/40 uppercase tracking-widest">
                            FORMAT: {currentFormat}
                        </span>
                        {!isUserTeam && (
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-500/20">
                                VIEW_ONLY
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-white/5 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-teal-500 transition-all duration-500" 
                                style={{ width: `${(playingXI.length / 11) * 100}%` }}
                            />
                        </div>
                        <span className="text-[9px] font-black text-teal-500 uppercase tracking-widest">
                            {playingXI.length} / 11
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide relative z-10">
                {/* Playing XI */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">STARTING_XI (ORDERED)</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {playingXI.map((player, index) => (
                            <motion.div
                                key={player.id}
                                layout
                                className={`glass-card p-4 flex items-center gap-4 relative overflow-hidden group ${player.injury ? 'border-red-500/30 bg-red-500/5' : ''}`}
                            >
                                <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="flex flex-col items-center justify-center w-8">
                                    <span className="text-[8px] font-black text-white/20 uppercase">POS</span>
                                    <span className="text-lg font-black text-teal-500 italic">#{index + 1}</span>
                                </div>
                                    <div className="flex-grow relative z-10">
                                        <div className="flex items-center justify-between">
                                            <div className="text-sm font-black uppercase italic text-white flex items-center gap-2">
                                                {player.name}
                                                {selectedTeam.captains[currentFormat] === player.id && (
                                                    <span className="flex items-center gap-1 text-[8px] bg-yellow-500 text-black px-1.5 py-0.5 rounded-full font-black">
                                                        <Icons.Trophy className="w-2 h-2" />
                                                        CAPTAIN
                                                    </span>
                                                )}
                                                {player.injury && (
                                                    <div className="flex items-center gap-1.5 text-[8px] bg-red-500 text-white px-2 py-0.5 rounded-full font-black uppercase animate-pulse">
                                                        <Icons.AlertTriangle className="w-2.5 h-2.5" />
                                                        INJURED
                                                    </div>
                                                )}
                                                {(player.form || 50) > 80 && (
                                                    <span className="text-[7px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">PEAK</span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[6px] font-black px-1.5 py-0.5 rounded ${(player.fitness || 100) < 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-white/40'}`}>
                                                    🔋 {player.fitness || 100}%
                                                </span>
                                                <span className={`text-[6px] font-black px-1.5 py-0.5 rounded ${(player.form || 50) > 80 ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-white/40'}`}>
                                                    🔥 {player.form || 50}%
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mt-0.5">
                                            <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${getRoleColor(player.role)}`}>
                                                {getRoleFullName(player.role)}
                                            </div>
                                            {player.isOpener && (
                                                <div className="text-[7px] font-black text-teal-400/60 uppercase tracking-widest">OPENER</div>
                                            )}
                                            {/* Mastery Tags */}
                                            <div className="flex flex-wrap gap-1">
                                                {getPlayerPhaseTags(player.stats[currentFormat] || {} as any).map(tag => (
                                                    <span key={tag} className="text-[6px] font-black px-1.5 py-0.5 rounded-full border bg-teal-500/10 border-teal-500/20 text-teal-400">
                                                        {tag.toUpperCase()}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-2 text-[7px] font-bold text-white/30 uppercase tracking-widest">
                                                <span>SKILL: {Math.max(player.battingSkill, player.secondarySkill)}</span>
                                            </div>
                                        </div>

                                        {/* Detailed Stats Overlay */}
                                        <div className="grid grid-cols-2 gap-3 mt-2 p-2 bg-black/40 rounded-xl border border-white/5 group-hover:border-teal-500/20 transition-all">
                                            <div className="space-y-1">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[6px] font-black text-white/20 uppercase tracking-widest">BATTING</p>
                                                    <span className="text-[6px] font-bold text-white/40">{player.stats[currentFormat]?.matches || 0}M</span>
                                                </div>
                                                <div className="grid grid-cols-3 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-teal-500 leading-none">{player.stats[currentFormat]?.runs || 0}</span>
                                                        <span className="text-[5px] text-white/30 font-bold uppercase">RUNS</span>
                                                    </div>
                                                    <div className="flex flex-col text-center">
                                                        <span className="text-[10px] font-black text-teal-300 leading-none">{player.stats[currentFormat]?.runsByPosition?.[index + 1] || 0}</span>
                                                        <span className="text-[4px] text-teal-500/60 font-black uppercase">AT #{index + 1}</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[10px] font-black text-white leading-none">{(player.stats[currentFormat]?.average || 0).toFixed(1)}</span>
                                                        <span className="text-[5px] text-white/30 font-bold uppercase">AVG</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-1 border-l border-white/5 pl-3">
                                                <div className="flex items-center justify-between">
                                                    <p className="text-[6px] font-black text-white/20 uppercase tracking-widest">BOWLING</p>
                                                    <span className="text-[6px] font-bold text-white/40">{player.stats[currentFormat]?.strikeRate ? player.stats[currentFormat]?.strikeRate.toFixed(1) : '0.0'} <span className="text-[5px]">SR</span></span>
                                                </div>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-[10px] font-black text-blue-400 leading-none">{player.stats[currentFormat]?.wickets || 0}</span>
                                                        <span className="text-[5px] text-white/30 font-bold uppercase">WKTS</span>
                                                    </div>
                                                    <div className="flex flex-col text-right">
                                                        <span className="text-[10px] font-black text-white leading-none">{(player.stats[currentFormat]?.economy || 0).toFixed(1)}</span>
                                                        <span className="text-[5px] text-white/30 font-bold uppercase">ECO</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                {isUserTeam && (
                                    <div className="flex items-center gap-2 relative z-10">
                                        <button 
                                            onClick={() => handleUpdateCaptain(selectedTeam.id, currentFormat, player.id)}
                                            className={`p-2 rounded-xl transition-all ${selectedTeam.captains[currentFormat] === player.id ? 'text-yellow-500 bg-yellow-500/10' : 'text-white/20 hover:text-white/60 hover:bg-white/5'}`}
                                            title="Set as Captain"
                                        >
                                            <span className="text-xs font-black">C</span>
                                        </button>
                                        <button 
                                            onClick={() => togglePlayer(player)}
                                            className="p-2 text-red-500/60 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                        >
                                            <Icons.X className="w-5 h-5" />
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        ))}
                        {playingXI.length === 0 && (
                            <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-[32px] text-white/20 text-[10px] font-black uppercase tracking-[0.3em] italic">
                                NO_PLAYERS_SELECTED
                            </div>
                        )}
                    </div>
                </div>

                {/* Bench */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">AVAILABLE_SQUAD</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {selectedTeam.squad.filter(p => !playingXIIds.includes(p.id)).sort((a,b) => b.battingSkill - a.battingSkill).map((player) => (
                            <motion.div
                                key={player.id}
                                layout
                                onClick={() => player.injury && showFeedback(`${player.name} is injured: ${player.injury.type}`, "error")}
                                className={`glass-card p-4 flex items-center gap-4 transition-all relative overflow-hidden group ${player.injury ? 'opacity-40 grayscale' : isUserTeam ? 'hover:border-teal-500/40' : ''}`}
                            >
                                <div className="flex-grow relative z-10">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-black uppercase italic text-white flex items-center gap-2">
                                            {player.name}
                                            {player.injury && (
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[7px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">
                                                        {player.injury.isSeasonEnding ? 'SEASON_OUT' : `OUT: ${player.injury.matchesOut}M`}
                                                    </span>
                                                    {player.injury.isSeasonEnding && handleReplacePlayer && isUserTeam && (
                                                        <button 
                                                            onClick={(e) => { e.stopPropagation(); handleReplacePlayer(player.id); }}
                                                            className="text-[7px] bg-teal-500 text-black px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest hover:bg-teal-400 transition-colors"
                                                        >
                                                            SIGN_REPLACEMENT
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                            {(player.form || 50) > 80 && (
                                                <span className="text-[7px] bg-teal-500/20 text-teal-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">PEAK</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                            <span className={`text-[6px] font-black px-1.5 py-0.5 rounded ${(player.fitness || 100) < 60 ? 'bg-yellow-500/10 text-yellow-500' : 'bg-white/5 text-white/40'}`}>
                                                🔋 {player.fitness || 100}%
                                            </span>
                                            <span className={`text-[6px] font-black px-1.5 py-0.5 rounded ${(player.form || 50) > 80 ? 'bg-teal-500/10 text-teal-400' : 'bg-white/5 text-white/40'}`}>
                                                🔥 {player.form || 50}%
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 mt-0.5">
                                        <div className={`text-[8px] font-black uppercase tracking-[0.2em] ${getRoleColor(player.role)}`}>
                                            {getRoleFullName(player.role)}
                                        </div>
                                        {/* Mastery Tags */}
                                        <div className="flex flex-wrap gap-1">
                                            {getPlayerPhaseTags(player.stats[currentFormat] || {} as any).map(tag => (
                                                <span key={tag} className="text-[6px] font-black px-1.5 py-0.5 rounded-full border bg-teal-500/10 border-teal-500/20 text-teal-400">
                                                    {tag.toUpperCase()}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    {/* Quick Stats Overlay */}
                                    <div className="grid grid-cols-2 gap-3 mt-2 p-2 bg-black/40 rounded-xl border border-white/5 opacity-60 group-hover:opacity-100 transition-all group-hover:border-teal-500/20">
                                        <div className="space-y-1">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[6px] font-black text-white/20 uppercase tracking-widest">BATTING</p>
                                                <span className="text-[6px] font-bold text-white/40">{player.stats[currentFormat]?.matches || 0}M</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-teal-500 leading-none">{player.stats[currentFormat]?.runs || 0}</span>
                                                    <span className="text-[5px] text-white/30 font-bold uppercase">RUNS</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] font-black text-white leading-none">{(player.stats[currentFormat]?.average || 0).toFixed(1)}</span>
                                                    <span className="text-[5px] text-white/30 font-bold uppercase">AVG</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 border-l border-white/5 pl-3">
                                            <div className="flex items-center justify-between">
                                                <p className="text-[6px] font-black text-white/20 uppercase tracking-widest">BOWLING</p>
                                                <span className="text-[6px] font-bold text-white/40">{player.stats[currentFormat]?.strikeRate ? player.stats[currentFormat]?.strikeRate.toFixed(1) : '0.0'} <span className="text-[5px]">SR</span></span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-black text-blue-400 leading-none">{player.stats[currentFormat]?.wickets || 0}</span>
                                                    <span className="text-[5px] text-white/30 font-bold uppercase">WKTS</span>
                                                </div>
                                                <div className="flex flex-col text-right">
                                                    <span className="text-[10px] font-black text-white leading-none">{(player.stats[currentFormat]?.economy || 0).toFixed(1)}</span>
                                                    <span className="text-[5px] text-white/30 font-bold uppercase">ECO</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                {isUserTeam && (
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); togglePlayer(player); }}
                                        disabled={playingXI.length >= 11 || !!player.injury}
                                        className="p-2 text-teal-500/60 hover:text-teal-500 hover:bg-teal-500/10 disabled:opacity-10 rounded-xl transition-all relative z-10"
                                    >
                                        <Icons.Plus className="w-5 h-5" />
                                    </button>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Lineups;
