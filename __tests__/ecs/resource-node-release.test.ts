/**
 * Unit Tests: Resource Node Claim/Release Cycle (WS-03-BUG-02)
 *
 * Tests resource node lifecycle:
 * - Bot claims resource node when selecting it
 * - Bot releases resource node after gathering completes
 * - Bot releases resource node if inventory full mid-gathering
 * - Bot releases resource node on energy depleted
 * - targetNodeId tracked in task interface
 *
 * Expected: ALL TESTS FAIL (resource release not implemented - RED phase)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, BotEntity } from '@/ecs/entities/bot'
import { updateBotAI } from '@/ecs/systems/ai'
import { updateGathering } from '@/ecs/systems/gathering'
import { updateEnergy } from '@/ecs/systems/energy'
import { registerResourceNode, getResourceNode, releaseResourceNode } from '@/ecs/systems/resources'

describe('Resource Node Release Cycle (WS-03-BUG-02)', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('BDD Scenario: Bot claims resource when selecting it', () => {
    it('should set targetNodeId in task when bot selects resource', () => {
      // Given: Bot at origin, resource registered
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

      // When: Bot AI selects resource
      updateBotAI(bot, world, 16)

      // Then: task.targetNodeId is set to 'wood-1'
      expect(bot.task?.targetNodeId).toBe('wood-1')
    })

    it('should mark resource as unavailable when bot claims it', () => {
      // Given: Available resource
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

      // When: Bot selects resource
      updateBotAI(bot, world, 16)

      // Then: Resource is marked unavailable
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(false)
    })

    it('should prevent second bot from claiming same resource', () => {
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

      // When: Bot1 claims resource
      updateBotAI(bot1, world, 16)

      // When: Bot2 tries to select resource
      updateBotAI(bot2, world, 16)

      // Then: Bot1 has the resource
      expect(bot1.task?.targetNodeId).toBe('wood-1')

      // Then: Bot2 does not have the resource (remains idle or selects different resource)
      expect(bot2.task?.targetNodeId).not.toBe('wood-1')
    })
  })

  describe('BDD Scenario: Bot releases resource after gathering completes', () => {
    it('should release resource when gathering progress reaches 100%', () => {
      // Given: Bot gathering from wood-1 at 95% progress
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: false, // Already claimed
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'wood-1',
        active: true,
        progress: 95,
        duration: 2000, // WS-03 reduced from 5000ms to 2000ms
      }
      bot.inventory = { items: [] }

      // When: Gathering completes (progress 95 -> 100)
      updateGathering(bot, 100, world) // 100ms is enough to reach 100% from 95%

      // Then: Resource wood-1 is marked available again
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(true)
    })

    it('should clear targetNodeId from task after gathering completes', () => {
      // Given: Bot gathering
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

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'wood-1',
        active: true,
        progress: 95,
        duration: 2000,
      }
      bot.inventory = { items: [] }

      // When: Gathering completes
      updateGathering(bot, 100, world)

      // Then: targetNodeId is undefined or null
      expect(bot.task?.targetNodeId).toBeUndefined()
    })
  })

  describe('BDD Scenario: Bot releases resource when inventory full', () => {
    it('should release resource when bot inventory reaches capacity mid-gathering', () => {
      // Given: Bot gathering with 9/10 items
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

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'wood-1',
        active: true,
        progress: 95,
        duration: 2000,
      }
      bot.inventory = { items: Array(9).fill('wood') }

      // When: Gathering completes (inventory becomes full)
      updateGathering(bot, 100, world)

      // When: Bot AI detects full inventory and transitions to return
      updateBotAI(bot, world, 16)

      // Then: Resource is released
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(true)
    })
  })

  describe('BDD Scenario: Resource available after bot returns', () => {
    it('should allow new bot to claim resource after previous bot returns', () => {
      // Given: Bot1 finished gathering and is returning
      const bot1 = createBot(world, {
        type: 'miner',
        position: { x: -5, y: 0, z: -5 }, // Traveling back
      })

      bot1.aiState = { current: 'moving' }
      bot1.task = {
        type: 'return',
        active: true,
        progress: 0,
      }
      bot1.inventory = { items: Array(10).fill('wood') }

      // Given: Resource is available again
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // Given: Bot2 is idle at base
      const bot2 = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      // When: Bot2 selects resource
      updateBotAI(bot2, world, 16)

      // Then: Bot2 successfully claims the resource
      expect(bot2.task?.targetNodeId).toBe('wood-1')
      expect(bot2.aiState?.current).toBe('moving')

      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(false)
    })
  })

  describe('Edge Cases: Resource Release', () => {
    it('should release resource if bot task is cancelled', () => {
      // Given: Bot gathering
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

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'wood-1',
        active: true,
        progress: 50,
        duration: 2000,
      }
      bot.energy = {
        current: 0, // Depleted
        max: 100,
      }

      // When: Energy system processes depleted energy (cancels task)
      updateEnergy(bot, 16, world)

      // Then: Resource should be released when task is cancelled
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(true)
      expect(bot.task?.active).toBe(false)
    })

    it('should handle missing targetNodeId gracefully', () => {
      // Given: Bot task without targetNodeId
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.aiState = { current: 'gathering' }
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        // targetNodeId missing
        active: true,
        progress: 95,
        duration: 2000,
      }
      bot.inventory = { items: [] }

      // When: Gathering completes
      expect(() => {
        updateGathering(bot, 100, world)
      }).not.toThrow()
    })

    it('should release resource even if node was unregistered', () => {
      // Given: Bot claims resource
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

      // When: Node is removed from registry (edge case)
      world.resourceRegistry?.delete('wood-1')

      // When: Bot completes gathering
      bot.task = { type: 'gather', active: false, progress: 0 }

      // Then: No crash occurs
      expect(() => {
        updateBotAI(bot, world, 16)
      }).not.toThrow()
    })
  })
})
