import { CELL_TYPES } from './constants';

export const MAZE_LAYOUT = [
  '############################',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#O####.#####.##.#####.####O#',
  '#.####.#####.##.#####.####.#',
  '#..........................#',
  '#.####.##.########.##.####.#',
  '#.####.##.########.##.####.#',
  '#......##....##....##......#',
  '######.#####.##.#####.######',
  '     #.#####.##.#####.#     ',
  '     #.##          ##.#     ',
  '     #.## ###--### ##.#     ',
  '######.## #      # ##.######',
  'T     .   #      #   .     T',
  '######.## #      # ##.######',
  '     #.## ######## ##.#     ',
  '     #.##          ##.#     ',
  '     #.## ######## ##.#     ',
  '######.## ######## ##.######',
  '#............##............#',
  '#.####.#####.##.#####.####.#',
  '#.####.#####.##.#####.####.#',
  '#O..##......P  .......##..O#',
  '###.##.##.########.##.##.###',
  '###.##.##.########.##.##.###',
  '#......##....##....##......#',
  '#.##########.##.##########.#',
  '#.##########.##.##########.#',
  '#..........................#',
  '############################',
];

export function parseMaze(layout) {
  const walls = [];
  const pellets = [];
  const powerPellets = [];
  const tunnels = [];
  let pacmanStart = { x: 0, z: 0 };

  const height = layout.length;
  const width = layout[0].length;
  const offsetX = -width / 2 + 0.5;
  const offsetZ = -height / 2 + 0.5;

  for (let z = 0; z < height; z++) {
    for (let x = 0; x < width; x++) {
      const cell = layout[z]?.[x] || ' ';
      const worldX = x + offsetX;
      const worldZ = z + offsetZ;

      switch (cell) {
        case CELL_TYPES.WALL:
          walls.push({ x: worldX, z: worldZ });
          break;
        case CELL_TYPES.PELLET:
          pellets.push({ x: worldX, z: worldZ, id: `pellet-${x}-${z}` });
          break;
        case CELL_TYPES.POWER_PELLET:
          powerPellets.push({ x: worldX, z: worldZ, id: `power-${x}-${z}` });
          break;
        case 'P':
          pacmanStart = { x: worldX, z: worldZ };
          break;
        case CELL_TYPES.TUNNEL:
          tunnels.push({ x: worldX, z: worldZ, side: x < width / 2 ? 'left' : 'right' });
          break;
      }
    }
  }

  return { walls, pellets, powerPellets, pacmanStart, tunnels, width, height, offsetX, offsetZ };
}

export function isWall(layout, gridX, gridZ) {
  if (gridZ < 0 || gridZ >= layout.length) return true;
  if (gridX < 0 || gridX >= layout[0].length) return true;
  return layout[gridZ]?.[gridX] === '#';
}

export function isPassable(layout, gridX, gridZ) {
  return !isWall(layout, gridX, gridZ);
}

export function worldToGrid(worldX, worldZ, offsetX, offsetZ) {
  return { x: Math.round(worldX - offsetX), z: Math.round(worldZ - offsetZ) };
}

export function gridToWorld(gridX, gridZ, offsetX, offsetZ) {
  return { x: gridX + offsetX, z: gridZ + offsetZ };
}

export function getValidDirections(layout, gridX, gridZ) {
  const directions = [];
  if (isPassable(layout, gridX, gridZ - 1)) directions.push('UP');
  if (isPassable(layout, gridX, gridZ + 1)) directions.push('DOWN');
  if (isPassable(layout, gridX - 1, gridZ)) directions.push('LEFT');
  if (isPassable(layout, gridX + 1, gridZ)) directions.push('RIGHT');
  return directions;
}

export const mazeData = parseMaze(MAZE_LAYOUT);
