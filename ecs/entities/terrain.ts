/**
 * Terrain Entity (Miniplex ECS)
 *
 * Creates terrain entities (ground plane) in the world.
 */

import { GameWorld, EntityComponents } from '@/ecs/world';

export interface TerrainConfig {
  size?: number;
  quality?: 'low' | 'medium' | 'high';
}

export type TerrainEntity = EntityComponents;

export function createTerrain(
  world: GameWorld,
  config: TerrainConfig
): TerrainEntity {
  const size = config.size || 100;
  const quality = config.quality || 'high';

  const entityData: EntityComponents = {
    position: { x: 0, y: 0, z: 0 },
    mesh: {
      type: 'terrain',
      modelId: `terrain-meadow-${quality}`,
      lodLevel: 0,
    },
  };

  const entity = world.add(entityData);
  return entity;
}
