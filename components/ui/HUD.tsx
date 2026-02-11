'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-state';
import { getWorldInstance } from '@/ecs/world-instance';
import { createBot } from '@/ecs/entities/bot';
import { BOT_CONSTRUCTION_COSTS } from '@/utils/constants';
import type { BotType } from '@/ecs/world';

const BOT_TYPE_LABELS: Record<string, string> = {
  miner: 'Miner',
  hauler: 'Hauler',
  crafter: 'Crafter',
  scout: 'Scout',
};

export function HUD() {
  const resources = useGameStore((s) => s.resources);
  const bots = useGameStore((s) => s.bots);
  const addBot = useGameStore((s) => s.addBot);
  const selectedBotId = useGameStore((s) => s.selectedBotId);
  const setSelectedBotId = useGameStore((s) => s.setSelectedBotId);
  const [showBotBuilder, setShowBotBuilder] = useState(false);

  const handleAddBot = () => {
    const world = getWorldInstance();
    if (world) {
      createBot(world, { type: 'miner', position: { x: 0, y: 0.5, z: 0 } });
    } else {
      addBot({ type: 'miner', status: 'idle' });
    }
  };

  const handleSelectBot = (botId: string) => {
    setSelectedBotId(selectedBotId === botId ? null : botId);
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
            <h2 className="text-sm font-semibold">Bots ({bots.length}/10)</h2>
            <button
              data-testid="bot-roster-add"
              onClick={() => setShowBotBuilder(!showBotBuilder)}
              disabled={bots.length >= 10}
              className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
              aria-label="Build bot"
            >
              + Build
            </button>
          </div>

          {showBotBuilder && <BotBuilder onClose={() => setShowBotBuilder(false)} />}

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
                  <span className="text-xs text-gray-400">{Math.floor(bot.energy)}%</span>
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

function BotBuilder({ onClose }: { onClose: () => void }) {
  const resources = useGameStore((s) => s.resources);
  const bots = useGameStore((s) => s.bots);
  const techTree = useGameStore((s) => s.techTree);
  const inventory = useGameStore((s) => s.inventory);
  const consumeBotCost = useGameStore((s) => s.consumeBotCost);

  const botTypes = Object.keys(BOT_CONSTRUCTION_COSTS) as BotType[];

  const handleBuild = (botType: BotType) => {
    const success = consumeBotCost(botType);
    if (success) {
      const world = getWorldInstance();
      if (world) {
        createBot(world, { type: botType, position: { x: 0, y: 0.5, z: 0 } });
      }
      onClose();
    }
  };

  return (
    <div data-testid="bot-builder" className="mb-3 bg-gray-800/90 rounded-lg p-3 border border-gray-600">
      <div className="text-xs font-semibold text-gray-300 mb-2">Build Bot</div>
      <div className="space-y-2">
        {botTypes.map((botType) => {
          const cost = BOT_CONSTRUCTION_COSTS[botType];
          const techNode = techTree.nodes.find((n) => n.id === cost.techRequired);
          const techUnlocked = techNode?.unlocked ?? false;
          const atCap = bots.length >= 10;

          const hasResources = Object.entries(cost.resources).every(
            ([resource, amount]) =>
              (resources[resource as keyof typeof resources] || 0) >= amount
          );

          const hasComponents = cost.components.every((comp) =>
            inventory.some((item) => item.type === comp)
          );

          const canBuild = techUnlocked && hasResources && hasComponents && !atCap;

          return (
            <div key={botType} className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{BOT_TYPE_LABELS[botType]}</span>
                <button
                  data-testid={`build-${botType}`}
                  onClick={() => handleBuild(botType)}
                  disabled={!canBuild}
                  className="bg-green-600 hover:bg-green-700 text-white px-2 py-0.5 rounded text-xs disabled:bg-gray-600 disabled:cursor-not-allowed"
                >
                  Build
                </button>
              </div>
              <div className="flex flex-wrap gap-1 text-[10px]">
                {Object.entries(cost.resources).map(([resource, amount]) => {
                  const have = resources[resource as keyof typeof resources] || 0;
                  const sufficient = have >= amount;
                  return (
                    <span key={resource} className={sufficient ? 'text-gray-400' : 'text-red-400'}>
                      {amount} {resource}
                    </span>
                  );
                })}
                {cost.components.map((comp) => {
                  const has = inventory.some((item) => item.type === comp);
                  return (
                    <span key={comp} className={has ? 'text-green-400' : 'text-red-400'}>
                      1 {comp}
                    </span>
                  );
                })}
              </div>
              {!techUnlocked && (
                <div className="text-[10px] text-yellow-400">
                  Requires: {techNode?.name || cost.techRequired}
                </div>
              )}
            </div>
          );
        })}
      </div>
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
  const icons: Record<string, string> = {
    idle: 'M',
    working: 'W',
    moving: '>',
    returning: '<',
    blocked: 'X',
    recharging: 'R',
  };

  const colorClass =
    status === 'working'
      ? 'bg-green-500'
      : status === 'blocked'
      ? 'bg-red-500'
      : status === 'recharging'
      ? 'bg-cyan-500'
      : 'bg-gray-600';

  return (
    <div
      data-testid="bot-status"
      data-icon={status}
      className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${colorClass}`}
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
