import { create } from 'zustand';
import { mazeData, MAZE_LAYOUT, worldToGrid, isWall } from '../utils/mazeData';
import {
  PACMAN_SPEED, GHOST_SPEED, GHOST_FRIGHTENED_SPEED,
  POWER_MODE_DURATION, PELLET_SCORE, POWER_PELLET_SCORE,
  GHOST_SCORE_BASE, DIRECTIONS, READY_TIME,
} from '../utils/constants';
import { getGhostStartPositions, GHOST_RELEASE_TIMES } from '../utils/ghostAI';

const createGhostState = (name, pos) => ({
  x: pos.x, z: pos.z, direction: pos.direction,
  state: name === 'blinky' ? 'active' : 'waiting',
  frightened: false, eaten: false,
  lastGridX: -999, lastGridZ: -999,
});

const createInitialGhosts = () => {
  const positions = getGhostStartPositions(mazeData.offsetX, mazeData.offsetZ);
  return {
    blinky: createGhostState('blinky', positions.blinky),
    pinky: createGhostState('pinky', positions.pinky),
    inky: createGhostState('inky', positions.inky),
    clyde: createGhostState('clyde', positions.clyde),
  };
};

function canMove(gridX, gridZ, direction) {
  const delta = DIRECTIONS[direction];
  if (!delta) return false;
  return !isWall(MAZE_LAYOUT, gridX + delta.x, gridZ + delta.z);
}

