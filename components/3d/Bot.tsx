'use client';

import { useRef, useMemo } from 'react';
import { useFrame, extend } from '@react-three/fiber';
import { RigidBody, RapierRigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { Bot as BotType } from '@/stores/game-state';

// Extend R3F with Three.js primitives
extend(THREE);

interface BotProps {
  bot: BotType;
}

const BOT_COLORS: Record<BotType['type'], string> = {
  miner: '#4A90E2',
  hauler: '#E2944A',
  crafter: '#4AE29A',
  scout: '#9A4AE2',
};

export function Bot({ bot }: BotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const rigidBodyRef = useRef<RapierRigidBody>(null);

  const color = BOT_COLORS[bot.type];
  const position = useMemo(
    () => new THREE.Vector3(bot.position?.x || 0, bot.position?.y || 0.5, bot.position?.z || 0),
    [bot.position?.x, bot.position?.y, bot.position?.z]
  );

  // Bobbing animation for idle bots
  useFrame((state) => {
    if (!meshRef.current) return;

    if (bot.status === 'idle') {
      const time = state.clock.getElapsedTime();
      meshRef.current.position.y = position.y + Math.sin(time * 2) * 0.1;
    } else {
      meshRef.current.position.y = position.y;
    }

    // Subtle rotation when working
    if (bot.status === 'working' && bot.currentTask) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.2;
    }
  });

  return (
    <group
      position={[position.x, position.y, position.z]}
      userData={{
        testId: 'bot-entity',
        status: bot.status,
        inventoryFull: bot.currentTask?.progress === 100,
        hasUpgrades: false,
      }}
    >
      <RigidBody ref={rigidBodyRef} type="dynamic" colliders="cuboid" lockRotations>
        <mesh ref={meshRef} castShadow>
          <capsuleGeometry args={[0.3, 0.6, 8, 16]} />
          <meshStandardMaterial
            color={color}
            roughness={0.5}
            metalness={0.3}
            emissive={color}
            emissiveIntensity={bot.status === 'working' ? 0.2 : 0.05}
          />
        </mesh>

        {/* Energy indicator */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <sphereGeometry args={[0.1, 8, 8]} />
          <meshStandardMaterial
            color={bot.energy > 50 ? '#4AE29A' : bot.energy > 20 ? '#E2944A' : '#E24A4A'}
            emissive={bot.energy > 50 ? '#4AE29A' : bot.energy > 20 ? '#E2944A' : '#E24A4A'}
            emissiveIntensity={0.5}
          />
        </mesh>
      </RigidBody>
    </group>
  );
}
