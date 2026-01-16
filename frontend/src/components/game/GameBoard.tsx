import React from 'react';
import { Position, GameMode } from '@/types/game';
import { cn } from '@/lib/utils';

interface GameBoardProps {
  snake: Position[];
  food: Position;
  gridSize: number;
  mode: GameMode;
  isSpectating?: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snake,
  food,
  gridSize,
  mode,
  isSpectating = false,
}) => {
  const cellSize = 100 / gridSize;

  return (
    <div 
      className={cn(
        "relative w-full aspect-square arcade-border overflow-hidden",
        mode === 'pass-through' ? 'rounded-full' : 'rounded-sm',
        isSpectating && 'opacity-90'
      )}
    >
      {/* Grid background */}
      <div className="absolute inset-0 grid-pattern opacity-30" />
      
      {/* Food */}
      <div
        className="absolute rounded-full animate-glow-pulse"
        style={{
          left: `${food.x * cellSize}%`,
          top: `${food.y * cellSize}%`,
          width: `${cellSize}%`,
          height: `${cellSize}%`,
          backgroundColor: 'hsl(var(--food))',
          boxShadow: '0 0 10px hsl(var(--food)), 0 0 20px hsl(var(--food-glow))',
        }}
      />
      
      {/* Snake */}
      {snake.map((segment, index) => {
        const isHead = index === 0;
        const opacity = 1 - (index * 0.03);
        
        return (
          <div
            key={index}
            className={cn(
              "absolute transition-all duration-75",
              isHead ? 'rounded-md z-10' : 'rounded-sm'
            )}
            style={{
              left: `${segment.x * cellSize}%`,
              top: `${segment.y * cellSize}%`,
              width: `${cellSize}%`,
              height: `${cellSize}%`,
              backgroundColor: `hsl(var(--snake) / ${opacity})`,
              boxShadow: isHead 
                ? '0 0 10px hsl(var(--snake)), 0 0 20px hsl(var(--snake-glow))'
                : `0 0 5px hsl(var(--snake) / ${opacity * 0.5})`,
              transform: isHead ? 'scale(1.05)' : undefined,
            }}
          >
            {/* Snake eyes for head */}
            {isHead && (
              <>
                <div 
                  className="absolute w-1.5 h-1.5 bg-background rounded-full"
                  style={{ top: '20%', left: '25%' }}
                />
                <div 
                  className="absolute w-1.5 h-1.5 bg-background rounded-full"
                  style={{ top: '20%', right: '25%' }}
                />
              </>
            )}
          </div>
        );
      })}
      
      {/* Mode indicator */}
      <div className="absolute top-2 left-2 px-2 py-1 bg-background/80 rounded text-xs font-pixel text-muted-foreground">
        {mode === 'pass-through' ? '∞' : '▢'}
      </div>
      
      {/* Scanline effect */}
      <div className="absolute inset-0 scanlines pointer-events-none" />
    </div>
  );
};
