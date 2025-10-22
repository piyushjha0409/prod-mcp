import { CalendarService } from './calendar.service';
import { TimeSlot } from '../types/calendar.types';
import { differenceInMinutes, parseISO, getHours, getDay } from 'date-fns';

export interface ProductivityScore {
  slot: TimeSlot;
  score: number;
  reasons: string[];
}

export interface SchedulingPreferences {
  preferredHours?: { start: number; end: number };
  avoidLunchTime?: boolean;
  preferMornings?: boolean;
  minimizeMeetingDays?: boolean;
  bufferBetweenMeetings?: number; // minutes
}

export class SmartSchedulerService {
  constructor(private calendarService: CalendarService) {}

  /**
   * Find and rank time slots by productivity score
   */
  async findOptimalSlots(
    duration: number,
    daysAhead: number = 7,
    preferences: SchedulingPreferences = {}
  ): Promise<ProductivityScore[]> {
    // Get available slots
    const dateRange = {
      start: new Date(),
      end: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    };

    const availableSlots = await this.calendarService.findAvailableSlots({
      duration,
      dateRange,
      workingHours: preferences.preferredHours || { start: 9, end: 17 },
      excludeWeekends: true,
    });

    // Score each slot
    const scoredSlots = await Promise.all(
      availableSlots.map(slot => this.scoreSlot(slot, preferences))
    );

    // Sort by score (highest first)
    return scoredSlots.sort((a, b) => b.score - a.score);
  }

  /**
   * Score a time slot based on multiple factors
   */
  private async scoreSlot(
    slot: TimeSlot,
    preferences: SchedulingPreferences
  ): Promise<ProductivityScore> {
    let score = 100;
    const reasons: string[] = [];

    const startTime = slot.start;
    const hour = getHours(startTime);
    const dayOfWeek = getDay(startTime);

    // Factor 1: Time of day (morning bonus)
    if (hour >= 9 && hour < 11) {
      score += 20;
      reasons.push('Peak productivity hours (9-11 AM)');
    } else if (hour >= 14 && hour < 16) {
      score += 10;
      reasons.push('Good afternoon slot');
    } else if (hour >= 16) {
      score -= 10;
      reasons.push('Late afternoon (less ideal)');
    }

    // Factor 2: Avoid lunch time
    if (preferences.avoidLunchTime && hour >= 12 && hour < 13) {
      score -= 30;
      reasons.push('During typical lunch hours');
    }

    // Factor 3: Day of week preference
    if (dayOfWeek === 1) { // Monday
      score -= 5;
      reasons.push('Monday (busy start of week)');
    } else if (dayOfWeek === 5) { // Friday
      score += 5;
      reasons.push('Friday (good for wrap-ups)');
    }

    // Factor 4: Meeting density (check surrounding events)
    const meetingDensity = await this.getMeetingDensity(startTime);
    if (meetingDensity > 3) {
      score -= 15;
      reasons.push(`High meeting density (${meetingDensity} meetings nearby)`);
    } else if (meetingDensity === 0) {
      score += 10;
      reasons.push('Clear block of time (no adjacent meetings)');
    }

    // Factor 5: Buffer time
    if (preferences.bufferBetweenMeetings) {
      const hasBuffer = await this.hasBufferTime(slot, preferences.bufferBetweenMeetings);
      if (!hasBuffer) {
        score -= 20;
        reasons.push('No buffer time before/after');
      } else {
        score += 10;
        reasons.push('Good buffer time available');
      }
    }

    // Factor 6: Preferred hours
    if (preferences.preferredHours) {
      if (hour < preferences.preferredHours.start || hour >= preferences.preferredHours.end) {
        score -= 25;
        reasons.push('Outside preferred hours');
      } else {
        score += 5;
        reasons.push('Within preferred hours');
      }
    }

    return { slot, score: Math.max(0, score), reasons };
  }

  /**
   * Calculate meeting density around a time
   */
  private async getMeetingDensity(time: Date): Promise<number> {
    const startOfDay = new Date(time);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(time);
    endOfDay.setHours(23, 59, 59, 999);

    const events = await this.calendarService.getEventsInRange(startOfDay, endOfDay);
    return events.length;
  }

  /**
   * Check if slot has buffer time before/after
   */
  private async hasBufferTime(slot: TimeSlot, bufferMinutes: number): Promise<boolean> {
    const bufferStart = new Date(slot.start.getTime() - bufferMinutes * 60000);
    const bufferEnd = new Date(slot.end.getTime() + bufferMinutes * 60000);

    const eventsAround = await this.calendarService.getEventsInRange(bufferStart, bufferEnd);

    // Check if any events are too close
    return eventsAround.every(event => {
      const eventStart = parseISO(event.start.dateTime);
      const eventEnd = parseISO(event.end.dateTime);

      const beforeBuffer = differenceInMinutes(slot.start, eventEnd);
      const afterBuffer = differenceInMinutes(eventStart, slot.end);

      return beforeBuffer >= bufferMinutes && afterBuffer >= bufferMinutes;
    });
  }

  /**
   * Analyze historical productivity patterns
   */
  async analyzeProductivityPatterns(): Promise<{
    mostProductiveHours: number[];
    leastBusyDays: number[];
    averageMeetingsPerDay: number;
  }> {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const now = new Date();

    const events = await this.calendarService.getEventsInRange(thirtyDaysAgo, now);

    // Count meetings by hour
    const meetingsByHour: Record<number, number> = {};
    const meetingsByDay: Record<number, number> = {};

    events.forEach(event => {
      const startTime = parseISO(event.start.dateTime);
      const hour = getHours(startTime);
      const day = getDay(startTime);

      meetingsByHour[hour] = (meetingsByHour[hour] || 0) + 1;
      meetingsByDay[day] = (meetingsByDay[day] || 0) + 1;
    });

    // Find least busy hours (most productive)
    const hourScores = Object.entries(meetingsByHour)
      .map(([hour, count]) => ({ hour: parseInt(hour), count }))
      .sort((a, b) => a.count - b.count);

    const mostProductiveHours = hourScores.slice(0, 3).map(h => h.hour);

    // Find least busy days
    const dayScores = Object.entries(meetingsByDay)
      .map(([day, count]) => ({ day: parseInt(day), count }))
      .sort((a, b) => a.count - b.count);

    const leastBusyDays = dayScores.slice(0, 2).map(d => d.day);

    // Calculate average meetings per day
    const totalMeetings = events.length;
    const daysCounted = 30;
    const averageMeetingsPerDay = parseFloat((totalMeetings / daysCounted).toFixed(1));

    return {
      mostProductiveHours,
      leastBusyDays,
      averageMeetingsPerDay,
    };
  }
}
