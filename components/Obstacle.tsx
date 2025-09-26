import React from 'react';
import { GAME_HEIGHT, OBSTACLE_WIDTH } from '../constants';

interface ObstacleProps {
  x: number;
  gapY: number;
  gapHeight: number;
}

export const Obstacle: React.FC<ObstacleProps> = React.memo(({ x, gapY, gapHeight }) => {
  const topPipeHeight = gapY - gapHeight / 2;
  const bottomPipeTop = gapY + gapHeight / 2;
  const bottomPipeHeight = GAME_HEIGHT - bottomPipeTop;

  return (
    <>
      {/* Top Pipe */}
      <div
        className="absolute bg-neon-cyan shadow-glow-cyan rounded-md"
        style={{
          left: `${x}px`,
          top: 0,
          width: `${OBSTACLE_WIDTH}px`,
          height: `${topPipeHeight}px`,
        }}
      />
      {/* Bottom Pipe */}
      <div
        className="absolute bg-neon-cyan shadow-glow-cyan rounded-md"
        style={{
          left: `${x}px`,
          top: `${bottomPipeTop}px`,
          width: `${OBSTACLE_WIDTH}px`,
          height: `${bottomPipeHeight}px`,
        }}
      />
    </>
  );
});
