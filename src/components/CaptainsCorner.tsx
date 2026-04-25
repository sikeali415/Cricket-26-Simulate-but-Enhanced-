
import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, TrendingUp, AlertTriangle, Users, Award } from 'lucide-react';
import { GameData, Team, Player, Format } from '../types';
import { getRoleFullName } from '../utils';

interface CaptainsCornerProps {
    gameData: GameData;
    userTeam: Team;
    onBack: () => void;
}

const CaptainsCorner: React.FC<CaptainsCornerProps> = ({ gameData, userTeam, onBack }) => {
    const [activeTab, setActiveTab] = React.useState<'overview' | 'medical' | 'global'>('overview');
    const currentFormat = gameData.currentFormat;
    const playingXIIds = gameData.playingXIs[userTeam.id]?.[currentFormat] || userTeam.squad.slice(0, 11).map(p => p.id);
    const playingXI = playingXIIds.map(id => userTeam.squad.find(p => p.id === id)).filter(Boolean) as Player[];
    
    const captainId = userTeam.captains[currentFormat];
    const captain = playingXI.find(p => p.id === captainId) || playingXI[0] || userTeam.squad[0];

    // Analyze team balance
    const batsmen = playingXI.filter(p => p.role === 'BT' || p.role === 'WK').length;
    const bowlers = playingXI.filter(p => p.role === 'BL' || p.role === 'SB').length;
    const allRounders = playingXI.filter(p => p.role === 'AR').length;

    const insights = [
        {
            title: "TEAM_BALANCE",
            icon: Users,
            status: (batsmen >= 5 && (bowlers + allRounders) >= 5) ? "OPTIMAL" : "IMBALANCED",
            color: (batsmen >= 5 && (bowlers + allRounders) >= 5) ? "text-teal-500" : "text-yellow-500",
            desc: `Current Setup: ${batsmen} Bat / ${bowlers} Bowl / ${allRounders} AR. ${batsmen < 5 ? 'Batting depth might be an issue.' : bowlers < 4 ? 'Bowling variety is limited.' : 'Squad balance looks solid for this format.'}`
        },
        {
            title: "VITAL_ASSET",
            icon: Target,
            status: "IN_FOCUS",
            color: "text-blue-500",
            desc: playingXI.sort((a,b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill))[0]?.name + " is currently our highest rated asset in the XI. Ensuring they are utilized correctly is key to our success."
        },
        {
            title: "FORM_INDICATOR",
            icon: TrendingUp,
            status: "ANALYSING",
            color: "text-purple-500",
            desc: "The track record in this format suggests we perform better when batting first. Recent match data is being synthesized into new tactical options."
        }
    ];

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-500/5 blur-[180px] rounded-full" />
            </div>

            <header className="px-6 py-6 border-b border-white/5 relative z-10 flex flex-col gap-4 bg-black/40 backdrop-blur-xl">
                <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col gap-0.5">
                        <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-teal-500/60">STRATEGIC_COMMAND // v1.0.0</h2>
                        <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white">CAPTAIN'S <span className="text-teal-500">CORNER</span></h1>
                    </div>
                    <button 
                        onClick={onBack}
                        className="p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-[10px] font-black uppercase tracking-widest"
                    >
                        EXIT
                    </button>
                </div>

                <div className="flex gap-2 p-1 bg-white/5 rounded-xl border border-white/5">
                    {[
                        { id: 'overview', label: 'STRATEGIC_OVERVIEW', icon: Shield },
                        { id: 'medical', label: 'MEDICAL_&_FORM', icon: AlertTriangle },
                        { id: 'global', label: 'GLOBAL_COMMANDERS', icon: Users }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all ${activeTab === tab.id ? 'bg-teal-500 text-black' : 'text-white/40 hover:text-white/60 hover:bg-white/5'}`}
                        >
                            <tab.icon className="w-3 h-3" />
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="flex-grow overflow-y-auto p-6 space-y-8 scrollbar-hide relative z-10 pb-12">
                {activeTab === 'overview' && (
                    <>
                        {/* Captain Profile Card */}
                        <div className="grid grid-cols-1 gap-4">
                            <motion.div 
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6 flex items-center gap-6 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                                    <Shield className="w-40 h-40" />
                                </div>
                                
                                <div className="w-20 h-20 bg-teal-500/10 rounded-2xl p-1 border border-teal-500/20 shadow-[0_0_20px_rgba(20,184,166,0.1)] shrink-0">
                                     <img 
                                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${captain?.avatarSeed || captain?.name || 'Captain'}`} 
                                        alt="Captain"
                                        className="w-full h-full object-cover rounded-xl"
                                    />
                                </div>
                                
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="px-2 py-0.5 bg-yellow-500 text-black text-[7px] font-black uppercase rounded tracking-widest">CAPTAIN</span>
                                        <span className="text-[9px] font-black text-white/30 uppercase tracking-[0.2em]">{userTeam.name}</span>
                                    </div>
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">{captain?.name || 'NO_LEADER_ASSIGNED'}</h3>
                                    <p className="text-[9px] font-black text-teal-500 uppercase tracking-[0.2em] mt-1 italic opacity-60">"WE PLAY AS ONE, WE WIN AS ONE."</p>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}

                {activeTab === 'medical' && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">MEDICAL_&_FORM_INTELLIGENCE</h3>
                        </div>
                        
                        <div className="glass-card overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-white/5 border-b border-white/10">
                                    <tr>
                                        <th className="px-4 py-3 text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">PLAYER</th>
                                        <th className="px-4 py-3 text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">SQUAD_STATUS</th>
                                        <th className="px-4 py-3 text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">FORM</th>
                                        <th className="px-4 py-3 text-[7px] font-black text-white/30 uppercase tracking-[0.2em]">ADVISORY</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {userTeam.squad.sort((a,b) => (a.fitness || 100) - (b.fitness || 100)).map(p => {
                                        const fitness = p.fitness || 100;
                                        const form = p.form || 50;
                                        
                                        let statusLabel = 'FIT';
                                        let statusColor = 'text-green-500';
                                        let statusIcon = '🟢';
                                        
                                        if (p.injury) {
                                            statusLabel = `INJURED (${p.injury.matchesOut}M)`;
                                            statusColor = 'text-red-500';
                                            statusIcon = '🔴';
                                        } else if (fitness < 60) {
                                            statusLabel = `TIRED (${fitness}%)`;
                                            statusColor = 'text-yellow-500';
                                            statusIcon = '🟡';
                                        }

                                        let formLabel = 'STABLE';
                                        let formColor = 'text-white/40';
                                        let formIcon = '🟢';
                                        if (form > 80) { formLabel = 'HOT_STREAK'; formColor = 'text-teal-400'; formIcon = '🔥'; }
                                        else if (form < 20) { formLabel = 'SLUMP'; formColor = 'text-blue-400'; formIcon = '❄️'; }

                                        let advisory = 'KEEP_IN_XI';
                                        if (p.injury) advisory = 'REPLACE_BY_RESERVE';
                                        else if (fitness < 60) advisory = 'REST_RECOMMENDED';
                                        else if (form < 20) advisory = 'DEMOTE_OR_DROP';

                                        return (
                                            <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-4 py-3">
                                                    <div className="text-[10px] font-black uppercase text-white">{p.name}</div>
                                                    <div className="text-[7px] font-bold text-white/20 uppercase tracking-widest">{p.role}</div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-[8px] font-black uppercase tracking-tighter ${statusColor}`}>
                                                        {statusIcon} {statusLabel}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className={`text-[8px] font-black uppercase tracking-tighter ${formColor}`}>
                                                        {formIcon} {formLabel}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="text-[8px] font-black text-white/60 uppercase tracking-widest bg-white/5 px-2 py-1 rounded inline-block">
                                                        {advisory}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'global' && (
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/60">GLOBAL_COMMANDERS_DIRECTORY</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {gameData.teams.map(team => {
                                const teamCapId = team.captains[currentFormat];
                                const teamCap = team.squad.find(p => p.id === teamCapId) || team.squad[0];
                                return (
                                    <div key={team.id} className="glass-card p-3 border border-white/5 hover:border-teal-500/30 transition-all group">
                                        <div className="flex items-center gap-2 mb-2">
                                            <div className="w-8 h-8 rounded-lg bg-white/5 p-0.5 border border-white/10 group-hover:border-teal-500/40">
                                                <img 
                                                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teamCap?.avatarSeed || teamCap?.name || 'CP'}`} 
                                                    alt="Captain"
                                                    className="w-full h-full object-cover rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <div className="text-[6px] font-black text-white/30 uppercase tracking-widest">{team.name}</div>
                                                <div className="text-[9px] font-black italic text-white uppercase tracking-tighter leading-none">{teamCap?.name.split(' ').pop()}</div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-center text-[7px] font-black uppercase">
                                            <span className="text-teal-500">{team.overallRating || 0} RTG</span>
                                            <span className="text-white/20">GRP {team.group || '-'}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CaptainsCorner;
