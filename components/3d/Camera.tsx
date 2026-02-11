'use client';

import { useRef, useState, useEffect } from 'react';
import { OrbitControls } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '@/stores/game-state';
import * as THREE from 'three';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';

export function Camera() {
  const controlsRef = useRef<OrbitControlsImpl>(null);
  const targetVec = useRef(new THREE.Vector3(0, 0, 0));
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    const { selectedBotId, bots } = useGameStore.getState();

    // Determine desired target position
    const desired = new THREE.Vector3(0, 0, 0);
    if (selectedBotId) {
      const bot = bots.find((b) => b.id === selectedBotId);
      if (bot?.position) {
        desired.set(bot.position.x, bot.position.y, bot.position.z);
      }
    }

    // Smooth lerp — frame-rate independent
    targetVec.current.lerp(desired, 1 - Math.exp(-5 * delta));
    controlsRef.current.target.copy(targetVec.current);
  });

  return (
    <OrbitControls
      ref={controlsRef}
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={isMobile ? 8 : 5}
      maxDistance={isMobile ? 35 : 50}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 6}
      dampingFactor={0.05}
      enableDamping
      panSpeed={isMobile ? 0.5 : 0.8}
      rotateSpeed={isMobile ? 0.4 : 0.6}
      zoomSpeed={isMobile ? 0.5 : 0.8}
    />
  );
}
