
import React from 'react';
import { motion } from 'framer-motion';
import { MatchResult } from '../types';

interface ForwardResultsScreenProps {
    results: MatchResult[];
    onBack: () => void;
    userTeamId: string;
    onViewResult: (result: MatchResult) => void;
}

const ForwardResultsScreen: React.FC<ForwardResultsScreenProps> = ({ results, onBack, userTeamId, onViewResult }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Simulated <span className="text-teal-500">Results</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Other matches in the league
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-4">
                {results.map((result, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onViewResult(result)}
                        className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-teal-500 transition-colors"
                    >
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Match {result.matchNumber}</span>
                            <span className="text-[8px] font-black text-teal-500 uppercase tracking-widest">Final</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <div className="flex-1">
                                <div className="text-xs font-black uppercase italic text-slate-900 dark:text-white truncate">{result.firstInning.teamName}</div>
                                <div className="text-[10px] font-bold text-slate-500">{result.firstInning.score}/{result.firstInning.wickets}</div>
                            </div>
                            <div className="px-4 text-[10px] font-black italic text-teal-500">VS</div>
                            <div className="flex-1 text-right">
                                <div className="text-xs font-black uppercase italic text-slate-900 dark:text-white truncate">{result.secondInning.teamName}</div>
                                <div className="text-[10px] font-bold text-slate-500">{result.secondInning.score}/{result.secondInning.wickets}</div>
                            </div>
                        </div>
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-center">
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{result.summary}</span>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-6">
                <button
                    onClick={onBack}
                    className="w-full py-4 bg-teal-500 text-black font-black uppercase italic tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                    Back to Hub
                </button>
            </div>
        </div>
    );
};

export default ForwardResultsScreen;
