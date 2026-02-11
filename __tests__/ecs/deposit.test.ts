/**
 * Unit Tests: Deposit System
 *
 * Tests resource deposit behavior:
 * - Bot at base with full inventory triggers deposit
 * - Resources transferred from bot.inventory to game store
 * - Bot inventory cleared
 * - Bot returns to idle state
 *
 * Expected: ALL TESTS FAIL (no implementation exists yet - RED phase of TDD)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, BotEntity } from '@/ecs/entities/bot'
import { depositResources, canDeposit } from '@/ecs/systems/deposit'
import { useGameStore } from '@/stores/game-state'
import { calculatePath } from '@/ecs/systems/pathfinding'

describe('Deposit System (WS-02-US-02)', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
    // Reset Zustand store
    useGameStore.setState({
      resources: {
        wood: 50,
        stone: 0,
        iron: 0,
        crystals: 0,
      },
    })
  })

  describe('BDD Scenario: Bot returns to base with full inventory', () => {
    it('should calculate path to base (0, 0, 0) when inventory full', () => {
      // Given: Bot at position (-10, 0, -10) with 10 wood items
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.inventory = { items: Array(10).fill('wood') }

      // Given: Bot stats.capacity is 10
      expect(bot.stats?.capacity).toBe(10)

      // Given: Base is at position (0, 0, 0)
      const basePosition = { x: 0, y: 0, z: 0 }

      // When: Bot AI detects full inventory and calculates return path
      // (This is tested in bot-ai.test.ts, but we verify the expectation)
      const path = calculatePath(bot.position!, basePosition)

      // Then: Path should point to (0, 0, 0)
      expect(path.waypoints).toBeDefined()
      expect(path.waypoints.length).toBeGreaterThan(0)

      const lastWaypoint = path.waypoints[path.waypoints.length - 1]
      expect(lastWaypoint.x).toBeCloseTo(0, 1)
      expect(lastWaypoint.y).toBeCloseTo(0, 1)
      expect(lastWaypoint.z).toBeCloseTo(0, 1)
    })
  })

  describe('BDD Scenario: Bot deposits resources at base', () => {
    it('should detect bot at base (distance < 1.0)', () => {
      // Given: Bot at position (0, 0, 0) with status 'returning'
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.task = { type: 'gather', active: true, progress: 0 }
      bot.inventory = { items: Array(10).fill('wood') }

      // When: Checking if bot can deposit
      const canDep = canDeposit(bot)

      // Then: Should return true (at base with inventory)
      expect(canDep).toBe(true)
    })

    it('should transfer wood from bot inventory to game store', () => {
      // Given: Bot at position (0, 0, 0) with status 'returning'
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.task = { type: 'gather', active: false, progress: 0 }
      bot.inventory = { items: Array(10).fill('wood') }

      // Given: Game store has 50 wood
      const initialWood = useGameStore.getState().resources.wood
      expect(initialWood).toBe(50)

      // When: Deposit system executes
      depositResources(bot, world)

      // Then: Game store wood increases by 10 (now 60)
      const finalWood = useGameStore.getState().resources.wood
      expect(finalWood).toBe(60)
    })

    it('should clear bot inventory after deposit', () => {
      // Given: Bot with 10 wood items
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: Array(10).fill('wood') }

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Bot inventory.items is empty array
      expect(bot.inventory?.items).toEqual([])
      expect(bot.inventory?.items.length).toBe(0)
    })

    it('should transition bot to idle state after deposit', () => {
      // Given: Bot returning to base
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.aiState = { current: 'moving' }
      bot.task = { type: 'gather', active: true, progress: 0 }
      bot.inventory = { items: Array(10).fill('wood') }

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Bot aiState.current is 'idle'
      expect(bot.aiState?.current).toBe('idle')

      // Then: Bot task is inactive
      expect(bot.task?.active).toBe(false)
    })
  })

  describe('Multi-Resource Deposits', () => {
    it('should deposit mixed resource types correctly', () => {
      // Given: Bot with mixed inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = {
        items: ['wood', 'wood', 'wood', 'stone', 'stone', 'iron'],
      }

      // Given: Initial store values
      useGameStore.setState({
        resources: {
          wood: 10,
          stone: 5,
          iron: 2,
          crystals: 0,
        },
      })

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Each resource type incremented correctly
      const resources = useGameStore.getState().resources
      expect(resources.wood).toBe(13) // 10 + 3
      expect(resources.stone).toBe(7) // 5 + 2
      expect(resources.iron).toBe(3) // 2 + 1
      expect(resources.crystals).toBe(0) // Unchanged
    })

    it('should deposit stone resources', () => {
      // Given: Bot with stone inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: Array(5).fill('stone') }

      useGameStore.setState({
        resources: {
          wood: 0,
          stone: 10,
          iron: 0,
          crystals: 0,
        },
      })

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Stone count increases
      expect(useGameStore.getState().resources.stone).toBe(15)
    })

    it('should deposit iron resources', () => {
      // Given: Bot with iron inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: Array(3).fill('iron') }

      useGameStore.setState({
        resources: {
          wood: 0,
          stone: 0,
          iron: 7,
          crystals: 0,
        },
      })

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Iron count increases
      expect(useGameStore.getState().resources.iron).toBe(10)
    })

    it('should deposit crystal resources', () => {
      // Given: Bot with crystal inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: Array(2).fill('crystals') }

      useGameStore.setState({
        resources: {
          wood: 0,
          stone: 0,
          iron: 0,
          crystals: 8,
        },
      })

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Crystal count increases
      expect(useGameStore.getState().resources.crystals).toBe(10)
    })
  })

  describe('Edge Cases', () => {
    it('should not deposit if bot is not at base', () => {
      // Given: Bot far from base
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })

      bot.inventory = { items: Array(10).fill('wood') }

      // When: Checking if can deposit
      const canDep = canDeposit(bot)

      // Then: Should return false
      expect(canDep).toBe(false)
    })

    it('should not deposit if inventory is empty', () => {
      // Given: Bot at base with empty inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: [] }

      // When: Checking if can deposit
      const canDep = canDeposit(bot)

      // Then: Should return false
      expect(canDep).toBe(false)
    })

    it('should handle deposit at base edge (distance = 0.9)', () => {
      // Given: Bot just within base range
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0.5, y: 0, z: 0.7 }, // Distance ~0.86
      })

      bot.inventory = { items: Array(5).fill('wood') }

      // When: Checking if can deposit
      const canDep = canDeposit(bot)

      // Then: Should return true (within threshold)
      expect(canDep).toBe(true)
    })

    it('should not deposit if just outside base range (distance = 1.1)', () => {
      // Given: Bot just outside base threshold
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 1.0, y: 0, z: 0.5 }, // Distance ~1.12
      })

      bot.inventory = { items: Array(5).fill('wood') }

      // When: Checking if can deposit
      const canDep = canDeposit(bot)

      // Then: Should return false
      expect(canDep).toBe(false)
    })

    it('should handle unknown resource types gracefully', () => {
      // Given: Bot with unknown resource type
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: ['wood', 'unknown-resource', 'stone'] }

      const initialWood = useGameStore.getState().resources.wood

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Should deposit known types, ignore unknown
      const resources = useGameStore.getState().resources
      expect(resources.wood).toBeGreaterThan(initialWood)
      // Unknown resource should not crash the system
    })
  })

  describe('Integration with Game Store', () => {
    it('should trigger Zustand store update listeners', () => {
      // Given: Zustand store subscriber
      const subscriber = vi.fn()
      useGameStore.subscribe(subscriber)

      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: Array(10).fill('wood') }

      // When: Deposit executes
      depositResources(bot, world)

      // Then: Store update should trigger subscriber
      expect(subscriber).toHaveBeenCalled()
    })

    it('should record production rate for deposited resources', () => {
      // Given: Bot deposits after gathering for known duration
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.inventory = { items: Array(10).fill('wood') }

      // When: Deposit with production tracking
      depositResources(bot, world, { trackProduction: true, duration: 60000 }) // 1 minute

      // Then: Production rate should be recorded
      const woodRate = useGameStore.getState().getProductionRate('wood')
      expect(woodRate).toBeGreaterThan(0)
    })
  })
})
