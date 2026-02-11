'use client';

import { OrbitControls } from '@react-three/drei';
import { useState, useEffect } from 'react';

export function Camera() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(typeof window !== 'undefined' && window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <OrbitControls
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={isMobile ? 8 : 5}
      maxDistance={isMobile ? 35 : 50}
      maxPolarAngle={Math.PI / 2.2}
      minPolarAngle={Math.PI / 6}
      dampingFactor={0.05}
      enableDamping
      target={[0, 0, 0]}
      panSpeed={isMobile ? 0.5 : 0.8}
      rotateSpeed={isMobile ? 0.4 : 0.6}
      zoomSpeed={isMobile ? 0.5 : 0.8}
    />
  );
}
