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
        mode === 'pass-through' ? 'rounded-sm' : 'rounded-sm',
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

        // Check for wrapping (if distance to previous position or head is large)
        // Actually, we can just assume if the segment is moving, we act on it.
        // But since we don't have "previous" state easily here without memoizing,
        // we can check if the segment is at an edge? No, because it might be moving normally at edge.
        // Wait, React re-renders. If the DOM node moves from 0 to 19, CSS transitions.

        // Strategy: Use a key that includes position? No, that remounts (flicker).
        // Strategy: Detect if this segment is "warping" based on index?
        // Actually, the simpler way is: if we track previous positions, we know. But we don't.

        // Alternative: If the snake segment is 'far' from its neighbor?
        // No, the neighbors are always adjacent in the array.
        // The VISUAL wrapping happens when `segment` coordinates jump from 0 to 19.

        // Since we can't easily know "previous render position", we might need to be clever.
        // Actually, if we use a different key for wrapped segments?
        // Or, we can blindly disable transitions for ALL segments if mode is pass-through?
        // No, that makes it choppy.

        // Better: We rely on the fact that `snake` array is ordered.
        // If we are at index `i`, we are following index `i-1`.
        // If `speed` is fast, maybe we don't need transitions?
        // The glitch is specifically the "flyover".

        // Let's try disabling transition if the segment is at the edge?
        // No.

        // What if we just remove `transition-all`? The game is grid based.
        // `duration-75` is 75ms.
        // If we remove it, the movement is instant. Snake requires snappy movement.
        // Let's removing transitions entirely for a test. It might actually look better/more retro.
        // The user complained about "bits falling off" / "flashing".

        // I will remove the transition class.

        return (
          <div
            key={index}
            className={cn(
              "absolute", // Removed transition-all duration-75
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
