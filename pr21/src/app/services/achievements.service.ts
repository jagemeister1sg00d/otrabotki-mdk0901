import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { Achievement, Reward } from '../models/game.models';

@Injectable({
  providedIn: 'root'
})
export class AchievementsService {
  private achievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private rewardsSubject = new BehaviorSubject<Reward[]>([]);
  private playerAchievementsSubject = new BehaviorSubject<Achievement[]>([]);
  private playerRewardsSubject = new BehaviorSubject<Reward[]>([]);
  
  achievements$ = this.achievementsSubject.asObservable();
  rewards$ = this.rewardsSubject.asObservable();
  playerAchievements$ = this.playerAchievementsSubject.asObservable();
  playerRewards$ = this.playerRewardsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Получить все доступные достижения
  getAllAchievements(): Observable<Achievement[]> {
    return of(this.achievementsSubject.value).pipe(delay(200));
  }

  // Получить достижения игрока
  getPlayerAchievements(playerId: string): Observable<Achievement[]> {
    return of(this.playerAchievementsSubject.value).pipe(delay(200));
  }

  // Разблокировать достижение
  unlockAchievement(playerId: string, achievementId: string): Observable<Achievement> {
    return of(this.achievementsSubject.value.find(a => a.id === achievementId)).pipe(
      delay(300),
      map(achievement => {
        if (!achievement) {
          throw new Error('Достижение не найдено');
        }

        const unlockedAchievement: Achievement = {
          ...achievement,
          unlocked: true,
          unlockDate: new Date()
        };

        // Обновляем список достижений игрока
        const currentAchievements = this.playerAchievementsSubject.value;
        const updatedAchievements = currentAchievements.filter(a => a.id !== achievementId);
        updatedAchievements.push(unlockedAchievement);
        this.playerAchievementsSubject.next(updatedAchievements);

        // Выдаем награду за достижение
        this.awardReward(playerId, {
          id: `reward_${achievementId}`,
          name: `Награда за: ${achievement.name}`,
          description: `Получено за достижение "${achievement.name}"`,
          type: 'xp',
          value: achievement.points * 10,
          icon: '🏆',
          awarded: true,
          awardDate: new Date()
        });

        return unlockedAchievement;
      })
    );
  }

  // Проверить и разблокировать достижения на основе статистики
  checkAndUnlockAchievements(
    playerId: string,
    stats: { gamesPlayed: number; gamesWon: number; rating: number }
  ): Observable<Achievement[]> {
    const newAchievements: Achievement[] = [];
    const achievements = this.achievementsSubject.value;
    const playerAchievements = this.playerAchievementsSubject.value;

    // Проверяем каждое достижение
    achievements.forEach(achievement => {
      if (!playerAchievements.some(a => a.id === achievement.id)) {
        let shouldUnlock = false;

        switch (achievement.id) {
          case 'first_game':
            shouldUnlock = stats.gamesPlayed >= 1;
            break;
          case 'first_win':
            shouldUnlock = stats.gamesWon >= 1;
            break;
          case 'veteran':
            shouldUnlock = stats.gamesPlayed >= 50;
            break;
          case 'champion':
            shouldUnlock = stats.gamesWon >= 25;
            break;
          case 'master':
            shouldUnlock = stats.rating >= 1600;
            break;
        }

        if (shouldUnlock) {
          const unlocked = { ...achievement, unlocked: true, unlockDate: new Date() };
          newAchievements.push(unlocked);
        }
      }
    });

    // Разблокируем все достижения, которые нужно разблокировать
    if (newAchievements.length > 0) {
      const updatedAchievements = [...playerAchievements, ...newAchievements];
      this.playerAchievementsSubject.next(updatedAchievements);

      // Выдаем награды за достижения
      newAchievements.forEach(achievement => {
        this.awardReward(playerId, {
          id: `reward_${achievement.id}`,
          name: `Награда за: ${achievement.name}`,
          description: `Получено за достижение "${achievement.name}"`,
          type: 'xp',
          value: achievement.points * 10,
          icon: '🏆',
          awarded: true,
          awardDate: new Date()
        });
      });
    }

    return of(newAchievements).pipe(delay(400));
  }

  // Выдать награду
  awardReward(playerId: string, reward: Reward): Observable<Reward> {
    const currentRewards = this.playerRewardsSubject.value;
    const updatedRewards = [...currentRewards, reward];
    this.playerRewardsSubject.next(updatedRewards);

    return of(reward).pipe(delay(200));
  }

  // Получить награды игрока
  getPlayerRewards(playerId: string): Observable<Reward[]> {
    return of(this.playerRewardsSubject.value).pipe(delay(200));
  }

  // Получить прогресс по достижениям
  getAchievementProgress(): Observable<{
    total: number;
    unlocked: number;
    progress: number;
    totalPoints: number;
  }> {
    const total = this.achievementsSubject.value.length;
    const unlocked = this.playerAchievementsSubject.value.filter(a => a.unlocked).length;
    const progress = (unlocked / total) * 100;
    const totalPoints = this.playerAchievementsSubject.value
      .filter(a => a.unlocked)
      .reduce((sum, a) => sum + a.points, 0);

    return of({ total, unlocked, progress, totalPoints }).pipe(delay(150));
  }

  // Инициализация тестовых данных
  private initializeMockData(): void {
    const achievements: Achievement[] = [
      {
        id: 'first_game',
        name: 'Первая игра',
        description: 'Сыграйте свою первую игру',
        icon: '🎮',
        points: 10,
        unlocked: false,
        unlockDate: null,
        category: 'game'
      },
      {
        id: 'first_win',
        name: 'Первая победа',
        description: 'Одержите первую победу',
        icon: '🏆',
        points: 25,
        unlocked: false,
        unlockDate: null,
        category: 'game'
      },
      {
        id: 'veteran',
        name: 'Ветеран',
        description: 'Сыграйте 50 игр',
        icon: '🎖️',
        points: 50,
        unlocked: false,
        unlockDate: null,
        category: 'game'
      },
      {
        id: 'champion',
        name: 'Чемпион',
        description: 'Одержите 25 побед',
        icon: '👑',
        points: 100,
        unlocked: false,
        unlockDate: null,
        category: 'game'
      },
      {
        id: 'master',
        name: 'Мастер',
        description: 'Достигните рейтинга 1600',
        icon: '⭐',
        points: 150,
        unlocked: false,
        unlockDate: null,
        category: 'skill'
      },
      {
        id: 'socializer',
        name: 'Общительный',
        description: 'Сыграйте с 10 разными игроками',
        icon: '👥',
        points: 30,
        unlocked: false,
        unlockDate: null,
        category: 'social'
      }
    ];

    const rewards: Reward[] = [
      {
        id: 'welcome_bonus',
        name: 'Бонус новичка',
        description: 'Награда за регистрацию',
        type: 'coins',
        value: 100,
        icon: '💰',
        awarded: true,
        awardDate: new Date('2024-01-15')
      },
      {
        id: 'daily_login',
        name: 'Ежедневный бонус',
        description: 'Награда за ежедневный вход',
        type: 'xp',
        value: 50,
        icon: '📅',
        awarded: true,
        awardDate: new Date()
      }
    ];

    // Предположим, что игрок уже имеет некоторые достижения
    const playerAchievements = achievements.slice(0, 2).map(a => ({
      ...a,
      unlocked: true,
      unlockDate: new Date('2024-01-16')
    }));

    this.achievementsSubject.next(achievements);
    this.rewardsSubject.next(rewards);
    this.playerAchievementsSubject.next(playerAchievements);
    this.playerRewardsSubject.next(rewards);
  }
}