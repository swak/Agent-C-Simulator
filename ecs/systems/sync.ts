/**
 * ECS-to-Zustand Sync System
 *
 * Synchronizes ECS bot state to Zustand store for UI rendering:
 * - Position updates
 * - Energy levels
 * - AI state to status mapping
 * - Task information
 */

import { GameWorld } from '@/ecs/world'
import { BotEntity } from '@/ecs/entities/bot'
import { useGameStore, Bot } from '@/stores/game-state'

/**
 * Map ECS AI state to Zustand status
 */
function mapAIStateToStatus(aiState: string): Bot['status'] {
  switch (aiState) {
    case 'idle':
      return 'idle'
    case 'moving':
      return 'moving'
    case 'gathering':
      return 'working'
    case 'blocked':
      return 'blocked'
    default:
      return 'idle'
  }
}

/**
 * Sync all ECS bot entities to Zustand store
 */
export function syncECSToZustand(world: GameWorld): void {
  const store = useGameStore.getState()
  const currentBots = store.bots
  const botMap = new Map(currentBots.map((b) => [b.id, b]))

  // Iterate through all ECS entities
  for (const entity of world.entities) {
    const bot = entity as BotEntity

    // Skip if not a bot or missing essential components
    if (!bot.id || !bot.botType) continue

    const botId = `bot-${bot.id}`
    const existingBot = botMap.get(botId)

    // Create Zustand bot data
    const zustandBot: Bot = {
      id: botId,
      type: bot.botType,
      position: bot.position
        ? {
            x: bot.position.x,
            y: bot.position.y,
            z: bot.position.z,
          }
        : existingBot?.position || { x: 0, y: 0, z: 0 },
      status: bot.aiState
        ? mapAIStateToStatus(bot.aiState.current)
        : existingBot?.status || 'idle',
      energy: bot.energy?.current ?? existingBot?.energy ?? 100,
      currentTask: bot.task
        ? {
            type: bot.task.type,
            resourceType: bot.task.resourceType,
            progress: bot.task.progress,
          }
        : undefined,
    }

    if (existingBot) {
      // Update existing bot
      botMap.set(botId, zustandBot)
    } else {
      // Add new bot
      botMap.set(botId, zustandBot)
    }
  }

  // Update store with synced bots
  useGameStore.setState({
    bots: Array.from(botMap.values()),
  })
}
