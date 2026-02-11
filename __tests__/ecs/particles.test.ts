/**
 * Unit Tests: Particle System
 *
 * Tests particle enabling/disabling based on GPU tier and bot activity:
 * - Disable particles on low-end GPUs
 * - Enable particles when bot is gathering on high-end GPUs
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createWorld, GameWorld } from '@/ecs/world'
import { createBot, BotEntity } from '@/ecs/entities/bot'
import { updateParticles } from '@/ecs/systems/particles'
import * as detectGpu from '@/utils/detect-gpu'

describe('Particle System', () => {
  let world: GameWorld

  beforeEach(() => {
    world = createWorld()
  })

  describe('GPU-based particle control', () => {
    it('should disable particles on minimal GPU tier', () => {
      // Given: Mock minimal particle count (low-end GPU)
      vi.spyOn(detectGpu, 'getQualitySettings').mockReturnValue({
        maxBots: 10,
        shadowQuality: 'low',
        particleCount: 'minimal',
        antiAliasing: false,
        gpuTier: 1,
      })

      // Given: Bot with particles enabled
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.particles = { enabled: true }

      // When: Update particles system
      updateParticles(world, 16)

      // Then: Particles should be disabled
      expect(bot.particles?.enabled).toBe(false)
    })

    it('should enable particles when bot is gathering on higher GPU tier', () => {
      // Given: Mock normal particle count (higher-end GPU)
      vi.spyOn(detectGpu, 'getQualitySettings').mockReturnValue({
        maxBots: 50,
        shadowQuality: 'high',
        particleCount: 'normal',
        antiAliasing: true,
        gpuTier: 3,
      })

      // Given: Bot in gathering state with particles disabled
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.particles = { enabled: false }
      bot.aiState = { current: 'gathering' }

      // When: Update particles system
      updateParticles(world, 16)

      // Then: Particles should be enabled
      expect(bot.particles?.enabled).toBe(true)
    })

    it('should not enable particles if bot is not gathering', () => {
      // Given: Higher-end GPU
      vi.spyOn(detectGpu, 'getQualitySettings').mockReturnValue({
        maxBots: 50,
        shadowQuality: 'high',
        particleCount: 'normal',
        antiAliasing: true,
        gpuTier: 3,
      })

      // Given: Bot in idle state with particles disabled
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      bot.particles = { enabled: false }
      bot.aiState = { current: 'idle' }

      // When: Update particles system
      updateParticles(world, 16)

      // Then: Particles should remain disabled
      expect(bot.particles?.enabled).toBe(false)
    })
  })

  describe('Edge cases', () => {
    it('should skip entities without particles component', () => {
      // Given: Entity without particles component
      const bot = createBot(world, {
        type: 'miner',
        position: { x: 0, y: 0, z: 0 },
      })
      delete bot.particles

      // When: Update particles system (should not crash)
      expect(() => updateParticles(world, 16)).not.toThrow()
    })
  })
})
