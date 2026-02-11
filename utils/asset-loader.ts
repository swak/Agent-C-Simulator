/**
 * Asset Loader
 *
 * Handles loading of models, textures, and other game assets.
 * Supports lazy loading and GPU tier-based quality adjustment.
 */

import { GameWorld } from '@/ecs/world';
import { getQualitySettings } from './detect-gpu';

export interface LoadOptions {
  priority?: 'high' | 'medium' | 'low';
}

export interface Model {
  id: string;
  compressed: boolean;
  compression?: 'draco' | 'gzip';
}

export interface Texture {
  id: string;
  width: number;
  height: number;
}

const loadedAssets = new Set<string>();
const assetCache: Map<string, Model | Texture> = new Map();

export async function loadAssets(
  world: GameWorld,
  assetIds: string[],
  options: LoadOptions = {}
): Promise<void> {
  // Mock async loading
  return new Promise((resolve) => {
    setTimeout(() => {
      assetIds.forEach((id) => {
        loadedAssets.add(id);
      });
      resolve();
    }, 100);
  });
}

export function getLoadedAssets(): string[] {
  return Array.from(loadedAssets);
}

export function loadModel(modelId: string): Model {
  if (assetCache.has(modelId)) {
    return assetCache.get(modelId) as Model;
  }

  const model: Model = {
    id: modelId,
    compressed: true,
    compression: 'draco',
  };

  assetCache.set(modelId, model);
  loadedAssets.add(modelId);

  return model;
}

export function loadTexture(textureId: string): Texture {
  const qualitySettings = getQualitySettings();
  const resolution = qualitySettings.textureResolution;

  // Check cache but only if resolution matches current GPU tier
  if (assetCache.has(textureId)) {
    const cached = assetCache.get(textureId) as Texture;
    if (cached.width === resolution) {
      return cached;
    }
  }

  const texture: Texture = {
    id: textureId,
    width: resolution,
    height: resolution,
  };

  assetCache.set(textureId, texture);
  loadedAssets.add(textureId);

  return texture;
}

export function loadTextures(textureIds: string[]): Texture[] {
  return textureIds.map((id) => loadTexture(id));
}
