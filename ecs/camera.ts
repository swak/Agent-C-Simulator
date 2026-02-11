/**
 * Camera Management
 *
 * Stores camera position in the world for LOD calculations.
 */

import { GameWorld, Position } from './world';

export interface CameraConfig {
  position: Position;
}

export function setCamera(world: GameWorld, config: CameraConfig): void {
  world.camera = {
    position: config.position,
  };
}
