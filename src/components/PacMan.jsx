import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useGameStore from '../hooks/useGameStore';
import { PACMAN_RADIUS } from '../utils/constants';

export default function PacMan() {
  const meshRef = useRef();
  const { x, z, direction, mouthOpen } = useGameStore((state) => state.pacman);
  const gameState = useGameStore((state) => state.gameState);

  const geometry = useMemo(() => {
    const mouthAngle = mouthOpen ? Math.PI / 6 : Math.PI / 20;
    return new THREE.SphereGeometry(PACMAN_RADIUS, 32, 32, mouthAngle, Math.PI * 2 - mouthAngle * 2, 0, Math.PI);
  }, [mouthOpen]);

  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#ffff00', emissive: '#ffcc00', emissiveIntensity: 0.5, metalness: 0.3, roughness: 0.4,
  }), []);

  const rotation = useMemo(() => {
    switch (direction) {
      case 'UP': return [0, -Math.PI / 2, 0];
      case 'DOWN': return [0, Math.PI / 2, 0];
      case 'LEFT': return [0, Math.PI, 0];
      case 'RIGHT': return [0, 0, 0];
      default: return [0, 0, 0];
    }
  }, [direction]);

  useFrame((state) => {
    if (meshRef.current && gameState === 'playing') {
      meshRef.current.position.y = PACMAN_RADIUS + Math.sin(state.clock.elapsedTime * 5) * 0.05;
    }
  });

  if (gameState === 'start') return null;

  return (
    <group position={[x, PACMAN_RADIUS, z]} rotation={rotation}>
      <mesh ref={meshRef} geometry={geometry} material={material} castShadow>
        <mesh position={[0.15, 0.2, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </mesh>
      <pointLight position={[0, 0, 0]} intensity={0.8} color="#ffff00" distance={3} />
    </group>
  );
}
