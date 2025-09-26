import React from 'react';
import { GAME_WIDTH, GAME_HEIGHT } from '../constants';

interface BackgroundProps {
  x: number;
}

export const Background: React.FC<BackgroundProps> = React.memo(({ x }) => {
  return (
    <div
      className="absolute top-0 left-0 h-full"
      style={{
        width: `${GAME_WIDTH * 2}px`,
        transform: `translateX(${x}px)`,
        willChange: 'transform',
      }}
    >
      <div
        className="absolute top-0 left-0 bg-gradient-to-b from-galaxy-start to-galaxy-end"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px` }}
      />
      <div
        className="absolute top-0 bg-gradient-to-b from-galaxy-start to-galaxy-end"
        style={{ width: `${GAME_WIDTH}px`, height: `${GAME_HEIGHT}px`, left: `${GAME_WIDTH}px` }}
      />
    </div>
  );
});