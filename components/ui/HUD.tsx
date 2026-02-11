'use client';

import { useGameStore } from '@/stores/game-state';
import { useState } from 'react';
import { getWorldInstance } from '@/ecs/world-instance';
import { createBot } from '@/ecs/entities/bot';

export function HUD() {
  const resources = useGameStore((s) => s.resources);
  const bots = useGameStore((s) => s.bots);
  const addBot = useGameStore((s) => s.addBot);
  const [selectedBotId, setSelectedBotId] = useState<string | null>(null);

  const handleAddBot = () => {
    const world = getWorldInstance();
    if (world) {
      createBot(world, { type: 'miner', position: { x: 0, y: 0.5, z: 0 } });
    } else {
      addBot({ type: 'miner', status: 'idle' });
    }
  };

  const handleSelectBot = (botId: string) => {
    setSelectedBotId(botId);
  };

  return (
    <div className="fixed inset-0 pointer-events-none z-10">
      {/* Resource counters - top-left */}
      <div className="absolute top-4 left-4 space-y-2 pointer-events-auto">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-3 text-white shadow-lg">
          <div className="space-y-1">
            <ResourceDisplay
              type="wood"
              amount={resources.wood}
              icon="triangle"
            />
            <ResourceDisplay
              type="stone"
              amount={resources.stone}
              icon="circle"
            />
            <ResourceDisplay
              type="iron"
              amount={resources.iron}
              icon="square"
            />
            <ResourceDisplay
              type="crystals"
              amount={resources.crystals}
              icon="diamond"
            />
          </div>
        </div>
      </div>

      {/* Bot roster - right side */}
      <div className="absolute top-4 right-4 pointer-events-auto">
        <div
          data-testid="bot-roster"
          className="bg-gray-900/80 backdrop-blur-sm rounded-lg p-2 md:p-3 text-white shadow-lg w-48 md:w-64"
          role="navigation"
          aria-label="Bot roster"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Bots ({bots.length})</h2>
            <button
              data-testid="bot-roster-add"
              onClick={handleAddBot}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs"
              aria-label="Add bot"
            >
              + Add
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {bots.map((bot) => (
              <div
                key={bot.id}
                data-testid="bot-item"
                className={`p-2 rounded cursor-pointer transition-colors ${
                  selectedBotId === bot.id
                    ? 'bg-blue-600 selected'
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
                onClick={() => handleSelectBot(bot.id)}
                role="button"
                tabIndex={0}
                aria-label={`Bot ${bot.type}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BotStatusIcon status={bot.status} />
                    <span className="text-sm capitalize">{bot.type}</span>
                  </div>
                  <span className="text-xs text-gray-400">{bot.energy}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Keyboard shortcuts hint - bottom-center */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto hidden md:block">
        <div className="bg-gray-900/80 backdrop-blur-sm rounded-lg px-4 py-2 text-white shadow-lg">
          <div className="flex gap-4 text-xs">
            <span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">C</kbd> Craft
            </span>
            <span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">T</kbd> Tech
            </span>
            <span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">I</kbd> Inventory
            </span>
            <span>
              <kbd className="bg-gray-700 px-2 py-1 rounded">Q/E</kbd> Cycle Bots
            </span>
          </div>
        </div>
      </div>

      {/* Watermark - desktop only */}
      <div className="absolute bottom-2 left-2 text-[10px] text-white/20 hidden md:block pointer-events-none">
        designed by bots // miniature-guacamole
      </div>

      {/* Hidden button for testing */}
      <button
        data-testid="add-bot-button"
        onClick={handleAddBot}
        className="hidden"
        aria-label="Add bot (test)"
      />
    </div>
  );
}

function ResourceDisplay({
  type,
  amount,
  icon,
}: {
  type: string;
  amount: number;
  icon: 'triangle' | 'circle' | 'square' | 'diamond';
}) {
  return (
    <div className="flex items-center gap-2">
      <div
        data-testid={`resource-icon-${type}`}
        data-shape={icon}
        className="w-4 h-4"
        aria-hidden="true"
      >
        {icon === 'triangle' && <TriangleIcon />}
        {icon === 'circle' && <CircleIcon />}
        {icon === 'square' && <SquareIcon />}
        {icon === 'diamond' && <DiamondIcon />}
      </div>
      <span className="capitalize text-sm">{type}:</span>
      <span data-testid={`resource-${type}`} className="font-mono">
        {Math.floor(amount)}
      </span>
    </div>
  );
}

function BotStatusIcon({ status }: { status: string }) {
  const icons = {
    idle: 'M',
    working: 'W',
    moving: '>',
    returning: '<',
    blocked: 'X',
  };

  return (
    <div
      data-testid="bot-status"
      data-icon={status}
      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
        status === 'working'
          ? 'bg-green-500'
          : status === 'blocked'
          ? 'bg-red-500'
          : 'bg-gray-600'
      }`}
    >
      <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor">
        <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle" fontSize="10">
          {icons[status as keyof typeof icons] || '?'}
        </text>
      </svg>
    </div>
  );
}

function TriangleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="text-yellow-500">
      <path d="M8 2 L14 14 L2 14 Z" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="text-gray-400">
      <circle cx="8" cy="8" r="6" />
    </svg>
  );
}

function SquareIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="text-orange-500">
      <rect x="3" y="3" width="10" height="10" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="text-purple-500">
      <path d="M8 2 L14 8 L8 14 L2 8 Z" />
    </svg>
  );
}
