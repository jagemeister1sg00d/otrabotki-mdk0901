import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'metricFormat',
  standalone: true
})
export class MetricFormatPipe implements PipeTransform {
  transform(value: number, unit: string = '', precision: number = 2): string {
    if (value === null || value === undefined) {
      return '—';
    }

    // Форматирование больших чисел
    if (Math.abs(value) >= 1000000) {
      return `${(value / 1000000).toFixed(precision)} млн ${unit}`.trim();
    }
    
    if (Math.abs(value) >= 1000) {
      return `${(value / 1000).toFixed(precision)} тыс ${unit}`.trim();
    }
    
    // Для процентов
    if (unit === '%') {
      return `${(value * 100).toFixed(precision)}%`;
    }
    
    // Для денег
    if (unit === '₽' || unit === '$' || unit === '€') {
      return `${value.toLocaleString('ru-RU')} ${unit}`;
    }
    
    // Обычное форматирование
    return `${value.toFixed(precision)} ${unit}`.trim();
  }
}