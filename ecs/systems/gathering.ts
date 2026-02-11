/**
 * Gathering System
 *
 * Handles resource gathering with progress tracking and bot type modifiers.
 */

import { EntityComponents } from '@/ecs/world';
import { BotEntity } from '@/ecs/entities/bot';
import { queueAudioEvent } from './audio';

export function updateGathering(bot: BotEntity, deltaMs: number): void {
  const aiState = bot.aiState;
  const task = bot.task;
  const stats = bot.stats;
  const inventory = bot.inventory;

  if (!aiState || aiState.current !== 'gathering') return;
  if (!task) return;
  if (!stats || !inventory) return;

  const duration = task.duration || 5000;
  const gatheringModifier = stats.gatheringModifier;

  // Apply speed modifier to progress
  const progressIncrement = (deltaMs / duration) * 100 * gatheringModifier;
  const newProgress = (task.progress || 0) + progressIncrement;

  if (newProgress >= 100) {
    // Gathering complete
    const resourceType = task.resourceType || 'wood';
    const newItems = [...inventory.items, resourceType];

    bot.inventory = { items: newItems };
    bot.task = {
      ...task,
      progress: 0,
    };

    // Queue audio event
    queueAudioEvent({
      type: 'gather',
      resourceType,
    });
  } else {
    bot.task = {
      ...task,
      progress: newProgress,
    };
  }
}
