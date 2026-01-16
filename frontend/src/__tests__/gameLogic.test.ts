import { describe, it, expect } from 'vitest';
import { gameLogicUtils } from '@/hooks/useGameLogic';
import { Position, Direction, GameMode } from '@/types/game';

const { getInitialSnake, generateFood, GRID_SIZE } = gameLogicUtils;

describe('Game Logic', () => {
  describe('Initial Snake', () => {
    it('should create a snake with 3 segments', () => {
      const snake = getInitialSnake();
      expect(snake).toHaveLength(3);
    });

    it('should have snake segments in a horizontal line', () => {
      const snake = getInitialSnake();
      // All segments should be on the same y position
      const y = snake[0].y;
      expect(snake.every(s => s.y === y)).toBe(true);
    });

    it('should have snake head at correct position', () => {
      const snake = getInitialSnake();
      expect(snake[0]).toEqual({ x: 10, y: 10 });
    });
  });

  describe('Food Generation', () => {
    it('should generate food within grid bounds', () => {
      const snake = getInitialSnake();
      const food = generateFood(snake);
      
      expect(food.x).toBeGreaterThanOrEqual(0);
      expect(food.x).toBeLessThan(GRID_SIZE);
      expect(food.y).toBeGreaterThanOrEqual(0);
      expect(food.y).toBeLessThan(GRID_SIZE);
    });

    it('should not generate food on snake body', () => {
      const snake = getInitialSnake();
      
      // Generate food 100 times to test randomness
      for (let i = 0; i < 100; i++) {
        const food = generateFood(snake);
        const onSnake = snake.some(s => s.x === food.x && s.y === food.y);
        expect(onSnake).toBe(false);
      }
    });
  });

  describe('Movement Logic', () => {
    const calculateNewHead = (head: Position, direction: Direction): Position => {
      const newHead = { ...head };
      switch (direction) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }
      return newHead;
    };

    it('should move up correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = calculateNewHead(head, 'UP');
      expect(newHead).toEqual({ x: 10, y: 9 });
    });

    it('should move down correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = calculateNewHead(head, 'DOWN');
      expect(newHead).toEqual({ x: 10, y: 11 });
    });

    it('should move left correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = calculateNewHead(head, 'LEFT');
      expect(newHead).toEqual({ x: 9, y: 10 });
    });

    it('should move right correctly', () => {
      const head = { x: 10, y: 10 };
      const newHead = calculateNewHead(head, 'RIGHT');
      expect(newHead).toEqual({ x: 11, y: 10 });
    });
  });

  describe('Collision Detection', () => {
    const checkSelfCollision = (snake: Position[], newHead: Position): boolean => {
      return snake.some(segment => segment.x === newHead.x && segment.y === newHead.y);
    };

    const checkWallCollision = (head: Position, gridSize: number): boolean => {
      return head.x < 0 || head.x >= gridSize || head.y < 0 || head.y >= gridSize;
    };

    it('should detect self collision', () => {
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
        { x: 3, y: 6 },
        { x: 4, y: 6 },
        { x: 5, y: 6 },
      ];
      const newHead = { x: 4, y: 5 }; // Collides with second segment

      expect(checkSelfCollision(snake, newHead)).toBe(true);
    });

    it('should not detect collision when moving to empty space', () => {
      const snake = [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ];
      const newHead = { x: 6, y: 5 };

      expect(checkSelfCollision(snake, newHead)).toBe(false);
    });

    it('should detect wall collision at left boundary', () => {
      const head = { x: -1, y: 10 };
      expect(checkWallCollision(head, GRID_SIZE)).toBe(true);
    });

    it('should detect wall collision at right boundary', () => {
      const head = { x: GRID_SIZE, y: 10 };
      expect(checkWallCollision(head, GRID_SIZE)).toBe(true);
    });

    it('should detect wall collision at top boundary', () => {
      const head = { x: 10, y: -1 };
      expect(checkWallCollision(head, GRID_SIZE)).toBe(true);
    });

    it('should detect wall collision at bottom boundary', () => {
      const head = { x: 10, y: GRID_SIZE };
      expect(checkWallCollision(head, GRID_SIZE)).toBe(true);
    });

    it('should not detect wall collision when inside grid', () => {
      const head = { x: 10, y: 10 };
      expect(checkWallCollision(head, GRID_SIZE)).toBe(false);
    });
  });

  describe('Pass-through Mode', () => {
    const wrapPosition = (pos: Position, gridSize: number): Position => {
      let { x, y } = pos;
      if (x < 0) x = gridSize - 1;
      if (x >= gridSize) x = 0;
      if (y < 0) y = gridSize - 1;
      if (y >= gridSize) y = 0;
      return { x, y };
    };

    it('should wrap from right to left', () => {
      const pos = { x: GRID_SIZE, y: 10 };
      const wrapped = wrapPosition(pos, GRID_SIZE);
      expect(wrapped).toEqual({ x: 0, y: 10 });
    });

    it('should wrap from left to right', () => {
      const pos = { x: -1, y: 10 };
      const wrapped = wrapPosition(pos, GRID_SIZE);
      expect(wrapped).toEqual({ x: GRID_SIZE - 1, y: 10 });
    });

    it('should wrap from bottom to top', () => {
      const pos = { x: 10, y: GRID_SIZE };
      const wrapped = wrapPosition(pos, GRID_SIZE);
      expect(wrapped).toEqual({ x: 10, y: 0 });
    });

    it('should wrap from top to bottom', () => {
      const pos = { x: 10, y: -1 };
      const wrapped = wrapPosition(pos, GRID_SIZE);
      expect(wrapped).toEqual({ x: 10, y: GRID_SIZE - 1 });
    });

    it('should not modify position inside grid', () => {
      const pos = { x: 10, y: 10 };
      const wrapped = wrapPosition(pos, GRID_SIZE);
      expect(wrapped).toEqual({ x: 10, y: 10 });
    });
  });

  describe('Direction Validation', () => {
    const isOppositeDirection = (current: Direction, next: Direction): boolean => {
      const opposites: Record<Direction, Direction> = {
        UP: 'DOWN',
        DOWN: 'UP',
        LEFT: 'RIGHT',
        RIGHT: 'LEFT',
      };
      return opposites[current] === next;
    };

    it('should detect UP is opposite to DOWN', () => {
      expect(isOppositeDirection('UP', 'DOWN')).toBe(true);
    });

    it('should detect DOWN is opposite to UP', () => {
      expect(isOppositeDirection('DOWN', 'UP')).toBe(true);
    });

    it('should detect LEFT is opposite to RIGHT', () => {
      expect(isOppositeDirection('LEFT', 'RIGHT')).toBe(true);
    });

    it('should detect RIGHT is opposite to LEFT', () => {
      expect(isOppositeDirection('RIGHT', 'LEFT')).toBe(true);
    });

    it('should allow perpendicular directions', () => {
      expect(isOppositeDirection('UP', 'LEFT')).toBe(false);
      expect(isOppositeDirection('UP', 'RIGHT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'LEFT')).toBe(false);
      expect(isOppositeDirection('DOWN', 'RIGHT')).toBe(false);
    });
  });

  describe('Score Calculation', () => {
    const calculateScore = (foodEaten: number, basePoints: number = 10): number => {
      return foodEaten * basePoints;
    };

    it('should calculate score correctly', () => {
      expect(calculateScore(0)).toBe(0);
      expect(calculateScore(1)).toBe(10);
      expect(calculateScore(5)).toBe(50);
      expect(calculateScore(100)).toBe(1000);
    });
  });
});
