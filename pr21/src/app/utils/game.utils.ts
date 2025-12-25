export class GameUtils {
  static calculateLevel(experience: number): number {
    return Math.floor(Math.sqrt(experience / 100)) + 1;
  }

  static calculateExperienceToNextLevel(level: number): number {
    return Math.pow(level, 2) * 100;
  }

  static calculateWinRate(wins: number, totalGames: number): number {
    return totalGames > 0 ? (wins / totalGames) * 100 : 0;
  }

  static formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}ч ${minutes}м`;
    }
    return `${minutes}м`;
  }

  static generatePlayerId(): string {
    return 'player_' + Math.random().toString(36).substr(2, 9);
  }

  static generateGameId(): string {
    return 'game_' + Math.random().toString(36).substr(2, 9);
  }

  static calculateRatingChange(
    winnerRating: number,
    loserRating: number,
    kFactor: number = 32
  ): number {
    const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
    return Math.round(kFactor * (1 - expectedScore));
  }
}