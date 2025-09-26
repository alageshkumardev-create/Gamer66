export enum GameStatus {
  Menu,
  Playing,
  Paused,
  GameOver,
}

export interface BirdState {
  y: number;
  velocity: number;
  rotation: number;
}

export interface ObstacleState {
  id: number;
  x: number;
  gapY: number; // center of the gap
  gapHeight: number;
  isScored: boolean;
}