import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MessageTemplate } from '../../services/notification.service';

@Component({
  selector: 'app-message-templates',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './message-templates.component.html',
  styleUrls: ['./message-templates.component.css']
})
export class MessageTemplatesComponent {
  // Входные данные от родителя
  @Input() templates: MessageTemplate[] = [];
  
  // Выходные события к родителю
  @Output() addTemplate = new EventEmitter<Omit<MessageTemplate, 'id'>>();
  @Output() deleteTemplate = new EventEmitter<number>();
  @Output() useTemplate = new EventEmitter<string>();

  // Новая переменная для нового шаблона
  newTemplate: Omit<MessageTemplate, 'id'> = {
    name: '',
    template: '',
    category: 'общие'
  };

  // Отправить новый шаблон
  submitNewTemplate(): void {
    if (this.newTemplate.name && this.newTemplate.template) {
      this.addTemplate.emit({ ...this.newTemplate });
      this.newTemplate = { name: '', template: '', category: 'общие' };
    }
  }

  // Использовать шаблон
  onUseTemplate(template: string): void {
    this.useTemplate.emit(template);
  }

  // Удалить шаблон
  onDeleteTemplate(id: number): void {
    this.deleteTemplate.emit(id);
  }

  // Категории для селекта
  categories = ['общие', 'ошибки', 'напоминания', 'системные'];
}