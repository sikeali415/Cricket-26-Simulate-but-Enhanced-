
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MatchResult, Player } from '../types';
import { Icons } from './Icons';

interface MatchResultScreenProps {
    result: MatchResult | null;
    onBack: () => void;
    userTeamId: string;
    allPlayers: Player[];
}

const MatchResultScreen: React.FC<MatchResultScreenProps> = ({ result, onBack, userTeamId, allPlayers }) => {
    const [view, setView] = useState<'summary' | 'scorecard'>('summary');
    if (!result) return null;

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white overflow-hidden">
            <div className="p-4 flex justify-between items-center border-b border-white/10">
                <div className="flex p-1 bg-white/5 rounded-xl">
                    <button 
                        onClick={() => setView('summary')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'summary' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}
                    >
                        Summary
                    </button>
                    <button 
                        onClick={() => setView('scorecard')}
                        className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${view === 'scorecard' ? 'bg-teal-500 text-black' : 'text-slate-400'}`}
                    >
                        Scorecard
                    </button>
                </div>
                <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                    <Icons.X className="w-5 h-5 text-slate-400" />
                </button>
            </div>

            <div className="flex-grow overflow-y-auto">
                {view === 'summary' ? (
                    <div className="flex flex-col items-center justify-center p-8 text-center min-h-full">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="mb-8"
                        >
                            <div className="text-[10px] font-black text-teal-500 uppercase tracking-[0.4em] mb-4">Match Result</div>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2">
                                {result.winnerId ? (result.winnerId === result.firstInning.teamId ? result.firstInning.teamName : result.secondInning.teamName) : 'Match Drawn'} <span className="text-teal-500">{result.winnerId ? 'Won' : ''}</span>
                            </h2>
                            <p className="text-slate-400 text-sm font-bold uppercase italic">{result.summary}</p>
                        </motion.div>

                        <div className="w-full max-w-xs space-y-4 mb-12">
                            <div className="bg-white/5 rounded-3xl p-6 border border-white/10">
                                <div className="flex justify-between items-center mb-4">
                                    <span className="text-xs font-black uppercase italic">{result.firstInning.teamName}</span>
                                    <span className="text-xl font-black italic">{result.firstInning.score}/{result.firstInning.wickets}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black uppercase italic">{result.secondInning.teamName}</span>
                                    <span className="text-xl font-black italic">{result.secondInning.score}/{result.secondInning.wickets}</span>
                                </div>
                            </div>
                            
                            <div className="bg-teal-500/10 rounded-2xl p-4 border border-teal-500/20">
                                <div className="text-[8px] font-black text-teal-500 uppercase tracking-widest mb-1">Man of the Match</div>
                                <div className="text-xs font-black uppercase italic">{result.manOfTheMatch.playerName}</div>
                                <div className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{result.manOfTheMatch.summary}</div>
                            </div>
                        </div>

                        <button
                            onClick={onBack}
                            className="w-full max-w-xs py-4 bg-teal-500 text-black font-black uppercase italic tracking-widest rounded-2xl shadow-lg shadow-teal-500/20 active:scale-95 transition-all"
                        >
                            Continue to Hub
                        </button>
                    </div>
                ) : (
                    <div className="p-6 space-y-8">
                        {[result.firstInning, result.secondInning].map((inning, idx) => (
                            <div key={idx} className="space-y-4">
                                <div className="flex justify-between items-end border-b border-white/10 pb-2">
                                    <h3 className="text-lg font-black italic uppercase text-teal-500">{inning.teamName} Innings</h3>
                                    <div className="text-xl font-black italic">{inning.score}/{inning.wickets} <span className="text-[10px] text-slate-400 uppercase not-italic">({inning.overs} ov)</span></div>
                                </div>
                                
                                <div className="bg-white/5 rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="col-span-6">Batter</div>
                                        <div className="col-span-2 text-center">R</div>
                                        <div className="col-span-2 text-center">B</div>
                                        <div className="col-span-2 text-right">SR</div>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {inning.batting.map((b, i) => (
                                            <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center">
                                                <div className="col-span-6">
                                                    <div className="text-[10px] font-black uppercase italic">{b.playerName}</div>
                                                    <div className="text-[8px] text-slate-500 uppercase font-bold">{b.dismissalText}</div>
                                                </div>
                                                <div className="col-span-2 text-center text-[10px] font-black">{b.runs}</div>
                                                <div className="col-span-2 text-center text-[10px] font-bold text-slate-400">{b.balls}</div>
                                                <div className="col-span-2 text-right text-[10px] font-bold text-slate-400">{(b.runs / (b.balls || 1) * 100).toFixed(1)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-2xl overflow-hidden">
                                    <div className="grid grid-cols-12 gap-2 p-3 bg-white/5 text-[8px] font-black text-slate-400 uppercase tracking-widest">
                                        <div className="col-span-6">Bowler</div>
                                        <div className="col-span-2 text-center">O</div>
                                        <div className="col-span-2 text-center">W</div>
                                        <div className="col-span-2 text-right">Eco</div>
                                    </div>
                                    <div className="divide-y divide-white/5">
                                        {inning.bowling.map((b, i) => (
                                            <div key={i} className="grid grid-cols-12 gap-2 p-3 items-center">
                                                <div className="col-span-6">
                                                    <div className="text-[10px] font-black uppercase italic">{b.playerName}</div>
                                                </div>
                                                <div className="col-span-2 text-center text-[10px] font-black">{b.overs}</div>
                                                <div className="col-span-2 text-center text-[10px] font-black text-pink-500">{b.wickets}</div>
                                                <div className="col-span-2 text-right text-[10px] font-bold text-slate-400">{(b.runsConceded / (parseFloat(b.overs) || 1)).toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div className="pt-4">
                            <button
                                onClick={onBack}
                                className="w-full py-4 bg-white/5 border border-white/10 text-white font-black uppercase italic tracking-widest rounded-2xl active:scale-95 transition-all"
                            >
                                Back to Hub
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MatchResultScreen;
