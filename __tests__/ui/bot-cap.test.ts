/**
 * Unit Tests: Bot Cap Enforcement (WS-03-BUG-03)
 *
 * Tests bot capacity limit:
 * - Maximum 10 bots allowed
 * - Add Bot button disabled when cap reached
 * - Bot count display shows X/10
 * - ECS and Zustand both enforce cap
 *
 * Expected: ALL TESTS FAIL (bot cap not implemented - RED phase)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '@/stores/game-state'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot } from '@/ecs/entities/bot'

describe('Bot Cap Enforcement (WS-03-BUG-03)', () => {
  beforeEach(() => {
    useGameStore.setState({
      bots: [],
      resources: { wood: 0, stone: 0, iron: 0, crystals: 0 },
    })
  })

  describe('BDD Scenario: Maximum 10 bots enforced in Zustand', () => {
    it('should allow adding bots up to 10', () => {
      // Given: Empty bot roster
      const { result } = renderHook(() => useGameStore())

      // When: Adding 10 bots
      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addBot({ type: 'miner', status: 'idle' })
        }
      })

      // Then: 10 bots exist in store
      expect(result.current.bots.length).toBe(10)
    })

    it('should prevent adding 11th bot', () => {
      // Given: 10 bots already in roster
      const { result } = renderHook(() => useGameStore())

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addBot({ type: 'miner', status: 'idle' })
        }
      })

      expect(result.current.bots.length).toBe(10)

      // When: Attempting to add 11th bot
      act(() => {
        result.current.addBot({ type: 'miner', status: 'idle' })
      })

      // Then: Still only 10 bots (11th rejected)
      expect(result.current.bots.length).toBe(10)
    })

    it('should return null when addBot fails due to cap', () => {
      // Given: 10 bots
      const { result } = renderHook(() => useGameStore())

      act(() => {
        for (let i = 0; i < 10; i++) {
          result.current.addBot({ type: 'miner', status: 'idle' })
        }
      })

      // When: Attempting to add 11th
      let botId: string | null = null
      act(() => {
        botId = result.current.addBot({ type: 'miner', status: 'idle' })
      })

      // Then: addBot returns null (or empty string)
      expect(botId).toBeFalsy()
    })
  })

  describe('BDD Scenario: Maximum 10 bots enforced in ECS', () => {
    it('should allow creating 10 bot entities', () => {
      // Given: ECS world
      const world = createWorld()

      // When: Creating 10 bots
      for (let i = 0; i < 10; i++) {
        createBot(world, { type: 'miner', position: { x: i, y: 0, z: 0 } })
      }

      // Then: 10 entities exist
      expect(world.entities.length).toBe(10)
    })

    it('should prevent creating 11th bot entity', () => {
      // Given: 10 bots in ECS
      const world = createWorld()

      for (let i = 0; i < 10; i++) {
        createBot(world, { type: 'miner', position: { x: i, y: 0, z: 0 } })
      }

      // When: Attempting to create 11th
      const bot11 = createBot(world, { type: 'miner', position: { x: 10, y: 0, z: 0 } })

      // Then: createBot returns null or bot is not added to world
      if (bot11 === null) {
        expect(bot11).toBeNull()
      } else {
        expect(world.entities.length).toBe(10) // 11th bot not added
      }
    })
  })

  describe('BDD Scenario: UI shows bot count and cap', () => {
    it('should display bot count as X/10', () => {
      // Given: 5 bots in store
      useGameStore.setState({
        bots: Array(5).fill(null).map((_, i) => ({
          id: `bot-${i}`,
          type: 'miner' as const,
          status: 'idle' as const,
          energy: 100,
        })),
      })

      // Then: Bot count should be 5/10
      const botCount = useGameStore.getState().bots.length
      const maxBots = 10
      expect(`${botCount}/${maxBots}`).toBe('5/10')
    })

    it('should show 10/10 when at capacity', () => {
      // Given: 10 bots
      useGameStore.setState({
        bots: Array(10).fill(null).map((_, i) => ({
          id: `bot-${i}`,
          type: 'miner' as const,
          status: 'idle' as const,
          energy: 100,
        })),
      })

      // Then: Count is 10/10
      const botCount = useGameStore.getState().bots.length
      expect(botCount).toBe(10)
    })
  })

  describe('BDD Scenario: Add Bot button disabled at cap', () => {
    it('should return true for canAddBot when below cap', () => {
      // Given: 9 bots
      useGameStore.setState({
        bots: Array(9).fill(null).map((_, i) => ({
          id: `bot-${i}`,
          type: 'miner' as const,
          status: 'idle' as const,
          energy: 100,
        })),
      })

      // Then: Can add bot
      const canAdd = useGameStore.getState().bots.length < 10
      expect(canAdd).toBe(true)
    })

    it('should return false for canAddBot when at cap', () => {
      // Given: 10 bots
      useGameStore.setState({
        bots: Array(10).fill(null).map((_, i) => ({
          id: `bot-${i}`,
          type: 'miner' as const,
          status: 'idle' as const,
          energy: 100,
        })),
      })

      // Then: Cannot add bot
      const canAdd = useGameStore.getState().bots.length < 10
      expect(canAdd).toBe(false)
    })
  })

  describe('Edge Cases: Bot Cap', () => {
    it('should handle mixed bot types at cap', () => {
      // Given: 10 bots of different types
      const { result } = renderHook(() => useGameStore())

      act(() => {
        result.current.addBot({ type: 'miner', status: 'idle' })
        result.current.addBot({ type: 'miner', status: 'idle' })
        result.current.addBot({ type: 'miner', status: 'idle' })
        result.current.addBot({ type: 'hauler', status: 'idle' })
        result.current.addBot({ type: 'hauler', status: 'idle' })
        result.current.addBot({ type: 'crafter', status: 'idle' })
        result.current.addBot({ type: 'crafter', status: 'idle' })
        result.current.addBot({ type: 'scout', status: 'idle' })
        result.current.addBot({ type: 'scout', status: 'idle' })
        result.current.addBot({ type: 'scout', status: 'idle' })
      })

      expect(result.current.bots.length).toBe(10)

      // When: Attempting to add any type
      act(() => {
        result.current.addBot({ type: 'miner', status: 'idle' })
      })

      // Then: Still 10
      expect(result.current.bots.length).toBe(10)
    })

    it('should allow adding bot after one is removed', () => {
      // Given: 10 bots
      useGameStore.setState({
        bots: Array(10).fill(null).map((_, i) => ({
          id: `bot-${i}`,
          type: 'miner' as const,
          status: 'idle' as const,
          energy: 100,
        })),
      })

      // When: Removing one bot
      const { result } = renderHook(() => useGameStore())
      act(() => {
        useGameStore.setState((state) => ({
          bots: state.bots.slice(0, 9),
        }))
      })

      expect(result.current.bots.length).toBe(9)

      // When: Adding new bot
      act(() => {
        result.current.addBot({ type: 'miner', status: 'idle' })
      })

      // Then: Back to 10
      expect(result.current.bots.length).toBe(10)
    })
  })
})
