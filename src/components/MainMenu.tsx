
import React from 'react';
import { motion } from 'framer-motion';
import { Smartphone, Download, Trophy, Database, Play, RotateCcw, LogOut } from 'lucide-react';

interface MainMenuProps {
    onStartNewGame: () => void;
    onResumeGame: () => void;
    onOpenEditor: () => void;
    hasSaveData: boolean;
}

const MainMenu: React.FC<MainMenuProps> = ({ onStartNewGame, onResumeGame, onOpenEditor, hasSaveData }) => {
    return (
        <div className="h-full flex flex-col items-center justify-center p-6 md:p-10 bg-[#050808] relative overflow-hidden font-sans text-[#E4E3E0]">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[80%] h-[80%] bg-teal-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[80%] h-[80%] bg-blue-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut" }}
                className="relative z-10 flex flex-col items-center w-full max-w-md"
            >
                {/* Logo Section */}
                <div className="w-48 h-48 md:w-64 md:h-64 mb-8 relative">
                    <div className="absolute inset-0 bg-teal-500/20 blur-3xl rounded-full animate-pulse" />
                    <div className="w-full h-full glass-card flex items-center justify-center p-8 border-2 border-white/10 shadow-[0_0_50px_rgba(20,184,166,0.2)] rounded-[40px]">
                        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                            <path d="M50 5 L95 25 L95 75 L50 95 L5 75 L5 25 Z" fill="none" stroke="currentColor" strokeWidth="2" className="text-teal-500" />
                            <text x="50" y="65" fontFamily="Outfit" fontSize="40" fontWeight="900" fill="white" textAnchor="middle">S26</text>
                        </svg>
                    </div>
                </div>

                <div className="text-center space-y-2 mb-12">
                    <h1 className="text-4xl md:text-6xl font-black italic uppercase tracking-tighter text-white leading-none">
                        SIKE'S <span className="text-teal-500">SUPER SMASH</span> 26
                    </h1>
                    <p className="text-[10px] md:text-xs font-black text-white/30 uppercase tracking-[0.6em]">SEASON 1 // OFFICIAL_BROADCAST</p>
                </div>

                {/* Main Actions */}
                <div className="w-full space-y-4">
                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onStartNewGame}
                        className="w-full group relative overflow-hidden bg-teal-500 text-black py-5 px-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-[0_10px_30px_rgba(20,184,166,0.3)] flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <RotateCcw className="w-5 h-5" />
                            <span>NEW GAME</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-black/20" />
                    </motion.button>

                    {hasSaveData && (
                        <motion.button
                            whileHover={{ scale: 1.02, x: 5 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={onResumeGame}
                            className="w-full group relative overflow-hidden bg-white/5 hover:bg-white/10 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all border border-white/10 flex items-center justify-between"
                        >
                            <div className="flex items-center gap-4">
                                <Play className="w-5 h-5 text-teal-500" fill="currentColor" />
                                <span>LOAD GAME</span>
                            </div>
                            <div className="w-2 h-2 rounded-full bg-white/10" />
                        </motion.button>
                    )}

                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={onOpenEditor}
                        className="w-full group relative overflow-hidden bg-white/5 hover:bg-white/10 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all border border-white/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <Database className="w-5 h-5 text-teal-500" />
                            <span>EDITOR</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                    </motion.button>

                    <motion.button
                        whileHover={{ scale: 1.02, x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full group relative overflow-hidden bg-white/5 hover:bg-white/10 text-white py-5 px-8 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all border border-white/10 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-4">
                            <LogOut className="w-5 h-5 text-red-500/60" />
                            <span>EXIT</span>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-white/10" />
                    </motion.button>
                </div>

                {/* PWA Info */}
                <div className="mt-12 flex items-center gap-4 text-white/20">
                    <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">PWA_READY</span>
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/10" />
                    <div className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        <span className="text-[8px] font-black uppercase tracking-widest">OFFLINE_ENABLED</span>
                    </div>
                </div>
            </motion.div>

            <div className="absolute bottom-8 text-[8px] font-mono text-white/10 uppercase tracking-[0.5em]">
                © 2026 SIKE_GAMES_STUDIO // ALL_RIGHTS_RESERVED
            </div>
        </div>
    );
};

export default MainMenu;
