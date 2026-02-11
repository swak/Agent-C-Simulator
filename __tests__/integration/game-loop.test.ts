/**
 * Integration Tests: Game Loop and ECS Integration
 *
 * Tests ECS-to-Zustand synchronization:
 * - updateWorld wired into useFrame
 * - Delta time passed correctly
 * - ECS state synced to Zustand after each frame
 * - All systems run without errors
 *
 * Expected: ALL TESTS FAIL (no integration exists yet - RED phase of TDD)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot } from '@/ecs/entities/bot'
import { updateWorld } from '@/ecs/systems/update'
import { syncECSToZustand } from '@/ecs/systems/sync'
import { useGameStore } from '@/stores/game-state'
import { registerResourceNode } from '@/ecs/systems/resources'
import { depositResources } from '@/ecs/systems/deposit'

describe('Game Loop Integration (WS-02-US-03)', () => {
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

  describe('BDD Scenario: ECS systems run on every frame', () => {
    it('should run updateWorld with delta time from useFrame', () => {
      // Given: ECS world has 3 bots with different states (idle, moving, gathering)
      const bot1 = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot1.aiState = { current: 'idle' }

      const bot2 = createBot(world, {
        type: 'hauler',
        position: { x: -5, y: 0, z: -5 },
      })
      bot2.aiState = { current: 'moving' }
      bot2.path = {
        waypoints: [{ x: -10, y: 0, z: -10 }],
        currentIndex: 0,
      }

      const bot3 = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })
      bot3.aiState = { current: 'gathering' }
      bot3.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 50,
        duration: 5000,
      }

      // When: useFrame executes with delta=0.016 (60fps)
      // When: updateWorld(world, 0.016) is called
      const delta = 0.016 // 60fps

      expect(() => {
        updateWorld(world, delta)
      }).not.toThrow()

      // Then: All systems should execute without errors
      expect(world.entities.length).toBe(3)
    })

    it('should run updateEnergy for all bots', () => {
      // Given: 3 bots in world
      const bot1 = createBot(world, { type: 'miner' })
      const bot2 = createBot(world, { type: 'hauler' })
      const bot3 = createBot(world, { type: 'scout' })

      bot1.aiState = { current: 'moving' }
      bot2.aiState = { current: 'gathering' }
      bot3.aiState = { current: 'idle' }

      const initialEnergy1 = bot1.energy?.current || 0
      const initialEnergy2 = bot2.energy?.current || 0
      const initialEnergy3 = bot3.energy?.current || 0

      // When: updateWorld runs
      updateWorld(world, 0.016)

      // Then: Energy should change based on state
      expect(bot1.energy?.current).not.toBe(initialEnergy1) // Moving drains
      expect(bot2.energy?.current).not.toBe(initialEnergy2) // Gathering drains
      expect(bot3.energy?.current).not.toBe(initialEnergy3) // Idle recharges
    })

    it('should run moveAlongPath for bots with paths', () => {
      // Given: Bot with path
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.aiState = { current: 'moving' }
      bot.path = {
        waypoints: [{ x: 10, y: 0, z: 0 }],
        currentIndex: 0,
      }

      const initialX = bot.position?.x || 0

      // When: updateWorld runs
      updateWorld(world, 0.016)

      // Then: Bot position should change
      expect(bot.position?.x).toBeGreaterThan(initialX)
    })

    it('should run updateGathering for bots with aiState gathering', () => {
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
        duration: 5000,
      }
      bot.inventory = { items: [] }

      // When: updateWorld runs
      updateWorld(world, 0.016)

      // Then: Gathering progress should increase
      expect(bot.task?.progress).toBeGreaterThan(0)
    })

    it('should not throw errors with 0 bots', () => {
      // Given: Empty ECS world
      expect(world.entities.length).toBe(0)

      // When: updateWorld runs
      expect(() => {
        updateWorld(world, 0.016)
      }).not.toThrow()
    })

    it('should handle large delta time gracefully', () => {
      // Given: Bot in world
      const bot = createBot(world, { type: 'miner' })
      bot.aiState = { current: 'idle' }

      // When: updateWorld with large delta (frame stutter)
      expect(() => {
        updateWorld(world, 0.5) // 500ms frame time
      }).not.toThrow()
    })
  })

  describe('BDD Scenario: ECS state syncs to Zustand', () => {
    it('should sync bot position from ECS to Zustand', () => {
      // Given: ECS bot has position (5, 0, 5) and energy 75
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 5, y: 0, z: 5 },
      })
      bot.energy = { current: 75, max: 100 }

      // Given: Zustand bot has position (0, 0, 0) and energy 100
      useGameStore.setState({
        bots: [
          {
            id: `bot-${bot.id}`,
            type: 'miner',
            position: { x: 0, y: 0, z: 0 },
            status: 'idle',
            energy: 100,
          },
        ],
      })

      // When: Sync function reads ECS bot state
      syncECSToZustand(world)

      // Then: Zustand bot.position is (5, 0, 5)
      const zustandBot = useGameStore.getState().bots[0]
      expect(zustandBot.position?.x).toBeCloseTo(5, 1)
      expect(zustandBot.position?.y).toBeCloseTo(0, 1)
      expect(zustandBot.position?.z).toBeCloseTo(5, 1)

      // Then: Zustand bot.energy is 75
      expect(zustandBot.energy).toBeCloseTo(75, 1)
    })

    it('should sync bot AI state to Zustand status', () => {
      // Given: ECS bot in gathering state
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })
      bot.aiState = { current: 'gathering' }

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

      // When: Syncing
      syncECSToZustand(world)

      // Then: Zustand status should reflect ECS state
      const zustandBot = useGameStore.getState().bots[0]
      expect(zustandBot.status).toBe('working') // 'gathering' maps to 'working'
    })

    it('should sync bot task information', () => {
      // Given: ECS bot with active task
      const bot = createBot(world, {
        type: 'miner',
        position: { x: -10, y: 0, z: -10 },
      })
      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        active: true,
        progress: 50,
      }

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

      // When: Syncing
      syncECSToZustand(world)

      // Then: Task info synced
      const zustandBot = useGameStore.getState().bots[0]
      expect(zustandBot.currentTask?.type).toBe('gather')
      expect(zustandBot.currentTask?.resourceType).toBe('wood')
      expect(zustandBot.currentTask?.progress).toBeCloseTo(50, 1)
    })

    it('should create Zustand bot if not exists', () => {
      // Given: ECS bot without corresponding Zustand entry
      const bot = createBot(world, {
        type: 'scout',
        position: { x: 3, y: 0, z: 3 },
      })

      useGameStore.setState({ bots: [] })

      // When: Syncing
      syncECSToZustand(world)

      // Then: Zustand bot should be created
      const zustandBots = useGameStore.getState().bots
      expect(zustandBots.length).toBe(1)
      expect(zustandBots[0].type).toBe('scout')
    })

    it('should handle multiple bots syncing', () => {
      // Given: 5 bots in ECS world
      for (let i = 0; i < 5; i++) {
        const bot = createBot(world, {
          type: 'miner',
          position: { x: i, y: 0, z: i },
        })
        bot.energy = { current: 100 - i * 10, max: 100 }
      }

      useGameStore.setState({ bots: [] })

      // When: Syncing
      syncECSToZustand(world)

      // Then: All 5 bots should be in Zustand
      const zustandBots = useGameStore.getState().bots
      expect(zustandBots.length).toBe(5)
    })
  })

  describe('Frame Rate Performance', () => {
    it('should maintain frame rate with 5 bots', () => {
      // Given: 5 bots in world
      for (let i = 0; i < 5; i++) {
        const bot = createBot(world, {
          type: 'miner',
          position: { x: i * 2, y: 0, z: i * 2 },
        })
        bot.aiState = { current: 'moving' }
        bot.path = {
          waypoints: [{ x: i * 2 + 10, y: 0, z: i * 2 + 10 }],
          currentIndex: 0,
        }
      }

      // When: Running updateWorld multiple times
      const startTime = performance.now()

      for (let i = 0; i < 60; i++) {
        updateWorld(world, 0.016) // Simulate 60 frames
      }

      const endTime = performance.now()
      const duration = endTime - startTime

      // Then: Should complete 60 frames in reasonable time (< 1 second for 5 bots)
      expect(duration).toBeLessThan(1000)
    })

    it('should complete single frame in < 16ms with 5 bots', () => {
      // Given: 5 active bots
      for (let i = 0; i < 5; i++) {
        const bot = createBot(world, {
          type: 'miner',
          position: { x: i, y: 0, z: i },
        })
        bot.aiState = { current: 'gathering' }
        bot.task = {
          type: 'gather',
          resourceType: 'wood',
          active: true,
          progress: 50,
          duration: 5000,
        }
      }

      // When: Running single frame
      const startTime = performance.now()
      updateWorld(world, 0.016)
      const endTime = performance.now()

      const frameTime = endTime - startTime

      // Then: Frame time should be < 16ms (60fps threshold)
      expect(frameTime).toBeLessThan(16)
    })
  })

  describe('Full Integration: updateWorld + syncECS', () => {
    it('should run complete game loop cycle', () => {
      // Given: Bot at base with resource available
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.aiState = { current: 'idle' }

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

      // When: Running game loop (updateWorld + sync)
      for (let i = 0; i < 10; i++) {
        updateWorld(world, 0.016)
        syncECSToZustand(world)
      }

      // Then: Zustand store should reflect ECS changes
      const zustandBot = useGameStore.getState().bots[0]
      expect(zustandBot).toBeDefined()
      expect(zustandBot.status).toBeDefined()
    })

    it('should handle deposit triggering Zustand resource update', () => {
      // Given: Bot at base with full inventory
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.inventory = { items: Array(10).fill('wood') }
      bot.aiState = { current: 'idle' }

      useGameStore.setState({
        resources: { wood: 0, stone: 0, iron: 0, crystals: 0 },
        bots: [],
      })

      // When: Running game loop with deposit
      updateWorld(world, 0.016)
      syncECSToZustand(world)

      depositResources(bot, world)

      // Then: Resources should be updated in Zustand
      const resources = useGameStore.getState().resources
      expect(resources.wood).toBeGreaterThan(0)
    })
  })

  describe('Error Handling', () => {
    it('should handle bot with missing components gracefully', () => {
      // Given: Bot with undefined components
      const bot = createBot(world, { type: 'miner' })
      bot.position = undefined

      // When: updateWorld runs
      expect(() => {
        updateWorld(world, 0.016)
      }).not.toThrow()
    })

    it('should handle sync with empty Zustand store', () => {
      // Given: Bots in ECS but empty Zustand
      createBot(world, { type: 'miner' })

      useGameStore.setState({ bots: [] })

      // When: Syncing
      expect(() => {
        syncECSToZustand(world)
      }).not.toThrow()
    })
  })
})
