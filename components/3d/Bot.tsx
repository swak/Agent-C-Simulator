'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html, Sparkles, Trail, Float } from '@react-three/drei';
import { Bot as BotType } from '@/stores/game-state';

interface BotProps {
  bot: BotType;
}

const TYPE_SCALE: Record<BotType['type'], number> = {
  miner: 1.0,
  hauler: 1.2,
  crafter: 1.0,
  scout: 1.0,
};

const TYPE_CAPSULE: Record<BotType['type'], [number, number]> = {
  miner: [0.3, 0.6],
  hauler: [0.3, 0.6],
  crafter: [0.4, 0.4],
  scout: [0.25, 0.7],
};

const TRAIL_COLORS: Record<BotType['type'], string> = {
  miner: '#4A90E2',
  hauler: '#E2944A',
  crafter: '#4AE29A',
  scout: '#22C55E',
};

const BOT_COLORS: Record<BotType['type'], string> = {
  miner: '#4A90E2',
  hauler: '#E2944A',
  crafter: '#4AE29A',
  scout: '#9A4AE2',
};

export function Bot({ bot }: BotProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const color = BOT_COLORS[bot.type];
  const trailColor = TRAIL_COLORS[bot.type];
  const scale = TYPE_SCALE[bot.type];
  const [capsuleRadius, capsuleHeight] = TYPE_CAPSULE[bot.type];
  const upgradeCount = bot.upgrades?.length ?? 0;
  const hasUpgrades = upgradeCount > 0;
  const typeInitial = bot.type[0].toUpperCase();
  const inventoryCount = bot.inventoryCount ?? 0;
  const capacity = bot.capacity ?? 10;
  const carryPercent = capacity > 0 ? Math.round((inventoryCount / capacity) * 100) : 0;
  const isCarrying = inventoryCount > 0;
  const isMoving = bot.status === 'moving' || bot.status === 'returning';

  const position = useMemo(
    () => new THREE.Vector3(bot.position?.x || 0, bot.position?.y || 0.5, bot.position?.z || 0),
    [bot.position?.x, bot.position?.y, bot.position?.z]
  );

  // Rotation when working + pulsing upgrade ring
  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime();

    if (bot.status === 'working' && bot.currentTask) {
      meshRef.current.rotation.y = Math.sin(time * 3) * 0.2;
    }

    // Pulse the upgrade ring
    if (ringRef.current && hasUpgrades) {
      const pulse = 0.3 + Math.sin(time * 2) * 0.2;
      (ringRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = pulse;
      ringRef.current.rotation.z = time * 0.5;
    }
  });

  const energy = Math.round(bot.energy);

  // Upgraded bots glow brighter
  const baseEmissive = hasUpgrades ? 0.15 : 0.05;
  const workingEmissive = hasUpgrades ? 0.35 : 0.2;

  return (
    <group
      position={[position.x, position.y, position.z]}
      scale={[scale, scale, scale]}
      userData={{
        testId: 'bot-entity',
        status: bot.status,
        inventoryFull: carryPercent >= 100,
        hasUpgrades,
      }}
    >
      {/* Gold upgrade ring at base — bigger, pulsing */}
      {hasUpgrades && (
        <mesh ref={ringRef} position={[0, -0.15, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.55 + upgradeCount * 0.05, 0.08, 12, 32]} />
          <meshStandardMaterial
            color="#FFD700"
            emissive="#FFD700"
            emissiveIntensity={0.5}
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>
      )}

      {/* Second ring for 2+ upgrades */}
      {upgradeCount >= 2 && (
        <mesh position={[0, 0.0, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.4, 0.04, 8, 24]} />
          <meshStandardMaterial
            color="#FFA500"
            emissive="#FFA500"
            emissiveIntensity={0.3}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      )}

      {/* Float replaces manual bobbing */}
      <Float speed={2} rotationIntensity={0} floatIntensity={0.5} enabled={bot.status === 'idle'}>
        {/* Trail — much wider and longer for visibility */}
        <Trail
          width={isMoving ? 2.0 : 1.2}
          length={isMoving ? 8 : 5}
          color={trailColor}
          attenuation={(t) => t * t}
        >
          <mesh ref={meshRef} castShadow>
            <capsuleGeometry args={[capsuleRadius, capsuleHeight, 8, 16]} />
            <meshStandardMaterial
              color={color}
              roughness={0.5}
              metalness={0.3}
              emissive={color}
              emissiveIntensity={bot.status === 'working' ? workingEmissive : baseEmissive}
            />
          </mesh>

          {/* Energy indicator */}
          <mesh position={[0, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 8]} />
            <meshStandardMaterial
              color={energy > 50 ? '#4AE29A' : energy > 20 ? '#E2944A' : '#E24A4A'}
              emissive={energy > 50 ? '#4AE29A' : energy > 20 ? '#E2944A' : '#E24A4A'}
              emissiveIntensity={0.5}
            />
          </mesh>
        </Trail>
      </Float>

      {/* Sparkles when working — 4x bigger */}
      {bot.status === 'working' && (
        <Sparkles
          count={30}
          scale={3}
          size={8}
          speed={0.6}
          opacity={0.8}
          color={color}
        />
      )}

      {/* Cyan sparkles when recharging — 4x bigger */}
      {bot.status === 'recharging' && (
        <Sparkles
          count={25}
          scale={2.5}
          size={6}
          speed={0.5}
          opacity={0.7}
          color="#06B6D4"
        />
      )}

      {/* Gold sparkles for upgraded bots */}
      {hasUpgrades && (
        <Sparkles
          count={10 + upgradeCount * 5}
          scale={2}
          size={4}
          speed={0.3}
          opacity={0.5}
          color="#FFD700"
        />
      )}

      {/* Html overlay for status */}
      <Html
        position={[0, 1.4, 0]}
        center
        distanceFactor={8}
        style={{
          pointerEvents: 'none',
          userSelect: 'none',
        }}
      >
        <div
          style={{
            background: 'rgba(0, 0, 0, 0.75)',
            color: 'white',
            padding: '5px 10px',
            borderRadius: '5px',
            fontSize: '10px',
            whiteSpace: 'nowrap',
            textAlign: 'center',
            border: hasUpgrades ? '1px solid rgba(255, 215, 0, 0.5)' : 'none',
          }}
        >
          <div style={{ fontWeight: 'bold', textTransform: 'capitalize' }}>
            [{typeInitial}] {bot.status}
          </div>

          {/* Energy bar */}
          <div style={{ fontSize: '9px', marginTop: '3px' }}>
            Energy: {energy}%
          </div>
          <div
            style={{
              marginTop: '2px',
              height: '3px',
              width: '60px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${energy}%`,
                height: '100%',
                background: energy > 50 ? '#4AE29A' : energy > 20 ? '#E2944A' : '#E24A4A',
                transition: 'width 0.3s',
              }}
            />
          </div>

          {/* Carry bar */}
          <div style={{ fontSize: '9px', marginTop: '3px', color: carryPercent >= 100 ? '#E24A4A' : '#ccc' }}>
            Carry: {inventoryCount}/{capacity}
          </div>
          <div
            style={{
              marginTop: '2px',
              height: '3px',
              width: '60px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${carryPercent}%`,
                height: '100%',
                background: carryPercent >= 100 ? '#E24A4A' : carryPercent > 50 ? '#E2944A' : '#4A90E2',
                transition: 'width 0.3s',
              }}
            />
          </div>

          {hasUpgrades && (
            <div style={{ fontSize: '9px', marginTop: '2px', color: '#FFD700', fontWeight: 'bold' }}>
              Upgrades: {upgradeCount}/3
            </div>
          )}

          {/* Gather progress */}
          {bot.currentTask && bot.currentTask.progress !== undefined && bot.status === 'working' && (
            <div style={{ fontSize: '9px', marginTop: '3px', color: '#4AE29A' }}>
              Gathering: {Math.round(bot.currentTask.progress)}%
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}
