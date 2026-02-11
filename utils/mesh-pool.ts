/**
 * Mesh Object Pooling
 *
 * Reuses mesh instances to reduce memory allocation.
 */

const meshPools: Map<string, number> = new Map();

export function getMeshPoolSize(type: string): number {
  return meshPools.get(type) || 0;
}

export function initializeMeshPool(type: string, size: number): void {
  meshPools.set(type, size);
}

export function releaseMesh(type: string): void {
  const current = meshPools.get(type) || 0;
  meshPools.set(type, current + 1);
}

export function acquireMesh(type: string): void {
  const current = meshPools.get(type) || 0;
  meshPools.set(type, Math.max(0, current - 1));
}
