import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AnalyticsService, Metric, PeriodData } from './services/analytics.service';
import { MetricFormatPipe } from './pipes/metric-format.pipe';
import { PercentChangePipe } from './pipes/percent-change.pipe';
import { TrendPipe } from './pipes/trend.pipe';
import { PeriodComparisonPipe } from './pipes/period-comparison.pipe';
import { ForecastPipe } from './pipes/forecast.pipe';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MetricFormatPipe,
    PercentChangePipe,
    TrendPipe,
    PeriodComparisonPipe,
    ForecastPipe
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Данные для демонстрации
  metrics: Metric[] = [];
  periodData: PeriodData[] = [];
  
  // Настройки отображения
  numberFormat: 'auto' | 'full' = 'auto';
  showEmoji: boolean = true;
  comparisonFormat: 'both' | 'absolute' | 'relative' = 'both';
  
  // Тестовые данные для демонстрации пайпов
  testNumber: number = 1234567.89;
  testPercent: number = 0.2345;
  testDate: Date = new Date();
  testCurrency: number = 9876543.21;
  
  // Пользовательские данные для тестирования
  userNumber: number = 1000;
  userPrevious: number = 900;
  userUnit: string = '₽';
  
  constructor(private analyticsService: AnalyticsService) {}

  ngOnInit(): void {
    this.metrics = this.analyticsService.getMetrics();
    this.periodData = this.analyticsService.getPeriodData();
  }

  // Получение цвета для тренда
  getTrendColor(trend: 'up' | 'down' | 'stable'): string {
    switch (trend) {
      case 'up': return '#10b981';
      case 'down': return '#ef4444';
      case 'stable': return '#6b7280';
      default: return '#6b7280';
    }
  }

  // Форматирование даты для отображения
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  // Получение данных тренда для графика
  getTrendData(metricName: string): number[] {
    return this.analyticsService.getTrendData(metricName);
  }
}