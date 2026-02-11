'use client';

import { useGameStore } from '@/stores/game-state';
import { useState, useEffect } from 'react';
import { audioManager } from '@/lib/audio';
import { Toast } from './Toast';

const RECIPES = [
  {
    id: 'speed-boost',
    name: 'Speed Boost',
    category: 'upgrades',
    cost: { wood: 10, stone: 5 },
    duration: 3000,
  },
  {
    id: 'capacity-upgrade',
    name: 'Capacity Upgrade',
    category: 'upgrades',
    cost: { wood: 15, stone: 10 },
    duration: 5000,
  },
  {
    id: 'basic-component',
    name: 'Basic Component',
    category: 'components',
    cost: { wood: 5 },
    duration: 3000,
  },
  {
    id: 'advanced-component',
    name: 'Advanced Component',
    category: 'components',
    cost: { wood: 20, stone: 15, iron: 5 },
    duration: 8000,
  },
  {
    id: 'gear-component',
    name: 'Gear Component',
    category: 'components',
    cost: { iron: 10, stone: 5 },
    duration: 4000,
  },
  {
    id: 'quick-craft',
    name: 'Quick Craft',
    category: 'components',
    cost: { wood: 2 },
    duration: 1000,
  },
];

interface CraftingPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CraftingPanel({ isOpen, onClose }: CraftingPanelProps) {
  const resources = useGameStore((s) => s.resources);
  const canCraftRecipe = useGameStore((s) => s.canCraftRecipe);
  const craftItem = useGameStore((s) => s.craftItem);
  const queueCraft = useGameStore((s) => s.queueCraft);
  const craftingQueue = useGameStore((s) => s.craftingQueue);

