import React, { useState, useMemo, useCallback } from 'react';
import { Search, Filter, UserPlus, UserMinus } from 'lucide-react';
import { GameData, Player, Team, PlayerRole } from '../types';
import { getRoleColor } from '../utils';

interface TransfersProps {
    gameData: GameData;
    userTeam: Team | null;
    setGameData: React.Dispatch<React.SetStateAction<GameData | null>>;
    showFeedback: (message: string, type?: 'success' | 'error') => void;
}

const Transfers: React.FC<TransfersProps> = ({ gameData, userTeam, setGameData, showFeedback }) => {
    const [leftTeamId, setLeftTeamId] = useState<string>(userTeam?.id || gameData.teams[0]?.id || '');
    const [rightTeamId, setRightTeamId] = useState<string>('FREE_AGENTS');
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<PlayerRole | 'ALL'>('ALL');
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'FOREIGN' | 'DOMESTIC'>('ALL');

    const leftTeam = useMemo(() => 
        gameData.teams.find(t => t.id === leftTeamId), 
    [gameData.teams, leftTeamId]);

    const rightTeam = useMemo(() => 
        gameData.teams.find(t => t.id === rightTeamId), 
    [gameData.teams, rightTeamId]);

    const freeAgents = useMemo(() => {
        // Find IDs of all players currently in a team squad
        const assignedPlayerIds = new Set(gameData.teams.flatMap(t => t.squad.map(p => p.id)));
        // A player is a free agent if they are NOT in any team's squad
        return gameData.allPlayers.filter(p => !assignedPlayerIds.has(p.id));
    }, [gameData.allPlayers, gameData.teams]);

    const filterList = useCallback((list: Player[]) => {
        return list.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || p.role === roleFilter;
            const matchesType = typeFilter === 'ALL' || (typeFilter === 'FOREIGN' ? p.isForeign : !p.isForeign);
            return matchesSearch && matchesRole && matchesType;
        }).sort((a, b) => (b.battingSkill + b.secondarySkill) - (a.battingSkill + a.secondarySkill));
    }, [searchQuery, roleFilter, typeFilter]);

    const leftList = useMemo(() => filterList(leftTeam?.squad || []), [leftTeam, filterList]);

    const rightList = useMemo(() => {
        if (rightTeamId === 'FREE_AGENTS') {
            return filterList(freeAgents);
        }
        return filterList(rightTeam?.squad || []);
    }, [rightTeamId, rightTeam, freeAgents, filterList]);

    const handleMove = (player: Player, fromId: string, toId: string) => {
        if (fromId === toId) return;

        // Restriction: No transfers after the first match of a tournament
        if (gameData.currentMatchIndex[gameData.currentFormat] > 0) {
            showFeedback("Transfers are closed once the tournament begins!", "error");
            return;
        }

        setGameData(prev => {
            if (!prev) return null;
            let newTeams = [...prev.teams];
            
            // 1. Remove from source
            if (fromId !== 'FREE_AGENTS') {
                newTeams = newTeams.map(t => {
                    if (t.id === fromId) {
                        return { ...t, squad: t.squad.filter(p => p.id !== player.id) };
                    }
                    return t;
                });
            }

            // 2. Safety: Remove from ALL squads just in case of logic drift
            newTeams = newTeams.map(t => {
                if (t.id !== toId) {
                    return { ...t, squad: t.squad.filter(p => p.id !== player.id) };
                }
                return t;
            });

            // 3. Update player status
            const updatedPlayer = { 
                ...player,
                isFreeAgent: toId === 'FREE_AGENTS',
                currentTeamId: toId === 'FREE_AGENTS' ? undefined : toId
            };

            // 4. Add to destination
            if (toId !== 'FREE_AGENTS') {
                newTeams = newTeams.map(t => {
                    if (t.id === toId) {
                        // Check if already in squad somehow
                        if (t.squad.some(p => p.id === player.id)) return t;
                        return { ...t, squad: [...t.squad, updatedPlayer] };
                    }
                    return t;
                });
            }

            // 5. Update global allPlayers list
            const newAllPlayers = prev.allPlayers.map(p => p.id === player.id ? updatedPlayer : p);

            return { ...prev, teams: newTeams, allPlayers: newAllPlayers };
        });

        const fromName = fromId === 'FREE_AGENTS' ? 'Free Agents' : gameData.teams.find(t => t.id === fromId)?.name;
        const toName = toId === 'FREE_AGENTS' ? 'Free Agents' : gameData.teams.find(t => t.id === toId)?.name;
        showFeedback(`Moved ${player.name} from ${fromName} to ${toName}`, "success");
    };

    return (
        <div className="min-h-full flex flex-col bg-[#0a0f0f] text-gray-100 font-sans">
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-black/40 sticky top-0 z-20 backdrop-blur-md">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-xl font-black tracking-tighter uppercase italic text-teal-500">TRANSFER MARKET</h1>
                        <p className="text-[8px] font-bold opacity-40 uppercase tracking-widest">Move players between squads or sign free agents</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="mt-4 flex flex-wrap gap-2">
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 overflow-x-auto no-scrollbar">
                        {['ALL', ...Object.values(PlayerRole)].map(role => (
                            <button
                                key={role}
                                onClick={() => setRoleFilter(role as any)}
                                className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${roleFilter === role ? 'bg-teal-500 text-black' : 'text-white/40 hover:bg-white/5'}`}
                            >
                                {role}
                            </button>
                        ))}
                    </div>
                    <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                        {['ALL', 'DOMESTIC', 'FOREIGN'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type as any)}
                                className={`px-3 py-1 rounded-md text-[8px] font-black uppercase tracking-widest transition-all ${typeFilter === type ? 'bg-teal-500 text-black' : 'text-white/40 hover:bg-white/5'}`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Main Content: Two Columns */}
            <div className="flex-1 flex flex-row overflow-hidden">
                {/* Left Column */}
                <div className="flex-1 flex flex-col border-r border-white/10">
                    <div className="p-4 bg-white/5 border-b border-white/5 space-y-3 sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">SOURCE</h2>
                            <span className="text-[8px] md:text-[10px] font-bold text-teal-500">{leftTeam?.purse.toFixed(2)} CR</span>
                        </div>
                        <select 
                            value={leftTeamId}
                            onChange={(e) => setLeftTeamId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] md:text-sm font-bold focus:outline-none focus:border-teal-500 appearance-none"
                        >
                            {gameData.teams.map(t => (
                                <option key={t.id} value={t.id} className="bg-[#0a0f0f]">{t.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-1 scrollbar-hide">
                        {leftList.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-1.5 md:p-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
                                <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
                                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-black text-[8px] md:text-xs ${getRoleColor(player.role)} bg-white/5 shrink-0`}>
                                        {player.name[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] md:text-xs font-bold leading-none mb-0.5 md:mb-1 truncate">
                                            {player.name}
                                        </p>
                                        <p className="text-[7px] md:text-[9px] font-bold opacity-40 uppercase">{player.role}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleMove(player, leftTeamId, rightTeamId)}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-black flex items-center justify-center transition-all shrink-0"
                                >
                                    <UserPlus className="w-3 md:w-3.5 h-3 md:h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col bg-black/10">
                    <div className="p-4 bg-white/5 border-b border-white/5 space-y-3 sticky top-0 z-10 backdrop-blur-md">
                        <div className="flex justify-between items-center">
                            <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-white/40">MARKET</h2>
                            {rightTeam && <span className="text-[8px] md:text-[10px] font-bold text-teal-500">{rightTeam.purse.toFixed(2)} CR</span>}
                        </div>
                        <select 
                            value={rightTeamId}
                            onChange={(e) => setRightTeamId(e.target.value)}
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] md:text-sm font-bold focus:outline-none focus:border-teal-500 appearance-none"
                        >
                            <option value="FREE_AGENTS" className="bg-[#0a0f0f]">FREE AGENTS</option>
                            {gameData.teams.map(t => (
                                <option key={t.id} value={t.id} className="bg-[#0a0f0f]">{t.name}</option>
                            ))}
                        </select>
                        <div className="relative">
                            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-2.5 h-2.5 opacity-20" />
                            <input 
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-1 pl-6 pr-2 text-[9px] md:text-[11px] focus:outline-none focus:border-teal-500 transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-1 md:p-2 space-y-1 scrollbar-hide">
                        {rightList.map(player => (
                            <div key={player.id} className="flex items-center justify-between p-1.5 md:p-2 bg-white/[0.02] hover:bg-white/[0.05] rounded-lg border border-white/5 transition-colors group">
                                <div className="flex items-center gap-1.5 md:gap-2 overflow-hidden">
                                    <div className={`w-6 h-6 md:w-7 md:h-7 rounded flex items-center justify-center font-black text-[8px] md:text-xs ${getRoleColor(player.role)} bg-white/5 shrink-0`}>
                                        {player.name[0]}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-[9px] md:text-xs font-bold leading-none mb-0.5 md:mb-1 truncate">
                                            {player.name}
                                        </p>
                                        <p className="text-[7px] md:text-[9px] font-bold opacity-40 uppercase">{player.role}</p>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleMove(player, rightTeamId, leftTeamId)}
                                    className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-teal-500/10 text-teal-500 hover:bg-teal-500 hover:text-black flex items-center justify-center transition-all shrink-0"
                                >
                                    <UserPlus className="w-3 md:w-3.5 h-3 md:h-3.5 rotate-180" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Transfers;
