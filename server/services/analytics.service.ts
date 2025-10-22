import { CalendarService } from './calendar.service';
import { CalendarEvent } from '../types/calendar.types';
import { parseISO, differenceInMinutes, format, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

export interface CalendarAnalytics {
  totalMeetingHours: number;
  meetingCount: number;
  averageMeetingDuration: number;
  percentageOfWorkTime: number;
  busiestDay: string;
  longestMeeting: CalendarEvent | null;
  meetingsByDay: Record<string, number>;
  meetingsByType: Record<string, number>;
  recommendations: string[];
}

export interface MonthlyAnalytics extends CalendarAnalytics {
  weeklyBreakdown: Array<{
    week: string;
    meetingCount: number;
    totalHours: number;
  }>;
}

export class AnalyticsService {
  constructor(private calendarService: CalendarService) {}

  async generateWeeklyReport(): Promise<CalendarAnalytics> {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

    return await this.generateReport(weekStart, weekEnd, 40); // 40 work hours per week
  }

  async generateMonthlyReport(): Promise<MonthlyAnalytics> {
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    const baseReport = await this.generateReport(monthStart, monthEnd, 160); // ~160 work hours per month

    // Generate weekly breakdown
    const weeklyBreakdown = await this.generateWeeklyBreakdown(monthStart, monthEnd);

    return {
      ...baseReport,
      weeklyBreakdown,
    };
  }

  private async generateReport(
    startDate: Date,
    endDate: Date,
    totalWorkHours: number
  ): Promise<CalendarAnalytics> {
    const events = await this.calendarService.getEventsInRange(startDate, endDate);

    // Calculate metrics
    let totalMinutes = 0;
    let longestMeeting: CalendarEvent | null = null;
    let maxDuration = 0;
    const meetingsByDay: Record<string, number> = {};
    const meetingsByType: Record<string, number> = {};

    events.forEach(event => {
      const start = parseISO(event.start.dateTime);
      const end = parseISO(event.end.dateTime);
      const duration = differenceInMinutes(end, start);

      totalMinutes += duration;

      // Track longest meeting
      if (duration > maxDuration) {
        maxDuration = duration;
        longestMeeting = event;
      }

      // Count meetings by day
      const dayName = format(start, 'EEEE');
      meetingsByDay[dayName] = (meetingsByDay[dayName] || 0) + 1;

      // Categorize meeting types
      const type = this.categorizeMeeting(event.summary);
      meetingsByType[type] = (meetingsByType[type] || 0) + 1;
    });

    const totalHours = totalMinutes / 60;
    const percentageOfWorkTime = (totalHours / totalWorkHours) * 100;

    // Find busiest day
    const busiestDay = Object.entries(meetingsByDay)
      .sort(([, a], [, b]) => b - a)[0]?.[0] || 'No meetings';

    // Generate recommendations
    const recommendations = this.generateRecommendations({
      totalHours,
      meetingCount: events.length,
      percentageOfWorkTime,
      meetingsByDay,
      meetingsByType,
    });

    return {
      totalMeetingHours: parseFloat(totalHours.toFixed(1)),
      meetingCount: events.length,
      averageMeetingDuration: events.length > 0 ? Math.round(totalMinutes / events.length) : 0,
      percentageOfWorkTime: parseFloat(percentageOfWorkTime.toFixed(1)),
      busiestDay,
      longestMeeting,
      meetingsByDay,
      meetingsByType,
      recommendations,
    };
  }

  private async generateWeeklyBreakdown(startDate: Date, endDate: Date) {
    const weeks: Array<{
      week: string;
      meetingCount: number;
      totalHours: number;
    }> = [];

    let currentWeek = startOfWeek(startDate, { weekStartsOn: 1 });
    
    while (currentWeek <= endDate) {
      const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
      const events = await this.calendarService.getEventsInRange(currentWeek, weekEnd);

      const totalMinutes = events.reduce((sum, event) => {
        const start = parseISO(event.start.dateTime);
        const end = parseISO(event.end.dateTime);
        return sum + differenceInMinutes(end, start);
      }, 0);

      weeks.push({
        week: `Week of ${format(currentWeek, 'MMM d')}`,
        meetingCount: events.length,
        totalHours: parseFloat((totalMinutes / 60).toFixed(1)),
      });

      // Move to next week
      currentWeek = new Date(currentWeek.getTime() + 7 * 24 * 60 * 60 * 1000);
    }

    return weeks;
  }

  private categorizeMeeting(summary: string): string {
    const lower = summary.toLowerCase();

    if (lower.includes('standup') || lower.includes('daily')) {
      return 'Standups';
    }
    if (lower.includes('1:1') || lower.includes('one-on-one')) {
      return '1:1s';
    }
    if (lower.includes('review') || lower.includes('retro')) {
      return 'Reviews';
    }
    if (lower.includes('planning') || lower.includes('sprint')) {
      return 'Planning';
    }
    if (lower.includes('interview')) {
      return 'Interviews';
    }
    if (lower.includes('all hands') || lower.includes('town hall')) {
      return 'All Hands';
    }

    return 'Other';
  }

  private generateRecommendations(metrics: {
    totalHours: number;
    meetingCount: number;
    percentageOfWorkTime: number;
    meetingsByDay: Record<string, number>;
    meetingsByType: Record<string, number>;
  }): string[] {
    const recommendations: string[] = [];

    // Check meeting load
    if (metrics.percentageOfWorkTime > 50) {
      recommendations.push(`⚠️ Critical: You spend ${metrics.percentageOfWorkTime.toFixed(0)}% of time in meetings (industry avg: 31%). Consider declining non-essential meetings.`);
    } else if (metrics.percentageOfWorkTime > 40) {
      recommendations.push(`⚠️ You spend ${metrics.percentageOfWorkTime.toFixed(0)}% of time in meetings (industry avg: 31%). Try to reduce by 20%.`);
    }

    // Check meeting count
    if (metrics.meetingCount > 25) {
      recommendations.push('💡 High meeting count detected. Consider batching meetings on specific days to create full days for deep work.');
    }

    // Check total hours
    if (metrics.totalHours > 20) {
      recommendations.push('🚀 Block at least one full day per week as meeting-free for focused work.');
    }

    // Check daily distribution
    const maxMeetingsInDay = Math.max(...Object.values(metrics.meetingsByDay));
    if (maxMeetingsInDay > 6) {
      recommendations.push(`📅 Your busiest day has ${maxMeetingsInDay} meetings. Try to redistribute across the week.`);
    }

    // Check meeting types
    const standupCount = metrics.meetingsByType['Standups'] || 0;
    if (standupCount > 10) {
      recommendations.push('⏰ Consider reducing standup frequency or duration.');
    }

    // Positive feedback
    if (recommendations.length === 0) {
      recommendations.push('✅ Your meeting load looks healthy! Keep it up.');
    } else {
      recommendations.push('💪 Implement these changes gradually over the next 2 weeks.');
    }

    return recommendations;
  }

  /**
   * Get time saved by blocking focus time
   */
  async calculateFocusTimeSaved(): Promise<number> {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const events = await this.calendarService.getEventsInRange(weekStart, weekEnd);
    
    const focusTimeEvents = events.filter(event => 
      event.summary.toLowerCase().includes('focus') || 
      event.summary.toLowerCase().includes('do not book')
    );

    const totalMinutes = focusTimeEvents.reduce((sum, event) => {
      const start = parseISO(event.start.dateTime);
      const end = parseISO(event.end.dateTime);
      return sum + differenceInMinutes(end, start);
    }, 0);

    return parseFloat((totalMinutes / 60).toFixed(1));
  }

  /**
   * Compare current week to previous week
   */
  async getWeekOverWeekComparison(): Promise<{
    currentWeek: number;
    previousWeek: number;
    change: number;
    changePercent: number;
  }> {
    const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
    const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
    
    const previousWeekStart = new Date(currentWeekStart.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previousWeekEnd = new Date(currentWeekEnd.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [currentEvents, previousEvents] = await Promise.all([
      this.calendarService.getEventsInRange(currentWeekStart, currentWeekEnd),
      this.calendarService.getEventsInRange(previousWeekStart, previousWeekEnd),
    ]);

    const currentCount = currentEvents.length;
    const previousCount = previousEvents.length;
    const change = currentCount - previousCount;
    const changePercent = previousCount > 0 ? (change / previousCount) * 100 : 0;

    return {
      currentWeek: currentCount,
      previousWeek: previousCount,
      change,
      changePercent: parseFloat(changePercent.toFixed(1)),
    };
  }
}
