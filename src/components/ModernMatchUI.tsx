
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Player, LiveMatchState, GameData, Strategy, PlayerRole, Inning, BattingPerformance, BowlingPerformance } from '../types';
import { getPlayerById } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

interface ModernMatchUIProps {
    state: LiveMatchState;
    gameData: GameData;
    onSetBattingStrategy: (s: Strategy) => void;
    onPlayBall: () => void;
    onShowMatchCentre: () => void;
}

const RadarChart = ({ values, size = 80 }: { values: number[], size?: number }) => {
    const categories = ['Att', 'Dif', 'Pwr', 'Ss', '6s', 'Acc'];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;

    const points = useMemo(() => {
        return values.map((val, i) => {
            const angle = (i * 60 - 90) * (Math.PI / 180);
            const r = (val / 100) * radius;
            return {
                x: centerX + r * Math.cos(angle),
                y: centerY + r * Math.sin(angle)
            };
        });
    }, [values, centerX, centerY, radius]);

    const polygonPoints = points.map(p => `${p.x},${p.y}`).join(' ');

    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="overflow-visible">
                <defs>
                    <filter id="glow-teal-radar">
                        <feGaussianBlur stdDeviation="1" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                {/* Background hexagons */}
                {[0.2, 0.4, 0.6, 0.8, 1].map((f, idx) => {
                    const r = radius * f;
                    const hexPoints = Array.from({ length: 6 }).map((_, i) => {
                        const angle = (i * 60 - 90) * (Math.PI / 180);
                        return `${centerX + r * Math.cos(angle)},${centerY + r * Math.sin(angle)}`;
                    }).join(' ');
                    return (
                        <polygon
                            key={idx}
                            points={hexPoints}
                            fill="none"
                            stroke="rgba(20, 184, 166, 0.1)"
                            strokeWidth="0.5"
                        />
                    );
                })}
                {/* Axes */}
                {Array.from({ length: 6 }).map((_, i) => {
                    const angle = (i * 60 - 90) * (Math.PI / 180);
                    return (
                        <line
                            key={i}
                            x1={centerX}
                            y1={centerY}
                            x2={centerX + radius * Math.cos(angle)}
                            y2={centerY + radius * Math.sin(angle)}
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.5"
                        />
                    );
                })}
                {/* Custom Polygon */}
                <polygon
                    points={polygonPoints}
                    fill="rgba(20, 184, 166, 0.15)"
                    stroke="#14b8a6"
                    strokeWidth="1.5"
                    filter="url(#glow-teal-radar)"
                />
            </svg>
        </div>
    );
};

