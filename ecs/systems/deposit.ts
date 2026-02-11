/**
 * Deposit System
 *
 * Handles resource deposit at base:
 * - Check if bot is at base (distance < 1.0)
 * - Transfer resources from bot inventory to game store
 * - Clear bot inventory
 * - Transition bot to idle state
 */

import { BotEntity } from '@/ecs/entities/bot'
import { GameWorld } from '@/ecs/world'
import { useGameStore } from '@/stores/game-state'
import { distance3D } from '@/utils/math'
import { BASE_POSITION } from '@/utils/constants'
const DEPOSIT_DISTANCE_THRESHOLD = 1.0

/**
 * Check if bot can deposit resources (at base with inventory)
 */
export function canDeposit(bot: BotEntity): boolean {
  const position = bot.position
  const inventory = bot.inventory

  if (!position || !inventory) return false
  if (inventory.items.length === 0) return false

  // Calculate distance to base
  const distance = distance3D(position, BASE_POSITION)

  return distance < DEPOSIT_DISTANCE_THRESHOLD
}

/**
 * Deposit resources from bot inventory to game store
 */
export function depositResources(
  bot: BotEntity,
  world: GameWorld,
  options?: { trackProduction?: boolean; duration?: number }
): void {
  if (!canDeposit(bot)) return

  const inventory = bot.inventory
  if (!inventory) return

  // Count resources by type
  const resourceCounts: Record<string, number> = {}
  for (const item of inventory.items) {
    resourceCounts[item] = (resourceCounts[item] || 0) + 1
  }

  // Transfer to game store
  const store = useGameStore.getState()
  for (const [resourceType, count] of Object.entries(resourceCounts)) {
    // Only add known resource types
    if (['wood', 'stone', 'iron', 'crystals'].includes(resourceType)) {
      store.addResource(resourceType, count)

      // Track production rate if requested
      if (options?.trackProduction && options?.duration) {
        store.recordProduction(resourceType, count, options.duration)
      }
    }
  }

  // Clear bot inventory
  bot.inventory = { items: [] }

  // Transition to idle
  bot.aiState = { current: 'idle' }
  if (bot.task) {
    bot.task = {
      ...bot.task,
      active: false,
    }
  }
}
