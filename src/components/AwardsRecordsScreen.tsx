
import React from 'react';
import { motion } from 'framer-motion';
import { GameData } from '../types';
import { Icons } from './Icons';

interface AwardsRecordsScreenProps {
    gameData: GameData;
}

const AwardsRecordsScreen: React.FC<AwardsRecordsScreenProps> = ({ gameData }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Awards & <span className="text-teal-500">Records</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    League achievements and milestones
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-6">
                <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center">
                    <Icons.Trophy className="w-16 h-16 text-teal-500 mx-auto mb-4" />
                    <h3 className="text-xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-2">Hall of Fame</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold">Season {gameData.currentSeason} Records</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Highest Total</div>
                        <div className="text-lg font-black italic text-slate-900 dark:text-white">245/3</div>
                        <div className="text-[10px] font-bold text-teal-500 uppercase">Mumbai Indians</div>
                    </div>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Best Bowling</div>
                        <div className="text-lg font-black italic text-slate-900 dark:text-white">5/12</div>
                        <div className="text-[10px] font-bold text-teal-500 uppercase">Jasprit Bumrah</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AwardsRecordsScreen;
