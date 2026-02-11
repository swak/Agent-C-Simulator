/**
 * Unit Tests: Resource Expansion Loop (WS-06)
 *
 * Tests:
 * - consumeBotCost validates tech, resources, components; consumes correctly
 * - consumeBotCost fails when tech locked, resources insufficient, or missing components
 * - consumeInventoryItem removes first matching item, returns false if none
 * - Tech effects: miner gets +5 capacity when expert-miner unlocked
 * - Tech effects: crystal gathering at 2x when crystal-processing unlocked
 * - Save migration: old 5-node save loads with 7 nodes
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore, TechNode } from '@/stores/game-state'
import { createWorld } from '@/ecs/world'
import { createBot } from '@/ecs/entities/bot'
import { updateGathering } from '@/ecs/systems/gathering'

const initialTechTreeNodes: TechNode[] = [
  { id: 'basic-bot', name: 'Basic Bot', unlocked: true, cost: {}, prerequisites: [], description: 'Build miners' },
  { id: 'advanced-miner', name: 'Advanced Miner Bot', unlocked: false, cost: { wood: 50, stone: 30 }, prerequisites: ['basic-bot'], description: '+25% miner gather speed' },
  { id: 'basic-hauler', name: 'Basic Hauler', unlocked: false, cost: { wood: 40, stone: 20 }, prerequisites: ['basic-bot'], description: 'Build haulers' },
  { id: 'expert-miner', name: 'Expert Miner', unlocked: false, cost: { wood: 100, stone: 80, iron: 20 }, prerequisites: ['advanced-miner'], description: '+5 miner capacity' },
  { id: 'advanced-crafting', name: 'Advanced Crafting', unlocked: false, cost: { wood: 60, stone: 40 }, prerequisites: ['basic-bot'], description: 'Build crafters' },
  { id: 'scout-tech', name: 'Scout Tech', unlocked: false, cost: { wood: 30, stone: 20, iron: 10 }, prerequisites: ['basic-bot'], description: 'Build scouts' },
  { id: 'crystal-processing', name: 'Crystal Processing', unlocked: false, cost: { wood: 80, stone: 50, iron: 30 }, prerequisites: ['scout-tech'], description: '2x crystal gather rate' },
]

function resetStore() {
  localStorage.clear()
  useGameStore.setState({
    resources: { wood: 0, stone: 0, iron: 0, crystals: 0 },
    bots: [],
    techTree: {
      nodes: initialTechTreeNodes.map((n) => ({ ...n })),
    },
    inventory: [],
    craftingQueue: [],
    productionRates: {},
    timestamp: Date.now(),
  })
}

describe('Resource Expansion Loop (WS-06)', () => {
  beforeEach(() => {
    resetStore()
  })

  describe('consumeInventoryItem', () => {
    it('should remove first matching item and return true', () => {
      useGameStore.setState({
        inventory: [
          { id: 'item-1', type: 'gear-component', quantity: 1 },
          { id: 'item-2', type: 'gear-component', quantity: 1 },
        ],
      })

      const result = useGameStore.getState().consumeInventoryItem('gear-component')
      expect(result).toBe(true)
      expect(useGameStore.getState().inventory).toHaveLength(1)
      expect(useGameStore.getState().inventory[0].id).toBe('item-2')
    })

    it('should return false if no matching item exists', () => {
      useGameStore.setState({ inventory: [] })
      const result = useGameStore.getState().consumeInventoryItem('gear-component')
      expect(result).toBe(false)
    })
  })

  describe('consumeBotCost', () => {
    it('should consume resources and build miner when tech unlocked', () => {
      useGameStore.getState().addResource('wood', 10)
      useGameStore.getState().addResource('stone', 5)

      const success = useGameStore.getState().consumeBotCost('miner')
      expect(success).toBe(true)
      expect(useGameStore.getState().resources.wood).toBe(0)
      expect(useGameStore.getState().resources.stone).toBe(0)
    })

    it('should consume resources and components for hauler', () => {
      // Unlock basic-hauler tech
      useGameStore.setState({
        techTree: {
          nodes: initialTechTreeNodes.map((n) =>
            n.id === 'basic-hauler' ? { ...n, unlocked: true } : { ...n }
          ),
        },
      })

      useGameStore.getState().addResource('wood', 15)
      useGameStore.getState().addResource('stone', 10)
      useGameStore.getState().addResource('iron', 5)
      useGameStore.setState({
        inventory: [{ id: 'item-1', type: 'gear-component', quantity: 1 }],
      })

      const success = useGameStore.getState().consumeBotCost('hauler')
      expect(success).toBe(true)
      expect(useGameStore.getState().resources.wood).toBe(0)
      expect(useGameStore.getState().resources.stone).toBe(0)
      expect(useGameStore.getState().resources.iron).toBe(0)
      expect(useGameStore.getState().inventory).toHaveLength(0)
    })

    it('should fail if tech not unlocked', () => {
      useGameStore.getState().addResource('wood', 100)
      useGameStore.getState().addResource('stone', 100)
      useGameStore.getState().addResource('iron', 100)

      const success = useGameStore.getState().consumeBotCost('hauler')
      expect(success).toBe(false)
      // Resources should not be consumed
      expect(useGameStore.getState().resources.wood).toBe(100)
    })

    it('should fail if resources insufficient', () => {
      useGameStore.getState().addResource('wood', 5) // Need 10

      const success = useGameStore.getState().consumeBotCost('miner')
      expect(success).toBe(false)
      expect(useGameStore.getState().resources.wood).toBe(5)
    })

    it('should fail if missing required component', () => {
      // Unlock basic-hauler tech
      useGameStore.setState({
        techTree: {
          nodes: initialTechTreeNodes.map((n) =>
            n.id === 'basic-hauler' ? { ...n, unlocked: true } : { ...n }
          ),
        },
      })

      useGameStore.getState().addResource('wood', 15)
      useGameStore.getState().addResource('stone', 10)
      useGameStore.getState().addResource('iron', 5)
      // No gear-component in inventory

      const success = useGameStore.getState().consumeBotCost('hauler')
      expect(success).toBe(false)
    })

    it('should fail if at bot cap', () => {
      // Add 10 bots to reach cap
      const bots = Array.from({ length: 10 }, (_, i) => ({
        id: `bot-${i}`,
        type: 'miner' as const,
        status: 'idle' as const,
        energy: 100,
      }))
      useGameStore.setState({ bots })

      useGameStore.getState().addResource('wood', 10)
      useGameStore.getState().addResource('stone', 5)

      const success = useGameStore.getState().consumeBotCost('miner')
      expect(success).toBe(false)
    })
  })

  describe('Tech Effects: miner capacity', () => {
    it('should give miner +5 capacity when expert-miner unlocked', () => {
      // Unlock expert-miner
      useGameStore.setState({
        techTree: {
          nodes: initialTechTreeNodes.map((n) =>
            n.id === 'expert-miner' || n.id === 'advanced-miner' || n.id === 'basic-bot'
              ? { ...n, unlocked: true }
              : { ...n }
          ),
        },
      })

      const world = createWorld()
      const bot = createBot(world, { type: 'miner' })

      expect(bot).not.toBeNull()
      expect(bot!.stats!.capacity).toBe(15) // 10 base + 5 bonus
    })

    it('should not give capacity bonus when expert-miner locked', () => {
      const world = createWorld()
      const bot = createBot(world, { type: 'miner' })

      expect(bot).not.toBeNull()
      expect(bot!.stats!.capacity).toBe(10) // base only
    })
  })

  describe('Tech Effects: crystal gathering', () => {
    it('should gather crystals at 2x when crystal-processing unlocked', () => {
      // Unlock crystal-processing
      useGameStore.setState({
        techTree: {
          nodes: initialTechTreeNodes.map((n) =>
            n.id === 'crystal-processing' || n.id === 'scout-tech' || n.id === 'basic-bot'
              ? { ...n, unlocked: true }
              : { ...n }
          ),
        },
      })

      const world = createWorld()
      const bot = createBot(world, { type: 'scout' })!

      bot.task = {
        type: 'gather',
        active: true,
        progress: 0,
        resourceType: 'crystals',
        duration: 5000,
      }
      bot.aiState = { current: 'gathering' }

      updateGathering(bot, 1000, world)

      // Scout gatheringModifier=0.8, crystal 2x, duration=5000
      // base: (1000/5000)*100*0.8 = 16, with crystal 2x = 32
      const progress = bot.task!.progress || 0
      expect(progress).toBeCloseTo(32, 0)
    })

    it('should not apply crystal multiplier when tech locked', () => {
      const world = createWorld()
      const bot = createBot(world, { type: 'scout' })!

      bot.task = {
        type: 'gather',
        active: true,
        progress: 0,
        resourceType: 'crystals',
        duration: 5000,
      }
      bot.aiState = { current: 'gathering' }

      updateGathering(bot, 1000, world)

      // base only: (1000/5000)*100*0.8 = 16
      const progress = bot.task!.progress || 0
      expect(progress).toBeCloseTo(16, 0)
    })

    it('should apply advanced-miner 1.25x to miner gathering', () => {
      // Unlock advanced-miner
      useGameStore.setState({
        techTree: {
          nodes: initialTechTreeNodes.map((n) =>
            n.id === 'advanced-miner' || n.id === 'basic-bot'
              ? { ...n, unlocked: true }
              : { ...n }
          ),
        },
      })

      const world = createWorld()
      const bot = createBot(world, { type: 'miner' })!

      bot.task = {
        type: 'gather',
        active: true,
        progress: 0,
        resourceType: 'wood',
        duration: 5000,
      }
      bot.aiState = { current: 'gathering' }

      updateGathering(bot, 1000, world)

      // miner gatheringModifier=1.5, advanced-miner 1.25x, duration=5000
      // base: (1000/5000)*100*1.5 = 30, with 1.25x = 37.5
      const progress = bot.task!.progress || 0
      expect(progress).toBeCloseTo(37.5, 0)
    })
  })

  describe('Save Migration', () => {
    it('should merge missing tech nodes from initialTechTree on load', () => {
      // Simulate old 5-node save
      const oldSave = {
        resources: { wood: 50, stone: 25, iron: 10, crystals: 0 },
        bots: [],
        techTree: {
          nodes: [
            { id: 'basic-bot', name: 'Basic Bot', unlocked: true, cost: {}, prerequisites: [] },
            { id: 'advanced-miner', name: 'Advanced Miner Bot', unlocked: true, cost: { wood: 50, stone: 30 }, prerequisites: ['basic-bot'] },
            { id: 'basic-hauler', name: 'Basic Hauler', unlocked: false, cost: { wood: 40, stone: 20 }, prerequisites: ['basic-bot'] },
            { id: 'expert-miner', name: 'Expert Miner', unlocked: false, cost: { wood: 100, stone: 80, iron: 20 }, prerequisites: ['advanced-miner'] },
            { id: 'advanced-crafting', name: 'Advanced Crafting', unlocked: false, cost: { wood: 60, stone: 40 }, prerequisites: ['basic-bot'] },
          ],
        },
        inventory: [],
        craftingQueue: [],
        productionRates: {},
        timestamp: Date.now(),
      }
      localStorage.setItem('agent-c-save', JSON.stringify(oldSave))

      const loaded = useGameStore.getState().loadGame()
      expect(loaded).toBe(true)

      const nodes = useGameStore.getState().techTree.nodes
      expect(nodes).toHaveLength(7)

      // New nodes should be locked
      const scoutTech = nodes.find((n) => n.id === 'scout-tech')
      expect(scoutTech).toBeDefined()
      expect(scoutTech!.unlocked).toBe(false)

      const crystalProc = nodes.find((n) => n.id === 'crystal-processing')
      expect(crystalProc).toBeDefined()
      expect(crystalProc!.unlocked).toBe(false)

      // Existing unlocked nodes should stay unlocked
      const advancedMiner = nodes.find((n) => n.id === 'advanced-miner')
      expect(advancedMiner!.unlocked).toBe(true)
    })
  })
})
