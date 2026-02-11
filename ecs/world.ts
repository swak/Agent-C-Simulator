/**
 * ECS World Factory (Miniplex)
 *
 * Creates a Miniplex world with component types:
 * - id: unique identifier
 * - position: { x, y, z }
 * - botType: 'miner' | 'hauler' | 'crafter' | 'scout'
 * - energy: { current, max }
 * - task: { type, active, progress, target, resourceType, duration }
 * - aiState: { current: 'idle' | 'moving' | 'gathering' | 'blocked' }
 * - stats: { speed, capacity, gatheringModifier }
 * - mesh: { type, modelId, lodLevel }
 * - path: { waypoints, currentIndex }
 * - inventory: { items }
 * - appearance: { primaryColor, secondaryColor, accessories }
 * - particles: { enabled }
 */

import { World } from 'miniplex';

export interface Position {
  x: number;
  y: number;
  z: number;
}

export interface Energy {
  current: number;
  max: number;
}

export interface Task {
  type: 'gather' | 'craft' | 'build' | 'return';
  active: boolean;
  progress: number;
  target?: Position;
  resourceType?: string;
  duration?: number;
}

export interface AIState {
  current: 'idle' | 'moving' | 'gathering' | 'blocked';
}

export interface Stats {
  speed: number;
  capacity: number;
  gatheringModifier: number;
}

export interface Mesh {
  type: string;
  modelId: string;
  lodLevel?: number;
}

export interface Path {
  waypoints: Position[];
  currentIndex: number;
}

export interface Inventory {
  items: string[];
}

export interface Appearance {
  primaryColor?: string;
  secondaryColor?: string;
  accessories?: string[];
}

export interface Particles {
  enabled: boolean;
}

export type BotType = 'miner' | 'hauler' | 'crafter' | 'scout';

export type EntityComponents = {
  id?: number;
  position?: Position;
  botType?: BotType;
  energy?: Energy;
  task?: Task;
  aiState?: AIState;
  stats?: Stats;
  mesh?: Mesh;
  path?: Path;
  inventory?: Inventory;
  appearance?: Appearance;
  particles?: Particles;
};

export interface ResourceNode {
  id: string
  type: 'wood' | 'stone' | 'iron' | 'crystals'
  position: Position
  available: boolean
}

export interface GameWorld extends World<EntityComponents> {
  camera?: {
    position: Position;
  };
  nextEntityId?: number;
  resourceRegistry?: Map<string, ResourceNode>;
}

let globalEntityId = 1;

export function createWorld(): GameWorld {
  const world = new World<EntityComponents>() as GameWorld;
  world.nextEntityId = 1;
  world.resourceRegistry = new Map();
  return world;
}

export function getNextEntityId(world: GameWorld): number {
  const id = world.nextEntityId || 1;
  world.nextEntityId = id + 1;
  return id;
}
