'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-state';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const [reducedMotion, setReducedMotion] = useState(false);
  const resetGame = useGameStore((state) => state.resetGame);

  if (!isOpen) return null;

  const handleReset = () => {
    resetGame();
    window.location.reload();
  };

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 rounded-lg shadow-2xl p-6 max-w-md w-full text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close settings"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Reduced motion toggle */}
          <label className="flex items-center justify-between cursor-pointer">
            <span>Reduced Motion</span>
            <input
              type="checkbox"
              data-testid="setting-reduced-motion"
              checked={reducedMotion}
              onChange={(e) => setReducedMotion(e.target.checked)}
              className="w-12 h-6 bg-gray-700 rounded-full relative appearance-none cursor-pointer checked:bg-blue-600"
            />
          </label>

          {/* Reset game */}
          <div className="pt-2">
            <button
              data-testid="reset-game-button"
              onClick={handleReset}
              className="w-full py-2 px-4 bg-red-700 hover:bg-red-600 rounded text-sm font-medium transition-colors"
            >
              Reset Game
            </button>
            <p className="text-xs text-gray-500 mt-1">Clears save data and restarts</p>
          </div>
        </div>

        {/* Branding footer */}
        <div className="mt-8 pt-4 border-t border-gray-700 text-center text-xs text-gray-500">
          <p>Agent-C Simulator v0.1.0</p>
          <p className="mt-1">Designed by bots. Built by bots.</p>
          <p className="mt-1">Powered by <a href="https://github.com/rivermark-research/miniature-guacamole" className="text-cyan-400 hover:underline" target="_blank" rel="noopener noreferrer">miniature-guacamole</a></p>
        </div>
      </div>
    </div>
  );
}

export function SettingsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      data-testid="settings-button"
      onClick={onClick}
      className="fixed bottom-4 right-4 w-12 h-12 bg-gray-900/80 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-gray-800 shadow-lg z-30"
      aria-label="Open settings"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    </button>
  );
}
