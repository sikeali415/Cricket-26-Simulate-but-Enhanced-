
import React from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Info, BarChart, Zap, Trophy, Shield, Database } from 'lucide-react';
import { SlantedContainer } from './Icons';

interface HelpSectionProps {
    onClose: () => void;
}

const HelpSection: React.FC<HelpSectionProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
            <div className="absolute inset-0 bg-black/90 backdrop-blur-3xl" onClick={onClose} />
            
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-[#0A0F0F] border border-white/10 w-full max-w-4xl h-[90vh] md:h-[80vh] rounded-[40px] relative overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="px-8 py-8 border-b border-white/5 relative shrink-0">
                    <div className="flex items-center gap-3 mb-2">
                        <HelpCircle className="w-5 h-5 text-teal-500" />
                        <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-teal-400">OPERATION_MANUAL // v0.0.1</h2>
                    </div>
                    <h1 className="text-4xl font-black italic uppercase tracking-tighter text-white">GAME FEATURES & GUIDE</h1>
                    <button 
                        onClick={onClose}
                        className="absolute top-8 right-8 text-white/20 hover:text-white transition-colors"
                    >
                        <Zap className="w-6 h-6 rotate-45" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-8 space-y-12 scrollbar-hide pb-20">
                    
                    {/* Core Concept */}
                    <section>
                        <SlantedContainer className="bg-teal-500 text-black px-4 py-1 mb-6 inline-block">
                            <span className="text-xs font-black uppercase tracking-widest">01 // CORE_CONCEPT</span>
                        </SlantedContainer>
                        <p className="text-white/60 leading-relaxed max-w-2xl text-sm italic">
                            Welcome to Simulation Cricket Manager. You are the architect of a cricketing dynasty. Manage your finances, build your squad through auctions, and master the tactical nuances of three distinct formats to claim the ultimate glory.
                        </p>
                    </section>

                    {/* Features Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                    <Shield className="w-6 h-6 text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-2">SQUAD MANAGEMENT</h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        Monitor player fitness, form, and injuries. Rotate your squad to ensure peak performance during dense T20 Smash schedules or grueling FC seasons.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                    <Zap className="w-6 h-6 text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-2">MATCH ENGINE</h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        Take full control in Live Match mode or let the Smart AI simulate the results based on skills, pitch conditions, and tactics.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                    <BarChart className="w-6 h-6 text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-2">DETAILED STATS</h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        Every ball is recorded. Track player milestones, league leaders, and team vs team records to fine-tune your strategies.
                                    </p>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                                    <Trophy className="w-6 h-6 text-teal-500" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase italic tracking-tight text-white mb-2">SEASONAL PROGRESSION</h3>
                                    <p className="text-white/40 text-xs leading-relaxed">
                                        End the season by retaining your core players and drafting new talent. Groups for T20 Smash are randomized every season for fresh challenges.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Gameplay Mechanics */}
                    <section className="bg-white/[0.02] border border-white/5 rounded-3xl p-8 space-y-6">
                        <h2 className="text-2xl font-black italic uppercase italic tracking-tighter text-white">How To Play</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <span className="text-teal-500 font-mono text-xs">Step 01</span>
                                <h4 className="text-sm font-black uppercase text-white">DASHBOARD_OPS</h4>
                                <p className="text-[10px] text-white/30 leading-relaxed">Advance days to simulate matches or prepare for your next fixture. Check the Captain's Corner for team reports.</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-teal-500 font-mono text-xs">Step 02</span>
                                <h4 className="text-sm font-black uppercase text-white">MATCH_STRATEGY</h4>
                                <p className="text-[10px] text-white/30 leading-relaxed">Set your batting order and bowling plan. Adjust mentalities (Defensive, Balanced, Aggressive) during the match.</p>
                            </div>
                            <div className="space-y-2">
                                <span className="text-teal-500 font-mono text-xs">Step 03</span>
                                <h4 className="text-sm font-black uppercase text-white">LEAGUE_DOMINANCE</h4>
                                <p className="text-[10px] text-white/30 leading-relaxed">Win matches to gain popularity points, leading to better sponsorship deals and more purse for auctions.</p>
                            </div>
                        </div>
                    </section>

                    {/* Stats Guide */}
                    <section>
                         <h2 className="text-2xl font-black italic uppercase italic tracking-tighter text-white mb-6 underline decoration-teal-500/30 underline-offset-8">Understanding Stats</h2>
                         <div className="space-y-4">
                            <div className="flex justify-between border-b border-white/5 py-3">
                                <span className="text-xs font-black uppercase text-white/60">Skills (Bat/Bowl)</span>
                                <span className="text-xs text-white/40 max-w-[250px] text-right italic">Determines the core success probability for every action. Ranges from 30 to 95.</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 py-3">
                                <span className="text-xs font-black uppercase text-white/60">Form & Fitness</span>
                                <span className="text-xs text-white/40 max-w-[250px] text-right italic">Form acts as a multiplier on skill. Fitness reduces injury chance and maintains stamina.</span>
                            </div>
                            <div className="flex justify-between border-b border-white/5 py-3">
                                <span className="text-xs font-black uppercase text-white/60">NRR (Net Run Rate)</span>
                                <span className="text-xs text-white/40 max-w-[250px] text-right italic">Tie-breaker for league standings. Calculated as Runs For/Overs For - Runs Against/Overs Against.</span>
                            </div>
                         </div>
                    </section>

                </div>

                {/* Footer Action */}
                <div className="p-8 border-t border-white/5 relative shrink-0">
                    <button 
                        onClick={onClose}
                        className="w-full bg-white text-black font-black py-4 rounded-2xl uppercase tracking-[0.4em] text-xs hover:bg-teal-500 transition-colors"
                    >
                        ACKNOWLEDGE & RETURN
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

export default HelpSection;
