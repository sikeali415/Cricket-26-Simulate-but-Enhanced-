
import React from 'react';
import { motion } from 'framer-motion';
import { GameData } from '../types';
import { Icons } from './Icons';

interface SponsorRoomProps {
    gameData: GameData;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
}

const SponsorRoom: React.FC<SponsorRoomProps> = ({ gameData, setGameData }) => {
    const sponsorships = Object.entries(gameData.sponsorships);

    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Sponsor <span className="text-teal-500">Room</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Active league partnerships
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-4">
                {sponsorships.map(([format, sponsor], index) => (
                    <motion.div
                        key={format}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Icons.ShieldCheck className="w-24 h-24" />
                        </div>
                        
                        <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-6">{format}</div>
                        
                        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center" style={{ backgroundColor: `${sponsor.logoColor}20` }}>
                            <Icons.Zap className="w-10 h-10" style={{ color: sponsor.logoColor }} />
                        </div>
                        
                        <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                            {sponsor.sponsorName}
                        </h3>
                        <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-widest font-bold mb-6">Official Title Sponsor</p>
                        
                        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
                            <div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Broadcaster</div>
                                <div className="text-xs font-black text-slate-900 dark:text-white">{sponsor.tvChannel || 'Sports HD'}</div>
                            </div>
                            <div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tournament</div>
                                <div className="text-xs font-black text-slate-900 dark:text-white">{sponsor.tournamentName}</div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default SponsorRoom;
