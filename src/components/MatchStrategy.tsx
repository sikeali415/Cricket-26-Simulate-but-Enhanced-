
import React, { useState, useEffect } from 'react';
import { motion, Reorder } from 'framer-motion';
import { Users, Shield, Zap, ChevronRight, Info, AlertCircle, Save, LayoutGrid } from 'lucide-react';
import { Player, Format, Team, Match } from '../types';
import { getRoleColor, getRoleFullName } from '../utils';

interface MatchStrategyProps {
    userTeam: Team;
    playingXI: Player[];
    match: Match;
    format: Format;
    onComplete: (battingOrder: string[]) => void;
    onBack: () => void;
}

const MatchStrategy: React.FC<MatchStrategyProps> = ({ userTeam, playingXI, match, format, onComplete, onBack }) => {
    const [battingOrder, setBattingOrder] = useState<Player[]>(playingXI);

    return (
        <div className="h-full flex flex-col bg-[#050808] text-white overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/50 backdrop-blur-md">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center border border-teal-500/30">
                        <Shield className="w-5 h-5 text-teal-500" />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest italic">Match Strategy</h2>
                        <p className="text-[10px] text-white/40 font-bold uppercase tracking-tighter">vs {match.teamA === userTeam.name ? match.teamB : match.teamA}</p>
                    </div>
                </div>
                <button 
                    onClick={() => onComplete(battingOrder.map(p => p.id))}
                    className="px-4 py-2 bg-teal-500 text-black text-[10px] font-black uppercase tracking-widest rounded-lg flex items-center gap-2 hover:bg-teal-400 transition-colors"
                >
                    <Save className="w-3 h-3" />
                    Confirm Batting Order
                </button>
            </div>

            {/* Content */}
            <div className="flex-grow overflow-y-auto p-4 space-y-6 custom-scrollbar">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <Info className="w-4 h-4 text-blue-400 shrink-0" />
                        <p className="text-[10px] text-blue-200/70 font-medium leading-relaxed">
                            Drag and drop players to set your batting order. Your best openers should be at the top. Bowlers will be selected during the match.
                        </p>
                    </div>

                    <Reorder.Group axis="y" values={battingOrder} onReorder={setBattingOrder} className="space-y-2">
                        {battingOrder.map((player, index) => (
                            <Reorder.Item 
                                key={player.id} 
                                value={player}
                                className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center gap-4 cursor-grab active:cursor-grabbing hover:bg-white/10 transition-colors"
                            >
                                <div className="w-6 h-6 rounded-full bg-black/40 flex items-center justify-center text-[10px] font-black text-teal-500 border border-white/5">
                                    {index + 1}
                                </div>
                                <div className="flex-grow">
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold">{player.name}</span>
                                        {player.isOpener && <span className="text-[8px] bg-teal-500/20 text-teal-400 px-1 rounded font-black">OPENER</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-[9px] text-white/40 font-bold">
                                        <span className={getRoleColor(player.role)}>{getRoleFullName(player.role)}</span>
                                        <span>•</span>
                                        <span>BAT: {player.battingSkill}</span>
                                        <span>•</span>
                                        <span>BOWL: {player.secondarySkill}</span>
                                    </div>
                                </div>
                                <div className="text-white/20">
                                    <LayoutGrid className="w-4 h-4" />
                                </div>
                            </Reorder.Item>
                        ))}
                    </Reorder.Group>
                </div>
            </div>

            {/* Footer Info */}
            <div className="p-4 bg-black/50 border-t border-white/10 text-center">
                <p className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                    System will auto-simulate if plan is incomplete
                </p>
            </div>
        </div>
    );
};

export default MatchStrategy;
