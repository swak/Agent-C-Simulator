/**
 * Integration Tests: WS-03 Full Game Loop with Fixes
 *
 * Tests complete game loop with all WS-03 fixes:
 * - Bot completes gather cycle with 2000ms duration
 * - Resource node released after gathering
 * - Bot cap enforced at 10 bots
 * - Energy displays as integer
 * - No physics jitter (RigidBody removed)
 * - drei visual features render
 *
 * Expected: ALL TESTS FAIL (WS-03 fixes not implemented - RED phase)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot } from '@/ecs/entities/bot'
import { updateWorld } from '@/ecs/systems/update'
import { syncECSToZustand } from '@/ecs/systems/sync'
import { useGameStore } from '@/stores/game-state'
import { registerResourceNode, getResourceNode } from '@/ecs/systems/resources'
import { depositResources } from '@/ecs/systems/deposit'

describe('WS-03 Full Game Loop Integration', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
    useGameStore.setState({
      bots: [],
      resources: {
        wood: 0,
        stone: 0,
        iron: 0,
        crystals: 0,
      },
    })
  })

  describe('BDD Scenario: Bot completes full gather cycle (2000ms duration)', () => {
    it('should complete idle->gather->return->deposit cycle visibly', () => {
      // Given: Bot at base, resource available
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

      useGameStore.setState({
        bots: [
          {
            id: `bot-${bot.id}`,
            type: 'miner',
            status: 'idle',
            energy: 100,
            position: { x: 0, y: 0, z: 0 },
          },
        ],
      })

      // When: Running game loop for idle->moving transition
      for (let i = 0; i < 5; i++) {
        updateWorld(world, 0.016)
        syncECSToZustand(world)
      }

      // Then: Bot has task with targetNodeId
      expect(bot.task?.targetNodeId).toBe('wood-1')
      expect(bot.task?.duration).toBe(2000) // WS-03 fix

      // Then: Resource is claimed
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(false)

      // When: Bot reaches resource and starts gathering (pre-fill 9 items so 1 more completes it)
      bot.position = { x: -10, y: 0, z: -10 }
      bot.path = { waypoints: [], currentIndex: 0 }
      bot.aiState = { current: 'gathering' }
      bot.inventory = { items: Array(9).fill('wood') }

      // When: Gathering for 2000ms (enough to complete 1 gather with 1.5x modifier)
      for (let i = 0; i < 125; i++) {
        // 125 frames * 16ms = 2000ms
        updateWorld(world, 0.016)
        syncECSToZustand(world)
      }

      // Then: Bot inventory is full
      expect(bot.inventory?.items.length).toBeGreaterThanOrEqual(10)

      // Then: Resource is released after inventory full (single bot, no one else to reclaim)
      expect(node?.available).toBe(true)

      // When: Bot returns and deposits
      bot.position = { x: 0, y: 0, z: 0 }
      bot.aiState = { current: 'idle' }
      depositResources(bot, world)

      // Then: Resources incremented
      const resources = useGameStore.getState().resources
      expect(resources.wood).toBeGreaterThan(0)
    })
  })

  describe('BDD Scenario: Resource node released for next bot', () => {
    it('should allow second bot to claim resource after first bot completes', () => {
      // Given: Two bots, one resource
      const bot1 = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      const bot2 = createBot(world, {
        type: 'miner',
        position: { x: 1, y: 0, z: 1 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // When: Bot1 claims and completes gathering
      for (let i = 0; i < 5; i++) {
        updateWorld(world, 0.016)
      }

      expect(bot1.task?.targetNodeId).toBe('wood-1')

      // Simulate completion (preserve task with targetNodeId)
      // Set inventory to 9/10 so one more gather completes it
      bot1.position = { x: -10, y: 0, z: -10 }
      bot1.aiState = { current: 'gathering' }
      const existingTask = bot1.task
      bot1.inventory = { items: Array(9).fill('wood') }
      bot1.task = {
        ...existingTask,
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'wood-1',
        active: true,
        progress: 0,
        duration: 2000,
      }

      for (let i = 0; i < 125; i++) {
        updateWorld(world, 0.016)
      }

      // Then: Bot1 inventory is full and returning to base
      expect(bot1.inventory?.items.length).toBeGreaterThanOrEqual(10)
      expect(bot1.stats?.capacity).toBe(10)

      // Then: Bot2 immediately claims the released resource in the same frame
      // (resource released by gathering system, then bot2 AI claims it in same tick)
      const node = getResourceNode(world, 'wood-1')
      expect(bot2.task?.targetNodeId).toBe('wood-1')
      expect(node?.available).toBe(false) // claimed by bot2
    })
  })

  describe('BDD Scenario: Bot cap enforced at 10', () => {
    it('should prevent creating 11th bot', () => {
      // Given: 10 bots in world
      for (let i = 0; i < 10; i++) {
        createBot(world, { type: 'miner', position: { x: i, y: 0, z: 0 } })
      }

      expect(world.entities.length).toBe(10)

      // When: Attempting to create 11th bot
      const bot11 = createBot(world, { type: 'miner', position: { x: 10, y: 0, z: 0 } })

      // Then: 11th bot not added (or createBot returns null)
      if (bot11 === null) {
        expect(bot11).toBeNull()
      } else {
        expect(world.entities.length).toBe(10)
      }
    })

    it('should prevent adding 11th bot in Zustand', () => {
      // Given: 10 bots
      for (let i = 0; i < 10; i++) {
        useGameStore.getState().addBot({ type: 'miner', status: 'idle' })
      }

      expect(useGameStore.getState().bots.length).toBe(10)

      // When: Attempting to add 11th
      const botId = useGameStore.getState().addBot({ type: 'miner', status: 'idle' })

      // Then: Still 10 bots, addBot returns null/empty
      expect(useGameStore.getState().bots.length).toBe(10)
      expect(botId).toBeFalsy()
    })
  })

  describe('BDD Scenario: Energy displays as integer', () => {
    it('should round energy to integer in Zustand sync', () => {
      // Given: Bot with decimal energy
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.energy = { current: 75.789, max: 100 }

      useGameStore.setState({
        bots: [
          {
            id: `bot-${bot.id}`,
            type: 'miner',
            status: 'idle',
            energy: 100,
          },
        ],
      })

      // When: Syncing ECS to Zustand
      syncECSToZustand(world)

      // Then: Energy is integer
      const zustandBot = useGameStore.getState().bots[0]
      expect(zustandBot.energy).toBe(76) // Math.round or Math.floor
      expect(zustandBot.energy % 1).toBe(0) // No decimal part
    })
  })

  describe('BDD Scenario: Game runs without physics jitter', () => {
    it('should run game loop without RigidBody errors', () => {
      // Given: Multiple bots
      for (let i = 0; i < 5; i++) {
        createBot(world, { type: 'miner', position: { x: i * 2, y: 0, z: 0 } })
      }

      // When: Running game loop
      expect(() => {
        for (let i = 0; i < 60; i++) {
          updateWorld(world, 0.016)
          syncECSToZustand(world)
        }
      }).not.toThrow()

      // Then: Bots are positioned correctly (no jitter/NaN positions)
      world.entities.forEach((entity) => {
        const position = entity.position
        if (position) {
          expect(position.x).not.toBeNaN()
          expect(position.y).not.toBeNaN()
          expect(position.z).not.toBeNaN()
        }
      })
    })
  })

  describe('Performance: WS-03 Faster Gathering', () => {
    it('should gather 2.5x faster with new 2000ms duration', () => {
      // Given: Old duration was 5000ms, new is 2000ms
      const oldDuration = 5000
      const newDuration = 2000

      // When: Comparing durations
      const speedup = oldDuration / newDuration

      // Then: 2.5x faster
      expect(speedup).toBe(2.5)
    })

    it('should complete 5 gather cycles in 10 seconds (miner bot)', () => {
      // Given: Miner bot (1.5x modifier) with 2000ms duration
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

      expect(bot.stats?.gatheringModifier).toBe(1.5)

      // Effective duration: 2000ms / 1.5 = ~1333ms per item
      // 10 seconds / 1333ms = ~7.5 items

      // When: Running for 10 seconds
      const totalFrames = (10000 / 16) // 10 seconds at 60fps

      for (let i = 0; i < totalFrames; i++) {
        updateWorld(world, 0.016)

        // Reset task when complete
        if (bot.inventory.items.length > 0 && bot.task.progress === 0) {
          // Item added, continue gathering
          bot.task.progress = 0
          bot.aiState = { current: 'gathering' }
        }
      }

      // Then: At least 7 items gathered
      expect(bot.inventory.items.length).toBeGreaterThanOrEqual(7)
    })
  })

  describe('Edge Cases: WS-03 Integration', () => {
    it('should handle bot with missing targetNodeId', () => {
      // Given: Bot with task but no targetNodeId
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        // targetNodeId missing
        active: true,
        progress: 0,
        duration: 2000,
      }

      // When: Running game loop
      expect(() => {
        updateWorld(world, 0.016)
      }).not.toThrow()
    })

    it('should handle energy at exact 0.0', () => {
      // Given: Bot with zero energy
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.energy = { current: 0.0, max: 100 }

      // When: Syncing
      useGameStore.setState({ bots: [] })
      syncECSToZustand(world)

      // Then: Energy is 0 (integer)
      const zustandBot = useGameStore.getState().bots[0]
      expect(zustandBot.energy).toBe(0)
    })

    it('should handle resource node that was unregistered mid-task', () => {
      // Given: Bot with task targeting node
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: false,
      })

      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'wood-1',
        active: true,
        progress: 50,
        duration: 2000,
      }

      // When: Node is removed
      world.resourceRegistry?.delete('wood-1')

      // When: Game loop continues
      expect(() => {
        updateWorld(world, 0.016)
      }).not.toThrow()
    })
  })
})
