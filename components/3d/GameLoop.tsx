'use client';

import { useFrame } from '@react-three/fiber';
import { GameWorld } from '@/ecs/world';
import { updateWorld } from '@/ecs/systems/update';
import { syncECSToZustand } from '@/ecs/systems/sync';

interface GameLoopProps {
  world: GameWorld;
}

export function GameLoop({ world }: GameLoopProps) {
  useFrame((_state, delta) => {
    // Cap delta to prevent large jumps (e.g. after tab switch)
    const clampedDelta = Math.min(delta, 0.1);
    updateWorld(world, clampedDelta);
    syncECSToZustand(world);
  });

  return null;
}
