import React from 'react';
import { motion } from 'framer-motion';
import { Icons } from './Icons';
import { Fixture, TeamStats, TournamentPhase } from '../types';
import { TEAMS } from '../data';

interface TournamentScreenProps {
  phase: TournamentPhase;
  standaloneStandings: any[];
  fixtures: Fixture[];
  onStartMatch: (id: string) => void;
  version: string;
}

export const TournamentScreen: React.FC<TournamentScreenProps> = ({ 
  phase, 
  standaloneStandings, 
  fixtures, 
  onStartMatch,
  version
}) => {
  return (
    <div className="min-h-screen bg-charcoal-950 flex flex-col p-6 gap-8">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-brand-teal rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-black font-black text-2xl italic">SC</span>
          </div>
          <div>
            <h1 className="text-2xl font-black italic uppercase tracking-tighter text-white leading-none">Tournament Dashboard</h1>
            <span className="text-[10px] font-black text-white/30 uppercase tracking-[0.3em]">{version}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           <div className="px-5 py-2 bg-white/5 border border-white/10 rounded-xl flex flex-col items-center">
             <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">CURRENT_PHASE</span>
             <span className="text-sm font-black text-brand-teal uppercase italic">{phase}</span>
           </div>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-12 gap-8 overflow-hidden">
        {/* Standings List */}
        <div className="col-span-4 flex flex-col gap-4">
           <div className="flex items-center justify-between px-2">
             <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest">Points Table</h3>
             <Icons.Activity className="w-4 h-4 text-brand-teal/40" />
           </div>
           
           <div className="bg-charcoal-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
             <table className="w-full text-left">
               <thead>
                 <tr className="bg-white/5 text-[9px] font-black text-white/40 uppercase tracking-widest">
                   <th className="px-4 py-3">Team</th>
                   <th className="px-2 py-3">P</th>
                   <th className="px-2 py-3">W</th>
                   <th className="px-2 py-3">PTS</th>
                   <th className="px-2 py-3">NRR</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-white/5">
                 {standaloneStandings.map((item, i) => (
                   <tr key={item.team.id} className="hover:bg-white/[0.02] transition-colors">
                     <td className="px-4 py-3 flex items-center gap-3">
                        <span className="text-[10px] font-black text-white/20 w-3">{i+1}</span>
                        <div 
                          className="w-6 h-6 rounded flex items-center justify-center text-[10px] font-black text-black"
                          style={{ backgroundColor: item.team.primaryColor }}
                        >
                          {item.team.logo}
                        </div>
                        <span className="text-xs font-black text-white uppercase italic truncate max-w-[100px]">{item.team.name}</span>
                     </td>
                     <td className="px-2 py-3 text-xs font-mono text-white/60">{item.stats.played}</td>
                     <td className="px-2 py-3 text-xs font-mono text-white/60">{item.stats.won}</td>
                     <td className="px-2 py-3 text-xs font-black text-brand-teal">{item.stats.pts}</td>
                     <td className="px-2 py-3 text-[10px] font-mono text-white/40">{item.stats.nrr.toFixed(3)}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
           
           <div className="mt-auto p-4 bg-brand-teal/5 border border-brand-teal/10 rounded-2xl">
              <p className="text-[9px] font-black text-brand-teal/60 uppercase tracking-widest leading-relaxed">
                {phase === 'qualifiers' ? "Top 2 teams will qualify for the main league. Every team plays 4 matches." : "Top 4 teams automatically qualify for the next major tournament."}
              </p>
           </div>
        </div>

        {/* Fixtures List */}
        <div className="col-span-8 flex flex-col gap-4 overflow-hidden">
           <div className="flex items-center justify-between px-2">
             <h3 className="text-xs font-black text-brand-teal uppercase tracking-widest">Upcoming & Past Fixtures</h3>
             <Icons.Zap className="w-4 h-4 text-brand-teal/40" />
           </div>

           <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-hide">
              {fixtures.map((fixture) => {
                const teamA = TEAMS.find(t => t.id === fixture.teamAId)!;
                const teamB = TEAMS.find(t => t.id === fixture.teamBId)!;
                const isCompleted = fixture.status === 'completed';

                return (
                  <motion.div 
                    key={fixture.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isCompleted ? 'bg-charcoal-900/40 border-white/5 opacity-60' : 'bg-charcoal-900 border-white/10 hover:border-brand-teal/30 hover:bg-charcoal-800'
                    }`}
                  >
                    <div className="flex items-center gap-6 flex-1">
                      <div className="flex flex-col items-center gap-1 w-20">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-xl" style={{ backgroundColor: teamA.primaryColor }}>
                          {teamA.logo}
                        </div>
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter truncate w-full text-center">{teamA.name}</span>
                      </div>
                      
                      <div className="flex flex-col items-center gap-2">
                         {isCompleted ? (
                           <div className="flex items-center gap-4">
                             <span className="text-xl font-black text-white italic">{fixture.scoreA}/{fixture.wicketsA}</span>
                             <span className="text-[10px] font-black text-white/20 uppercase">VS</span>
                             <span className="text-xl font-black text-white italic">{fixture.scoreB}/{fixture.wicketsB}</span>
                           </div>
                         ) : (
                           <span className="text-sm font-black text-white/10 uppercase tracking-[0.4em]">STADIUM_READY</span>
                         )}
                         <div className="px-3 py-1 bg-white/5 rounded-full">
                            <span className="text-[7px] font-black text-white/30 uppercase tracking-widest">MATCH_{fixture.id.toUpperCase()}</span>
                         </div>
                      </div>

                      <div className="flex flex-col items-center gap-1 w-20 ml-auto">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black font-black text-xl" style={{ backgroundColor: teamB.primaryColor }}>
                          {teamB.logo}
                        </div>
                        <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter truncate w-full text-center">{teamB.name}</span>
                      </div>
                    </div>

                    <div className="ml-8">
                       {!isCompleted ? (
                         <button 
                           onClick={() => onStartMatch(fixture.id)}
                           className="bg-brand-teal text-black px-6 py-2.5 rounded-xl font-black italic uppercase text-xs shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                         >
                           PLAY_MATCH
                           <Icons.ArrowRight className="w-3 h-3" />
                         </button>
                       ) : (
                         <div className="flex flex-col items-end">
                            <span className="text-[8px] font-black text-brand-teal uppercase tracking-widest">Winner</span>
                            <span className="text-xs font-black text-white italic truncate max-w-[80px]">
                              {fixture.winnerId === teamA.id ? teamA.name : teamB.name}
                            </span>
                         </div>
                       )}
                    </div>
                  </motion.div>
                );
              })}
           </div>
        </div>
      </div>
    </div>
  );
};
