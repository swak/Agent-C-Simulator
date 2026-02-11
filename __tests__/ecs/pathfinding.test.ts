/**
 * Unit Tests: Pathfinding System
 *
 * Tests path calculation with obstacle avoidance:
 * - Direct path when no obstacles
 * - Detour path around obstacles
 * - Blocked destination detection
 */

import { describe, it, expect } from 'vitest'
import { calculatePath } from '@/ecs/systems/pathfinding'

describe('Pathfinding System', () => {
  describe('Direct path calculation', () => {
    it('should calculate direct path when no obstacles exist', () => {
      // Given: Start and end positions with no obstacles
      const start = { x: 0, y: 0, z: 0 }
      const end = { x: 10, y: 0, z: 10 }

      // When: Calculate path
      const result = calculatePath(start, end)

      // Then: Path succeeds with direct waypoint
      expect(result.success).toBe(true)
      expect(result.waypoints.length).toBeGreaterThan(0)
      expect(result.waypoints[result.waypoints.length - 1]).toEqual(end)
    })
  })

  describe('Obstacle avoidance', () => {
    it('should create detour path when obstacle blocks direct route', () => {
      // Given: Start and end with obstacle in between
      const start = { x: 0, y: 0, z: 0 }
      const end = { x: 10, y: 0, z: 10 }
      const obstacles = [{ x: 5, y: 0, z: 5, radius: 3 }]

      // When: Calculate path with obstacles
      const result = calculatePath(start, end, { obstacles })

      // Then: Path succeeds with detour waypoints
      expect(result.success).toBe(true)
      expect(result.waypoints.length).toBeGreaterThan(1) // Multiple waypoints for detour
    })
  })

  describe('Blocked destination', () => {
    it('should fail when destination is inside obstacle', () => {
      // Given: End position inside obstacle radius
      const start = { x: 0, y: 0, z: 0 }
      const end = { x: 10, y: 0, z: 10 }
      const obstacles = [{ x: 10, y: 0, z: 10, radius: 5 }] // Obstacle at destination

      // When: Calculate path
      const result = calculatePath(start, end, { obstacles })

      // Then: Path fails with 'no-path' reason
      expect(result.success).toBe(false)
      expect(result.reason).toBe('no-path')
      expect(result.waypoints.length).toBe(0)
    })

    it('should fail when destination is within obstacle radius', () => {
      // Given: End position very close to obstacle center
      const start = { x: 0, y: 0, z: 0 }
      const end = { x: 10, y: 0, z: 10 }
      const obstacles = [{ x: 11, y: 0, z: 11, radius: 2 }] // Covers end position

      // When: Calculate path
      const result = calculatePath(start, end, { obstacles })

      // Then: Path calculation should detect blocked destination
      expect(result.success).toBe(false)
      expect(result.reason).toBe('no-path')
    })
  })
})
