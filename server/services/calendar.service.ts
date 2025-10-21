import { google, calendar_v3 } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';
import { CalendarEvent, TimeSlot, FindTimeOptions } from '../types/calendar.types';
import { addMinutes, isWeekend, format, parseISO } from 'date-fns';

export class CalendarService {
  private calendar: calendar_v3.Calendar;

  constructor(auth: OAuth2Client) {
    this.calendar = google.calendar({ version: 'v3', auth });
  }

  async getUpcomingEvents(maxResults: number = 10): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items?.map(this.transformEvent) || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  async getEventsInRange(start: Date, end: Date): Promise<CalendarEvent[]> {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: start.toISOString(),
        timeMax: end.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items?.map(this.transformEvent) || [];
    } catch (error) {
      console.error('Error fetching events in range:', error);
      throw new Error('Failed to fetch events in range');
    }
  }

  async createEvent(event: CalendarEvent): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event as calendar_v3.Schema$Event,
      });

      console.log(`✅ Event created: ${response.data.htmlLink}`);
      return this.transformEvent(response.data);
    } catch (error) {
      console.error('Error creating event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  async updateEvent(eventId: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updates as calendar_v3.Schema$Event,
      });

      console.log(`✅ Event updated: ${eventId}`);
      return this.transformEvent(response.data);
    } catch (error) {
      console.error('Error updating event:', error);
      throw new Error('Failed to update calendar event');
    }
  }

  async deleteEvent(eventId: string): Promise<void> {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
      });

      console.log(`✅ Event deleted: ${eventId}`);
    } catch (error) {
      console.error('Error deleting event:', error);
      throw new Error('Failed to delete calendar event');
    }
  }

  async findAvailableSlots(options: FindTimeOptions): Promise<TimeSlot[]> {
    const { duration, dateRange, workingHours = { start: 9, end: 17 }, excludeWeekends = true } = options;

    const events = await this.getEventsInRange(dateRange.start, dateRange.end);

    const availableSlots: TimeSlot[] = [];
    let currentTime = new Date(dateRange.start);

    currentTime.setHours(workingHours.start, 0, 0, 0);

    while (currentTime < dateRange.end) {
      if (excludeWeekends && isWeekend(currentTime)) {
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(workingHours.start, 0, 0, 0);
        continue;
      }

      const currentHour = currentTime.getHours();
      if (currentHour < workingHours.start || currentHour >= workingHours.end) {
        currentTime.setDate(currentTime.getDate() + 1);
        currentTime.setHours(workingHours.start, 0, 0, 0);
        continue;
      }

      const slotEnd = addMinutes(currentTime, duration);

      const hasConflict = events.some(event => {
        const eventStart = parseISO(event.start.dateTime);
        const eventEnd = parseISO(event.end.dateTime);

        return (
          (currentTime >= eventStart && currentTime < eventEnd) ||
          (slotEnd > eventStart && slotEnd <= eventEnd) ||
          (currentTime <= eventStart && slotEnd >= eventEnd)
        );
      });

      if (!hasConflict) {
        availableSlots.push({
          start: new Date(currentTime),
          end: new Date(slotEnd),
          available: true,
        });
      }

      currentTime = addMinutes(currentTime, 30);
    }

    return availableSlots;
  }

  async getNextEvent(): Promise<CalendarEvent | null> {
    const events = await this.getUpcomingEvents(1);
    return events[0] || null;
  }

  private transformEvent(gEvent: calendar_v3.Schema$Event): CalendarEvent {
    return {
      id: gEvent.id || undefined,
      summary: gEvent.summary || 'No Title',
      description: gEvent.description || undefined,
      start: {
        dateTime: gEvent.start?.dateTime || gEvent.start?.date || '',
        timeZone: gEvent.start?.timeZone || undefined,
      },
      end: {
        dateTime: gEvent.end?.dateTime || gEvent.end?.date || '',
        timeZone: gEvent.end?.timeZone || undefined,
      },
      attendees: gEvent.attendees?.map(a => ({ email: a.email || '' })) || undefined,
      location: gEvent.location || undefined,
    };
  }
}
