/**
 * Game Constants
 *
 * Single source of truth for shared constants used across ECS systems and components.
 */

export const BASE_POSITION = { x: 0, y: 0, z: 0 }
export const BASE_RADIUS = 2.0
export const BASE_RECHARGE_RATE = 5.0 // 2.5x normal idle rate
export const ENERGY_FULL_THRESHOLD = 80 // Stay at base until 80%

export const UPGRADE_EFFECTS: Record<string, { speed?: number; capacity?: number }> = {
  'speed-boost': { speed: 2 },
  'capacity-upgrade': { capacity: 5 },
}

export const MAX_UPGRADES_PER_BOT = 3

export const UPGRADE_TYPES = ['speed-boost', 'capacity-upgrade'] as const
