/**
 * Bot AI System
 *
 * Autonomous bot behavior state machine with type-dispatched specialization:
 * - Miner: Gather nearest preferred resource (default behavior)
 * - Hauler: Pick up items from other bots, ferry to base; fallback to gathering
 * - Scout: Pick random resource nodes for exploration variety
 * - Crafter: Auto-craft components at base; fallback to gathering
 *
 * Common states: idle, moving, gathering, blocked, crafting
 */

import { BotEntity } from '@/ecs/entities/bot'
import { GameWorld, BotType, Position } from '@/ecs/world'
import { findNearestResource, claimResourceNode, releaseResourceNode } from './resources'
import { calculatePath } from './pathfinding'
import { canDeposit } from './deposit'
import { distance3D } from '@/utils/math'
import { useGameStore } from '@/stores/game-state'
import { BASE_POSITION, BASE_RADIUS, ENERGY_FULL_THRESHOLD } from '@/utils/constants'

const ARRIVAL_THRESHOLD = 1.0
const ENERGY_RESUME_THRESHOLD = 20

export const RESOURCE_PREFERENCES: Record<BotType, string[]> = {
  miner: ['iron', 'stone', 'wood', 'crystals'],
  hauler: ['wood', 'stone', 'iron', 'crystals'],
  scout: ['crystals', 'iron', 'stone', 'wood'],
  crafter: ['stone', 'wood', 'iron', 'crystals'],
}

const CRAFTER_RECIPE_PRIORITY = ['gear-component', 'basic-component', 'advanced-component']
const RECIPE_DURATIONS: Record<string, number> = {
  'gear-component': 4000,
  'basic-component': 3000,
  'advanced-component': 8000,
}

/**
 * Find a random available resource node of the given type.
 * Used by scouts for exploration variety.
 */
export function findRandomResource(
  world: GameWorld,
  resourceType: string,
): { id: string; type: string; position: Position } | null {
  if (!world.resourceRegistry) return null

  const nodes = Array.from(world.resourceRegistry.values()).filter(
    (node) => node.type === resourceType && node.available
  )

  if (nodes.length === 0) return null

  const randomIndex = Math.floor(Math.random() * nodes.length)
  return nodes[randomIndex]
}

/**
 * Find the nearest non-hauler bot that has items in inventory.
 * Used by haulers to pick up items from other bots.
 */
export function findBotWithItems(
  world: GameWorld,
  haulerPosition: Position,
  haulerBotId: number,
): { botId: number; position: Position } | null {
  let nearest: { botId: number; position: Position } | null = null
  let minDistance = Infinity

  for (const entity of world.entities) {
    const bot = entity as BotEntity
    if (!bot.id || !bot.botType || !bot.position || !bot.inventory) continue

    // Skip self
    if (bot.id === haulerBotId) continue

    // Skip other haulers
    if (bot.botType === 'hauler') continue

    // Skip bots with empty inventory
    if (bot.inventory.items.length === 0) continue

    const dist = distance3D(haulerPosition, bot.position)
    if (dist < minDistance) {
      minDistance = dist
      nearest = { botId: bot.id, position: { ...bot.position } }
    }
  }

  return nearest
}

/**
 * Update bot AI decision making
 */
export function updateBotAI(bot: BotEntity, world: GameWorld, deltaMs: number): void {
  const aiState = bot.aiState
  const energy = bot.energy
  const position = bot.position
  const inventory = bot.inventory
  const stats = bot.stats
  const task = bot.task

  if (!aiState || !position || !inventory || !stats) return

  // Check for energy-based resume (energy > 20)
  if (
    aiState.current === 'idle' &&
    task &&
    !task.active &&
    task.resourceType &&
    task.target &&
    energy &&
    energy.current > ENERGY_RESUME_THRESHOLD
  ) {
    // Try to resume previous task
    const targetResource = findNearestResource(world, task.resourceType, position)
    if (targetResource) {
      // Recalculate path from current position
      const path = calculatePath(position, task.target)
      if (path.success) {
        bot.path = {
          waypoints: path.waypoints,
          currentIndex: 0,
        }
        bot.task = {
          ...task,
          active: true,
        }
        bot.aiState = { current: 'moving' }
        return
      }
    }
  }

  // Check if inventory is full (trigger return for active bots)
  if (inventory.items.length >= stats.capacity) {
    if (aiState.current === 'gathering' || aiState.current === 'moving') {
      // Release resource node if claimed
      if (task?.targetNodeId) {
        releaseResourceNode(world, task.targetNodeId)
      }

      // Calculate path to base
      const path = calculatePath(position, BASE_POSITION)
      if (path.success) {
        bot.path = {
          waypoints: path.waypoints,
          currentIndex: 0,
        }
        bot.task = {
          type: 'return',
          active: true,
          progress: 0,
        }
        bot.aiState = { current: 'moving' }
      }
      return
    }
    // Idle bots with full inventory fall through to state machine (handleIdleState)
  }

  // State machine logic
  switch (aiState.current) {
    case 'idle':
      handleIdleState(bot, world)
      break

    case 'moving':
      handleMovingState(bot, world)
      break

    case 'gathering':
      // Check if inventory is full
      if (inventory.items.length >= stats.capacity) {
        // Stop gathering, trigger return
        bot.aiState = { current: 'idle' }
      }
      break

    case 'crafting':
      handleCraftingState(bot, deltaMs)
      break

    default:
      // Unknown state - this should never happen with proper typing
      break
  }
}

