import { format, parseISO, startOfDay, endOfDay, subDays, subWeeks, subMonths } from 'date-fns';

export class DateUtil {
  static formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    return format(dateObj, formatStr);
  }

  static formatDateTime(date: Date | string): string {
    return this.formatDate(date, 'yyyy-MM-dd HH:mm:ss');
  }

  static getStartOfDay(date: Date = new Date()): Date {
    return startOfDay(date);
  }

  static getEndOfDay(date: Date = new Date()): Date {
    return endOfDay(date);
  }

  static getDateRange(days: number): { start: Date; end: Date } {
    const end = new Date();
    const start = subDays(end, days);
    return { start, end };
  }

  static getWeekRange(weeks: number = 1): { start: Date; end: Date } {
    const end = new Date();
    const start = subWeeks(end, weeks);
    return { start, end };
  }

  static getMonthRange(months: number = 1): { start: Date; end: Date } {
    const end = new Date();
    const start = subMonths(end, months);
    return { start, end };
  }

  static isToday(date: Date | string): boolean {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    const today = new Date();
    return this.formatDate(dateObj) === this.formatDate(today);
  }

  static daysBetween(date1: Date | string, date2: Date | string): number {
    const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
    const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
