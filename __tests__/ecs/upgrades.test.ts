/**
 * Unit Tests: Upgrade System (WS-05)
 *
 * Tests:
 * - applyUpgrade modifies stats correctly
 * - applyUpgrade enforces 3-upgrade cap
 * - Serialize/deserialize preserves upgrades + boosted stats
 * - Resource preferences differ by bot type
 * - removeInventoryItem action
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, applyUpgrade, serializeBot, deserializeBot } from '@/ecs/entities/bot'
import { useGameStore } from '@/stores/game-state'
import { MAX_UPGRADES_PER_BOT } from '@/utils/constants'

describe('Upgrade System', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('applyUpgrade', () => {
    it('should increase bot speed when applying speed-boost', () => {
      const bot = createBot(world, { type: 'miner' })!
      const originalSpeed = bot.get('stats').speed

      const result = applyUpgrade(bot, 'speed-boost')

      expect(result).toBe(true)
      expect(bot.get('stats').speed).toBe(originalSpeed + 2)
    })

    it('should increase bot capacity when applying capacity-upgrade', () => {
      const bot = createBot(world, { type: 'miner' })!
      const originalCapacity = bot.get('stats').capacity

      const result = applyUpgrade(bot, 'capacity-upgrade')

      expect(result).toBe(true)
      expect(bot.get('stats').capacity).toBe(originalCapacity + 5)
    })

    it('should record upgrade in bot upgrades array', () => {
      const bot = createBot(world, { type: 'miner' })!

      applyUpgrade(bot, 'speed-boost')

      const upgrades = bot.get('upgrades')
      expect(upgrades.applied).toHaveLength(1)
      expect(upgrades.applied[0].type).toBe('speed-boost')
      expect(upgrades.applied[0].appliedAt).toBeGreaterThan(0)
    })

    it('should allow multiple different upgrades', () => {
      const bot = createBot(world, { type: 'hauler' })!
      const originalSpeed = bot.get('stats').speed
      const originalCapacity = bot.get('stats').capacity

      applyUpgrade(bot, 'speed-boost')
      applyUpgrade(bot, 'capacity-upgrade')

      expect(bot.get('stats').speed).toBe(originalSpeed + 2)
      expect(bot.get('stats').capacity).toBe(originalCapacity + 5)
      expect(bot.get('upgrades').applied).toHaveLength(2)
    })

    it('should enforce max upgrade cap', () => {
      const bot = createBot(world, { type: 'miner' })!

      for (let i = 0; i < MAX_UPGRADES_PER_BOT; i++) {
        expect(applyUpgrade(bot, 'speed-boost')).toBe(true)
      }

      // Next upgrade should fail
      const result = applyUpgrade(bot, 'speed-boost')
      expect(result).toBe(false)
      expect(bot.get('upgrades').applied).toHaveLength(MAX_UPGRADES_PER_BOT)
    })

    it('should reject unknown upgrade types', () => {
      const bot = createBot(world, { type: 'miner' })!
      const originalSpeed = bot.get('stats').speed

      const result = applyUpgrade(bot, 'nonexistent-upgrade')

      expect(result).toBe(false)
      expect(bot.get('stats').speed).toBe(originalSpeed)
    })

    it('should stack same upgrade type', () => {
      const bot = createBot(world, { type: 'scout' })!
      const originalSpeed = bot.get('stats').speed

      applyUpgrade(bot, 'speed-boost')
      applyUpgrade(bot, 'speed-boost')

      expect(bot.get('stats').speed).toBe(originalSpeed + 4)
    })
  })

  describe('Serialization with upgrades', () => {
    it('should preserve upgrades through serialize/deserialize', () => {
      const bot = createBot(world, { type: 'miner' })!
      applyUpgrade(bot, 'speed-boost')
      applyUpgrade(bot, 'capacity-upgrade')

      const serialized = serializeBot(bot)
      const restored = deserializeBot(world, serialized)!

      expect(restored.get('upgrades').applied).toHaveLength(2)
      expect(restored.get('upgrades').applied[0].type).toBe('speed-boost')
      expect(restored.get('upgrades').applied[1].type).toBe('capacity-upgrade')
    })

    it('should preserve boosted stats through serialize/deserialize', () => {
      const bot = createBot(world, { type: 'hauler' })!
      applyUpgrade(bot, 'speed-boost')

      const boostedSpeed = bot.get('stats').speed

      const serialized = serializeBot(bot)
      const restored = deserializeBot(world, serialized)!

      expect(restored.get('stats').speed).toBe(boostedSpeed)
    })
  })
})

describe('Resource Preferences by Bot Type', () => {
  it('miner should prefer iron over wood', async () => {
    const { RESOURCE_PREFERENCES } = await import('@/ecs/systems/ai')

    expect(RESOURCE_PREFERENCES.miner[0]).toBe('iron')
    expect(RESOURCE_PREFERENCES.miner.indexOf('iron')).toBeLessThan(
      RESOURCE_PREFERENCES.miner.indexOf('wood')
    )
  })

  it('hauler should prefer wood (abundant resource)', async () => {
    const { RESOURCE_PREFERENCES } = await import('@/ecs/systems/ai')

    expect(RESOURCE_PREFERENCES.hauler[0]).toBe('wood')
  })

  it('scout should prefer crystals (rare resource)', async () => {
    const { RESOURCE_PREFERENCES } = await import('@/ecs/systems/ai')

    expect(RESOURCE_PREFERENCES.scout[0]).toBe('crystals')
  })

  it('each bot type should have different first preference', async () => {
    const { RESOURCE_PREFERENCES } = await import('@/ecs/systems/ai')

    const firstPrefs = Object.values(RESOURCE_PREFERENCES).map((p) => p[0])
    const uniqueFirstPrefs = new Set(firstPrefs)
    expect(uniqueFirstPrefs.size).toBe(4)
  })
})

describe('removeInventoryItem', () => {
  beforeEach(() => {
    useGameStore.setState({
      inventory: [
        { id: 'item-1', type: 'speed-boost', quantity: 1 },
        { id: 'item-2', type: 'capacity-upgrade', quantity: 1 },
        { id: 'item-3', type: 'basic-component', quantity: 1 },
      ],
    })
  })

  it('should remove specific item by id', () => {
    useGameStore.getState().removeInventoryItem('item-1')

    const inventory = useGameStore.getState().inventory
    expect(inventory).toHaveLength(2)
    expect(inventory.find((i) => i.id === 'item-1')).toBeUndefined()
  })

  it('should not affect other items', () => {
    useGameStore.getState().removeInventoryItem('item-2')

    const inventory = useGameStore.getState().inventory
    expect(inventory).toHaveLength(2)
    expect(inventory.find((i) => i.id === 'item-1')).toBeDefined()
    expect(inventory.find((i) => i.id === 'item-3')).toBeDefined()
  })

  it('should handle non-existent id gracefully', () => {
    useGameStore.getState().removeInventoryItem('item-999')

    const inventory = useGameStore.getState().inventory
    expect(inventory).toHaveLength(3)
  })
})
