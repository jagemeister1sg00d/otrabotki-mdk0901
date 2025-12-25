import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'forecast',
  standalone: true
})
export class ForecastPipe implements PipeTransform {
  transform(
    currentValue: number,
    forecastValue: number,
    confidence: number = 0.8,
    showConfidence: boolean = true
  ): string {
    const change = forecastValue - currentValue;
    const percentChange = currentValue !== 0 ? 
      (change / currentValue) * 100 : 0;
    
    const direction = change > 0 ? 'рост' : change < 0 ? 'снижение' : 'без изменений';
    const confidencePercent = Math.round(confidence * 100);
    
    let result = `Прогноз: ${direction} на ${Math.abs(percentChange).toFixed(1)}%`;
    
    if (showConfidence) {
      result += ` (доверие: ${confidencePercent}%)`;
    }
    
    return result;
  }
}