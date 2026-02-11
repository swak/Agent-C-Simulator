/**
 * Math Utilities
 *
 * Common mathematical operations for the ECS system.
 */

export interface Position3D {
  x: number
  y: number
  z: number
}

/**
 * Calculate Euclidean distance between two 3D positions
 */
export function distance3D(a: Position3D, b: Position3D): number {
  const dx = a.x - b.x
  const dy = a.y - b.y
  const dz = a.z - b.z
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}
