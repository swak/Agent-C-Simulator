/**
 * Keyboard Event Handlers
 *
 * Handles Q/E key presses for bot selection cycling
 */

import { useGameStore } from '@/stores/game-state'

let keydownHandler: ((event: KeyboardEvent) => void) | null = null

/**
 * Setup keyboard event listeners
 */
export function setupKeyboardListeners(): void {
  keydownHandler = (event: KeyboardEvent) => {
    const key = event.key.toLowerCase()

    if (key === 'e') {
      // Select next bot
      useGameStore.getState().selectNextBot()
    } else if (key === 'q') {
      // Select previous bot
      useGameStore.getState().selectPreviousBot()
    }
  }

  document.addEventListener('keydown', keydownHandler)
}

/**
 * Clean up keyboard event listeners
 */
export function cleanupKeyboardListeners(): void {
  if (keydownHandler) {
    document.removeEventListener('keydown', keydownHandler)
    keydownHandler = null
  }
}
