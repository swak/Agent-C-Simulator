'use client';

import { ReactNode } from 'react';

export interface TooltipProps {
  children: ReactNode;
  visible: boolean;
  x?: number;
  y?: number;
}

export function Tooltip({ children, visible, x = 0, y = 0 }: TooltipProps) {
  if (!visible) return null;

  return (
    <div
      data-testid="tooltip"
      className="fixed bg-gray-900/95 text-white px-3 py-2 rounded text-sm shadow-lg backdrop-blur-sm z-50 pointer-events-none max-w-xs"
      style={{ left: x, top: y }}
      role="tooltip"
    >
      {children}
    </div>
  );
}
