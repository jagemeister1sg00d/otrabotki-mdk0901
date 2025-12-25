import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-list.component.html',
  styleUrls: ['./notification-list.component.css']
})
export class NotificationListComponent {
  // Входные данные от родителя
  @Input() notifications: Notification[] = [];
  
  // Выходные события к родителю
  @Output() markAsRead = new EventEmitter<number>();
  @Output() deleteNotification = new EventEmitter<number>();
  @Output() clearAll = new EventEmitter<void>();

  // Фильтр уведомлений
  filter: 'all' | 'unread' = 'all';

  get filteredNotifications(): Notification[] {
    if (this.filter === 'unread') {
      return this.notifications.filter(n => !n.read);
    }
    return this.notifications;
  }

  // Пометить как прочитанное
  onMarkAsRead(id: number): void {
    this.markAsRead.emit(id);
  }

  // Удалить уведомление
  onDelete(id: number): void {
    this.deleteNotification.emit(id);
  }

  // Очистить все
  onClearAll(): void {
    this.clearAll.emit();
  }

  // Получить класс для типа уведомления
  getNotificationClass(type: string): string {
    switch(type) {
      case 'info': return 'info';
      case 'warning': return 'warning';
      case 'error': return 'error';
      case 'success': return 'success';
      default: return 'info';
    }
  }

  // Форматирование времени
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}