/**
 * Handle idle state: dispatch to type-specific handler after common checks
 */
function handleIdleState(bot: BotEntity, world: GameWorld): void {
  const position = bot.position
  const inventory = bot.inventory
  const stats = bot.stats
  const energy = bot.energy
  const task = bot.task

  if (!position || !inventory || !stats) return

  // Don't select new tasks if we have a paused task and energy <= threshold
  if (task && !task.active && task.resourceType && energy && energy.current <= ENERGY_RESUME_THRESHOLD) {
    // Wait for energy to recharge above threshold before resuming
    return
  }

  // Check if at base and should deposit
  if (canDeposit(bot)) {
    // Let deposit system handle this
    return
  }

  // Stay at base to recharge if energy is low
  if (energy && energy.current < ENERGY_FULL_THRESHOLD) {
    const distToBase = distance3D(position, BASE_POSITION)
    if (distToBase < BASE_RADIUS) {
      // Stay idle at base until energy reaches threshold
      return
    }
  }

  // Check if inventory is full
  if (inventory.items.length >= stats.capacity) {
    // Return to base
    const path = calculatePath(position, BASE_POSITION)
    if (path.success) {
      bot.path = {
        waypoints: path.waypoints,
        currentIndex: 0,
      }
      bot.task = {
        type: 'return',
        active: true,
        progress: 0,
      }
      bot.aiState = { current: 'moving' }
    }
    return
  }

  // Type-dispatched idle behavior
  const botType = bot.botType || 'miner'
  switch (botType) {
    case 'hauler':
      handleHaulerIdle(bot, world)
      break
    case 'scout':
      handleScoutIdle(bot, world)
      break
    case 'crafter':
      handleCrafterIdle(bot, world)
      break
    case 'miner':
    default:
      handleMinerIdle(bot, world)
      break
  }
}

/**
 * Miner idle: select nearest preferred resource (original behavior)
 */
function handleMinerIdle(bot: BotEntity, world: GameWorld): void {
  const position = bot.position!
  const botType = bot.botType || 'miner'
  const resourceTypes = RESOURCE_PREFERENCES[botType]
  let selectedResource = null

  for (const resourceType of resourceTypes) {
    const nearest = findNearestResource(world, resourceType, position)
    if (nearest) {
      selectedResource = nearest
      break
    }
  }

  if (!selectedResource) return

  claimResourceNode(world, selectedResource.id)

  const path = calculatePath(position, selectedResource.position)
  if (path.success) {
    bot.path = {
      waypoints: path.waypoints,
      currentIndex: 0,
    }
    bot.task = {
      type: 'gather',
      resourceType: selectedResource.type,
      target: selectedResource.position,
      targetNodeId: selectedResource.id,
      active: true,
      progress: 0,
      duration: 2000,
    }
    bot.aiState = { current: 'moving' }
  }
}

/**
 * Hauler idle: find nearest non-hauler bot with items, path to it for pickup.
 * Fallback to normal gathering if no bots have items.
 */
function handleHaulerIdle(bot: BotEntity, world: GameWorld): void {
  const position = bot.position!
  const botId = bot.id!

  const target = findBotWithItems(world, position, botId)
  if (target) {
    const path = calculatePath(position, target.position)
    if (path.success) {
      bot.path = {
        waypoints: path.waypoints,
        currentIndex: 0,
      }
      bot.task = {
        type: 'pickup',
        active: true,
        progress: 0,
        target: target.position,
        targetBotId: target.botId,
      }
      bot.aiState = { current: 'moving' }
      return
    }
  }

  // Fallback: gather normally
  handleMinerIdle(bot, world)
}

/**
 * Scout idle: pick a random resource node instead of nearest.
 * Creates exploration variety without complex fog-of-war.
 */
function handleScoutIdle(bot: BotEntity, world: GameWorld): void {
  const position = bot.position!
  const resourceTypes = RESOURCE_PREFERENCES['scout']
  let selectedResource = null

  for (const resourceType of resourceTypes) {
    const random = findRandomResource(world, resourceType)
    if (random) {
      selectedResource = random
      break
    }
  }

  if (!selectedResource) return

  claimResourceNode(world, selectedResource.id)

  const path = calculatePath(position, selectedResource.position)
  if (path.success) {
    bot.path = {
      waypoints: path.waypoints,
      currentIndex: 0,
    }
    bot.task = {
      type: 'gather',
      resourceType: selectedResource.type,
      target: selectedResource.position,
      targetNodeId: selectedResource.id,
      active: true,
      progress: 0,
      duration: 2000,
    }
    bot.aiState = { current: 'moving' }
  }
}

