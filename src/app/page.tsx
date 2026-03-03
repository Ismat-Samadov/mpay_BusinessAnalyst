'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Board } from '@/components/Board';
import { ShipSelector } from '@/components/ShipSelector';
import { FleetStatus } from '@/components/FleetStatus';
import { GameOverModal } from '@/components/GameOverModal';
import {
  SHIPS,
  attack,
  canPlaceShip,
  checkWin,
  createEmptyBoard,
  getAiMove,
  placeAiShips,
  placeShip,
} from '@/lib/gameLogic';
import {
  Board as BoardType,
  GamePhase,
  Orientation,
  PlacedShip,
  ShipTemplate,
} from '@/lib/types';

export default function BattleshipGame() {
  const [playerBoard, setPlayerBoard] = useState<BoardType>(createEmptyBoard);
  const [aiBoard, setAiBoard] = useState<BoardType>(createEmptyBoard);
  const [playerShips, setPlayerShips] = useState<PlacedShip[]>([]);
  const [aiShips, setAiShips] = useState<PlacedShip[]>([]);
  const [phase, setPhase] = useState<GamePhase>('setup');
  const [currentTurn, setCurrentTurn] = useState<'player' | 'ai'>('player');
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  const [selectedShip, setSelectedShip] = useState<ShipTemplate | null>(SHIPS[0]);
  const [orientation, setOrientation] = useState<Orientation>('horizontal');
  const [placedShipIds, setPlacedShipIds] = useState<Set<string>>(new Set());
  const [hoverCell, setHoverCell] = useState<[number, number] | null>(null);
  const [aiHitLog, setAiHitLog] = useState<[number, number][]>([]);
  const [message, setMessage] = useState('Place your ships — click to place, R to rotate');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [showReveal, setShowReveal] = useState(false);

  // Mutable refs for AI turn (avoid stale closures)
  const playerBoardRef = useRef(playerBoard);
  const playerShipsRef = useRef(playerShips);
  const aiHitLogRef = useRef(aiHitLog);
  playerBoardRef.current = playerBoard;
  playerShipsRef.current = playerShips;
  aiHitLogRef.current = aiHitLog;

  // R key to rotate
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'r') setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const rotate = useCallback(() => {
    setOrientation(o => o === 'horizontal' ? 'vertical' : 'horizontal');
  }, []);

  // --- Setup phase ---
  const handlePlayerBoardClick = useCallback((row: number, col: number) => {
    if (phase !== 'setup' || !selectedShip) return;
    if (placedShipIds.has(selectedShip.id)) return;
    if (!canPlaceShip(playerBoard, row, col, selectedShip.size, orientation)) return;

    const { board: newBoard, placedShip } = placeShip(playerBoard, selectedShip, row, col, orientation);
    setPlayerBoard(newBoard);
    setPlayerShips(prev => [...prev, placedShip]);

    const newPlaced = new Set(placedShipIds);
    newPlaced.add(selectedShip.id);
    setPlacedShipIds(newPlaced);

    const nextShip = SHIPS.find(s => !newPlaced.has(s.id)) ?? null;
    setSelectedShip(nextShip);

    if (newPlaced.size === SHIPS.length) {
      const { board: aiB, ships: aiS } = placeAiShips();
      setAiBoard(aiB);
      setAiShips(aiS);
      setPhase('battle');
      setMessage('Your turn — click a square on the enemy grid to fire!');
    }
  }, [phase, selectedShip, placedShipIds, playerBoard, orientation]);

  const handleAutoPlace = useCallback(() => {
    const { board: newBoard, ships: newShips } = placeAiShips();
    setPlayerBoard(newBoard);
    setPlayerShips(newShips);
    const ids = new Set(newShips.map(s => s.id));
    setPlacedShipIds(ids);
    setSelectedShip(null);

    const { board: aiB, ships: aiS } = placeAiShips();
    setAiBoard(aiB);
    setAiShips(aiS);
    setPhase('battle');
    setMessage('Your turn — click a square on the enemy grid to fire!');
  }, []);

  const handleResetSetup = useCallback(() => {
    setPlayerBoard(createEmptyBoard());
    setPlayerShips([]);
    setPlacedShipIds(new Set());
    setSelectedShip(SHIPS[0]);
    setOrientation('horizontal');
    setMessage('Place your ships — click to place, R to rotate');
  }, []);

  // --- Battle phase: player attacks AI ---
  const handleEnemyBoardClick = useCallback((row: number, col: number) => {
    if (phase !== 'battle' || currentTurn !== 'player' || isAiThinking) return;
    const cell = aiBoard[row][col];
    if (cell.state !== 'empty' && cell.state !== 'ship') return;

    const result = attack(aiBoard, aiShips, row, col);
    setAiBoard(result.board);
    setAiShips(result.ships);

    if (result.sunk) {
      setMessage(`💥 You sank the enemy ${result.shipName}!`);
    } else if (result.hit) {
      setMessage('🔥 Direct hit! Fire again!');
    } else {
      setMessage('💧 Miss. The enemy takes their turn…');
    }

    if (checkWin(result.ships)) {
      setPhase('gameover');
      setWinner('player');
      setPlayerScore(p => p + 1);
      setShowReveal(true);
      return;
    }

    // Pass turn only on miss (player gets another shot on hit)
    if (!result.hit) {
      setCurrentTurn('ai');
      setIsAiThinking(true);
    }
  }, [phase, currentTurn, isAiThinking, aiBoard, aiShips]);

  // AI turn
  useEffect(() => {
    if (phase !== 'battle' || currentTurn !== 'ai' || !isAiThinking) return;
    const delay = 900 + Math.random() * 700;
    const timer = setTimeout(() => {
      const [r, c] = getAiMove(playerBoardRef.current, aiHitLogRef.current);
      const result = attack(playerBoardRef.current, playerShipsRef.current, r, c);
      setPlayerBoard(result.board);
      setPlayerShips(result.ships);

      if (result.hit) {
        const newLog: [number, number][] = [...aiHitLogRef.current, [r, c]];
        // Remove sunk cells from hit log
        const filteredLog = result.sunk
          ? newLog.filter(([hr, hc]) => result.board[hr][hc].state !== 'sunk')
          : newLog;
        setAiHitLog(filteredLog);
        setMessage(result.sunk ? `☠️ The enemy sank your ${result.shipName}!` : '☠️ Enemy hit your ship!');
      } else {
        setMessage('Your turn — click a square to fire!');
      }

      if (checkWin(result.ships)) {
        setPhase('gameover');
        setWinner('ai');
        setAiScore(a => a + 1);
        setShowReveal(true);
        setIsAiThinking(false);
        return;
      }

      setCurrentTurn('player');
      setIsAiThinking(false);
    }, delay);

    return () => clearTimeout(timer);
  }, [phase, currentTurn, isAiThinking]);

  // Restart
  const handleRestart = useCallback(() => {
    setPlayerBoard(createEmptyBoard());
    setAiBoard(createEmptyBoard());
    setPlayerShips([]);
    setAiShips([]);
    setPhase('setup');
    setCurrentTurn('player');
    setWinner(null);
    setSelectedShip(SHIPS[0]);
    setOrientation('horizontal');
    setPlacedShipIds(new Set());
    setHoverCell(null);
    setAiHitLog([]);
    setIsAiThinking(false);
    setShowReveal(false);
    setMessage('Place your ships — click to place, R to rotate');
  }, []);

  // Show AI ships on game over
  const displayAiBoard: BoardType = showReveal
    ? aiBoard.map(row => row.map(cell => ({ ...cell })))
    : aiBoard;

  return (
    <div className="min-h-screen ocean-bg flex flex-col">
      {/* Header */}
      <header className="py-4 px-6 flex items-center justify-between border-b border-blue-900/40">
        <div className="flex items-center gap-3">
          <span className="text-2xl">⚓</span>
          <h1 className="text-xl md:text-2xl font-black tracking-[0.2em] text-white uppercase">
            Battle<span className="text-cyan-400">ship</span>
          </h1>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="score-badge text-cyan-300">
              <span className="text-xs text-blue-400/60 mr-1.5">YOU</span>
              {playerScore}
            </div>
            <span className="text-blue-700/60 font-light">—</span>
            <div className="score-badge text-red-300">
              {aiScore}
              <span className="text-xs text-blue-400/60 ml-1.5">AI</span>
            </div>
          </div>
          {phase !== 'setup' && (
            <button
              onClick={handleRestart}
              className="px-3 py-1.5 rounded-lg border border-blue-800/60 text-blue-400/70 hover:text-blue-300 hover:border-blue-600/70 text-xs uppercase tracking-wider transition-all"
            >
              New Game
            </button>
          )}
        </div>
      </header>

      {/* Status bar */}
      <div className={`
        py-2 px-6 text-center text-sm font-medium tracking-wide transition-colors duration-500
        ${isAiThinking ? 'text-red-400/80' : currentTurn === 'player' || phase === 'setup' ? 'text-cyan-400/90' : 'text-blue-400/70'}
      `}>
        {isAiThinking ? (
          <span className="inline-flex items-center gap-2">
            <span className="animate-spin">⚙️</span> Enemy is targeting…
          </span>
        ) : message}
      </div>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-6 gap-6">
        <div className="flex flex-col lg:flex-row items-start justify-center gap-6 w-full max-w-6xl">

          {/* Left panel */}
          <div className="flex flex-col gap-4">
            {phase === 'setup' && (
              <ShipSelector
                placedShipIds={placedShipIds}
                selectedShip={selectedShip}
                orientation={orientation}
                onSelectShip={setSelectedShip}
                onRotate={rotate}
                onAutoPlace={handleAutoPlace}
                onReset={handleResetSetup}
              />
            )}
            {phase !== 'setup' && (
              <FleetStatus ships={playerShips} label="Your Fleet" side="player" />
            )}
          </div>

          {/* Boards */}
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 flex-1 justify-center">
            {/* Player board */}
            <div className={`glass-panel p-4 transition-all duration-300
              ${phase === 'setup' ? 'border-cyan-500/30 shadow-[0_0_30px_rgba(0,180,216,0.1)]' : ''}
            `}>
              <Board
                board={playerBoard}
                ships={playerShips}
                label={phase === 'setup' ? 'Place your ships here' : 'Your Waters'}
                isPlayerBoard={true}
                phase={phase}
                selectedShip={selectedShip}
                orientation={orientation}
                hoverCell={hoverCell}
                onCellClick={handlePlayerBoardClick}
                onCellHover={(r, c) => setHoverCell([r, c])}
                onBoardLeave={() => setHoverCell(null)}
                disabled={phase !== 'setup'}
              />
            </div>

            {/* VS divider */}
            <div className="flex md:flex-col items-center gap-2 text-blue-700/40">
              <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-blue-800/40 to-transparent" />
              <span className="text-xs tracking-[0.3em] uppercase font-bold">vs</span>
              <div className="hidden md:block w-px h-16 bg-gradient-to-b from-transparent via-blue-800/40 to-transparent" />
              <div className="block md:hidden h-px w-16 bg-gradient-to-r from-transparent via-blue-800/40 to-transparent" />
            </div>

            {/* AI board */}
            <div className={`glass-panel p-4 transition-all duration-300
              ${phase === 'battle' && currentTurn === 'player' && !isAiThinking
                ? 'border-red-500/25 shadow-[0_0_25px_rgba(200,0,0,0.08)]'
                : ''}
              ${phase === 'setup' ? 'opacity-25 pointer-events-none' : ''}
            `}>
              <Board
                board={displayAiBoard}
                ships={aiShips}
                label="Enemy Waters"
                isPlayerBoard={false}
                phase={phase}
                selectedShip={null}
                orientation={orientation}
                hoverCell={null}
                onCellClick={handleEnemyBoardClick}
                onCellHover={() => {}}
                onBoardLeave={() => {}}
                disabled={phase !== 'battle' || currentTurn !== 'player' || isAiThinking}
              />
            </div>
          </div>

          {/* Right panel: enemy fleet */}
          {phase !== 'setup' && (
            <FleetStatus ships={aiShips} label="Enemy Fleet" side="ai" />
          )}
        </div>

        {/* Instructions */}
        {phase === 'setup' && (
          <p className="text-xs text-blue-500/40 tracking-wide">
            Select a ship · click the grid to place · press <kbd className="px-1 py-0.5 rounded bg-blue-900/60 border border-blue-700/50 text-blue-300 text-xs">R</kbd> to rotate
          </p>
        )}

        {/* Turn indicator */}
        {phase === 'battle' && (
          <div className="flex items-center gap-3 text-xs">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
              currentTurn === 'player' && !isAiThinking
                ? 'border-cyan-500/60 bg-cyan-900/20 text-cyan-300'
                : 'border-blue-900/30 text-blue-700/50'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${currentTurn === 'player' && !isAiThinking ? 'bg-cyan-400 animate-pulse' : 'bg-blue-800'}`} />
              Your Turn
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-300 ${
              currentTurn === 'ai' || isAiThinking
                ? 'border-red-500/60 bg-red-900/20 text-red-300'
                : 'border-blue-900/30 text-blue-700/50'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full transition-all ${currentTurn === 'ai' || isAiThinking ? 'bg-red-400 animate-pulse' : 'bg-blue-800'}`} />
              AI Turn
            </div>
          </div>
        )}
      </main>

      {/* Game over */}
      {phase === 'gameover' && winner && (
        <GameOverModal
          winner={winner}
          playerScore={playerScore}
          aiScore={aiScore}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
