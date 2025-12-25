import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationSettings } from '../../services/notification.service';

@Component({
  selector: 'app-notification-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-settings.component.html',
  styleUrls: ['./notification-settings.component.css']
})
export class NotificationSettingsComponent {
  // Выходное событие с новыми настройками
  @Output() settingsChanged = new EventEmitter<NotificationSettings>();

  // Локальные настройки
  settings: NotificationSettings = {
    soundEnabled: true,
    desktopNotifications: true,
    emailNotifications: false,
    notificationDelay: 5
  };

  // Сохранение настроек
  saveSettings(): void {
    this.settingsChanged.emit({ ...this.settings });
    alert('Настройки сохранены!');
  }

  // Сброс настроек
  resetSettings(): void {
    this.settings = {
      soundEnabled: true,
      desktopNotifications: true,
      emailNotifications: false,
      notificationDelay: 5
    };
    this.settingsChanged.emit({ ...this.settings });
  }
}