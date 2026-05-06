
import React from 'react';
import { motion } from 'framer-motion';
import { Player, Format } from '../types';
import { getRoleColor, getRoleFullName, getAvatarUrl, aggregatePlayerStats, getPlayerPhaseTags } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';

interface PlayerProfileProps {
    player: Player | null;
    onBack: () => void;
    initialFormat: Format;
    onUpdatePlayer: (player: Player) => void;
    onReplacePlayer?: (playerId: string) => void;
}

const PlayerProfile: React.FC<PlayerProfileProps> = ({ player, onBack, initialFormat, onUpdatePlayer, onReplacePlayer }) => {
    if (!player) return null;

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-5 py-6 border-b border-white/5 relative z-10 flex justify-between items-center bg-black/20 backdrop-blur-md">
                <button onClick={onBack} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 transition-all active:scale-95">
                    <Icons.X className="w-6 h-6 text-white" />
                </button>
                <div className="flex flex-col items-center">
                    <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-teal-500/60">PLAYER_DOSSIER // v2.6.0</h2>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">PLAYER PROFILE</h1>
                </div>
                <div className="w-10" />
            </header>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide pb-10 relative z-10">
                {/* Header Card */}
                <div className="glass-card p-8 flex flex-col items-center text-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                        <Icons.User className="w-48 h-48" />
                    </div>
                    
                    <div className="w-32 h-32 rounded-3xl p-1.5 mb-6 border-2 border-teal-500/20 relative shadow-[0_0_40px_rgba(20,184,166,0.1)] overflow-hidden">
                        <PlayerAvatar player={player} size="xl" />
                        {player.injury && (
                            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-1 rounded-full shadow-lg animate-pulse">
                                INJURED
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-teal-500 text-black text-[8px] font-black uppercase rounded tracking-widest">
                            {player.nationality}
                        </span>
                        {player.isForeign && (
                            <span className="px-2 py-0.5 bg-white/10 text-white text-[8px] font-black uppercase rounded tracking-widest border border-white/10">
                                FOREIGN_ASSET
                            </span>
                        )}
                    </div>

                    <h3 className="text-4xl font-black italic uppercase tracking-tighter text-white mb-1 leading-none">
                        {player.name}
                    </h3>
                    <div className={`text-[10px] font-black uppercase tracking-[0.3em] ${getRoleColor(player.role)} mb-4`}>
                        {getRoleFullName(player.role)}
                    </div>

                    {/* Mastery Tags */}
                    {Object.entries(player.stats).some(([_, s]) => getPlayerPhaseTags(s).length > 0) && (
                        <div className="flex flex-wrap justify-center gap-2 mb-2">
                            {Array.from(new Set(Object.values(player.stats).flatMap(s => getPlayerPhaseTags(s)))).map(tag => (
                                <span key={tag} className="px-2 py-1 bg-teal-500/10 border border-teal-500/30 text-teal-400 text-[7px] font-black uppercase rounded-lg tracking-widest flex items-center gap-1.5 shadow-[0_0_15px_rgba(20,184,166,0.1)]">
                                    <div className="w-1 h-1 rounded-full bg-teal-500 animate-pulse" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}

                    {player.injury && (
                        <div className="mt-6 w-full p-4 bg-red-500/10 border border-red-500/20 rounded-2xl space-y-3">
                            <div className="space-y-1">
                                <div className="text-[10px] font-black text-red-500 uppercase tracking-widest">MEDICAL_REPORT</div>
                                <div className="text-xs font-bold text-white/80 uppercase tracking-tight">
                                    {player.injury.type} // {player.injury.isSeasonEnding ? 'OUT_FOR_SEASON' : `${player.injury.matchesOut} MATCHES_REMAINING`}
                                </div>
                            </div>
                            {player.injury.isSeasonEnding && onReplacePlayer && (
                                <button 
                                    onClick={() => onReplacePlayer(player.id)}
                                    className="w-full py-3 bg-red-500 hover:bg-red-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                                >
                                    REPLACE INJURED PLAYER
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Skills Grid */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="glass-card p-6 space-y-4">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">BATTING_SKILL</div>
                        <div className="flex items-end gap-2">
                            <div className="text-5xl font-black italic text-white leading-none">{player.battingSkill}</div>
                            <div className="text-[8px] font-black text-teal-500 uppercase tracking-widest mb-1">ELITE</div>
                        </div>
                    </div>
                    <div className="glass-card p-6 space-y-4">
                        <div className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">BOWLING_SKILL</div>
                        <div className="flex items-end gap-2">
                            <div className="text-5xl font-black italic text-white leading-none">{player.secondarySkill}</div>
                            <div className="text-[8px] font-black text-blue-500 uppercase tracking-widest mb-1">{player.style}</div>
                        </div>
                    </div>
                </div>

                {/* Career Stats */}
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">CAREER_STATISTICS</h3>
                    </div>
                    <div className="space-y-4">
                        {Object.entries(aggregatePlayerStats(player)).map(([category, stats]) => (
                            <div key={category} className="glass-card p-6 space-y-6">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase italic text-teal-500 tracking-widest">{category}</span>
                                    <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em]">{stats.matches} MATCHES_PLAYED</span>
                                </div>
                                <div className="grid grid-cols-4 gap-y-6 gap-x-4">
                                    {[
                                        { label: 'RUNS', val: stats.runs },
                                        { label: 'AVG', val: stats.average.toFixed(1) },
                                        { label: 'SR', val: stats.strikeRate.toFixed(1) },
                                        { label: 'HS', val: stats.highestScore },
                                        { label: '100s/50s', val: `${stats.hundreds}/${stats.fifties}` },
                                        { label: 'WKTS', val: stats.wickets },
                                        { label: 'ECO', val: stats.economy.toFixed(2) },
                                        { label: 'BEST', val: stats.bestBowling }
                                    ].map((s) => (
                                        <div key={s.label}>
                                            <div className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">{s.label}</div>
                                            <div className="text-xs font-black text-white">{s.val}</div>
                                        </div>
                                    ))}
                                    <div className="col-span-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">FASTEST_50</div>
                                        <div className="text-xs font-black text-teal-500">{stats.fastestFifty ? `${stats.fastestFifty} BALLS` : 'N/A'}</div>
                                    </div>
                                    <div className="col-span-2 p-3 bg-white/5 rounded-xl border border-white/5">
                                        <div className="text-[7px] font-black text-white/20 uppercase tracking-widest mb-1">FASTEST_100</div>
                                        <div className="text-xs font-black text-teal-500">{stats.fastestHundred ? `${stats.fastestHundred} BALLS` : 'N/A'}</div>
                                    </div>

                                    {/* Phase Stats Section - Hidden for Shield/Test */}
                                    {category !== 'FIRST CLASS' && (
                                        <div className="col-span-4 mt-4 space-y-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-px flex-grow bg-white/5" />
                                                <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">PHASE_INTELLIGENCE</div>
                                                <div className="h-px flex-grow bg-white/5" />
                                            </div>
                                            
                                            <div className="grid grid-cols-3 gap-3">
                                                {/* Powerplay */}
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                                    <div className="text-[6px] font-black text-teal-500 uppercase tracking-widest">POWERPLAY</div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[6px] text-white/40 font-bold">BAT</span>
                                                            <span className="text-[8px] text-white font-black">{stats.ppRuns}({stats.ppBalls})</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[6px] text-white/40 font-bold">BOWL</span>
                                                            <span className="text-[8px] text-white font-black">{stats.ppWickets}W @ {(stats.ppBallsBowled > 0 ? (stats.ppRunsConceded / stats.ppBallsBowled) * 6 : 0).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                
                                                {/* Middle */}
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                                    <div className="text-[6px] font-black text-blue-500 uppercase tracking-widest">MIDDLE</div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[6px] text-white/40 font-bold">BAT</span>
                                                            <span className="text-[8px] text-white font-black">{stats.midRuns}({stats.midBalls})</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[6px] text-white/40 font-bold">BOWL</span>
                                                            <span className="text-[8px] text-white font-black">{stats.midWickets}W @ {(stats.midBallsBowled > 0 ? (stats.midRunsConceded / stats.midBallsBowled) * 6 : 0).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Death */}
                                                <div className="p-3 bg-white/5 rounded-xl border border-white/5 space-y-2">
                                                    <div className="text-[6px] font-black text-red-500 uppercase tracking-widest">DEATH</div>
                                                    <div className="space-y-1">
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[6px] text-white/40 font-bold">BAT</span>
                                                            <span className="text-[8px] text-white font-black">{stats.deathRuns}({stats.deathBalls})</span>
                                                        </div>
                                                        <div className="flex justify-between items-center">
                                                            <span className="text-[6px] text-white/40 font-bold">BOWL</span>
                                                            <span className="text-[8px] text-white font-black">{stats.deathWickets}W @ {(stats.deathBallsBowled > 0 ? (stats.deathRunsConceded / stats.deathBallsBowled) * 6 : 0).toFixed(1)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Runs by Position Section */}
                                    {stats.runsByPosition && Object.keys(stats.runsByPosition).length > 0 && (
                                        <div className="col-span-4 mt-4 space-y-4">
                                           <div className="flex items-center gap-2">
                                               <div className="h-px flex-grow bg-white/5" />
                                               <div className="text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">RUNS_BY_POSITION</div>
                                               <div className="h-px flex-grow bg-white/5" />
                                           </div>
                                           <div className="grid grid-cols-6 gap-2">
                                               {[1,2,3,4,5,6,7,8,9,10,11].map(pos => (
                                                   <div key={pos} className="flex flex-col items-center bg-white/5 rounded-lg p-2 border border-white/5">
                                                       <span className="text-[6px] font-black text-white/20">#{pos}</span>
                                                       <span className="text-[10px] font-black text-teal-500">{stats.runsByPosition?.[pos] || 0}</span>
                                                   </div>
                                               ))}
                                           </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerProfile;
