'use client';

import { useState } from 'react';

interface FloatingActionMenuProps {
  onCraftClick: () => void;
  onTechTreeClick: () => void;
  onInventoryClick: () => void;
}

export function FloatingActionMenu({
  onCraftClick,
  onTechTreeClick,
  onInventoryClick,
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 right-4 z-30 md:hidden">
      {/* Menu items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 space-y-2 mb-2">
          <button
            data-testid="menu-tech-tree"
            onClick={() => {
              onTechTreeClick();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-800 w-full"
            aria-label="Open tech tree"
          >
            <span>🌳</span>
            <span className="text-sm">Tech Tree</span>
          </button>
          <button
            data-testid="fab-craft"
            onClick={() => {
              onCraftClick();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-800 w-full"
            aria-label="Open crafting"
          >
            <span>🔨</span>
            <span className="text-sm">Craft</span>
          </button>
          <button
            data-testid="menu-item"
            onClick={() => {
              onInventoryClick();
              setIsOpen(false);
            }}
            className="flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm text-white px-4 py-3 rounded-full shadow-lg hover:bg-gray-800 w-full"
            aria-label="Open inventory"
          >
            <span>🎒</span>
            <span className="text-sm">Inventory</span>
          </button>
        </div>
      )}

      {/* Main FAB button */}
      <button
        data-testid="fab-menu"
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl"
        aria-label="Open menu"
      >
        {isOpen ? '✕' : '+'}
      </button>
    </div>
  );
}
