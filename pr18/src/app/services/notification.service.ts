import { Injectable } from '@angular/core';
import { Subject, Observable } from 'rxjs';

export interface Notification {
  id: number;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface NotificationSettings {
  soundEnabled: boolean;
  desktopNotifications: boolean;
  emailNotifications: boolean;
  notificationDelay: number;
}

export interface MessageTemplate {
  id: number;
  name: string;
  template: string;
  category: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  // Список уведомлений
  private notifications: Notification[] = [
    {
      id: 1,
      type: 'info',
      title: 'Добро пожаловать',
      message: 'Система уведомлений активирована',
      timestamp: new Date('2024-01-15 09:00'),
      read: true,
      priority: 'low'
    },
    {
      id: 2,
      type: 'warning',
      title: 'Обновление системы',
      message: 'Запланировано обновление на 20:00',
      timestamp: new Date('2024-01-15 14:30'),
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'error',
      title: 'Ошибка соединения',
      message: 'Потеряно соединение с сервером',
      timestamp: new Date('2024-01-15 16:45'),
      read: false,
      priority: 'high'
    },
    {
      id: 4,
      type: 'success',
      title: 'Задача выполнена',
      message: 'Резервное копирование завершено успешно',
      timestamp: new Date('2024-01-16 08:15'),
      read: true,
      priority: 'low'
    }
  ];

  // Настройки по умолчанию
  private settings: NotificationSettings = {
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    notificationDelay: 5
  };

  // Шаблоны сообщений
  private templates: MessageTemplate[] = [
    {
      id: 1,
      name: 'Приветствие',
      template: 'Добро пожаловать, {имя}!',
      category: 'общие'
    },
    {
      id: 2,
      name: 'Ошибка',
      template: 'Произошла ошибка: {описание}',
      category: 'ошибки'
    },
    {
      id: 3,
      name: 'Уведомление',
      template: 'Напоминание: {событие} в {время}',
      category: 'напоминания'
    }
  ];

  // Subject для реактивного обновления
  private notificationsSubject = new Subject<Notification[]>();
  private settingsSubject = new Subject<NotificationSettings>();

  constructor() {}

  // Получить все уведомления
  getNotifications(): Notification[] {
    return [...this.notifications];
  }

  // Получить непрочитанные уведомления
  getUnreadNotifications(): Notification[] {
    return this.notifications.filter(n => !n.read);
  }

  // Добавить новое уведомление
  addNotification(notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): void {
    const newNotification: Notification = {
      ...notification,
      id: Date.now(),
      timestamp: new Date(),
      read: false
    };

    this.notifications.unshift(newNotification);
    this.notifySubscribers();
  }

  // Пометить как прочитанное
  markAsRead(id: number): void {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.notifySubscribers();
    }
  }

  // Удалить уведомление
  deleteNotification(id: number): void {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notifySubscribers();
  }

  // Очистить все уведомления
  clearAllNotifications(): void {
    this.notifications = [];
    this.notifySubscribers();
  }

  // Получить настройки
  getSettings(): NotificationSettings {
    return { ...this.settings };
  }

  // Обновить настройки
  updateSettings(newSettings: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.settingsSubject.next(this.settings);
  }

  // Получить шаблоны
  getTemplates(): MessageTemplate[] {
    return [...this.templates];
  }

  // Добавить шаблон
  addTemplate(template: Omit<MessageTemplate, 'id'>): void {
    const newTemplate: MessageTemplate = {
      ...template,
      id: Date.now()
    };
    this.templates.push(newTemplate);
  }

  // Удалить шаблон
  deleteTemplate(id: number): void {
    this.templates = this.templates.filter(t => t.id !== id);
  }

  // Реактивные подписки
  get notifications$(): Observable<Notification[]> {
    return this.notificationsSubject.asObservable();
  }

  get settings$(): Observable<NotificationSettings> {
    return this.settingsSubject.asObservable();
  }

  // Уведомить подписчиков
  private notifySubscribers(): void {
    this.notificationsSubject.next([...this.notifications]);
  }
}