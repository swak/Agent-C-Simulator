'use client';

import { Canvas, extend } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense } from 'react';
import * as THREE from 'three';
import { Terrain } from './Terrain';
import { Bot } from './Bot';
import { Resource } from './Resource';
import { Camera } from './Camera';
import { useGameStore } from '@/stores/game-state';

// Extend R3F with Three.js primitives
extend(THREE);

export default function Scene() {
  const bots = useGameStore((state) => state.bots);

  return (
    <Canvas
      shadows
      camera={{ position: [20, 20, 20], fov: 50 }}
      style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 5]}
          intensity={0.8}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
          shadow-camera-far={50}
          shadow-camera-left={-25}
          shadow-camera-right={25}
          shadow-camera-top={25}
          shadow-camera-bottom={-25}
        />
        <hemisphereLight args={['#87CEEB', '#7CBA5C', 0.4]} />

        <fog attach="fog" args={['#87CEEB', 40, 100]} />

        <Physics gravity={[0, -9.81, 0]}>
          <Terrain />

          {/* Resource nodes */}
          <Resource type="wood" position={[-10, 0, -10]} />
          <Resource type="wood" position={[-8, 0, -15]} />
          <Resource type="wood" position={[-12, 0, -8]} />

          <Resource type="stone" position={[10, 0, -10]} />
          <Resource type="stone" position={[12, 0, -8]} />

          <Resource type="iron" position={[0, 0, -20]} />
          <Resource type="iron" position={[2, 0, -22]} />

          {/* Render bots */}
          {bots.map((bot) => (
            <Bot key={bot.id} bot={bot} />
          ))}
        </Physics>

        <Camera />
      </Suspense>
    </Canvas>
  );
}
