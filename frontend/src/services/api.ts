import { User, LeaderboardEntry, ActivePlayer, GameMode, Direction } from '@/types/game';

const API_PREFIX = '/api';

const getHeaders = (token?: string) => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Helper to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let errorMessage = errorData.detail || 'API request failed';

    if (typeof errorMessage !== 'string') {
      if (Array.isArray(errorMessage)) {
        // Handle Pydantic/FastAPI validation errors
        errorMessage = errorMessage.map((e: any) => e.msg || JSON.stringify(e)).join(', ');
      } else {
        errorMessage = JSON.stringify(errorMessage);
      }
    }

    throw new Error(errorMessage);
  }
  return response.json();
};

// Auth state helper
let currentToken: string | null = localStorage.getItem('snake_token');
let currentUser: User | null = localStorage.getItem('snake_user')
  ? JSON.parse(localStorage.getItem('snake_user')!)
  : null;

export const api = {
  auth: {
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      const response = await fetch(`${API_PREFIX}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse<{ user: User; token: string }>(response);

      currentUser = data.user;
      currentToken = data.token;
      api.auth.persistSession(data.user, data.token);

      return data;
    },

    signup: async (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
      const response = await fetch(`${API_PREFIX}/auth/signup`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, email, password }),
      });
      const data = await handleResponse<{ user: User; token: string }>(response);

      currentUser = data.user;
      currentToken = data.token;
      api.auth.persistSession(data.user, data.token);

      return data;
    },

    resetPassword: async (email: string, password: string): Promise<void> => {
      await fetch(`${API_PREFIX}/auth/reset-password`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, new_password: password }),
      });
    },

    deleteAccount: async (): Promise<void> => {
      if (currentToken) {
        await fetch(`${API_PREFIX}/auth/delete`, {
          method: 'DELETE',
          headers: getHeaders(currentToken),
        });
        api.auth.persistSession(null, null);
      }
    },

    logout: async (): Promise<void> => {
      if (currentToken) {
        await fetch(`${API_PREFIX}/auth/logout`, {
          method: 'POST',
          headers: getHeaders(currentToken),
        }).catch(err => console.error('Logout failed', err));
      }
      api.auth.persistSession(null, null);
    },

    getCurrentUser: async (): Promise<User | null> => {
      if (!currentToken) return null;
      try {
        const response = await fetch(`${API_PREFIX}/auth/me`, {
          headers: getHeaders(currentToken),
        });
        const user = await handleResponse<User>(response);
        currentUser = user;
        localStorage.setItem('snake_user', JSON.stringify(user));
        return user;
      } catch (err) {
        // If token is invalid, clear session
        api.auth.persistSession(null, null);
        return null;
      }
    },

    getSession: (): User | null => {
      return currentUser;
    },

    getToken: (): string | null => {
      return currentToken;
    },

    persistSession: (user: User | null, token: string | null = null) => {
      if (user && token) {
        localStorage.setItem('snake_user', JSON.stringify(user));
        localStorage.setItem('snake_token', token);
        currentUser = user;
        currentToken = token;
      } else {
        localStorage.removeItem('snake_user');
        localStorage.removeItem('snake_token');
        currentUser = null;
        currentToken = null;
      }
    },
  },

  leaderboard: {
    getAll: async (mode?: GameMode): Promise<LeaderboardEntry[]> => {
      const query = mode ? `?mode=${mode}` : '';
      const response = await fetch(`${API_PREFIX}/leaderboard${query}`, {
        headers: getHeaders(),
      });
      return handleResponse<LeaderboardEntry[]>(response);
    },

    submitScore: async (score: number, mode: GameMode): Promise<LeaderboardEntry | null> => {
      if (!currentToken) {
        throw new Error('Must be logged in to submit score');
      }

      const response = await fetch(`${API_PREFIX}/leaderboard`, {
        method: 'POST',
        headers: getHeaders(currentToken),
        body: JSON.stringify({ score, mode }),
      });

      return handleResponse<LeaderboardEntry | null>(response);
    },
  },

  spectate: {
    getActivePlayers: async (): Promise<ActivePlayer[]> => {
      const response = await fetch(`${API_PREFIX}/spectate/active`, {
        headers: getHeaders(),
      });
      return handleResponse<ActivePlayer[]>(response);
    },

    getPlayerState: async (playerId: string): Promise<ActivePlayer | null> => {
      const response = await fetch(`${API_PREFIX}/spectate/player/${playerId}`, {
        headers: getHeaders(),
      });
      return handleResponse<ActivePlayer | null>(response);
    },

    // Simulate AI movement for spectating (Client-side usage preserved)
    simulateMovement: (player: ActivePlayer, gridSize: number = 20): ActivePlayer => {
      const { snake, food, direction: currentDirection } = player;
      const head = snake[0];

      let newDirection: Direction = currentDirection;

      const dx = food.x - head.x;
      const dy = food.y - head.y;

      if (Math.random() > 0.7) {
        const possibleDirections: Direction[] = [];

        if (dx > 0 && currentDirection !== 'LEFT') possibleDirections.push('RIGHT');
        if (dx < 0 && currentDirection !== 'RIGHT') possibleDirections.push('LEFT');
        if (dy > 0 && currentDirection !== 'UP') possibleDirections.push('DOWN');
        if (dy < 0 && currentDirection !== 'DOWN') possibleDirections.push('UP');

        if (possibleDirections.length > 0) {
          newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
      }

      let newHead = { ...head };
      switch (newDirection) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }

      if (player.mode === 'pass-through') {
        if (newHead.x < 0) newHead.x = gridSize - 1;
        if (newHead.x >= gridSize) newHead.x = 0;
        if (newHead.y < 0) newHead.y = gridSize - 1;
        if (newHead.y >= gridSize) newHead.y = 0;
      }

      const ateFood = newHead.x === food.x && newHead.y === food.y;

      const newSnake = [newHead, ...snake];
      if (!ateFood) {
        newSnake.pop();
      }

      let newFood = food;
      if (ateFood) {
        newFood = {
          x: Math.floor(Math.random() * gridSize),
          y: Math.floor(Math.random() * gridSize),
        };
      }

      return {
        ...player,
        snake: newSnake,
        food: newFood,
        direction: newDirection,
        score: ateFood ? player.score + 10 : player.score,
      };
    },
  },

  game: {
    saveHighScore: async (mode: GameMode, score: number): Promise<void> => {
      // Also save locally for offline access/fallback
      const key = `snake_highscore_${mode}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      if (score > current) {
        localStorage.setItem(key, String(score));
      }

      if (currentToken) {
        try {
          await fetch(`${API_PREFIX}/game/highscore`, {
            method: 'POST',
            headers: getHeaders(currentToken),
            body: JSON.stringify({ score, mode }),
          });
        } catch (e) {
          console.error('Failed to save high score to backend', e);
        }
      }
    },

    getHighScore: async (mode: GameMode): Promise<number> => {
      // Try backend first if logged in
      if (currentToken) {
        try {
          const response = await fetch(`${API_PREFIX}/game/highscore?mode=${mode}`, {
            headers: getHeaders(currentToken),
          });
          if (response.ok) {
            const data = await response.json();
            return data.score;
          }
        } catch (e) {
          console.error('Failed to fetch high score from backend', e);
        }
      }

      // Fallback to local storage
      const key = `snake_highscore_${mode}`;
      return parseInt(localStorage.getItem(key) || '0');
    },
  },
};

export default api;
