
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameData, Player } from '../types';
import { getRoleColor, getRoleFullName } from '../utils';
import { Icons } from './Icons';

interface ComparisonScreenProps {
    gameData: GameData;
}

const ComparisonScreen: React.FC<ComparisonScreenProps> = ({ gameData }) => {
    const [playerA, setPlayerA] = useState<Player | null>(null);
    const [playerB, setPlayerB] = useState<Player | null>(null);
    const [selectingFor, setSelectingFor] = useState<'A' | 'B' | null>(null);

    const stats = ['battingSkill', 'secondarySkill'] as const;

    if (selectingFor) {
        return (
            <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
                <div className="p-6 flex justify-between items-center">
                    <h2 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white">
                        Select <span className="text-teal-500">Player {selectingFor}</span>
                    </h2>
                    <button onClick={() => setSelectingFor(null)} className="p-2 bg-white dark:bg-slate-900 rounded-xl shadow-sm">
                        <Icons.X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>
                <div className="flex-grow overflow-y-auto px-6 pb-6 space-y-3">
                    {gameData.allPlayers.slice(0, 50).map(player => (
                        <div 
                            key={player.id}
                            onClick={() => {
                                if (selectingFor === 'A') setPlayerA(player);
                                else setPlayerB(player);
                                setSelectingFor(null);
                            }}
                            className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 flex items-center gap-4 cursor-pointer hover:border-teal-500 transition-colors"
                        >
                            <div className="text-sm font-black uppercase italic text-slate-900 dark:text-white">{player.name}</div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Player <span className="text-teal-500">Comparison</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Compare skills and attributes
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-8">
                <div className="grid grid-cols-2 gap-4">
                    {[
                        { p: playerA, label: 'A' },
                        { p: playerB, label: 'B' }
                    ].map(({ p, label }) => (
                        <div 
                            key={label}
                            onClick={() => setSelectingFor(label as 'A' | 'B')}
                            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center cursor-pointer hover:border-teal-500 transition-colors"
                        >
                            {p ? (
                                <>
                                    <div className="w-16 h-16 bg-teal-500/10 rounded-2xl p-1 mb-3 border-2 border-teal-500/20">
                                        <img 
                                            src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${p.avatarSeed || p.name}`} 
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                    <div className="text-xs font-black uppercase italic text-slate-900 dark:text-white truncate w-full">{p.name}</div>
                                </>
                            ) : (
                                <>
                                    <Icons.PlusCircle className="w-8 h-8 text-slate-300 mb-2" />
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Player {label}</div>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {playerA && playerB && (
                    <div className="space-y-6">
                        {stats.map(stat => {
                            const valA = playerA[stat];
                            const valB = playerB[stat];
                            
                            return (
                                <div key={stat} className="space-y-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">
                                        {stat === 'battingSkill' ? 'Batting' : 'Bowling'}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 text-right text-lg font-black italic text-slate-900 dark:text-white">{valA}</div>
                                        <div className="flex-[3] flex items-center gap-1">
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex justify-end">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(valA / 100) * 100}%` }}
                                                    className={`h-full ${valA >= valB ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                />
                                            </div>
                                            <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div 
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(valB / 100) * 100}%` }}
                                                    className={`h-full ${valB >= valA ? 'bg-teal-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 text-left text-lg font-black italic text-slate-900 dark:text-white">{valB}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ComparisonScreen;
