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

export interface BotConstructionCost {
  resources: { wood?: number; stone?: number; iron?: number };
  components: string[];
  techRequired: string;
}

export const BOT_CONSTRUCTION_COSTS: Record<string, BotConstructionCost> = {
  miner: {
    resources: { wood: 10, stone: 5 },
    components: [],
    techRequired: 'basic-bot',
  },
  hauler: {
    resources: { wood: 15, stone: 10, iron: 5 },
    components: ['gear-component'],
    techRequired: 'basic-hauler',
  },
  crafter: {
    resources: { wood: 20, stone: 15 },
    components: ['basic-component'],
    techRequired: 'advanced-crafting',
  },
  scout: {
    resources: { wood: 10, stone: 5, iron: 10 },
    components: ['advanced-component'],
    techRequired: 'scout-tech',
  },
}

export const TECH_EFFECTS: Record<string, { gatheringModifier?: number; capacityBonus?: number; crystalMultiplier?: number }> = {
  'advanced-miner': { gatheringModifier: 0.375 },
  'expert-miner': { capacityBonus: 5 },
  'crystal-processing': { crystalMultiplier: 2 },
}
