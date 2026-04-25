
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GameData, Player, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregatePlayerStats, FormatCategory, getFormatCategory } from '../utils';

interface StatsProps {
    gameData: GameData;
    viewPlayerProfile: (p: Player, f: Format) => void;
}

const Stats: React.FC<StatsProps> = ({ gameData, viewPlayerProfile }) => {
    const [statType, setStatType] = useState<'batting' | 'bowling' | 'team'>('batting');
    const [sortField, setSortField] = useState<string>('runs');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [selectedCategory, setSelectedCategory] = useState<FormatCategory>(getFormatCategory(gameData.currentFormat));
    
    const playersWithStats = gameData.allPlayers.map(p => {
        const aggregated = aggregatePlayerStats(p);
        return {
            ...p,
            displayStats: aggregated[selectedCategory]
        };
    }).filter(p => p.displayStats && p.displayStats.matches > 0);

    const handleSort = (field: string) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const sortedPlayers = [...playersWithStats].sort((a, b) => {
        const statsA = a.displayStats as any;
        const statsB = b.displayStats as any;
        const valA = statsA[sortField] || 0;
        const valB = statsB[sortField] || 0;
        
        return sortOrder === 'desc' ? valB - valA : valA - valB;
    }).slice(0, 50);

    const renderSortIcon = (field: string) => {
        if (sortField !== field) return null;
        return sortOrder === 'desc' ? '▼' : '▲';
    };

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-4">
                    League <span className="text-teal-500">Statistics</span>
                </h2>
                
                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mb-4">
                    {Object.values(FormatCategory).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`flex-1 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-widest transition-all ${
                                selectedCategory === cat ? 'bg-white dark:bg-slate-800 text-teal-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>

                <div className="flex p-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <button
                        onClick={() => { setStatType('batting'); setSortField('runs'); }}
                        className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            statType === 'batting' ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-500'
                        }`}
                    >
                        Batting
                    </button>
                    <button
                        onClick={() => { setStatType('bowling'); setSortField('wickets'); }}
                        className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            statType === 'bowling' ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-500'
                        }`}
                    >
                        Bowling
                    </button>
                    <button
                        onClick={() => { setStatType('team'); setSortField('rating'); }}
                        className={`flex-1 py-2 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                            statType === 'team' ? 'bg-teal-500 text-black shadow-lg' : 'text-slate-500'
                        }`}
                    >
                        Team
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-4 pb-6">
                <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
                    {statType === 'batting' ? (
                        <div className="grid grid-cols-12 gap-2 p-4 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-1">#</div>
                            <div className="col-span-4">Player</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('matches')}>Mat {renderSortIcon('matches')}</div>
                            <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('runs')}>Runs {renderSortIcon('runs')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('average')}>Avg {renderSortIcon('average')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('strikeRate')}>SR {renderSortIcon('strikeRate')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('hundreds')}>100 {renderSortIcon('hundreds')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('fifties')}>50 {renderSortIcon('fifties')}</div>
                        </div>
                    ) : statType === 'bowling' ? (
                        <div className="grid grid-cols-12 gap-2 p-4 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-1">#</div>
                            <div className="col-span-4">Player</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('matches')}>Mat {renderSortIcon('matches')}</div>
                            <div className="col-span-2 text-center cursor-pointer" onClick={() => handleSort('wickets')}>Wkts {renderSortIcon('wickets')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('economy')}>Eco {renderSortIcon('economy')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('bowlingAverage')}>Avg {renderSortIcon('bowlingAverage')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('fiveWicketHauls')}>5W {renderSortIcon('fiveWicketHauls')}</div>
                            <div className="col-span-1 text-center cursor-pointer" onClick={() => handleSort('bestBowlingWickets')}>BB {renderSortIcon('bestBowlingWickets')}</div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-12 gap-2 p-4 bg-slate-100 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            <div className="col-span-1">#</div>
                            <div className="col-span-1">Logo</div>
                            <div className="col-span-4">Team</div>
                            <div className="col-span-2 text-center">T20</div>
                            <div className="col-span-2 text-center">One-Day</div>
                            <div className="col-span-2 text-center">FC</div>
                        </div>
                    )}

                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {statType === 'team' ? (
                            [...gameData.teams].sort((a, b) => {
                                const rA = (a.ratings?.t20 || 0) + (a.ratings?.odi || 0) + (a.ratings?.fc || 0);
                                const rB = (b.ratings?.t20 || 0) + (b.ratings?.odi || 0) + (b.ratings?.fc || 0);
                                return rB - rA;
                            }).map((team, index) => {
                                const teamData = gameData.allTeamsData.find(t => t.id === team.id);
                                return (
                                    <div key={team.id} className="grid grid-cols-12 gap-2 p-4 items-center">
                                        <div className="col-span-1 text-[10px] font-black text-slate-400">{index + 1}</div>
                                        <div className="col-span-1 w-6 h-6 flex items-center justify-center grayscale opacity-40" dangerouslySetInnerHTML={{ __html: teamData?.logo || '' }} />
                                        <div className="col-span-4 text-xs font-black uppercase italic text-slate-900 dark:text-white truncate">{team.name}</div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-[10px] font-black text-teal-500">{team.ratings?.t20 || 0}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-[10px] font-black text-blue-500">{team.ratings?.odi || 0}</span>
                                        </div>
                                        <div className="col-span-2 text-center">
                                            <span className="text-[10px] font-black text-amber-500">{team.ratings?.fc || 0}</span>
                                        </div>
                                    </div>
                                );
                            })
                        ) : sortedPlayers.map((player, index) => {
                            const stats = player.displayStats;
                            if (!stats) return null;
                            return (
                                <motion.div
                                    key={player.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.02 }}
                                    onClick={() => viewPlayerProfile(player, gameData.currentFormat)}
                                    className="grid grid-cols-12 gap-2 p-4 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                                >
                                    <div className="col-span-1 text-[10px] font-black text-slate-400">{index + 1}</div>
                                    <div className="col-span-4">
                                        <div className="text-[10px] font-black uppercase italic text-slate-900 dark:text-white truncate">
                                            {player.name}
                                        </div>
                                    </div>
                                    <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.matches}</div>
                                    
                                    {statType === 'batting' ? (
                                        <>
                                            <div className="col-span-2 text-center text-[10px] font-black text-teal-500">{stats.runs}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.average.toFixed(1)}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.strikeRate.toFixed(1)}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.hundreds}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.fifties}</div>
                                        </>
                                    ) : (
                                        <>
                                            <div className="col-span-2 text-center text-[10px] font-black text-pink-500">{stats.wickets}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.economy.toFixed(2)}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.bowlingAverage.toFixed(1)}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.fiveWicketHauls}</div>
                                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{stats.bestBowling}</div>
                                        </>
                                    )}
                                </motion.div>
                            );
                        })}
                        {sortedPlayers.length === 0 && (
                            <div className="py-20 text-center">
                                <p className="text-slate-400 text-xs font-bold uppercase italic">No stats recorded yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Stats;
