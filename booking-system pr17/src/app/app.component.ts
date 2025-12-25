import { Component, OnInit, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService, BookingSlot } from './services/booking.service';
import { Subscription, interval } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  // Использование сигналов из сервиса
  availableSlots = this.bookingService.availableSlots;
  selectedSlot = this.bookingService.selectedSlot;
  totalPrice = this.bookingService.totalPrice;
  
  // Локальные переменные
  bookingName = '';
  isBooking = false;
  bookingResult: string | null = null;
  
  // Календарь
  currentDate = new Date();
  selectedDate = new Date();
  calendarDays: Date[] = [];
  
  // RxJS подписка для обновлений в реальном времени
  private updatesSubscription!: Subscription;
  private timeSubscription!: Subscription;
  
  // Computed свойство для отображения времени
  currentTime = computed(() => new Date().toLocaleTimeString());

  constructor(private bookingService: BookingService) {}

  ngOnInit(): void {
    this.generateCalendar();
    this.setupRealTimeUpdates();
  }

  ngOnDestroy(): void {
    this.updatesSubscription?.unsubscribe();
    this.timeSubscription?.unsubscribe();
  }

  // Генерация календаря на 7 дней
  generateCalendar(): void {
    this.calendarDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(this.currentDate);
      date.setDate(date.getDate() + i);
      this.calendarDays.push(date);
    }
  }

  // Настройка обновлений в реальном времени
  setupRealTimeUpdates(): void {
    // Обновление времени каждую секунду
    this.timeSubscription = interval(1000).subscribe(() => {
      // Просто держим время актуальным
    });

    // Подписка на обновления бронирований
    this.updatesSubscription = this.bookingService.bookingUpdates$.subscribe({
      next: () => {
        // Обновляем календарь при изменениях
        this.generateCalendar();
      },
      error: (err) => console.error('Ошибка обновлений:', err)
    });
  }

  // Выбор даты в календаре
  selectDate(date: Date): void {
    this.selectedDate = date;
    this.bookingService.setSelectedDate(date);
    this.bookingResult = null;
  }

  // Выбор времени
  selectTime(time: string): void {
    this.bookingService.setSelectedTime(time);
    this.bookingResult = null;
  }

  // Бронирование
  book(): void {
    if (!this.bookingName.trim()) {
      this.bookingResult = 'Введите имя для бронирования';
      return;
    }

    if (!this.selectedSlot()) {
      this.bookingResult = 'Выберите время для бронирования';
      return;
    }

    this.isBooking = true;
    this.bookingService.setBookingName(this.bookingName);

    this.bookingService.bookSlot().subscribe({
      next: (success) => {
        this.isBooking = false;
        if (success) {
          this.bookingResult = 'Бронирование успешно!';
          this.bookingName = '';
        } else {
          this.bookingResult = 'Ошибка бронирования. Слот уже занят.';
        }
      },
      error: () => {
        this.isBooking = false;
        this.bookingResult = 'Ошибка соединения. Попробуйте позже.';
      }
    });
  }

  // Проверка доступности времени
  isTimeAvailable(date: Date, time: string): boolean {
    const slots = this.bookingService.getSlotsByDate(date);
    const slot = slots.find(s => s.time === time);
    return slot ? slot.available : false;
  }

  // Получение слотов для выбранной даты
  getTimeSlotsForSelectedDate(): string[] {
    const slots = this.bookingService.getSlotsByDate(this.selectedDate);
    return [...new Set(slots.map(slot => slot.time))].sort();
  }

  // Получение цены для времени
  getPriceForTime(time: string): number {
    const slots = this.bookingService.getSlotsByDate(this.selectedDate);
    const slot = slots.find(s => s.time === time);
    return slot ? slot.price : 0;
  }

  // Форматирование даты
  formatDate(date: Date): string {
    return date.toLocaleDateString('ru-RU', {
      weekday: 'short',
      day: 'numeric',
      month: 'short'
    });
  }

  // Проверка сегодняшней даты
  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  // Проверка выбранной даты
  isSelected(date: Date): boolean {
    return date.toDateString() === this.selectedDate.toDateString();
  }

  // Отмена бронирования
  cancelBooking(slotId: number): void {
    this.bookingService.cancelBooking(slotId);
    this.bookingResult = 'Бронирование отменено';
  }
}