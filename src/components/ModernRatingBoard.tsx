
import React from 'react';
import { motion } from 'framer-motion';
import { Player, Format } from '../types';

interface ModernRatingBoardProps {
    players: Player[];
    currentFormat: Format;
}

const ModernRatingBoard: React.FC<ModernRatingBoardProps> = ({ players, currentFormat }) => {
    // Just show the first player for now as a board
    const player = players[0];
    if (!player) return null;

    const ratings = [
        { label: 'Power', value: player.battingSkill },
        { label: 'Timing', value: player.battingSkill - 5 },
        { label: 'Control', value: player.secondarySkill },
        { label: 'Stamina', value: 85 },
    ];

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden p-6">
            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-6">
                Rating <span className="text-teal-500">Board</span>
            </h2>
            
            <div className="grid grid-cols-2 gap-4">
                {ratings.map((rating, index) => (
                    <motion.div
                        key={rating.label}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm"
                    >
                        <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{rating.label}</div>
                        <div className="flex items-end gap-2">
                            <div className="text-xl font-black italic text-teal-500">{rating.value}</div>
                            <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mb-1.5">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${rating.value}%` }}
                                    className="h-full bg-teal-500"
                                />
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default ModernRatingBoard;
