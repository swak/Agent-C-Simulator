'use client';

import { useGameStore } from '@/stores/game-state';

interface InventoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InventoryPanel({ isOpen, onClose }: InventoryPanelProps) {
  const inventory = useGameStore((s) => s.inventory);

  if (!isOpen) return null;

  return (
    <div
      data-testid="inventory-panel"
      className="fixed inset-y-0 right-0 w-96 bg-gray-900/95 backdrop-blur-md text-white shadow-2xl z-40 overflow-y-auto"
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

        {inventory.length === 0 ? (
          <div className="text-gray-400 text-center py-8">
            No items in inventory
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {inventory.map((item) => (
              <div
                key={item.id}
                data-testid="inventory-item"
                data-item-type={item.type}
                className={`bg-gray-800 p-4 rounded-lg hover:bg-gray-700 cursor-pointer inventory-${item.type}`}
              >
                <div
                  data-testid={`inventory-${item.type}`}
                  className="font-semibold capitalize"
                >
                  {item.type}
                </div>
                {item.quantity && (
                  <div className="text-sm text-gray-400">x{item.quantity}</div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
