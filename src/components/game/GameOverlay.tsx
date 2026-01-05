import React from 'react';
import { Button } from '@/components/ui/button';
import { GameStatus } from '@/types/game';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface GameOverlayProps {
  status: GameStatus;
  score: number;
  onStart: () => void;
  onResume: () => void;
  onRestart: () => void;
}

export const GameOverlay: React.FC<GameOverlayProps> = ({
  status,
  score,
  onStart,
  onResume,
  onRestart,
}) => {
  if (status === 'playing') return null;

  return (
    <div className="absolute inset-0 bg-background/90 flex items-center justify-center z-20 backdrop-blur-sm">
      <div className="text-center space-y-6 p-8">
        {status === 'idle' && (
          <>
            <h2 className="text-2xl font-pixel text-glow animate-glow-pulse">
              SNAKE
            </h2>
            <p className="text-sm text-muted-foreground font-pixel">
              Use arrow keys or WASD
            </p>
            <Button 
              variant="arcade" 
              size="lg" 
              onClick={onStart}
              className="animate-float"
            >
              <Play className="h-5 w-5 mr-2" />
              START
            </Button>
          </>
        )}
        
        {status === 'paused' && (
          <>
            <h2 className="text-2xl font-pixel text-glow-cyan">
              PAUSED
            </h2>
            <div className="flex gap-4 justify-center">
              <Button variant="arcade" size="lg" onClick={onResume}>
                <Play className="h-5 w-5 mr-2" />
                RESUME
              </Button>
              <Button variant="outline" size="lg" onClick={onRestart}>
                <RotateCcw className="h-5 w-5 mr-2" />
                RESTART
              </Button>
            </div>
          </>
        )}
        
        {status === 'game-over' && (
          <>
            <h2 className="text-2xl font-pixel text-destructive animate-blink">
              GAME OVER
            </h2>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-pixel">FINAL SCORE</p>
              <p className="text-4xl font-pixel text-glow">{score}</p>
            </div>
            <Button variant="arcade" size="lg" onClick={onRestart}>
              <RotateCcw className="h-5 w-5 mr-2" />
              PLAY AGAIN
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
