import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../hooks/useGameStore';
import { GHOST_RADIUS, GHOST_COLORS, GHOST_FRIGHTENED_COLOR } from '../utils/constants';

function GhostMesh({ name }) {
  const groupRef = useRef();
  const materialRef = useRef();

  const geometry = useMemo(() => new THREE.CapsuleGeometry(GHOST_RADIUS * 0.8, GHOST_RADIUS * 0.6, 8, 16), []);

  useFrame((state) => {
    const storeState = useGameStore.getState();
    const ghost = storeState.ghosts[name];
    const gameState = storeState.gameState;

    if (!groupRef.current || !ghost) return;

    groupRef.current.position.x = ghost.x;
    groupRef.current.position.z = ghost.z;

    if (gameState === 'playing') {
      const offset = { blinky: 0, pinky: 0.5, inky: 1, clyde: 1.5 }[name] || 0;
      groupRef.current.position.y = GHOST_RADIUS + Math.sin(state.clock.elapsedTime * 3 + offset) * 0.08;
    } else {
      groupRef.current.position.y = GHOST_RADIUS;
    }

    if (materialRef.current) {
      let color = GHOST_COLORS[name];
      let emissiveIntensity = 0.3;

      if (ghost.eaten) {
        materialRef.current.opacity = 0;
        materialRef.current.transparent = true;
      } else {
        materialRef.current.opacity = 1;
        materialRef.current.transparent = false;

        if (ghost.frightened) {
          const flash = Math.floor(state.clock.elapsedTime * 5) % 2 === 0;
          color = flash ? GHOST_FRIGHTENED_COLOR : '#4444ff';
          emissiveIntensity = 0.6;
        }

        materialRef.current.color.set(color);
        materialRef.current.emissive.set(color);
        materialRef.current.emissiveIntensity = emissiveIntensity;
      }
    }

    groupRef.current.visible = !(ghost.state === 'waiting' && ghost.eaten);
  });

  return (
    <group ref={groupRef} position={[0, GHOST_RADIUS, 0]}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial ref={materialRef} color={GHOST_COLORS[name]} emissive={GHOST_COLORS[name]} emissiveIntensity={0.3} metalness={0.2} roughness={0.5} />
      </mesh>
      <mesh position={[-0.12, 0.15, 0.25]}><sphereGeometry args={[0.12, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[-0.12, 0.15, 0.35]}><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color="#0000ff" /></mesh>
      <mesh position={[0.12, 0.15, 0.25]}><sphereGeometry args={[0.12, 16, 16]} /><meshBasicMaterial color="#ffffff" /></mesh>
      <mesh position={[0.12, 0.15, 0.35]}><sphereGeometry args={[0.06, 16, 16]} /><meshBasicMaterial color="#0000ff" /></mesh>
      <pointLight intensity={0.5} color={GHOST_COLORS[name]} distance={2} />
    </group>
  );
}

export default function Ghosts() {
  const gameState = useGameStore((state) => state.gameState);
  if (gameState === 'start') return null;

  return (
    <>
      <GhostMesh name="blinky" />
      <GhostMesh name="pinky" />
      <GhostMesh name="inky" />
      <GhostMesh name="clyde" />
    </>
  );
}
