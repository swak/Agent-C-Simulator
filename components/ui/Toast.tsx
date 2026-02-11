'use client';

import { useEffect, useState } from 'react';

export interface ToastProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
}

export function Toast({ message, visible, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const timer = setTimeout(onClose, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  if (!visible) return null;

  return (
    <div
      data-testid="notification-toast"
      className="fixed top-4 right-4 bg-gray-900/90 text-white px-6 py-3 rounded-lg shadow-lg backdrop-blur-sm z-50 animate-fade-in"
      role="status"
      aria-live="polite"
    >
      {message}
    </div>
  );
}
