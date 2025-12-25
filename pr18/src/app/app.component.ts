import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  NotificationService, 
  Notification, 
  NotificationSettings,
  MessageTemplate 
} from './services/notification.service';
import { NotificationListComponent } from './components/notification-list/notification-list.component';
import { NotificationSettingsComponent } from './components/notification-settings/notification-settings.component';
import { NotificationHistoryComponent } from './components/notification-history/notification-history.component';
import { MessageTemplatesComponent } from './components/message-templates/message-templates.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    NotificationListComponent,
    NotificationSettingsComponent,
    NotificationHistoryComponent,
    MessageTemplatesComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Данные для компонентов
  notifications: Notification[] = [];
  settings: NotificationSettings;
  templates: MessageTemplate[] = [];
  
  // Данные для тестового уведомления
  testNotification = {
    title: '',
    message: '',
    type: 'info' as const,
    priority: 'medium' as const
  };
  
  // Получение ссылки на дочерний компонент
  @ViewChild(NotificationListComponent) 
  notificationList!: NotificationListComponent;

  constructor(private notificationService: NotificationService) {
    this.settings = notificationService.getSettings();
  }

  ngOnInit(): void {
    // Получение данных из сервиса
    this.notifications = this.notificationService.getNotifications();
    this.templates = this.notificationService.getTemplates();
    
    // Подписка на обновления
    this.notificationService.notifications$.subscribe(notifications => {
      this.notifications = notifications;
    });
    
    this.notificationService.settings$.subscribe(settings => {
      this.settings = settings;
    });
  }

  // Обработчики событий от компонента списка уведомлений
  onMarkAsRead(id: number): void {
    this.notificationService.markAsRead(id);
  }

  onDeleteNotification(id: number): void {
    this.notificationService.deleteNotification(id);
  }

  onClearAllNotifications(): void {
    this.notificationService.clearAllNotifications();
  }

  // Обработчик событий от компонента настроек
  onSettingsChanged(newSettings: NotificationSettings): void {
    this.notificationService.updateSettings(newSettings);
  }

  // Обработчики событий от компонента шаблонов
  onAddTemplate(template: Omit<MessageTemplate, 'id'>): void {
    this.notificationService.addTemplate(template);
    this.templates = this.notificationService.getTemplates();
  }

  onDeleteTemplate(id: number): void {
    this.notificationService.deleteTemplate(id);
    this.templates = this.notificationService.getTemplates();
  }

  onUseTemplate(template: string): void {
    this.testNotification.message = template;
  }

  // Отправка тестового уведомления
  sendTestNotification(): void {
    if (this.testNotification.title && this.testNotification.message) {
      this.notificationService.addNotification({
        title: this.testNotification.title,
        message: this.testNotification.message,
        type: this.testNotification.type,
        priority: this.testNotification.priority
      });
      
      this.testNotification = {
        title: '',
        message: '',
        type: 'info',
        priority: 'medium'
      };
      
      alert('Тестовое уведомление отправлено!');
    }
  }

  // Получение статистики
  get statistics() {
    const total = this.notifications.length;
    const unread = this.notifications.filter(n => !n.read).length;
    const byType = this.notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return { total, unread, byType };
  }
}