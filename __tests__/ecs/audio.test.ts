/**
 * Unit Tests: Audio Event System
 *
 * Tests audio event queue management:
 * - Queue events with timestamps
 * - Retrieve and clear queue
 * - Multiple event handling
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { queueAudioEvent, getAudioEvents, clearAudioEvents } from '@/ecs/systems/audio'

describe('Audio Event System', () => {
  beforeEach(() => {
    // Clear queue before each test
    clearAudioEvents()
  })

  describe('Event queueing', () => {
    it('should queue audio event with timestamp', () => {
      // Given: No events in queue
      // When: Queue a gathering event
      queueAudioEvent({ type: 'gathering-complete', resourceType: 'wood' })

      // Then: Event should be in queue
      const events = getAudioEvents()
      expect(events.length).toBe(1)
      expect(events[0].type).toBe('gathering-complete')
      expect(events[0].resourceType).toBe('wood')
      expect(events[0].timestamp).toBeDefined()
    })

    it('should queue multiple events', () => {
      // Given: Empty queue
      // When: Queue multiple events
      queueAudioEvent({ type: 'gathering-complete', resourceType: 'wood' })
      queueAudioEvent({ type: 'crafting-complete' })
      queueAudioEvent({ type: 'tech-unlock' })

      // Then: All events should be queued
      const events = getAudioEvents()
      expect(events.length).toBe(3)
    })
  })

  describe('Event retrieval', () => {
    it('should retrieve all events and clear queue', () => {
      // Given: Multiple queued events
      queueAudioEvent({ type: 'gathering-complete', resourceType: 'wood' })
      queueAudioEvent({ type: 'crafting-complete' })

      // When: Get audio events
      const events = getAudioEvents()

      // Then: Events returned and queue cleared
      expect(events.length).toBe(2)

      // When: Get events again
      const emptyEvents = getAudioEvents()

      // Then: Queue should be empty
      expect(emptyEvents.length).toBe(0)
    })
  })

  describe('Queue clearing', () => {
    it('should clear all events from queue', () => {
      // Given: Events in queue
      queueAudioEvent({ type: 'gathering-complete', resourceType: 'wood' })
      queueAudioEvent({ type: 'crafting-complete' })

      // When: Clear audio events
      clearAudioEvents()

      // Then: Queue should be empty
      const events = getAudioEvents()
      expect(events.length).toBe(0)
    })
  })
})
