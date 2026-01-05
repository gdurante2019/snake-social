import React, { useState, useEffect, useRef } from 'react';
import { api } from '@/services/api';
import { ActivePlayer } from '@/types/game';
import { GameBoard } from '@/components/game/GameBoard';
import { Button } from '@/components/ui/button';
import { Eye, Users, RefreshCw, Circle, Square } from 'lucide-react';
import { cn } from '@/lib/utils';

export const SpectatorMode: React.FC = () => {
  const [activePlayers, setActivePlayers] = useState<ActivePlayer[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<ActivePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const animationRef = useRef<number | null>(null);

  // Fetch active players
  useEffect(() => {
    const fetchPlayers = async () => {
      setIsLoading(true);
      try {
        const players = await api.spectate.getActivePlayers();
        setActivePlayers(players);
        if (players.length > 0 && !selectedPlayer) {
          setSelectedPlayer(players[0]);
        }
      } catch (error) {
        console.error('Failed to fetch active players:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPlayers();
  }, []);

  // Simulate AI movement for spectating
  useEffect(() => {
    if (!selectedPlayer) return;

    const animate = () => {
      setActivePlayers(prev => 
        prev.map(player => 
          player.id === selectedPlayer.id 
            ? api.spectate.simulateMovement(player)
            : player
        )
      );

      setSelectedPlayer(prev => 
        prev ? api.spectate.simulateMovement(prev) : null
      );

      animationRef.current = setTimeout(() => {
        requestAnimationFrame(animate);
      }, 200) as unknown as number;
    };

    animationRef.current = setTimeout(() => {
      requestAnimationFrame(animate);
    }, 200) as unknown as number;

    return () => {
      if (animationRef.current) {
        clearTimeout(animationRef.current);
      }
    };
  }, [selectedPlayer?.id]);

  const handleRefresh = async () => {
    const players = await api.spectate.getActivePlayers();
    setActivePlayers(players);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-pixel text-glow-cyan flex items-center justify-center gap-3">
          <Eye className="h-6 w-6" />
          SPECTATE
          <Eye className="h-6 w-6" />
        </h2>
        <p className="text-sm text-muted-foreground font-mono mt-2">
          Watch live games in progress
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Player list */}
        <div className="md:col-span-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-pixel text-sm flex items-center gap-2">
              <Users className="h-4 w-4" />
              LIVE PLAYERS
            </h3>
            <Button variant="ghost" size="icon" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          <div className="arcade-border bg-card divide-y divide-border">
            {isLoading ? (
              <div className="p-4 text-center">
                <p className="font-pixel text-xs animate-pulse">LOADING...</p>
              </div>
            ) : activePlayers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground font-mono text-sm">
                No active players
              </div>
            ) : (
              activePlayers.map(player => (
                <button
                  key={player.id}
                  onClick={() => setSelectedPlayer(player)}
                  className={cn(
                    "w-full px-4 py-3 text-left transition-colors hover:bg-muted/30",
                    selectedPlayer?.id === player.id && "bg-muted/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm truncate">
                      {player.username}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      {player.mode === 'walls' ? (
                        <Square className="h-3 w-3" />
                      ) : (
                        <Circle className="h-3 w-3" />
                      )}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">Score</span>
                    <span className="font-pixel text-xs text-primary">
                      {player.score}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Game view */}
        <div className="md:col-span-2">
          {selectedPlayer ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-sm">{selectedPlayer.username}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    {selectedPlayer.mode === 'walls' ? (
                      <>
                        <Square className="h-3 w-3" /> Walls Mode
                      </>
                    ) : (
                      <>
                        <Circle className="h-3 w-3" /> Infinite Mode
                      </>
                    )}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">SCORE</p>
                  <p className="font-pixel text-xl text-glow">
                    {selectedPlayer.score}
                  </p>
                </div>
              </div>

              <GameBoard
                snake={selectedPlayer.snake}
                food={selectedPlayer.food}
                gridSize={20}
                mode={selectedPlayer.mode}
                isSpectating
              />

              <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
                LIVE
              </div>
            </div>
          ) : (
            <div className="arcade-border bg-card aspect-square flex items-center justify-center">
              <p className="font-pixel text-sm text-muted-foreground">
                SELECT A PLAYER
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
