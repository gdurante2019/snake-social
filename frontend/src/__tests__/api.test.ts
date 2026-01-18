
import { describe, it, expect, beforeEach, vi, afterEach, Mock } from 'vitest';
import { api } from '@/services/api';

// Mock global fetch
global.fetch = vi.fn();

describe('API Service', () => {
  beforeEach(() => {
    // Clear mocks and localStorage
    vi.clearAllMocks();
    localStorage.clear();
    // Reset internal state of api (currentUser/token) if possible, or just rely on public methods
    api.auth.persistSession(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const mockResponse = (data: any, ok: boolean = true) => {
    (global.fetch as Mock).mockResolvedValue({
      ok,
      json: async () => data,
    });
  };

  const mockErrorResponse = (message: string) => {
    (global.fetch as Mock).mockResolvedValue({
      ok: false,
      json: async () => ({ detail: message }),
    });
  };

  describe('Auth', () => {
    it('should login and store token', async () => {
      const mockUser = { id: '1', username: 'Test', email: 'test@example.com' };
      const mockToken = 'jwt-token';

      mockResponse({ user: mockUser, token: mockToken });

      const result = await api.auth.login('test@example.com', 'password');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ email: 'test@example.com', password: 'password' }),
      }));

      expect(result.user).toEqual(mockUser);
      expect(result.token).toEqual(mockToken);
      expect(api.auth.getToken()).toEqual(mockToken);
      expect(localStorage.getItem('snake_token')).toEqual(mockToken);
    });

    it('should handle login failure', async () => {
      mockErrorResponse('Invalid credentials');

      await expect(api.auth.login('bad@ex.com', 'pass'))
        .rejects.toThrow('Invalid credentials');
    });

    it('should signup correctly', async () => {
      const mockUser = { id: '2', username: 'New', email: 'new@example.com' };
      mockResponse({ user: mockUser, token: 'new-token' });

      await api.auth.signup('New', 'new@example.com', 'pass');

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/signup', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ username: 'New', email: 'new@example.com', password: 'pass' }),
      }));
    });

    it('should logout', async () => {
      api.auth.persistSession({ id: '1', username: 'u', email: 'e' } as any, 'token');
      mockResponse({});

      await api.auth.logout();

      expect(global.fetch).toHaveBeenCalledWith('/api/auth/logout', expect.anything());
      expect(api.auth.getToken()).toBeNull();
      expect(localStorage.getItem('snake_token')).toBeNull();
    });
  });

  describe('Leaderboard', () => {
    it('should fetch leaderboard', async () => {
      const mockEntries = [{ id: '1', score: 100 }];
      mockResponse(mockEntries);

      const result = await api.leaderboard.getAll();
      expect(result).toEqual(mockEntries);
      expect(global.fetch).toHaveBeenCalledWith('/api/leaderboard', expect.anything());
    });

    it('should fetch leaderboard with mode', async () => {
      mockResponse([]);
      await api.leaderboard.getAll('walls');
      expect(global.fetch).toHaveBeenCalledWith('/api/leaderboard?mode=walls', expect.anything());
    });

    it('should submit score', async () => {
      api.auth.persistSession({} as any, 'token');
      mockResponse({});

      await api.leaderboard.submitScore(100, 'walls');

      expect(global.fetch).toHaveBeenCalledWith('/api/leaderboard', expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer token'
        }),
        body: JSON.stringify({ score: 100, mode: 'walls' }),
      }));
    });
  });

  describe('Game High Score', () => {
    it('should save high score to local storage and backend', async () => {
      api.auth.persistSession({} as any, 'token');
      mockResponse({});

      await api.game.saveHighScore('walls', 500);

      expect(localStorage.getItem('snake_highscore_walls')).toBe('500');
      expect(global.fetch).toHaveBeenCalledWith('/api/game/highscore', expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ score: 500, mode: 'walls' }),
      }));
    });

    it('should fetch high score from backend if logged in', async () => {
      api.auth.persistSession({} as any, 'token');
      mockResponse({ score: 1000 });

      const score = await api.game.getHighScore('walls');
      expect(score).toBe(1000);
      expect(global.fetch).toHaveBeenCalledWith('/api/game/highscore?mode=walls', expect.anything());
    });
  });
});
