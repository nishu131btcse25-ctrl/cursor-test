import React from 'react';
import { Screen } from '@/types';
import { formatRelativeTime } from '@/lib/utils';

interface ScreenStatusProps {
  screen: Screen;
  showLastSeen?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ScreenStatus({ screen, showLastSeen = true, size = 'md' }: ScreenStatusProps) {
  const sizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-3 h-3',
    lg: 'w-4 h-4',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className="flex items-center space-x-2">
      <div
        className={`${sizeClasses[size]} rounded-full ${
          screen.is_online ? 'bg-semantic-success' : 'bg-neutral-text-subtle'
        }`}
      />
      <div className="flex flex-col">
        <span className={`font-medium ${textSizeClasses[size]} ${
          screen.is_online ? 'text-semantic-success' : 'text-neutral-text-muted'
        }`}>
          {screen.is_online ? 'Online' : 'Offline'}
        </span>
        {showLastSeen && (
          <span className={`text-neutral-text-subtle ${textSizeClasses[size]}`}>
            {screen.last_seen ? formatRelativeTime(screen.last_seen) : 'Never connected'}
          </span>
        )}
      </div>
    </div>
  );
}

export function ScreenStatusBadge({ screen }: { screen: Screen }) {
  return (
    <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
      screen.is_online 
        ? 'bg-semantic-success-light text-semantic-success' 
        : 'bg-neutral-bg-elevated text-neutral-text-muted'
    }`}>
      <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
        screen.is_online ? 'bg-semantic-success' : 'bg-neutral-text-subtle'
      }`} />
      {screen.is_online ? 'Online' : 'Offline'}
    </div>
  );
}