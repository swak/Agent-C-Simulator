/**
 * ECS World Singleton
 *
 * Module-level reference that bridges the R3F Canvas boundary.
 * Scene sets it on mount; HUD, Settings, page.tsx read it.
 */

import { GameWorld } from '@/ecs/world'

let worldInstance: GameWorld | null = null

export function setWorldInstance(world: GameWorld): void {
  worldInstance = world
}

export function getWorldInstance(): GameWorld | null {
  return worldInstance
}

export function clearWorldInstance(): void {
  worldInstance = null
}
