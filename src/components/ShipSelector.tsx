'use client';

import { Orientation, ShipTemplate } from '@/lib/types';
import { SHIPS } from '@/lib/gameLogic';

interface ShipSelectorProps {
  placedShipIds: Set<string>;
  selectedShip: ShipTemplate | null;
  orientation: Orientation;
  onSelectShip: (ship: ShipTemplate) => void;
  onRotate: () => void;
  onAutoPlace: () => void;
  onReset: () => void;
}

export function ShipSelector({
  placedShipIds, selectedShip, orientation,
  onSelectShip, onRotate, onAutoPlace, onReset,
}: ShipSelectorProps) {
  return (
    <div className="glass-panel p-4 flex flex-col gap-3 min-w-[200px]">
      <h3 className="text-cyan-400 font-bold text-sm tracking-widest uppercase text-center">
        Your Fleet
      </h3>

      <div className="flex flex-col gap-2">
        {SHIPS.map(ship => {
          const placed = placedShipIds.has(ship.id);
          const selected = selectedShip?.id === ship.id;
          return (
            <button
              key={ship.id}
              onClick={() => !placed && onSelectShip(ship)}
              disabled={placed}
              className={`
                flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all duration-200
                ${placed
                  ? 'border-green-800/50 bg-green-900/20 text-green-600/60 cursor-default'
                  : selected
                  ? 'border-cyan-400/70 bg-cyan-400/10 text-cyan-300 shadow-[0_0_12px_rgba(0,180,216,0.3)]'
                  : 'border-blue-800/50 bg-blue-900/30 text-blue-300 hover:border-blue-500/70 hover:bg-blue-800/40 cursor-pointer'
                }
              `}
            >
              <span className="text-base">{ship.emoji}</span>
              <div className="flex-1">
                <div className="text-xs font-semibold">{ship.name}</div>
                <div className="flex gap-1 mt-1">
                  {Array.from({ length: ship.size }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-3 h-2 rounded-sm ${placed ? 'bg-green-700/50' : selected ? 'bg-cyan-400/70' : 'bg-blue-600/60'}`}
                    />
                  ))}
                </div>
              </div>
              {placed && (
                <span className="text-green-500 text-xs">✓</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="border-t border-blue-800/40 pt-3 flex flex-col gap-2">
        <button
          onClick={onRotate}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-700/50 bg-blue-900/30 text-blue-300 hover:border-cyan-500/50 hover:bg-cyan-900/20 hover:text-cyan-300 transition-all duration-200 text-sm"
        >
          <span>🔄</span>
          <span>Rotate ({orientation === 'horizontal' ? 'H' : 'V'})</span>
          <span className="text-xs text-blue-500/60 ml-auto">R</span>
        </button>
        <button
          onClick={onAutoPlace}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-blue-700/50 bg-blue-900/30 text-blue-300 hover:border-yellow-500/50 hover:bg-yellow-900/20 hover:text-yellow-300 transition-all duration-200 text-sm"
        >
          <span>⚡</span>
          <span>Auto-Place</span>
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-red-900/50 bg-red-950/20 text-red-400/70 hover:border-red-700/70 hover:bg-red-900/20 hover:text-red-300 transition-all duration-200 text-sm"
        >
          <span>↩</span>
          <span>Reset</span>
        </button>
      </div>
    </div>
  );
}
