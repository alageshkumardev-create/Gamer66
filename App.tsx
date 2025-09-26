import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BirdState, ObstacleState, GameStatus } from './types';
import { useGameLoop } from './hooks/useGameLoop';
import { Bird } from './components/Bird';
import { Obstacle } from './components/Obstacle';
import { GameOverlay } from './components/GameOverlay';
import { Background } from './components/Background';
import * as C from './constants';

const { Howl, Howler } = (window as any);

const INITIAL_BIRD_STATE: BirdState = {
  y: C.GAME_HEIGHT / 2 - C.BIRD_SIZE / 2,
  velocity: 0,
  rotation: 0,
};

const SoundOnIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M0 0h24v24H0z" fill="none"/><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>);
const SoundOffIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M0 0h24v24H0z" fill="none"/><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>);
const PauseIcon = () => (<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="white"><path d="M0 0h24v24H0z" fill="none"/><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>);

// Fix: Define an interface for Howl instances to fix TypeScript error.
// 'Howl' is a value from a global script, not a TypeScript type. This interface
// provides type safety for sound objects.
interface IHowl {
  play(): void;
  pause(): void;
  stop(): void;
  unload(): void;
}


function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.Menu);
  const [bird, setBird] = useState<BirdState>(INITIAL_BIRD_STATE);
  const [obstacles, setObstacles] = useState<ObstacleState[]>([]);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('flappy-neon-hs') || 0));
  const [isMuted, setIsMuted] = useState(() => localStorage.getItem('flappy-neon-muted') === 'true');
  const [backgroundX, setBackgroundX] = useState(0);

  const spawnTimer = useRef(0);
  const nextObstacleId = useRef(0);
  // Fix: Use the IHowl interface for the sounds ref to resolve the type error on line 32.
  const sounds = useRef<Record<string, IHowl> | null>(null);

  useEffect(() => {
    // Enhanced sounds to better match the game's neon aesthetic, using synth-based audio from a reliable CDN.
    sounds.current = {
      flap: new Howl({ src: ['https://assets.codepen.io/217233/flap.mp3'], volume: 0.6 }),
      score: new Howl({ src: ['https://assets.codepen.io/217233/score.mp3'], volume: 0.6 }),
      hit: new Howl({ src: ['https://assets.codepen.io/217233/hit.mp3'], volume: 0.7 }),
      pause: new Howl({ src: ['https://assets.codepen.io/217233/pause.mp3'], volume: 0.4 }),
      select: new Howl({ src: ['https://assets.codepen.io/217233/select.mp3'], volume: 0.5 }),
      bg: new Howl({
        src: ['https://assets.codepen.io/217233/bg-music-synth.mp3'],
        loop: true,
        volume: 0.3,
      }),
    };

    // When the component unloads, clean up the sounds to prevent memory leaks.
    return () => {
      if (sounds.current) {
        Object.values(sounds.current).forEach(sound => sound.unload());
      }
    };
  }, []);

  useEffect(() => {
    Howler.mute(isMuted);
    localStorage.setItem('flappy-neon-muted', isMuted.toString());
  }, [isMuted]);

  const resetGame = useCallback(() => {
    setBird(INITIAL_BIRD_STATE);
    setObstacles([]);
    setScore(0);
    setBackgroundX(0);
    spawnTimer.current = C.OBSTACLE_SPAWN_RATE / 2;
    nextObstacleId.current = 0;
    sounds.current?.bg.stop();
    sounds.current?.bg.play();
    setStatus(GameStatus.Playing);
  }, []);
  
  const handlePauseToggle = useCallback(() => {
    if (status === GameStatus.Playing) {
      sounds.current?.pause.play();
      sounds.current?.bg.pause();
      setStatus(GameStatus.Paused);
    } else if (status === GameStatus.Paused) {
      sounds.current?.pause.play();
      sounds.current?.bg.play();
      setStatus(GameStatus.Playing);
    }
  }, [status]);

  const handleJump = useCallback(() => {
    setBird(b => ({ ...b, velocity: C.JUMP_VELOCITY }));
    sounds.current?.flap.play();
  }, []);

  const handlePrimaryAction = useCallback(() => {
    // On the very first user interaction, unlock the browser's audio context.
    // This is the most robust way to fix autoplay issues.
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
      Howler.ctx.resume();
    }

    if (status === GameStatus.Playing) {
      handleJump();
    } else if (status === GameStatus.Menu || status === GameStatus.GameOver) {
      sounds.current?.select.play();
      resetGame();
    }
  }, [status, handleJump, resetGame]);

  const gameTick = useCallback((deltaTime: number) => {
    // Background scroll
    setBackgroundX(prevX => {
      let newX = prevX + C.BACKGROUND_SPEED * deltaTime;
      if (newX <= -C.GAME_WIDTH) {
        newX += C.GAME_WIDTH;
      }
      return newX;
    });

    // Bird physics
    setBird(b => {
      const newVelocity = b.velocity + C.GRAVITY * deltaTime;
      const newY = b.y + newVelocity * deltaTime;
      const newRotation = Math.max(-30, Math.min(90, (newVelocity / 300) * 90 + 20));
      return { y: newY, velocity: newVelocity, rotation: newRotation };
    });

    // Obstacle movement and spawning
    spawnTimer.current += deltaTime;
    if (spawnTimer.current >= C.OBSTACLE_SPAWN_RATE) {
      spawnTimer.current = 0;
      const gapHeight = Math.random() * (C.OBSTACLE_GAP_MAX - C.OBSTACLE_GAP_MIN) + C.OBSTACLE_GAP_MIN;
      const gapY = Math.random() * (C.GAME_HEIGHT - gapHeight - 2 * C.OBSTACLE_MIN_HEIGHT) + C.OBSTACLE_MIN_HEIGHT + gapHeight / 2;
      
      setObstacles(obs => [...obs, {
        id: nextObstacleId.current++,
        x: C.GAME_WIDTH,
        gapY,
        gapHeight,
        isScored: false
      }]);
    }

    setObstacles(obs => obs
      .map(o => ({ ...o, x: o.x + C.OBSTACLE_SPEED * deltaTime }))
      .filter(o => o.x > -C.OBSTACLE_WIDTH)
    );

    // Scoring
    const birdCenterX = C.BIRD_LEFT_POSITION + C.BIRD_SIZE / 2;
    obstacles.forEach(obstacle => {
        if (!obstacle.isScored && obstacle.x + C.OBSTACLE_WIDTH < birdCenterX) {
            setScore(s => s + 1);
            sounds.current?.score.play();
            setObstacles(obs => obs.map(o => o.id === obstacle.id ? { ...o, isScored: true } : o));
        }
    });

    // Collision detection
    const birdTop = bird.y;
    const birdBottom = bird.y + C.BIRD_SIZE;
    
    // Ground and ceiling collision
    if (birdBottom > C.GAME_HEIGHT || birdTop < 0) {
      sounds.current?.hit.play();
      sounds.current?.bg.stop();
      setStatus(GameStatus.GameOver);
      return;
    }

    // Obstacle collision
    for (const ob of obstacles) {
      const birdRight = C.BIRD_LEFT_POSITION + C.BIRD_SIZE;
      const pipeLeft = ob.x;
      const pipeRight = ob.x + C.OBSTACLE_WIDTH;

      if (birdRight > pipeLeft && C.BIRD_LEFT_POSITION < pipeRight) {
        const topPipeBottom = ob.gapY - ob.gapHeight / 2;
        const bottomPipeTop = ob.gapY + ob.gapHeight / 2;
        if (birdTop < topPipeBottom || birdBottom > bottomPipeTop) {
          sounds.current?.hit.play();
          sounds.current?.bg.stop();
          setStatus(GameStatus.GameOver);
          return;
        }
      }
    }
  }, [bird.y, obstacles]);

  useGameLoop(gameTick, status === GameStatus.Playing);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const key = e.key.toLowerCase();

      if (key === ' ') {
        e.preventDefault();
        handlePrimaryAction();
      } else if (key === 'p') {
        e.preventDefault();
        handlePauseToggle();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handlePrimaryAction, handlePauseToggle]);
  
  useEffect(() => {
    if (status === GameStatus.GameOver) {
      if (score > highScore) {
        setHighScore(score);
        localStorage.setItem('flappy-neon-hs', score.toString());
      }
    }
  }, [status, score, highScore]);

  return (
    <div
      className="relative overflow-hidden bg-galaxy-start rounded-2xl shadow-2xl shadow-black/50 select-none"
      style={{ width: C.GAME_WIDTH, height: C.GAME_HEIGHT }}
      onClick={handlePrimaryAction}
    >
      <Background x={backgroundX} />

      <div className="absolute top-3 left-3 z-20">
        {status === GameStatus.Playing && (
          <button onClick={(e) => { e.stopPropagation(); handlePauseToggle();}} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
            <PauseIcon />
          </button>
        )}
      </div>
       <div className="absolute top-3 right-3 z-20">
          <button onClick={(e) => { e.stopPropagation(); setIsMuted(m => !m); }} className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 transition-colors">
            {isMuted ? <SoundOffIcon /> : <SoundOnIcon />}
          </button>
      </div>

      <Bird y={bird.y} rotation={bird.rotation} />
      {obstacles.map(ob => (
        <Obstacle key={ob.id} x={ob.x} gapY={ob.gapY} gapHeight={ob.gapHeight} />
      ))}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 text-5xl font-bold text-white shadow-glow-white">
        {status === GameStatus.Playing && score}
      </div>
      
      <GameOverlay show={status === GameStatus.Menu}>
        <h1 className="text-5xl font-bold text-neon-yellow" style={{textShadow: '0 0 10px #FFD600'}}>Flappy Neon</h1>
        <p className="mt-4 text-lg">Tap or press Space to start</p>
      </GameOverlay>

      <GameOverlay show={status === GameStatus.Paused}>
        <h2 className="text-4xl font-bold">Paused</h2>
        <button 
          className="mt-8 px-6 py-3 bg-neon-yellow text-deep-black font-bold rounded-lg text-lg shadow-glow-yellow transition-transform hover:scale-105"
          onClick={(e) => { e.stopPropagation(); handlePauseToggle();}}
        >
          Resume
        </button>
      </GameOverlay>
      
      <GameOverlay show={status === GameStatus.GameOver}>
        <h2 className="text-4xl font-bold">Game Over</h2>
        <div className="mt-6 text-xl">
            <p>Score: <span className="font-bold text-neon-yellow">{score}</span></p>
            <p className="mt-2">Best: <span className="font-bold text-neon-yellow">{highScore}</span></p>
        </div>
        <button 
          className="mt-8 px-6 py-3 bg-neon-yellow text-deep-black font-bold rounded-lg text-lg shadow-glow-yellow transition-transform hover:scale-105"
          onClick={(e) => { e.stopPropagation(); handlePrimaryAction();}}
        >
          Restart
        </button>
      </GameOverlay>
    </div>
  );
}

export default App;