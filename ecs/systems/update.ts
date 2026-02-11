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
import { updateBotAI } from './ai';
import { depositResources } from './deposit';

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

      // Run systems in order
      // 1. Energy (drains/recharges, pauses tasks if depleted)
      updateEnergy(bot, deltaMs);

      // 2. Movement (if bot has a path)
      if (bot.path && bot.path.waypoints.length > 0 && bot.aiState?.current === 'moving') {
        moveAlongPath(bot, delta);
      }

      // 3. Gathering (if bot is gathering)
      if (bot.aiState?.current === 'gathering') {
        updateGathering(bot, deltaMs);
      }

      // 4. Bot AI (decision making)
      updateBotAI(bot, world, deltaMs);

      // 5. Deposit (if at base with inventory)
      if (bot.aiState?.current === 'idle' && bot.inventory && bot.inventory.items.length > 0) {
        depositResources(bot, world);
      }
    }
  }
}
