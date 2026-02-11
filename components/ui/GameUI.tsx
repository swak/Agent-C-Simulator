'use client';

import { useState, useEffect } from 'react';
import { useGameStore } from '@/stores/game-state';
import { HUD } from './HUD';
import { CraftingPanel } from './CraftingPanel';
import { TechTree } from './TechTree';
import { InventoryPanel } from './InventoryPanel';
import { WelcomeBack } from './WelcomeBack';
import { BotCustomizer } from './BotCustomizer';
import { SettingsPanel, SettingsButton } from './SettingsPanel';
import { FloatingActionMenu } from './FloatingActionMenu';

export function GameUI() {
  const [craftingOpen, setCraftingOpen] = useState(false);
  const [techTreeOpen, setTechTreeOpen] = useState(false);
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [botCustomizerOpen, setBotCustomizerOpen] = useState(false);

  const bots = useGameStore((s) => s.bots);
  const selectedBotId = useGameStore((s) => s.selectedBotId);
  const setSelectedBotId = useGameStore((s) => s.setSelectedBotId);
  const selectNextBot = useGameStore((s) => s.selectNextBot);
  const selectPreviousBot = useGameStore((s) => s.selectPreviousBot);

  // Create hidden status indicators for e2e tests
  const workingBots = bots.filter((b) => b.status === 'working');
  const returningBots = bots.filter((b) => b.status === 'returning');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close all modals on Escape, clear bot selection
      if (e.key === 'Escape') {
        setCraftingOpen(false);
        setTechTreeOpen(false);
        setInventoryOpen(false);
        setSettingsOpen(false);
        setBotCustomizerOpen(false);
        setSelectedBotId(null);
        return;
      }

      // Toggle panels with keyboard shortcuts
      if (e.key === 'c' || e.key === 'C') {
        setCraftingOpen((prev) => !prev);
      } else if (e.key === 't' || e.key === 'T') {
        setTechTreeOpen((prev) => !prev);
      } else if (e.key === 'i' || e.key === 'I') {
        setInventoryOpen((prev) => !prev);
      }

      // Bot selection with number keys
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key) - 1;
        if (index < bots.length) {
          setSelectedBotId(bots[index].id);
        }
      }

      // Cycle bots with Q/E
      if (e.key === 'q' || e.key === 'Q') {
        selectPreviousBot();
      } else if (e.key === 'e' || e.key === 'E') {
        selectNextBot();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [bots, selectedBotId, setSelectedBotId, selectNextBot, selectPreviousBot]);

  // Process crafting queue
  useEffect(() => {
    const interval = setInterval(() => {
      const processCraftingQueue = useGameStore.getState().processCraftingQueue;
      processCraftingQueue(100); // Process 100ms worth of progress
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <HUD />
      <WelcomeBack />
      <CraftingPanel
        isOpen={craftingOpen}
        onClose={() => setCraftingOpen(false)}
      />
      <TechTree isOpen={techTreeOpen} onClose={() => setTechTreeOpen(false)} />
      <InventoryPanel
        isOpen={inventoryOpen}
        onClose={() => setInventoryOpen(false)}
      />
      <BotCustomizer
        botId={selectedBotId}
        isOpen={botCustomizerOpen}
        onClose={() => setBotCustomizerOpen(false)}
      />
      <SettingsPanel
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
      <SettingsButton onClick={() => setSettingsOpen(true)} />

      {/* Mobile FAB menu */}
      <FloatingActionMenu
        onCraftClick={() => setCraftingOpen(true)}
        onTechTreeClick={() => setTechTreeOpen(true)}
        onInventoryClick={() => setInventoryOpen(true)}
      />

      {/* Hidden status indicators for e2e tests */}
      {workingBots.length > 0 && (
        <div data-testid="bot-status-working" className="hidden" />
      )}
      {returningBots.length > 0 && (
        <div data-testid="bot-status-returning" className="hidden" />
      )}
    </>
  );
}
