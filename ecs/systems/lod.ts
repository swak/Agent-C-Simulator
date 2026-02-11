/**
 * Level of Detail System
 *
 * Adjusts mesh LOD based on camera distance.
 */

import { GameWorld, Position } from '@/ecs/world';

function calculateDistance(pos1: Position, pos2: Position): number {
  return Math.sqrt(
    Math.pow(pos1.x - pos2.x, 2) +
      Math.pow(pos1.y - pos2.y, 2) +
      Math.pow(pos1.z - pos2.z, 2)
  );
}

export function updateLOD(world: GameWorld): void {
  const cameraPos = world.camera?.position || { x: 0, y: 10, z: 0 };

  for (const entity of world.entities) {
    if (!entity.position || !entity.mesh) continue;

    const position = entity.position;
    const mesh = entity.mesh;

    const distance = calculateDistance(cameraPos, position);

    let lodLevel = 0;
    if (distance > 50) {
      lodLevel = 2; // Low detail
    } else if (distance > 20) {
      lodLevel = 1; // Medium detail
    }

    if (mesh.lodLevel !== lodLevel) {
      world.update(entity, 'mesh', {
        ...mesh,
        lodLevel,
      });
    }
  }
}
