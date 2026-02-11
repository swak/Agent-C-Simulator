/**
 * Gathering System
 *
 * Handles resource gathering with progress tracking and bot type modifiers.
 */

import { EntityComponents, GameWorld } from '@/ecs/world';
import { BotEntity } from '@/ecs/entities/bot';
import { queueAudioEvent } from './audio';
import { releaseResourceNode } from './resources';
import { useGameStore } from '@/stores/game-state';

export function updateGathering(bot: BotEntity, deltaMs: number, world?: GameWorld): void {
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
  let progressIncrement = (deltaMs / duration) * 100 * gatheringModifier;

  // Apply tech tree multipliers
  try {
    const techNodes = useGameStore.getState().techTree.nodes;
    const resourceType = task.resourceType || 'wood';

    if (resourceType === 'crystals' && techNodes.find((n) => n.id === 'crystal-processing')?.unlocked) {
      progressIncrement *= 2;
    }

    if (bot.botType === 'miner' && techNodes.find((n) => n.id === 'advanced-miner')?.unlocked) {
      progressIncrement *= 1.25;
    }
  } catch {
    // Store may not be initialized in tests
  }

  const newProgress = (task.progress || 0) + progressIncrement;

  if (newProgress >= 100) {
    // Gathering complete
    const resourceType = task.resourceType || 'wood';
    const newItems = [...inventory.items, resourceType];

    bot.inventory = { items: newItems };

    // Queue audio event
    queueAudioEvent({
      type: 'gather',
      resourceType,
    });

    // Always release resource after each gathering completes
    if (task.targetNodeId && world) {
      releaseResourceNode(world, task.targetNodeId);
    }

    // Check if inventory is full
    if (newItems.length >= stats.capacity) {
      // Inventory full - transition to idle (AI will handle return to base)
      bot.task = {
        ...task,
        progress: 0,
        targetNodeId: undefined,
      };

      bot.aiState = { current: 'idle' };
    } else {
      // Inventory not full - reset progress, clear targetNodeId, stay in gathering state
      // AI system will reclaim resource on next tick if bot wants to continue
      bot.task = {
        ...task,
        progress: 0,
        targetNodeId: undefined,
      };
      // Transition to idle so AI can reclaim resource
      bot.aiState = { current: 'idle' };
    }
  } else {
    bot.task = {
      ...task,
      progress: newProgress,
    };
  }
}
