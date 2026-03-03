'use client';

import { PlacedShip } from '@/lib/types';
import { SHIPS } from '@/lib/gameLogic';

interface FleetStatusProps {
  ships: PlacedShip[];
  label: string;
  side: 'player' | 'ai';
}

export function FleetStatus({ ships, label, side }: FleetStatusProps) {
  if (ships.length === 0) return null;

  const alive = ships.filter(s => !s.sunk).length;
  const total = ships.length;

  return (
    <div className="glass-panel p-3 min-w-[160px]">
      <div className="flex items-center justify-between mb-2">
        <h4 className={`text-xs font-bold tracking-widest uppercase ${side === 'player' ? 'text-cyan-400/80' : 'text-red-400/80'}`}>
          {label}
        </h4>
        <span className={`text-xs font-mono ${alive === 0 ? 'text-red-400' : 'text-green-400'}`}>
          {alive}/{total}
        </span>
      </div>
      <div className="flex flex-col gap-1.5">
        {SHIPS.map(template => {
          const ship = ships.find(s => s.id === template.id);
          if (!ship) return null;
          return (
            <div key={template.id} className="flex items-center gap-2">
              <span className="text-sm w-5 text-center">{template.emoji}</span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: ship.size }).map((_, i) => {
                  const isHit = i < ship.hits;
                  return (
                    <div
                      key={i}
                      className={`
                        h-2 flex-1 rounded-sm transition-all duration-300
                        ${ship.sunk
                          ? 'bg-red-900/80'
                          : isHit
                          ? 'bg-red-500/80'
                          : side === 'player'
                          ? 'bg-slate-500/60'
                          : 'bg-slate-700/40'
                        }
                      `}
                    />
                  );
                })}
              </div>
              {ship.sunk && <span className="text-xs text-red-500">✕</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
