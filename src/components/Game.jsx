import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Stars } from '@react-three/drei';
import * as THREE from 'three';
import Maze from './Maze';
import PacMan from './PacMan';
import Ghosts from './Ghost';
import Pellets from './Pellets';
import useGameStore from '../hooks/useGameStore';
import useKeyboard from '../hooks/useKeyboard';

function GameLoop() {
  const update = useGameStore((state) => state.update);
  const gameState = useGameStore((state) => state.gameState);
  const lastTimeRef = useRef(Date.now());

  useFrame(() => {
    if (gameState !== 'playing') return;
    const now = Date.now();
    const deltaTime = Math.min((now - lastTimeRef.current) / 1000, 0.1);
    lastTimeRef.current = now;
    update(deltaTime);
  });

  return null;
}

function CameraAngleTracker({ controlsRef }) {
  const setCameraAngle = useGameStore((state) => state.setCameraAngle);
  useFrame(() => {
    if (controlsRef.current) setCameraAngle(controlsRef.current.getAzimuthalAngle());
  });
  return null;
}

function CameraController() {
  const { camera } = useThree();
  useEffect(() => { camera.position.set(0, 35, 25); camera.lookAt(0, 0, 0); }, [camera]);
  return null;
}

function Scene({ controlsRef }) {
  return (
    <>
      <ambientLight intensity={0.3} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} castShadow shadow-mapSize={[2048, 2048]} shadow-camera-far={50} shadow-camera-left={-20} shadow-camera-right={20} shadow-camera-top={20} shadow-camera-bottom={-20} />
      <pointLight position={[-15, 10, -15]} intensity={0.4} color="#ff00ff" />
      <pointLight position={[15, 10, 15]} intensity={0.4} color="#00ffff" />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <Maze />
      <PacMan />
      <Ghosts />
      <Pellets />
      <GameLoop />
      <CameraController />
      <CameraAngleTracker controlsRef={controlsRef} />
    </>
  );
}

export default function Game() {
  useKeyboard();
  const controlsRef = useRef();

  return (
    <Canvas shadows gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping, outputColorSpace: THREE.SRGBColorSpace }} style={{ background: '#000000' }}>
      <PerspectiveCamera makeDefault position={[0, 35, 25]} fov={50} near={0.1} far={200} />
      <OrbitControls ref={controlsRef} enablePan={false} enableZoom={true} minDistance={20} maxDistance={60} minPolarAngle={Math.PI / 6} maxPolarAngle={Math.PI / 2.5} target={[0, 0, 0]} />
      <fog attach="fog" args={['#000011', 30, 80]} />
      <Scene controlsRef={controlsRef} />
    </Canvas>
  );
}
