
import React from 'react';
import { motion } from 'framer-motion';
import { GameData, Player } from '../types';

interface SeasonSummaryProps {
    gameData: GameData;
    onContinue: (updatedPlayers: Player[]) => void;
}

const SeasonSummary: React.FC<SeasonSummaryProps> = ({ gameData, onContinue }) => {
    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                >
                    <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-4">Season Completed</div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
                        Season <span className="text-teal-500">{gameData.currentSeason}</span> Summary
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase italic">Reviewing Performance & Progressing</p>
                </motion.div>

                <div className="w-full max-w-xs space-y-4 mb-12">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Season Highlights</div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase italic">Total Runs</span>
                            <span className="text-xl font-black italic">4,250</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase italic">Total Wickets</span>
                            <span className="text-xl font-black italic text-teal-500">180</span>
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => onContinue(gameData.allPlayers)}
                    className="w-full max-w-xs py-4 bg-teal-500 text-black font-black uppercase italic tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
                >
                    Proceed to Next Season
                </button>
            </div>
        </div>
    );
};

export default SeasonSummary;
