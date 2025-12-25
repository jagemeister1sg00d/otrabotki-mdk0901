import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';
import { GameSession, Player } from '../models/game.models';
import { GameUtils } from '../utils/game.utils';

@Injectable({
  providedIn: 'root'
})
export class GameSessionService {
  private gameSessions: GameSession[] = [];
  private currentSessionSubject = new BehaviorSubject<GameSession | null>(null);
  private sessionsSubject = new BehaviorSubject<GameSession[]>([]);
  
  currentSession$ = this.currentSessionSubject.asObservable();
  sessions$ = this.sessionsSubject.asObservable();

  constructor() {
    this.initializeMockData();
  }

  // Создать новую игровую сессию
  createSession(gameName: string, maxPlayers: number): Observable<GameSession> {
    const newSession: GameSession = {
      id: GameUtils.generateGameId(),
      gameId: GameUtils.generateGameId(),
      gameName,
      startTime: new Date(),
      endTime: null,
      players: [],
      winnerId: null,
      status: 'waiting',
      maxPlayers,
      currentPlayers: 0
    };

    return of(newSession).pipe(
      delay(500),
      map(session => {
        this.gameSessions.unshift(session);
        this.sessionsSubject.next([...this.gameSessions]);
        return session;
      }),
      catchError(error => this.handleError('Ошибка создания сессии', error))
    );
  }

  // Присоединиться к сессии
  joinSession(sessionId: string, player: Player): Observable<GameSession> {
    return of(this.gameSessions.find(s => s.id === sessionId)).pipe(
      delay(300),
      map(session => {
        if (!session) {
          throw new Error('Сессия не найдена');
        }
        
        if (session.status !== 'waiting') {
          throw new Error('Нельзя присоединиться к активной сессии');
        }
        
        if (session.currentPlayers >= session.maxPlayers) {
          throw new Error('Сессия заполнена');
        }

        const updatedSession = {
          ...session,
          players: [...session.players, player],
          currentPlayers: session.currentPlayers + 1
        };

        this.updateSession(updatedSession);
        return updatedSession;
      }),
      catchError(error => this.handleError('Ошибка присоединения', error))
    );
  }

  // Начать игровую сессию
  startSession(sessionId: string): Observable<GameSession> {
    return of(this.gameSessions.find(s => s.id === sessionId)).pipe(
      delay(400),
      map(session => {
        if (!session) {
          throw new Error('Сессия не найдена');
        }
        
        if (session.currentPlayers < 2) {
          throw new Error('Недостаточно игроков для начала игры');
        }

        const updatedSession = {
          ...session,
          status: 'active',
          startTime: new Date()
        };

        this.updateSession(updatedSession);
        this.currentSessionSubject.next(updatedSession);
        return updatedSession;
      }),
      catchError(error => this.handleError('Ошибка начала игры', error))
    );
  }

  // Завершить игровую сессию
  endSession(sessionId: string, winnerId: string): Observable<GameSession> {
    return of(this.gameSessions.find(s => s.id === sessionId)).pipe(
      delay(600),
      map(session => {
        if (!session) {
          throw new Error('Сессия не найдена');
        }

        const updatedSession = {
          ...session,
          status: 'finished',
          endTime: new Date(),
          winnerId
        };

        this.updateSession(updatedSession);
        this.currentSessionSubject.next(null);
        return updatedSession;
      }),
      catchError(error => this.handleError('Ошибка завершения игры', error))
    );
  }

  // Получить активные сессии
  getActiveSessions(): Observable<GameSession[]> {
    return of(this.gameSessions.filter(s => s.status === 'waiting' || s.status === 'active')).pipe(
      delay(200),
      catchError(error => this.handleError('Ошибка получения сессий', error))
    );
  }

  // Получить историю сессий игрока
  getPlayerSessions(playerId: string): Observable<GameSession[]> {
    return of(this.gameSessions.filter(s => 
      s.players.some(p => p.id === playerId) && s.status === 'finished'
    )).pipe(
      delay(300),
      catchError(error => this.handleError('Ошибка получения истории', error))
    );
  }

  // Оставить сессию
  leaveSession(sessionId: string, playerId: string): Observable<GameSession> {
    return of(this.gameSessions.find(s => s.id === sessionId)).pipe(
      delay(300),
      map(session => {
        if (!session) {
          throw new Error('Сессия не найдена');
        }

        const updatedSession = {
          ...session,
          players: session.players.filter(p => p.id !== playerId),
          currentPlayers: session.currentPlayers - 1
        };

        if (updatedSession.currentPlayers === 0) {
          updatedSession.status = 'cancelled';
        }

        this.updateSession(updatedSession);
        return updatedSession;
      }),
      catchError(error => this.handleError('Ошибка выхода из сессии', error))
    );
  }

  // Получить сессию по ID
  getSessionById(id: string): Observable<GameSession | null> {
    const session = this.gameSessions.find(s => s.id === id);
    return of(session || null).pipe(
      delay(200),
      catchError(error => this.handleError('Ошибка получения сессии', error))
    );
  }

  // Обновить сессию
  private updateSession(updatedSession: GameSession): void {
    const index = this.gameSessions.findIndex(s => s.id === updatedSession.id);
    if (index !== -1) {
      this.gameSessions[index] = updatedSession;
      this.sessionsSubject.next([...this.gameSessions]);
    }
  }

  // Обработка ошибок
  private handleError(message: string, error: any): Observable<never> {
    console.error(`${message}:`, error);
    return throwError(() => new Error(`${message}: ${error.message}`));
  }

  // Инициализация тестовых данных
  private initializeMockData(): void {
    const mockPlayers: Player[] = [
      {
        id: 'player1',
        username: 'Игрок1',
        avatar: '👤',
        level: 10,
        experience: 2500,
        rating: 1500,
        gamesPlayed: 50,
        gamesWon: 30
      },
      {
        id: 'player2',
        username: 'Игрок2',
        avatar: '🎮',
        level: 8,
        experience: 1800,
        rating: 1450,
        gamesPlayed: 40,
        gamesWon: 25
      },
      {
        id: 'player3',
        username: 'Игрок3',
        avatar: '⚔️',
        level: 12,
        experience: 3500,
        rating: 1600,
        gamesPlayed: 70,
        gamesWon: 45
      }
    ];

    this.gameSessions = [
      {
        id: 'session1',
        gameId: 'game1',
        gameName: 'Шахматы',
        startTime: new Date('2024-01-20T10:00:00'),
        endTime: new Date('2024-01-20T10:30:00'),
        players: [mockPlayers[0], mockPlayers[1]],
        winnerId: 'player1',
        status: 'finished',
        maxPlayers: 2,
        currentPlayers: 2
      },
      {
        id: 'session2',
        gameId: 'game2',
        gameName: 'Покер',
        startTime: new Date(),
        endTime: null,
        players: [mockPlayers[2]],
        winnerId: null,
        status: 'waiting',
        maxPlayers: 4,
        currentPlayers: 1
      }
    ];

    this.sessionsSubject.next([...this.gameSessions]);
  }
}