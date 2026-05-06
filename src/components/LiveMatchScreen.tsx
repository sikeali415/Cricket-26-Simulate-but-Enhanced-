import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';
import { useSimulation } from '../hooks/useSimulation';
import { Player } from '../types';

const PlayerStatBox = ({ label, value }: { label: string, value: string | number }) => (
  <div className="flex flex-col items-center justify-center p-2 bg-charcoal-900/50 border border-white/5 rounded-lg">
    <span className="text-[10px] font-black text-white/30 uppercase tracking-widest">{label}</span>
    <span className="text-lg font-black text-white italic">{value}</span>
  </div>
);

const BatsmanCard = ({ player, isActive, stats }: { player: Player, isActive: boolean, stats: any }) => (
  <div className={`p-5 rounded-2xl border transition-all duration-500 ${isActive ? 'bg-brand-teal/5 border-brand-teal/30 shadow-[0_0_30px_rgba(20,184,166,0.1)]' : 'bg-charcoal-800/40 border-white/5 opacity-60'}`}>
    <div className="flex items-center justify-between mb-4">
      <h3 className={`text-base font-black italic uppercase tracking-tighter ${isActive ? 'text-brand-teal' : 'text-white/40'}`}>
        {isActive ? 'STRIKER' : 'NON-STRIKER'}
      </h3>
      {isActive && <div className="w-2 h-2 rounded-full bg-brand-teal animate-pulse" />}
    </div>
    
    <div className="flex items-center gap-4 mb-6">
      <PlayerAvatar player={player} size="lg" />
      <div>
        <h4 className="text-xl font-black text-white italic uppercase tracking-tight leading-none group-hover:text-brand-teal transition-colors">
          {player.name}
        </h4>
        <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">Manager_Core_ID_{player.id}</span>
      </div>
    </div>

    <div className="grid grid-cols-4 gap-2">
      <PlayerStatBox label="RUNS" value={stats.runs} />
      <PlayerStatBox label="BALLS" value={stats.balls} />
      <PlayerStatBox label="S.RATE" value={stats.balls > 0 ? ((stats.runs / stats.balls) * 100).toFixed(0) : '0'} />
      <PlayerStatBox label="CONF" value={`${player.confidence}%`} />
    </div>
  </div>
);

import { Team } from '../types';

