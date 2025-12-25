import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'percentChange',
  standalone: true
})
export class PercentChangePipe implements PipeTransform {
  transform(
    currentValue: number, 
    previousValue: number, 
    showSign: boolean = true,
    precision: number = 1
  ): string {
    if (previousValue === 0 || previousValue === null || previousValue === undefined) {
      return '—';
    }
    
    const change = ((currentValue - previousValue) / previousValue) * 100;
    const sign = change > 0 ? '+' : '';
    
    let result = `${change.toFixed(precision)}%`;
    
    if (showSign && change > 0) {
      result = `+${result}`;
    }
    
    return result;
  }
}