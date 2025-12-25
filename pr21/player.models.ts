export interface PlayerStats {
  totalGames: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  averageScore: number;
  bestScore: number;
  totalPlayTime: number;
}

export interface RatingHistory {
  date: Date;
  rating: number;
  change: number;
  gameId: string;
}

export interface PlayerProgress {
  level: number;
  experience: number;
  experienceToNextLevel: number;
  levelProgress: number;
  totalExperience: number;
}

export interface LeaderboardEntry {
  rank: number;
  playerId: string;
  username: string;
  avatar: string;
  rating: number;
  gamesPlayed: number;
  winRate: number;
  lastActive: Date;
}