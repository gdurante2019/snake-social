import { User, LeaderboardEntry, ActivePlayer, GameMode, Position, Direction } from '@/types/game';

// Simulated delay to mimic network latency
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock data storage
let mockUsers: User[] = [
  { id: '1', username: 'SnakeMaster', email: 'master@snake.io', createdAt: '2024-01-01' },
  { id: '2', username: 'PixelViper', email: 'viper@snake.io', createdAt: '2024-01-05' },
  { id: '3', username: 'NeonSlither', email: 'neon@snake.io', createdAt: '2024-01-10' },
];

let currentUser: User | null = null;

const mockLeaderboard: LeaderboardEntry[] = [
  { id: '1', rank: 1, username: 'SnakeMaster', score: 2450, mode: 'walls', date: '2024-12-28' },
  { id: '2', rank: 2, username: 'PixelViper', score: 2100, mode: 'pass-through', date: '2024-12-29' },
  { id: '3', rank: 3, username: 'NeonSlither', score: 1850, mode: 'walls', date: '2024-12-30' },
  { id: '4', rank: 4, username: 'ByteCrawler', score: 1720, mode: 'pass-through', date: '2024-12-27' },
  { id: '5', rank: 5, username: 'GridGhost', score: 1650, mode: 'walls', date: '2024-12-26' },
  { id: '6', rank: 6, username: 'ArcadeAce', score: 1580, mode: 'pass-through', date: '2024-12-25' },
  { id: '7', rank: 7, username: 'RetroRacer', score: 1490, mode: 'walls', date: '2024-12-24' },
  { id: '8', rank: 8, username: 'NightCrawler', score: 1350, mode: 'pass-through', date: '2024-12-23' },
  { id: '9', rank: 9, username: 'DigitalDragon', score: 1280, mode: 'walls', date: '2024-12-22' },
  { id: '10', rank: 10, username: 'CyberSerpent', score: 1150, mode: 'pass-through', date: '2024-12-21' },
];

// Generate active players with AI movement simulation
const generateActivePlayer = (id: string, username: string): ActivePlayer => {
  const gridSize = 20;
  const snakeLength = Math.floor(Math.random() * 5) + 3;
  const startX = Math.floor(Math.random() * (gridSize - snakeLength));
  const startY = Math.floor(Math.random() * gridSize);
  
  const snake: Position[] = [];
  for (let i = 0; i < snakeLength; i++) {
    snake.push({ x: startX + i, y: startY });
  }
  
  return {
    id,
    username,
    score: Math.floor(Math.random() * 500) + 50,
    mode: Math.random() > 0.5 ? 'walls' : 'pass-through',
    snake,
    food: {
      x: Math.floor(Math.random() * gridSize),
      y: Math.floor(Math.random() * gridSize),
    },
    direction: 'RIGHT',
    startedAt: new Date().toISOString(),
  };
};

let mockActivePlayers: ActivePlayer[] = [
  generateActivePlayer('p1', 'LivePlayer1'),
  generateActivePlayer('p2', 'GamerX99'),
  generateActivePlayer('p3', 'SnakeNinja'),
];

