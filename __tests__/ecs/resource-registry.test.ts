/**
 * Unit Tests: Resource Node Registry
 *
 * Tests resource node management system:
 * - Register nodes with type, position, available flag
 * - Find nearest node by type
 * - Node claiming (mark unavailable when bot assigned)
 * - Node release when bot leaves
 *
 * Expected: ALL TESTS FAIL (no implementation exists yet - RED phase of TDD)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import {
  registerResourceNode,
  findNearestResource,
  claimResourceNode,
  releaseResourceNode,
  getResourceNode,
  getAllResourceNodes,
} from '@/ecs/systems/resources'
import { createWorld, GameWorld, ResourceNode } from '@/ecs/world'

describe('Resource Node Registry (WS-02-US-05)', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('BDD Scenario: Bot queries nearest wood node', () => {
    it('should register resource node with type, position, and available flag', () => {
      // Given: A wood node at position (-10, 0, -10)
      const node: ResourceNode = {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      }

      // When: Registering the node
      registerResourceNode(world, node)

      // Then: Node should be retrievable
      const retrieved = getResourceNode(world, 'wood-1')
      expect(retrieved).toBeDefined()
      expect(retrieved?.type).toBe('wood')
      expect(retrieved?.position.x).toBe(-10)
      expect(retrieved?.available).toBe(true)
    })

    it('should find nearest resource by type', () => {
      // Given: Bot at position (0, 0, 0)
      const botPosition: Position = { x: 0, y: 0, z: 0 }

      // Given: Wood nodes at (-10, 0, -10), (-8, 0, -15), (-12, 0, -8)
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-2',
        type: 'wood',
        position: { x: -8, y: 0, z: -15 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-3',
        type: 'wood',
        position: { x: -12, y: 0, z: -8 },
        available: true,
      })

      // When: Bot AI calls findNearestResource(world, 'wood', bot.position)
      const nearest = findNearestResource(world, 'wood', botPosition)

      // Then: Function returns node at (-10, 0, -10) (distance ≈14.14)
      expect(nearest).toBeDefined()
      expect(nearest?.id).toBe('wood-1')
      expect(nearest?.position.x).toBeCloseTo(-10, 1)
      expect(nearest?.position.z).toBeCloseTo(-10, 1)

      // Then: Node has type 'wood'
      expect(nearest?.type).toBe('wood')

      // Then: Node has available=true
      expect(nearest?.available).toBe(true)
    })

    it('should calculate Euclidean distance correctly', () => {
      // Given: Bot at origin
      const botPosition: Position = { x: 0, y: 0, z: 0 }

      // Given: Resource at known distance
      registerResourceNode(world, {
        id: 'stone-1',
        type: 'stone',
        position: { x: 3, y: 0, z: 4 }, // Distance = 5.0
        available: true,
      })

      registerResourceNode(world, {
        id: 'stone-2',
        type: 'stone',
        position: { x: 6, y: 0, z: 8 }, // Distance = 10.0
        available: true,
      })

      // When: Finding nearest stone
      const nearest = findNearestResource(world, 'stone', botPosition)

      // Then: Should return stone-1 (distance 5 < 10)
      expect(nearest?.id).toBe('stone-1')
    })
  })

  describe('BDD Scenario: Multiple bots can target different nodes', () => {
    it('should mark node as unavailable when claimed', () => {
      // Given: Available wood node
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // When: Bot-1 claims nearest node (-10, 0, -10)
      claimResourceNode(world, 'wood-1')

      // Then: Bot-1 node is marked unavailable
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(false)
    })

    it('should skip claimed nodes when finding nearest resource', () => {
      // Given: 2 bots at (0, 0, 0)
      const botPosition: Position = { x: 0, y: 0, z: 0 }

      // Given: 3 wood nodes available
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 }, // Nearest
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-2',
        type: 'wood',
        position: { x: -12, y: 0, z: -8 }, // Second nearest
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-3',
        type: 'wood',
        position: { x: -20, y: 0, z: -20 }, // Farthest
        available: true,
      })

      // When: Bot-1 claims nearest node
      claimResourceNode(world, 'wood-1')

      // When: Bot-2 queries for wood
      const nearestForBot2 = findNearestResource(world, 'wood', botPosition)

      // Then: Bot-2 receives next nearest node (-12, 0, -8)
      expect(nearestForBot2?.id).toBe('wood-2')
      expect(nearestForBot2?.position.x).toBeCloseTo(-12, 1)
      expect(nearestForBot2?.position.z).toBeCloseTo(-8, 1)

      // Then: Both bots have different target nodes
      const bot1Node = getResourceNode(world, 'wood-1')
      expect(bot1Node?.available).toBe(false)
      expect(nearestForBot2?.available).toBe(true)
    })

    it('should release node when bot leaves', () => {
      // Given: Claimed node
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      claimResourceNode(world, 'wood-1')
      expect(getResourceNode(world, 'wood-1')?.available).toBe(false)

      // When: Bot releases node
      releaseResourceNode(world, 'wood-1')

      // Then: Node becomes available again
      const node = getResourceNode(world, 'wood-1')
      expect(node?.available).toBe(true)
    })
  })

  describe('Resource Registry Management', () => {
    it('should list all registered nodes', () => {
      // Given: Multiple nodes registered
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'stone-1',
        type: 'stone',
        position: { x: 10, y: 0, z: 10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'iron-1',
        type: 'iron',
        position: { x: 0, y: 0, z: 15 },
        available: true,
      })

      // When: Getting all nodes
      const allNodes = getAllResourceNodes(world)

      // Then: Should return all 3 nodes
      expect(allNodes.length).toBe(3)
      expect(allNodes.map(n => n.id)).toContain('wood-1')
      expect(allNodes.map(n => n.id)).toContain('stone-1')
      expect(allNodes.map(n => n.id)).toContain('iron-1')
    })

    it('should filter resources by type', () => {
      // Given: Mixed resource types
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-2',
        type: 'wood',
        position: { x: -5, y: 0, z: -5 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'stone-1',
        type: 'stone',
        position: { x: 10, y: 0, z: 10 },
        available: true,
      })

      // When: Finding resources by type
      const botPosition: Position = { x: 0, y: 0, z: 0 }
      const woodNode = findNearestResource(world, 'wood', botPosition)
      const stoneNode = findNearestResource(world, 'stone', botPosition)

      // Then: Should return correct types
      expect(woodNode?.type).toBe('wood')
      expect(stoneNode?.type).toBe('stone')
    })

    it('should clear all nodes from registry', () => {
      // Given: Nodes in registry
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      expect(getAllResourceNodes(world).length).toBe(1)

      // When: Creating a new world
      world = createWorld()

      // Then: Registry should be empty
      expect(getAllResourceNodes(world).length).toBe(0)
    })
  })

  describe('Edge Cases', () => {
    it('should return null when no resources of type exist', () => {
      // Given: Only wood nodes registered
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // When: Searching for stone
      const botPosition: Position = { x: 0, y: 0, z: 0 }
      const stoneNode = findNearestResource(world, 'stone', botPosition)

      // Then: Should return null
      expect(stoneNode).toBeNull()
    })

    it('should return null when all resources of type are claimed', () => {
      // Given: All wood nodes claimed
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-2',
        type: 'wood',
        position: { x: -5, y: 0, z: -5 },
        available: true,
      })

      claimResourceNode(world, 'wood-1')
      claimResourceNode(world, 'wood-2')

      // When: Searching for available wood
      const botPosition: Position = { x: 0, y: 0, z: 0 }
      const woodNode = findNearestResource(world, 'wood', botPosition)

      // Then: Should return null (no available nodes)
      expect(woodNode).toBeNull()
    })

    it('should handle duplicate registration gracefully', () => {
      // Given: Node registered twice
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: -10, y: 0, z: -10 },
        available: true,
      })

      // Then: Should only have one instance
      const allNodes = getAllResourceNodes(world)
      const wood1Nodes = allNodes.filter(n => n.id === 'wood-1')
      expect(wood1Nodes.length).toBe(1)
    })

    it('should handle claiming non-existent node', () => {
      // When: Claiming node that doesn't exist
      const result = claimResourceNode(world, 'nonexistent-node')

      // Then: Should return false or handle gracefully
      expect(result).toBe(false)
    })

    it('should handle releasing non-existent node', () => {
      // When: Releasing node that doesn't exist
      const result = releaseResourceNode(world, 'nonexistent-node')

      // Then: Should return false or handle gracefully
      expect(result).toBe(false)
    })
  })

  describe('Distance Calculation Edge Cases', () => {
    it('should handle bot at exact resource position (distance = 0)', () => {
      // Given: Resource at (5, 0, 5)
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: 5, y: 0, z: 5 },
        available: true,
      })

      // Given: Bot at same position
      const botPosition: Position = { x: 5, y: 0, z: 5 }

      // When: Finding nearest
      const nearest = findNearestResource(world, 'wood', botPosition)

      // Then: Should return the node (distance 0 is valid)
      expect(nearest?.id).toBe('wood-1')
    })

    it('should ignore Y-axis in distance calculation (2D pathfinding)', () => {
      // Given: Two nodes at same X,Z but different Y
      registerResourceNode(world, {
        id: 'wood-1',
        type: 'wood',
        position: { x: 10, y: 0, z: 10 },
        available: true,
      })

      registerResourceNode(world, {
        id: 'wood-2',
        type: 'wood',
        position: { x: 10, y: 100, z: 10 }, // High Y, but same X,Z
        available: true,
      })

      // Given: Bot at origin
      const botPosition: Position = { x: 0, y: 0, z: 0 }

      // When: Finding nearest
      const nearest = findNearestResource(world, 'wood', botPosition)

      // Then: Both should have equal distance (Y ignored)
      // Implementation can return either one, just shouldn't crash
      expect(nearest).toBeDefined()
      expect(nearest?.position.x).toBeCloseTo(10, 1)
      expect(nearest?.position.z).toBeCloseTo(10, 1)
    })
  })
})
