import React, { useMemo } from 'react';
import * as THREE from 'three';
import { mazeData } from '../utils/mazeData';
import { CELL_SIZE, WALL_HEIGHT } from '../utils/constants';

export default function Maze() {
  const wallInstances = useMemo(() => mazeData.walls.map((wall, index) => ({
    position: [wall.x * CELL_SIZE, WALL_HEIGHT / 2, wall.z * CELL_SIZE],
    key: `wall-${index}`,
  })), []);

  const gridHelper = useMemo(() => ({
    width: mazeData.width * CELL_SIZE,
    height: mazeData.height * CELL_SIZE,
  }), []);

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
        <planeGeometry args={[gridHelper.width + 4, gridHelper.height + 4]} />
        <meshStandardMaterial color="#050510" metalness={0.2} roughness={0.9} />
      </mesh>
      <gridHelper args={[Math.max(gridHelper.width, gridHelper.height), Math.max(mazeData.width, mazeData.height), '#111133', '#0a0a22']} position={[0, 0.01, 0]} />
      {wallInstances.map(({ position, key }) => (
        <mesh key={key} position={position} castShadow receiveShadow>
          <boxGeometry args={[CELL_SIZE * 0.95, WALL_HEIGHT, CELL_SIZE * 0.95]} />
          <meshStandardMaterial color="#2020ff" emissive="#0000aa" emissiveIntensity={0.4} metalness={0.6} roughness={0.3} />
        </mesh>
      ))}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <ringGeometry args={[Math.max(gridHelper.width, gridHelper.height) / 2 + 1, Math.max(gridHelper.width, gridHelper.height) / 2 + 2, 64]} />
        <meshBasicMaterial color="#0044ff" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <pointLight position={[0, 5, 0]} intensity={0.5} color="#0066ff" distance={50} />
    </group>
  );
}
