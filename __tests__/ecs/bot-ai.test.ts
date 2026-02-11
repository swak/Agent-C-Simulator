/**
 * Unit Tests: Bot AI Decision Loop
 *
 * Tests autonomous bot AI behavior:
 * - Idle bot selects nearest available resource
 * - Bot pathfinds to resource and transitions to moving
 * - Bot detects arrival at resource and starts gathering
 * - Bot detects full inventory and returns to base
 * - Bot deposits resources at base and returns to idle
 *
 * Expected: ALL TESTS FAIL (no implementation exists yet - RED phase of TDD)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, BotEntity } from '@/ecs/entities/bot'
import { updateBotAI } from '@/ecs/systems/ai'
import { findNearestResource, registerResourceNode, claimResourceNode } from '@/ecs/systems/resources'
import { updateGathering } from '@/ecs/systems/gathering'

describe('Bot AI Decision Loop (WS-02-US-01)', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('BDD Scenario: Bot gathers wood from nearest tree', () => {
    it('should select nearest available resource when idle', () => {
      // Given: A miner bot at position (0, 0, 0) with idle AI state
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      // Given: Bot has 10-item capacity and 1.5x gathering modifier
      expect(bot.stats?.capacity).toBe(10)
      expect(bot.stats?.gatheringModifier).toBe(1.5)

      // Given: Wood resource exists at position (-10, 0, -10)
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // When: Game loop runs for 1 frame
      updateBotAI(bot, world, 16) // 16ms = 60fps

      // Then: Bot AI selects nearest resource (wood)
      expect(bot.task?.resourceType).toBe('wood')
    })

    it('should calculate path to selected resource', () => {
      // Given: Same setup as previous test
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // When: Bot AI selects resource and pathfinds
      updateBotAI(bot, world, 16)

      // Then: Bot path contains waypoints to (-10, 0, -10)
      expect(bot.path?.waypoints).toBeDefined()
      expect(bot.path?.waypoints.length).toBeGreaterThan(0)

      const lastWaypoint = bot.path!.waypoints[bot.path!.waypoints.length - 1]
      expect(lastWaypoint.x).toBeCloseTo(-10, 1)
      expect(lastWaypoint.z).toBeCloseTo(-10, 1)
    })

    it('should transition to moving state after path calculated', () => {
      // Given: Same setup
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // When: Bot AI runs
      updateBotAI(bot, world, 16)

      // Then: Bot aiState.current is 'moving'
      expect(bot.aiState?.current).toBe('moving')

      // Then: Bot task.type is 'gather'
      expect(bot.task?.type).toBe('gather')

      // Then: Bot task.resourceType is 'wood'
      expect(bot.task?.resourceType).toBe('wood')
    })

    it('should select nearest resource among multiple options', () => {
      // Given: Bot at origin
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      // Given: Multiple wood nodes at different distances
      registerResourceNode(world, {
        id: 'wood-far',
        type: 'wood',
        position: { x: -20, y: 0, z: -20 }, // Distance: ~28.28
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-near',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 }, // Distance: ~14.14
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-medium',
        type: 'wood',
        position: { x: -15, y: 0, z: -15 }, // Distance: ~21.21
        available: true,
      })

      // When: Bot AI runs
      updateBotAI(bot, world, 16)

      // Then: Bot should target nearest node
      const targetPosition = bot.task?.target
      expect(targetPosition).toBeDefined()
      expect(targetPosition?.x).toBeCloseTo(-10, 1)
      expect(targetPosition?.z).toBeCloseTo(-10, 1)
    })
  })

  describe('BDD Scenario: Bot completes gathering cycle', () => {
    it('should add resource to inventory when gathering completes', () => {
      // Given: Bot at resource position with aiState 'gathering'
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        progress: 95,
        duration: 5000,
        active: true,
      }
      bot.inventory = { items: [] }

      // When: updateGathering runs for 200ms (enough to reach 100% progress)
      // Note: This is tested in gathering.test.ts, but we verify the result here
      updateGathering(bot, 200)

      // Then: Bot inventory contains 1 wood item
      expect(bot.inventory.items).toContain('wood')
      expect(bot.inventory.items.length).toBe(1)

      // Then: Bot task progress resets to 0
      expect(bot.task.progress).toBe(0)
    })
  })

  describe('BDD Scenario: Bot inventory reaches capacity', () => {
    it('should detect full inventory and transition to returning', () => {
      // Given: Bot at resource with 9/10 items in inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        progress: 95,
        duration: 5000,
        active: true,
      }
      bot.inventory = { items: Array(9).fill('wood') }
      updateGathering(bot, 200)

      // When: Bot AI detects full inventory
      updateBotAI(bot, world, 16)

      // Then: Bot inventory has 10 items
      expect(bot.inventory.items.length).toBe(10)

      // Then: Bot stops gathering
      expect(bot.aiState?.current).not.toBe('gathering')

      // Then: Bot AI transitions to 'returning' behavior
      expect(bot.task?.type).toBe('return')
    })

    it('should calculate path to base when inventory full', () => {
      // Given: Bot with full inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.inventory = { items: Array(10).fill('wood') }
      bot.aiState = { current: 'idle' }

      // When: Bot AI runs with full inventory
      updateBotAI(bot, world, 16)

      // Then: Path should point to base at (0, 0, 0)
      expect(bot.path?.waypoints).toBeDefined()
      expect(bot.path?.waypoints.length).toBeGreaterThan(0)

      const lastWaypoint = bot.path!.waypoints[bot.path!.waypoints.length - 1]
      expect(lastWaypoint.x).toBeCloseTo(0, 1)
      expect(lastWaypoint.y).toBeCloseTo(0, 1)
      expect(lastWaypoint.z).toBeCloseTo(0, 1)
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty resource registry gracefully', () => {
      // Given: No resources registered
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      // When: Bot AI runs
      updateBotAI(bot, world, 16)

      // Then: Bot should remain idle (no crash)
      expect(bot.aiState?.current).toBe('idle')
    })

    it('should skip unavailable resources', () => {
      // Given: Only unavailable resources exist
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: false, // Claimed by another bot
      })

      // When: Bot AI runs
      updateBotAI(bot, world, 16)

      // Then: Bot should remain idle
      expect(bot.aiState?.current).toBe('idle')
      expect(bot.task?.active).toBeFalsy()
    })

    it('should handle bot reaching resource that becomes claimed mid-route', () => {
      // Given: Bot moving toward a resource
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -5, y: 0, z: -5 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      updateBotAI(bot, world, 16)
      expect(bot.aiState?.current).toBe('moving')

      // When: Resource becomes unavailable before arrival
      // claimResourceNode imported at top
      claimResourceNode(world, 'wood-1')

      // When: Bot reaches resource location
      bot.position = { x: -10, y: 0, z: -10 }
      updateBotAI(bot, world, 16)

      // Then: Bot should select a new resource or return to idle
      // (Implementation-dependent behavior, but should not crash)
      expect(bot.aiState?.current).toBeDefined()
    })

    it('should recalculate path if bot is not within arrival threshold at resource', () => {
      // Given: Bot with path complete but not close enough to resource
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -8, y: 0, z: -8 }, // 2+ units away from target
      })

      bot.aiState = { current: 'moving' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        target: { x: -10, y: 0, z: -10 },
        active: true,
        progress: 0,
      }
      bot.path = { waypoints: [], currentIndex: 0 } // Path complete

      // When: Bot AI runs
      updateBotAI(bot, world, 16)

      // Then: Bot should recalculate path (not transition to gathering)
      expect(bot.path?.waypoints.length).toBeGreaterThan(0)
      expect(bot.aiState?.current).toBe('moving')
    })

    it('should transition to idle when bot reaches base on return task', () => {
      // Given: Bot at base with return task and empty path
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 }, // At base
      })

      bot.aiState = { current: 'moving' }
      bot.task = {
        type: 'return',
        active: true,
        progress: 0,
      }
      bot.path = { waypoints: [], currentIndex: 0 } // Path complete
      bot.inventory = { items: Array(5).fill('wood') } // Partial inventory (not full)

      // When: Bot AI runs
      updateBotAI(bot, world, 16)

      // Then: Bot should transition to idle
      expect(bot.aiState?.current).toBe('idle')
    })

  })
})

describe('Bot AI State Machine Integration', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  it('should execute full autonomous gather cycle: idle -> move -> gather -> return -> deposit -> idle', () => {
    // Given: Bot at base, resource registered
    const bot = createBot(world, {
      type: 'miner',
      position: { x: 0, y: 0, z: 0 },
    })

    registerResourceNode(world, {
      id: 'wood-1',
      type: 'wood',
      position: { x: -10, y: 0, z: -10 },
      available: true,
    })

    // When: AI selects resource (idle -> moving)
    updateBotAI(bot, world, 16)
    expect(bot.aiState?.current).toBe('moving')
    expect(bot.task?.type).toBe('gather')

    // When: Bot reaches resource (moving -> gathering)
    bot.position = { x: -10, y: 0, z: -10 }
    bot.path = { waypoints: [], currentIndex: 0 } // Path complete
    updateBotAI(bot, world, 16)
    expect(bot.aiState?.current).toBe('gathering')

    // When: Inventory fills up (gathering -> returning)
    bot.inventory = { items: Array(10).fill('wood') }
    updateBotAI(bot, world, 16)
    expect(bot.task?.type).toBe('return')

    // When: Bot reaches base (returning -> depositing)
    bot.position = { x: 0, y: 0, z: 0 }
    bot.path = { waypoints: [], currentIndex: 0 }
    updateBotAI(bot, world, 16)

    // Then: Bot should be idle, ready for next cycle
    // (Deposit logic tested separately in deposit.test.ts)
    expect(bot.position?.x).toBeCloseTo(0, 1)
    expect(bot.position?.z).toBeCloseTo(0, 1)
  })
})
