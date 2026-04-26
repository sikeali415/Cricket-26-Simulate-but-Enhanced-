
import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameData, Player, PlayerRole, Format, BattingStyle, ScoreLimits, Ground } from '../types';
import { getBatterTier, BATTING_PROFILES, getRoleColor, getRoleFullName, getBattingStyleLabel, BATTING_STYLE_OPTIONS } from '../utils';
import { PITCH_TYPES, generateInitialStats } from '../data';
import { PlayerAvatar } from './PlayerAvatar';
import AvatarSelector from './AvatarSelector';
import { storage } from '../firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Icons } from './Icons';

interface EditorProps {
    gameData: GameData;
    handleUpdatePlayer: (player: Player) => void;
    handleCreatePlayer: (player: Player) => void;
    handleUpdateGround: (code: string, updates: Partial<Ground> | string) => void;
    handleUpdateScoreLimits: (groundCode: string, format: Format, field: keyof ScoreLimits, value: any, inning: number) => void;
}

const Editor: React.FC<EditorProps> = ({ gameData, handleUpdatePlayer, handleCreatePlayer, handleUpdateGround, handleUpdateScoreLimits }) => {
    const [editType, setEditType] = useState<'players' | 'grounds' | 'rules'>('players');
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [editorFormatTab, setEditorFormatTab] = useState<Format>(Format.T20_SMASH);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !selectedPlayer) return;

        // Local preview
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) {
                setSelectedPlayer(prev => prev ? { ...prev, imageUrl: event.target?.result as string } : null);
            }
        };
        reader.readAsDataURL(file);

        setIsUploading(true);
        try {
            const storageRef = ref(storage, `avatars/${selectedPlayer.id}_${Date.now()}`);
            await uploadBytes(storageRef, file);
            const url = await getDownloadURL(storageRef);
            setSelectedPlayer(prev => prev ? { ...prev, imageUrl: url } : null);
        } catch (error) {
            console.error("Error uploading photo:", error);
        } finally {
            setIsUploading(false);
        }
    };

    const getPlayerProfileForFormat = useCallback((player: Player, format: Format) => {
        const custom = player.customProfiles?.[format];
        if (custom && custom.avg > 0 && custom.sr > 0) {
            return custom;
        }
        const tier = getBatterTier(player.battingSkill);
        const style = player.style;
        return BATTING_PROFILES[format][tier][style] || BATTING_PROFILES[format][tier]['N'];
    }, []);

    const handleProfileChange = (field: 'avg' | 'sr', value: string) => {
        if (!selectedPlayer) return;
        const numericValue = value ? parseFloat(value) : 0;
        if (isNaN(numericValue)) return;

        setSelectedPlayer(prev => {
            if (!prev) return null;
            const newProfiles = { ...(prev.customProfiles || {}) };
            const newFormatProfile = { avg: 0, sr: 0, ...(newProfiles[editorFormatTab] || {}) };
            newFormatProfile[field] = numericValue;

            if (newFormatProfile.avg <= 0 && newFormatProfile.sr <= 0) {
                delete newProfiles[editorFormatTab];
            } else {
                newProfiles[editorFormatTab] = newFormatProfile;
            }

            if (Object.keys(newProfiles).length === 0) {
                const updatedPlayer = {...prev};
                delete updatedPlayer.customProfiles;
                return updatedPlayer;
            }
            return { ...prev, customProfiles: newProfiles };
        });
    };

    const handleSelectPlayer = (playerId: string) => {
        setIsCreating(false);
        setSelectedPlayer(gameData.allPlayers.find(p => p.id === playerId) || null);
    };

    const handleAddNewPlayer = () => {
        setIsCreating(true);
        setSelectedPlayer({
            id: `new-player-${Date.now()}`,
            name: '',
            nationality: 'Local',
            role: PlayerRole.BATSMAN,
            battingSkill: 50,
            secondarySkill: 10,
            style: 'N',
            isOpener: false,
            isForeign: false,
            age: 22,
            fielding: 50,
            accuracy: 50,
            potential: 70,
            form: 50,
            fitness: 80,
            stats: generateInitialStats(),
            recentPerformances: []
        });
    }

    const savePlayer = () => {
        if (!selectedPlayer) return;
        if (isCreating) {
            handleCreatePlayer(selectedPlayer);
        } else {
            handleUpdatePlayer(selectedPlayer);
        }
        setSelectedPlayer(null);
        setIsCreating(false);
    }

    const handleGroundChange = (code: string, field: keyof Ground, value: any) => {
        if (field === 'pitch') {
            // Maintain backward compatibility if the function expects a string for pitch only
            // But prefer object update
            handleUpdateGround(code, { pitch: value });
        } else {
            handleUpdateGround(code, { [field]: value });
        }
    };

    if (selectedPlayer) {
        return (
            <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
                {/* Background Accents */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                    <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
                </div>

                <header className="px-5 py-6 border-b border-white/5 relative z-10 flex justify-between items-center bg-black/20 backdrop-blur-md">
                    <div className="flex flex-col">
                        <h2 className="text-[8px] font-black uppercase tracking-[0.4em] text-teal-500/60">ASSET_MOD // v2.6.0</h2>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter text-white">PLAYER EDITOR</h1>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={savePlayer}
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-black text-[10px] font-black uppercase tracking-widest rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-teal-500/20 active:scale-95"
                        >
                            <Icons.Check className="w-3.5 h-3.5 fill-current" />
                            SAVE
                        </button>
                        <button 
                            onClick={() => { setSelectedPlayer(null); setIsCreating(false); }}
                            className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-white/10 transition-all active:scale-95"
                        >
                            <Icons.X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide pb-10 relative z-10">
                    {/* Identity Card */}
                    <div className="glass-card p-6 space-y-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full border-4 border-teal-500/20 p-1 shadow-[0_0_30px_rgba(20,184,166,0.1)] relative">
                                    <div className="w-full h-full rounded-full bg-white/5 border border-white/10 flex items-center justify-center overflow-hidden relative">
                                        <PlayerAvatar player={selectedPlayer} size="md" className="w-full h-full" />
                                        {isUploading && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <Icons.RefreshCw className="w-5 h-5 text-teal-500 animate-spin" />
                                            </div>
                                        )}
                                    </div>
                                    <button 
                                        onClick={triggerFileInput}
                                        className="absolute bottom-0 right-0 bg-teal-500 text-black p-1.5 rounded-full shadow-lg hover:scale-110 transition-transform"
                                    >
                                        <Icons.Plus className="w-3 h-3" />
                                    </button>
                                    <input type="file" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" accept="image/*" />
                                </div>
                            </div>
                            
                            <div className="w-full space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">NAME</label>
                                    <input 
                                        type="text" 
                                        value={selectedPlayer.name}
                                        onChange={(e) => setSelectedPlayer({ ...selectedPlayer, name: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm font-black text-white outline-none focus:border-teal-500 transition-all"
                                        placeholder="Enter Player Name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">ROLE</label>
                                        <select 
                                            value={selectedPlayer.role}
                                            onChange={(e) => setSelectedPlayer({ ...selectedPlayer, role: e.target.value as any })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-teal-500 transition-all appearance-none"
                                        >
                                            {Object.values(PlayerRole).map(r => <option key={r} value={r} className="bg-[#050808]">{getRoleFullName(r)}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-2">NATIONALITY</label>
                                        <input 
                                            type="text" 
                                            value={selectedPlayer.nationality}
                                            onChange={(e) => setSelectedPlayer({ ...selectedPlayer, nationality: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Attributes Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        <div className="glass-card p-6 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500/60">CORE_ATTRIBUTES</h3>
                            <div className="space-y-5">
                                {[
                                    { label: 'BATTING', key: 'battingSkill' },
                                    { label: 'BOWLING', key: 'secondarySkill' },
                                    { label: 'FIELDING', key: 'fielding' },
                                    { label: 'ACCURACY', key: 'accuracy' },
                                    { label: 'POTENTIAL', key: 'potential' }
                                ].map((attr) => (
                                    <div key={attr.key} className="space-y-2">
                                        <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-white/40">
                                            <span>{attr.label}</span>
                                            <span className="text-white">{selectedPlayer[attr.key as keyof Player] as number || 0}</span>
                                        </div>
                                        <input 
                                            type="range" min="1" max="99" 
                                            value={selectedPlayer[attr.key as keyof Player] as number || 0}
                                            onChange={(e) => setSelectedPlayer({ ...selectedPlayer, [attr.key]: parseInt(e.target.value) })}
                                            className="w-full h-1 bg-white/5 rounded-full appearance-none accent-teal-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-teal-500/60">VITAL_STATS</h3>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">AGE</label>
                                    <input type="number" value={selectedPlayer.age || 20} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, age: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">FORM</label>
                                    <input type="number" value={selectedPlayer.form || 50} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, form: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black text-white/20 uppercase tracking-[0.3em] ml-1">FITNESS</label>
                                    <input type="number" value={selectedPlayer.fitness || 80} onChange={(e) => setSelectedPlayer({ ...selectedPlayer, fitness: parseInt(e.target.value) })} className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-xs font-black text-white" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-2">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-8 h-4 rounded-full transition-all relative ${selectedPlayer.isForeign ? 'bg-teal-500' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedPlayer.isForeign ? 'left-4.5' : 'left-0.5'}`} />
                                    </div>
                                    <input type="checkbox" className="hidden" checked={selectedPlayer.isForeign} onChange={e => setSelectedPlayer({...selectedPlayer, isForeign: e.target.checked})} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">FOREIGN</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-8 h-4 rounded-full transition-all relative ${selectedPlayer.isOpener ? 'bg-teal-500' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedPlayer.isOpener ? 'left-4.5' : 'left-0.5'}`} />
                                    </div>
                                    <input type="checkbox" className="hidden" checked={selectedPlayer.isOpener} onChange={e => setSelectedPlayer({...selectedPlayer, isOpener: e.target.checked})} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">OPENER</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <div className={`w-8 h-4 rounded-full transition-all relative ${selectedPlayer.isFreeAgent ? 'bg-teal-500' : 'bg-white/10'}`}>
                                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${selectedPlayer.isFreeAgent ? 'left-4.5' : 'left-0.5'}`} />
                                    </div>
                                    <input type="checkbox" className="hidden" checked={selectedPlayer.isFreeAgent} onChange={e => setSelectedPlayer({...selectedPlayer, isFreeAgent: e.target.checked})} />
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/40">FREE AGENT</span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col bg-[#050808] text-[#E4E3E0] font-sans overflow-hidden relative">
            {/* Background Accents */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-24 -right-24 w-[600px] h-[600px] bg-teal-500/5 blur-[160px] rounded-full" />
                <div className="absolute -bottom-24 -left-24 w-[600px] h-[600px] bg-blue-500/5 blur-[160px] rounded-full" />
            </div>

            <header className="px-5 py-6 md:px-6 md:py-8 border-b border-white/5 relative z-10">
                <div className="flex flex-col gap-0.5 md:gap-1">
                    <h2 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.4em] text-teal-500/60">
                        SYSTEM_CONFIG // v2.6.0
                    </h2>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white leading-none">CENTRAL EDITOR</h1>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto p-5 md:p-6 space-y-5 md:space-y-6 scrollbar-hide pb-10 relative z-10">
                {/* Mode Selector */}
                <div className="flex bg-white/5 p-1 rounded-xl md:rounded-2xl border border-white/10">
                    {(['players', 'grounds', 'rules'] as const).map(m => (
                        <button
                            key={m}
                            onClick={() => setEditType(m)}
                            className={`flex-1 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all ${
                                editType === m ? 'bg-teal-500 text-black shadow-lg' : 'text-white/40 hover:text-white/60'
                            }`}
                        >
                            {m}
                        </button>
                    ))}
                </div>

                {editType === 'players' && (
                    <div className="space-y-3 md:space-y-4">
                        <button 
                            onClick={handleAddNewPlayer}
                            className="w-full py-5 md:py-6 bg-white text-black rounded-2xl md:rounded-3xl font-black uppercase italic tracking-widest text-[10px] md:text-xs flex items-center justify-center gap-2 md:gap-3 shadow-xl"
                        >
                            <Icons.Plus className="w-[18px] h-[18px] md:w-5 md:h-5" />
                            CREATE_NEW_ASSET
                        </button>
                        <div className="grid grid-cols-1 gap-2 md:gap-3">
                            {gameData.allPlayers.map(p => (
                                <div 
                                    key={p.id}
                                    onClick={() => handleSelectPlayer(p.id)}
                                    className="bg-white/5 border border-white/10 p-3 md:p-4 rounded-2xl md:rounded-3xl flex items-center gap-3 md:gap-4 group active:scale-95 transition-all"
                                >
                                    <PlayerAvatar player={p} size="sm" className="w-10 h-10 md:w-12 md:h-12 border-2 border-white/10" />
                                    <div className="flex-1">
                                        <h4 className="text-base md:text-lg font-black italic uppercase tracking-tighter text-white">{p.name}</h4>
                                        <p className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest">{p.role}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg md:text-xl font-black italic text-teal-500">{p.battingSkill}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {editType === 'grounds' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        {gameData.grounds.map(g => (
                            <div key={g.code} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-6 md:space-y-8 hover:bg-white/[0.07] transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                
                                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20 shadow-inner">
                                        <Icons.Venue className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <div className="flex-1">
                                        <input 
                                            type="text" 
                                            value={g.name}
                                            onChange={(e) => handleGroundChange(g.code, 'name', e.target.value)}
                                            className="w-full bg-transparent border-none text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white outline-none focus:text-teal-400 transition-colors"
                                        />
                                        <p className="text-[9px] md:text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">{g.code} // STADIUM_ID</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 md:gap-5 relative z-10">
                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">PITCH_TYPE</label>
                                        <select 
                                            value={g.pitch}
                                            onChange={(e) => handleGroundChange(g.code, 'pitch', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm font-black text-white outline-none focus:border-teal-500 transition-all appearance-none"
                                        >
                                            {PITCH_TYPES.map(pt => <option key={pt} value={pt} className="bg-[#050808]">{pt}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">BOUNDARY</label>
                                        <select 
                                            value={g.boundarySize || 'Medium'}
                                            onChange={(e) => handleGroundChange(g.code, 'boundarySize', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm font-black text-white outline-none focus:border-teal-500 transition-all appearance-none"
                                        >
                                            {['Small', 'Medium', 'Large'].map(s => <option key={s} value={s} className="bg-[#050808]">{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">OUTFIELD</label>
                                        <select 
                                            value={g.outfieldSpeed || 'Medium'}
                                            onChange={(e) => handleGroundChange(g.code, 'outfieldSpeed', e.target.value)}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm font-black text-white outline-none focus:border-teal-500 transition-all appearance-none"
                                        >
                                            {['Slow', 'Medium', 'Fast', 'Lightning'].map(s => <option key={s} value={s} className="bg-[#050808]">{s}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[8px] md:text-[9px] font-black text-white/20 uppercase tracking-widest ml-2">CAPACITY</label>
                                        <input 
                                            type="number" 
                                            value={g.capacity || 0}
                                            onChange={(e) => handleGroundChange(g.code, 'capacity', parseInt(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl px-4 md:px-5 py-3 md:py-4 text-xs md:text-sm font-black text-white outline-none focus:border-teal-500 transition-all"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {editType === 'rules' && (
                    <div className="grid grid-cols-1 gap-6 md:gap-8">
                        {gameData.grounds.map(g => (
                            <div key={g.code} className="bg-white/5 border border-white/10 p-6 md:p-8 rounded-[32px] md:rounded-[40px] space-y-8 md:space-y-10 hover:bg-white/[0.07] transition-all relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-48 h-48 bg-teal-500/5 blur-3xl -ml-24 -mt-24 pointer-events-none" />
                                
                                <div className="flex items-center gap-4 md:gap-6 relative z-10">
                                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500 border border-teal-500/20">
                                        <Icons.Trophy className="w-6 h-6 md:w-7 md:h-7" />
                                    </div>
                                    <h3 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter text-white">{g.name} // RULES_SET</h3>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative z-10">
                                    {Object.values(Format).map(f => (
                                        <div key={f} className="space-y-6 bg-white/5 p-5 md:p-6 rounded-2xl md:rounded-3xl border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-2 h-2 rounded-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" />
                                                <p className="text-[10px] md:text-xs font-black text-white uppercase tracking-[0.2em]">{f.split(' ').pop()}</p>
                                            </div>
                                            
                                            <div className="space-y-6">
                                                {[1, 2].map(inning => (
                                                    <div key={inning} className="space-y-4">
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">INNING_{inning}</span>
                                                            <div className="h-px flex-1 bg-white/5" />
                                                        </div>
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-1">MAX_RUNS</label>
                                                                <input 
                                                                    type="number"
                                                                    placeholder="∞"
                                                                    value={gameData.scoreLimits?.[g.code]?.[f]?.[inning]?.maxRuns || ''}
                                                                    onChange={(e) => handleUpdateScoreLimits(g.code, f, 'maxRuns', e.target.value, inning)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-teal-500 transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-1">MAX_WKTS</label>
                                                                <input 
                                                                    type="number"
                                                                    placeholder="10"
                                                                    value={gameData.scoreLimits?.[g.code]?.[f]?.[inning]?.maxWickets || ''}
                                                                    onChange={(e) => handleUpdateScoreLimits(g.code, f, 'maxWickets', e.target.value, inning)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-teal-500 transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-1">OVERS</label>
                                                                <input 
                                                                    type="number"
                                                                    placeholder="20"
                                                                    value={gameData.scoreLimits?.[g.code]?.[f]?.[inning]?.oversPerMatch || ''}
                                                                    onChange={(e) => handleUpdateScoreLimits(g.code, f, 'oversPerMatch', e.target.value, inning)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-teal-500 transition-all"
                                                                />
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[7px] font-black text-white/20 uppercase tracking-widest ml-1">MAX_OVERS_BWL</label>
                                                                <input 
                                                                    type="number"
                                                                    placeholder="4"
                                                                    value={gameData.scoreLimits?.[g.code]?.[f]?.[inning]?.maxOversPerBowler || ''}
                                                                    onChange={(e) => handleUpdateScoreLimits(g.code, f, 'maxOversPerBowler', e.target.value, inning)}
                                                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-black text-white outline-none focus:border-teal-500 transition-all"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Editor;