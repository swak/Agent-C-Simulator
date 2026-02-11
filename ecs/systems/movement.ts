/**
 * Movement System
 *
 * Moves bots along their paths using bot speed stats.
 */

import { Position } from '@/ecs/world';
import { BotEntity } from '@/ecs/entities/bot';

export function moveAlongPath(bot: BotEntity, deltaTime: number): void {
  const path = bot.path;
  const position = bot.position;
  const stats = bot.stats;

  if (!path || !position || !stats) return;
  if (path.waypoints.length === 0) return;
  if (path.currentIndex >= path.waypoints.length) return;

  const targetWaypoint = path.waypoints[path.currentIndex];
  const speed = stats.speed;

  // Calculate direction to waypoint
  const dx = targetWaypoint.x - position.x;
  const dy = targetWaypoint.y - position.y;
  const dz = targetWaypoint.z - position.z;
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  // Move toward waypoint
  const moveDistance = speed * deltaTime;

  if (distance <= moveDistance || distance < 0.15) {
    // Reached or would overshoot waypoint, snap and advance
    bot.position = { ...targetWaypoint };
    bot.path = {
      ...path,
      currentIndex: path.currentIndex + 1,
    };
    return;
  }

  const t = moveDistance / distance;

  const newPosition: Position = {
    x: position.x + dx * t,
    y: position.y + dy * t,
    z: position.z + dz * t,
  };

  bot.position = newPosition;
}
