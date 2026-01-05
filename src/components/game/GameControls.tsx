import React from 'react';
import { Button } from '@/components/ui/button';
import { Direction } from '@/types/game';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

interface GameControlsProps {
  onDirection: (direction: Direction) => void;
  disabled?: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({ onDirection, disabled }) => {
  return (
    <div className="grid grid-cols-3 gap-2 w-40 mx-auto mt-4 md:hidden">
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('UP')}
        disabled={disabled}
        className="h-12 w-12"
      >
        <ArrowUp className="h-6 w-6" />
      </Button>
      <div />
      
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('LEFT')}
        disabled={disabled}
        className="h-12 w-12"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <div className="flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-muted" />
      </div>
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('RIGHT')}
        disabled={disabled}
        className="h-12 w-12"
      >
        <ArrowRight className="h-6 w-6" />
      </Button>
      
      <div />
      <Button
        variant="outline"
        size="icon"
        onClick={() => onDirection('DOWN')}
        disabled={disabled}
        className="h-12 w-12"
      >
        <ArrowDown className="h-6 w-6" />
      </Button>
      <div />
    </div>
  );
};
