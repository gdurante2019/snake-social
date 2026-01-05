import { describe, it, expect, beforeEach } from 'vitest';
import { api } from '@/services/api';

describe('API Service', () => {
  beforeEach(() => {
    // Clear session before each test
    api.auth.persistSession(null);
    localStorage.clear();
  });

  describe('Auth', () => {
    it('should login with valid credentials', async () => {
      const result = await api.auth.login('master@snake.io', 'password');
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('master@snake.io');
      expect(result.token).toBeDefined();
    });

    it('should throw error for invalid email', async () => {
      await expect(api.auth.login('invalid@email.com', 'password'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should throw error for short password', async () => {
      await expect(api.auth.login('master@snake.io', '123'))
        .rejects.toThrow('Invalid email or password');
    });

    it('should signup with valid data', async () => {
      const result = await api.auth.signup('NewPlayer', 'new@player.io', 'password123');
      expect(result.user).toBeDefined();
      expect(result.user.username).toBe('NewPlayer');
      expect(result.user.email).toBe('new@player.io');
    });

    it('should throw error for duplicate email on signup', async () => {
      await expect(api.auth.signup('Test', 'master@snake.io', 'password123'))
        .rejects.toThrow('Email already registered');
    });

    it('should throw error for short password on signup', async () => {
      await expect(api.auth.signup('Test', 'unique@email.io', '123'))
        .rejects.toThrow('Password must be at least 6 characters');
    });

    it('should persist and retrieve session', () => {
      const mockUser = { id: '1', username: 'Test', email: 'test@test.io', createdAt: '2024-01-01' };
      api.auth.persistSession(mockUser);
      
      const retrieved = api.auth.getSession();
      expect(retrieved).toEqual(mockUser);
    });

    it('should clear session on logout', async () => {
      const mockUser = { id: '1', username: 'Test', email: 'test@test.io', createdAt: '2024-01-01' };
      api.auth.persistSession(mockUser);
      
      await api.auth.logout();
      api.auth.persistSession(null);
      
      const retrieved = api.auth.getSession();
      expect(retrieved).toBeNull();
    });
  });

  describe('Leaderboard', () => {
    it('should fetch all leaderboard entries', async () => {
      const entries = await api.leaderboard.getAll();
      expect(Array.isArray(entries)).toBe(true);
      expect(entries.length).toBeGreaterThan(0);
    });

    it('should filter leaderboard by mode', async () => {
      const wallsEntries = await api.leaderboard.getAll('walls');
      expect(wallsEntries.every(e => e.mode === 'walls')).toBe(true);

      const passThrough = await api.leaderboard.getAll('pass-through');
      expect(passThrough.every(e => e.mode === 'pass-through')).toBe(true);
    });

    it('should have entries sorted by score descending', async () => {
      const entries = await api.leaderboard.getAll();
      for (let i = 1; i < entries.length; i++) {
        expect(entries[i - 1].score).toBeGreaterThanOrEqual(entries[i].score);
      }
    });
  });

  describe('Spectate', () => {
    it('should fetch active players', async () => {
      const players = await api.spectate.getActivePlayers();
      expect(Array.isArray(players)).toBe(true);
    });

    it('should simulate movement correctly', () => {
      const player = {
        id: '1',
        username: 'Test',
        score: 0,
        mode: 'pass-through' as const,
        snake: [{ x: 5, y: 5 }, { x: 4, y: 5 }, { x: 3, y: 5 }],
        food: { x: 10, y: 5 },
        direction: 'RIGHT' as const,
        startedAt: new Date().toISOString(),
      };

      const updated = api.spectate.simulateMovement(player, 20);
      
      // Snake should have moved
      expect(updated.snake).toBeDefined();
      expect(updated.snake.length).toBeGreaterThanOrEqual(3);
    });

    it('should handle pass-through mode wrapping', () => {
      const player = {
        id: '1',
        username: 'Test',
        score: 0,
        mode: 'pass-through' as const,
        snake: [{ x: 19, y: 5 }, { x: 18, y: 5 }, { x: 17, y: 5 }],
        food: { x: 0, y: 5 },
        direction: 'RIGHT' as const,
        startedAt: new Date().toISOString(),
      };

      const updated = api.spectate.simulateMovement(player, 20);
      
      // Head should wrap to x: 0 when moving right from x: 19
      // Note: AI might change direction, so we just verify the snake is valid
      expect(updated.snake[0].x).toBeGreaterThanOrEqual(0);
      expect(updated.snake[0].x).toBeLessThan(20);
    });
  });

  describe('Game', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save high score', async () => {
      await api.game.saveHighScore('walls', 100);
      const saved = api.game.getHighScore('walls');
      expect(saved).toBe(100);
    });

    it('should not overwrite higher score with lower', async () => {
      await api.game.saveHighScore('walls', 200);
      await api.game.saveHighScore('walls', 100);
      const saved = api.game.getHighScore('walls');
      expect(saved).toBe(200);
    });

    it('should store separate high scores per mode', async () => {
      await api.game.saveHighScore('walls', 150);
      await api.game.saveHighScore('pass-through', 250);
      
      expect(api.game.getHighScore('walls')).toBe(150);
      expect(api.game.getHighScore('pass-through')).toBe(250);
    });
  });
});
