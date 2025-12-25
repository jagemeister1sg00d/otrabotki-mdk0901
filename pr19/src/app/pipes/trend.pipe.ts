import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trend',
  standalone: true
})
export class TrendPipe implements PipeTransform {
  transform(
    trend: 'up' | 'down' | 'stable',
    value: number,
    useEmoji: boolean = true
  ): string {
    switch (trend) {
      case 'up':
        return useEmoji ? `📈 Рост (${value > 0 ? '+' : ''}${value})` : `Рост (${value > 0 ? '+' : ''}${value})`;
      case 'down':
        return useEmoji ? `📉 Снижение (${value > 0 ? '+' : ''}${value})` : `Снижение (${value > 0 ? '+' : ''}${value})`;
      case 'stable':
        return useEmoji ? `➡️ Стабильно (${value > 0 ? '+' : ''}${value})` : `Стабильно (${value > 0 ? '+' : ''}${value})`;
      default:
        return '—';
    }
  }
}