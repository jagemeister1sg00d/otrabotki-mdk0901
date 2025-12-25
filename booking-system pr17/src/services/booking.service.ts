import { Injectable, signal, computed, effect } from '@angular/core';
import { BehaviorSubject, Observable, of, delay, map } from 'rxjs';

export interface BookingSlot {
  id: number;
  date: Date;
  time: string;
  price: number;
  available: boolean;
  bookedBy: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // Сигналы (Angular 16+)
  private bookingSlots = signal<BookingSlot[]>(this.generateInitialSlots());
  private selectedDate = signal<Date>(new Date());
  private selectedTime = signal<string>('');
  private bookingName = signal<string>('');
  
  // Computed сигналы (реактивные вычисления)
  availableSlots = computed(() => {
    const date = this.selectedDate();
    const slots = this.bookingSlots();
    return slots.filter(slot => 
      slot.date.toDateString() === date.toDateString() && 
      slot.available
    );
  });
  
  selectedSlot = computed(() => {
    const date = this.selectedDate();
    const time = this.selectedTime();
    return this.bookingSlots().find(slot => 
      slot.date.toDateString() === date.toDateString() && 
      slot.time === time
    );
  });
  
  totalPrice = computed(() => {
    const slot = this.selectedSlot();
    if (!slot) return 0;
    
    // Динамическое ценообразование
    let price = slot.price;
    const day = slot.date.getDay();
    
    // Пятница и суббота дороже
    if (day === 5 || day === 6) {
      price *= 1.3;
    }
    
    // Утренние часы дешевле
    const hour = parseInt(slot.time.split(':')[0]);
    if (hour < 12) {
      price *= 0.9;
    }
    
    return Math.round(price);
  });
  
  // RxJS Observable для симуляции реального времени
  private bookingUpdates = new BehaviorSubject<BookingSlot[]>(this.bookingSlots());
  bookingUpdates$: Observable<BookingSlot[]> = this.bookingUpdates.asObservable();

  constructor() {
    // Эффект для отслеживания изменений
    effect(() => {
      const slots = this.bookingSlots();
      this.bookingUpdates.next(slots);
      
      // Симуляция обновления доступности в реальном времени
      this.simulateRealTimeUpdates();
    });
  }

  // Методы для управления состоянием
  setSelectedDate(date: Date): void {
    this.selectedDate.set(date);
  }

  setSelectedTime(time: string): void {
    this.selectedTime.set(time);
  }

  setBookingName(name: string): void {
    this.bookingName.set(name);
  }

  // Бронирование слота
  bookSlot(): Observable<boolean> {
    return new Observable(observer => {
      const slot = this.selectedSlot();
      const name = this.bookingName();
      
      if (!slot || !name.trim() || !slot.available) {
        observer.next(false);
        observer.complete();
        return;
      }

      // Симуляция задержки бронирования
      setTimeout(() => {
        const updatedSlots = this.bookingSlots().map(s => 
          s.id === slot.id ? { ...s, available: false, bookedBy: name } : s
        );
        
        this.bookingSlots.set(updatedSlots);
        observer.next(true);
        observer.complete();
      }, 1000);
    });
  }

  // Отмена бронирования
  cancelBooking(slotId: number): void {
    const updatedSlots = this.bookingSlots().map(slot =>
      slot.id === slotId ? { ...slot, available: true, bookedBy: null } : slot
    );
    this.bookingSlots.set(updatedSlots);
  }

  // Проверка доступности (RxJS)
  checkAvailability(date: Date, time: string): Observable<boolean> {
    return this.bookingUpdates$.pipe(
      map(slots => {
        const slot = slots.find(s => 
          s.date.toDateString() === date.toDateString() && 
          s.time === time
        );
        return slot ? slot.available : false;
      })
    );
  }

  // Генерация начальных слотов
  private generateInitialSlots(): BookingSlot[] {
    const slots: BookingSlot[] = [];
    let id = 1;
    
    // Генерация на 7 дней вперед
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      
      // Временные слоты с 9:00 до 18:00
      for (let hour = 9; hour < 18; hour += 2) {
        const time = `${hour}:00`;
        const available = Math.random() > 0.3; // 70% доступны
        
        slots.push({
          id: id++,
          date: new Date(date),
          time,
          price: 1000 + Math.floor(Math.random() * 500),
          available,
          bookedBy: available ? null : 'Иван Иванов'
        });
      }
    }
    
    return slots;
  }

  // Симуляция обновлений в реальном времени
  private simulateRealTimeUpdates(): void {
    setInterval(() => {
      const slots = this.bookingSlots();
      const randomIndex = Math.floor(Math.random() * slots.length);
      const randomSlot = slots[randomIndex];
      
      // Случайно освобождаем или занимаем слот
      if (Math.random() > 0.7) {
        const updatedSlots = slots.map((slot, index) => 
          index === randomIndex ? { 
            ...slot, 
            available: !slot.available,
            bookedBy: slot.available ? 'Система' : null
          } : slot
        );
        
        this.bookingSlots.set(updatedSlots);
      }
    }, 10000); // Каждые 10 секунд
  }

  // Получение доступных дат
  getAvailableDates(): Date[] {
    const dates = new Set<string>();
    this.bookingSlots().forEach(slot => {
      if (slot.available) {
        dates.add(slot.date.toDateString());
      }
    });
    
    return Array.from(dates).map(dateStr => new Date(dateStr));
  }

  // Получение слотов по дате
  getSlotsByDate(date: Date): BookingSlot[] {
    return this.bookingSlots().filter(slot => 
      slot.date.toDateString() === date.toDateString()
    );
  }
}