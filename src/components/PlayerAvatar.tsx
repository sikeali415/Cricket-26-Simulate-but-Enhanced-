import React, { useMemo } from 'react';
import { Player, PlayerRole } from '../types';
import { getRoleBorderClass, hashString, getAvatarUrl } from '../utils';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-20 h-20',
    xl: 'w-32 h-32',
    '2xl': 'w-48 h-48'
  };

  const borderClass = player ? getRoleBorderClass(player.role) : '';
  const hash = player ? hashString(player.name + (player.id || '')) : 0;
  
  // Custom SVG Cricket Avatar
  const renderCricketAvatar = () => {
    const skinTones = ['#FFDBAC', '#F1C27D', '#E0AC69', '#8D5524', '#C68642', '#3D2314', '#D1A3A4', '#A57164'];
    const jerseyColors = ['#1e40af', '#166534', '#991b1b', '#854d0e', '#3730a3', '#1e293b', '#facc15', '#0ea5e9', '#ef4444', '#10b981', '#6366f1', '#f97316'];
    const helmetColors = ['#1e3a8a', '#064e3b', '#7f1d1d', '#713f12', '#312e81', '#0f172a', '#854d0e', '#075985', '#991b1b', '#065f46', '#4338ca', '#c2410c'];
    const hairColors = ['#0a0a0a', '#3d2b1f', '#6b4423', '#bd945e', '#262626', '#171717', '#4b2c20'];
    
    const skinColor = skinTones[hash % skinTones.length];
    const jerseyColor = jerseyColors[(hash >> 2) % jerseyColors.length];
    const helmetColor = helmetColors[(hash >> 4) % helmetColors.length];
    const hairColor = hairColors[(hash >> 3) % hairColors.length];
    
    // Determine if wearing a helmet
    const hasHelmet = (player.role === PlayerRole.BATSMAN || player.role === PlayerRole.WICKET_KEEPER || (hash % 10 < 3));
    const hairStyle = (hash >> 5) % 5; // 0: neat, 1: messy, 2: spikey, 3: long, 4: bald
    const hasFacialHair = (hash % 15 > 10);
    const shirtDetail = (hash >> 1) % 4; // 0: plain, 1: stripes, 2: v-neck, 3: collar

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full shadow-inner">
        {/* Background Gradient */}
        <defs>
          <linearGradient id={`grad-${hash}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#1e293b', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#0f172a', stopOpacity: 1 }} />
          </linearGradient>
        </defs>
        <circle cx="50" cy="50" r="48" fill={`url(#grad-${hash})`} />
        
        {/* Body/Jersey */}
        <path d="M15 100 Q20 65 50 65 Q80 65 85 100" fill={jerseyColor} />
        
        {/* Jersey Details */}
        {shirtDetail === 1 && (
          <>
            <path d="M30 65 L30 100" stroke="white" strokeWidth="2" opacity="0.1" />
            <path d="M50 65 L50 100" stroke="white" strokeWidth="2" opacity="0.1" />
            <path d="M70 65 L70 100" stroke="white" strokeWidth="2" opacity="0.1" />
          </>
        )}
        {shirtDetail === 2 && <path d="M40 65 L50 78 L60 65" fill="white" opacity="0.1" />}
        
        {/* Neck */}
        <rect x="42" y="60" width="16" height="12" fill={skinColor} stroke="black" strokeWidth="0.5" opacity="0.9" />
        
        {/* Face Shape */}
        <path d="M30 45 Q30 75 50 75 Q70 75 70 45 Q70 20 50 20 Q30 20 30 45" fill={skinColor} />
        
        {/* Facial Hair */}
        {hasFacialHair && (
          <path d="M32 55 Q32 75 50 75 Q68 75 68 55 Q68 62 50 62 Q32 62 32 55" fill={hairColor} opacity="0.6" />
        )}

        {/* Features */}
        <circle cx="42" cy="46" r="2" fill="#1a1a1a" />
        <circle cx="58" cy="46" r="2" fill="#1a1a1a" />
        <path d="M48 45 L50 55 L52 45" fill="none" stroke="black" strokeWidth="0.5" opacity="0.3" />
        <path d="M44 62 Q50 66 56 62" fill="none" stroke="black" strokeWidth="1" strokeLinecap="round" opacity="0.4" />

        {/* Hair Styles */}
        {!hasHelmet && (
          <>
            {hairStyle === 0 && <path d="M30 45 Q30 20 50 20 Q70 20 70 45 L70 40 Q70 15 50 15 Q30 15 30 40 Z" fill={hairColor} />}
            {hairStyle === 1 && <path d="M30 45 Q25 25 50 15 Q75 25 70 45 L74 35 Q74 10 50 5 Q26 10 26 35 Z" fill={hairColor} />}
            {hairStyle === 2 && <path d="M30 40 L35 25 L45 15 L55 15 L65 25 L70 40 Q75 10 50 5 Q25 10 30 40 Z" fill={hairColor} />}
            {hairStyle === 3 && <path d="M30 45 L25 70 L28 75 Q50 65 72 75 L75 70 L70 45 Q70 15 50 15 Q30 15 30 45 Z" fill={hairColor} />}
            {hairStyle === 4 && <path d="M35 25 Q50 18 65 25 Q70 30 70 40 L30 40 Q30 30 35 25" fill={skinColor} stroke={hairColor} strokeWidth="0.5" opacity="0.3" />}
          </>
        )}

        {/* Helmet */}
        {hasHelmet && (
          <g transform="translate(0, -2)">
            {/* Main Shell */}
            <path d="M28 45 Q28 15 50 15 Q72 15 72 45" fill={helmetColor} stroke="black" strokeWidth="0.5" />
            <path d="M28 35 Q50 32 72 35" fill="none" stroke="white" strokeWidth="0.5" opacity="0.2" />
            
            {/* Visor/Grille Structure */}
            <path d="M30 42 L70 42 L68 58 L32 58 Z" fill="none" stroke="#64748b" strokeWidth="1.5" />
            <path d="M30 48 L70 48" stroke="#64748b" strokeWidth="1" />
            <path d="M30 53 L70 53" stroke="#64748b" strokeWidth="1" />
            <path d="M40 42 L40 58" stroke="#64748b" strokeWidth="0.8" />
            <path d="M60 42 L60 58" stroke="#64748b" strokeWidth="0.8" />
            
            {/* Sun Visor / Peak */}
            <path d="M25 42 Q50 38 75 42" fill={helmetColor} stroke="black" strokeWidth="0.5" />
            
            {/* Logo area */}
            <circle cx="50" cy="28" r="4" fill="white" opacity="0.2" />
          </g>
        )}
      </svg>
    );
  };

  if (!player) return null;

  return (
    <div className={`relative rounded-full overflow-hidden border-2 flex-shrink-0 ${borderClass} ${sizeClasses[size]} ${className} bg-slate-800 flex items-center justify-center`}>
      {player.imageUrl || player.avatarUrl ? (
        <img 
          src={player.imageUrl || player.avatarUrl} 
          alt={player.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        renderCricketAvatar()
      )}
    </div>
  );
};
