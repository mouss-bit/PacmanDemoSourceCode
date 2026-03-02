import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import useGameStore from '../hooks/useGameStore';
import { PELLET_RADIUS, POWER_PELLET_RADIUS } from '../utils/constants';

function Pellet({ position }) {
  return (
    <mesh position={[position.x, 0.15, position.z]}>
      <sphereGeometry args={[PELLET_RADIUS, 8, 8]} />
      <meshStandardMaterial color="#ffddaa" emissive="#ffcc88" emissiveIntensity={0.5} />
    </mesh>
  );
}

function PowerPellet({ position }) {
  const meshRef = useRef();
  useFrame((state) => {
    if (meshRef.current) meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 5) * 0.2);
  });

  return (
    <group position={[position.x, 0.2, position.z]}>
      <mesh ref={meshRef}>
        <sphereGeometry args={[POWER_PELLET_RADIUS, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffff00" emissiveIntensity={0.8} />
      </mesh>
      <pointLight intensity={0.5} color="#ffff00" distance={2} />
    </group>
  );
}

export default function Pellets() {
  const pellets = useGameStore((state) => state.pellets);
  const powerPellets = useGameStore((state) => state.powerPellets);
  const gameState = useGameStore((state) => state.gameState);

  if (gameState === 'start') return null;

  return (
    <group>
      {pellets.map((pellet) => <Pellet key={pellet.id} position={pellet} />)}
      {powerPellets.map((pellet) => <PowerPellet key={pellet.id} position={pellet} />)}
    </group>
  );
}
