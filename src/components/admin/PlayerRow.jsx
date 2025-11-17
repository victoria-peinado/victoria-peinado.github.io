import React, { memo } from 'react';
import { Button } from '../ui/Button';

// 1. Accept props: player, onMessageClick, onKickClick
// 2. The JSX is moved from LivePlayerList.jsx
const PlayerRow = ({ player, onMessageClick, onKickClick }) => {
  return (
    <div
      className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition border border-neutral-700"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-2 h-2 bg-primary-light rounded-full flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-100 truncate">
            {player.nickname}
          </p>
          <p className="text-xs text-neutral-400 font-mono">
            {player.score || 0} pts
          </p>
        </div>
      </div>
      
      <div className="flex items-center gap-2 flex-shrink-0">
        <Button
          onClick={() => onMessageClick(player)} // Pass player to handler
          variant="secondary"
          className="py-1 px-3 text-xs"
        >
          Message
        </Button>
        
        <Button
          onClick={() => onKickClick(player)} // Pass player to handler
          variant="danger"
          className="py-1 px-3 text-xs"
        >
          Kick
        </Button>
      </div>
    </div>
  );
};

// 3. Wrap the export in memo
export default memo(PlayerRow);