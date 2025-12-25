import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Player, PlayerStats, RatingHistory, LeaderboardEntry } from '../models/game.models';
import { GameUtils } from '../utils/game.utils';

@Injectable({
  providedIn: 'root'
})
export class PlayerRatingService {
  private players: Player[] = [];
  private leaderboardSubject = new BehaviorSubject<LeaderboardEntry[]>([]);
  private ratingHistorySubject = new BehaviorSubject<RatingHistory[]>([]);
  
  leaderboard$ = this.leaderboardSubject.asObservable();
  ratingHistory$ = this.ratingHistorySubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Обновить рейтинг после игры
  updateRating(
    winnerId: string,
    loserId: string,
    gameId: string
  ): Observable<{ winner: Player; loser: Player; ratingChange: number }> {
    const winner = this.players.find(p => p.id === winnerId);
    const loser = this.players.find(p => p.id === loserId);

    if (!winner || !loser) {
      throw new Error('Игроки не найдены');
    }

    const ratingChange = GameUtils.calculateRatingChange(winner.rating, loser.rating);
    
    // Обновляем рейтинг победителя и проигравшего
    winner.rating += ratingChange;
    loser.rating = Math.max(0, loser.rating - ratingChange);
    
    // Обновляем статистику
    winner.gamesPlayed += 1;
    winner.gamesWon += 1;
    loser.gamesPlayed += 1;

    // Добавляем в историю рейтингов
    this.addRatingHistory(winnerId, winner.rating, ratingChange, gameId);
    this.addRatingHistory(loserId, loser.rating, -ratingChange, gameId);

    // Обновляем таблицу лидеров
    this.updateLeaderboard();

    return of({ winner, loser, ratingChange }).pipe(delay(300));
  }

  // Получить статистику игрока
  getPlayerStats(playerId: string): Observable<PlayerStats> {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Игрок не найден');
    }

    const stats: PlayerStats = {
      totalGames: player.gamesPlayed,
      wins: player.gamesWon,
      losses: player.gamesPlayed - player.gamesWon,
      draws: 0, // Для простоты
      winRate: GameUtils.calculateWinRate(player.gamesWon, player.gamesPlayed),
      averageScore: 75, // Примерное значение
      bestScore: 100,
      totalPlayTime: player.gamesPlayed * 30 * 60 // 30 минут на игру
    };

    return of(stats).pipe(delay(200));
  }

  // Получить таблицу лидеров
  getLeaderboard(top: number = 10): Observable<LeaderboardEntry[]> {
    return of(this.leaderboardSubject.value.slice(0, top)).pipe(delay(200));
  }

  // Получить историю рейтинга игрока
  getPlayerRatingHistory(playerId: string): Observable<RatingHistory[]> {
    const history = this.ratingHistorySubject.value
      .filter(h => h.gameId.includes(playerId))
      .sort((a, b) => b.date.getTime() - a.date.getTime());
    
    return of(history).pipe(delay(200));
  }

  // Получить позицию игрока в таблице лидеров
  getPlayerRank(playerId: string): Observable<number> {
    const leaderboard = this.leaderboardSubject.value;
    const entry = leaderboard.find(e => e.playerId === playerId);
    
    return of(entry ? entry.rank : 0).pipe(delay(100));
  }

  // Получить прогресс игрока
  getPlayerProgress(playerId: string): Observable<{
    level: number;
    experience: number;
    experienceToNextLevel: number;
    levelProgress: number;
  }> {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Игрок не найден');
    }

    const level = player.level;
    const experience = player.experience;
    const experienceToNextLevel = GameUtils.calculateExperienceToNextLevel(level);
    const levelProgress = (experience / experienceToNextLevel) * 100;

    return of({
      level,
      experience,
      experienceToNextLevel,
      levelProgress
    }).pipe(delay(150));
  }

  // Добавить опыт игроку
  addExperience(playerId: string, xp: number): Observable<Player> {
    const player = this.players.find(p => p.id === playerId);
    
    if (!player) {
      throw new Error('Игрок не найден');
    }

    player.experience += xp;
    const newLevel = GameUtils.calculateLevel(player.experience);
    
    if (newLevel > player.level) {
      player.level = newLevel;
      // Здесь можно добавить логику награды за уровень
    }

    this.updateLeaderboard();
    
    return of(player).pipe(delay(200));
  }

  // Вспомогательные методы
  private addRatingHistory(
    playerId: string,
    rating: number,
    change: number,
    gameId: string
  ): void {
    const history: RatingHistory = {
      date: new Date(),
      rating,
      change,
      gameId: `${gameId}_${playerId}`
    };

    const currentHistory = this.ratingHistorySubject.value;
    this.ratingHistorySubject.next([history, ...currentHistory]);
  }

  private updateLeaderboard(): void {
    const leaderboard = this.players
      .map((player, index) => ({
        rank: index + 1,
        playerId: player.id,
        username: player.username,
        avatar: player.avatar,
        rating: player.rating,
        gamesPlayed: player.gamesPlayed,
        winRate: GameUtils.calculateWinRate(player.gamesWon, player.gamesPlayed),
        lastActive: new Date() // В реальном приложении нужно хранить время последней активности
      }))
      .sort((a, b) => b.rating - a.rating)
      .map((entry, index) => ({ ...entry, rank: index + 1 }));

    this.leaderboardSubject.next(leaderboard);
  }

  private initializeMockData(): void {
    this.players = [
      {
        id: 'player1',
        username: 'Алексей',
        avatar: '👑',
        level: 15,
        experience: 5600,
        rating: 1850,
        gamesPlayed: 120,
        gamesWon: 85
      },
      {
        id: 'player2',
        username: 'Мария',
        avatar: '🎯',
        level: 12,
        experience: 3800,
        rating: 1720,
        gamesPlayed: 95,
        gamesWon: 65
      },
      {
        id: 'player3',
        username: 'Дмитрий',
        avatar: '⚔️',
        level: 10,
        experience: 2500,
        rating: 1650,
        gamesPlayed: 80,
        gamesWon: 50
      },
      {
        id: 'player4',
        username: 'Анна',
        avatar: '🌟',
        level: 8,
        experience: 1800,
        rating: 1520,
        gamesPlayed: 60,
        gamesWon: 35
      },
      {
        id: 'player5',
        username: 'Сергей',
        avatar: '🎮',
        level: 6,
        experience: 1200,
        rating: 1420,
        gamesPlayed: 45,
        gamesWon: 25
      }
    ];

    // Инициализация истории рейтингов
    const mockHistory: RatingHistory[] = [];
    for (let i = 0; i < 20; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      mockHistory.push({
        date,
        rating: 1500 + Math.random() * 500,
        change: Math.random() > 0.5 ? 15 : -10,
        gameId: `game_${i}`
      });
    }

    this.ratingHistorySubject.next(mockHistory);
    this.updateLeaderboard();
  }
}