// API Service - Centralized mock backend calls
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string): Promise<{ user: User; token: string }> => {
      await delay(800);
      
      const user = mockUsers.find(u => u.email === email);
      if (!user) {
        throw new Error('Invalid email or password');
      }
      
      // In a real app, we'd verify the password
      if (password.length < 4) {
        throw new Error('Invalid email or password');
      }
      
      currentUser = user;
      return { user, token: 'mock-jwt-token-' + user.id };
    },
    
    signup: async (username: string, email: string, password: string): Promise<{ user: User; token: string }> => {
      await delay(1000);
      
      if (mockUsers.some(u => u.email === email)) {
        throw new Error('Email already registered');
      }
      
      if (mockUsers.some(u => u.username === username)) {
        throw new Error('Username already taken');
      }
      
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters');
      }
      
      const newUser: User = {
        id: String(mockUsers.length + 1),
        username,
        email,
        createdAt: new Date().toISOString(),
      };
      
      mockUsers.push(newUser);
      currentUser = newUser;
      
      return { user: newUser, token: 'mock-jwt-token-' + newUser.id };
    },
    
    logout: async (): Promise<void> => {
      await delay(300);
      currentUser = null;
    },
    
    getCurrentUser: async (): Promise<User | null> => {
      await delay(200);
      return currentUser;
    },
    
    getSession: (): User | null => {
      // Synchronous check for stored session
      const stored = localStorage.getItem('snake_user');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return null;
        }
      }
      return currentUser;
    },
    
    persistSession: (user: User | null) => {
      if (user) {
        localStorage.setItem('snake_user', JSON.stringify(user));
        currentUser = user;
      } else {
        localStorage.removeItem('snake_user');
        currentUser = null;
      }
    },
  },
  
  // Leaderboard endpoints
  leaderboard: {
    getAll: async (mode?: GameMode): Promise<LeaderboardEntry[]> => {
      await delay(500);
      
      if (mode) {
        return mockLeaderboard.filter(entry => entry.mode === mode);
      }
      
      return mockLeaderboard;
    },
    
    submitScore: async (score: number, mode: GameMode): Promise<LeaderboardEntry | null> => {
      await delay(600);
      
      if (!currentUser) {
        throw new Error('Must be logged in to submit score');
      }
      
      // Check if score qualifies for leaderboard
      const lowestScore = mockLeaderboard[mockLeaderboard.length - 1]?.score || 0;
      
      if (score > lowestScore || mockLeaderboard.length < 10) {
        const newEntry: LeaderboardEntry = {
          id: String(Date.now()),
          rank: 0, // Will be calculated
          username: currentUser.username,
          score,
          mode,
          date: new Date().toISOString().split('T')[0],
        };
        
        // Insert and re-rank
        mockLeaderboard.push(newEntry);
        mockLeaderboard.sort((a, b) => b.score - a.score);
        mockLeaderboard.forEach((entry, index) => {
          entry.rank = index + 1;
        });
        
        // Keep only top 10
        if (mockLeaderboard.length > 10) {
          mockLeaderboard.pop();
        }
        
        return newEntry;
      }
      
      return null;
    },
  },
  
  // Live players / Spectate endpoints
  spectate: {
    getActivePlayers: async (): Promise<ActivePlayer[]> => {
      await delay(400);
      return mockActivePlayers;
    },
    
    getPlayerState: async (playerId: string): Promise<ActivePlayer | null> => {
      await delay(100);
      return mockActivePlayers.find(p => p.id === playerId) || null;
    },
    
    // Simulate AI movement for spectating
    simulateMovement: (player: ActivePlayer, gridSize: number = 20): ActivePlayer => {
      const { snake, food, direction: currentDirection } = player;
      const head = snake[0];
      
      // Simple AI: move towards food, avoid walls
      let newDirection: Direction = currentDirection;
      
      // Determine best direction to food
      const dx = food.x - head.x;
      const dy = food.y - head.y;
      
      // Random chance to change direction (makes it more interesting)
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
      
      // Calculate new head position
      let newHead = { ...head };
      switch (newDirection) {
        case 'UP': newHead.y -= 1; break;
        case 'DOWN': newHead.y += 1; break;
        case 'LEFT': newHead.x -= 1; break;
        case 'RIGHT': newHead.x += 1; break;
      }
      
      // Handle pass-through mode
      if (player.mode === 'pass-through') {
        if (newHead.x < 0) newHead.x = gridSize - 1;
        if (newHead.x >= gridSize) newHead.x = 0;
        if (newHead.y < 0) newHead.y = gridSize - 1;
        if (newHead.y >= gridSize) newHead.y = 0;
      }
      
      // Check if ate food
      const ateFood = newHead.x === food.x && newHead.y === food.y;
      
      const newSnake = [newHead, ...snake];
      if (!ateFood) {
        newSnake.pop();
      }
      
      // Generate new food if eaten
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
  
  // Game state persistence
  game: {
    saveHighScore: async (mode: GameMode, score: number): Promise<void> => {
      await delay(200);
      const key = `snake_highscore_${mode}`;
      const current = parseInt(localStorage.getItem(key) || '0');
      if (score > current) {
        localStorage.setItem(key, String(score));
      }
    },
    
    getHighScore: (mode: GameMode): number => {
      const key = `snake_highscore_${mode}`;
      return parseInt(localStorage.getItem(key) || '0');
    },
  },
};

export default api;
