import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GameSessionService } from './services/game-session.service';
import { PlayerRatingService } from './services/player-rating.service';
import { AchievementsService } from './services/achievements.service';
import { MultiplayerService } from './services/multiplayer.service';
import { Player, GameSession, Achievement, MultiplayerGame } from './models/game.models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Текущий игрок (для демонстрации)
  currentPlayer: Player = {
    id: 'player_demo',
    username: 'Демо-Игрок',
    avatar: '🎮',
    level: 5,
    experience: 1200,
    rating: 1500,
    gamesPlayed: 20,
    gamesWon: 12
  };

  // Состояния
  activeSessions: GameSession[] = [];
  leaderboard: any[] = [];
  playerAchievements: Achievement[] = [];
  multiplayerGames: MultiplayerGame[] = [];
  currentMultiplayerGame: MultiplayerGame | null = null;

  // Статистика
  playerStats: any = null;
  achievementProgress: any = null;

  // Состояние загрузки
  isLoading = {
    sessions: false,
    leaderboard: false,
    achievements: false,
    multiplayer: false
  };

  // Ошибки
  errors = {
    sessions: '',
    leaderboard: '',
    achievements: '',
    multiplayer: ''
  };

  // Формы
  newSession = {
    gameName: 'Шахматы',
    maxPlayers: 2
  };

  newMultiplayerGame = {
    name: '',
    description: '',
    maxPlayers: 4
  };

  chatMessage = '';

  constructor(
    private gameSessionService: GameSessionService,
    private playerRatingService: PlayerRatingService,
    private achievementsService: AchievementsService,
    private multiplayerService: MultiplayerService
  ) {}

  ngOnInit(): void {
    this.loadAllData();
    this.subscribeToServices();
  }

  // Загрузка всех данных
  loadAllData(): void {
    this.loadActiveSessions();
    this.loadLeaderboard();
    this.loadPlayerAchievements();
    this.loadMultiplayerGames();
    this.loadPlayerStats();
    this.loadAchievementProgress();
  }

  // Подписка на сервисы
  subscribeToServices(): void {
    // Подписка на обновления игровых сессий
    this.gameSessionService.sessions$.subscribe(sessions => {
      this.activeSessions = sessions;
    });

    // Подписка на обновления таблицы лидеров
    this.playerRatingService.leaderboard$.subscribe(leaderboard => {
      this.leaderboard = leaderboard;
    });

    // Подписка на обновления достижений игрока
    this.achievementsService.playerAchievements$.subscribe(achievements => {
      this.playerAchievements = achievements;
    });

    // Подписка на обновления мультиплеерных игр
    this.multiplayerService.games$.subscribe(games => {
      this.multiplayerGames = games;
    });

    // Подписка на текущую мультиплеерную игру
    this.multiplayerService.currentGame$.subscribe(game => {
      this.currentMultiplayerGame = game;
    });

    // Подписка на обновления игр в реальном времени
    this.multiplayerService.gameUpdates$.subscribe(game => {
      console.log('Обновление игры:', game.name);
    });
  }

  // Загрузка активных сессий
  loadActiveSessions(): void {
    this.isLoading.sessions = true;
    this.errors.sessions = '';
    
    this.gameSessionService.getActiveSessions().subscribe({
      next: (sessions) => {
        this.activeSessions = sessions;
        this.isLoading.sessions = false;
      },
      error: (error) => {
        this.errors.sessions = error.message;
        this.isLoading.sessions = false;
      }
    });
  }

  // Загрузка таблицы лидеров
  loadLeaderboard(): void {
    this.isLoading.leaderboard = true;
    this.errors.leaderboard = '';
    
    this.playerRatingService.getLeaderboard(10).subscribe({
      next: (leaderboard) => {
        this.leaderboard = leaderboard;
        this.isLoading.leaderboard = false;
      },
      error: (error) => {
        this.errors.leaderboard = error.message;
        this.isLoading.leaderboard = false;
      }
    });
  }

  // Загрузка достижений игрока
  loadPlayerAchievements(): void {
    this.isLoading.achievements = true;
    this.errors.achievements = '';
    
    this.achievementsService.getPlayerAchievements(this.currentPlayer.id).subscribe({
      next: (achievements) => {
        this.playerAchievements = achievements;
        this.isLoading.achievements = false;
      },
      error: (error) => {
        this.errors.achievements = error.message;
        this.isLoading.achievements = false;
      }
    });
  }

  // Загрузка мультиплеерных игр
  loadMultiplayerGames(): void {
    this.isLoading.multiplayer = true;
    this.errors.multiplayer = '';
    
    this.multiplayerService.getActiveGames().subscribe({
      next: (games) => {
        this.multiplayerGames = games;
        this.isLoading.multiplayer = false;
      },
      error: (error) => {
        this.errors.multiplayer = error.message;
        this.isLoading.multiplayer = false;
      }
    });
  }

  // Загрузка статистики игрока
  loadPlayerStats(): void {
    this.playerRatingService.getPlayerStats(this.currentPlayer.id).subscribe({
      next: (stats) => {
        this.playerStats = stats;
      },
      error: (error) => {
        console.error('Ошибка загрузки статистики:', error);
      }
    });
  }

  // Загрузка прогресса по достижениям
  loadAchievementProgress(): void {
    this.achievementsService.getAchievementProgress().subscribe({
      next: (progress) => {
        this.achievementProgress = progress;
      },
      error: (error) => {
        console.error('Ошибка загрузки прогресса:', error);
      }
    });
  }

  // Создать новую игровую сессию
  createSession(): void {
    if (!this.newSession.gameName || !this.newSession.maxPlayers) {
      alert('Заполните все поля');
      return;
    }

    this.gameSessionService.createSession(
      this.newSession.gameName,
      this.newSession.maxPlayers
    ).subscribe({
      next: (session) => {
        alert(`Сессия "${session.gameName}" создана!`);
        this.newSession = { gameName: 'Шахматы', maxPlayers: 2 };
      },
      error: (error) => {
        alert(`Ошибка: ${error.message}`);
      }
    });
  }

  // Присоединиться к сессии
  joinSession(sessionId: string): void {
    this.gameSessionService.joinSession(sessionId, this.currentPlayer).subscribe({
      next: (session) => {
        alert(`Вы присоединились к сессии "${session.gameName}"`);
      },
      error: (error) => {
        alert(`Ошибка: ${error.message}`);
      }
    });
  }

  // Создать мультиплеерную игру
  createMultiplayerGame(): void {
    if (!this.newMultiplayerGame.name || !this.newMultiplayerGame.description) {
      alert('Заполните все поля');
      return;
    }

    this.multiplayerService.createGame(
      this.newMultiplayerGame.name,
      this.newMultiplayerGame.description,
      this.newMultiplayerGame.maxPlayers,
      this.currentPlayer
    ).subscribe({
      next: (game) => {
        alert(`Игра "${game.name}" создана!`);
        this.newMultiplayerGame = { name: '', description: '', maxPlayers: 4 };
      },
      error: (error) => {
        alert(`Ошибка: ${error.message}`);
      }
    });
  }

  // Присоединиться к мультиплеерной игре
  joinMultiplayerGame(gameId: string): void {
    this.multiplayerService.joinGame(gameId, this.currentPlayer).subscribe({
      next: (game) => {
        alert(`Вы присоединились к игре "${game.name}"`);
      },
      error: (error) => {
        alert(`Ошибка: ${error.message}`);
      }
    });
  }

  // Отправить сообщение в чат
  sendChatMessage(): void {
    if (!this.chatMessage.trim() || !this.currentMultiplayerGame) {
      return;
    }

    this.multiplayerService.sendChatMessage({
      playerId: this.currentPlayer.id,
      playerName: this.currentPlayer.username,
      message: this.chatMessage,
      timestamp: new Date(),
      type: 'text'
    }).subscribe({
      next: () => {
        this.chatMessage = '';
      },
      error: (error) => {
        console.error('Ошибка отправки сообщения:', error);
      }
    });
  }

  // Разблокировать тестовое достижение
  unlockTestAchievement(): void {
    const testAchievementId = 'first_win';
    
    this.achievementsService.unlockAchievement(this.currentPlayer.id, testAchievementId).subscribe({
      next: (achievement) => {
        alert(`Достижение "${achievement.name}" разблокировано!`);
      },
      error: (error) => {
        alert(`Ошибка: ${error.message}`);
      }
    });
  }

  // Симуляция игрового события
  simulateGameEvent(): void {
    if (!this.currentMultiplayerGame) {
      alert('Вы не в игре');
      return;
    }

    this.multiplayerService.simulateGameEvent(
      this.currentMultiplayerGame.id,
      'Игрок выполнил ход'
    ).subscribe();
  }

  // Получить цвет для рейтинга
  getRatingColor(rating: number): string {
    if (rating >= 1800) return '#ffd700'; // золото
    if (rating >= 1600) return '#c0c0c0'; // серебро
    if (rating >= 1400) return '#cd7f32'; // бронза
    return '#6b7280'; // серый
  }

  // Форматирование времени
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Форматирование даты
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short'
    });
  }
}