const useGameStore = create((set, get) => ({
  gameState: 'start',
  score: 0,
  highScore: parseInt(localStorage.getItem('pacman-highscore') || '0'),
  lives: 3,
  level: 1,
  cameraAngle: 0,

  pacman: {
    x: mazeData.pacmanStart.x, z: mazeData.pacmanStart.z,
    direction: 'LEFT', nextDirection: 'LEFT', mouthOpen: true,
  },

  ghosts: createInitialGhosts(),
  pellets: [...mazeData.pellets],
  powerPellets: [...mazeData.powerPellets],
  powerMode: false,
  powerModeTimer: null,
  ghostsEatenInPowerMode: 0,
  gameStartTime: null,

  startGame: () => {
    set({
      gameState: 'ready', score: 0, lives: 3, level: 1,
      pacman: { x: mazeData.pacmanStart.x, z: mazeData.pacmanStart.z, direction: 'LEFT', nextDirection: 'LEFT', mouthOpen: true },
      ghosts: createInitialGhosts(),
      pellets: [...mazeData.pellets],
      powerPellets: [...mazeData.powerPellets],
      powerMode: false, ghostsEatenInPowerMode: 0,
    });
    setTimeout(() => set({ gameState: 'playing', gameStartTime: Date.now() }), READY_TIME);
  },

  restartGame: () => get().startGame(),
  setCameraAngle: (angle) => set({ cameraAngle: angle }),

  transformDirection: (inputDir) => {
    const { cameraAngle } = get();
    const inputVectors = { UP: { x: 0, z: -1 }, DOWN: { x: 0, z: 1 }, LEFT: { x: -1, z: 0 }, RIGHT: { x: 1, z: 0 } };
    const input = inputVectors[inputDir];
    if (!input) return inputDir;

    const cos = Math.cos(cameraAngle);
    const sin = Math.sin(cameraAngle);
    const rotatedX = input.x * cos + input.z * sin;
    const rotatedZ = -input.x * sin + input.z * cos;
    const angle = Math.atan2(rotatedX, -rotatedZ);
    const normalized = ((angle + Math.PI * 2) % (Math.PI * 2));

    if (normalized < Math.PI / 4 || normalized >= Math.PI * 7 / 4) return 'UP';
    if (normalized < Math.PI * 3 / 4) return 'RIGHT';
    if (normalized < Math.PI * 5 / 4) return 'DOWN';
    return 'LEFT';
  },

  setDirection: (inputDirection) => {
    const { pacman, gameState } = get();
    if (gameState !== 'playing') return;
    const worldDirection = get().transformDirection(inputDirection);
    set({ pacman: { ...pacman, nextDirection: worldDirection } });
  },

  update: (deltaTime) => {
    const state = get();
    if (state.gameState !== 'playing') return;
    get().checkCollisions();
    get().updatePacman(deltaTime);
    get().updateGhosts(deltaTime);
    get().checkCollisions();
    set((state) => ({ pacman: { ...state.pacman, mouthOpen: Math.floor(Date.now() / 100) % 2 === 0 } }));
  },

  updatePacman: (deltaTime) => {
    const { pacman, pellets, powerPellets } = get();
    const speed = PACMAN_SPEED * deltaTime;
    const gridPos = worldToGrid(pacman.x, pacman.z, mazeData.offsetX, mazeData.offsetZ);
    const cellCenterX = gridPos.x + mazeData.offsetX;
    const cellCenterZ = gridPos.z + mazeData.offsetZ;

    const alignedX = Math.abs(pacman.x - cellCenterX) < 0.15;
    const alignedZ = Math.abs(pacman.z - cellCenterZ) < 0.15;
    const atIntersection = alignedX && alignedZ;

    let newDirection = pacman.direction;
    if (atIntersection && pacman.nextDirection !== pacman.direction) {
      if (canMove(gridPos.x, gridPos.z, pacman.nextDirection)) {
        newDirection = pacman.nextDirection;
      }
    }

    const moveDelta = DIRECTIONS[newDirection];
    if (!moveDelta) return;

    let newX = pacman.x, newZ = pacman.z;
    if (canMove(gridPos.x, gridPos.z, newDirection)) {
      newX = pacman.x + moveDelta.x * speed;
      newZ = pacman.z + moveDelta.z * speed;

      const width = MAZE_LAYOUT[0].length;
      const newGridPos = worldToGrid(newX, newZ, mazeData.offsetX, mazeData.offsetZ);
      if (newGridPos.x < -1) newX = width + mazeData.offsetX - 0.5;
      else if (newGridPos.x >= width) newX = -1 + mazeData.offsetX + 0.5;
    } else {
      newX = cellCenterX;
      newZ = cellCenterZ;
    }

    const pelletIndex = pellets.findIndex((p) => Math.abs(p.x - newX) < 0.5 && Math.abs(p.z - newZ) < 0.5);
    if (pelletIndex !== -1) {
      const newPellets = [...pellets];
      newPellets.splice(pelletIndex, 1);
      set((state) => ({ pellets: newPellets, score: state.score + PELLET_SCORE }));
    }

    const powerIndex = powerPellets.findIndex((p) => Math.abs(p.x - newX) < 0.5 && Math.abs(p.z - newZ) < 0.5);
    if (powerIndex !== -1) {
      const newPowerPellets = [...powerPellets];
      newPowerPellets.splice(powerIndex, 1);
      get().activatePowerMode();
      set((state) => ({ powerPellets: newPowerPellets, score: state.score + POWER_PELLET_SCORE }));
    }

    if (get().pellets.length === 0 && get().powerPellets.length === 0) {
      set({ gameState: 'win' });
      const { score, highScore } = get();
      if (score > highScore) {
        localStorage.setItem('pacman-highscore', score.toString());
        set({ highScore: score });
      }
    }

    set({ pacman: { ...pacman, x: newX, z: newZ, direction: newDirection } });
  },

  updateGhosts: (deltaTime) => {
    const { ghosts, pacman, gameStartTime } = get();
    if (!gameStartTime) return;

    const elapsed = Date.now() - gameStartTime;
    const newGhosts = {};

    for (const ghostName of ['blinky', 'pinky', 'inky', 'clyde']) {
      const ghost = ghosts[ghostName];
      newGhosts[ghostName] = { ...ghost };
      const g = newGhosts[ghostName];

      if (g.state === 'waiting') {
        if (elapsed >= GHOST_RELEASE_TIMES[ghostName]) g.state = 'active';
        else continue;
      }

      if (g.eaten) continue;

      const speed = (g.frightened ? GHOST_FRIGHTENED_SPEED : GHOST_SPEED) * deltaTime;
      const gridPos = worldToGrid(g.x, g.z, mazeData.offsetX, mazeData.offsetZ);
      const cellCenterX = gridPos.x + mazeData.offsetX;
      const cellCenterZ = gridPos.z + mazeData.offsetZ;

      const moveDelta = DIRECTIONS[g.direction];
      if (!moveDelta) continue;

      const nextX = g.x + moveDelta.x * speed;
      const nextZ = g.z + moveDelta.z * speed;

      const crossingCenterX = (moveDelta.x > 0 && g.x < cellCenterX && nextX >= cellCenterX) || (moveDelta.x < 0 && g.x > cellCenterX && nextX <= cellCenterX);
      const crossingCenterZ = (moveDelta.z > 0 && g.z < cellCenterZ && nextZ >= cellCenterZ) || (moveDelta.z < 0 && g.z > cellCenterZ && nextZ <= cellCenterZ);
      const crossingCenter = crossingCenterX || crossingCenterZ;

      if (crossingCenter && (gridPos.x !== g.lastGridX || gridPos.z !== g.lastGridZ)) {
        g.lastGridX = gridPos.x;
        g.lastGridZ = gridPos.z;

        let overshoot = 0;
        if (moveDelta.x !== 0) overshoot = Math.abs(nextX - cellCenterX);
        else if (moveDelta.z !== 0) overshoot = Math.abs(nextZ - cellCenterZ);

        const pacmanGrid = worldToGrid(pacman.x, pacman.z, mazeData.offsetX, mazeData.offsetZ);
        const blinkyGrid = worldToGrid(newGhosts.blinky?.x ?? ghosts.blinky.x, newGhosts.blinky?.z ?? ghosts.blinky.z, mazeData.offsetX, mazeData.offsetZ);

        let targetX, targetZ;

        const scatterChasePattern = [
          { scatter: true, duration: 7000 }, { scatter: false, duration: 20000 },
          { scatter: true, duration: 7000 }, { scatter: false, duration: 20000 },
          { scatter: true, duration: 5000 }, { scatter: false, duration: Infinity },
        ];

        let timeAccum = 0, isScatterMode = false;
        for (const phase of scatterChasePattern) {
          if (elapsed < timeAccum + phase.duration) { isScatterMode = phase.scatter; break; }
          timeAccum += phase.duration;
        }

        if (g.frightened) {
          targetX = Math.floor(Math.random() * 28);
          targetZ = Math.floor(Math.random() * 31);
        } else if (isScatterMode) {
          switch (ghostName) {
            case 'blinky': targetX = 25; targetZ = 0; break;
            case 'pinky': targetX = 2; targetZ = 0; break;
            case 'inky': targetX = 27; targetZ = 30; break;
            case 'clyde': targetX = 0; targetZ = 30; break;
            default: targetX = 14; targetZ = 14;
          }
        } else {
          switch (ghostName) {
            case 'blinky':
              targetX = pacmanGrid.x; targetZ = pacmanGrid.z;
              break;
            case 'pinky': {
              const pacDir = DIRECTIONS[pacman.direction] || DIRECTIONS.RIGHT;
              targetX = pacmanGrid.x + pacDir.x * 4;
              targetZ = pacmanGrid.z + pacDir.z * 4;
              if (pacman.direction === 'UP') targetX -= 4;
              break;
            }
            case 'inky': {
              const pacDir2 = DIRECTIONS[pacman.direction] || DIRECTIONS.RIGHT;
              const pivotX = pacmanGrid.x + pacDir2.x * 2;
              const pivotZ = pacmanGrid.z + pacDir2.z * 2;
              targetX = pivotX + (pivotX - blinkyGrid.x);
              targetZ = pivotZ + (pivotZ - blinkyGrid.z);
              break;
            }
            case 'clyde': {
              const distToPacman = Math.abs(gridPos.x - pacmanGrid.x) + Math.abs(gridPos.z - pacmanGrid.z);
              if (distToPacman > 8) { targetX = pacmanGrid.x; targetZ = pacmanGrid.z; }
              else { targetX = 0; targetZ = 31; }
              break;
            }
            default: targetX = pacmanGrid.x; targetZ = pacmanGrid.z;
          }
        }

        const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        const reverseDir = opposite[g.direction];

        let bestDir = g.direction, bestDist = Infinity;
        for (const dir of ['UP', 'DOWN', 'LEFT', 'RIGHT']) {
          if (dir === reverseDir) continue;
          if (!canMove(gridPos.x, gridPos.z, dir)) continue;
          const delta = DIRECTIONS[dir];
          const dist = Math.pow(gridPos.x + delta.x - targetX, 2) + Math.pow(gridPos.z + delta.z - targetZ, 2);
          if (dist < bestDist) { bestDist = dist; bestDir = dir; }
        }
        if (bestDist === Infinity && canMove(gridPos.x, gridPos.z, reverseDir)) bestDir = reverseDir;

        g.direction = bestDir;
        g.x = cellCenterX; g.z = cellCenterZ;
        const newMoveDelta = DIRECTIONS[g.direction];
        if (newMoveDelta) { g.x += newMoveDelta.x * overshoot; g.z += newMoveDelta.z * overshoot; }
      } else {
        g.x = nextX; g.z = nextZ;
      }

      const width = MAZE_LAYOUT[0].length;
      const leftEdge = mazeData.offsetX - 1;
      const rightEdge = width + mazeData.offsetX;
      if (g.x < leftEdge) { g.x = rightEdge - 0.5; g.lastGridX = -999; }
      else if (g.x > rightEdge) { g.x = leftEdge + 0.5; g.lastGridX = -999; }
    }

    set({ ghosts: newGhosts });
  },

  activatePowerMode: () => {
    const { powerModeTimer, ghosts } = get();
    if (powerModeTimer) clearTimeout(powerModeTimer);

    const newGhosts = { blinky: { ...ghosts.blinky }, pinky: { ...ghosts.pinky }, inky: { ...ghosts.inky }, clyde: { ...ghosts.clyde } };
    for (const name of Object.keys(newGhosts)) {
      if (newGhosts[name].state === 'active' && !newGhosts[name].eaten) {
        newGhosts[name].frightened = true;
        const opposite = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
        newGhosts[name].direction = opposite[newGhosts[name].direction] || newGhosts[name].direction;
      }
    }

    set({ ghosts: newGhosts, powerMode: true, ghostsEatenInPowerMode: 0 });

    const timer = setTimeout(() => {
      const { ghosts: currentGhosts } = get();
      const updatedGhosts = {
        blinky: { ...currentGhosts.blinky, frightened: false },
        pinky: { ...currentGhosts.pinky, frightened: false },
        inky: { ...currentGhosts.inky, frightened: false },
        clyde: { ...currentGhosts.clyde, frightened: false },
      };
      set({ ghosts: updatedGhosts, powerMode: false, powerModeTimer: null });
    }, POWER_MODE_DURATION);

    set({ powerModeTimer: timer });
  },

  checkCollisions: () => {
    const { pacman, ghosts, ghostsEatenInPowerMode, lives, gameState } = get();
    if (gameState !== 'playing') return;

    for (const ghostName of ['blinky', 'pinky', 'inky', 'clyde']) {
      const ghost = ghosts[ghostName];
      if (ghost.eaten || ghost.state !== 'active') continue;

      const dist = Math.sqrt(Math.pow(pacman.x - ghost.x, 2) + Math.pow(pacman.z - ghost.z, 2));
      if (dist < 0.7) {
        if (ghost.frightened) {
          const ghostScore = GHOST_SCORE_BASE * Math.pow(2, ghostsEatenInPowerMode);
          const newGhosts = { blinky: { ...ghosts.blinky }, pinky: { ...ghosts.pinky }, inky: { ...ghosts.inky }, clyde: { ...ghosts.clyde } };
          newGhosts[ghostName].eaten = true;
          set({ ghosts: newGhosts, score: get().score + ghostScore, ghostsEatenInPowerMode: get().ghostsEatenInPowerMode + 1 });

          setTimeout(() => {
            const { ghosts: currentGhosts, powerMode: currentPowerMode } = get();
            const positions = getGhostStartPositions(mazeData.offsetX, mazeData.offsetZ);
            const respawnGhosts = { blinky: { ...currentGhosts.blinky }, pinky: { ...currentGhosts.pinky }, inky: { ...currentGhosts.inky }, clyde: { ...currentGhosts.clyde } };
            respawnGhosts[ghostName] = {
              x: positions[ghostName].x, z: positions[ghostName].z, direction: positions[ghostName].direction,
              state: 'active', frightened: currentPowerMode, eaten: false, lastGridX: -999, lastGridZ: -999,
            };
            set({ ghosts: respawnGhosts });
          }, 3000);
        } else {
          if (lives <= 1) {
            const { score, highScore } = get();
            if (score > highScore) { localStorage.setItem('pacman-highscore', score.toString()); set({ highScore: score }); }
            set({ gameState: 'gameover' });
          } else {
            set({
              lives: lives - 1,
              pacman: { x: mazeData.pacmanStart.x, z: mazeData.pacmanStart.z, direction: 'LEFT', nextDirection: 'LEFT', mouthOpen: true },
              ghosts: createInitialGhosts(),
              powerMode: false, gameState: 'ready',
            });
            setTimeout(() => set({ gameState: 'playing', gameStartTime: Date.now() }), READY_TIME);
          }
        }
        break;
      }
    }
  },
}));

export default useGameStore;
