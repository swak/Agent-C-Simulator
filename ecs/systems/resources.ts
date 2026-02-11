/**
 * Resource Node Registry System
 *
 * Manages resource nodes in the game world:
 * - Register nodes with type, position, and availability
 * - Find nearest available node by type
 * - Claim/release nodes to prevent double-assignment
 */

import { GameWorld, ResourceNode } from '@/ecs/world'

/**
 * Register a resource node in the registry
 */
export function registerResourceNode(world: GameWorld, node: ResourceNode): void {
  if (!world.resourceRegistry) return
  world.resourceRegistry.set(node.id, { ...node })
}

/**
 * Get a specific resource node by ID
 */
export function getResourceNode(world: GameWorld, id: string): ResourceNode | undefined {
  if (!world.resourceRegistry) return undefined
  return world.resourceRegistry.get(id)
}

/**
 * Get all registered resource nodes
 */
export function getAllResourceNodes(world: GameWorld): ResourceNode[] {
  if (!world.resourceRegistry) return []
  return Array.from(world.resourceRegistry.values())
}

/**
 * Find nearest available resource of a given type
 * Uses 2D distance (ignores Y axis for pathfinding)
 */
export function findNearestResource(
  world: GameWorld,
  resourceType: string,
  position: { x: number; y: number; z: number }
): ResourceNode | null {
  if (!world.resourceRegistry) return null

  const nodes = Array.from(world.resourceRegistry.values()).filter(
    (node) => node.type === resourceType && node.available
  )

  if (nodes.length === 0) return null

  let nearest: ResourceNode | null = null
  let minDistance = Infinity

  for (const node of nodes) {
    // Calculate 2D distance (ignore Y)
    const dx = node.position.x - position.x
    const dz = node.position.z - position.z
    const distance = Math.sqrt(dx * dx + dz * dz)

    if (distance < minDistance) {
      minDistance = distance
      nearest = node
    }
  }

  return nearest
}

/**
 * Mark a resource node as unavailable (claimed by a bot)
 */
export function claimResourceNode(world: GameWorld, id: string): boolean {
  if (!world.resourceRegistry) return false
  const node = world.resourceRegistry.get(id)
  if (!node) return false

  node.available = false
  world.resourceRegistry.set(id, node)
  return true
}

/**
 * Mark a resource node as available (released by a bot)
 */
export function releaseResourceNode(world: GameWorld, id: string): boolean {
  if (!world.resourceRegistry) return false
  const node = world.resourceRegistry.get(id)
  if (!node) return false

  node.available = true
  world.resourceRegistry.set(id, node)
  return true
}
