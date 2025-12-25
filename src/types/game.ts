export interface Character {
  id: number;
  image: string;
  name: string;
}

export interface Player {
  x: number;
  y: number;
  velocity: number;
  rotation: number;
  width: number;
  height: number;
}

export interface Pipe {
  x: number;
  gapY: number;
  gapHeight: number;
  width: number;
  passed: boolean;
}

export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export type GameState = 'menu' | 'playing' | 'gameover' | 'admin' | 'admin_login' | 'add_char' | 'delete_char';

export interface GameConfig {
  virtualWidth: number;
  virtualHeight: number;
  gravity: number;
  jumpForce: number;
  pipeSpeed: number;
  pipeSpawnInterval: number;
  pipeWidth: number;
  minGapSize: number;
  maxGapSize: number;
}
