/**
 * Pathfinding System
 *
 * Simple A* or direct pathfinding with obstacle avoidance.
 */

import { Position } from '@/ecs/world';

export interface PathfindingOptions {
  obstacles?: Array<{ x: number; y: number; z: number; radius: number }>;
}

export interface PathResult {
  waypoints: Position[];
  success: boolean;
  reason?: string;
}

export function calculatePath(
  start: Position,
  end: Position,
  options: PathfindingOptions = {}
): PathResult {
  const obstacles = options.obstacles || [];

  // Check if end is reachable (not inside an obstacle)
  const endBlocked = obstacles.some((obstacle) => {
    const distance = Math.sqrt(
      Math.pow(end.x - obstacle.x, 2) + Math.pow(end.z - obstacle.z, 2)
    );
    return distance < obstacle.radius;
  });

  if (endBlocked) {
    return {
      waypoints: [],
      success: false,
      reason: 'no-path',
    };
  }

  // Simple straight-line path with obstacle avoidance
  const waypoints: Position[] = [];

  // Check if direct path is clear
  const directDistance = Math.sqrt(
    Math.pow(end.x - start.x, 2) + Math.pow(end.z - start.z, 2)
  );

  const steps = Math.ceil(directDistance / 2); // Check every 2 units

  let needsDetour = false;
  for (let i = 1; i <= steps; i++) {
    const t = i / steps;
    const checkPoint = {
      x: start.x + (end.x - start.x) * t,
      y: start.y + (end.y - start.y) * t,
      z: start.z + (end.z - start.z) * t,
    };

    const blocked = obstacles.some((obstacle) => {
      const distance = Math.sqrt(
        Math.pow(checkPoint.x - obstacle.x, 2) +
          Math.pow(checkPoint.z - obstacle.z, 2)
      );
      return distance < obstacle.radius;
    });

    if (blocked) {
      needsDetour = true;
      break;
    }
  }

  if (!needsDetour) {
    // Direct path is clear
    waypoints.push({ x: end.x, y: end.y, z: end.z });
  } else {
    // Create detour waypoints around obstacles
    const midX = (start.x + end.x) / 2;
    const midZ = (start.z + end.z) / 2;

    // Offset perpendicular to path
    const dx = end.x - start.x;
    const dz = end.z - start.z;
    const perpX = -dz / Math.sqrt(dx * dx + dz * dz);
    const perpZ = dx / Math.sqrt(dx * dx + dz * dz);

    const offset = 5; // Offset distance
    waypoints.push({
      x: midX + perpX * offset,
      y: start.y,
      z: midZ + perpZ * offset,
    });
    waypoints.push({ x: end.x, y: end.y, z: end.z });
  }

  return {
    waypoints,
    success: true,
  };
}
