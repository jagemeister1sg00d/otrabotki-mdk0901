import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'periodComparison',
  standalone: true
})
export class PeriodComparisonPipe implements PipeTransform {
  transform(
    currentValue: number,
    previousValue: number,
    format: 'absolute' | 'relative' | 'both' = 'both'
  ): string {
    if (previousValue === null || previousValue === undefined) {
      return '—';
    }
    
    const absoluteChange = currentValue - previousValue;
    const relativeChange = previousValue !== 0 ? 
      (absoluteChange / previousValue) * 100 : 0;
    
    const absFormatted = absoluteChange >= 0 ? 
      `+${absoluteChange.toLocaleString('ru-RU')}` : 
      absoluteChange.toLocaleString('ru-RU');
    
    const relFormatted = relativeChange >= 0 ? 
      `+${relativeChange.toFixed(1)}%` : 
      `${relativeChange.toFixed(1)}%`;
    
    switch (format) {
      case 'absolute':
        return absFormatted;
      case 'relative':
        return relFormatted;
      case 'both':
        return `${absFormatted} (${relFormatted})`;
      default:
        return `${absFormatted} (${relFormatted})`;
    }
  }
}