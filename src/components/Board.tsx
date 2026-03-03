'use client';

import { Board as BoardType, CellData, GamePhase, PlacedShip, ShipTemplate, Orientation } from '@/lib/types';
import { COLS, canPlaceShip, getPreviewCells } from '@/lib/gameLogic';

interface BoardProps {
  board: BoardType;
  ships: PlacedShip[];
  label: string;
  isPlayerBoard: boolean;
  phase: GamePhase;
  selectedShip: ShipTemplate | null;
  orientation: Orientation;
  hoverCell: [number, number] | null;
  onCellClick: (row: number, col: number) => void;
  onCellHover: (row: number, col: number) => void;
  onBoardLeave: () => void;
  disabled?: boolean;
}

export function Board({
  board, label, isPlayerBoard, phase,
  selectedShip, orientation, hoverCell,
  onCellClick, onCellHover, onBoardLeave, disabled,
}: BoardProps) {
  const isSetup = phase === 'setup' && isPlayerBoard;

  // Compute preview cells
  let previewCells: Set<string> = new Set();
  let previewValid = false;
  if (isSetup && selectedShip && hoverCell) {
    const [hr, hc] = hoverCell;
    const cells = getPreviewCells(hr, hc, selectedShip.size, orientation);
    previewValid = canPlaceShip(board, hr, hc, selectedShip.size, orientation);
    cells.forEach(([r, c]) => previewCells.add(`${r}-${c}`));
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <h3 className="text-sm font-bold tracking-widest uppercase text-cyan-400/80">
        {label}
      </h3>
      <div
        className="inline-block select-none"
        onMouseLeave={onBoardLeave}
      >
        {/* Column labels */}
        <div className="flex">
          <div className="board-label" />
          {COLS.map(c => (
            <div key={c} className="board-label text-blue-400/60">{c}</div>
          ))}
        </div>
        {/* Rows */}
        {board.map((row, rowIdx) => (
          <div key={rowIdx} className="flex">
            <div className="board-label text-blue-400/60">{rowIdx + 1}</div>
            {row.map((cell) => {
              const key = `${cell.row}-${cell.col}`;
              const isPreview = previewCells.has(key);
              return (
                <Cell
                  key={key}
                  cell={cell}
                  isPlayerBoard={isPlayerBoard}
                  phase={phase}
                  isPreview={isPreview}
                  previewValid={previewValid}
                  disabled={!!disabled}
                  onClick={() => !disabled && onCellClick(cell.row, cell.col)}
                  onHover={() => !disabled && onCellHover(cell.row, cell.col)}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

interface CellProps {
  cell: CellData;
  isPlayerBoard: boolean;
  phase: GamePhase;
  isPreview: boolean;
  previewValid: boolean;
  disabled: boolean;
  onClick: () => void;
  onHover: () => void;
}

function Cell({ cell, isPlayerBoard, phase, isPreview, previewValid, disabled, onClick, onHover }: CellProps) {
  const { state } = cell;

  // Determine what to show
  const showShip = isPlayerBoard && state === 'ship';
  const isEnemy = !isPlayerBoard;
  const isAttackable = isEnemy && phase === 'battle' && (state === 'empty');
  const isAlreadyHit = state === 'hit' || state === 'miss' || state === 'sunk';

  let bg = '';
  let border = 'border-blue-900/40';
  let cursor = 'cursor-default';
  let extra = '';

  if (isPreview) {
    bg = previewValid
      ? 'bg-cyan-400/40 border-cyan-300/70'
      : 'bg-red-500/40 border-red-400/70';
    cursor = previewValid ? 'cursor-pointer' : 'cursor-not-allowed';
    border = '';
  } else if (state === 'sunk') {
    bg = 'bg-red-900/90 border-red-800';
    border = '';
  } else if (state === 'hit') {
    bg = 'bg-red-600/90 border-red-500 cell-hit';
    border = '';
  } else if (state === 'miss') {
    bg = 'bg-blue-800/40 border-blue-700/40';
    border = '';
  } else if (showShip) {
    bg = 'bg-slate-500/80 border-slate-400/50';
    border = '';
  } else if (isAttackable && !disabled) {
    bg = 'bg-blue-950/60 hover:bg-cyan-500/25 hover:border-cyan-400/50';
    cursor = 'cursor-crosshair';
  } else {
    bg = 'bg-blue-950/60';
  }

  return (
    <button
      className={`board-cell relative flex items-center justify-center border ${border} ${bg} ${cursor} transition-all duration-150 ${extra}`}
      onClick={onClick}
      onMouseEnter={onHover}
      disabled={disabled || isAlreadyHit || (isEnemy && state === 'ship')}
    >
      {state === 'hit' && (
        <span className="text-xs leading-none animate-ping-once">💥</span>
      )}
      {state === 'miss' && (
        <div className="w-2 h-2 rounded-full bg-white/50" />
      )}
      {state === 'sunk' && (
        <span className="text-xs leading-none">☠️</span>
      )}
      {showShip && (
        <div className="w-full h-full bg-gradient-to-br from-slate-400/30 to-slate-600/30 rounded-sm" />
      )}
    </button>
  );
}
