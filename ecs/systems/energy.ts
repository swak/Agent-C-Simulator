/**
 * Energy System
 *
 * Manages bot energy consumption and recharge.
 * - Drains energy when moving or gathering
 * - Recharges when idle
 * - Forces idle state when depleted
 */

const ENERGY_DRAIN_RATE: Record<string, number> = {
  idle: -0.5, // Slow recharge
  moving: 1.0, // Medium drain
  gathering: 2.5, // High drain
  blocked: 0.0, // No drain when blocked
};

const ENERGY_RECHARGE_RATE = 2.0; // Units per second when idle
const STANDBY_DRAIN_RATE = -0.1; // Small drain when fully charged to prevent overflow

import { BotEntity } from '@/ecs/entities/bot';
import { GameWorld } from '@/ecs/world';
import { releaseResourceNode } from './resources';
import { distance3D } from '@/utils/math';
import { BASE_POSITION, BASE_RADIUS, BASE_RECHARGE_RATE } from '@/utils/constants';

export function updateEnergy(bot: BotEntity, deltaMs: number, world?: GameWorld): void {
  const aiState = bot.aiState;
  const energy = bot.energy;

  if (!aiState || !energy) return;

  const deltaSec = deltaMs / 1000;
  const state = aiState.current;

  let energyDelta = 0;

  if (state === 'idle') {
    if (energy.current >= energy.max) {
      // Small standby drain when fully charged
      energyDelta = STANDBY_DRAIN_RATE * deltaSec;
    } else {
      // Boost recharge rate when near base
      const pos = bot.position;
      const nearBase = pos && distance3D(pos, BASE_POSITION) < BASE_RADIUS;
      const rechargeRate = nearBase ? BASE_RECHARGE_RATE : ENERGY_RECHARGE_RATE;
      energyDelta = rechargeRate * deltaSec;
    }
  } else {
    // Drain energy based on activity
    const drainRate = ENERGY_DRAIN_RATE[state] || 0;
    energyDelta = -drainRate * deltaSec;
  }

  const newEnergy = Math.max(0, Math.min(energy.max, energy.current + energyDelta));

  bot.energy = {
    ...energy,
    current: newEnergy,
  };

  // Force idle if energy depleted and pause task
  if (newEnergy <= 0 && state !== 'idle') {
    bot.aiState = { current: 'idle' };

    // Pause current task (preserve details for resume)
    if (bot.task && bot.task.active) {
      // Release resource node if bot was gathering
      if (bot.task.targetNodeId && world) {
        releaseResourceNode(world, bot.task.targetNodeId);
      }

      bot.task = {
        ...bot.task,
        active: false,
      };
    }
  }
}
