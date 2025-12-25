import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Notification } from '../../services/notification.service';

@Component({
  selector: 'app-notification-history',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-history.component.html',
  styleUrls: ['./notification-history.component.css']
})
export class NotificationHistoryComponent {
  // Входные данные от родителя
  @Input() notifications: Notification[] = [];

  // Фильтр по дате
  dateFilter: Date | null = null;

  get filteredNotifications(): Notification[] {
    let filtered = this.notifications;
    
    if (this.dateFilter) {
      const filterDate = this.dateFilter.toDateString();
      filtered = filtered.filter(n => 
        new Date(n.timestamp).toDateString() === filterDate
      );
    }
    
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Получить уникальные даты
  get uniqueDates(): string[] {
    const dates = this.notifications.map(n => 
      new Date(n.timestamp).toLocaleDateString('ru-RU')
    );
    return [...new Set(dates)];
  }

  // Форматирование даты
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Форматирование времени
  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Получить класс для типа
  getTypeClass(type: string): string {
    return type;
  }
}