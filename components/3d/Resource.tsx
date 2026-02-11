'use client';

import { useRef } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import * as THREE from 'three';

// Extend R3F with Three.js primitives
extend(THREE);

interface ResourceProps {
  type: 'wood' | 'stone' | 'iron';
  position: [number, number, number];
}

const RESOURCE_COLORS = {
  wood: { trunk: '#8B4513', leaves: '#2D5A27' },
  stone: { primary: '#808080', secondary: '#606060' },
  iron: { primary: '#B8B8B8', secondary: '#D0D0D0' },
};

export function Resource({ type, position }: ResourceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  // Gentle rotation animation
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.1;
    }

    // Pulsing glow effect
    if (glowRef.current) {
      const glow = Math.sin(state.clock.getElapsedTime() * 2) * 0.5 + 0.5;
      glowRef.current.scale.setScalar(1 + glow * 0.2);
    }
  });

  return (
    <group ref={groupRef} position={position} userData={{ testId: `resource-node-${type}` }}>
      {type === 'wood' && (
        <>
          {/* Tree trunk */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <cylinderGeometry args={[0.3, 0.4, 1.6, 8]} />
            <meshStandardMaterial color={RESOURCE_COLORS.wood.trunk} roughness={0.9} />
          </mesh>
          {/* Tree leaves */}
          <mesh position={[0, 2, 0]} castShadow>
            <sphereGeometry args={[0.8, 8, 8]} />
            <meshStandardMaterial color={RESOURCE_COLORS.wood.leaves} roughness={0.8} />
          </mesh>
          <mesh position={[0, 2.4, 0]} castShadow>
            <sphereGeometry args={[0.6, 8, 8]} />
            <meshStandardMaterial color={RESOURCE_COLORS.wood.leaves} roughness={0.8} />
          </mesh>
        </>
      )}

      {type === 'stone' && (
        <>
          {/* Rock cluster */}
          <mesh position={[0, 0.4, 0]} castShadow>
            <dodecahedronGeometry args={[0.6, 0]} />
            <meshStandardMaterial color={RESOURCE_COLORS.stone.primary} roughness={0.95} metalness={0.1} />
          </mesh>
          <mesh position={[0.3, 0.3, 0.2]} castShadow>
            <dodecahedronGeometry args={[0.4, 0]} />
            <meshStandardMaterial color={RESOURCE_COLORS.stone.secondary} roughness={0.95} metalness={0.1} />
          </mesh>
          <mesh position={[-0.2, 0.25, -0.3]} castShadow>
            <dodecahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color={RESOURCE_COLORS.stone.secondary} roughness={0.95} metalness={0.1} />
          </mesh>
        </>
      )}

      {type === 'iron' && (
        <>
          {/* Crystal cluster */}
          <mesh position={[0, 0.5, 0]} castShadow rotation={[0, Math.PI / 4, 0]}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color={RESOURCE_COLORS.iron.primary}
              roughness={0.2}
              metalness={0.8}
              emissive={RESOURCE_COLORS.iron.secondary}
              emissiveIntensity={0.1}
            />
          </mesh>
          <mesh position={[0.3, 0.4, 0.2]} castShadow rotation={[Math.PI / 6, 0, 0]}>
            <octahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial
              color={RESOURCE_COLORS.iron.secondary}
              roughness={0.2}
              metalness={0.8}
              emissive={RESOURCE_COLORS.iron.primary}
              emissiveIntensity={0.1}
            />
          </mesh>
          <mesh position={[-0.2, 0.35, -0.2]} castShadow rotation={[0, Math.PI / 3, Math.PI / 4]}>
            <octahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial
              color={RESOURCE_COLORS.iron.primary}
              roughness={0.2}
              metalness={0.8}
              emissive={RESOURCE_COLORS.iron.secondary}
              emissiveIntensity={0.1}
            />
          </mesh>

          {/* Glow sphere */}
          <mesh ref={glowRef} position={[0, 0.5, 0]}>
            <sphereGeometry args={[0.8, 16, 16]} />
            <meshBasicMaterial
              color={RESOURCE_COLORS.iron.secondary}
              transparent
              opacity={0.1}
            />
          </mesh>
        </>
      )}
    </group>
  );
}
