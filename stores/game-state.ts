/**
 * Game State Store (Zustand)
 *
 * Central store for:
 * - Resource management
 * - Bot inventory
 * - Tech tree progression
 * - Crafting queue
 * - Save/load functionality
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { BOT_CONSTRUCTION_COSTS } from '@/utils/constants';

export interface Bot {
  id: string;
  type: 'miner' | 'hauler' | 'crafter' | 'scout';
  position?: { x: number; y: number; z: number };
  status: 'idle' | 'working' | 'moving' | 'returning' | 'blocked' | 'recharging';
  energy: number;
  inventoryCount?: number;
  capacity?: number;
  upgrades?: Array<{ type: string; appliedAt: number }>;
  currentTask?: {
    type: 'gather' | 'craft' | 'build' | 'return';
    resourceType?: string;
    targetNodeId?: string;
    progress?: number;
  };
}

export interface TechNode {
  id: string;
  name: string;
  unlocked: boolean;
  cost: { wood?: number; stone?: number; iron?: number };
  prerequisites: string[];
  description?: string;
}

export interface CraftingQueueItem {
  id: string;
  recipeId: string;
  progress: number;
  duration: number;
}

export interface InventoryItem {
  id: string;
  type: string;
  quantity?: number;
}

interface ProductionRecord {
  rate: number; // per minute
  lastUpdate: number;
}

interface GameState {
  // Resources
  resources: {
    wood: number;
    stone: number;
    iron: number;
    crystals: number;
  };

  // Bot management
  bots: Bot[];
  selectedBotId: string | null;

  // Tech tree
  techTree: {
    nodes: TechNode[];
  };

  // Crafting
  inventory: InventoryItem[];
  craftingQueue: CraftingQueueItem[];

  // Production tracking
  productionRates: Record<string, ProductionRecord>;

  // Timestamp for offline progress
  timestamp: number;

  // Actions
  addResource: (type: string, amount: number) => void;
  consumeResources: (costs: Record<string, number>) => boolean;
  recordProduction: (resourceType: string, amount: number, duration: number) => void;
  getProductionRate: (resourceType: string) => number;

  addBot: (config: Partial<Bot>) => string | null;
  assignTask: (botId: string, task: Bot['currentTask']) => void;
  updateBotEnergy: (botId: string, delta: number) => void;
  getBotsByStatus: (status: Bot['status']) => Bot[];
  setSelectedBotId: (botId: string | null) => void;
  selectNextBot: () => void;
  selectPreviousBot: () => void;

  unlockTechNode: (nodeId: string) => boolean;
  getUnlockedNodeCount: () => number;

  removeInventoryItem: (itemId: string) => void;
  consumeInventoryItem: (itemType: string) => boolean;
  consumeBotCost: (botType: string) => boolean;

  canCraftRecipe: (recipeId: string) => boolean;
  craftItem: (recipeId: string) => string | null;
  queueCraft: (recipeId: string, quantity: number) => void;
  processCraftingQueue: (deltaMs: number) => void;

  saveGame: () => void;
  loadGame: () => boolean;
  enableAutoSave: (intervalMs: number) => void;
  disableAutoSave: () => void;

  resetGame: () => void;

  calculateOfflineProgress: () => Record<string, number>;
  getOfflineTime: () => number;
}

// Recipe definitions
const recipes: Record<string, { cost: Record<string, number>; duration: number; output: string }> = {
  'speed-boost': { cost: { wood: 10, stone: 5 }, duration: 3000, output: 'speed-boost' },
  'capacity-upgrade': { cost: { wood: 15, stone: 10 }, duration: 5000, output: 'capacity-upgrade' },
  'basic-component': { cost: { wood: 5 }, duration: 3000, output: 'basic-component' },
  'advanced-component': { cost: { wood: 20, stone: 15, iron: 5 }, duration: 8000, output: 'advanced-component' },
  'gear-component': { cost: { iron: 10, stone: 5 }, duration: 4000, output: 'gear-component' },
  'quick-craft': { cost: { wood: 2 }, duration: 1000, output: 'quick-craft' },
};

// Tech tree data
const initialTechTree: TechNode[] = [
  { id: 'basic-bot', name: 'Basic Bot', unlocked: true, cost: {}, prerequisites: [], description: 'Build miners' },
  { id: 'advanced-miner', name: 'Advanced Miner Bot', unlocked: false, cost: { wood: 50, stone: 30 }, prerequisites: ['basic-bot'], description: '+25% miner gather speed' },
  { id: 'basic-hauler', name: 'Basic Hauler', unlocked: false, cost: { wood: 40, stone: 20 }, prerequisites: ['basic-bot'], description: 'Build haulers' },
  { id: 'expert-miner', name: 'Expert Miner', unlocked: false, cost: { wood: 100, stone: 80, iron: 20 }, prerequisites: ['advanced-miner'], description: '+5 miner capacity' },
  { id: 'advanced-crafting', name: 'Advanced Crafting', unlocked: false, cost: { wood: 60, stone: 40 }, prerequisites: ['basic-bot'], description: 'Build crafters' },
  { id: 'scout-tech', name: 'Scout Tech', unlocked: false, cost: { wood: 30, stone: 20, iron: 10 }, prerequisites: ['basic-bot'], description: 'Build scouts' },
  { id: 'crystal-processing', name: 'Crystal Processing', unlocked: false, cost: { wood: 80, stone: 50, iron: 30 }, prerequisites: ['scout-tech'], description: '2x crystal gather rate' },
];

let autoSaveInterval: NodeJS.Timeout | null = null;

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      // Initial state
      resources: {
        wood: 0,
        stone: 0,
        iron: 0,
        crystals: 0,
      },

      bots: [],
      selectedBotId: null,

      techTree: {
        nodes: initialTechTree,
      },

      inventory: [],
      craftingQueue: [],
      productionRates: {},
      timestamp: Date.now(),

      // Resource actions
      addResource: (type, amount) => {
        set((state) => ({
          resources: {
            ...state.resources,
            [type]: (state.resources[type as keyof typeof state.resources] || 0) + amount,
          },
        }));
      },

      consumeResources: (costs) => {
        const state = get();

        // Check if sufficient resources
        for (const [resource, amount] of Object.entries(costs)) {
          if ((state.resources[resource as keyof typeof state.resources] || 0) < amount) {
            return false;
          }
        }

        // Consume resources
        set((state) => ({
          resources: {
            ...state.resources,
            ...Object.fromEntries(
              Object.entries(costs).map(([resource, amount]) => [
                resource,
                (state.resources[resource as keyof typeof state.resources] || 0) - amount,
              ])
            ),
          },
        }));

        return true;
      },

      recordProduction: (resourceType, amount, duration) => {
        const ratePerMinute = (amount / duration) * 60000;
        set((state) => ({
          productionRates: {
            ...state.productionRates,
            [resourceType]: { rate: ratePerMinute, lastUpdate: Date.now() },
          },
        }));
      },

      getProductionRate: (resourceType) => {
        const state = get();
        return state.productionRates[resourceType]?.rate || 0;
      },

      // Bot actions
      addBot: (config) => {
        const state = get();

        // Enforce bot cap of 10 (WS-03)
        if (state.bots.length >= 10) {
          return null;
        }

        const botId = `bot-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newBot: Bot = {
          id: botId,
          type: config.type || 'miner',
          position: config.position || { x: 0, y: 0, z: 0 },
          status: config.status || 'idle',
          energy: 100,
          currentTask: undefined,
        };

        set((state) => ({
          bots: [...state.bots, newBot],
        }));

        return botId;
      },

      assignTask: (botId, task) => {
        set((state) => ({
          bots: state.bots.map((bot) =>
            bot.id === botId
              ? { ...bot, currentTask: task, status: 'working' }
              : bot
          ),
        }));
      },

      updateBotEnergy: (botId, delta) => {
        set((state) => ({
          bots: state.bots.map((bot) =>
            bot.id === botId
              ? {
                  ...bot,
                  energy: Math.max(0, Math.min(100, bot.energy + delta)),
                  status: bot.energy + delta <= 0 ? 'idle' : bot.status,
                }
              : bot
          ),
        }));
      },

      getBotsByStatus: (status) => {
        return get().bots.filter((bot) => bot.status === status);
      },

      setSelectedBotId: (botId) => {
        set({ selectedBotId: botId });
      },

      selectNextBot: () => {
        const state = get();
        const { bots, selectedBotId } = state;

        if (bots.length === 0) return;

        if (!selectedBotId) {
          // No selection, select first bot
          set({ selectedBotId: bots[0].id });
        } else {
          // Find current index
          const currentIndex = bots.findIndex((b) => b.id === selectedBotId);
          const nextIndex = (currentIndex + 1) % bots.length;
          set({ selectedBotId: bots[nextIndex].id });
        }
      },

      selectPreviousBot: () => {
        const state = get();
        const { bots, selectedBotId } = state;

        if (bots.length === 0) return;

        if (!selectedBotId) {
          // No selection, select last bot
          set({ selectedBotId: bots[bots.length - 1].id });
        } else {
          // Find current index
          const currentIndex = bots.findIndex((b) => b.id === selectedBotId);
          const previousIndex = (currentIndex - 1 + bots.length) % bots.length;
          set({ selectedBotId: bots[previousIndex].id });
        }
      },

      // Tech tree actions
      unlockTechNode: (nodeId) => {
        const state = get();
        const node = state.techTree.nodes.find((n) => n.id === nodeId);

        if (!node || node.unlocked) return false;

        // Check prerequisites
        const prerequisitesMet = node.prerequisites.every((prereqId) =>
          state.techTree.nodes.find((n) => n.id === prereqId)?.unlocked
        );

        if (!prerequisitesMet) return false;

        // Check and consume resources
        if (!get().consumeResources(node.cost)) return false;

        set((state) => ({
          techTree: {
            ...state.techTree,
            nodes: state.techTree.nodes.map((n) =>
              n.id === nodeId ? { ...n, unlocked: true } : n
            ),
          },
        }));

        return true;
      },

      getUnlockedNodeCount: () => {
        return get().techTree.nodes.filter((n) => n.unlocked).length;
      },

      removeInventoryItem: (itemId) => {
        set((state) => ({
          inventory: state.inventory.filter((item) => item.id !== itemId),
        }));
      },

      consumeInventoryItem: (itemType) => {
        const state = get();
        const index = state.inventory.findIndex((item) => item.type === itemType);
        if (index === -1) return false;

        set((state) => ({
          inventory: state.inventory.filter((_, i) => i !== index),
        }));
        return true;
      },

      consumeBotCost: (botType) => {
        const cost = BOT_CONSTRUCTION_COSTS[botType];
        if (!cost) return false;

        const state = get();

        // Check tech requirement
        const techNode = state.techTree.nodes.find((n) => n.id === cost.techRequired);
        if (!techNode || !techNode.unlocked) return false;

        // Check bot cap
        if (state.bots.length >= 10) return false;

        // Check resources
        for (const [resource, amount] of Object.entries(cost.resources)) {
          if ((state.resources[resource as keyof typeof state.resources] || 0) < amount) {
            return false;
          }
        }

        // Check components
        for (const component of cost.components) {
          if (!state.inventory.some((item) => item.type === component)) {
            return false;
          }
        }

        // Consume resources
        get().consumeResources(cost.resources);

        // Consume components
        for (const component of cost.components) {
          get().consumeInventoryItem(component);
        }

        return true;
      },

      // Crafting actions
      canCraftRecipe: (recipeId) => {
        const recipe = recipes[recipeId];
        if (!recipe) return false;

        const state = get();
        return Object.entries(recipe.cost).every(
          ([resource, amount]) =>
            (state.resources[resource as keyof typeof state.resources] || 0) >= amount
        );
      },

      craftItem: (recipeId) => {
        const recipe = recipes[recipeId];
        if (!recipe) return null;

        if (!get().consumeResources(recipe.cost)) return null;

        const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const newItem: InventoryItem = {
          id: itemId,
          type: recipe.output,
          quantity: 1,
        };

        set((state) => ({
          inventory: [...state.inventory, newItem],
        }));

        return itemId;
      },

      queueCraft: (recipeId, quantity) => {
        const recipe = recipes[recipeId];
        if (!recipe) return;

        const newItems: CraftingQueueItem[] = Array.from({ length: quantity }, (_, i) => ({
          id: `queue-${Date.now()}-${i}`,
          recipeId,
          progress: 0,
          duration: recipe.duration,
        }));

        // Consume resources upfront
        const totalCost = Object.fromEntries(
          Object.entries(recipe.cost).map(([resource, amount]) => [resource, amount * quantity])
        );

        if (!get().consumeResources(totalCost)) return;

        set((state) => ({
          craftingQueue: [...state.craftingQueue, ...newItems],
        }));
      },

      processCraftingQueue: (deltaMs) => {
        const state = get();
        if (state.craftingQueue.length === 0) return;

        const updatedQueue = [...state.craftingQueue];
        const firstItem = updatedQueue[0];

        if (!firstItem) return;

        firstItem.progress += (deltaMs / firstItem.duration) * 100;

        if (firstItem.progress >= 100) {
          // Complete crafting
          const recipe = recipes[firstItem.recipeId];
          if (recipe) {
            const itemId = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
            const newItem: InventoryItem = {
              id: itemId,
              type: recipe.output,
              quantity: 1,
            };

            set((state) => ({
              inventory: [...state.inventory, newItem],
              craftingQueue: state.craftingQueue.slice(1),
            }));

            // Continue processing if time remaining
            const remainingTime = deltaMs - firstItem.duration;
            if (remainingTime > 0 && updatedQueue.length > 1) {
              get().processCraftingQueue(remainingTime);
            }
          }
        } else {
          set({ craftingQueue: updatedQueue });
        }
      },

      // Save/load actions
      saveGame: () => {
        const state = get();
        const saveData = {
          resources: state.resources,
          bots: state.bots,
          techTree: state.techTree,
          inventory: state.inventory,
          craftingQueue: state.craftingQueue,
          productionRates: state.productionRates,
          timestamp: Date.now(),
        };

        localStorage.setItem('agent-c-save', JSON.stringify(saveData));
      },

      loadGame: () => {
        try {
          const saved = localStorage.getItem('agent-c-save');
          if (!saved) return false;

          const saveData = JSON.parse(saved);

          // Migrate tech tree: merge missing nodes from initialTechTree
          if (saveData.techTree?.nodes) {
            const savedNodeIds = new Set(saveData.techTree.nodes.map((n: TechNode) => n.id));
            for (const node of initialTechTree) {
              if (!savedNodeIds.has(node.id)) {
                saveData.techTree.nodes.push({ ...node, unlocked: false });
              }
            }
          }

          set(saveData);
          return true;
        } catch (error) {
          console.error('Failed to load game:', error);
          return false;
        }
      },

      enableAutoSave: (intervalMs) => {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
        }

        autoSaveInterval = setInterval(() => {
          get().saveGame();
        }, intervalMs);
      },

      disableAutoSave: () => {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
          autoSaveInterval = null;
        }
      },

      resetGame: () => {
        if (autoSaveInterval) {
          clearInterval(autoSaveInterval);
          autoSaveInterval = null;
        }
        localStorage.removeItem('agent-c-save');
        set({
          resources: { wood: 0, stone: 0, iron: 0, crystals: 0 },
          bots: [],
          selectedBotId: null,
          techTree: { nodes: initialTechTree },
          inventory: [],
          craftingQueue: [],
          productionRates: {},
          timestamp: Date.now(),
        });
      },

      // Offline progress
      calculateOfflineProgress: () => {
        const state = get();
        const offlineTimeMs = get().getOfflineTime();
        const offlineMinutes = offlineTimeMs / 60000;

        const accumulatedResources: Record<string, number> = {};

        for (const [resource, record] of Object.entries(state.productionRates)) {
          accumulatedResources[resource] = record.rate * offlineMinutes;
        }

        // Add to actual resources
        for (const [resource, amount] of Object.entries(accumulatedResources)) {
          get().addResource(resource, amount);
        }

        return accumulatedResources;
      },

      getOfflineTime: () => {
        const state = get();
        const now = Date.now();
        const elapsed = now - state.timestamp;

        // Cap at 8 hours (28800000 ms)
        return Math.min(elapsed, 28800000);
      },
    }),
    {
      name: 'agent-c-save',
    }
  )
);
