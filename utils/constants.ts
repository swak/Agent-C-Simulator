/**
 * Game Constants
 *
 * Single source of truth for shared constants used across ECS systems and components.
 */

export const BASE_POSITION = { x: 0, y: 0, z: 0 }
export const BASE_RADIUS = 2.0
export const BASE_RECHARGE_RATE = 5.0 // 2.5x normal idle rate
export const ENERGY_FULL_THRESHOLD = 80 // Stay at base until 80%
