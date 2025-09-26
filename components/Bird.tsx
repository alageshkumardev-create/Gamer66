import React from 'react';
import { BIRD_LEFT_POSITION, BIRD_SIZE } from '../constants';

interface BirdProps {
  y: number;
  rotation: number;
}

export const Bird: React.FC<BirdProps> = React.memo(({ y, rotation }) => {
  return (
    <div
      className="absolute bg-neon-yellow rounded-full shadow-glow-yellow"
      style={{
        width: `${BIRD_SIZE}px`,
        height: `${BIRD_SIZE}px`,
        top: `${y}px`,
        left: `${BIRD_LEFT_POSITION}px`,
        transform: `rotate(${rotation}deg)`,
        willChange: 'transform, top',
      }}
    />
  );
});
