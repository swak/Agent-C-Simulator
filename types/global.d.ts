import type { AudioManager } from '@/lib/audio';

interface PerformanceMemory {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

declare global {
  interface Performance {
    memory?: PerformanceMemory;
  }

  interface Window {
    game?: {
      debug: {
        addResources: (resources: Record<string, number>) => void;
        setResources: (resources: Record<string, number>) => void;
        addBot: (config: Record<string, unknown>) => void;
        unlockTechNode: (nodeId: string) => void;
        setProductionRate: (resource: string, rate: number) => void;
        addInventoryItem: (type: string) => void;
      };
      audio?: AudioManager;
    };
  }
}

export {};
