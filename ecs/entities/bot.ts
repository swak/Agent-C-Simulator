/**
 * Bot Entity CRUD and Logic (Miniplex ECS)
 *
 * Manages bot entity lifecycle:
 * - Creation with typed components
 * - AI state transitions
 * - Task assignment and completion
 * - Pathfinding updates
 * - Customization (colors, accessories)
 * - Serialization for save/load
 */

import {
  GameWorld,
  EntityComponents,
  BotType,
  Position,
  Stats,
  AIState,
  Task,
  Mesh,
  Energy,
  Inventory,
  Appearance,
  Particles,
  Path,
  getNextEntityId,
} from '@/ecs/world';

export interface BotConfig {
  type: BotType;
  position?: Position;
  status?: string;
}

export type BotEntity = EntityComponents & {
  has(component: keyof EntityComponents): boolean;
  get<K extends keyof EntityComponents>(component: K): EntityComponents[K];
  set<K extends keyof EntityComponents>(
    component: K,
    value: EntityComponents[K]
  ): void;
}

// Bot type stats
const BOT_STATS: Record<BotType, Stats> = {
  miner: { speed: 5, capacity: 10, gatheringModifier: 1.5 },
  hauler: { speed: 3, capacity: 20, gatheringModifier: 0.5 },
  crafter: { speed: 4, capacity: 5, gatheringModifier: 1.0 },
  scout: { speed: 7, capacity: 5, gatheringModifier: 0.8 },
};

export function createBot(world: GameWorld, config: BotConfig): BotEntity {
  const position: Position = config.position || { x: 0, y: 0, z: 0 };
  const botType = config.type;
  const stats = BOT_STATS[botType];
  const entityId = getNextEntityId(world);

  const entityData: EntityComponents = {
    id: entityId,
    position,
    botType,
    energy: { current: 100, max: 100 },
    task: { type: 'gather', active: false, progress: 0 },
    aiState: { current: 'idle' },
    stats,
    mesh: {
      type: 'bot',
      modelId: `bot-${botType}`,
      lodLevel: 0,
    },
    path: { waypoints: [], currentIndex: 0 },
    inventory: { items: [] },
    appearance: {
      primaryColor: '#4A90E2',
      secondaryColor: '#FFFFFF',
      accessories: [],
    },
    particles: { enabled: true },
  };

  const entity = world.add(entityData);

  // Add helper methods
  const botEntity = entity as BotEntity;
  botEntity.has = (component: keyof EntityComponents) => entity[component] !== undefined;
  botEntity.get = <K extends keyof EntityComponents>(component: K) => entity[component];
  botEntity.set = <K extends keyof EntityComponents>(component: K, value: EntityComponents[K]) => {
    entity[component] = value;
    world.update(entity, component, value);
  };

  return botEntity;
}

export function assignTask(
  bot: BotEntity,
  task: { type: 'gather' | 'craft' | 'build'; target?: Position; resourceType?: string }
): void {
  bot.set('task', {
    type: task.type,
    active: true,
    progress: 0,
    target: task.target,
    resourceType: task.resourceType,
    duration: 5000, // Default 5 seconds
  });

  bot.set('aiState', { current: 'moving' });
}

export function updateBotPosition(bot: BotEntity, position: Position): void {
  bot.set('position', position);

  const task = bot.get('task');
  if (task && task.target) {
    const distance = Math.sqrt(
      Math.pow(position.x - task.target.x, 2) +
        Math.pow(position.y - task.target.y, 2) +
        Math.pow(position.z - task.target.z, 2)
    );

    // Within 1 unit of target = arrived
    if (distance < 1) {
      bot.set('aiState', { current: 'gathering' });
    }
  }
}

export function completeTask(bot: BotEntity): void {
  bot.set('aiState', { current: 'idle' });
  bot.set('task', {
    type: 'gather',
    active: false,
    progress: 0,
  });
}

export function updatePathfinding(
  bot: BotEntity,
  result: { success: boolean; reason?: string }
): void {
  if (!result.success) {
    bot.set('aiState', { current: 'blocked' });
  }
}

export function customizeBot(
  bot: BotEntity,
  customization: {
    primaryColor?: string;
    secondaryColor?: string;
    accessories?: string[];
  }
): void {
  const currentAppearance = bot.get('appearance') || {};
  bot.set('appearance', {
    ...currentAppearance,
    ...customization,
  });
}

export function serializeBot(bot: BotEntity): Record<string, unknown> {
  return {
    botType: bot.get('botType'),
    position: bot.get('position'),
    energy: bot.get('energy'),
    task: bot.get('task'),
    aiState: bot.get('aiState'),
    stats: bot.get('stats'),
    inventory: bot.get('inventory'),
    appearance: bot.get('appearance'),
  };
}

export function deserializeBot(
  world: GameWorld,
  data: Record<string, unknown>
): BotEntity {
  const bot = createBot(world, {
    type: data.botType as BotType,
    position: data.position as Position,
  });

  if (data.energy) bot.set('energy', data.energy as Energy);
  if (data.task) bot.set('task', data.task as Task);
  if (data.aiState) bot.set('aiState', data.aiState as AIState);
  if (data.inventory) bot.set('inventory', data.inventory as Inventory);
  if (data.appearance) bot.set('appearance', data.appearance as Appearance);

  return bot;
}

// Track bot count for memory estimation
let _botMemoryDelta = 0;

export function getBotMemoryDelta(): number {
  return _botMemoryDelta;
}

export function removeBot(world: GameWorld, botId: number | BotEntity): void {
  if (typeof botId === 'number') {
    const entity = world.entities.find((e) => e.id === botId);
    if (entity) {
      world.remove(entity);
      _botMemoryDelta -= 1024 * 100; // ~100KB per bot freed
    }
  } else if (typeof botId === 'object') {
    world.remove(botId);
    _botMemoryDelta -= 1024 * 100;
  }
}
