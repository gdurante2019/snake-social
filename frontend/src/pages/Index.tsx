import React from 'react';
import { SnakeGame } from '@/components/game/SnakeGame';

const Index: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-pixel text-glow animate-glow-pulse">
          SNAKE ARCADE
        </h1>
        <p className="text-sm text-muted-foreground font-mono">
          Classic gameplay • Two modes • Global leaderboard
        </p>
      </div>
      
      {/* Game */}
      <SnakeGame />
    </div>
  );
};

export default Index;
