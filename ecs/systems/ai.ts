/**
 * Bot AI System
 *
 * Autonomous bot behavior state machine:
 * - Idle: Select nearest available resource
 * - Moving: Travel to resource or base
 * - Gathering: Collect resources (handled by gathering system)
 * - Returning: Travel back to base when inventory full
 * - Deposit: Unload resources at base
 */

import { BotEntity } from '@/ecs/entities/bot'
import { GameWorld } from '@/ecs/world'
import { findNearestResource, claimResourceNode, releaseResourceNode } from './resources'
import { calculatePath } from './pathfinding'
import { canDeposit } from './deposit'
import { distance3D } from '@/utils/math'

const BASE_POSITION = { x: 0, y: 0, z: 0 }
const ARRIVAL_THRESHOLD = 1.0
const ENERGY_RESUME_THRESHOLD = 20

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

    default:
      // Unknown state - this should never happen with proper typing
      break
  }
}

/**
 * Handle idle state: select nearest resource
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

  // Select nearest resource
  // Try wood first, then stone, then iron, then crystals
  const resourceTypes = ['wood', 'stone', 'iron', 'crystals']
  let selectedResource = null

  for (const resourceType of resourceTypes) {
    const nearest = findNearestResource(world, resourceType, position)
    if (nearest) {
      selectedResource = nearest
      break
    }
  }

  if (!selectedResource) {
    // No resources available, stay idle
    return
  }

  // Claim the resource
  claimResourceNode(world, selectedResource.id)

  // Calculate path to resource
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
    }
  }
}
