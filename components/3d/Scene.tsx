'use client';

import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/rapier';
import { Suspense, useState, useCallback, useRef, useEffect } from 'react';
import { Terrain } from './Terrain';
import { Bot } from './Bot';
import { Resource } from './Resource';
import { Camera } from './Camera';
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
      clearWorldInstance();
    };
  }, []);

  return worldRef.current;
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
