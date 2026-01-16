import React from 'react';
import { Trophy, Star } from 'lucide-react';

interface ScoreDisplayProps {
  score: number;
  highScore: number;
}

export const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ score, highScore }) => {
  return (
    <div className="flex justify-between items-center gap-8 font-pixel">
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-neon-yellow" />
        <div>
          <div className="text-xs text-muted-foreground">SCORE</div>
          <div className="text-xl text-glow">{score.toString().padStart(5, '0')}</div>
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        <Trophy className="h-5 w-5 text-neon-cyan" />
        <div className="text-right">
          <div className="text-xs text-muted-foreground">HIGH</div>
          <div className="text-xl text-glow-cyan">{highScore.toString().padStart(5, '0')}</div>
        </div>
      </div>
    </div>
  );
};
