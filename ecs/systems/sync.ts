/**
 * ECS-to-Zustand Sync System
 *
 * Synchronizes ECS bot state to Zustand store for UI rendering.
 * ECS is the single source of truth — sync REPLACES the Zustand bots array
 * entirely from ECS entities each frame (no merge with stale Zustand data).
 */

import { GameWorld } from '@/ecs/world'
import { BotEntity } from '@/ecs/entities/bot'
import { useGameStore, Bot } from '@/stores/game-state'

/**
 * Map ECS AI state + task to Zustand status.
 * 'moving' with a 'return' task maps to 'returning'.
 */
function mapAIStateToStatus(aiState: string, taskType?: string): Bot['status'] {
  switch (aiState) {
    case 'idle':
      return 'idle'
    case 'moving':
      return taskType === 'return' ? 'returning' : 'moving'
    case 'gathering':
      return 'working'
    case 'blocked':
      return 'blocked'
    default:
      return 'idle'
  }
}

/**
 * Sync all ECS bot entities to Zustand store.
 * Builds the bots array purely from ECS entities (replace, not merge).
 */
export function syncECSToZustand(world: GameWorld): void {
  const bots: Bot[] = []

  for (const entity of world.entities) {
    const bot = entity as BotEntity

    // Skip non-bot entities
    if (!bot.id || !bot.botType) continue

    bots.push({
      id: `bot-${bot.id}`,
      type: bot.botType,
      position: bot.position
        ? { x: bot.position.x, y: bot.position.y, z: bot.position.z }
        : { x: 0, y: 0, z: 0 },
      status: bot.aiState
        ? mapAIStateToStatus(bot.aiState.current, bot.task?.type)
        : 'idle',
      energy: bot.energy?.current ?? 100,
      currentTask: bot.task
        ? {
            type: bot.task.type,
            resourceType: bot.task.resourceType,
            progress: bot.task.progress,
          }
        : undefined,
    })
  }

  useGameStore.setState({ bots })
}
