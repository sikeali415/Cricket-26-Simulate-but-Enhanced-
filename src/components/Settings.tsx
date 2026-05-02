
import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './Icons';

interface SettingsProps {
    onResetGame: () => void;
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    saveGame: () => void;
    loadGame: () => void;
}

const Settings: React.FC<SettingsProps> = ({ onResetGame, theme, setTheme, saveGame, loadGame }) => {
    return (
        <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden">
            <div className="p-6">
                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white mb-1">
                    Game <span className="text-teal-500">Settings</span>
                </h2>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                    Manage your preferences and progress
                </span>
            </div>

            <div className="flex-grow overflow-y-auto p-6 pt-0 space-y-6">
                {/* Visuals */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase italic text-slate-400 tracking-widest">Visual Preferences</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <button 
                            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                            className="w-full flex items-center justify-between p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-teal-500/10 rounded-xl">
                                    <Icons.Bot className="w-5 h-5 text-teal-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase italic text-slate-900 dark:text-white">Display Theme</div>
                                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Current: {theme}</div>
                                </div>
                            </div>
                            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${theme === 'dark' ? 'bg-teal-500' : 'bg-slate-200 dark:bg-slate-800'}`}>
                                <div className={`w-4 h-4 rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-0'}`} />
                            </div>
                        </button>
                    </div>
                </div>

                {/* Game Data */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase italic text-slate-400 tracking-widest">Data Management</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <button 
                            onClick={saveGame}
                            className="w-full flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-teal-500/10 rounded-xl">
                                    <Icons.Check className="w-5 h-5 text-teal-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase italic text-slate-900 dark:text-white">Save Game</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Store current progress locally</div>
                                </div>
                            </div>
                            <Icons.ChevronRight className="w-5 h-5 text-slate-300" />
                        </button>

                        <button 
                            onClick={loadGame}
                            className="w-full flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-teal-500/10 rounded-xl">
                                    <Icons.RefreshCw className="w-5 h-5 text-teal-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase italic text-slate-900 dark:text-white">Load Game</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Restore from last save</div>
                                </div>
                            </div>
                            <Icons.ChevronRight className="w-5 h-5 text-slate-300" />
                        </button>
                        
                        <button 
                            onClick={onResetGame}
                            className="w-full flex items-center justify-between p-5 hover:bg-red-500/5 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-red-500/10 rounded-xl group-hover:bg-red-500 group-hover:text-white transition-colors">
                                    <Icons.RefreshCw className="w-5 h-5 text-red-500 group-hover:text-white" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm font-black uppercase italic text-red-500">Reset Progress</div>
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Permanently delete current career</div>
                                </div>
                            </div>
                            <Icons.ChevronRight className="w-5 h-5 text-slate-300" />
                        </button>
                    </div>
                </div>

                {/* About & Version */}
                <div className="space-y-3">
                    <h3 className="text-xs font-black uppercase italic text-slate-400 tracking-widest">About Simulation Cricket</h3>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
                            <span className="text-[10px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Version Number</span>
                            <span className="text-xs font-black text-teal-500 italic">0.0.1</span>
                        </div>
                        
                        <div className="space-y-2">
                             <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">Game Features</p>
                             <ul className="space-y-1.5">
                                 {[
                                     "Dynamic T20 Smash: 2 Groups of 8, Semis & Finals",
                                     "Real-time Match Simulation with Tactical Control",
                                     "Advanced Player Mastery & Phase-Specific Tags",
                                     "Comprehensive Player Stats across all formats",
                                     "AI Squad Management & Smart Lineup Generator"
                                 ].map((f, i) => (
                                     <li key={i} className="flex items-center gap-2 text-[8px] font-bold text-slate-500 uppercase tracking-widest">
                                         <div className="w-1 h-1 bg-teal-500 rounded-full" />
                                         {f}
                                     </li>
                                 ))}
                             </ul>
                        </div>

                        <div className="space-y-2">
                             <p className="text-[9px] font-black text-slate-900 dark:text-white uppercase tracking-widest">How to Play</p>
                             <p className="text-[8px] font-bold text-slate-500 uppercase leading-relaxed">
                                Manage your career through multiple formats. Select your best XI, monitor fitness/form, and lead your team to the title. In-match, use strategy toggles to balance risk and reward.
                             </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 text-center">
                    <div className="text-[10px] font-black text-slate-300 dark:text-slate-700 uppercase tracking-[0.4em]">Simulation Cricket</div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
