import { DIRECTIONS } from './constants';
import { getValidDirections, MAZE_LAYOUT } from './mazeData';

export function getGhostStartPositions(offsetX, offsetZ) {
  return {
    blinky: { x: 21 + offsetX, z: 1 + offsetZ, direction: 'LEFT' },
    pinky: { x: 6 + offsetX, z: 1 + offsetZ, direction: 'RIGHT' },
    inky: { x: 1 + offsetX, z: 5 + offsetZ, direction: 'RIGHT' },
    clyde: { x: 26 + offsetX, z: 5 + offsetZ, direction: 'LEFT' },
  };
}

export const GHOST_RELEASE_TIMES = {
  blinky: 0,
  pinky: 2000,
  inky: 4000,
  clyde: 6000,
};

export const MODE_DURATIONS = {
  scatter: [7000, 7000, 5000, 5000],
  chase: [20000, 20000, 20000, Infinity],
};
