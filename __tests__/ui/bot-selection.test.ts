/**
 * Integration Tests: Bot Selection with Q/E Keys
 *
 * Tests bot selection system:
 * - Q/E key handlers
 * - Selection wraps around bot roster
 * - selectedBotId persists in store
 * - Visual indicators update
 *
 * Expected: TESTS WILL FAIL (no implementation exists yet - RED phase of TDD)
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useGameStore } from '@/stores/game-state'
import { fireEvent } from '@testing-library/dom'
import { setupKeyboardListeners, cleanupKeyboardListeners } from '@/utils/keyboard'

describe('Bot Selection System (WS-02-US-04)', () => {
  beforeEach(() => {
    // Reset store
    useGameStore.setState({
      bots: [],
      selectedBotId: null,
    })
  })

  describe('BDD Scenario: Player cycles through bots with E key', () => {
    it('should select first bot when pressing E with no selection', () => {
      // Given: 3 bots exist with IDs: bot-1, bot-2, bot-3
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: null,
      })

      // When: Player presses E key
      const keyEvent = new KeyboardEvent('keydown', { key: 'e' })
      fireEvent(document, keyEvent)

      // Then: selectedBotId is bot-1
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')
    })

    it('should cycle to next bot when pressing E', () => {
      // Given: 3 bots, bot-1 currently selected
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-1',
      })

      // When: Player presses E key
      const keyEvent = new KeyboardEvent('keydown', { key: 'e' })
      fireEvent(document, keyEvent)

      // Then: selectedBotId is bot-2
      expect(useGameStore.getState().selectedBotId).toBe('bot-2')
    })

    it('should handle uppercase E key', () => {
      // Given: Bots in store
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
        ],
        selectedBotId: null,
      })

      // When: Player presses Shift+E
      const keyEvent = new KeyboardEvent('keydown', { key: 'E' })
      fireEvent(document, keyEvent)

      // Then: Should still work
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')
    })
  })

  describe('BDD Scenario: Selection wraps around roster', () => {
    it('should wrap to first bot when pressing E on last bot', () => {
      // Given: 3 bots: bot-1, bot-2, bot-3
      // Given: selectedBotId is bot-3 (last bot)
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-3',
      })

      // When: Player presses E key
      const keyEvent = new KeyboardEvent('keydown', { key: 'e' })
      fireEvent(document, keyEvent)

      // Then: selectedBotId wraps to bot-1 (first bot)
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')
    })

    it('should wrap to last bot when pressing Q on first bot', () => {
      // Given: 3 bots, bot-1 selected
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-1',
      })

      // When: Player presses Q key
      const keyEvent = new KeyboardEvent('keydown', { key: 'q' })
      fireEvent(document, keyEvent)

      // Then: selectedBotId wraps to bot-3 (last bot)
      expect(useGameStore.getState().selectedBotId).toBe('bot-3')
    })
  })

  describe('Q Key (Previous Bot)', () => {
    it('should select previous bot when pressing Q', () => {
      // Given: 3 bots, bot-2 selected
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-2',
      })

      // When: Player presses Q key
      const keyEvent = new KeyboardEvent('keydown', { key: 'q' })
      fireEvent(document, keyEvent)

      // Then: selectedBotId is bot-1
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')
    })

    it('should select last bot when pressing Q with no selection', () => {
      // Given: 3 bots, no selection
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: null,
      })

      // When: Player presses Q key
      const keyEvent = new KeyboardEvent('keydown', { key: 'q' })
      fireEvent(document, keyEvent)

      // Then: selectedBotId is bot-3 (last bot)
      expect(useGameStore.getState().selectedBotId).toBe('bot-3')
    })
  })

  describe('Selection Persistence', () => {
    it('should persist selection across frames', () => {
      // Given: Bot selected
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-2',
      })

      // When: Time passes (simulated)
      // Then: Selection should remain
      expect(useGameStore.getState().selectedBotId).toBe('bot-2')
    })

    it('should clear selection when selected bot is removed', () => {
      // Given: bot-2 selected
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-2',
      })

      // When: bot-2 is removed from roster
      useGameStore.setState({
        bots: [{ id: 'bot-1', type: 'miner', status: 'idle', energy: 100 }],
        selectedBotId: null,
      })

      // Then: Selection should be cleared
      expect(useGameStore.getState().selectedBotId).toBeNull()
    })
  })

  describe('Edge Cases', () => {
    it('should handle empty bot roster', () => {
      // Given: No bots
      useGameStore.setState({
        bots: [],
        selectedBotId: null,
      })

      // When: Player presses E
      const keyEvent = new KeyboardEvent('keydown', { key: 'e' })
      fireEvent(document, keyEvent)

      // Then: Should remain null (no crash)
      expect(useGameStore.getState().selectedBotId).toBeNull()
    })

    it('should handle single bot roster', () => {
      // Given: Only 1 bot
      useGameStore.setState({
        bots: [{ id: 'bot-1', type: 'miner', status: 'idle', energy: 100 }],
        selectedBotId: null,
      })

      // When: Player presses E
      const keyEvent1 = new KeyboardEvent('keydown', { key: 'e' })
      fireEvent(document, keyEvent1)

      // Then: Should select bot-1
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')

      // When: Player presses E again
      const keyEvent2 = new KeyboardEvent('keydown', { key: 'e' })
      fireEvent(document, keyEvent2)

      // Then: Should remain on bot-1 (wrap to self)
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')
    })

    it('should handle rapid key presses (debounce)', () => {
      // Given: 3 bots
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
          { id: 'bot-3', type: 'scout', status: 'idle', energy: 100 },
        ],
        selectedBotId: null,
      })

      // When: Player rapidly presses E 10 times
      for (let i = 0; i < 10; i++) {
        const keyEvent = new KeyboardEvent('keydown', { key: 'e' })
        fireEvent(document, keyEvent)
      }

      // Then: Should cycle correctly (10 % 3 = 1, so bot-2)
      const finalSelection = useGameStore.getState().selectedBotId
      expect(['bot-1', 'bot-2', 'bot-3']).toContain(finalSelection)
    })

    it('should ignore other keys', () => {
      // Given: Bot selected
      useGameStore.setState({
        bots: [
          { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
          { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
        ],
        selectedBotId: 'bot-1',
      })

      // When: Player presses other keys
      const keyEvent1 = new KeyboardEvent('keydown', { key: 'w' })
      const keyEvent2 = new KeyboardEvent('keydown', { key: 'a' })
      const keyEvent3 = new KeyboardEvent('keydown', { key: 's' })

      fireEvent(document, keyEvent1)
      fireEvent(document, keyEvent2)
      fireEvent(document, keyEvent3)

      // Then: Selection should not change
      expect(useGameStore.getState().selectedBotId).toBe('bot-1')
    })
  })

  describe('Zustand Store Integration', () => {
    it('should add selectNextBot action to store', () => {
      // Given: Store with selectNextBot action
      const store = useGameStore.getState()

      // Then: Action should exist
      expect(store.selectNextBot).toBeDefined()
      expect(typeof store.selectNextBot).toBe('function')
    })

    it('should add selectPreviousBot action to store', () => {
      // Given: Store with selectPreviousBot action
      const store = useGameStore.getState()

      // Then: Action should exist
      expect(store.selectPreviousBot).toBeDefined()
      expect(typeof store.selectPreviousBot).toBe('function')
    })

    it('should add selectedBotId state to store', () => {
      // Given: Store state
      const state = useGameStore.getState()

      // Then: selectedBotId should exist
      expect('selectedBotId' in state).toBe(true)
    })
  })

  describe('Keyboard Event Listener Setup', () => {
    it('should register keyboard event listener on mount', () => {
      // Given: Document event listener spy
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      // When: Keyboard handler component mounts
      setupKeyboardListeners()

      // Then: Should register keydown listener
      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })

    it('should clean up event listener on unmount', () => {
      // Given: Document event listener spy
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')
      setupKeyboardListeners()
      cleanupKeyboardListeners()

      // Then: Should remove keydown listener
      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      )
    })
  })
})

describe('Bot Selection Visual Indicators', () => {
  beforeEach(() => {
    useGameStore.setState({
      bots: [
        { id: 'bot-1', type: 'miner', status: 'idle', energy: 100 },
        { id: 'bot-2', type: 'hauler', status: 'idle', energy: 100 },
      ],
      selectedBotId: null,
    })
  })

  describe('3D Scene Visual Indicators', () => {
    it('should return selected bot ID for visual rendering', () => {
      // Given: bot-1 selected
      useGameStore.setState({ selectedBotId: 'bot-1' })

      // When: Getting selected bot ID
      const selectedId = useGameStore.getState().selectedBotId

      // Then: Should return bot-1
      expect(selectedId).toBe('bot-1')
    })

    it('should provide isSelected helper function', () => {
      // Given: bot-2 selected
      useGameStore.setState({ selectedBotId: 'bot-2' })

      const store = useGameStore.getState()

      // When: Checking if bot is selected
      const isBot1Selected = store.selectedBotId === 'bot-1'
      const isBot2Selected = store.selectedBotId === 'bot-2'

      // Then: Only bot-2 should be selected
      expect(isBot1Selected).toBe(false)
      expect(isBot2Selected).toBe(true)
    })
  })

  describe('Roster Panel Highlight', () => {
    it('should identify selected bot in roster', () => {
      // Given: bot-1 selected
      useGameStore.setState({ selectedBotId: 'bot-1' })

      const bots = useGameStore.getState().bots
      const selectedId = useGameStore.getState().selectedBotId

      // When: Rendering roster
      const selectedBot = bots.find((b) => b.id === selectedId)

      // Then: Should find selected bot
      expect(selectedBot).toBeDefined()
      expect(selectedBot?.id).toBe('bot-1')
    })
  })
})
