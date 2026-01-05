import React from 'react';
import { useGameLogic } from '@/hooks/useGameLogic';
import { GameBoard } from './GameBoard';
import { GameControls } from './GameControls';
import { ScoreDisplay } from './ScoreDisplay';
import { ModeSelector } from './ModeSelector';
import { GameOverlay } from './GameOverlay';
import { Button } from '@/components/ui/button';
import { Pause } from 'lucide-react';

export const SnakeGame: React.FC = () => {
  const {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
    setMode,
  } = useGameLogic();

  const { snake, food, gridSize, mode, score, highScore, status } = gameState;

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      <ScoreDisplay score={score} highScore={highScore} />
      
      <ModeSelector
        currentMode={mode}
        onModeChange={setMode}
        disabled={status === 'playing'}
      />
      
      <div className="relative">
        <GameBoard
          snake={snake}
          food={food}
          gridSize={gridSize}
          mode={mode}
        />
        
        <GameOverlay
          status={status}
          score={score}
          onStart={startGame}
          onResume={pauseGame}
          onRestart={resetGame}
        />
        
        {status === 'playing' && (
          <Button
            variant="ghost"
            size="icon"
            onClick={pauseGame}
            className="absolute top-2 right-2 z-30"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
      </div>
      
      <GameControls
        onDirection={setDirection}
        disabled={status !== 'playing'}
      />
      
      <div className="text-center text-xs text-muted-foreground font-mono">
        <p className="hidden md:block">Arrow keys or WASD to move • Space to pause</p>
        <p className="md:hidden">Tap arrows or swipe to move</p>
      </div>
    </div>
  );
};
