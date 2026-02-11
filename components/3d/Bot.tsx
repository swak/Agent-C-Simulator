'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Sparkles, Trail, Float } from '@react-three/drei';
import { Bot as BotType } from '@/stores/game-state';

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

  const color = BOT_COLORS[bot.type];
  const position = useMemo(
    () => new THREE.Vector3(bot.position?.x || 0, bot.position?.y || 0.5, bot.position?.z || 0),
    [bot.position?.x, bot.position?.y, bot.position?.z]
  );

  // Subtle rotation when working
  useFrame((state) => {
    if (!meshRef.current) return;

    if (bot.status === 'working' && bot.currentTask) {
      const time = state.clock.getElapsedTime();
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.2;
    }
  });

  const energy = Math.round(bot.energy);

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
      {/* Float replaces manual bobbing */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5} enabled={bot.status === 'idle'}>
        {/* Trail for movement effect */}
        <Trail
          width={0.5}
          length={4}
          color={color}
          attenuation={(t) => t * t}
        >
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
              color={energy > 50 ? '#4AE29A' : energy > 20 ? '#E2944A' : '#E24A4A'}
              emissive={energy > 50 ? '#4AE29A' : energy > 20 ? '#E2944A' : '#E24A4A'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Trail>
      </Float>

      {/* Sparkles when working */}
      {bot.status === 'working' && (
        <Sparkles
          count={20}
          scale={1.5}
          size={2}
          speed={0.4}
          opacity={0.6}
          color={color}
        />
      )}

      {/* Cyan sparkles when recharging at base */}
      {bot.status === 'recharging' && (
        <Sparkles
          count={15}
          scale={1.2}
          size={1.5}
          speed={0.3}
          opacity={0.5}
          color="#06B6D4"
        />
      )}

      {/* Html overlay for status */}
      <Html
        position={[0, 1.2, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '4px 8px',
            borderRadius: '4px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
          }}
        >
          <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            {bot.status}
          </div>
          <div style={{ fontSize: '9px', marginTop: '2px' }}>
            Energy: {energy}%
          </div>
          {bot.currentTask && bot.currentTask.progress !== undefined && (
            <div
              style={{
                marginTop: '4px',
                height: '3px',
                background: 'rgba(255, 255, 255, 0.3)',
                borderRadius: '2px',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: `${bot.currentTask.progress}%`,
                  height: '100%',
                  background: '#4AE29A',
                  transition: 'width 0.3s',
                }}
              />
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