export const LiveMatchScreen = ({ teamA, teamB, onExit }: { teamA: Team, teamB: Team, onExit: (result?: any) => void }) => {
  const { state, striker, nonStriker, bowler, playBall, setAggression, getPlayerStats, finishMatch } = useSimulation(teamA, teamB, onExit);

  const strikerStats = getPlayerStats(striker.id);
  const nonStrikerStats = getPlayerStats(nonStriker.id);
  const bowlerStats = getPlayerStats(bowler.id);

  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col p-6 gap-6 overflow-hidden">
      {/* Top Header */}
      <header className="flex items-center justify-between bg-charcoal-900 p-4 border border-white/10 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-brand-teal/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="flex items-center gap-4 relative z-10">
          <div className="w-10 h-10 bg-brand-teal rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(20,184,166,0.3)]">
            <span className="text-black font-black text-xl italic">SC</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.3em]">Simulation Cricket</span>
              <span className="px-1.5 py-0.5 bg-white/5 border border-white/10 rounded text-[6px] font-mono text-white/20">v.0.0.1.1 EA</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-1 relative z-10">
          <div className="flex items-center gap-3">
             <div className="flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/20 rounded-full">
               <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
               <span className="text-[7px] font-black text-red-500 uppercase tracking-widest">LIVE</span>
             </div>
             <h2 className="text-xl font-black italic uppercase tracking-tighter text-white">
               {state.battingTeam.name} <span className="text-white/20 not-italic mx-2 text-xs">v</span> {state.bowlingTeam.name}
             </h2>
          </div>
          {state.target && (
            <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.2em]">Target: {state.target + 1} ({state.target - state.score + 1} needed off {(120 - (parseFloat(state.overs)*6)).toFixed(0)} balls)</span>
          )}
        </div>

        <div className="flex items-center gap-4 relative z-10">
          <div className="bg-charcoal-950 px-4 py-2 rounded-xl border border-white/10 flex flex-col items-center">
            <p className="text-[7px] font-black text-white/30 uppercase tracking-[0.4em] mb-0.5">OVERS</p>
            <p className="text-2xl font-black text-brand-teal tracking-tighter leading-none">{state.overs}</p>
          </div>
          <button 
            onClick={finishMatch}
            className="bg-white/5 hover:bg-white/10 text-[10px] font-black text-white/60 tracking-widest px-6 py-3 rounded-xl border border-white/10 transition-all uppercase italic"
          >
            {state.status === 'completed' ? 'FINISH' : 'FORFEIT'}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-12 gap-6 overflow-hidden">
        {/* Left Column: Batsmen */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto scrollbar-hide pr-1">
          <BatsmanCard player={striker} isActive={true} stats={strikerStats} />
          <BatsmanCard player={nonStriker} isActive={false} stats={nonStrikerStats} />
          
          <div className="bg-charcoal-900/40 border border-white/5 rounded-2xl p-5 mt-auto">
             <h3 className="text-[10px] font-black text-brand-teal uppercase tracking-[0.3em] mb-4">MATCH_HISTORY</h3>
             <div className="flex flex-wrap gap-2">
               {state.recentBalls.map((ball, i) => (
                 <div 
                   key={i} 
                   className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs border ${
                     ball === 'W' ? 'bg-red-500 border-red-400 text-white' :
                     ball === '4' || ball === '6' ? 'bg-brand-teal border-brand-teal text-black shadow-[0_0_15px_rgba(20,184,166,0.3)]' :
                     'bg-white/5 border-white/10 text-white/40'
                   }`}
                 >
                   {ball}
                 </div>
               ))}
               {state.recentBalls.length === 0 && Array.from({length:6}).map((_,i) => (
                 <div key={i} className="w-8 h-8 rounded-lg border border-white/5 bg-white/[0.02]" />
               ))}
             </div>
          </div>
        </div>

        {/* Center Column: Gameplay & Visuals */}
        <div className="col-span-6 flex flex-col gap-6">
          <div className="bg-charcoal-900 border border-white/10 rounded-[2.5rem] p-10 flex flex-col items-center relative overflow-hidden flex-1 shadow-[0_40px_100px_rgba(0,0,0,0.5)]">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 p-12 opacity-5 rotate-12 scale-150">
               <Icons.Activity className="w-64 h-64" />
            </div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square bg-[radial-gradient(circle,rgba(20,184,166,0.05)_0%,transparent_70%)] pointer-events-none" />
            
            <div className="text-center relative z-10 mb-10 w-full">
              <span className="text-[10px] font-black text-brand-teal uppercase tracking-[0.6em] mb-4 block animate-pulse">CURRENT_SESSION_MATCH</span>
              <div className="flex items-center justify-center gap-8">
                 <div className="flex flex-col items-end">
                    <span className="text-6xl font-black italic text-white leading-none">{state.score}</span>
                    <span className="text-sm font-black text-white/20 uppercase tracking-widest mt-1">RUNS_TOTAL</span>
                 </div>
                 <div className="text-7xl font-black text-brand-teal/20 italic select-none">/</div>
                 <div className="flex flex-col items-start">
                    <span className="text-6xl font-black italic text-white leading-none">{state.wickets}</span>
                    <span className="text-sm font-black text-white/20 uppercase tracking-widest mt-1">WICKETS_LOST</span>
                 </div>
              </div>
            </div>

            <div className="w-full flex items-center gap-4 mb-6">
               <div className="flex-1 h-px bg-gradient-to-r from-transparent to-white/10" />
               <div className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full">
                  <span className="text-[8px] font-black text-white/40 uppercase tracking-[0.4em]">LIVE_FEED</span>
               </div>
               <div className="flex-1 h-px bg-gradient-to-l from-transparent to-white/10" />
            </div>

            <div className="flex-1 w-full overflow-y-auto scrollbar-hide py-2 space-y-3 relative z-10">
               <AnimatePresence initial={false}>
                 {state.commentary.map((text, i) => (
                   <motion.div
                     key={i}
                     initial={{ opacity: 0, x: -10, filter: 'blur(5px)' }}
                     animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                     className={`p-4 rounded-2xl border transition-all ${
                       i === 0 
                         ? 'bg-brand-teal/5 border-brand-teal/30 text-white shadow-[0_0_20px_rgba(20,184,166,0.1)]' 
                         : 'bg-white/[0.02] border-transparent text-white/40 opacity-40'
                     }`}
                   >
                     <div className="flex items-start gap-4">
                        <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${i === 0 ? 'bg-brand-teal shadow-[0_0_10px_#14b8a6]' : 'bg-white/10'}`} />
                        <p className={`text-base font-black italic tracking-tight uppercase leading-relaxed ${i === 0 ? 'text-brand-teal' : ''}`}>
                          {text}
                        </p>
                     </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
               {/* Vignette fade */}
               <div className="absolute bottom-0 left-0 w-full h-12 bg-gradient-to-t from-charcoal-900 to-transparent pointer-events-none" />
            </div>

            <div className="w-full grid grid-cols-12 gap-6 mt-10 relative z-10 items-stretch">
               <div className="col-span-5 bg-charcoal-950 border border-white/5 rounded-3xl p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[9px] font-black text-white/30 uppercase tracking-widest leading-none">AGGRESSION_CONTROL</span>
                      <Icons.Activity className="w-3 h-3 text-brand-teal" />
                    </div>
                    <div className="flex gap-2 mb-4">
                      {[1,2,3,4,5].map(v => (
                        <button 
                          key={v}
                          onClick={() => setAggression(v)}
                          className={`flex-1 h-3 rounded-xl transition-all duration-300 border ${
                            state.aggression >= v 
                              ? 'bg-brand-teal border-brand-teal shadow-[0_0_15px_rgba(20,184,166,0.4)]' 
                              : 'bg-white/5 border-white/5 hover:bg-white/10'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-between text-[7px] font-black text-white/20 uppercase tracking-[0.2em]">
                    <span>DEFENSIVE</span>
                    <span>BALANCED</span>
                    <span>AGGRESSIVE</span>
                  </div>
               </div>

               <motion.button
                 whileTap={{ scale: 0.95 }}
                 onClick={playBall}
                 className="col-span-7 bg-brand-teal text-black rounded-3xl flex items-center justify-center gap-6 border border-black shadow-[0_15px_50px_rgba(20,184,166,0.3)] group overflow-hidden relative"
               >
                 <div className="absolute inset-0 bg-white/30 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                 <Icons.Zap className="w-10 h-10 relative z-10 animate-bounce" />
                 <div className="flex flex-col items-start relative z-10">
                    <span className="text-4xl font-black italic uppercase tracking-tighter leading-none">PLAY BALL</span>
                    <span className="text-[8px] font-black uppercase tracking-[0.4em] opacity-60">NEXT_DELIVERY_READY</span>
                 </div>
               </motion.button>
            </div>
          </div>
        </div>

        {/* Right Column: Bowler & Field */}
        <div className="col-span-3 flex flex-col gap-6 overflow-y-auto scrollbar-hide">
          <div className="p-5 rounded-2xl border bg-charcoal-800/40 border-white/5">
            <h3 className="text-base font-black italic uppercase tracking-tighter text-white/40 mb-4">CURRENT_BOWLER</h3>
            <div className="flex items-center gap-4 mb-6">
              <PlayerAvatar player={bowler} size="lg" className="border-red-500/30" />
              <div>
                <h4 className="text-xl font-black text-white italic uppercase tracking-tight leading-none group-hover:text-red-500 transition-colors">
                  {bowler.name}
                </h4>
                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em]">{bowler.role}</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <PlayerStatBox label="WICKETS" value={bowlerStats.wickets} />
              <PlayerStatBox label="RUNS" value={bowlerStats.runsConceded} />
              <PlayerStatBox label="OVERS" value={bowlerStats.overs.toFixed(1)} />
              <PlayerStatBox label="ECON" value={bowlerStats.overs > 0 ? (bowlerStats.runsConceded / bowlerStats.overs).toFixed(1) : '0.0'} />
            </div>
          </div>

          <div className="bg-charcoal-900 border border-white/10 rounded-2xl p-6 flex flex-col items-center gap-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.05)_0%,transparent_70%)]" />
            <div className="w-full flex justify-between items-start relative z-10">
              <div className="flex flex-col">
                <span className="text-[8px] text-brand-teal font-black uppercase tracking-[0.3em] mb-1">LIVE_FIELD_MAP</span>
                <span className="text-sm text-white font-black italic tracking-tighter">Offside Heavy / Balanced</span>
              </div>
              <Icons.Target className="w-4 h-4 text-brand-teal/40" />
            </div>

            <div className="relative w-full aspect-square flex items-center justify-center p-4">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_20px_rgba(20,184,166,0.1)]">
                <circle cx="50" cy="50" r="48" fill="#030712" stroke="rgba(255,255,255,0.05)" strokeDasharray="1 1" />
                <circle cx="50" cy="50" r="32" fill="none" stroke="rgba(20,184,166,0.2)" strokeWidth="0.5" />
                <circle cx="50" cy="50" r="22" fill="none" stroke="rgba(20,184,166,0.4)" strokeWidth="0.5" />
                <rect x="46" y="40" width="8" height="20" fill="#f59e0b" rx="1.5" fillOpacity="0.4" />
                
                {[
                  { x: 50, y: 10 }, { x: 85, y: 30 }, { x: 15, y: 30 },
                  { x: 90, y: 55 }, { x: 10, y: 55 }, { x: 70, y: 85 },
                  { x: 30, y: 85 }, { x: 50, y: 92 }, { x: 80, y: 15 }
                ].map((pos, i) => (
                  <circle 
                    key={i} 
                    cx={pos.x} 
                    cy={pos.y} 
                    r="2" 
                    fill="#14b8a6" 
                    className="animate-pulse" 
                    style={{ animationDelay: `${i * 200}ms` }}
                  />
                ))}
              </svg>
            </div>
          </div>
          
          <div className="p-5 rounded-2xl border bg-brand-teal/5 border-brand-teal/10 mt-auto">
             <div className="flex items-center justify-between mb-4">
               <span className="text-[10px] font-black text-brand-teal uppercase tracking-widest">TEAM_PERF</span>
               <Icons.Activity className="w-4 h-4 text-brand-teal" />
             </div>
             <div className="space-y-4">
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] font-bold text-white/40">
                   <span>WIN_PROBABILITY</span>
                   <span className="text-brand-teal">64%</span>
                 </div>
                 <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                   <div className="h-full bg-brand-teal glow-teal" style={{ width: '64%' }} />
                 </div>
               </div>
               <div className="space-y-1">
                 <div className="flex justify-between text-[10px] font-bold text-white/40">
                   <span>PROJECTED_SCORE</span>
                   <span className="text-white">184</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </main>

      {/* Bottom Nav Simulation */}
      <footer className="h-16 flex items-center justify-around bg-charcoal-900 border-t border-white/5 mx-[-24px] px-6">
        {[
          { icon: Icons.Users, label: 'DASHBOARD' },
          { icon: Icons.Activity, label: 'ANALYTICS' },
          { icon: Icons.Trophy, label: 'LEAGUES' },
          { icon: Icons.Target, label: 'TACTICS' },
          { icon: Icons.Shield, label: 'OFFICE' }
        ].map((item, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 cursor-pointer transition-all ${i === 3 ? 'text-brand-teal' : 'text-white/20 hover:text-white/40'}`}>
            <item.icon className="w-5 h-5" />
            <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
          </div>
        ))}
      </footer>
    </div>
  );
};
