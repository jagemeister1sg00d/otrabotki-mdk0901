import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, Subject } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { MultiplayerGame, Player, ChatMessage } from '../models/game.models';
import { GameUtils } from '../utils/game.utils';

@Injectable({
  providedIn: 'root'
})
export class MultiplayerService {
  private games: MultiplayerGame[] = [];
  private currentGameSubject = new BehaviorSubject<MultiplayerGame | null>(null);
  private gamesSubject = new BehaviorSubject<MultiplayerGame[]>([]);
  private chatMessagesSubject = new BehaviorSubject<ChatMessage[]>([]);
  private gameUpdatesSubject = new Subject<MultiplayerGame>();
  
  currentGame$ = this.currentGameSubject.asObservable();
  games$ = this.gamesSubject.asObservable();
  chatMessages$ = this.chatMessagesSubject.asObservable();
  gameUpdates$ = this.gameUpdatesSubject.asObservable();

  constructor() {
    this.initializeMockData();
    this.simulateRealTimeUpdates();
  }

  // Создать новую мультиплеерную игру
  createGame(name: string, description: string, maxPlayers: number, host: Player): Observable<MultiplayerGame> {
    const newGame: MultiplayerGame = {
      id: GameUtils.generateGameId(),
      name,
      description,
      maxPlayers,
      minPlayers: 2,
      activePlayers: 1,
      status: 'waiting',
      hostId: host.id,
      players: [host],
      createdAt: new Date()
    };

    return of(newGame).pipe(
      delay(400),
      map(game => {
        this.games.unshift(game);
        this.gamesSubject.next([...this.games]);
        this.currentGameSubject.next(game);
        return game;
      })
    );
  }

  // Присоединиться к игре
  joinGame(gameId: string, player: Player): Observable<MultiplayerGame> {
    return of(this.games.find(g => g.id === gameId)).pipe(
      delay(300),
      map(game => {
        if (!game) {
          throw new Error('Игра не найдена');
        }
        
        if (game.status !== 'waiting') {
          throw new Error('Игра уже началась');
        }
        
        if (game.activePlayers >= game.maxPlayers) {
          throw new Error('Игра заполнена');
        }

        const updatedGame = {
          ...game,
          players: [...game.players, player],
          activePlayers: game.activePlayers + 1
        };

        this.updateGame(updatedGame);
        
        // Отправляем системное сообщение в чат
        this.addChatMessage({
          id: GameUtils.generateGameId(),
          playerId: 'system',
          playerName: 'Система',
          message: `${player.username} присоединился к игре`,
          timestamp: new Date(),
          type: 'system'
        });

        return updatedGame;
      })
    );
  }

  // Начать игру
  startGame(gameId: string): Observable<MultiplayerGame> {
    return of(this.games.find(g => g.id === gameId)).pipe(
      delay(500),
      map(game => {
        if (!game) {
          throw new Error('Игра не найдена');
        }
        
        if (game.activePlayers < game.minPlayers) {
          throw new Error('Недостаточно игроков для начала игры');
        }

        const updatedGame = {
          ...game,
          status: 'in_progress'
        };

        this.updateGame(updatedGame);
        this.currentGameSubject.next(updatedGame);
        
        // Отправляем системное сообщение
        this.addChatMessage({
          id: GameUtils.generateGameId(),
          playerId: 'system',
          playerName: 'Система',
          message: 'Игра началась!',
          timestamp: new Date(),
          type: 'system'
        });

        return updatedGame;
      })
    );
  }

  // Покинуть игру
  leaveGame(gameId: string, playerId: string): Observable<MultiplayerGame> {
    return of(this.games.find(g => g.id === gameId)).pipe(
      delay(300),
      map(game => {
        if (!game) {
          throw new Error('Игра не найдена');
        }

        const player = game.players.find(p => p.id === playerId);
        const updatedGame = {
          ...game,
          players: game.players.filter(p => p.id !== playerId),
          activePlayers: game.activePlayers - 1
        };

        // Если вышел хост, выбираем нового
        if (game.hostId === playerId && updatedGame.players.length > 0) {
          updatedGame.hostId = updatedGame.players[0].id;
        }

        // Если игроков не осталось, удаляем игру
        if (updatedGame.activePlayers === 0) {
          this.games = this.games.filter(g => g.id !== gameId);
          this.gamesSubject.next([...this.games]);
          this.currentGameSubject.next(null);
          return updatedGame;
        }

        this.updateGame(updatedGame);
        
        // Отправляем системное сообщение
        if (player) {
          this.addChatMessage({
            id: GameUtils.generateGameId(),
            playerId: 'system',
            playerName: 'Система',
            message: `${player.username} покинул игру`,
            timestamp: new Date(),
            type: 'system'
          });
        }

        return updatedGame;
      })
    );
  }

