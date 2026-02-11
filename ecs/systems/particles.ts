/**
 * Particle System
 *
 * Enables/disables particles based on GPU tier and bot activity.
 */

import { GameWorld } from '@/ecs/world';
import { getQualitySettings } from '@/utils/detect-gpu';

export function updateParticles(world: GameWorld, delta: number): void {
  const qualitySettings = getQualitySettings();
  const particlesEnabled = qualitySettings.particleCount !== 'minimal';

  for (const entity of world.entities) {
    if (!entity.particles) continue;

    // Disable particles on very low GPU tiers
    if (!particlesEnabled && entity.particles.enabled) {
      entity.particles = { enabled: false };
    }

    // Enable particles on higher tiers if bot is active
    if (particlesEnabled && !entity.particles.enabled) {
      const aiState = entity.aiState;
      if (aiState && aiState.current === 'gathering') {
        entity.particles = { enabled: true };
      }
    }
  }
}
