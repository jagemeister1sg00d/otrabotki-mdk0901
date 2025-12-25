import { Injectable } from '@angular/core';

export interface Metric {
  id: number;
  name: string;
  value: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  changePercent: number;
  previousValue: number;
  forecastValue: number;
  timestamp: Date;
}

export interface PeriodData {
  period: string;
  startDate: Date;
  endDate: Date;
  metrics: Metric[];
}

@Injectable({
  providedIn: 'root'
})
export class AnalyticsService {
  // Пример данных для демонстрации пайпов
  getMetrics(): Metric[] {
    return [
      {
        id: 1,
        name: 'Посетители',
        value: 15432,
        unit: 'чел.',
        trend: 'up',
        changePercent: 12.5,
        previousValue: 13700,
        forecastValue: 16800,
        timestamp: new Date('2024-01-20')
      },
      {
        id: 2,
        name: 'Конверсия',
        value: 0.2345,
        unit: '%',
        trend: 'down',
        changePercent: -3.2,
        previousValue: 0.242,
        forecastValue: 0.228,
        timestamp: new Date('2024-01-20')
      },
      {
        id: 3,
        name: 'Выручка',
        value: 1254321,
        unit: '₽',
        trend: 'up',
        changePercent: 18.7,
        previousValue: 1056700,
        forecastValue: 1450000,
        timestamp: new Date('2024-01-20')
      },
      {
        id: 4,
        name: 'Средний чек',
        value: 3456,
        unit: '₽',
        trend: 'stable',
        changePercent: 0.5,
        previousValue: 3440,
        forecastValue: 3480,
        timestamp: new Date('2024-01-20')
      },
      {
        id: 5,
        name: 'Отказы',
        value: 0.2867,
        unit: '%',
        trend: 'down',
        changePercent: -15.3,
        previousValue: 0.338,
        forecastValue: 0.265,
        timestamp: new Date('2024-01-20')
      }
    ];
  }

  getPeriodData(): PeriodData[] {
    const today = new Date();
    const periods = [];
    
    for (let i = 4; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i * 7);
      
      const startDate = new Date(date);
      startDate.setDate(startDate.getDate() - 6);
      
      periods.push({
        period: `Неделя ${i + 1}`,
        startDate,
        endDate: new Date(date),
        metrics: this.generateMetricsForPeriod(i)
      });
    }
    
    return periods;
  }

  private generateMetricsForPeriod(weekOffset: number): Metric[] {
    const baseMetrics = this.getMetrics();
    return baseMetrics.map(metric => ({
      ...metric,
      value: metric.value * (1 + (Math.random() - 0.5) * 0.1 * weekOffset),
      changePercent: metric.changePercent * (1 + (Math.random() - 0.5) * 0.2),
      timestamp: new Date(2024, 0, 20 - weekOffset * 7)
    }));
  }

  getTrendData(metricName: string, periods: number = 12): number[] {
    const data = [];
    const baseValue = this.getMetrics().find(m => m.name === metricName)?.value || 1000;
    
    for (let i = 0; i < periods; i++) {
      data.push(baseValue * (1 + Math.sin(i * 0.5) * 0.3 + i * 0.05));
    }
    
    return data;
  }
}