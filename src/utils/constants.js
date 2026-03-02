export const CELL_SIZE = 1;
export const WALL_HEIGHT = 0.8;
export const PACMAN_RADIUS = 0.4;
export const GHOST_RADIUS = 0.4;
export const PELLET_RADIUS = 0.08;
export const POWER_PELLET_RADIUS = 0.15;

export const PACMAN_SPEED = 4.5;
export const GHOST_SPEED = 3.0;
export const GHOST_FRIGHTENED_SPEED = 1.5;

export const POWER_MODE_DURATION = 8000;
export const GHOST_RESPAWN_TIME = 5000;
export const READY_TIME = 2000;

export const PELLET_SCORE = 10;
export const POWER_PELLET_SCORE = 50;
export const GHOST_SCORE_BASE = 200;

export const GHOST_COLORS = {
  blinky: '#ff0000',
  pinky: '#ffb8ff',
  inky: '#00ffff',
  clyde: '#ffb852',
};

export const GHOST_FRIGHTENED_COLOR = '#0000ff';
export const GHOST_FLASH_COLOR = '#ffffff';

export const DIRECTIONS = {
  UP: { x: 0, z: -1 },
  DOWN: { x: 0, z: 1 },
  LEFT: { x: -1, z: 0 },
  RIGHT: { x: 1, z: 0 },
};

export const CELL_TYPES = {
  WALL: '#',
  EMPTY: ' ',
  PELLET: '.',
  POWER_PELLET: 'O',
  GHOST_HOUSE: 'G',
  PACMAN_START: 'P',
  TUNNEL: 'T',
};
