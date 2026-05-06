import React from 'react';
import { Player } from '../types';

interface PlayerAvatarProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const PlayerAvatar: React.FC<PlayerAvatarProps> = ({ player, size = 'md', className = '' }) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-[10px]',
    sm: 'w-10 h-10 text-xs',
    md: 'w-16 h-16 text-sm',
    lg: 'w-24 h-24 text-base',
    xl: 'w-32 h-32 text-xl',
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <div className={`relative flex-shrink-0 ${className}`}>
      <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-charcoal-700 to-charcoal-900 border-2 border-white/10 flex items-center justify-center font-black text-white/40 shadow-inner overflow-hidden`}>
        {getInitials(player.name)}
      </div>
      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-brand-teal border border-black flex items-center justify-center text-[8px] font-black text-black">
        {player.rating}
      </div>
    </div>
  );
};
