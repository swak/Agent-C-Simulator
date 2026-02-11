/**
 * Main Update Loop
 *
 * Runs all ECS systems each frame.
 */

import { GameWorld, EntityComponents } from '@/ecs/world';
import { BotEntity } from '@/ecs/entities/bot';
import { moveAlongPath } from './movement';
import { updateGathering } from './gathering';
import { updateEnergy } from './energy';

function enhanceEntity(entity: EntityComponents, world: GameWorld): BotEntity {
  const enhanced = entity as BotEntity;
  enhanced.has = (component: keyof EntityComponents) => entity[component] !== undefined;
  enhanced.get = <K extends keyof EntityComponents>(component: K) => entity[component];
  enhanced.set = <K extends keyof EntityComponents>(component: K, value: EntityComponents[K]) => {
    entity[component] = value;
    world.update(entity, component, value);
  };
  return enhanced;
}

export function updateWorld(world: GameWorld, delta: number): void {
  const deltaMs = delta * 1000;

  // Update all bot entities
  for (const entity of world.entities) {
    if (entity.botType) {
      const bot = enhanceEntity(entity, world);

      // Run systems
      updateEnergy(bot, deltaMs);
      moveAlongPath(bot, delta);
      updateGathering(bot, deltaMs);
    }
  }
}
