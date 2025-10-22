import { CalendarService } from './calendar.service';
import { SlackService } from './slack.service';
import { CalendarEvent } from '../types/calendar.types';
import { addDays, setHours, setMinutes, parseISO } from 'date-fns';

export interface FocusTimeConfig {
  dailyBlocks: Array<{ start: number; end: number }>; // hours
  daysOfWeek: number[]; // 0-6 (Sunday-Saturday)
  autoDeclineMeetings: boolean;
  slackDND: boolean;
}

export class FocusTimeService {
  constructor(
    private calendarService: CalendarService,
    private slackService: SlackService
  ) {}

  /**
   * Set up recurring focus time blocks
   */
  async setupFocusTime(config: FocusTimeConfig, weeksAhead: number = 4): Promise<void> {
    const eventsCreated: CalendarEvent[] = [];

    for (let week = 0; week < weeksAhead; week++) {
      for (const dayOfWeek of config.daysOfWeek) {
        for (const block of config.dailyBlocks) {
          const startDate = addDays(new Date(), week * 7 + dayOfWeek);
          let start = setHours(startDate, block.start);
          start = setMinutes(start, 0);

          let end = setHours(startDate, block.end);
          end = setMinutes(end, 0);

          // Check if slot is already occupied
          const existingEvents = await this.calendarService.getEventsInRange(start, end);
          if (existingEvents.length > 0) {
            console.log(`⏭️  Skipping ${start.toISOString()} - already has events`);
            continue;
          }

          const focusEvent: CalendarEvent = {
            summary: '🎯 Focus Time - Do Not Book',
            description: 'Protected time for deep work. Meetings auto-declined.',
            start: {
              dateTime: start.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
            end: {
              dateTime: end.toISOString(),
              timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            },
          };

          const created = await this.calendarService.createEvent(focusEvent);
          eventsCreated.push(created);
        }
      }
    }

    console.log(`✅ Created ${eventsCreated.length} focus time blocks`);
  }

  /**
   * Activate focus mode (update Slack, set DND)
   */
  async activateFocusMode(durationMinutes: number): Promise<void> {
    // Update Slack status
    await this.slackService.updateStatus({
      status_text: 'Deep Work - Do Not Disturb',
      status_emoji: ':dart:',
      status_expiration: Math.floor(Date.now() / 1000) + (durationMinutes * 60),
    });

    // Enable Slack DND
    await this.slackService.setDND(durationMinutes);

    console.log(`✅ Focus mode activated for ${durationMinutes} minutes`);
  }

  /**
   * Deactivate focus mode
   */
  async deactivateFocusMode(): Promise<void> {
    await this.slackService.clearStatus();
    await this.slackService.endDND();

    console.log('✅ Focus mode deactivated');
  }

  /**
   * Check upcoming events and auto-update Slack status
   */
  async syncCalendarToSlack(): Promise<void> {
    const nextEvent = await this.calendarService.getNextEvent();

    if (!nextEvent) {
      await this.slackService.clearStatus();
      return;
    }

    // Calculate time until event
    const now = new Date();
    const eventStart = parseISO(nextEvent.start.dateTime);
    const minutesUntilEvent = Math.floor((eventStart.getTime() - now.getTime()) / 60000);

    // If event is within 5 minutes, update status
    if (minutesUntilEvent <= 5 && minutesUntilEvent >= 0) {
      const eventEnd = parseISO(nextEvent.end.dateTime);
      const duration = Math.floor((eventEnd.getTime() - eventStart.getTime()) / 60000);

      const status = this.slackService.generateStatusForEvent(nextEvent.summary, duration);
      await this.slackService.updateStatus(status);

      console.log(`✅ Slack status synced for: ${nextEvent.summary}`);
    }
  }
}