/**
 * Crafter idle: auto-craft components at base if possible.
 * Falls back to gathering if not at base or nothing to craft.
 */
function handleCrafterIdle(bot: BotEntity, world: GameWorld): void {
  const position = bot.position!
  const energy = bot.energy

  // Only craft at base with sufficient energy
  const distToBase = distance3D(position, BASE_POSITION)
  if (distToBase < BASE_RADIUS && energy && energy.current > 20) {
    const store = useGameStore.getState()

    for (const recipeId of CRAFTER_RECIPE_PRIORITY) {
      if (store.canCraftRecipe(recipeId)) {
        store.craftItem(recipeId)

        const duration = RECIPE_DURATIONS[recipeId] || 3000
        bot.task = {
          type: 'craft',
          active: true,
          progress: 0,
          duration,
        }
        bot.aiState = { current: 'crafting' }
        return
      }
    }
  }

  // Fallback: gather normally
  handleMinerIdle(bot, world)
}

/**
 * Handle crafting state: progress cooldown timer, return to idle when done.
 */
function handleCraftingState(bot: BotEntity, deltaMs: number): void {
  const task = bot.task
  if (!task || task.type !== 'craft') {
    bot.aiState = { current: 'idle' }
    return
  }

  const duration = task.duration || 3000
  const newProgress = (task.progress || 0) + (deltaMs / duration) * 100

  if (newProgress >= 100) {
    bot.task = { ...task, progress: 100, active: false }
    bot.aiState = { current: 'idle' }
  } else {
    bot.task = { ...task, progress: newProgress }
  }
}

/**
 * Handle moving state: check if arrived at destination
 */
function handleMovingState(bot: BotEntity, world: GameWorld): void {
  const position = bot.position
  const path = bot.path
  const task = bot.task

  if (!position || !path || !task) return

  // Check if path is complete
  if (path.waypoints.length === 0 || path.currentIndex >= path.waypoints.length) {
    // Path complete
    if (task.type === 'gather' && task.target) {
      // Check if at resource
      const distance = distance3D(position, task.target)

      if (distance < ARRIVAL_THRESHOLD) {
        // Arrived at resource, start gathering
        bot.aiState = { current: 'gathering' }
      } else {
        // Not at resource, recalculate path
        const newPath = calculatePath(position, task.target)
        if (newPath.success) {
          bot.path = {
            waypoints: newPath.waypoints,
            currentIndex: 0,
          }
        }
      }
    } else if (task.type === 'return') {
      // Check if at base
      const distance = distance3D(position, BASE_POSITION)

      if (distance < ARRIVAL_THRESHOLD) {
        // Arrived at base
        bot.aiState = { current: 'idle' }
      }
    } else if (task.type === 'pickup' && task.target && task.targetBotId !== undefined) {
      handlePickupArrival(bot, world)
    }
  }
}

/**
 * Handle arrival at pickup target bot.
 * Transfer items from target bot to hauler, respecting capacity.
 */
function handlePickupArrival(bot: BotEntity, world: GameWorld): void {
  const position = bot.position!
  const task = bot.task!
  const inventory = bot.inventory!
  const stats = bot.stats!

  // Find target bot
  const targetBot = world.entities.find(
    (e) => (e as BotEntity).id === task.targetBotId
  ) as BotEntity | undefined

  if (!targetBot || !targetBot.position || !targetBot.inventory) {
    // Target bot gone or invalid
    bot.aiState = { current: 'idle' }
    bot.task = { type: 'gather', active: false, progress: 0 }
    return
  }

  // Check if target has items
  if (targetBot.inventory.items.length === 0) {
    // Target deposited before we arrived
    bot.aiState = { current: 'idle' }
    bot.task = { type: 'gather', active: false, progress: 0 }
    return
  }

  const distToTarget = distance3D(position, targetBot.position)

  if (distToTarget < ARRIVAL_THRESHOLD) {
    // Transfer items (respecting hauler capacity)
    const availableCapacity = stats.capacity - inventory.items.length
    const itemsToTake = Math.min(availableCapacity, targetBot.inventory.items.length)

    if (itemsToTake > 0) {
      const takenItems = targetBot.inventory.items.slice(0, itemsToTake)
      const remainingItems = targetBot.inventory.items.slice(itemsToTake)

      bot.inventory = { items: [...inventory.items, ...takenItems] }
      targetBot.inventory = { items: remainingItems }
    }

    // Go idle — AI will detect full/partial inventory and decide next action
    bot.aiState = { current: 'idle' }
    bot.task = { type: 'gather', active: false, progress: 0 }
  } else {
    // Target moved — recalculate path (chase)
    const newPath = calculatePath(position, targetBot.position)
    if (newPath.success) {
      bot.path = {
        waypoints: newPath.waypoints,
        currentIndex: 0,
      }
      bot.task = {
        ...task,
        target: { ...targetBot.position },
      }
    }
  }
}
