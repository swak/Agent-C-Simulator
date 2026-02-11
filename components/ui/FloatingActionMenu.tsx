'use client';

import { useState } from 'react';
import { useGameStore } from '@/stores/game-state';

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
  const selectNextBot = useGameStore((s) => s.selectNextBot);
  const selectPreviousBot = useGameStore((s) => s.selectPreviousBot);

  return (
    <div className="fixed bottom-4 right-4 z-30 md:hidden flex flex-col items-end gap-2">
      {/* Bot prev/next buttons */}
      <div className="flex gap-2">
        <button
          onClick={selectPreviousBot}
          className="w-12 h-12 bg-gray-900/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-gray-800 flex items-center justify-center"
          aria-label="Previous bot"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={selectNextBot}
          className="w-12 h-12 bg-gray-900/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-gray-800 flex items-center justify-center"
          aria-label="Next bot"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Menu items */}
      {isOpen && (
        <div className="space-y-2">
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
        className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center text-2xl self-end"
        aria-label="Open menu"
      >
        {isOpen ? '✕' : '+'}
      </button>
    </div>
  );
}
