
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameData, Standing, Format, Match, MatchResult } from '../types';
import { Trophy, Calendar, ChevronRight } from 'lucide-react';

interface StandingsProps {
    gameData: GameData;
    onViewScorecard: (result: MatchResult) => void;
    onViewTeamSquad: (teamId: string) => void;
}

const Standings: React.FC<StandingsProps> = ({ gameData, onViewScorecard, onViewTeamSquad }) => {
    const [activeTab, setActiveTab] = useState<'table' | 'fixtures'>('table');
    const currentFormat = gameData.currentFormat;
    const standings = gameData.standings[currentFormat] || [];
    const schedule = gameData.schedule[currentFormat] || [];

    // Sort standings: Points -> NRR -> Wins
    const sortedStandings = [...standings].sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
        return b.won - a.won;
    });
    const groupAStandings = sortedStandings.filter(s => {
        const team = gameData.teams.find(t => t.id === s.teamId);
        return team?.group === 'A';
    });
    const groupBStandings = sortedStandings.filter(s => {
        const team = gameData.teams.find(t => t.id === s.teamId);
        return team?.group === 'B';
    });
    const superSixStandings = sortedStandings.filter(s => {
        const team = gameData.teams.find(t => t.id === s.teamId);
        return team?.group === 'Super Six';
    });
    const roundRobinStandings = sortedStandings.filter(s => {
        const team = gameData.teams.find(t => t.id === s.teamId);
        return !team?.group || team.group === 'Round-Robin';
    });

    const renderTable = (groupStandings: Standing[], title: string) => (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm mb-6">
            <div className="bg-slate-100 dark:bg-slate-800/50 p-4 border-b border-slate-200 dark:border-slate-800">
                <h3 className="text-xs font-black uppercase tracking-widest text-teal-500">{title}</h3>
            </div>
            <div className="grid grid-cols-12 gap-2 p-4 bg-slate-100/50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                <div className="col-span-1">#</div>
                <div className="col-span-4">Team</div>
                <div className="col-span-1 text-center">RTG</div>
                <div className="col-span-1 text-center">P</div>
                <div className="col-span-1 text-center">W</div>
                <div className="col-span-1 text-center">L</div>
                <div className="col-span-1 text-center">D</div>
                <div className="col-span-1 text-center">NRR</div>
                <div className="col-span-1 text-center text-teal-500">PTS</div>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {groupStandings.map((standing, index) => {
                    const isUserTeam = standing.teamId === gameData.userTeamId;
                    return (
                        <motion.div
                            key={standing.teamId}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => onViewTeamSquad(standing.teamId)}
                            className={`grid grid-cols-12 gap-2 p-4 items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-white/5 transition-colors ${isUserTeam ? 'bg-teal-500/5' : ''}`}
                        >
                            <div className={`col-span-1 text-xs font-black ${index < 2 ? 'text-teal-500' : 'text-slate-400'}`}>
                                {index + 1}
                            </div>
                            <div className="col-span-4 flex items-center gap-2">
                                {standing.logo && (
                                    <div className="w-5 h-5 flex-shrink-0 opacity-80" dangerouslySetInnerHTML={{ __html: standing.logo }} />
                                )}
                                <div className={`text-xs font-black uppercase italic truncate ${isUserTeam ? 'text-teal-500' : 'text-slate-900 dark:text-white'}`}>
                                    {standing.teamName}
                                </div>
                            </div>
                            <div className="col-span-1 text-center">
                                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md ${
                                    (standing.rating || 0) >= 120 ? 'bg-teal-500/20 text-teal-600 dark:text-teal-400' :
                                    (standing.rating || 0) >= 100 ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400' :
                                    'text-slate-400'
                                }`}>
                                    {standing.rating || '-'}
                                </span>
                            </div>
                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{standing.played}</div>
                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{standing.won}</div>
                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{standing.lost}</div>
                            <div className="col-span-1 text-center text-[10px] font-bold text-slate-500">{standing.drawn}</div>
                            <div className={`col-span-1 text-center text-[9px] font-bold ${standing.netRunRate >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {standing.netRunRate > 0 ? '+' : ''}{standing.netRunRate.toFixed(3)}
                            </div>
                            <div className="col-span-1 text-center text-xs font-black text-teal-500">{standing.points}</div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6 pb-2">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    League <span className="text-teal-500">Center</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Format: {currentFormat}
                </span>
            </div>

            {/* Segmented Control */}
            <div className="px-6 py-4">
                <div className="flex p-1 bg-slate-200 dark:bg-slate-900 rounded-xl border border-slate-300 dark:border-slate-800">
                    <button 
                        onClick={() => setActiveTab('table')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'table' ? 'bg-white dark:bg-slate-800 text-teal-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Trophy className="w-3 h-3" />
                        Table
                    </button>
                    <button 
                        onClick={() => setActiveTab('fixtures')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'fixtures' ? 'bg-white dark:bg-slate-800 text-teal-500 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        <Calendar className="w-3 h-3" />
                        Fixtures
                    </button>
                </div>
            </div>

            <div className="flex-grow overflow-y-auto px-4 pb-6 custom-scrollbar">
                <AnimatePresence mode="wait">
                    {activeTab === 'table' ? (
                        <motion.div 
                            key="table"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                        >
                            {superSixStandings.length > 0 && renderTable(superSixStandings, 'Super Six League')}
                            {groupAStandings.length > 0 && superSixStandings.length === 0 && renderTable(groupAStandings, 'Group A')}
                            {groupBStandings.length > 0 && superSixStandings.length === 0 && renderTable(groupBStandings, 'Group B')}
                            {roundRobinStandings.length > 0 && groupAStandings.length === 0 && superSixStandings.length === 0 && renderTable(roundRobinStandings, 'Global Standings')}
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="fixtures"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            className="space-y-3"
                        >
                            {schedule.map((match, index) => {
                                const currentMatchIndex = gameData.currentMatchIndex[currentFormat];
                                const isPlayed = index < currentMatchIndex;
                                const isCurrent = index === currentMatchIndex;
                                const isUserTeamMatch = match.teamA === gameData.teams.find(t => t.id === gameData.userTeamId)?.name || 
                                                       match.teamB === gameData.teams.find(t => t.id === gameData.userTeamId)?.name;

                                return (
                                    <div 
                                        key={index}
                                        className={`p-4 rounded-2xl border transition-all ${isCurrent ? 'bg-teal-500/10 border-teal-500/30' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'}`}
                                    >
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Match {match.matchNumber} • {match.group}</span>
                                            {isPlayed ? (
                                                <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">Completed</span>
                                            ) : isCurrent ? (
                                                <span className="text-[8px] font-black text-teal-500 uppercase tracking-widest animate-pulse">Next Match</span>
                                            ) : (
                                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Upcoming</span>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex-1 text-right">
                                                <div className={`text-xs font-black uppercase italic truncate ${match.teamA === gameData.teams.find(t => t.id === gameData.userTeamId)?.name ? 'text-teal-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {match.teamA}
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <div className="text-[10px] font-black text-slate-300 italic">VS</div>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <div className={`text-xs font-black uppercase italic truncate ${match.teamB === gameData.teams.find(t => t.id === gameData.userTeamId)?.name ? 'text-teal-500' : 'text-slate-900 dark:text-white'}`}>
                                                    {match.teamB}
                                                </div>
                                            </div>
                                        </div>

                                        {isPlayed && (
                                            <button
                                                onClick={() => {
                                                    const result = gameData.matchResults[currentFormat]?.find(r => r.matchNumber === String(match.matchNumber));
                                                    if (result) onViewScorecard(result);
                                                }}
                                                className="mt-3 w-full py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-teal-500 hover:border-teal-500/50 transition-all flex items-center justify-center gap-1.5"
                                            >
                                                View Scorecard
                                                <ChevronRight className="w-2.5 h-2.5" />
                                            </button>
                                        )}
                                    </div>
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {activeTab === 'table' && (
                    <div className="mt-4 p-4 bg-teal-500/10 rounded-2xl border border-teal-500/20">
                        <p className="text-[9px] font-bold text-teal-500/80 uppercase tracking-widest leading-relaxed">
                            Top 4 teams qualify for the knockout stage. In case of equal points, Net Run Rate (NRR) will be the tie-breaker.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Standings;
