'use client';

import { useState } from 'react';
import { useGameStore, InventoryItem } from '@/stores/game-state';
import { getWorldInstance } from '@/ecs/world-instance';
import { applyUpgrade, BotEntity } from '@/ecs/entities/bot';
import { UPGRADE_TYPES, MAX_UPGRADES_PER_BOT } from '@/utils/constants';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryPanel({ isOpen, onClose }: InventoryPanelProps) {
  const inventory = useGameStore((s) => s.inventory);
  const bots = useGameStore((s) => s.bots);
  const removeInventoryItem = useGameStore((s) => s.removeInventoryItem);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  if (!isOpen) return null;

  const isUpgradeItem = (type: string): boolean =>
    (UPGRADE_TYPES as readonly string[]).includes(type);

  function handleItemClick(item: InventoryItem): void {
    if (isUpgradeItem(item.type)) {
      setSelectedItem(item);
    }
  }

  function handleApplyToBot(botId: string): void {
    if (!selectedItem) return;

    const world = getWorldInstance();
    if (!world) return;

    // Find the ECS entity for this bot
    const ecsId = parseInt(botId.replace('bot-', ''), 10);
    const entity = world.entities.find((e) => e.id === ecsId) as BotEntity | undefined;
    if (!entity) return;

    const success = applyUpgrade(entity, selectedItem.type);
    if (success) {
      removeInventoryItem(selectedItem.id);
      const typeName = selectedItem.type.replace('-', ' ');
      const botType = entity.botType || 'bot';
      setToast(`${typeName} applied to ${botType}!`);
      setTimeout(() => setToast(null), 2000);
    }

    setSelectedItem(null);
  }

  function handleCancelApply(): void {
    setSelectedItem(null);
  }

  return (
    <div
      data-testid="inventory-panel"
      className="fixed inset-y-0 right-0 w-full md:w-96 bg-gray-900/95 backdrop-blur-md text-white shadow-2xl z-40 overflow-y-auto"
      role="dialog"
      aria-label="Inventory panel"
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Inventory</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
            aria-label="Close inventory"
          >
            ✕
          </button>
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="mb-4 p-3 bg-green-800/80 rounded-lg text-sm text-green-200 text-center">
            {toast}
          </div>
        )}

        {/* Bot picker overlay */}
        {selectedItem && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-yellow-500/50">
            <div className="text-sm text-yellow-400 mb-3">
              Apply {selectedItem.type.replace('-', ' ')} to which bot?
            </div>
            <div className="space-y-2">
              {bots.map((bot) => {
                const upgradeCount = bot.upgrades?.length ?? 0;
                const atCap = upgradeCount >= MAX_UPGRADES_PER_BOT;
                return (
                  <button
                    key={bot.id}
                    onClick={() => handleApplyToBot(bot.id)}
                    disabled={atCap}
                    className={`w-full text-left p-2 rounded text-sm ${
                      atCap
                        ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                        : 'bg-gray-700 hover:bg-gray-600 cursor-pointer'
                    }`}
                  >
                    <span className="capitalize font-medium">{bot.type}</span>
                    <span className="text-gray-400 ml-2">
                      ({upgradeCount}/{MAX_UPGRADES_PER_BOT} upgrades)
                    </span>
                  </button>
                );
              })}
            </div>
            <button
              onClick={handleCancelApply}
              className="mt-3 text-sm text-gray-400 hover:text-white"
            >
              Cancel
            </button>
          </div>
        )}

        {inventory.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No items in inventory
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {inventory.map((item) => {
              const isUpgrade = isUpgradeItem(item.type);
              return (
                <div
                  key={item.id}
                  data-testid="inventory-item"
                  data-item-type={item.type}
                  onClick={() => handleItemClick(item)}
                  className={`bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer inventory-${item.type} ${
                    isUpgrade ? 'border border-yellow-500/30' : ''
                  } ${selectedItem?.id === item.id ? 'ring-2 ring-yellow-400' : ''}`}
                >
                  <div
                    data-testid={`inventory-${item.type}`}
                    className="font-semibold capitalize"
                  >
                    {item.type.replace('-', ' ')}
                  </div>
                  {item.quantity && (
                    <div className="text-sm text-gray-400">x{item.quantity}</div>
                  )}
                  {isUpgrade && (
                    <div className="text-xs text-yellow-500 mt-1">Click to apply</div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
