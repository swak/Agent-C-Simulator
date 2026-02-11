'use client';

import { useGameStore } from '@/stores/game-state';
import { useState } from 'react';
import { audioManager } from '@/lib/audio';
import { Toast } from './Toast';

interface TechTreeProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TechTree({ isOpen, onClose }: TechTreeProps) {
  const techTree = useGameStore((s) => s.techTree);
  const unlockTechNode = useGameStore((s) => s.unlockTechNode);
  const getUnlockedNodeCount = useGameStore((s) => s.getUnlockedNodeCount);
  const resources = useGameStore((s) => s.resources);

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [newlyUnlocked, setNewlyUnlocked] = useState<Set<string>>(new Set());

  if (!isOpen) return null;

  const selectedTechNode = techTree.nodes.find((n) => n.id === selectedNode);
  const totalNodes = techTree.nodes.length;
  const unlockedCount = getUnlockedNodeCount();

  const handleUnlock = () => {
    if (!selectedNode) return;

    const success = unlockTechNode(selectedNode);
    if (success) {
      audioManager.play('tech-unlock');
      const node = techTree.nodes.find((n) => n.id === selectedNode);
      setToastMessage(`Unlocked: ${node?.name}`);
      setShowToast(true);
      setNewlyUnlocked(new Set([...newlyUnlocked, selectedNode]));
    }
  };

  const canUnlock = (nodeId: string): boolean => {
    const node = techTree.nodes.find((n) => n.id === nodeId);
    if (!node || node.unlocked) return false;

    // Check prerequisites
    const prerequisitesMet = node.prerequisites.every((prereqId) =>
      techTree.nodes.find((n) => n.id === prereqId)?.unlocked
    );

    if (!prerequisitesMet) return false;

    // Check resources
    return Object.entries(node.cost).every(
      ([resource, amount]) =>
        (resources[resource as keyof typeof resources] || 0) >= (amount || 0)
    );
  };

  return (
    <>
      <div
        data-testid="tech-tree-modal"
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-40"
        onClick={onClose}
      >
        <div
          className="bg-gray-900/95 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-white">Tech Tree</h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white text-2xl"
                aria-label="Close tech tree"
              >
                ✕
              </button>
            </div>
            <div
              data-testid="tech-tree-progress"
              className="mt-2 text-sm text-gray-400"
            >
              {unlockedCount}/{totalNodes} Unlocked
            </div>
          </div>

          {/* Tech tree canvas */}
          <div
            data-testid="tech-tree-canvas"
            className="p-8 overflow-auto"
            style={{ height: 'calc(90vh - 200px)' }}
          >
            <div className="relative min-h-[600px]">
              {/* Render edges first (connections) */}
              {techTree.nodes.map((node) =>
                node.prerequisites.map((prereqId) => (
                  <TechEdge
                    key={`${prereqId}-${node.id}`}
                    from={prereqId}
                    to={node.id}
                    unlocked={node.unlocked}
                  />
                ))
              )}

              {/* Render nodes */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8">
                {techTree.nodes.map((node, index) => {
                  const isNew = newlyUnlocked.has(node.id);
                  const isSelected = selectedNode === node.id;

                  return (
                    <div
                      key={node.id}
                      data-testid={`tech-node-${node.id}`}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        node.unlocked
                          ? 'bg-green-900/30 border-green-500 unlocked'
                          : 'bg-gray-800 border-gray-600 locked'
                      } ${isSelected ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setSelectedNode(node.id)}
                      tabIndex={0}
                      role="button"
                      aria-label={`${node.name} tech node`}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') setSelectedNode(node.id);
                      }}
                    >
                      <div className="font-semibold text-white mb-2">
                        {node.name}
                      </div>
                      {node.description && (
                        <div className="text-xs text-cyan-400 mb-1">{node.description}</div>
                      )}
                      {!node.unlocked && (
                        <div className="text-xs text-gray-400">
                          {Object.entries(node.cost)
                            .map(([resource, amount]) => `${amount} ${resource}`)
                            .join(', ')}
                        </div>
                      )}
                      {isNew && (
                        <div
                          data-testid="new-badge"
                          className="absolute -top-2 -right-2 bg-yellow-500 text-black text-xs px-2 py-1 rounded-full font-bold"
                        >
                          NEW
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Node detail panel */}
          {selectedTechNode && (
            <div
              data-testid="tech-node-detail"
              className="p-6 border-t border-gray-700 bg-gray-800/50"
            >
              <h3 className="text-xl font-bold text-white mb-2">
                {selectedTechNode.name}
              </h3>

              {/* Description */}
              {selectedTechNode.description && (
                <div className="mb-4 text-sm text-cyan-400">{selectedTechNode.description}</div>
              )}

              {/* Prerequisites */}
              {selectedTechNode.prerequisites.length > 0 && (
                <div data-testid="prerequisite-list" className="mb-4 text-sm">
                  <span className="text-gray-400">Requires: </span>
                  {selectedTechNode.prerequisites
                    .map((prereqId) => {
                      const prereq = techTree.nodes.find((n) => n.id === prereqId);
                      return prereq?.name;
                    })
                    .join(', ')}
                </div>
              )}

              {/* Cost */}
              <div className="mb-4 text-sm text-gray-300">
                {Object.entries(selectedTechNode.cost)
                  .map(([resource, amount]) => `${amount} ${resource}`)
                  .join(', ')}
              </div>

              {/* Unlock button */}
              {!selectedTechNode.unlocked && (
                <button
                  data-testid="unlock-button"
                  onClick={handleUnlock}
                  disabled={!canUnlock(selectedNode!)}
                  className={`px-6 py-3 rounded-lg font-semibold ${
                    canUnlock(selectedNode!)
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
                  aria-label="Unlock tech node"
                >
                  {canUnlock(selectedNode!) ? 'Unlock' : 'Requirements not met'}
                </button>
              )}

              {selectedTechNode.unlocked && (
                <div className="text-green-500 font-semibold">✓ Unlocked</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      <Toast
        message={toastMessage}
        visible={showToast}
        onClose={() => setShowToast(false)}
      />
    </>
  );
}

function TechEdge({
  from,
  to,
  unlocked,
}: {
  from: string;
  to: string;
  unlocked: boolean;
}) {
  return (
    <div
      data-testid={`tech-edge-${from}-${to}`}
      className={`absolute h-0.5 ${
        unlocked ? 'bg-green-500' : 'bg-gray-600'
      }`}
      style={{
        width: '100px',
        top: '50%',
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    />
  );
}