  const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showMultipleCraft, setShowMultipleCraft] = useState(false);
  const [craftQuantity, setCraftQuantity] = useState(1);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  const filteredRecipes =
    selectedCategory === 'all'
      ? RECIPES
      : RECIPES.filter((r) => r.category === selectedCategory);

  const handleCraft = (recipeId: string) => {
    const result = craftItem(recipeId);
    if (result) {
      const recipe = RECIPES.find((r) => r.id === recipeId);
      audioManager.play('craft-complete');
      setToastMessage(`${recipe?.name} crafted!`);
      setShowToast(true);
    }
  };

  const handleCraftMultiple = () => {
    if (selectedRecipe && craftQuantity > 0) {
      queueCraft(selectedRecipe, craftQuantity);
      setShowMultipleCraft(false);
      setCraftQuantity(1);
    }
  };

  // Listen for crafting queue completion
  useEffect(() => {
    const interval = setInterval(() => {
      const queue = useGameStore.getState().craftingQueue;
      if (queue.length > 0 && queue[0].progress >= 100) {
        const recipe = RECIPES.find((r) => r.id === queue[0].recipeId);
        audioManager.play('craft-complete');
        setToastMessage(`${recipe?.name} crafted!`);
        setShowToast(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  return (
    <>
      <div
        data-testid="crafting-panel"
        className="fixed inset-y-0 left-0 w-96 bg-gray-900/95 backdrop-blur-md text-white shadow-2xl z-40 overflow-y-auto"
        role="dialog"
        aria-label="Crafting panel"
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Crafting</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
              aria-label="Close crafting panel"
            >
              ✕
            </button>
          </div>

          {/* Category filters */}
          <div className="flex gap-2 mb-4">
            <button
              data-testid="category-all"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === 'all'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            <button
              data-testid="category-components"
              onClick={() => setSelectedCategory('components')}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === 'components'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Components
            </button>
            <button
              data-testid="category-upgrades"
              onClick={() => setSelectedCategory('upgrades')}
              className={`px-3 py-1 rounded text-sm ${
                selectedCategory === 'upgrades'
                  ? 'bg-blue-600'
                  : 'bg-gray-700 hover:bg-gray-600'
              }`}
            >
              Upgrades
            </button>
          </div>

          {/* Recipe list */}
          <div className="space-y-2 mb-6">
            {filteredRecipes.map((recipe) => {
              const canCraft = canCraftRecipe(recipe.id);
              return (
                <div
                  key={recipe.id}
                  data-testid={`recipe-${recipe.id}`}
                  data-category={recipe.category}
                  className={`p-4 rounded-lg cursor-pointer transition-colors ${
                    canCraft
                      ? 'bg-gray-800 hover:bg-gray-700'
                      : 'bg-gray-800/50 locked opacity-60'
                  } ${selectedRecipe === recipe.id ? 'ring-2 ring-blue-500' : ''}`}
                  onClick={() => setSelectedRecipe(recipe.id)}
                >
                  <div className="font-semibold mb-1">{recipe.name}</div>
                  <div
                    data-testid="recipe-cost"
                    className="text-sm text-gray-400"
                  >
                    {Object.entries(recipe.cost)
                      .map(([resource, amount]) => `${amount} ${resource}`)
                      .join(', ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recipe preview */}
          {selectedRecipe && (
            <div
              data-testid="recipe-preview"
              className="bg-gray-800 p-4 rounded-lg mb-4"
            >
              <div data-testid="recipe-detail">
                <h3 className="font-semibold mb-2">
                  {RECIPES.find((r) => r.id === selectedRecipe)?.name}
                </h3>
                <div data-testid="ingredient-list" className="text-sm mb-2">
                  {Object.entries(
                    RECIPES.find((r) => r.id === selectedRecipe)?.cost || {}
                  ).map(([resource, amount]) => (
                    <div key={resource} className="flex justify-between">
                      <span className="capitalize">{resource}</span>
                      <span>
                        {amount} / {resources[resource as keyof typeof resources]}
                      </span>
                    </div>
                  ))}
                </div>
                <div data-testid="output-item" className="text-sm text-green-400">
                  Output: {RECIPES.find((r) => r.id === selectedRecipe)?.name}
                </div>
              </div>
            </div>
          )}

          {/* Craft buttons */}
          {selectedRecipe && (
            <div className="space-y-2">
              <button
                data-testid="craft-button"
                onClick={() => handleCraft(selectedRecipe)}
                disabled={!canCraftRecipe(selectedRecipe)}
                className={`w-full py-3 rounded-lg font-semibold ${
                  canCraftRecipe(selectedRecipe)
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 cursor-not-allowed opacity-50'
                }`}
                aria-label="Craft item"
              >
                Craft
              </button>
              <button
                data-testid="craft-multiple-button"
                onClick={() => setShowMultipleCraft(true)}
                className="w-full py-2 rounded-lg font-semibold bg-gray-700 hover:bg-gray-600"
                aria-label="Craft multiple"
              >
                Craft Multiple
              </button>
            </div>
          )}

          {/* Crafting queue */}
          {craftingQueue.length > 0 && (
            <div data-testid="crafting-queue" className="mt-6">
              <h3 className="font-semibold mb-2">Crafting Queue</h3>
              <div className="space-y-2">
                {craftingQueue.map((item, index) => (
                  <div
                    key={item.id}
                    data-testid="queue-item"
                    className="bg-gray-800 p-3 rounded-lg"
                  >
                    <div className="text-sm mb-1">
                      {RECIPES.find((r) => r.id === item.recipeId)?.name}
                    </div>
                    <div
                      data-testid="progress-bar"
                      className="h-2 bg-gray-700 rounded-full overflow-hidden"
                    >
                      <div
                        className="h-full bg-blue-600 transition-all"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Multiple craft modal */}
      {showMultipleCraft && (
        <div
          data-testid="craft-confirm-modal"
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={() => setShowMultipleCraft(false)}
        >
          <div
            className="bg-gray-900 p-6 rounded-lg shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Craft Multiple</h3>
            <input
              type="number"
              data-testid="craft-quantity-input"
              value={craftQuantity}
              onChange={(e) => setCraftQuantity(parseInt(e.target.value) || 1)}
              min={1}
              max={99}
              className="w-full px-3 py-2 bg-gray-800 rounded mb-4"
            />
            <div className="flex gap-2">
              <button
                data-testid="confirm-craft-button"
                onClick={handleCraftMultiple}
                className="flex-1 bg-blue-600 hover:bg-blue-700 py-2 rounded"
              >
                Confirm
              </button>
              <button
                onClick={() => setShowMultipleCraft(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Craft complete toast */}
      {showToast && (
        <div
          data-testid="craft-complete-toast"
          className="fixed top-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg z-50"
        >
          {toastMessage}
        </div>
      )}
    </>
  );
}
