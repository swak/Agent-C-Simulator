/**
 * GPU Tier Detection
 *
 * Detects GPU capability and returns appropriate quality settings.
 * Tiers: 0 (very low) - 3 (high)
 */

export type GPUTier = 0 | 1 | 2 | 3;

export interface QualitySettings {
  shadowQuality: 'off' | 'low' | 'medium' | 'high';
  particleCount: 'minimal' | 'low' | 'medium' | 'high';
  textureResolution: number;
  antialiasing: boolean;
  maxBots: number;
  targetFPS: number;
  adaptiveQuality?: boolean;
}

let detectedTier: GPUTier = 2; // Default to medium tier

export function detectGPUTier(): GPUTier {
  // In production, this would use WebGL to detect GPU
  // For now, return default tier
  return detectedTier;
}

export function setGPUTier(tier: GPUTier): void {
  detectedTier = tier;
}

export function getQualitySettings(): QualitySettings {
  const tier = detectedTier;

  const presets: Record<GPUTier, QualitySettings> = {
    0: {
      shadowQuality: 'off',
      particleCount: 'minimal',
      textureResolution: 256,
      antialiasing: false,
      maxBots: 5,
      targetFPS: 30,
    },
    1: {
      shadowQuality: 'low',
      particleCount: 'minimal',
      textureResolution: 512,
      antialiasing: false,
      maxBots: 10,
      targetFPS: 30,
    },
    2: {
      shadowQuality: 'medium',
      particleCount: 'medium',
      textureResolution: 1024,
      antialiasing: true,
      maxBots: 20,
      targetFPS: 60,
    },
    3: {
      shadowQuality: 'high',
      particleCount: 'high',
      textureResolution: 2048,
      antialiasing: true,
      maxBots: 50,
      targetFPS: 60,
    },
  };

  return presets[tier];
}
