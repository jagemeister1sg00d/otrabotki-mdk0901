export interface Player {
  id: string;
  username: string;
  avatar: string;
  level: number;
  experience: number;
  rating: number;
  gamesPlayed: number;
  gamesWon: number;
}

export interface GameSession {
  id: string;
  gameId: string;
  gameName: string;
  startTime: Date;
  endTime: Date | null;
  players: Player[];
  winnerId: string | null;
  status: 'waiting' | 'active' | 'finished' | 'cancelled';
  maxPlayers: number;
  currentPlayers: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  points: number;
  unlocked: boolean;
  unlockDate: Date | null;
  category: 'game' | 'social' | 'skill' | 'special';
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  type: 'xp' | 'coins' | 'item' | 'badge';
  value: number;
  icon: string;
  awarded: boolean;
  awardDate: Date | null;
}

export interface MultiplayerGame {
  id: string;
  name: string;
  description: string;
  maxPlayers: number;
  minPlayers: number;
  activePlayers: number;
  status: 'waiting' | 'in_progress' | 'finished';
  hostId: string;
  players: Player[];
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'system' | 'game_event';
}