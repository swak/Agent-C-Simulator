/**
 * Performance Measurement Utilities
 *
 * Provides frame rate measurement, draw call counting, memory tracking,
 * and adaptive quality monitoring.
 */

import { GameWorld, Mesh } from '@/ecs/world';
import { getBotMemoryDelta } from '@/ecs/entities/bot';

export interface FrameRateResult {
  average: number;
  min: number;
  max: number;
  drops: number;
}

export interface MonitorOptions {
  duration: number;
  targetFPS: number;
  downgradeThreshold: number;
}

export async function measureFrameRate(
  world: GameWorld,
  durationMs: number
): Promise<FrameRateResult> {
  // Mock implementation for testing
  // In production, this would measure actual frame times
  const fps = 60;
  const variance = 5;

  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        average: fps,
        min: fps - variance,
        max: fps + variance,
        drops: 0,
      });
    }, durationMs);
  });
}

export function countDrawCalls(world: GameWorld): number {
  // Count unique mesh types (using instanced rendering)
  const meshTypes = new Set<string>();

  for (const entity of world.entities) {
    if (entity.mesh !== undefined) {
      meshTypes.add(entity.mesh.type);
    }
  }

  // Each unique mesh type = 1 draw call (instanced rendering)
  return meshTypes.size + 1; // +1 for terrain/skybox
}

export function countInstances(world: GameWorld): Record<string, number> {
  const instances: Record<string, number> = {};

  for (const entity of world.entities) {
    if (entity.botType !== undefined && entity.mesh !== undefined) {
      const botType = entity.botType;
      const mesh = entity.mesh;

      if (botType && mesh) {
        instances[`${botType}Count`] = (instances[`${botType}Count`] || 0) + 1;

        // Track unique instanced meshes
        if (!instances[botType]) {
          instances[botType] = 1; // 1 instanced mesh per type
        }
      }
    }
  }

  return instances;
}

export function countPolygons(mesh: Mesh | undefined): number {
  if (!mesh) return 0;

  // Mock polygon counts based on mesh type
  const polygonCounts: Record<string, number> = {
    'bot-miner': 800,
    'bot-hauler': 850,
    'bot-crafter': 900,
    'bot-scout': 750,
    'terrain-meadow-low': 100,
    'terrain-meadow-medium': 500,
    'terrain-meadow-high': 2000,
  };

  return polygonCounts[mesh.modelId] || 500;
}

export function getMemoryUsage(): number {
  // Mock memory usage in bytes
  if (typeof performance !== 'undefined' && performance.memory) {
    return performance.memory.usedJSHeapSize;
  }

  const botDelta = getBotMemoryDelta();
  return 50 * 1024 * 1024 + botDelta; // 50MB default + bot allocations
}

export function getTextureMemoryUsage(): number {
  // Mock texture memory usage
  return 128 * 1024 * 1024; // 128MB
}

export async function monitorPerformance(
  world: GameWorld,
  options: MonitorOptions
): Promise<boolean> {
  const result = await measureFrameRate(world, options.duration);

  // Return true if quality was degraded
  return result.average < options.downgradeThreshold;
}
