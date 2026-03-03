'use client';

interface GameOverModalProps {
  winner: 'player' | 'ai';
  playerScore: number;
  aiScore: number;
  onRestart: () => void;
}

export function GameOverModal({ winner, playerScore, aiScore, onRestart }: GameOverModalProps) {
  const won = winner === 'player';
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className={`
        glass-panel p-8 max-w-md w-full mx-4 text-center flex flex-col items-center gap-6
        border-2 ${won ? 'border-cyan-400/40 shadow-[0_0_60px_rgba(0,180,216,0.3)]' : 'border-red-600/40 shadow-[0_0_60px_rgba(200,0,0,0.3)]'}
        animate-slide-up
      `}>
        <div className="text-7xl animate-bounce-slow">
          {won ? '🏆' : '💀'}
        </div>
        <div>
          <h2 className={`text-3xl font-black tracking-widest mb-1 ${won ? 'text-cyan-300' : 'text-red-400'}`}>
            {won ? 'VICTORY!' : 'DEFEATED!'}
          </h2>
          <p className={`text-sm ${won ? 'text-cyan-400/70' : 'text-red-400/70'}`}>
            {won ? 'You sank the enemy fleet!' : 'Your fleet has been destroyed!'}
          </p>
        </div>

        <div className="w-full flex gap-4 justify-center">
          <div className="text-center">
            <div className="text-2xl font-black text-cyan-400">{playerScore}</div>
            <div className="text-xs text-blue-400/60 uppercase tracking-wider">Your Wins</div>
          </div>
          <div className="text-blue-700/60 self-center text-2xl">—</div>
          <div className="text-center">
            <div className="text-2xl font-black text-red-400">{aiScore}</div>
            <div className="text-xs text-blue-400/60 uppercase tracking-wider">AI Wins</div>
          </div>
        </div>

        <button
          onClick={onRestart}
          className={`
            px-8 py-3 rounded-xl font-bold tracking-widest uppercase text-sm
            border transition-all duration-200 hover:scale-105 active:scale-95
            ${won
              ? 'bg-cyan-500/20 border-cyan-400/60 text-cyan-300 hover:bg-cyan-400/30 hover:shadow-[0_0_20px_rgba(0,200,220,0.4)]'
              : 'bg-red-600/20 border-red-500/60 text-red-300 hover:bg-red-500/30 hover:shadow-[0_0_20px_rgba(200,0,0,0.4)]'
            }
          `}
        >
          ⚔️ Play Again
        </button>
      </div>
    </div>
  );
}
