
import React from 'react';
import { motion } from 'framer-motion';
import { GameData, Match, Format, Team, MatchResult } from '../types';
import { Icons } from './Icons';

interface ScheduleProps {
    gameData: GameData;
    userTeam: Team;
    viewMatchResult: (result: MatchResult) => void;
}

const Schedule: React.FC<ScheduleProps> = ({ gameData, userTeam, viewMatchResult }) => {
    const currentFormat = gameData.currentFormat;
    const schedule = gameData.schedule[currentFormat] || [];
    const currentIndex = gameData.currentMatchIndex[currentFormat] || 0;
    const results = gameData.matchResults[currentFormat] || [];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Season <span className="text-teal-500">Schedule</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Format: {currentFormat} | {schedule.length} Matches
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-4">
                {schedule.map((match, index) => {
                    const isCompleted = index < currentIndex;
                    const isCurrent = index === currentIndex;
                    const isUserMatch = match.teamAId === userTeam.id || match.teamBId === userTeam.id;
                    const result = isCompleted ? results.find(r => r.matchNumber === match.matchNumber) : null;

                    return (
                        <motion.div
                            key={match.matchNumber}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            onClick={() => result && viewMatchResult(result)}
                            className={`relative p-4 rounded-3xl border-2 transition-all ${
                                isCurrent 
                                    ? 'bg-teal-500/10 border-teal-500 shadow-lg shadow-teal-500/10' 
                                    : isCompleted
                                        ? 'bg-slate-100 dark:bg-slate-900/50 border-transparent opacity-60 cursor-pointer hover:opacity-100'
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            } ${isUserMatch ? 'ring-2 ring-pink-500/20' : ''}`}
                        >
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                    Match {match.matchNumber} • {match.group}
                                </span>
                                {isCompleted && (
                                    <span className="flex items-center gap-1 text-[8px] font-black text-teal-500 uppercase tracking-widest">
                                        <Icons.Check className="w-3 h-3" /> COMPLETED
                                    </span>
                                )}
                                {isCurrent && (
                                    <span className="flex items-center gap-1 text-[8px] font-black text-pink-500 uppercase tracking-widest animate-pulse">
                                        <div className="w-1.5 h-1.5 rounded-full bg-pink-500" /> UP NEXT
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center justify-between gap-4">
                                <div className="flex-1 text-center">
                                    <div className="text-xs font-black uppercase italic text-slate-900 dark:text-white truncate">
                                        {match.teamA}
                                    </div>
                                </div>
                                <div className="text-[10px] font-black italic text-teal-500">VS</div>
                                <div className="flex-1 text-center">
                                    <div className="text-xs font-black uppercase italic text-slate-900 dark:text-white truncate">
                                        {match.teamB}
                                    </div>
                                </div>
                            </div>

                            {result && (
                                <div className="mt-2 text-center">
                                    <div className="text-[9px] font-bold text-teal-500 uppercase tracking-widest">{result.summary}</div>
                                    <div className="flex justify-center gap-3 mt-2">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); viewMatchResult(result); }}
                                            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-500 text-[8px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border border-teal-500/20 transition-all flex items-center gap-1.5"
                                        >
                                            <Icons.Bot className="w-3 h-3" /> VIEW_SCORECARD
                                        </button>
                                    </div>
                                </div>
                            )}

                            <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center">
                                <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">
                                    {match.date}
                                </span>
                                {isUserMatch && (
                                    <span className="text-[8px] font-black text-pink-500 uppercase tracking-widest">
                                        Your Match
                                    </span>
                                )}
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
};

export default Schedule;