  // Отправить сообщение в чат
  sendChatMessage(message: Omit<ChatMessage, 'id'>): Observable<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: GameUtils.generateGameId()
    };

    const currentMessages = this.chatMessagesSubject.value;
    this.chatMessagesSubject.next([...currentMessages, newMessage]);

    return of(newMessage).pipe(delay(100));
  }

  // Получить активные игры
  getActiveGames(): Observable<MultiplayerGame[]> {
    return of(this.games.filter(g => g.status === 'waiting')).pipe(delay(200));
  }

  // Получить игру по ID
  getGameById(gameId: string): Observable<MultiplayerGame | null> {
    const game = this.games.find(g => g.id === gameId);
    return of(game || null).pipe(delay(200));
  }

  // Обновить состояние игры
  updateGameState(gameId: string, updates: Partial<MultiplayerGame>): Observable<MultiplayerGame> {
    return of(this.games.find(g => g.id === gameId)).pipe(
      delay(200),
      map(game => {
        if (!game) {
          throw new Error('Игра не найдена');
        }

        const updatedGame = { ...game, ...updates };
        this.updateGame(updatedGame);
        return updatedGame;
      })
    );
  }

  // Симуляция игровых событий
  simulateGameEvent(gameId: string, event: string): Observable<void> {
    const game = this.games.find(g => g.id === gameId);
    
    if (game) {
      this.addChatMessage({
        id: GameUtils.generateGameId(),
        playerId: 'system',
        playerName: 'Система',
        message: `Игровое событие: ${event}`,
        timestamp: new Date(),
        type: 'game_event'
      });
    }

    return of(void 0).pipe(delay(100));
  }

  // Вспомогательные методы
  private addChatMessage(message: ChatMessage): void {
    const currentMessages = this.chatMessagesSubject.value;
    this.chatMessagesSubject.next([...currentMessages, message]);
  }

  private updateGame(updatedGame: MultiplayerGame): void {
    const index = this.games.findIndex(g => g.id === updatedGame.id);
    if (index !== -1) {
      this.games[index] = updatedGame;
      this.gamesSubject.next([...this.games]);
      this.gameUpdatesSubject.next(updatedGame);
    }
  }

  // Симуляция обновлений в реальном времени
  private simulateRealTimeUpdates(): void {
    setInterval(() => {
      this.games.forEach(game => {
        if (game.status === 'waiting' && Math.random() > 0.7) {
          // Симуляция присоединения/выхода игроков
          const updatedGame = { ...game };
          if (Math.random() > 0.5 && updatedGame.activePlayers < updatedGame.maxPlayers) {
            updatedGame.activePlayers += 1;
          } else if (updatedGame.activePlayers > 1) {
            updatedGame.activePlayers -= 1;
          }
          
          if (updatedGame.activePlayers !== game.activePlayers) {
            this.updateGame(updatedGame);
          }
        }
      });
    }, 10000); // Каждые 10 секунд
  }

  // Инициализация тестовых данных
  private initializeMockData(): void {
    const mockPlayers: Player[] = [
      {
        id: 'player1',
        username: 'Игрок1',
        avatar: '👑',
        level: 15,
        experience: 5600,
        rating: 1850,
        gamesPlayed: 120,
        gamesWon: 85
      },
      {
        id: 'player2',
        username: 'Игрок2',
        avatar: '🎯',
        level: 12,
        experience: 3800,
        rating: 1720,
        gamesPlayed: 95,
        gamesWon: 65
      },
      {
        id: 'player3',
        username: 'Игрок3',
        avatar: '⚔️',
        level: 10,
        experience: 2500,
        rating: 1650,
        gamesPlayed: 80,
        gamesWon: 50
      }
    ];

    this.games = [
      {
        id: 'game1',
        name: 'Турнир по шахматам',
        description: 'Еженедельный турнир для всех желающих',
        maxPlayers: 16,
        minPlayers: 2,
        activePlayers: 8,
        status: 'waiting',
        hostId: 'player1',
        players: mockPlayers,
        createdAt: new Date('2024-01-20T14:00:00')
      },
      {
        id: 'game2',
        name: 'Быстрые игры',
        description: 'Быстрые матчи 1 на 1',
        maxPlayers: 2,
        minPlayers: 2,
        activePlayers: 1,
        status: 'waiting',
        hostId: 'player2',
        players: [mockPlayers[1]],
        createdAt: new Date()
      }
    ];

    // Инициализация чата
    const chatMessages: ChatMessage[] = [
      {
        id: 'msg1',
        playerId: 'player1',
        playerName: 'Игрок1',
        message: 'Всем привет! Готовы к игре?',
        timestamp: new Date('2024-01-20T14:05:00'),
        type: 'text'
      },
      {
        id: 'msg2',
        playerId: 'player2',
        playerName: 'Игрок2',
        message: 'Да, я готов!',
        timestamp: new Date('2024-01-20T14:06:00'),
        type: 'text'
      },
      {
        id: 'msg3',
        playerId: 'system',
        playerName: 'Система',
        message: 'Турнир начнется через 5 минут',
        timestamp: new Date('2024-01-20T14:07:00'),
        type: 'system'
      }
    ];

    this.gamesSubject.next([...this.games]);
    this.chatMessagesSubject.next(chatMessages);
  }
}