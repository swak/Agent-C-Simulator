'use client';

import { useGameStore, Bot } from '@/stores/game-state';

interface BotCustomizerProps {
  botId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function BotCustomizer({ botId, isOpen, onClose }: BotCustomizerProps) {
  const bots = useGameStore((s) => s.bots);
  const bot = bots.find((b) => b.id === botId);

  if (!isOpen || !bot) return null;

  return (
    <div
      data-testid="bot-detail-panel"
      className="fixed bottom-0 left-0 right-0 w-full rounded-t-2xl md:bottom-auto md:left-auto md:right-4 md:top-1/2 md:-translate-y-1/2 md:w-80 md:rounded-lg bg-gray-900/95 backdrop-blur-md shadow-2xl text-white z-40 p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold capitalize">{bot.type} Bot</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white"
          aria-label="Close bot details"
        >
          ✕
        </button>
      </div>

      {/* Bot stats */}
      <div className="space-y-3 mb-6">
        <StatDisplay label="Speed" value={1.0} testId="bot-stat-speed" />
        <StatDisplay label="Capacity" value={10} testId="bot-stat-capacity" />
        <StatDisplay label="Efficiency" value={1.0} testId="bot-stat-efficiency" />
        <StatDisplay label="Energy" value={bot.energy} testId="bot-stat-energy" />
      </div>

      {/* Upgrade slots */}
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Upgrades</h3>
        <div className="space-y-2">
          <div
            data-testid="bot-upgrade-slot"
            className="p-3 bg-gray-800 rounded border-2 border-dashed border-gray-600 text-center text-sm text-gray-400"
          >
            Empty Slot
          </div>
          <div
            data-testid="bot-upgrade-slot"
            className="p-3 bg-gray-800 rounded border-2 border-dashed border-gray-600 text-center text-sm text-gray-400"
          >
            Empty Slot
          </div>
        </div>
      </div>

      {/* Color customization */}
      <div className="mb-4">
        <h3 className="font-semibold mb-2">Appearance</h3>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="text-xs text-gray-400">Primary Color</label>
            <input
              type="color"
              className="w-full h-10 rounded cursor-pointer"
              defaultValue="#3b82f6"
            />
          </div>
          <div>
            <label className="text-xs text-gray-400">Secondary Color</label>
            <input
              type="color"
              className="w-full h-10 rounded cursor-pointer"
              defaultValue="#8b5cf6"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatDisplay({
  label,
  value,
  testId,
}: {
  label: string;
  value: number;
  testId: string;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-sm text-gray-400">{label}</span>
      <span data-testid={testId} className="font-mono font-semibold">
        {typeof value === 'number' ? value.toFixed(1) : value}
      </span>
    </div>
  );
}
