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

import { BotEntity } from '@/ecs/entities/bot';

export function updateEnergy(bot: BotEntity, deltaMs: number): void {
  const aiState = bot.aiState;
  const energy = bot.energy;

  if (!aiState || !energy) return;

  const deltaSec = deltaMs / 1000;
  const state = aiState.current;

  let energyDelta = 0;

  if (state === 'idle') {
    // Recharge when idle
    energyDelta = ENERGY_RECHARGE_RATE * deltaSec;
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

  // Force idle if energy depleted
  if (newEnergy <= 0 && state !== 'idle') {
    bot.aiState = { current: 'idle' };
  }
}
