/**
 * Unit Tests: Game State Management (Zustand)
 *
 * Tests core game state operations:
 * - Resource tracking and updates
 * - Bot inventory management
 * - Tech tree unlock logic
 * - Save/load serialization
 *
 * Expected: ALL TESTS FAIL (no implementation exists yet)
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { useGameStore } from '@/stores/game-state'

describe('Game State Store', () => {
  beforeEach(() => {
    // Reset store to initial state
    localStorage.clear()
    useGameStore.setState({
      resources: { wood: 0, stone: 0, iron: 0, crystals: 0 },
      bots: [],
      techTree: {
        nodes: [
          { id: 'basic-bot', name: 'Basic Bot', unlocked: true, cost: {}, prerequisites: [] },
          { id: 'advanced-miner', name: 'Advanced Miner Bot', unlocked: false, cost: { wood: 50, stone: 30 }, prerequisites: ['basic-bot'] },
          { id: 'basic-hauler', name: 'Basic Hauler', unlocked: false, cost: { wood: 40, stone: 20 }, prerequisites: ['basic-bot'] },
          { id: 'expert-miner', name: 'Expert Miner', unlocked: false, cost: { wood: 100, stone: 80, iron: 20 }, prerequisites: ['advanced-miner'] },
          { id: 'advanced-crafting', name: 'Advanced Crafting', unlocked: false, cost: { wood: 60, stone: 40 }, prerequisites: ['basic-bot'] },
        ],
      },
      inventory: [],
      craftingQueue: [],
      productionRates: {},
      timestamp: Date.now(),
    })
  })

  describe('Resource Management', () => {
    it('should initialize with zero resources', () => {
      // Given: A fresh game state
      const state = useGameStore.getState()

      // Then: All resources should be zero
      expect(state.resources).toEqual({
        wood: 0,
        stone: 0,
        iron: 0,
        crystals: 0,
      })
    })

    it('should add resources correctly', () => {
      // Given: A game state with initial resources

      // When: Adding 10 wood
      useGameStore.getState().addResource('wood', 10)

      // Then: Wood count should increase
      expect(useGameStore.getState().resources.wood).toBe(10)
    })

    it('should handle multiple resource additions', () => {
      // Given: A game state

      // When: Adding multiple resources sequentially
      useGameStore.getState().addResource('wood', 5)
      useGameStore.getState().addResource('wood', 3)
      useGameStore.getState().addResource('stone', 10)

      // Then: Resources should accumulate correctly
      expect(useGameStore.getState().resources.wood).toBe(8)
      expect(useGameStore.getState().resources.stone).toBe(10)
    })

    it('should consume resources when crafting', () => {
      // Given: A game state with sufficient resources
      useGameStore.getState().addResource('wood', 10)
      useGameStore.getState().addResource('stone', 5)

      // When: Consuming resources for a recipe
      const success = useGameStore.getState().consumeResources({
        wood: 10,
        stone: 5,
      })

      // Then: Resources should be consumed and operation should succeed
      expect(success).toBe(true)
      expect(useGameStore.getState().resources.wood).toBe(0)
      expect(useGameStore.getState().resources.stone).toBe(0)
    })

    it('should reject consumption if insufficient resources', () => {
      // Given: A game state with insufficient resources
      useGameStore.getState().addResource('wood', 5)

      // When: Attempting to consume more than available
      const success = useGameStore.getState().consumeResources({
        wood: 10,
        stone: 5,
      })

      // Then: Operation should fail and resources unchanged
      expect(success).toBe(false)
      expect(useGameStore.getState().resources.wood).toBe(5)
    })

    it('should track resource production rate', () => {
      // Given: A game state with active resource gathering

      // When: Recording production events
      useGameStore.getState().recordProduction('wood', 12, 60000) // 12 units in 60 seconds

      // Then: Production rate should be calculated
      const rate = useGameStore.getState().getProductionRate('wood')
      expect(rate).toBe(12) // 12 per minute
    })
  })

  describe('Bot Inventory Management', () => {
    it('should initialize with empty bot roster', () => {
      // Given: A fresh game state
      const state = useGameStore.getState()

      // Then: Bot list should be empty
      expect(state.bots).toEqual([])
    })

    it('should add a bot to inventory', () => {
      // Given: A game state

      // When: Adding a bot
      const botId = useGameStore.getState().addBot({
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })

      // Then: Bot should be in inventory
      const bots = useGameStore.getState().bots
      expect(bots).toHaveLength(1)
      expect(bots[0].id).toBe(botId)
      expect(bots[0].type).toBe('miner')
    })

    it('should assign tasks to bots', () => {
      // Given: A bot in inventory
      const botId = useGameStore.getState().addBot({ type: 'miner' })

      // When: Assigning a gathering task
      useGameStore.getState().assignTask(botId, {
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'node-1',
      })

      // Then: Bot should have the assigned task
      const bot = useGameStore.getState().bots.find((b) => b.id === botId)
      expect(bot?.currentTask).toEqual({
        type: 'gather',
        resourceType: 'wood',
        targetNodeId: 'node-1',
      })
    })

    it('should update bot energy levels', () => {
      // Given: A bot with initial energy
      const botId = useGameStore.getState().addBot({ type: 'miner' })

      // When: Bot consumes energy
      useGameStore.getState().updateBotEnergy(botId, -20)

      // Then: Energy should decrease
      const bot = useGameStore.getState().bots.find((b) => b.id === botId)
      expect(bot?.energy).toBe(80) // Assuming initial 100
    })

    it('should mark bot as idle when energy is depleted', () => {
      // Given: A bot with low energy
      const botId = useGameStore.getState().addBot({ type: 'miner' })
      useGameStore.getState().updateBotEnergy(botId, -100)

      // When: Energy reaches zero
      const bot = useGameStore.getState().bots.find((b) => b.id === botId)

      // Then: Bot should be idle
      expect(bot?.status).toBe('idle')
      expect(bot?.energy).toBe(0)
    })

    it('should filter bots by status', () => {
      // Given: Multiple bots with different statuses
      useGameStore.getState().addBot({ type: 'miner', status: 'working' })
      useGameStore.getState().addBot({ type: 'hauler', status: 'idle' })
      useGameStore.getState().addBot({ type: 'crafter', status: 'working' })

      // When: Filtering by status
      const workingBots = useGameStore.getState().getBotsByStatus('working')

      // Then: Only working bots should be returned
      expect(workingBots).toHaveLength(2)
      expect(workingBots.every((b) => b.status === 'working')).toBe(true)
    })
  })

  describe('Tech Tree Logic', () => {
    it('should initialize with first tech node unlocked', () => {
      // Given: A fresh game state

      // Then: First tech node should be available
      const techTree = useGameStore.getState().techTree
      expect(techTree.nodes[0].unlocked).toBe(true)
    })

    it('should unlock tech node when requirements met', () => {
      // Given: Sufficient resources for upgrade
      useGameStore.getState().addResource('wood', 50)
      useGameStore.getState().addResource('stone', 30)

      // When: Unlocking a node
      const success = useGameStore.getState().unlockTechNode('advanced-miner')

      // Then: Node should be unlocked and resources consumed
      expect(success).toBe(true)
      const node = useGameStore
        .getState()
        .techTree.nodes.find((n) => n.id === 'advanced-miner')
      expect(node?.unlocked).toBe(true)
      expect(useGameStore.getState().resources.wood).toBe(0)
      expect(useGameStore.getState().resources.stone).toBe(0)
    })

    it('should reject unlock if prerequisites not met', () => {
      // Given: A tech node with a locked prerequisite
      useGameStore.getState().addResource('wood', 100)
      useGameStore.getState().addResource('stone', 100)

      // When: Attempting to unlock advanced node without prerequisite
      const success = useGameStore.getState().unlockTechNode('expert-miner')

      // Then: Unlock should fail
      expect(success).toBe(false)
      const node = useGameStore
        .getState()
        .techTree.nodes.find((n) => n.id === 'expert-miner')
      expect(node?.unlocked).toBe(false)
    })

    it('should track unlocked node count', () => {
      // Given: A game state with some unlocked nodes
      useGameStore.getState().addResource('wood', 200)
      useGameStore.getState().addResource('stone', 100)
      useGameStore.getState().unlockTechNode('advanced-miner')
      useGameStore.getState().unlockTechNode('basic-hauler')

      // When: Checking progress
      const unlockedCount = useGameStore.getState().getUnlockedNodeCount()

      // Then: Count should include initial + unlocked nodes
      expect(unlockedCount).toBeGreaterThanOrEqual(3) // Initial + 2 unlocked
    })
  })

  describe('Crafting System', () => {
    it('should validate recipe requirements', () => {
      // Given: A game state with partial resources
      useGameStore.getState().addResource('wood', 5)

      // When: Checking if recipe can be crafted
      const canCraft = useGameStore.getState().canCraftRecipe('speed-boost')

      // Then: Should return false if insufficient
      expect(canCraft).toBe(false)
    })

    it('should craft item when resources sufficient', () => {
      // Given: Sufficient resources
      useGameStore.getState().addResource('wood', 10)
      useGameStore.getState().addResource('stone', 5)

      // When: Crafting an item
      const itemId = useGameStore.getState().craftItem('speed-boost')

      // Then: Item should be in inventory
      expect(itemId).toBeTruthy()
      const inventory = useGameStore.getState().inventory
      expect(inventory.find((i) => i.id === itemId)).toBeDefined()
    })

    it('should track crafting queue', () => {
      // Given: Multiple crafting requests
      useGameStore.getState().addResource('wood', 50)
      useGameStore.getState().addResource('stone', 30)

      // When: Queueing multiple crafts
      useGameStore.getState().queueCraft('speed-boost', 2)
      useGameStore.getState().queueCraft('capacity-upgrade', 1)

      // Then: Queue should contain 3 items
      const queue = useGameStore.getState().craftingQueue
      expect(queue).toHaveLength(3)
    })

    it('should process crafting queue over time', () => {
      // Given: Items in crafting queue
      useGameStore.getState().addResource('wood', 20)
      useGameStore.getState().queueCraft('basic-component', 2)

      // When: Processing for 5 seconds (recipe takes 3s each)
      useGameStore.getState().processCraftingQueue(5000)

      // Then: First item should complete, second in progress
      const queue = useGameStore.getState().craftingQueue
      expect(queue).toHaveLength(1) // One item remaining
      const inventory = useGameStore.getState().inventory
      expect(inventory.filter((i) => i.type === 'basic-component')).toHaveLength(
        1
      )
    })
  })

  describe('Save/Load Serialization', () => {
    it('should serialize game state to localStorage', () => {
      // Given: A game state with data
      useGameStore.getState().addResource('wood', 100)
      useGameStore.getState().addBot({ type: 'miner' })

      // When: Saving game
      useGameStore.getState().saveGame()

      // Then: localStorage should contain serialized state
      const saved = localStorage.getItem('agent-c-save')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.resources.wood).toBe(100)
      expect(parsed.bots).toHaveLength(1)
    })

    it('should deserialize and restore game state', () => {
      // Given: A saved game in localStorage
      const saveData = {
        resources: { wood: 50, stone: 25 },
        bots: [{ id: 'bot-1', type: 'miner', energy: 80 }],
        techTree: { nodes: [{ id: 'basic-bot', unlocked: true }] },
        timestamp: Date.now(),
      }
      localStorage.setItem('agent-c-save', JSON.stringify(saveData))

      // When: Loading game
      useGameStore.getState().loadGame()

      // Then: State should match saved data
      const state = useGameStore.getState()
      expect(state.resources.wood).toBe(50)
      expect(state.bots).toHaveLength(1)
      expect(state.bots[0].energy).toBe(80)
    })

    it('should handle corrupted save data gracefully', () => {
      // Given: Invalid save data
      localStorage.setItem('agent-c-save', 'invalid-json')

      // When: Attempting to load
      const success = useGameStore.getState().loadGame()

      // Then: Should fail gracefully and return false
      expect(success).toBe(false)
      expect(useGameStore.getState().resources.wood).toBe(0) // Reset to default
    })

    it('should auto-save every 30 seconds', async () => {
      // Given: A game state with auto-save enabled
      useGameStore.getState().addResource('wood', 25)
      useGameStore.getState().enableAutoSave(1000) // 1 second for testing

      // When: Waiting for auto-save interval
      await new Promise((resolve) => setTimeout(resolve, 1100))

      // Then: Game should be saved to localStorage
      const saved = localStorage.getItem('agent-c-save')
      expect(saved).toBeTruthy()
      const parsed = JSON.parse(saved!)
      expect(parsed.resources.wood).toBe(25)

      // Cleanup
      useGameStore.getState().disableAutoSave()
    })
  })

  describe('Offline Progress Calculation', () => {
    it('should calculate resources gathered while offline', () => {
      // Given: A game state with active bots and saved timestamp
      useGameStore.getState().addBot({ type: 'miner', status: 'working' })
      useGameStore.getState().recordProduction('wood', 10, 60000) // 10/min

      const oneHourAgo = Date.now() - 3600000 // 1 hour
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          resources: { wood: 0 },
          bots: [
            { id: 'bot-1', type: 'miner', status: 'working', energy: 100 },
          ],
          timestamp: oneHourAgo,
        })
      )

      // When: Loading game after offline period
      useGameStore.getState().loadGame()
      const offlineResources = useGameStore.getState().calculateOfflineProgress()

      // Then: Should accumulate 1 hour of production (capped)
      expect(offlineResources.wood).toBeGreaterThan(0)
      expect(offlineResources.wood).toBeCloseTo(600, 0) // 10/min * 60min (with floating-point tolerance)
    })

    it('should cap offline progress at 8 hours', () => {
      // Given: A save timestamp from 24 hours ago
      const oneDayAgo = Date.now() - 86400000 // 24 hours

      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          resources: { wood: 0 },
          bots: [{ id: 'bot-1', type: 'miner', status: 'working' }],
          timestamp: oneDayAgo,
        })
      )

      // When: Calculating offline progress
      useGameStore.getState().loadGame()
      const offlineTime = useGameStore.getState().getOfflineTime()

      // Then: Should cap at 8 hours (28800000 ms)
      expect(offlineTime).toBeLessThanOrEqual(28800000)
    })

    it('should complete under 200ms for large offline periods', () => {
      // Given: A complex game state with many bots
      for (let i = 0; i < 20; i++) {
        useGameStore.getState().addBot({ type: 'miner', status: 'working' })
      }

      const eightHoursAgo = Date.now() - 28800000
      localStorage.setItem(
        'agent-c-save',
        JSON.stringify({
          resources: {},
          bots: useGameStore.getState().bots,
          timestamp: eightHoursAgo,
        })
      )

      // When: Calculating offline progress
      const start = performance.now()
      useGameStore.getState().loadGame()
      useGameStore.getState().calculateOfflineProgress()
      const duration = performance.now() - start

      // Then: Should complete in under 200ms
      expect(duration).toBeLessThan(200)
    })
  })
})
