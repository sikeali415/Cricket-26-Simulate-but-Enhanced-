
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player, Team, GameData, PlayerRole, Format } from '../types';
import { getRoleColor, getRoleFullName, aggregateStats } from '../utils';
import { Icons } from './Icons';
import { PlayerAvatar } from './PlayerAvatar';

interface AuctionRoomProps {
    gameData: GameData;
    onAuctionComplete: (finalTeams: Team[]) => void;
    onViewPlayer?: (player: Player) => void;
}

const AuctionRoom: React.FC<AuctionRoomProps> = ({ gameData, onAuctionComplete, onViewPlayer }) => {
    const [teams, setTeams] = useState<Team[]>(gameData.teams);
    const [availablePlayers, setAvailablePlayers] = useState<Player[]>(() => {
        const usedIds = new Set(gameData.teams.flatMap(t => t.squad.map(p => p.id)));
        const pool = gameData.allPlayers.filter(p => !usedIds.has(p.id));
        
        // Elite Players (80+)
        const elite = pool.filter(p => Math.max(p.battingSkill, p.secondarySkill) >= 80);
        const eliteNational = elite.filter(p => !p.isForeign).sort(() => Math.random() - 0.5);
        const eliteForeign = elite.filter(p => p.isForeign).sort(() => Math.random() - 0.5);

        const remaining = pool.filter(p => !elite.some(ep => ep.id === p.id));
        
        // Role Pools (Domestic)
        const domestic = remaining.filter(p => !p.isForeign);
        const batters = domestic.filter(p => p.role === PlayerRole.BATSMAN).sort(() => Math.random() - 0.5);
        const fastBowlers = domestic.filter(p => p.role === PlayerRole.FAST_BOWLER).sort(() => Math.random() - 0.5);
        const spinners = domestic.filter(p => p.role === PlayerRole.SPIN_BOWLER).sort(() => Math.random() - 0.5);
        const allRounders = domestic.filter(p => p.role === PlayerRole.ALL_ROUNDER || p.role === PlayerRole.WICKET_KEEPER).sort(() => Math.random() - 0.5);
        
        // Final Pool: Foreign
        const foreign = remaining.filter(p => p.isForeign).sort(() => Math.random() - 0.5);
        
        return [...eliteNational, ...eliteForeign, ...batters, ...fastBowlers, ...spinners, ...allRounders, ...foreign];
    });
    const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const [highestBidderId, setHighestBidderId] = useState<string | null>(null);
    const [isAuctioning, setIsAuctioning] = useState(false);
    const [showRosters, setShowRosters] = useState(false);
    const [auctionLog, setAuctionLog] = useState<string[]>(["Draft Room Initialized..."]);

    const currentPlayer = availablePlayers[currentPlayerIndex];
    const userTeam = teams.find(t => t.id === gameData.userTeamId);

    const getBasePrice = (player: Player): number => {
        const skill = Math.max(player.battingSkill, player.secondarySkill);
        if (skill >= 85) return 5.0;
        if (skill >= 80) return 3.0;
        if (skill >= 75) return 1.5;
        if (skill >= 70) return 0.75;
        return 0.25;
    };

    const startNextPlayer = useCallback(() => {
        if (currentPlayerIndex >= availablePlayers.length) {
            onAuctionComplete(teams);
            return;
        }
        const player = availablePlayers[currentPlayerIndex];
        const basePrice = getBasePrice(player);
        setCurrentBid(basePrice);
        setHighestBidderId(null);
        setIsAuctioning(true);
        setAuctionLog(prev => [`Bidding started for ${player.name} at ${basePrice} Cr`, ...prev.slice(0, 19)]);
    }, [currentPlayerIndex, availablePlayers, teams, onAuctionComplete]);

    useEffect(() => {
        if (!isAuctioning && currentPlayerIndex < availablePlayers.length) {
            const timer = setTimeout(startNextPlayer, 1500);
            return () => clearTimeout(timer);
        }
    }, [isAuctioning, currentPlayerIndex, availablePlayers.length, startNextPlayer]);

    const handleUserBid = (multiplier: number = 1) => {
        if (!userTeam || !isAuctioning) return;
        const bidAmount = currentBid + (0.25 * multiplier);
        if (userTeam.purse < bidAmount) return;

        setCurrentBid(bidAmount);
        setHighestBidderId(userTeam.id);
        setAuctionLog(prev => [`${userTeam.name} bid ${bidAmount.toFixed(2)} Cr`, ...prev.slice(0, 19)]);
    };

    const sellPlayer = useCallback(() => {
        if (!highestBidderId || !currentPlayer) return;

        const winningTeam = teams.find(t => t.id === highestBidderId);
        if (!winningTeam) return;

        const updatedTeams = teams.map(t => {
            if (t.id === highestBidderId) {
                return {
                    ...t,
                    purse: t.purse - currentBid,
                    squad: [...t.squad, currentPlayer]
                };
            }
            return t;
        });

        setTeams(updatedTeams);
        setAuctionLog(prev => [`SOLD! ${currentPlayer.name} to ${winningTeam.name} for ${currentBid.toFixed(2)} Cr`, ...prev.slice(0, 19)]);
        setIsAuctioning(false);
        setCurrentPlayerIndex(prev => prev + 1);
    }, [highestBidderId, currentPlayer, currentBid, teams]);

    const unsoldPlayer = useCallback(() => {
        if (!currentPlayer) return;
        setAuctionLog(prev => [`UNSOLD: ${currentPlayer.name}`, ...prev.slice(0, 19)]);
        setIsAuctioning(false);
        setCurrentPlayerIndex(prev => prev + 1);
    }, [currentPlayer]);

    // AI Bidding Logic
    useEffect(() => {
        if (isAuctioning && currentPlayer) {
            const aiTimer = setTimeout(() => {
                const otherTeams = teams.filter(t => t.id !== gameData.userTeamId && t.id !== highestBidderId);
                const potentialBidders = otherTeams.filter(t => {
                    const skill = Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill);
                    const maxBid = (skill / 100) * 12; // AI max bid logic increased for big players
                    
                    // Increased probability for higher rated players
                    const bidProbability = skill >= 85 ? 0.35 : (skill >= 80 ? 0.45 : 0.6);
                    
                    return t.purse > currentBid + 0.25 && currentBid < maxBid && Math.random() > bidProbability;
                });

                if (potentialBidders.length > 0) {
                    const bidder = potentialBidders[Math.floor(Math.random() * potentialBidders.length)];
                    const newBid = currentBid + 0.25;
                    setCurrentBid(newBid);
                    setHighestBidderId(bidder.id);
                    setAuctionLog(prev => [`${bidder.name} bid ${newBid.toFixed(2)} Cr`, ...prev.slice(0, 19)]);
                } else if (highestBidderId) {
                    // No more bids, sell after a delay
                    const sellTimer = setTimeout(sellPlayer, 2000);
                    return () => clearTimeout(sellTimer);
                } else {
                    // If elite player and no bids, force some AI interest if they have huge purse
                    const desperateBidder = otherTeams.find(t => 
                        t.purse > 20 && 
                        Math.max(currentPlayer.battingSkill, currentPlayer.secondarySkill) >= 80 && 
                        Math.random() > 0.3
                    );

                    if (desperateBidder) {
                        const newBid = currentBid;
                        setHighestBidderId(desperateBidder.id);
                        setAuctionLog(prev => [`${desperateBidder.name} opened bidding for ${currentPlayer.name} at ${currentBid.toFixed(2)} Cr`, ...prev.slice(0, 19)]);
                    } else {
                        // No bids at all, unsold after a delay
                        const unsoldTimer = setTimeout(unsoldPlayer, 3000);
                        return () => clearTimeout(unsoldTimer);
                    }
                }
            }, 1500 + Math.random() * 2000);

            return () => clearTimeout(aiTimer);
        }
    }, [isAuctioning, currentBid, highestBidderId, currentPlayer, teams, gameData.userTeamId, sellPlayer, unsoldPlayer]);

    const skipPlayer = () => {
        if (!isAuctioning || !currentPlayer) return;
        
        // Find AI teams that can afford the player and might want them
        const basePrice = getBasePrice(currentPlayer);
        const potentialAIBuyers = teams.filter(t => 
            t.id !== gameData.userTeamId && 
            t.purse >= basePrice && 
            t.squad.length < 22
        );

        if (potentialAIBuyers.length > 0) {
            // Pick a random AI team to "buy" the skipped player at base price
            const buyer = potentialAIBuyers[Math.floor(Math.random() * potentialAIBuyers.length)];
            
            const updatedTeams = teams.map(t => {
                if (t.id === buyer.id) {
                    return {
                        ...t,
                        purse: t.purse - basePrice,
                        squad: [...t.squad, currentPlayer]
                    };
                }
                return t;
            });

            setTeams(updatedTeams);
            setAuctionLog(prev => [`SKIPPED: ${currentPlayer.name} signed by ${buyer.name} for ${basePrice.toFixed(2)} Cr`, ...prev.slice(0, 19)]);
            setIsAuctioning(false);
            setCurrentPlayerIndex(prev => prev + 1);
        } else {
            unsoldPlayer();
        }
    };

    const autoSimulateAuction = () => {
        const globalRemainingPool = [...availablePlayers.slice(currentPlayerIndex)].sort(() => Math.random() - 0.5);
        const finalTeams = teams.map(t => {
            const squad = [...t.squad];
            let purse = t.purse;
            
            const targetSize = 16;
            const minPakistani = 7;
            
            while (squad.length < targetSize && globalRemainingPool.length > 0) {
                const pakistaniInSquad = squad.filter(p => !p.isForeign).length;
                const needPakistani = (targetSize - squad.length) <= (minPakistani - pakistaniInSquad);
                
                let playerIdx = -1;
                if (needPakistani) {
                    playerIdx = globalRemainingPool.findIndex(p => !p.isForeign);
                }
                
                if (playerIdx === -1) {
                    // Try to maintain role balance if not desperate for Pakistani players
                    const batters = squad.filter(p => p.role === PlayerRole.BATSMAN).length;
                    const bowlers = squad.filter(p => p.role === PlayerRole.FAST_BOWLER || p.role === PlayerRole.SPIN_BOWLER).length;
                    const keepers = squad.filter(p => p.role === PlayerRole.WICKET_KEEPER).length;
                    
                    let preferredRole: PlayerRole | null = null;
                    if (keepers < 1) preferredRole = PlayerRole.WICKET_KEEPER;
                    else if (batters < 5) preferredRole = PlayerRole.BATSMAN;
                    else if (bowlers < 5) preferredRole = PlayerRole.FAST_BOWLER;

                    if (preferredRole) {
                        playerIdx = globalRemainingPool.findIndex(p => p.role === preferredRole && (!needPakistani || !p.isForeign));
                    }
                }
                
                if (playerIdx === -1) playerIdx = 0;

                const p = globalRemainingPool.splice(playerIdx, 1)[0];
                const price = getBasePrice(p);
                
                if (purse >= price) {
                    squad.push(p);
                    purse -= price;
                }
            }
            return { ...t, squad, purse };
        });
        
        onAuctionComplete(finalTeams);
    };

    const finishAuction = () => {
        if (!userTeam) return;
        if (!isSquadValid) return;

        const globalRemainingPool = [...availablePlayers.slice(currentPlayerIndex)];
        // Auto-fill remaining AI teams to 16 members with min 7 Pakistani players
        const finalTeams = teams.map(t => {
            if (t.id === userTeam.id) return t;
            const squad = [...t.squad];
            let purse = t.purse;
            
            const targetSize = 16;
            const minPakistani = 7;

            while (squad.length < targetSize && globalRemainingPool.length > 0) {
                const pakistaniInSquad = squad.filter(p => !p.isForeign).length;
                const needPakistani = (targetSize - squad.length) <= (minPakistani - pakistaniInSquad);
                
                let playerIdx = -1;
                if (needPakistani) {
                    playerIdx = globalRemainingPool.findIndex(p => !p.isForeign);
                }
                if (playerIdx === -1) playerIdx = 0;

                const p = globalRemainingPool.splice(playerIdx, 1)[0];
                squad.push(p);
                purse -= 0.25;
            }
            return { ...t, squad, purse };
        });
        onAuctionComplete(finalTeams);
    };

    const pakistaniCount = userTeam ? userTeam.squad.filter(p => !p.isForeign).length : 0;
    const isSquadValid = userTeam && userTeam.squad.length === 16 && pakistaniCount >= 7;

    return (
        <div className="h-full flex flex-col bg-slate-950 text-white font-sans overflow-hidden">
            {/* Header */}
            <div className="p-4 bg-slate-900/80 border-b border-white/10 flex justify-between items-center">
                <div className="flex flex-col">
                    <span className="text-[10px] font-black text-teal-500 uppercase tracking-widest">Draft Room 2026</span>
                    <h1 className="text-xl font-black italic uppercase tracking-tighter">Player Auction</h1>
                </div>
                <div className="flex gap-2">
                    <button 
                        onClick={autoSimulateAuction}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-teal-500 font-black uppercase italic text-[10px] rounded-lg border border-teal-500/20 transition-all active:scale-95"
                    >
                        Auto Simulate
                    </button>
                    <button 
                        onClick={() => setShowRosters(true)}
                        className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors border border-white/10"
                    >
                        <Icons.Lineups className="w-5 h-5 text-teal-500" />
                    </button>
                    <button 
                        onClick={finishAuction}
                        disabled={!isSquadValid}
                        className={`px-4 py-2 font-black uppercase italic text-xs rounded-lg shadow-lg active:scale-95 transition-all ${isSquadValid ? 'bg-teal-500 text-black' : 'bg-white/5 text-white/20 cursor-not-allowed'}`}
                    >
                        Finish Auction
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-grow flex flex-col p-4 overflow-hidden">
                <AnimatePresence mode="wait">
                    {currentPlayer && (
                        <motion.div 
                            key={currentPlayer.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="flex-grow flex flex-col"
                        >
                            {/* Player Card */}
                            <div className="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 shadow-2xl border border-white/10 overflow-hidden mb-4">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Icons.Bot className="w-32 h-32" />
                                </div>
                                
                                <div className="flex items-start gap-6">
                                    <div className="w-24 h-24 bg-teal-500/20 rounded-2xl flex items-center justify-center border-2 border-teal-500/30 overflow-hidden">
                                        <PlayerAvatar player={currentPlayer} size="xl" />
                                    </div>
                                    <div className="flex-grow">
                                        <div className="flex items-center justify-between mb-1">
                                            <div className="flex items-center gap-2">
                                                <span className="px-2 py-0.5 bg-teal-500 text-black text-[10px] font-black uppercase rounded">
                                                    {currentPlayer.nationality}
                                                </span>
                                                {currentPlayer.isForeign && (
                                                    <span className="px-2 py-0.5 bg-pink-500 text-white text-[10px] font-black uppercase rounded">
                                                        Foreign
                                                    </span>
                                                )}
                                            </div>
                                            {onViewPlayer && (
                                                <button 
                                                    onClick={() => onViewPlayer(currentPlayer)}
                                                    className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all active:scale-95"
                                                    title="View Player Stats"
                                                >
                                                    <Icons.Info className="w-5 h-5 text-teal-500" />
                                                </button>
                                            )}
                                        </div>
                                        <h2 className="text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">
                                            {currentPlayer.name}
                                        </h2>
                                        <div className={`text-sm font-bold uppercase tracking-widest ${getRoleColor(currentPlayer.role)}`}>
                                            {getRoleFullName(currentPlayer.role)}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-6">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Batting</div>
                                        <div className="text-xl font-black italic">{currentPlayer.battingSkill}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Bowling</div>
                                        <div className="text-xl font-black italic">{currentPlayer.secondarySkill}</div>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                                        <div className="text-[10px] font-bold text-white/40 uppercase mb-1">Style</div>
                                        <div className="text-xl font-black italic">{currentPlayer.style}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Bidding Area */}
                            <div className="bg-slate-900 rounded-3xl p-6 border border-white/10 shadow-xl mb-4">
                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <div className="text-[10px] font-black text-teal-500 uppercase tracking-widest mb-1">Current Bid</div>
                                        <div className="text-5xl font-black italic tracking-tighter text-white">
                                            {currentBid.toFixed(2)} <span className="text-xl text-white/40">Cr</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Highest Bidder</div>
                                        <div className="text-lg font-black italic uppercase text-teal-500">
                                            {highestBidderId ? teams.find(t => t.id === highestBidderId)?.name : 'No Bids'}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-3">
                                    <button 
                                        onClick={() => handleUserBid(1)}
                                        disabled={!isAuctioning || (userTeam?.purse || 0) < currentBid + 0.25}
                                        className="bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-black py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-lg active:scale-95 transition-all"
                                    >
                                        Bid +0.25
                                    </button>
                                    <button 
                                        onClick={() => handleUserBid(4)}
                                        disabled={!isAuctioning || (userTeam?.purse || 0) < currentBid + 1.0}
                                        className="bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-lg active:scale-95 transition-all"
                                    >
                                        Bid +1.00
                                    </button>
                                    <button 
                                        onClick={skipPlayer}
                                        disabled={!isAuctioning}
                                        className="bg-white/10 hover:bg-white/20 disabled:opacity-50 text-white py-4 rounded-2xl font-black uppercase italic tracking-widest shadow-lg active:scale-95 transition-all border border-white/10"
                                    >
                                        Skip
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Log and Stats */}
                <div className="grid grid-cols-2 gap-4 h-48">
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/10 overflow-hidden flex flex-col">
                        <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-2">Auction Log</div>
                        <div className="flex-grow overflow-y-auto space-y-1 text-[10px] font-mono">
                            {auctionLog.map((log, i) => (
                                <div key={i} className={i === 0 ? "text-teal-400 font-bold" : "text-white/60"}>
                                    {log}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="bg-slate-900/50 rounded-2xl p-4 border border-white/10 flex flex-col justify-between">
                        <div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Your Purse</div>
                            <div className="text-2xl font-black italic tracking-tighter text-teal-500">
                                {userTeam?.purse.toFixed(2)} <span className="text-xs text-white/40">Cr</span>
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Squad Size</div>
                            <div className="text-2xl font-black italic tracking-tighter">
                                {userTeam?.squad.length} <span className="text-xs text-white/40">/ 16</span>
                            </div>
                            <div className="text-[8px] font-bold text-teal-500 uppercase mt-1">
                                Local: {userTeam?.squad.filter(p => !p.isForeign).length} / 7 MIN
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Rosters Overlay */}
            <AnimatePresence>
                {showRosters && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-slate-950/95 backdrop-blur-md p-4 flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter">Franchise Rosters</h2>
                            <button 
                                onClick={() => setShowRosters(false)}
                                className="p-2 bg-white/5 rounded-full"
                            >
                                <Icons.X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-grow overflow-y-auto space-y-8 pb-10">
                            {teams.map(team => (
                                <div key={team.id} className="bg-white/5 rounded-3xl p-6 border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="text-xl font-black italic uppercase tracking-tighter text-teal-500">{team.name}</h3>
                                        <div className="text-sm font-bold text-white/40">Purse: {team.purse.toFixed(2)} Cr</div>
                                    </div>
                                    {/* Two Columns Layout for Roster */}
                                    <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                        {team.squad.map((p, i) => (
                                            <div key={p.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg text-[10px] font-bold">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-white/20">{i + 1}</span>
                                                    <span className="truncate max-w-[80px]">{p.name}</span>
                                                </div>
                                                <span className={getRoleColor(p.role)}>{p.role.substring(0, 2)}</span>
                                            </div>
                                        ))}
                                        {team.squad.length === 0 && <div className="col-span-2 text-center text-white/20 py-4 italic">No players signed yet</div>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AuctionRoom;
