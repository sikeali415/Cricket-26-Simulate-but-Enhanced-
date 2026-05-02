
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

const RadarChart = ({ values, size = 60 }: { values: number[], size?: number }) => {
    const categories = ['R', 'Att', 'DIF', 'DW', 'Ss', '6s'];
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.4;

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
                            stroke="rgba(255,255,255,0.05)"
                            strokeWidth="0.5"
                        />
                    );
                })}
                {/* Custom Polygon */}
                <polygon
                    points={polygonPoints}
                    fill="rgba(20, 184, 166, 0.2)"
                    stroke="#14b8a6"
                    strokeWidth="1"
                />
                {/* Labels */}
                {categories.map((cat, i) => {
                    const angle = (i * 60 - 90) * (Math.PI / 180);
                    const labelRadius = radius + 8;
                    const lx = centerX + labelRadius * Math.cos(angle);
                    const ly = centerY + labelRadius * Math.sin(angle);
                    return (
                        <text
                            key={cat}
                            x={lx}
                            y={ly}
                            textAnchor="middle"
                            alignmentBaseline="middle"
                            className="text-[5px] fill-white/40 font-bold"
                        >
                            {cat}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
};

const BatsmanCard = ({ player, performance, isActive }: { player: Player, performance: BattingPerformance, isActive: boolean }) => {
    // Generate some mock historical data for the area chart based on their performance
    const chartData = useMemo(() => {
        return Array.from({ length: 15 }).map((_, i) => ({
            val: 2 + Math.random() * (isActive ? 8 : 4)
        }));
    }, [isActive]);

    const radarValues = useMemo(() => {
        // Map player attributes to radar
        const base = player.battingSkill || 70;
        return [
            base, // R
            player.archetype === 'Aggressive' ? 90 : 70, // Att
            (player.attributes?.consistency || 75), // DIF
            70 + Math.random() * 20, // DW
            80, // Ss
            player.attributes?.power || base // 6s
        ];
    }, [player]);

    return (
        <div className={`relative bg-neutral-900/80 border border-white/5 rounded-[2.5rem] p-6 flex flex-col gap-4 overflow-hidden transition-all duration-500 ${isActive ? 'ring-2 ring-teal-500/30' : 'opacity-80'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className="text-white font-black text-xl tracking-tight uppercase italic">
                        {isActive ? 'STRK' : 'N-STRK'}: {player.name} <span className={isActive ? 'text-teal-400' : 'text-zinc-500'}>({isActive ? 'Active' : 'Standby'})</span>
                    </h3>
                </div>
            </div>

            <div className="flex items-center gap-6">
                <div className="relative">
                    <div className={`w-32 h-32 rounded-full border-4 ${isActive ? 'border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.3)]' : 'border-zinc-700'} p-1`}>
                        <PlayerAvatar player={player} size="xl" className="w-full h-full" />
                    </div>
                    <div className="absolute bottom-1 right-1 bg-zinc-800 border border-white/10 rounded-full w-10 h-10 flex items-center justify-center font-bold text-teal-400 text-sm">
                        {player.rating || player.battingSkill}
                    </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs text-white uppercase font-bold">
                            <span className="opacity-40">R:</span>
                            <span className="text-lg">{performance.runs}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white uppercase font-bold">
                            <span className="opacity-40">B:</span>
                            <span className="text-lg">{performance.balls}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white uppercase font-bold">
                            <span className="opacity-40">4s:</span>
                            <span className="text-lg">{performance.fours}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white uppercase font-bold">
                            <span className="opacity-40">6s:</span>
                            <span className="text-lg">{performance.sixes}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs text-white uppercase font-bold">
                            <span className="opacity-40">S/R:</span>
                            <span className="text-lg">{performance.balls > 0 ? ((performance.runs / performance.balls) * 100).toFixed(1) : '0.0'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Graph */}
            <div className="h-16 w-full -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
                                <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <Area
                            type="monotone"
                            dataKey="val"
                            stroke="#14b8a6"
                            strokeWidth={2}
                            fillOpacity={1}
                            fill="url(#areaGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-between mt-2">
                {/* Batting Stance Visualization */}
                <div className="w-20 h-24 relative flex items-center justify-center grayscale opacity-80 scale-125">
                   <svg width="40" height="60" viewBox="0 0 40 60" fill="none">
                        <circle cx="20" cy="10" r="4" fill="white" />
                        <path d="M20 14V35" stroke="white" strokeWidth="3" />
                        <path d="M20 18L10 30L5 45" stroke="white" strokeWidth="2" />
                        <path d="M20 18L30 30" stroke="white" strokeWidth="2" />
                        <path d="M20 35L15 50L13 58" stroke="white" strokeWidth="2" />
                        <path d="M20 35L25 50L27 58" stroke="white" strokeWidth="2" />
                        <path d="M5 45L4 48" stroke="#14b8a6" strokeWidth="4" />
                   </svg>
                </div>

                {/* Radar Chart */}
                <RadarChart values={radarValues} size={80} />
            </div>
        </div>
    );
};

const FieldingView = ({ matchType }: { matchType: string }) => {
    return (
        <div className="bg-neutral-900 ring-1 ring-white/10 rounded-[2rem] p-4 flex flex-col gap-3">
            <div className="flex flex-col">
                <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">LIVE FIELD_STREAM</span>
                <span className="text-sm text-white/80 font-medium">Offside Heavy / Inner Ring 6 / Outer 3</span>
            </div>

            <div className="relative aspect-square w-full max-w-[200px] mx-auto">
                 <svg viewBox="0 0 100 100" className="w-full h-full">
                    {/* Outer Circle */}
                    <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.05)" strokeDasharray="2 2" />
                    {/* Inner Circle */}
                    <circle cx="50" cy="50" r="30" fill="none" stroke="rgba(255,255,255,0.1)" strokeDasharray="4 4" />
                    {/* Pitch */}
                    <rect x="47" y="40" width="6" height="20" fill="rgba(255,255,255,0.1)" rx="1" />
                    
                    {/* Fielder Dots */}
                    {[
                        { x: 50, y: 15, label: "Fine Leg" },
                        { x: 80, y: 30, label: "Point" },
                        { x: 85, y: 55, label: "Cover" },
                        { x: 70, y: 80, label: "Mid Off" },
                        { x: 30, y: 80, label: "Mid On" },
                        { x: 15, y: 55, label: "Mid Wicket" },
                        { x: 20, y: 30, label: "Square Leg" },
                        { x: 50, y: 85, label: "Long Off" },
                    ].map((f, i) => (
                        <circle key={i} cx={f.x} cy={f.y} r="2" fill="#14b8a6" />
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

    return (
        <div className="flex-1 flex bg-[#050808] p-4 gap-4 overflow-hidden">
            {/* Left Column: Batsmen Info */}
            <div className="w-[38%] flex flex-col gap-4 overflow-y-auto scrollbar-hide">
                {strikerPlayer && striker && (
                    <BatsmanCard player={strikerPlayer} performance={striker} isActive={true} />
                )}
                {nonStrikerPlayer && nonStriker && (
                    <BatsmanCard player={nonStrikerPlayer} performance={nonStriker} isActive={false} />
                )}
            </div>

            {/* Right Column: Scoreboard & Controls */}
            <div className="flex-1 flex flex-col gap-4">
                {/* Top Scorebox */}
                <div className="bg-neutral-900/80 border border-white/5 rounded-[2.5rem] p-6 flex items-center justify-between shadow-2xl">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center overflow-hidden border border-white/10">
                            <div className="w-8 h-8 opacity-40 uppercase font-black text-xs flex items-center justify-center">
                                LOGO
                            </div>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-white text-3xl font-black italic uppercase tracking-tighter">
                                {state.battingTeam.name}: <span className="text-white">{currentInning.score}/{currentInning.wickets}</span>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Main Dashboard Area */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                    {/* Left Panel of Right Side */}
                    <div className="flex flex-col gap-4">
                        <div className="bg-neutral-900/60 ring-1 ring-white/5 rounded-[2rem] p-4 space-y-2">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">Match Context</span>
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-white/80">1st Inning Limit: <span className="text-white">120</span></p>
                                <p className="text-xs font-bold text-white/80">Balls Remaining | Projected: <span className="text-white">{maxOvers * 6 - (Math.floor(parseFloat(currentInning.overs)) * 6 + Math.round((parseFloat(currentInning.overs) % 1) * 10))}</span></p>
                            </div>
                        </div>

                        <div className="bg-neutral-900/60 ring-1 ring-white/5 rounded-[2rem] p-4 flex flex-col gap-2">
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest uppercase">Active Players</span>
                            <div className="flex items-center gap-3 bg-black/30 p-2 rounded-xl">
                                <div className="w-10 h-10 rounded-full border border-teal-500 overflow-hidden p-0.5">
                                    {bowlerPlayer && <PlayerAvatar player={bowlerPlayer} size="sm" />}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-white font-black uppercase italic tracking-tighter">{bowlerPlayer?.name} [{bowlerPlayer?.rating || 85}]</span>
                                    <span className="text-[8px] text-white/20 font-black uppercase">CURRENT BOWLER</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-neutral-900/60 ring-1 ring-white/5 rounded-[2rem] p-4">
                            <span className="text-[10px] text-white/30 font-black uppercase tracking-widest block mb-2">RECENT BALLS (last 6)</span>
                            <div className="flex gap-2">
                                {state.recentBalls.slice(0, 6).reverse().map((b, i) => (
                                    <div key={i} className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs border ${
                                        b === '4' || b === '6' ? 'bg-teal-500 border-teal-400 text-black' : 
                                        b === 'W' ? 'bg-red-500 border-red-400 text-white' : 
                                        'bg-white/5 border-white/10 text-white/60'
                                    }`}>
                                        {b}
                                    </div>
                                ))}
                                {state.recentBalls.length === 0 && <span className="text-white/20 text-xs font-mono">- - - - - -</span>}
                            </div>
                        </div>
                    </div>

                    {/* Right Panel (Fielding) */}
                    <div className="flex flex-col gap-4">
                        <FieldingView matchType={state.match.group} />
                        
                        <div className="bg-neutral-900/60 ring-1 ring-white/5 rounded-[2rem] p-4">
                             <div className="flex justify-between items-center mb-2">
                                 <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">LAST BALL:</span>
                                 <span className="text-xs text-teal-400 font-bold uppercase">{state.commentary[0]?.split(':')?.[1]?.trim() || 'Match Start'}</span>
                             </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Control Bar */}
                <div className="mt-auto flex flex-col gap-4">
                    {/* Strategy Toggles */}
                    <div className="bg-neutral-900/60 ring-1 ring-white/10 rounded-[2rem] p-4 flex items-center justify-between">
                         <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">BAT STRATEGY</span>
                         <div className="flex bg-black/40 rounded-full p-1 border border-white/5">
                            {(['defensive', 'balanced', 'attacking'] as Strategy[]).map(s => (
                                <button
                                    key={s}
                                    onClick={() => onSetBattingStrategy(s)}
                                    className={`px-6 py-2 text-[10px] uppercase font-black rounded-full transition-all ${state.strategies.batting === s 
                                        ? 'bg-teal-500 text-black shadow-lg' 
                                        : 'text-white/20 hover:text-white/40'}`}
                                >
                                    {s.slice(0, 3)}
                                </button>
                            ))}
                         </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={onPlayBall}
                            className="bg-neutral-800/80 hover:bg-neutral-700/80 text-white border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                            <Icons.Zap className="w-8 h-8 text-teal-500 group-hover:scale-125 transition-transform" />
                            <span className="font-black italic uppercase tracking-tighter text-xl">OVER</span>
                        </motion.button>
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={onShowMatchCentre}
                            className="bg-neutral-800/80 hover:bg-neutral-700/80 text-white border border-white/10 p-8 rounded-[2.5rem] flex flex-col items-center justify-center gap-2 group transition-all"
                        >
                            <Icons.LayoutDashboard className="w-8 h-8 text-white/40 group-hover:scale-125 transition-transform" />
                            <span className="font-black italic uppercase tracking-tighter text-xl">CENTRE</span>
                        </motion.button>
                    </div>
                </div>
            </div>
        </div>
    );
};
