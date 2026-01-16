import React, { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { LeaderboardEntry, GameMode } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Trophy, Medal, Award, Circle, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [filter, setFilter] = useState<GameMode | 'all'>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      try {
        const data = await api.leaderboard.getAll(filter === 'all' ? undefined : filter);
        setEntries(data);
      } catch (error) {
        console.error('Failed to fetch leaderboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [filter]);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="h-5 w-5 text-neon-yellow" />;
      case 2:
        return <Medal className="h-5 w-5 text-muted-foreground" />;
      case 3:
        return <Award className="h-5 w-5 text-food" />;
      default:
        return <span className="w-5 text-center font-pixel text-xs">{rank}</span>;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-pixel text-glow flex items-center justify-center gap-3">
          <Trophy className="h-6 w-6 text-neon-yellow" />
          LEADERBOARD
          <Trophy className="h-6 w-6 text-neon-yellow" />
        </h2>
      </div>

      {/* Filter buttons */}
      <div className="flex gap-2 justify-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilter('all')}
          className={cn(filter === 'all' && 'bg-primary text-primary-foreground')}
        >
          ALL
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilter('walls')}
          className={cn(filter === 'walls' && 'bg-primary text-primary-foreground')}
        >
          <Square className="h-3 w-3 mr-1" />
          WALLS
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setFilter('pass-through')}
          className={cn(filter === 'pass-through' && 'bg-secondary text-secondary-foreground')}
        >
          <Circle className="h-3 w-3 mr-1" />
          INFINITE
        </Button>
      </div>

      {/* Leaderboard table */}
      <div className="arcade-border bg-card overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <p className="font-pixel text-sm animate-pulse">LOADING...</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-4 py-3 bg-muted/50 font-pixel text-xs text-muted-foreground">
              <div className="col-span-1">#</div>
              <div className="col-span-5">PLAYER</div>
              <div className="col-span-3 text-right">SCORE</div>
              <div className="col-span-3 text-right">MODE</div>
            </div>

            {/* Entries */}
            {entries.map((entry, index) => (
              <div
                key={entry.id}
                className={cn(
                  "grid grid-cols-12 gap-2 px-4 py-3 transition-colors hover:bg-muted/30",
                  index < 3 && "bg-muted/20"
                )}
              >
                <div className="col-span-1 flex items-center">
                  {getRankIcon(entry.rank)}
                </div>
                <div className="col-span-5 font-mono text-sm truncate">
                  {entry.username}
                </div>
                <div className={cn(
                  "col-span-3 text-right font-pixel text-sm",
                  entry.rank === 1 && "text-glow",
                  entry.rank === 2 && "text-muted-foreground",
                  entry.rank === 3 && "text-food"
                )}>
                  {entry.score.toLocaleString()}
                </div>
                <div className="col-span-3 text-right flex items-center justify-end gap-1 text-xs text-muted-foreground">
                  {entry.mode === 'walls' ? (
                    <Square className="h-3 w-3" />
                  ) : (
                    <Circle className="h-3 w-3" />
                  )}
                  <span className="hidden sm:inline">
                    {entry.mode === 'walls' ? 'Walls' : 'Infinite'}
                  </span>
                </div>
              </div>
            ))}

            {entries.length === 0 && (
              <div className="p-8 text-center text-muted-foreground font-mono">
                No entries yet. Be the first!
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
