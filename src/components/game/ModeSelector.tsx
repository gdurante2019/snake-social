import React from 'react';
import { Button } from '@/components/ui/button';
import { GameMode } from '@/types/game';
import { cn } from '@/lib/utils';
import { Square, Circle } from 'lucide-react';

interface ModeSelectorProps {
  currentMode: GameMode;
  onModeChange: (mode: GameMode) => void;
  disabled?: boolean;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onModeChange,
  disabled,
}) => {
  return (
    <div className="flex gap-4 justify-center">
      <Button
        variant="outline"
        onClick={() => onModeChange('walls')}
        disabled={disabled}
        className={cn(
          "flex-1 max-w-32 gap-2",
          currentMode === 'walls' && "bg-primary text-primary-foreground box-glow"
        )}
      >
        <Square className="h-4 w-4" />
        Walls
      </Button>
      
      <Button
        variant="outline"
        onClick={() => onModeChange('pass-through')}
        disabled={disabled}
        className={cn(
          "flex-1 max-w-32 gap-2",
          currentMode === 'pass-through' && "bg-secondary text-secondary-foreground box-glow-cyan"
        )}
      >
        <Circle className="h-4 w-4" />
        Infinite
      </Button>
    </div>
  );
};
