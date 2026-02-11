'use client';

import { useEffect, useState } from 'react';
import { useGameStore } from '@/stores/game-state';
import { audioManager } from '@/lib/audio';

export function WelcomeBack() {
  const [visible, setVisible] = useState(false);
  const [offlineResources, setOfflineResources] = useState<Record<string, number>>({});
  const [timeAway, setTimeAway] = useState('');

  const calculateOfflineProgress = useGameStore((s) => s.calculateOfflineProgress);
  const getOfflineTime = useGameStore((s) => s.getOfflineTime);

  useEffect(() => {
    const offlineTimeMs = getOfflineTime();
    const fiveMinutes = 5 * 60 * 1000;

    // Only show if away for more than 5 minutes
    if (offlineTimeMs > fiveMinutes) {
      const resources = calculateOfflineProgress();
      setOfflineResources(resources);

      // Format time away
      const hours = Math.floor(offlineTimeMs / (60 * 60 * 1000));
      const minutes = Math.floor((offlineTimeMs % (60 * 60 * 1000)) / (60 * 1000));

      if (hours > 0) {
        setTimeAway(`${hours} hour${hours > 1 ? 's' : ''}`);
      } else {
        setTimeAway(`${minutes} minute${minutes > 1 ? 's' : ''}`);
      }

      setVisible(true);
      audioManager.play('welcome-back');
    }
  }, [calculateOfflineProgress, getOfflineTime]);

  const handleClaim = () => {
    setVisible(false);
  };

  if (!visible) return null;

  const eightHourCap = getOfflineTime() >= 8 * 60 * 60 * 1000;

  return (
    <div
      data-testid="welcome-back-screen"
      className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <div className="bg-gray-900 rounded-lg shadow-2xl p-8 max-w-md w-full text-white">
        <h1 className="text-3xl font-bold mb-4 text-center">Welcome Back!</h1>

        <p className="text-gray-300 text-center mb-6">
          You were away for {timeAway}
          {eightHourCap && <span className="text-yellow-500"> (8 hour cap)</span>}
        </p>

        <div className="bg-gray-800 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-3">Resources Collected:</h2>
          <div className="space-y-2">
            {Object.entries(offlineResources).map(([resource, amount]) => (
              <div
                key={resource}
                data-testid={`offline-${resource}`}
                className="flex justify-between"
              >
                <span className="capitalize">{resource}</span>
                <span className="text-green-400 font-semibold">
                  +{Math.floor(amount)} {resource.charAt(0).toUpperCase() + resource.slice(1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Production breakdown (optional) */}
        <div data-testid="production-breakdown" className="text-sm text-gray-400 mb-6">
          <p>Your bots worked hard while you were away!</p>
        </div>

        <button
          data-testid="welcome-back-claim"
          onClick={handleClaim}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
        >
          Claim Resources
        </button>

        {/* Celebration particles */}
        <div data-testid="celebration-particles" className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.6,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
