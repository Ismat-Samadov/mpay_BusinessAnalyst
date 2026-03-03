export type CellState = 'empty' | 'ship' | 'hit' | 'miss' | 'sunk';
export type Orientation = 'horizontal' | 'vertical';
export type GamePhase = 'setup' | 'battle' | 'gameover';

export interface PlacedShip {
  id: string;
  name: string;
  size: number;
  cells: [number, number][];
  hits: number;
  sunk: boolean;
}

export interface CellData {
  row: number;
  col: number;
  state: CellState;
  shipId?: string;
}

export type Board = CellData[][];

export interface ShipTemplate {
  id: string;
  name: string;
  size: number;
  emoji: string;
}
