/**
 * Unit Tests: ECS-to-Zustand Sync System
 *
 * Tests synchronization of ECS entities to Zustand store:
 * - Bot state mapping (AI state to status)
 * - Position, energy, task sync
 * - Creating and updating bots in store
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot } from '@/ecs/entities/bot'
import { syncECSToZustand } from '@/ecs/systems/sync'
import { useGameStore } from '@/stores/game-state'

describe('ECS-to-Zustand Sync System', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
    // Reset store
    useGameStore.setState({ bots: [] })
  })

  describe('AI state to status mapping', () => {
    it('should map "blocked" AI state to "blocked" status', () => {
      // Given: Bot with blocked AI state
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.aiState = { current: 'blocked' }

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Bot status should be "blocked"
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(1)
      expect(storeBots[0].status).toBe('blocked')
    })

    it('should map unknown AI state to "idle" status', () => {
      // Given: Bot with unknown AI state
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.aiState = { current: 'unknown-state' as any }

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Bot status should default to "idle"
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(1)
      expect(storeBots[0].status).toBe('idle')
    })
  })

  describe('Bot creation in store', () => {
    it('should create new bot in store when not exists', () => {
      // Given: New bot entity in ECS
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 5, y: 0, z: 10 },
      })

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Bot should be added to store
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(1)
      expect(storeBots[0].id).toBe(`bot-${bot.id}`)
      expect(storeBots[0].type).toBe('miner')
      expect(storeBots[0].position).toEqual({ x: 5, y: 0, z: 10 })
    })

    it('should handle bot without position by using fallback', () => {
      // Given: Bot entity without position component
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      delete bot.position

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Bot should use default position
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(1)
      expect(storeBots[0].position).toEqual({ x: 0, y: 0, z: 0 })
    })

    it('should handle bot without AI state by using fallback', () => {
      // Given: Bot without AI state component
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      delete bot.aiState

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Bot should use default status
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(1)
      expect(storeBots[0].status).toBe('idle')
    })

    it('should handle bot without energy by using fallback', () => {
      // Given: Bot without energy component
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      delete bot.energy

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Bot should use default energy
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(1)
      expect(storeBots[0].energy).toBe(100)
    })
  })

  describe('Bot updates in store', () => {
    it('should update existing bot in store', () => {
      // Given: Bot already exists in store
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      syncECSToZustand(world)
      const initialBots = useGameStore.getState().bots
      expect(initialBots.length).toBe(1)

      // When: Bot position and state change
      bot.position = { x: 10, y: 0, z: 10 }
      bot.aiState = { current: 'moving' }
      bot.energy = { current: 75, max: 100 }

      syncECSToZustand(world)

      // Then: Bot should be updated in store
      const updatedBots = useGameStore.getState().bots
      expect(updatedBots.length).toBe(1)
      expect(updatedBots[0].position).toEqual({ x: 10, y: 0, z: 10 })
      expect(updatedBots[0].status).toBe('moving')
      expect(updatedBots[0].energy).toBe(75)
    })
  })

  describe('Task synchronization', () => {
    it('should sync bot task information', () => {
      // Given: Bot with active task
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      bot.task = {
        type: 'gather',
        resourceType: 'wood',
        progress: 50,
        active: true,
      }

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Task should be synced to store
      const storeBots = useGameStore.getState().bots
      expect(storeBots[0].currentTask).toBeDefined()
      expect(storeBots[0].currentTask?.type).toBe('gather')
      expect(storeBots[0].currentTask?.resourceType).toBe('wood')
      expect(storeBots[0].currentTask?.progress).toBe(50)
    })

    it('should not sync task if bot has no task', () => {
      // Given: Bot without task
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      delete bot.task

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: currentTask should be undefined
      const storeBots = useGameStore.getState().bots
      expect(storeBots[0].currentTask).toBeUndefined()
    })
  })

  describe('Entity filtering', () => {
    it('should skip entities without botType', () => {
      // Given: Non-bot entity in world
      const nonBot = world.add({ id: 999, position: { x: 0, y: 0, z: 0 } })

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Non-bot should not be in store
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(0)
    })

    it('should skip entities without id', () => {
      // Given: Entity without id
      const entityWithoutId = world.add({ botType: 'miner', position: { x: 0, y: 0, z: 0 } })
      delete entityWithoutId.id

      // When: Sync ECS to Zustand
      syncECSToZustand(world)

      // Then: Entity should not be in store
      const storeBots = useGameStore.getState().bots
      expect(storeBots.length).toBe(0)
    })
  })
})
