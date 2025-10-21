import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { CalendarService } from '../services/calendar.service';
import { NLPService } from '../services/nlp.service';
import { z } from 'zod';
import { CalendarEvent } from '../types/calendar.types';

const CreateEventSchema = z.object({
  input: z.string().describe('Natural language description of the event to create, e.g., "Schedule a team meeting tomorrow at 10am for 30 minutes"'),
});

const FindTimeSchema = z.object({
  duration: z.number().min(15).describe('Meeting duration in minutes'),
  daysAhead: z.number().min(1).max(30).default(7).describe('How many days in the future to search'),
});

const GetEventsSchema = z.object({
  maxResults: z.number().min(1).max(50).default(10).describe('Maximum number of events to retrieve'),
});

export class CalendarTools {
  constructor(
    private calendarService: CalendarService,
    private nlpService: NLPService
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'create_calendar_event',
        description: 'Create a new calendar event using a natural language description.',
        inputSchema: {
          type: 'object',
          properties: {
            input: { type: 'string', description: 'e.g., "Team sync tomorrow at 10am for 1 hour"' },
          },
          required: ['input'],
        },
      },
      {
        name: 'find_available_time',
        description: 'Finds available time slots for a meeting.',
        inputSchema: {
          type: 'object',
          properties: {
            duration: { type: 'number', description: 'Duration in minutes' },
            daysAhead: { type: 'number', description: 'Days to search ahead (default 7)', default: 7 },
          },
          required: ['duration'],
        },
      },
      {
        name: 'get_upcoming_events',
        description: 'Retrieves a list of upcoming calendar events.',
        inputSchema: {
          type: 'object',
          properties: {
            maxResults: { type: 'number', description: 'Max events to return (default 10)', default: 10 },
          },
        },
      },
      {
        name: 'get_next_event',
        description: 'Gets the very next event on the calendar.',
        inputSchema: { type: 'object', properties: {} },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'create_calendar_event':
          return await this.createEvent(args);
        case 'find_available_time':
          return await this.findAvailableTime(args);
        case 'get_upcoming_events':
          return await this.getUpcomingEvents(args);
        case 'get_next_event':
          return await this.getNextEvent();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return { error: true, message: error.message };
    }
  }

  private async createEvent(args: any) {
    const { input } = CreateEventSchema.parse(args);
    const intent = await this.nlpService.parseEventIntent(input);

    if (intent.action !== 'create' || !intent.event) {
      return { error: true, message: 'Could not understand the event details from your request.' };
    }

    const createdEvent = await this.calendarService.createEvent(intent.event as CalendarEvent);
    return { success: true, event: createdEvent, message: `Event "${createdEvent.summary}" created successfully.` };
  }

  private async findAvailableTime(args: any) {
    const { duration, daysAhead } = FindTimeSchema.parse(args);
    const dateRange = {
      start: new Date(),
      end: new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000),
    };

    const slots = await this.calendarService.findAvailableSlots({ duration, dateRange });
    return { success: true, availableSlots: slots.slice(0, 10), totalFound: slots.length };
  }

  private async getUpcomingEvents(args: any) {
    const { maxResults } = GetEventsSchema.parse(args);
    const events = await this.calendarService.getUpcomingEvents(maxResults);
    return { success: true, events, count: events.length };
  }

  private async getNextEvent() {
    const event = await this.calendarService.getNextEvent();
    if (!event) {
      return { success: true, message: 'No upcoming events found.' };
    }
    return { success: true, event };
  }
}
