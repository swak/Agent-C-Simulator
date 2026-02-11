/**
 * Unit Tests: Gather Duration Reduction (WS-03-BUG-05)
 *
 * Tests faster gather cycle:
 * - Default gather duration is 2000ms (reduced from 5000ms)
 * - Bot entities created with 2000ms duration
 * - AI system assigns 2000ms duration
 * - Gathering completes faster
 *
 * Expected: ALL TESTS FAIL (duration still 5000ms - RED phase)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, BotEntity } from '@/ecs/entities/bot'
import { updateBotAI } from '@/ecs/systems/ai'
import { updateGathering } from '@/ecs/systems/gathering'
import { registerResourceNode } from '@/ecs/systems/resources'

describe('Gather Duration Reduction (WS-03-BUG-05)', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('BDD Scenario: Default duration is 2000ms', () => {
    it('should create bot task with 2000ms duration', () => {
      // Given: Bot selects resource
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

      // When: Bot AI assigns gather task
      updateBotAI(bot, world, 16)

      // Then: task.duration is 2000 (not 5000)
      expect(bot.task?.duration).toBe(2000)
    })

    it('should use 2000ms in bot entity creation', () => {
      // Given: Creating bot with assignTask helper
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

      // When: AI assigns task
      updateBotAI(bot, world, 16)

      // Then: Duration is 2000
      expect(bot.task?.duration).toBe(2000)
    })
  })

  describe('BDD Scenario: Gathering completes faster', () => {
    it('should complete gathering in 2000ms (not 5000ms)', () => {
      // Given: Bot gathering at progress 0
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 0,
        duration: 2000, // New duration
      }
      bot.inventory = { items: [] }

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: false,
      })

      bot.task = {
        ...bot.task,
        targetNodeId: 'wood-1',
      }

      // When: 2000ms elapse
      updateGathering(bot, 2000, world)

      // Then: Gathering is complete (progress >= 100 or item added)
      expect(bot.inventory.items.length).toBe(1)
      expect(bot.task.progress).toBe(0) // Reset after completion
    })

    it('should NOT complete gathering in 1000ms', () => {
      // Given: Bot gathering
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 0,
        duration: 2000,
      }
      bot.inventory = { items: [] }

      // When: Only 1000ms elapse
      updateGathering(bot, 1000, world)

      // Then: Not complete yet (progress < 100, no item added)
      expect(bot.inventory.items.length).toBe(0)
      expect(bot.task.progress).toBeGreaterThan(0)
      expect(bot.task.progress).toBeLessThan(100)
    })

    it('should complete in ~1333ms with 1.5x gathering modifier (miner)', () => {
      // Given: Miner bot (1.5x modifier) gathering
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      expect(bot.stats?.gatheringModifier).toBe(1.5)

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 0,
        duration: 2000,
      }
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: false,
      })

      bot.task = {
        ...bot.task,
        targetNodeId: 'wood-1',
      }
      bot.inventory = { items: [] }

      // When: 1334ms elapse (2000ms / 1.5 = 1333.33ms, round up to ensure completion)
      updateGathering(bot, 1334, world)

      // Then: Gathering complete (1.5x speed)
      expect(bot.inventory.items.length).toBe(1)
    })

    it('should take 4000ms for hauler with 0.5x gathering modifier', () => {
      // Given: Hauler bot (0.5x modifier)
      const bot = createBot(world, {
        type: 'hauler',
        position: { x: -10, y: 0, z: -10 },
      })

      expect(bot.stats?.gatheringModifier).toBe(0.5)

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 0,
        duration: 2000,
      }
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: false,
      })

      bot.task = {
        ...bot.task,
        targetNodeId: 'wood-1',
      }
      bot.inventory = { items: [] }

      // When: 4000ms elapse (2000ms / 0.5 = 4000ms)
      updateGathering(bot, 4000, world)

      // Then: Gathering complete
      expect(bot.inventory.items.length).toBe(1)
    })
  })

  describe('BDD Scenario: AI assigns 2000ms duration', () => {
    it('should set duration to 2000 in handleIdleState', () => {
      // Given: Idle bot
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      registerResourceNode(world, {
        id: 'stone-1',
        type: 'stone',
        position: { x: 10, y: 0, z: -10 },
        available: true,
      })

      // When: Bot selects resource
      updateBotAI(bot, world, 16)

      // Then: Duration is 2000
      expect(bot.task?.duration).toBe(2000)
      expect(bot.task?.type).toBe('gather')
    })
  })

  describe('Edge Cases: Gather Duration', () => {
    it('should handle undefined duration gracefully', () => {
      // Given: Task without duration
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 0,
        // duration missing
      }
      bot.inventory = { items: [] }

      // When: Gathering runs
      expect(() => {
        updateGathering(bot, 2000, world)
      }).not.toThrow()

      // Then: Falls back to default (2000ms or 5000ms)
      // If duration is undefined, gathering system uses fallback
    })

    it('should use 2000ms for all resource types', () => {
      // Given: Resources of different types
      const resourceTypes = ['wood', 'stone', 'iron', 'crystals']

      for (const resourceType of resourceTypes) {
        const bot = createBot(world, {
          type: 'miner',
          position: { x: 0, y: 0, z: 0 },
        })

        registerResourceNode(world, {
          id: `${resourceType}-1`,
          type: resourceType as 'wood' | 'stone' | 'iron' | 'crystals',
          position: { x: -10, y: 0, z: -10 },
          available: true,
        })

        // When: Bot selects resource
        updateBotAI(bot, world, 16)

        // Then: Duration is 2000 regardless of type
        expect(bot.task?.duration).toBe(2000)
      }
    })
  })
})
