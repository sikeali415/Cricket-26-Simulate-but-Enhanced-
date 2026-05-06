
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlayerAvatar } from './PlayerAvatar';
import { GameData, Player } from '../types';
import { getRoleColor, getRoleFullName } from '../utils';
import { Icons } from './Icons';

interface PlayerDatabaseProps {
    gameData: GameData;
    onAddPlayer: () => void;
    onViewPlayer: (p: Player) => void;
}

const PlayerDatabase: React.FC<PlayerDatabaseProps> = ({ gameData, onAddPlayer, onViewPlayer }) => {
    const [search, setSearch] = useState('');
    
    const filteredPlayers = gameData.allPlayers.filter(p => 
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.nationality.toLowerCase().includes(search.toLowerCase())
    ).slice(0, 50);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
                        Player <span className="text-teal-500">Database</span>
                    </h2>
                    <button onClick={onAddPlayer} className="p-2 bg-teal-500 text-black rounded-xl shadow-lg">
                        <Icons.Plus className="w-6 h-6" />
                    </button>
                </div>
                
                <div className="relative">
                    <Icons.Bot className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input 
                        type="text"
                        placeholder="Search players by name or nationality..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all"
                    />
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-3">
                {filteredPlayers.map((player, index) => (
                    <motion.div
                        key={player.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => onViewPlayer(player)}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-teal-500 transition-colors"
                    >
                        <div className="w-14 h-14 bg-white/5 rounded-2xl border border-white/10 flex items-center justify-center p-1 flex-shrink-0">
                            <PlayerAvatar player={player} size="lg" />
                        </div>
                        <div className="flex-grow">
                            <div className="text-sm font-black uppercase italic text-slate-900 dark:text-white truncate">{player.name}</div>
                            <div className="flex items-center gap-2">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{player.nationality}</span>
                                <span className={`text-[8px] font-black uppercase tracking-widest ${getRoleColor(player.role)}`}>
                                    {getRoleFullName(player.role)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5 opacity-60">
                                <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">R: {player.stats[gameData.currentFormat]?.runs || 0}</span>
                                <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">W: {player.stats[gameData.currentFormat]?.wickets || 0}</span>
                                <span className="text-[7px] font-bold uppercase tracking-widest text-slate-500">M: {player.stats[gameData.currentFormat]?.matches || 0}</span>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="text-xs font-black text-teal-500">{player.battingSkill}</div>
                            <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Skill</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default PlayerDatabase;
