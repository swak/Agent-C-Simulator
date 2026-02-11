/**
 * Unit Tests: Bot AI Specialization (WS-07)
 *
 * Tests type-dispatched AI behavior:
 * - Scout: random resource selection
 * - Hauler: pickup mechanic (find bot, transfer items)
 * - Crafter: auto-craft at base, crafting state
 * - Miner: regression (unchanged through new dispatch path)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, BotEntity } from '@/ecs/entities/bot'
import { updateBotAI, findRandomResource, findBotWithItems } from '@/ecs/systems/ai'
import { registerResourceNode } from '@/ecs/systems/resources'
import { useGameStore } from '@/stores/game-state'

describe('Bot AI Specialization (WS-07)', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
    // Reset game store between tests
    useGameStore.getState().resetGame()
  })

  describe('Scout — random resource selection', () => {
    it('should select from available crystal nodes randomly (not always nearest)', () => {
      const bot = createBot(world, {
        type: 'scout',
        position: { x: 0, y: 0, z: 0 },
      })

      // Register 5 crystal nodes at various distances
      for (let i = 1; i <= 5; i++) {
        registerResourceNode(world, {
          id: `crystal-${i}`,
          type: 'crystals',
          position: { x: i * 10, y: 0, z: i * 10 },
          available: true,
        })
      }

      // Run AI — scout should pick a crystal node
      updateBotAI(bot!, world, 16)
      expect(bot!.task?.resourceType).toBe('crystals')
      expect(bot!.aiState?.current).toBe('moving')
    })

    it('should fall back to next resource type if preferred type unavailable', () => {
      const bot = createBot(world, {
        type: 'scout',
        position: { x: 0, y: 0, z: 0 },
      })

      // No crystals — only iron available
      registerResourceNode(world, {
        id: 'iron-1',
        type: 'iron',
        position: { x: 10, y: 0, z: 10 },
        available: true,
      })

      updateBotAI(bot!, world, 16)
      expect(bot!.task?.resourceType).toBe('iron')
    })

    it('should not always pick the same node over 20 iterations (statistical)', () => {
      const selectedNodeIds = new Set<string>()

      for (let i = 0; i < 20; i++) {
        const testWorld = createWorld()

        // Register 5 crystal nodes
        for (let j = 1; j <= 5; j++) {
          registerResourceNode(testWorld, {
            id: `crystal-${j}`,
            type: 'crystals',
            position: { x: j * 10, y: 0, z: j * 10 },
            available: true,
          })
        }

        const bot = createBot(testWorld, {
          type: 'scout',
          position: { x: 0, y: 0, z: 0 },
        })

        updateBotAI(bot!, testWorld, 16)
        if (bot!.task?.targetNodeId) {
          selectedNodeIds.add(bot!.task.targetNodeId)
        }
      }

      // With 5 nodes and 20 iterations, random selection should pick > 1 unique node
      expect(selectedNodeIds.size).toBeGreaterThan(1)
    })
  })

  describe('Hauler — pickup mechanic', () => {
    it('should find nearest non-hauler bot with items and create pickup task', () => {
      // Create a miner with items
      const miner = createBot(world, {
        type: 'miner',
        position: { x: 10, y: 0, z: 0 },
      })
      miner!.inventory = { items: ['iron', 'iron', 'iron'] }

      // Create hauler at base
      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 },
      })

      updateBotAI(hauler!, world, 16)

      expect(hauler!.task?.type).toBe('pickup')
      expect(hauler!.task?.targetBotId).toBe(miner!.id)
      expect(hauler!.aiState?.current).toBe('moving')
    })

    it('should ignore other hauler bots', () => {
      // Create another hauler with items
      const otherHauler = createBot(world, {
        type: 'hauler',
        position: { x: 5, y: 0, z: 0 },
      })
      otherHauler!.inventory = { items: ['wood', 'wood'] }

      // Create a miner with items (farther away)
      const miner = createBot(world, {
        type: 'miner',
        position: { x: 20, y: 0, z: 0 },
      })
      miner!.inventory = { items: ['iron'] }

      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 },
      })

      updateBotAI(hauler!, world, 16)

      // Should target the miner, not the other hauler
      expect(hauler!.task?.type).toBe('pickup')
      expect(hauler!.task?.targetBotId).toBe(miner!.id)
    })

    it('should ignore bots with empty inventory', () => {
      // Create a miner with no items
      const emptyMiner = createBot(world, {
        type: 'miner',
        position: { x: 5, y: 0, z: 0 },
      })
      emptyMiner!.inventory = { items: [] }

      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 },
      })

      // No resources registered either, so fallback will fail too
      updateBotAI(hauler!, world, 16)

      // Should stay idle (no pickup target, no resources to gather)
      expect(hauler!.task?.type).not.toBe('pickup')
    })

    it('should transfer items on arrival within threshold', () => {
      const miner = createBot(world, {
        type: 'miner',
        position: { x: 0.5, y: 0, z: 0 },
      })
      miner!.inventory = { items: ['iron', 'stone', 'wood'] }

      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 }, // Within ARRIVAL_THRESHOLD of miner
      })

      // Set up hauler as if it just arrived at target
      hauler!.aiState = { current: 'moving' }
      hauler!.task = {
        type: 'pickup',
        active: true,
        progress: 0,
        target: { x: 0.5, y: 0, z: 0 },
        targetBotId: miner!.id!,
      }
      hauler!.path = { waypoints: [], currentIndex: 0 } // Path complete

      updateBotAI(hauler!, world, 16)

      // Items transferred
      expect(hauler!.inventory?.items).toEqual(['iron', 'stone', 'wood'])
      expect(miner!.inventory?.items).toEqual([])
      expect(hauler!.aiState?.current).toBe('idle')
    })

    it('should only take what fits (partial capacity transfer)', () => {
      const miner = createBot(world, {
        type: 'miner',
        position: { x: 0.5, y: 0, z: 0 },
      })
      miner!.inventory = { items: Array(10).fill('iron') }

      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 },
      })

      // Pre-fill hauler with 15 items (capacity=20, only 5 slots left)
      hauler!.inventory = { items: Array(15).fill('wood') }
      hauler!.aiState = { current: 'moving' }
      hauler!.task = {
        type: 'pickup',
        active: true,
        progress: 0,
        target: { x: 0.5, y: 0, z: 0 },
        targetBotId: miner!.id!,
      }
      hauler!.path = { waypoints: [], currentIndex: 0 }

      updateBotAI(hauler!, world, 16)

      // Should take only 5 items
      expect(hauler!.inventory?.items.length).toBe(20)
      expect(miner!.inventory?.items.length).toBe(5)
    })

    it('should go idle without crash when target bot empties before arrival', () => {
      const miner = createBot(world, {
        type: 'miner',
        position: { x: 0.5, y: 0, z: 0 },
      })
      miner!.inventory = { items: [] } // Empty — deposited before hauler arrived

      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 },
      })

      hauler!.aiState = { current: 'moving' }
      hauler!.task = {
        type: 'pickup',
        active: true,
        progress: 0,
        target: { x: 0.5, y: 0, z: 0 },
        targetBotId: miner!.id!,
      }
      hauler!.path = { waypoints: [], currentIndex: 0 }

      // Should not throw
      expect(() => updateBotAI(hauler!, world, 16)).not.toThrow()
      expect(hauler!.aiState?.current).toBe('idle')
    })

    it('should fall back to gathering when no bots have items', () => {
      const hauler = createBot(world, {
        type: 'hauler',
        position: { x: 0, y: 0, z: 0 },
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: 10, y: 0, z: 10 },
        available: true,
      })

      updateBotAI(hauler!, world, 16)

      // Falls back to gather behavior (hauler prefers wood)
      expect(hauler!.task?.type).toBe('gather')
      expect(hauler!.task?.resourceType).toBe('wood')
    })
  })

  describe('Crafter — auto-craft at base', () => {
    it('should craft highest-priority recipe when at base with resources', () => {
      // Give store resources for gear-component (iron: 10, stone: 5)
      const store = useGameStore.getState()
      store.addResource('iron', 10)
      store.addResource('stone', 5)

      const crafter = createBot(world, {
        type: 'crafter',
        position: { x: 0, y: 0, z: 0 }, // At base
      })

      updateBotAI(crafter!, world, 16)

      expect(crafter!.aiState?.current).toBe('crafting')
      expect(crafter!.task?.type).toBe('craft')
      expect(crafter!.task?.duration).toBe(4000) // gear-component duration
    })

    it('should enter crafting state with correct duration', () => {
      // Only enough for basic-component (wood: 5)
      const store = useGameStore.getState()
      store.addResource('wood', 5)

      const crafter = createBot(world, {
        type: 'crafter',
        position: { x: 0, y: 0, z: 0 },
      })

      updateBotAI(crafter!, world, 16)

      expect(crafter!.aiState?.current).toBe('crafting')
      expect(crafter!.task?.duration).toBe(3000) // basic-component duration
      expect(crafter!.task?.progress).toBe(0)
    })

    it('should progress crafting state and complete', () => {
      const store = useGameStore.getState()
      store.addResource('wood', 5)

      const crafter = createBot(world, {
        type: 'crafter',
        position: { x: 0, y: 0, z: 0 },
      })

      // Start crafting
      updateBotAI(crafter!, world, 16)
      expect(crafter!.aiState?.current).toBe('crafting')

      // Progress 50%
      updateBotAI(crafter!, world, 1500) // 1500/3000 = 50%
      expect(crafter!.task?.progress).toBeGreaterThan(0)
      expect(crafter!.aiState?.current).toBe('crafting')

      // Complete
      updateBotAI(crafter!, world, 2000) // Over 100% total
      expect(crafter!.aiState?.current).toBe('idle')
    })

    it('should not craft when energy is insufficient', () => {
      const store = useGameStore.getState()
      store.addResource('wood', 5)

      const crafter = createBot(world, {
        type: 'crafter',
        position: { x: 0, y: 0, z: 0 },
      })
      crafter!.energy = { current: 15, max: 100 } // Below 20 threshold

      // No resources registered, so fallback gather also fails
      updateBotAI(crafter!, world, 16)

      // Should not enter crafting (energy too low) — stays idle since nothing to gather
      expect(crafter!.aiState?.current).not.toBe('crafting')
    })

    it('should fall back to gathering when not at base or nothing craftable', () => {
      const crafter = createBot(world, {
        type: 'crafter',
        position: { x: 20, y: 0, z: 20 }, // Far from base
      })

      registerResourceNode(world, {
        id: 'stone-1',
        type: 'stone',
        position: { x: 25, y: 0, z: 25 },
        available: true,
      })

      updateBotAI(crafter!, world, 16)

      // Should gather (crafter prefers stone)
      expect(crafter!.task?.type).toBe('gather')
      expect(crafter!.task?.resourceType).toBe('stone')
    })
  })

  describe('Miner — regression through new dispatch path', () => {
    it('should gather nearest preferred resource unchanged', () => {
      const miner = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      registerResourceNode(world, {
        id: 'iron-1',
        type: 'iron',
        position: { x: 10, y: 0, z: 10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'stone-1',
        type: 'stone',
        position: { x: 5, y: 0, z: 5 },
        available: true,
      })

      updateBotAI(miner!, world, 16)

      // Miner prefers iron over stone
      expect(miner!.task?.resourceType).toBe('iron')
      expect(miner!.aiState?.current).toBe('moving')
    })
  })

  describe('Helper functions', () => {
    it('findRandomResource should return null for unavailable type', () => {
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: 10, y: 0, z: 10 },
        available: false, // Not available
      })

      const result = findRandomResource(world, 'wood')
      expect(result).toBeNull()
    })

    it('findBotWithItems should skip haulers and empty bots', () => {
      const hauler2 = createBot(world, {
        type: 'hauler',
        position: { x: 5, y: 0, z: 0 },
      })
      hauler2!.inventory = { items: ['wood'] }

      const emptyMiner = createBot(world, {
        type: 'miner',
        position: { x: 10, y: 0, z: 0 },
      })
      emptyMiner!.inventory = { items: [] }

      const result = findBotWithItems(world, { x: 0, y: 0, z: 0 }, 999)
      expect(result).toBeNull()
    })
  })
})
