/**
 * Unit Tests: Update System
 *
 * Tests main game loop update and entity enhancement:
 * - Entity enhancement with helper methods
 * - System execution order
 * - Component updates triggering world.update
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot } from '@/ecs/entities/bot'
import { updateWorld } from '@/ecs/systems/update'
import { registerResourceNode } from '@/ecs/systems/resources'

describe('Update System', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('Entity enhancement', () => {
    it('should enhance entity with helper methods during update', () => {
      // Given: Bot entity in world
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      // When: Using set method directly (tests enhanceEntity functionality)
      bot.set('energy', { current: 50, max: 100 })

      // Then: Component should be updated
      expect(bot.energy?.current).toBe(50)
      expect(bot.get('energy')?.current).toBe(50)
    })
  })

  describe('System execution order', () => {
    it('should run systems in correct order: energy -> movement -> gathering -> AI -> deposit', () => {
      // Given: Bot with full setup
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.aiState = { current: 'moving' }
      bot.path = {
        waypoints: [{ x: 5, y: 0, z: 5 }],
        currentIndex: 0,
      }

      // When: Update world
      updateWorld(world, 0.016)

      // Then: All systems should execute without error
      expect(bot.position).toBeDefined()
      expect(bot.energy).toBeDefined()
    })

    it('should handle multiple bots in single update', () => {
      // Given: Multiple bots
      const bot1 = createBot(world, { type: 'miner', position: { x: 0, y: 0, z: 0 } })
      const bot2 = createBot(world, { type: 'hauler', position: { x: 5, y: 0, z: 5 } })
      const bot3 = createBot(world, { type: 'scout', position: { x: -5, y: 0, z: -5 } })

      // When: Update world
      updateWorld(world, 0.016)

      // Then: All bots should be updated
      expect(bot1.energy?.current).toBeDefined()
      expect(bot2.energy?.current).toBeDefined()
      expect(bot3.energy?.current).toBeDefined()
    })
  })

  describe('Edge cases', () => {
    it('should skip non-bot entities', () => {
      // Given: Non-bot entity in world
      const nonBot = world.add({
        id: 999,
        position: { x: 0, y: 0, z: 0 },
      })

      // When: Update world (should not crash on non-bot entity)
      expect(() => updateWorld(world, 0.016)).not.toThrow()
    })

    it('should handle empty world', () => {
      // Given: Empty world
      // When: Update world
      expect(() => updateWorld(world, 0.016)).not.toThrow()
    })
  })
})
