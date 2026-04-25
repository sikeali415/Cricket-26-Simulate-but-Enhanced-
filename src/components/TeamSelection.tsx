
import React from 'react';
import { motion } from 'framer-motion';
import { TeamData } from '../types';
import { TEAMS } from '../data';
import { Icons } from './Icons';

interface TeamSelectionProps {
    onTeamSelected: (teamId: string) => void;
    theme: 'light' | 'dark';
}

const TeamSelection: React.FC<TeamSelectionProps> = ({ onTeamSelected, theme }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6 text-center">
                <h2 className="text-3xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-2">
                    Select Your <span className="text-teal-500">Franchise</span>
                </h2>
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Choose a team to lead to glory in Season 26
                </p>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0">
                <div className="grid grid-cols-1 gap-4">
                    {TEAMS.map((team) => (
                        <motion.button
                            key={team.id}
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => onTeamSelected(team.id)}
                            className="group relative flex items-center gap-6 p-6 bg-white dark:bg-slate-900 rounded-3xl border-2 border-slate-200 dark:border-slate-800 hover:border-teal-500 dark:hover:border-teal-500 transition-all shadow-xl text-left overflow-hidden"
                        >
                            <div className="w-20 h-20 flex-shrink-0 bg-slate-100 dark:bg-slate-800 rounded-2xl p-2 group-hover:bg-teal-500/10 transition-colors">
                                <div dangerouslySetInnerHTML={{ __html: team.logo }} className="w-full h-full" />
                            </div>
                            
                            <div className="flex-grow">
                                <h3 className="text-2xl font-black italic uppercase tracking-tight text-slate-900 dark:text-white group-hover:text-teal-500 transition-colors">
                                    {team.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <Icons.Home className="w-3 h-3 text-slate-400" />
                                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                                        {team.homeGround}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                                <Icons.Trophy className="w-24 h-24" />
                            </div>

                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-teal-500 group-hover:text-black transition-all">
                                <Icons.ChevronRight className="w-6 h-6" />
                            </div>
                        </motion.button>
                    ))}
                </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <div className="flex items-center justify-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
                    Secure Selection Protocol
                    <div className="h-px w-8 bg-slate-200 dark:bg-slate-800" />
                </div>
            </div>
        </div>
    );
};

export default TeamSelection;