const BatsmanCard = ({ player, performance, isActive }: { player: Player, performance: BattingPerformance, isActive: boolean }) => {
    const chartData = useMemo(() => {
        // Deterministic trend based on player stats and some oscillation
        return Array.from({ length: 15 }).map((_, i) => {
            const baseVal = isActive ? 60 : 40;
            const variance = Math.sin(i * 0.8) * 20;
            const skillBonus = (player.battingSkill || 70) / 10;
            return {
                val: baseVal + variance + skillBonus
            };
        });
    }, [isActive, player.battingSkill]);

    const radarValues = useMemo(() => {
        const base = player.battingSkill || 70;
        return [
            base + (player.archetype === 'Aggressive' ? 10 : 0), // Att
            75, // Dif
            player.attributes?.power || base, // Pwr
            80, // Ss
            base > 80 ? 90 : 70, // 6s
            70 // Acc
        ];
    }, [player]);

    const stats = [
        { label: 'R', val: performance.runs },
        { label: 'B', val: performance.balls },
        { label: '4s', val: performance.fours },
        { label: '6s', val: performance.sixes },
        { label: 'S/R', val: performance.balls > 0 ? ((performance.runs / performance.balls) * 100).toFixed(0) : '0' }
    ];

    return (
        <div className={`bg-neutral-900 border ${isActive ? 'border-teal-500/50 shadow-[0_0_30px_rgba(20,184,166,0.1)]' : 'border-white/5'} rounded-2xl p-5 flex flex-col gap-4 relative overflow-hidden group transition-all duration-700`}>
            {isActive && (
                <div className="absolute top-0 right-0 p-2">
                    <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse shadow-[0_0_10px_#14b8a6]" />
                </div>
            )}
            
            <div className="flex items-center justify-between">
                <h3 className={`text-base font-black italic uppercase tracking-tighter ${isActive ? 'text-teal-400' : 'text-white/40'}`}>
                    {isActive ? 'STRK' : 'N-STRK'}: {player.name} ({isActive ? 'Active' : 'StandBy'})
                </h3>
            </div>

            <div className="flex items-center gap-5">
                <div className="relative flex-shrink-0">
                    <div className={`w-20 h-20 rounded-full border-2 ${isActive ? 'border-teal-500 shadow-[0_0_15px_rgba(20,184,166,0.2)]' : 'border-zinc-700'} p-0.5 relative group-hover:scale-105 transition-transform duration-500`}>
                        <PlayerAvatar player={player} size="lg" className="w-full h-full rounded-full" />
                        <div className="absolute -bottom-1 -right-1 bg-neutral-800 border border-teal-500/50 rounded-full w-8 h-8 flex items-center justify-center font-black text-teal-400 text-[10px] shadow-lg">
                            {player.rating || player.battingSkill}
                        </div>
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-5 gap-0 border border-white/5 rounded-xl overflow-hidden bg-black/40">
                    {stats.map((s, i) => (
                        <div key={s.label} className={`flex flex-col items-center py-2 ${i < stats.length - 1 ? 'border-r border-white/5' : ''}`}>
                            <span className="text-xl font-black text-white leading-none">{s.val}</span>
                            <span className="text-[8px] font-black text-white/30 uppercase mt-1">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="h-20 w-full bg-black/60 rounded-xl border border-white/5 p-2 relative overflow-hidden backdrop-blur-sm">
                <div className="absolute top-2 left-3 z-10 flex items-center gap-1.5">
                    <Icons.Activity className="w-3 h-3 text-teal-500/50" />
                    <span className="text-[7px] font-black text-white/20 uppercase tracking-widest">Confidence Trend</span>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id={`grad-${player.id}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.4} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill={`url(#grad-${player.id})`}
                            animationDuration={1500}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between">
                <div className="w-20 h-24 flex items-center justify-center relative">
                    <div className="absolute inset-0 bg-teal-500/5 rounded-full blur-xl animate-pulse" />
                    <svg width="45" height="65" viewBox="0 0 45 65" className="relative z-10 filter drop-shadow-[0_0_5px_rgba(255,255,255,0.2)]">
                        {/* Batting Pose Silhouette */}
                        <circle cx="22" cy="12" r="5" fill="white" />
                        <path d="M22 17V40" stroke="white" strokeWidth="4" strokeLinecap="round" />
                        <path d="M22 22L12 35L5 50" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M22 22L35 35" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M22 40L15 58" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        <path d="M22 40L30 58" stroke="white" strokeWidth="3" strokeLinecap="round" />
                        {/* Bat */}
                        <path d="M5 50L2 58" stroke="#14b8a6" strokeWidth="6" strokeLinecap="round" />
                    </svg>
                    <p className="absolute bottom-0 text-[6px] font-black text-white/20 uppercase tracking-[0.2em] whitespace-nowrap">Stance_Active</p>
                </div>

                <div className="p-3 bg-black/40 rounded-xl border border-white/5 relative group">
                    <RadarChart values={radarValues} size={90} />
                    <div className="absolute -top-1 -right-1">
                        <div className="bg-teal-500/10 text-teal-400 text-[6px] font-black px-1.5 py-0.5 rounded border border-teal-500/30 uppercase tracking-widest">
                            Attributes
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FieldingView = ({ matchType }: { matchType: string }) => {
    return (
        <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 flex flex-col items-center gap-4 shadow-xl">
            <div className="w-full flex justify-between items-start">
                <div className="flex flex-col">
                    <span className="text-[8px] text-teal-400 font-black uppercase tracking-[0.3em] mb-1">LIVE FIELD_STREAM</span>
                    <span className="text-sm text-white font-black italic tracking-tighter">Offside Heavy / Ring 6 / Out 3</span>
                </div>
                <Icons.Activity className="w-4 h-4 text-white/10" />
            </div>

            <div className="relative w-full aspect-square flex items-center justify-center p-4">
                 <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                    <defs>
                        <filter id="field-glow">
                            <feGaussianBlur stdDeviation="1.5" result="blur" />
                            <feMerge>
                                <feMergeNode in="blur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>
                    <circle cx="50" cy="50" r="48" fill="#111" stroke="rgba(255,255,255,0.05)" strokeDasharray="1 1" />
                    <circle cx="50" cy="50" r="32" fill="none" stroke="#14b8a6" strokeWidth="0.5" filter="url(#field-glow)" strokeOpacity="0.4" />
                    <circle cx="50" cy="50" r="22" fill="none" stroke="#14b8a6" strokeWidth="0.5" filter="url(#field-glow)" strokeOpacity="0.6" />
                    
                    {/* Pitch */}
                    <rect x="46" y="40" width="8" height="20" fill="#f59e0b" rx="1.5" fillOpacity="0.8" />
                    
                    {/* Fielder Positions */}
                    {[
                        { x: 50, y: 8, label: "T. Man" },
                        { x: 92, y: 50, label: "S. Off" },
                        { x: 8, y: 50, label: "M. Off" },
                        { x: 50, y: 92, label: "M. Off" },
                        { x: 82, y: 18, label: "Slip 1" },
                        { x: 18, y: 18, label: "Slip 2" },
                        { x: 82, y: 82, label: "Cvr" },
                        { x: 18, y: 82, label: "Wkt" },
                        { x: 50, y: 5, label: "" }
                    ].map((f, i) => f.label && (
                        <g key={i}>
                            <circle cx={f.x} cy={f.y} r="2.5" fill="#14b8a6" filter="url(#field-glow)" className="animate-pulse" style={{ animationDelay: `${i * 200}ms` }} />
                            <text x={f.x} y={f.y - 4} textAnchor="middle" fill="white" className="text-[4px] font-black uppercase opacity-60 tracking-[0.05em]" style={{ fontSize: '3px' }}>{f.label}</text>
                        </g>
                    ))}
                 </svg>
            </div>
        </div>
    );
}

export const ModernMatchUI: React.FC<ModernMatchUIProps> = ({ state, gameData, onSetBattingStrategy, onPlayBall, onShowMatchCentre }) => {
    const currentInning = state.innings[state.currentInningIndex];
    const striker = currentInning.batting.find(b => b.playerId === state.currentBatters.strikerId);
    const nonStriker = currentInning.batting.find(b => b.playerId === state.currentBatters.nonStrikerId);
    const bowler = currentInning.bowling.find(b => b.playerId === state.currentBowlerId);

    const strikerPlayer = getPlayerById(state.currentBatters.strikerId, gameData.allPlayers);
    const nonStrikerPlayer = getPlayerById(state.currentBatters.nonStrikerId, gameData.allPlayers);
    const bowlerPlayer = getPlayerById(state.currentBowlerId, gameData.allPlayers);

    const isT20 = gameData.currentFormat.includes('T20');
    const maxOvers = isT20 ? 20 : 50;
    const ballsBowled = Math.floor(parseFloat(currentInning.overs)) * 6 + Math.round((parseFloat(currentInning.overs) % 1) * 10);
    const ballsRemaining = Math.max(0, (maxOvers * 6) - ballsBowled);

    return (
        <div className="flex-1 flex bg-[#050808] p-6 gap-8 overflow-hidden">
            {/* Left Column: Batsmen Profiles */}
            <div className="w-[45%] flex flex-col gap-6 overflow-y-auto scrollbar-hide">
                {strikerPlayer && striker && (
                    <BatsmanCard player={strikerPlayer} performance={striker} isActive={true} />
                )}
                {nonStrikerPlayer && nonStriker && (
                    <BatsmanCard player={nonStrikerPlayer} performance={nonStriker} isActive={false} />
                )}
            </div>

            {/* Right Column: Match Controls & Real-time State */}
            <div className="flex-1 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
                {/* Match Score Card */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-neutral-900 border border-white/10 rounded-2xl p-6 flex flex-col shadow-2xl relative overflow-hidden"
                >
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center font-black text-2xl text-black rotate-3 shadow-lg">
                                {state.battingTeam.name[0]}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-teal-400 uppercase tracking-[0.4em] mb-1">CURRENT_BATTING</span>
                                <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white">{state.battingTeam.name}</h2>
                            </div>
                        </div>
                        <div className="flex flex-col items-end">
                            <span className="text-6xl font-black text-white italic tracking-tighter drop-shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                                {currentInning.score}/{currentInning.wickets}
                            </span>
                        </div>
                    </div>
                </motion.div>

                {/* Inning Limit Card */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                        <span className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Inning Limit</span>
                        <p className="text-lg font-black text-white italic">{maxOvers * 6} Balls</p>
                    </div>
                    <div className="bg-neutral-900/60 border border-white/5 rounded-2xl p-4 flex flex-col justify-center">
                        <span className="text-[8px] text-white/30 font-black uppercase tracking-widest mb-1">Balls Remaining</span>
                        <div className="flex items-baseline gap-2">
                            <p className="text-2xl font-black text-teal-500 italic">{ballsRemaining}</p>
                            <span className="text-[8px] text-white/20 font-bold uppercase">Pro: {currentInning.score + Math.round((currentInning.score / (ballsBowled || 1)) * ballsRemaining)}</span>
                        </div>
                    </div>
                </div>

                {/* Bowler & Field Stream */}
                <div className="flex flex-col gap-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5">
                         <div className="flex justify-between items-center mb-4">
                             <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full border border-teal-500 p-0.5 overflow-hidden">
                                     {bowlerPlayer && <PlayerAvatar player={bowlerPlayer} size="sm" className="w-full h-full rounded-full" />}
                                 </div>
                                 <div className="flex flex-col">
                                     <span className="text-white font-black uppercase italic text-sm">{bowlerPlayer?.name} [{bowlerPlayer?.rating || 85}]</span>
                                     <span className="text-[7px] text-teal-400 font-black tracking-widest">ACTIVE_BOWLER</span>
                                 </div>
                             </div>
                             <div className="text-right">
                                 <p className="text-lg font-black text-white italic">{bowler?.wickets}-{bowler?.runsConceded}</p>
                                 <p className="text-[8px] text-white/20 font-black">({bowler?.overs} OV)</p>
                             </div>
                         </div>
                         <FieldingView matchType={state.match.group} />
                    </div>
                </div>

                {/* Recent Balls & Strategy */}
                <div className="mt-auto flex flex-col gap-4">
                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[8px] text-white/30 font-black uppercase tracking-widest">Recent Balls</span>
                            <div className="flex gap-1.5">
                                {state.recentBalls.slice(0, 6).reverse().map((b, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${
                                        b === '4' || b === '6' ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_10px_#14b8a6]' : 
                                        b === 'W' ? 'bg-red-500 border-red-400 text-white shadow-[0_0_10px_#ef4444]' : 
                                        'bg-white/5 border-white/10 text-white/40'
                                    }`}>
                                        {b}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-black/40 border border-white/5 rounded-xl p-3 flex justify-between items-center">
                            <span className="text-[8px] text-white/40 font-black uppercase tracking-widest">Last Ball Info</span>
                            <span className="text-xs text-teal-400 font-black italic uppercase">
                                {state.commentary[0]?.split(':')?.[1]?.trim() || '(Match Start)'}
                            </span>
                        </div>
                    </div>

                    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-5 space-y-4">
                        <div className="flex items-center justify-between">
                            <span className="text-[8px] text-teal-400 font-black uppercase tracking-widest">Bat Strategy</span>
                            <div className="flex gap-2">
                                {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                                    <button
                                        key={s}
                                        onClick={() => onSetBattingStrategy(s)}
                                        className={`px-6 py-2 text-[10px] uppercase font-black rounded-lg transition-all border ${state.strategies.batting === s 
                                            ? 'bg-teal-500 border-teal-400 text-black shadow-[0_0_20px_rgba(20,184,166,0.3)]' 
                                            : 'bg-white/5 border-white/10 text-white/30 hover:text-white'}`}
                                    >
                                        {s.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={onPlayBall}
                                className="bg-teal-600 hover:bg-teal-500 text-white p-6 rounded-2xl flex items-center justify-center gap-4 group transition-all shadow-[0_10px_40px_rgba(20,184,166,0.2)]"
                            >
                                <Icons.Zap className="w-8 h-8 text-white group-hover:scale-125 transition-transform" />
                                <span className="font-black italic uppercase tracking-tighter text-3xl">OVER</span>
                            </motion.button>
                            <motion.button 
                                whileTap={{ scale: 0.95 }}
                                onClick={onShowMatchCentre}
                                className="bg-white/5 hover:bg-white/10 text-white border border-white/10 p-6 rounded-2xl flex items-center justify-center gap-4 group transition-all"
                            >
                                <Icons.LayoutDashboard className="w-8 h-8 text-white/40 group-hover:scale-125 transition-transform" />
                                <span className="font-black italic uppercase tracking-tighter text-3xl">CENTRE</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
