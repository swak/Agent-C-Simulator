'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useGameStore } from '@/stores/game-state';
import { GameUI } from '@/components/ui/GameUI';

// Dynamic import to avoid SSR issues with Three.js
const GameScene = dynamic(() => import('@/components/3d/Scene'), { ssr: false });

export default function Home() {
  const loadGame = useGameStore((state) => state.loadGame);
  const addBot = useGameStore((state) => state.addBot);
  const bots = useGameStore((state) => state.bots);

  useEffect(() => {
    // Initialize game state on mount
    const hasLoadedSave = loadGame();

    if (!hasLoadedSave) {
      // New game - add a starter bot
      if (bots.length === 0) {
        addBot({ type: 'miner', position: { x: 0, y: 0.5, z: 0 }, status: 'idle' });
      }
    }

    // Expose debug API for e2e tests
    if (typeof window !== 'undefined') {
      window.game = {
        debug: {
          addResources: (resources: Record<string, number>) => {
            Object.entries(resources).forEach(([type, amount]) => {
              useGameStore.getState().addResource(type, amount);
            });
          },
          setResources: (resources: Record<string, number>) => {
            const state = useGameStore.getState();
            state.resources = { ...state.resources, ...resources };
          },
          addBot: (config: Record<string, unknown>) => {
            useGameStore.getState().addBot(config as Partial<import('@/stores/game-state').Bot>);
          },
          unlockTechNode: (nodeId: string) => {
            useGameStore.getState().unlockTechNode(nodeId);
          },
          setProductionRate: (resource: string, rate: number) => {
            useGameStore.getState().recordProduction(resource, rate, 60000);
          },
          addInventoryItem: (type: string) => {
            const state = useGameStore.getState();
            state.inventory = [
              ...state.inventory,
              { id: `item-${Date.now()}`, type, quantity: 1 },
            ];
          },
        },
      };
    }
  }, [loadGame, addBot, bots.length]);

  return (
    <main className="w-full h-screen relative">
      <GameScene />
      <GameUI />
    </main>
  );
}
