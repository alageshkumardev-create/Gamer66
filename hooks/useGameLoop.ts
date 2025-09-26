import { useRef, useEffect } from 'react';

type GameLoopCallback = (deltaTime: number) => void;

export const useGameLoop = (callback: GameLoopCallback, isActive: boolean) => {
  const frameRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(performance.now());

  useEffect(() => {
    const loop = (currentTime: number) => {
      const deltaTime = (currentTime - lastTimeRef.current) / 1000; // convert to seconds
      lastTimeRef.current = currentTime;
      callback(deltaTime);
      frameRef.current = requestAnimationFrame(loop);
    };

    if (isActive) {
      lastTimeRef.current = performance.now();
      frameRef.current = requestAnimationFrame(loop);
    }

    return () => {
      cancelAnimationFrame(frameRef.current);
    };
  }, [callback, isActive]);
};
