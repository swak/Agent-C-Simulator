'use client';

import { OrbitControls } from '@react-three/drei';

export function Camera() {
  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={5}
      maxDistance={50}
      maxPolarAngle={Math.PI / 2.2} // Prevent going below ground
      minPolarAngle={Math.PI / 6} // Don't get too top-down
      dampingFactor={0.05}
      enableDamping
      target={[0, 0, 0]}
      panSpeed={0.8}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
    />
  );
}
