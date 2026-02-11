'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HomeBase() {
  const beaconRef = useRef<THREE.Mesh>(null);
  const beaconTopRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();

    // Beacon emissive pulse
    if (beaconRef.current) {
      const mat = beaconRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.3 + Math.sin(time * 2) * 0.2;
    }

    // Beacon top glow pulse
    if (beaconTopRef.current) {
      const mat = beaconTopRef.current.material as THREE.MeshStandardMaterial;
      mat.emissiveIntensity = 0.6 + Math.sin(time * 3) * 0.3;
    }

    // Ground glow scale oscillation
    if (glowRef.current) {
      const scale = 1.0 + Math.sin(time * 1.5) * 0.05;
      glowRef.current.scale.set(scale, scale, 1);
    }
  });

  return (
    <group position={[0, 0, 0]}>
      {/* Circular platform */}
      <mesh position={[0, 0.05, 0]} receiveShadow>
        <cylinderGeometry args={[2.5, 2.5, 0.1, 32]} />
        <meshStandardMaterial
          color="#6B7280"
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Edge ring */}
      <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.08, 8, 48]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#3B82F6"
          emissiveIntensity={0.4}
        />
      </mesh>

      {/* Beacon column */}
      <mesh ref={beaconRef} position={[0, 1.05, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.25, 2.0, 8]} />
        <meshStandardMaterial
          color="#1E3A5F"
          emissive="#06B6D4"
          emissiveIntensity={0.3}
          roughness={0.4}
          metalness={0.6}
        />
      </mesh>

      {/* Beacon top sphere */}
      <mesh ref={beaconTopRef} position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[0.2, 16, 16]} />
        <meshStandardMaterial
          color="#06B6D4"
          emissive="#06B6D4"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.3}
        />
      </mesh>

      {/* Ground glow ring */}
      <mesh
        ref={glowRef}
        position={[0, 0.02, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <ringGeometry args={[2.0, 2.8, 48]} />
        <meshStandardMaterial
          color="#3B82F6"
          emissive="#3B82F6"
          emissiveIntensity={0.2}
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  );
}
