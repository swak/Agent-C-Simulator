'use client';

import { RigidBody } from '@react-three/rapier';

export function Terrain() {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh receiveShadow position={[0, -0.5, 0]}>
        <boxGeometry args={[100, 1, 100]} />
        <meshStandardMaterial
          color="#7CBA5C"
          roughness={0.9}
          metalness={0.1}
        />
      </mesh>
    </RigidBody>
  );
}
