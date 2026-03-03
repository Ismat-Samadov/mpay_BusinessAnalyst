import { Board, CellData, PlacedShip, ShipTemplate, Orientation } from './types';

export const SHIPS: ShipTemplate[] = [
  { id: 'carrier',    name: 'Carrier',    size: 5, emoji: '🚢' },
  { id: 'battleship', name: 'Battleship', size: 4, emoji: '⚓' },
  { id: 'cruiser',    name: 'Cruiser',    size: 3, emoji: '🛥️' },
  { id: 'submarine',  name: 'Submarine',  size: 3, emoji: '🤿' },
  { id: 'destroyer',  name: 'Destroyer',  size: 2, emoji: '⛵' },
];

export const COLS = ['A','B','C','D','E','F','G','H','I','J'];

export function createEmptyBoard(): Board {
  return Array.from({ length: 10 }, (_, row) =>
    Array.from({ length: 10 }, (_, col): CellData => ({ row, col, state: 'empty' }))
  );
}

export function canPlaceShip(
  board: Board,
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): boolean {
  for (let i = 0; i < size; i++) {
    const r = orientation === 'vertical' ? row + i : row;
    const c = orientation === 'horizontal' ? col + i : col;
    if (r < 0 || r >= 10 || c < 0 || c >= 10) return false;
    // Check cell and its neighbours for existing ships
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = r + dr, nc = c + dc;
        if (nr >= 0 && nr < 10 && nc >= 0 && nc < 10) {
          if (board[nr][nc].state === 'ship') return false;
        }
      }
    }
  }
  return true;
}

export function getPreviewCells(
  row: number,
  col: number,
  size: number,
  orientation: Orientation
): [number, number][] {
  const cells: [number, number][] = [];
  for (let i = 0; i < size; i++) {
    cells.push([
      orientation === 'vertical' ? row + i : row,
      orientation === 'horizontal' ? col + i : col,
    ]);
  }
  return cells;
}

export function placeShip(
  board: Board,
  ship: ShipTemplate,
  row: number,
  col: number,
  orientation: Orientation
): { board: Board; placedShip: PlacedShip } {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const cells: [number, number][] = [];
  for (let i = 0; i < ship.size; i++) {
    const r = orientation === 'vertical' ? row + i : row;
    const c = orientation === 'horizontal' ? col + i : col;
    newBoard[r][c].state = 'ship';
    newBoard[r][c].shipId = ship.id;
    cells.push([r, c]);
  }
  return {
    board: newBoard,
    placedShip: { id: ship.id, name: ship.name, size: ship.size, cells, hits: 0, sunk: false },
  };
}

export function attack(
  board: Board,
  ships: PlacedShip[],
  row: number,
  col: number
): { board: Board; ships: PlacedShip[]; hit: boolean; sunk: boolean; shipName?: string } {
  const newBoard = board.map(r => r.map(c => ({ ...c })));
  const cell = newBoard[row][col];
  if (cell.state !== 'ship' && cell.state !== 'empty') {
    return { board: newBoard, ships, hit: false, sunk: false };
  }
  if (cell.state === 'ship') {
    cell.state = 'hit';
    const newShips = ships.map(s => {
      if (s.id !== cell.shipId) return s;
      const hits = s.hits + 1;
      const sunk = hits >= s.size;
      if (sunk) s.cells.forEach(([r, c]) => { newBoard[r][c].state = 'sunk'; });
      return { ...s, hits, sunk };
    });
    const attackedShip = newShips.find(s => s.id === cell.shipId);
    return { board: newBoard, ships: newShips, hit: true, sunk: !!attackedShip?.sunk, shipName: attackedShip?.name };
  }
  cell.state = 'miss';
  return { board: newBoard, ships, hit: false, sunk: false };
}

export function checkWin(ships: PlacedShip[]): boolean {
  return ships.length > 0 && ships.every(s => s.sunk);
}

// Smart AI: hunt (checkerboard) → target → destroy along axis
export function getAiMove(
  board: Board,
  aiHitLog: [number, number][]
): [number, number] {
  // Active hits (cells still showing 'hit', not yet sunk)
  const activeHits = aiHitLog.filter(([r, c]) => board[r][c].state === 'hit');

  if (activeHits.length >= 2) {
    // Try to determine axis and extend along it
    const rows = activeHits.map(([r]) => r);
    const cols = activeHits.map(([, c]) => c);
    const isHorizontal = rows.every(r => r === rows[0]);
    const sorted = isHorizontal
      ? [...activeHits].sort((a, b) => a[1] - b[1])
      : [...activeHits].sort((a, b) => a[0] - b[0]);

    const candidates: [number, number][] = [];
    if (isHorizontal) {
      const r = sorted[0][0];
      const left = sorted[0][1] - 1;
      const right = sorted[sorted.length - 1][1] + 1;
      if (left >= 0 && (board[r][left].state === 'empty' || board[r][left].state === 'ship')) candidates.push([r, left]);
      if (right < 10 && (board[r][right].state === 'empty' || board[r][right].state === 'ship')) candidates.push([r, right]);
    } else {
      const c = sorted[0][1];
      const top = sorted[0][0] - 1;
      const bot = sorted[sorted.length - 1][0] + 1;
      if (top >= 0 && (board[top][c].state === 'empty' || board[top][c].state === 'ship')) candidates.push([top, c]);
      if (bot < 10 && (board[bot][c].state === 'empty' || board[bot][c].state === 'ship')) candidates.push([bot, c]);
    }
    if (candidates.length > 0) return candidates[Math.floor(Math.random() * candidates.length)];
  }

  if (activeHits.length === 1) {
    const [hr, hc] = activeHits[0];
    const adj: [number, number][] = [
      [hr - 1, hc], [hr + 1, hc], [hr, hc - 1], [hr, hc + 1],
    ].filter(([r, c]) =>
      r >= 0 && r < 10 && c >= 0 && c < 10 &&
      (board[r][c].state === 'empty' || board[r][c].state === 'ship')
    ) as [number, number][];
    if (adj.length > 0) return adj[Math.floor(Math.random() * adj.length)];
  }

  // Hunt mode – checkerboard pattern skips half the squares
  const valid: [number, number][] = [];
  for (let r = 0; r < 10; r++) {
    for (let c = 0; c < 10; c++) {
      if ((board[r][c].state === 'empty' || board[r][c].state === 'ship') && (r + c) % 2 === 0) {
        valid.push([r, c]);
      }
    }
  }
  if (valid.length === 0) {
    // Fall back to any untouched cell
    for (let r = 0; r < 10; r++) {
      for (let c = 0; c < 10; c++) {
        if (board[r][c].state === 'empty' || board[r][c].state === 'ship') valid.push([r, c]);
      }
    }
  }
  return valid[Math.floor(Math.random() * valid.length)];
}

export function placeAiShips(): { board: Board; ships: PlacedShip[] } {
  let board = createEmptyBoard();
  const ships: PlacedShip[] = [];
  for (const t of SHIPS) {
    let placed = false;
    while (!placed) {
      const orientation: Orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
      const row = Math.floor(Math.random() * 10);
      const col = Math.floor(Math.random() * 10);
      if (canPlaceShip(board, row, col, t.size, orientation)) {
        const result = placeShip(board, t, row, col, orientation);
        board = result.board;
        ships.push(result.placedShip);
        placed = true;
      }
    }
  }
  return { board, ships };
}
