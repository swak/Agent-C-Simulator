'use client';

interface RadialMenuProps {
  visible: boolean;
  x: number;
  y: number;
  onAction: (action: string) => void;
}

export function RadialMenu({ visible, x, y, onAction }: RadialMenuProps) {
  if (!visible) return null;

  const actions = [
    { id: 'gather', label: 'Gather', icon: '⛏️' },
    { id: 'upgrade', label: 'Upgrade', icon: '⬆️' },
    { id: 'move', label: 'Move', icon: '➡️' },
    { id: 'stop', label: 'Stop', icon: '⏸️' },
  ];

  return (
    <div
      data-testid="radial-menu"
      className="fixed z-50 pointer-events-none"
      style={{ left: x, top: y }}
    >
      <div className="relative w-48 h-48 pointer-events-auto">
        {actions.map((action, index) => {
          const angle = (index * 360) / actions.length;
          const radian = (angle * Math.PI) / 180;
          const radius = 60;
          const buttonX = Math.cos(radian) * radius;
          const buttonY = Math.sin(radian) * radius;

          return (
            <button
              key={action.id}
              data-testid={`menu-action-${action.id}`}
              onClick={() => onAction(action.id)}
              className="absolute w-12 h-12 bg-gray-900/90 backdrop-blur-sm text-white rounded-full shadow-lg hover:bg-gray-800 flex items-center justify-center text-xl"
              style={{
                left: `calc(50% + ${buttonX}px)`,
                top: `calc(50% + ${buttonY}px)`,
                transform: 'translate(-50%, -50%)',
              }}
              aria-label={action.label}
            >
              {action.icon}
            </button>
          );
        })}
        {/* Center circle */}
        <div className="absolute left-1/2 top-1/2 w-8 h-8 bg-blue-600 rounded-full transform -translate-x-1/2 -translate-y-1/2" />
      </div>
    </div>
  );
}
