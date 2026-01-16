import { useState, useCallback, useEffect, useRef } from 'react';
import { GameState, Direction, Position, GameMode } from '@/types/game';
import { api } from '@/services/api';

const GRID_SIZE = 20;
const INITIAL_SPEED = 150;

const getInitialSnake = (): Position[] => [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];

const generateFood = (snake: Position[]): Position => {
  let food: Position;
  do {
    food = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some(segment => segment.x === food.x && segment.y === food.y));
  return food;
};

const getInitialState = (mode: GameMode): GameState => ({
  snake: getInitialSnake(),
  food: generateFood(getInitialSnake()),
  direction: 'RIGHT',
  nextDirection: 'RIGHT',
  score: 0,
  highScore: api.game.getHighScore(mode),
  status: 'idle',
  mode,
  gridSize: GRID_SIZE,
  speed: INITIAL_SPEED,
});

export const useGameLogic = (initialMode: GameMode = 'walls') => {
  const [gameState, setGameState] = useState<GameState>(() => getInitialState(initialMode));
  const gameLoopRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const moveSnake = useCallback((state: GameState): GameState => {
    const { snake, food, nextDirection, mode, gridSize } = state;
    const head = snake[0];
    
    let newHead: Position = { ...head };
    
    switch (nextDirection) {
      case 'UP':
        newHead.y -= 1;
        break;
      case 'DOWN':
        newHead.y += 1;
        break;
      case 'LEFT':
        newHead.x -= 1;
        break;
      case 'RIGHT':
        newHead.x += 1;
        break;
    }

    // Handle boundaries based on mode
    if (mode === 'pass-through') {
      if (newHead.x < 0) newHead.x = gridSize - 1;
      if (newHead.x >= gridSize) newHead.x = 0;
      if (newHead.y < 0) newHead.y = gridSize - 1;
      if (newHead.y >= gridSize) newHead.y = 0;
    } else {
      // Walls mode - check collision
      if (newHead.x < 0 || newHead.x >= gridSize || newHead.y < 0 || newHead.y >= gridSize) {
        return { ...state, status: 'game-over' };
      }
    }

    // Check self collision
    if (snake.some(segment => segment.x === newHead.x && segment.y === newHead.y)) {
      return { ...state, status: 'game-over' };
    }

    // Check food collision
    const ateFood = newHead.x === food.x && newHead.y === food.y;
    
    const newSnake = [newHead, ...snake];
    if (!ateFood) {
      newSnake.pop();
    }

    const newScore = ateFood ? state.score + 10 : state.score;
    const newHighScore = Math.max(newScore, state.highScore);
    
    // Increase speed slightly when eating food
    const newSpeed = ateFood ? Math.max(50, state.speed - 2) : state.speed;

    return {
      ...state,
      snake: newSnake,
      food: ateFood ? generateFood(newSnake) : food,
      direction: nextDirection,
      score: newScore,
      highScore: newHighScore,
      speed: newSpeed,
    };
  }, []);

  const gameLoop = useCallback((timestamp: number) => {
    setGameState(prevState => {
      if (prevState.status !== 'playing') {
        return prevState;
      }

      if (timestamp - lastUpdateRef.current >= prevState.speed) {
        lastUpdateRef.current = timestamp;
        const newState = moveSnake(prevState);
        
        if (newState.status === 'game-over') {
          api.game.saveHighScore(prevState.mode, newState.score);
        }
        
        return newState;
      }

      return prevState;
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [moveSnake]);

  useEffect(() => {
    if (gameState.status === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState.status, gameLoop]);

  const startGame = useCallback(() => {
    setGameState(prev => ({
      ...getInitialState(prev.mode),
      highScore: api.game.getHighScore(prev.mode),
      status: 'playing',
    }));
    lastUpdateRef.current = 0;
  }, []);

  const pauseGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      status: prev.status === 'playing' ? 'paused' : 'playing',
    }));
  }, []);

  const resetGame = useCallback(() => {
    setGameState(prev => ({
      ...getInitialState(prev.mode),
      highScore: api.game.getHighScore(prev.mode),
    }));
  }, []);

  const setDirection = useCallback((newDirection: Direction) => {
    setGameState(prev => {
      // Prevent 180-degree turns
      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };
      
      if (opposites[newDirection] === prev.direction) {
        return prev;
      }
      
      return { ...prev, nextDirection: newDirection };
    });
  }, []);

  const setMode = useCallback((mode: GameMode) => {
    setGameState({
      ...getInitialState(mode),
      highScore: api.game.getHighScore(mode),
    });
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.status !== 'playing' && gameState.status !== 'paused') {
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          setDirection('UP');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          setDirection('DOWN');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          setDirection('LEFT');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          setDirection('RIGHT');
          break;
        case ' ':
        case 'Escape':
          e.preventDefault();
          pauseGame();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.status, setDirection, pauseGame]);

  return {
    gameState,
    startGame,
    pauseGame,
    resetGame,
    setDirection,
    setMode,
  };
};

// Export pure functions for testing
export const gameLogicUtils = {
  getInitialSnake,
  generateFood,
  GRID_SIZE,
};
