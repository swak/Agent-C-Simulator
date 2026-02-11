'use client';

import React, { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Sky, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Terrain } from './Terrain';
import { Bot } from './Bot';
import { Resource } from './Resource';
import { Camera } from './Camera';
import { HomeBase } from './HomeBase';
import { GameLoop } from './GameLoop';
import { useGameStore } from '@/stores/game-state';
import { createWorld, GameWorld } from '@/ecs/world';
import { createBot } from '@/ecs/entities/bot';
import { registerResourceNode } from '@/ecs/systems/resources';
import { setWorldInstance, clearWorldInstance } from '@/ecs/world-instance';

const RESOURCE_NODES: { id: string; type: 'wood' | 'stone' | 'iron'; position: [number, number, number] }[] = [
  { id: 'wood-1', type: 'wood', position: [-10, 0, -10] },
  { id: 'wood-2', type: 'wood', position: [-8, 0, -15] },
  { id: 'wood-3', type: 'wood', position: [-12, 0, -8] },
  { id: 'stone-1', type: 'stone', position: [10, 0, -10] },
  { id: 'stone-2', type: 'stone', position: [12, 0, -8] },
  { id: 'iron-1', type: 'iron', position: [0, 0, -20] },
  { id: 'iron-2', type: 'iron', position: [2, 0, -22] },
];

function LoadingScreen() {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-b from-gray-900 to-black z-20">
      <div className="text-center space-y-6">
        <h1 className="text-5xl font-bold font-mono text-cyan-400 tracking-wider">
          AGENT-C SIMULATOR
        </h1>
        <p className="text-lg text-gray-400">Designed by bots. Built by bots.</p>
        <p className="text-sm text-gray-500">
          Powered by <span className="text-cyan-500">miniature-guacamole</span>
        </p>
        <div className="flex justify-center gap-2 mt-8">
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse"></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-xs text-gray-600 font-mono mt-4">INITIALIZING SYSTEMS...</p>
      </div>
    </div>
  );
}

function SceneReady({ onReady }: { onReady: () => void }) {
  onReady();
  return null;
}

function useECSWorld(): GameWorld {
  const worldRef = useRef<GameWorld | null>(null);
  const bootstrappedRef = useRef(false);

  if (!worldRef.current) {
    worldRef.current = createWorld();

    // Register resource nodes
    for (const node of RESOURCE_NODES) {
      registerResourceNode(worldRef.current, {
        id: node.id,
        type: node.type,
        position: { x: node.position[0], y: node.position[1], z: node.position[2] },
        available: true,
      });
    }
  }

  // Publish world instance and bootstrap ECS entities from Zustand bots (one-time)
  useEffect(() => {
    if (!worldRef.current) return;
    setWorldInstance(worldRef.current);

    if (!bootstrappedRef.current) {
      bootstrappedRef.current = true;

      const bots = useGameStore.getState().bots;
      for (const bot of bots) {
        createBot(worldRef.current, {
          type: bot.type,
          position: bot.position
            ? { x: bot.position.x, y: bot.position.y, z: bot.position.z }
            : undefined,
        });
      }
    }

    return () => {
      worldRef.current = null;
      clearWorldInstance();
    };
  }, []);

  return worldRef.current;
}

const DAY_CYCLE_DURATION = 300 // 5 minutes in seconds

function DayNightCycle() {
  const ambientRef = useRef<THREE.AmbientLight>(null)
  const directionalRef = useRef<THREE.DirectionalLight>(null)
  const skyRef = useRef<any>(null)
  const fogRef = useRef<THREE.Fog>(null)

  useFrame((state) => {
    const elapsed = state.clock.getElapsedTime()
    const t = (elapsed % DAY_CYCLE_DURATION) / DAY_CYCLE_DURATION // 0→1 over cycle
    const sunAngle = t * Math.PI * 2 // full rotation

    // Sun position: rises in east, sets in west
    const sunY = Math.sin(sunAngle - Math.PI / 2) // -1 at midnight, 1 at noon
    const sunX = Math.cos(sunAngle - Math.PI / 2)
    const sunZ = 0.3

    // Normalize sun elevation (0 = horizon, 1 = zenith)
    const elevation = Math.max(0, sunY)
    const isNight = sunY < -0.1

    // Ambient light: bright at noon, dim at night
    if (ambientRef.current) {
      ambientRef.current.intensity = isNight ? 0.15 : 0.3 + elevation * 0.4
    }

    // Directional light: intensity + warm color at sunrise/sunset
    if (directionalRef.current) {
      directionalRef.current.intensity = isNight ? 0.1 : 0.3 + elevation * 0.5
      directionalRef.current.position.set(sunX * 20, Math.max(sunY * 20, 2), sunZ * 20)

      // Color: warm orange near horizon, white at noon, blue at night
      if (isNight) {
        directionalRef.current.color.setHex(0x334466)
      } else if (elevation < 0.3) {
        directionalRef.current.color.setHex(0xff9955)
      } else {
        directionalRef.current.color.setHex(0xffffff)
      }
    }

    // Sky sun position
    if (skyRef.current) {
      skyRef.current.material.uniforms.sunPosition.value.set(sunX, Math.max(sunY, -0.05), sunZ)
    }

    // Fog color matches sky tone
    if (fogRef.current) {
      if (isNight) {
        fogRef.current.color.setHex(0x1a1a2e)
      } else if (elevation < 0.3) {
        fogRef.current.color.setHex(0xd4a574)
      } else {
        fogRef.current.color.setHex(0x87ceeb)
      }
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.6} />
      <directionalLight
        ref={directionalRef}
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
      <fog ref={fogRef} attach="fog" args={['#87CEEB', 40, 100]} />
      <Sky
        ref={skyRef}
        distance={450000}
        sunPosition={[0, 1, 0]}
      />
    </>
  )
}

export default function Scene() {
  const bots = useGameStore((state) => state.bots);
  const [loading, setLoading] = useState(true);
  const handleReady = useCallback(() => setLoading(false), []);
  const world = useECSWorld();

  return (
    <>
      {loading && <LoadingScreen />}
      <Canvas
        shadows
        camera={{ position: [20, 20, 20], fov: 50 }}
        style={{ background: 'linear-gradient(to bottom, #87CEEB 0%, #E0F6FF 100%)' }}
      >
        <Suspense fallback={null}>
          <DayNightCycle />

          <Physics gravity={[0, -9.81, 0]}>
            <Terrain />
            <HomeBase />

            {/* ContactShadows for ground shadows */}
            <ContactShadows
              position={[0, 0.01, 0]}
              opacity={0.4}
              scale={50}
              blur={1.5}
              far={20}
            />

            {/* Resource nodes */}
            {RESOURCE_NODES.map((node) => (
              <Resource key={node.id} type={node.type} position={node.position} />
            ))}

            {/* Render bots */}
            {bots.map((bot) => (
              <Bot key={bot.id} bot={bot} />
            ))}
          </Physics>

          <GameLoop world={world} />
          <Camera />
          <SceneReady onReady={handleReady} />
        </Suspense>
      </Canvas>
    </>
  );
}
