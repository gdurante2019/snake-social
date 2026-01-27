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
    console.error('API Error:', response.status, errorData);
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
      // Lazy refresh from storage if null
      if (!currentToken) {
        currentToken = localStorage.getItem('snake_token');
      }
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
      const response = await fetch(`${API_PREFIX}/leaderboard/${query}`, {
        headers: getHeaders(),
      });
      return handleResponse<LeaderboardEntry[]>(response);
    },

    submitScore: async (score: number, mode: GameMode): Promise<LeaderboardEntry | null> => {
      console.log('Attempting to submit score:', score, mode);
      const token = api.auth.getToken();

      if (!token) {
        console.warn('Cannot submit score: No auth token found.');
        return null;
      }

      console.log('Token found, sending request...');
      try {
        const response = await fetch(`${API_PREFIX}/leaderboard/`, { // Note: Backend route is /api/leaderboard/ (add_leaderboard_entry) or /api/game/highscore?
          // Wait, backend/app/routes/leaderboard.py usually handles GET.
          // backend/app/routes/game.py usually handles POST highscore.
          // Let's check where the POST request should go.
          // api.ts said /api/leaderboard/ in the original code? 
          // NO! The original code hadTWO implementations?
          // Lines 156-160: fetch(`${API_PREFIX}/leaderboard/`)
          // Lines 347-351: fetch(`${API_PREFIX}/game/highscore`)

          // Debugging: The original file had `api.leaderboard.submitScore` AND `api.game.saveHighScore`.
          // `useGameLogic` calls `api.game.saveHighScore`.
          // `api.game.saveHighScore` calls `/api/game/highscore`. (Line 347)

          method: 'POST',
          headers: getHeaders(token),
          body: JSON.stringify({ score, mode }),
        });
        return handleResponse<LeaderboardEntry | null>(response);
      } catch (err) {
        console.error('Submit score failed:', err);
        throw err;
      }
    },
  },

  game: {
    saveHighScore: async (mode: GameMode, score: number): Promise<void> => {
      console.log('saveHighScore called:', mode, score);
      // Also save locally for offline access/fallback
      const key = `snake_highscore_${mode}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      if (score > current) {
        localStorage.setItem(key, String(score));
      }

      const token = api.auth.getToken();
      if (token) {
        try {
          // Check route: /api/game/highscore
          console.log('Sending POST to /api/game/highscore');
          await fetch(`${API_PREFIX}/game/highscore`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ score, mode }),
          });
          console.log('Score submitted successfully');
        } catch (e) {
          console.error('Failed to save high score to backend', e);
        }
      } else {
        console.warn('Skipping backend save: No Token');
      }
    },
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
        // AI Logic: Choose a new direction towards food, but avoid walls if in 'walls' mode
        const possibleDirections: Direction[] = [];

        // Determine potential moves
        const moves = [
          { dir: 'UP', x: head.x, y: head.y - 1 },
          { dir: 'DOWN', x: head.x, y: head.y + 1 },
          { dir: 'LEFT', x: head.x - 1, y: head.y },
          { dir: 'RIGHT', x: head.x + 1, y: head.y },
        ] as const;

        for (const move of moves) {
          // Don't reverse
          if (move.dir === 'UP' && currentDirection === 'DOWN') continue;
          if (move.dir === 'DOWN' && currentDirection === 'UP') continue;
          if (move.dir === 'LEFT' && currentDirection === 'RIGHT') continue;
          if (move.dir === 'RIGHT' && currentDirection === 'LEFT') continue;

          // Check bounds for Walls mode
          if (player.mode === 'walls') {
            if (move.x < 0 || move.x >= gridSize || move.y < 0 || move.y >= gridSize) {
              continue;
            }
          }

          // Check self-collision (avoid body)
          if (snake.some(segment => segment.x === move.x && segment.y === move.y)) {
            continue;
          }

          // Simple heuristic: Does it move closer to food?
          // (Or just add it as a valid move and we pick best later, but original logic was random-ish)
          possibleDirections.push(move.dir);
        }

        // Filter for "good" moves (towards food) if possible, otherwise pick any safe move
        const betterMoves = possibleDirections.filter(d => {
          if (d === 'UP' && dy < 0) return true;
          if (d === 'DOWN' && dy > 0) return true;
          if (d === 'LEFT' && dx < 0) return true;
          if (d === 'RIGHT' && dx > 0) return true;
          return false;
        });

        if (betterMoves.length > 0) {
          newDirection = betterMoves[Math.floor(Math.random() * betterMoves.length)];
        } else if (possibleDirections.length > 0) {
          // If no move towards food is safe (or possible), pick any safe move (e.g. to avoid wall)
          newDirection = possibleDirections[Math.floor(Math.random() * possibleDirections.length)];
        }
      }

      // Force turn if hitting wall in current direction (and we didn't change direction above OR random check failed)
      // This is a safety net to prevent walking into walls
      if (player.mode === 'walls') {
        let nextX = head.x;
        let nextY = head.y;
        switch (newDirection) {
          case 'UP': nextY--; break;
          case 'DOWN': nextY++; break;
          case 'LEFT': nextX--; break;
          case 'RIGHT': nextX++; break;
        }

        if (nextX < 0 || nextX >= gridSize || nextY < 0 || nextY >= gridSize) {
          // We are about to hit a wall! Panic and find ANY safe direction
          const emergencyMoves = (['UP', 'DOWN', 'LEFT', 'RIGHT'] as Direction[]).filter(d => {
            if (d === 'UP' && newDirection === 'DOWN') return false;
            if (d === 'DOWN' && newDirection === 'UP') return false;
            if (d === 'LEFT' && newDirection === 'RIGHT') return false;
            if (d === 'RIGHT' && newDirection === 'LEFT') return false;

            let tx = head.x, ty = head.y;
            if (d === 'UP') ty--;
            if (d === 'DOWN') ty++;
            if (d === 'LEFT') tx--;
            if (d === 'RIGHT') tx++;
            return tx >= 0 && tx < gridSize && ty >= 0 && ty < gridSize;
          });

          if (emergencyMoves.length > 0) {
            newDirection = emergencyMoves[0];
          }
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
      } else {
        // Clamp for walls mode just in case (rendering safety)
        newHead.x = Math.max(0, Math.min(newHead.x, gridSize - 1));
        newHead.y = Math.max(0, Math.min(newHead.y, gridSize - 1));
      }

      // Check Death (Self-collision)
      if (snake.some(s => s.x === newHead.x && s.y === newHead.y)) {
        // Respawn
        const startX = Math.floor(Math.random() * (gridSize - 4)) + 2;
        const startY = Math.floor(Math.random() * (gridSize - 4)) + 2;
        return {
          ...player,
          snake: [{ x: startX, y: startY }, { x: startX - 1, y: startY }, { x: startX - 2, y: startY }],
          score: 0,
          direction: 'RIGHT',
          food: { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) }
        };
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
      console.log('saveHighScore called:', mode, score);
      // Also save locally for offline access/fallback
      const key = `snake_highscore_${mode}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      if (score > current) {
        localStorage.setItem(key, String(score));
      }

      const token = api.auth.getToken();
      if (token) {
        try {
          console.log('Sending POST to /api/game/highscore');
          await fetch(`${API_PREFIX}/game/highscore`, {
            method: 'POST',
            headers: getHeaders(token),
            body: JSON.stringify({ score, mode }),
          });
          console.log('Score submitted successfully');
        } catch (e) {
          console.error('Failed to save high score to backend', e);
        }
      } else {
        console.warn('Skipping backend save: No Token found. Current User:', currentUser);
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
