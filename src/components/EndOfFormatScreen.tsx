
import React from 'react';
import { motion } from 'framer-motion';
import { GameData, Format, Player } from '../types';

interface EndOfFormatScreenProps {
    gameData: GameData;
    handleFormatChange: (newFormat: Format) => void;
    handleEndSeason: (retainedPlayers: Player[]) => void;
}

const EndOfFormatScreen: React.FC<EndOfFormatScreenProps> = ({ gameData, handleFormatChange, handleEndSeason }) => {
    const format = gameData.currentFormat;
    
    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-8"
                >
                    <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-4">Format Completed</div>
                    <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-2">
                        {format} <span className="text-teal-500">Season Over</span>
                    </h2>
                    <p className="text-slate-400 text-sm font-bold uppercase italic">Final Standings & Awards Finalized</p>
                </motion.div>

                <div className="w-full max-w-xs space-y-4 mb-12">
                    <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Your Performance</div>
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-xs font-black uppercase italic">Matches</span>
                            <span className="text-xl font-black italic">14</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-black uppercase italic">Wins</span>
                            <span className="text-xl font-black italic text-teal-500">8</span>
                        </div>
                    </div>
                </div>

                <div className="w-full max-w-xs space-y-3">
                    <button
                        onClick={() => handleFormatChange(Format.T20_SMASH)}
                        className="w-full py-4 bg-teal-500 text-black font-black uppercase italic tracking-widest rounded-2xl shadow-lg active:scale-95 transition-all"
                    >
                        Next Format
                    </button>
                    <button
                        onClick={() => handleEndSeason([])}
                        className="w-full py-4 bg-white/5 text-white font-black uppercase italic tracking-widest rounded-2xl border border-white/10 active:scale-95 transition-all"
                    >
                        End Season
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EndOfFormatScreen;
