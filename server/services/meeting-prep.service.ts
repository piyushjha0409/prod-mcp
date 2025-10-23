import { CalendarService } from './calendar.service';
import { SlackService } from './slack.service';
import { CalendarEvent } from '../types/calendar.types';
import { parseISO, differenceInMinutes } from 'date-fns';
import OpenAI from 'openai';

export interface MeetingContext {
  event: CalendarEvent;
  relatedMessages: string[];
  previousMeetings: CalendarEvent[];
  suggestedAgenda: string[];
  participants: string[];
  timeUntilMeeting: number; // minutes
}

export class MeetingPrepService {
  private openai: OpenAI;

  constructor(
    private calendarService: CalendarService,
    private slackService?: SlackService
  ) {
    // Lazy initialization - only create OpenAI client at runtime
    this.openai = new OpenAI({ 
      apiKey: process.env.OPENAI_API_KEY || '' 
    });
  }

  /**
   * Prepare context for upcoming meeting
   */
  async prepareMeeting(eventId: string): Promise<MeetingContext> {
    const events = await this.calendarService.getUpcomingEvents(20);
    const event = events.find(e => e.id === eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    // Calculate time until meeting
    const now = new Date();
    const eventStart = parseISO(event.start.dateTime);
    const timeUntilMeeting = differenceInMinutes(eventStart, now);

    // Gather context from multiple sources
    const [relatedMessages, previousMeetings, suggestedAgenda] = await Promise.all([
      this.findRelatedSlackMessages(event),
      this.findPreviousMeetings(event),
      this.generateAgenda(event),
    ]);

    return {
      event,
      relatedMessages,
      previousMeetings,
      suggestedAgenda,
      participants: event.attendees?.map(a => a.email) || [],
      timeUntilMeeting,
    };
  }

  /**
   * Prepare for the next upcoming meeting
   */
  async prepareNextMeeting(): Promise<MeetingContext | null> {
    const nextEvent = await this.calendarService.getNextEvent();

    if (!nextEvent || !nextEvent.id) {
      return null;
    }

    return await this.prepareMeeting(nextEvent.id);
  }

  private async findRelatedSlackMessages(event: CalendarEvent): Promise<string[]> {
    // Simplified: In production, search Slack for messages mentioning attendees or keywords
    // For demo, return placeholder
    const keywords = event.summary.toLowerCase().split(' ').filter(w => w.length > 3);
    
    if (keywords.length === 0) {
      return ['No recent Slack discussions found'];
    }

    return [
      `Recent Slack discussion about "${keywords[0]}"`,
      `Team thread mentioning ${event.attendees?.[0]?.email || 'participants'}`,
    ];
  }

  private async findPreviousMeetings(event: CalendarEvent): Promise<CalendarEvent[]> {
    // Find past meetings with same attendees or similar title
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const allEvents = await this.calendarService.getEventsInRange(thirtyDaysAgo, new Date());

    // Extract keywords from event summary
    const keywords = event.summary.toLowerCase().split(' ').filter(w => w.length > 3);

    return allEvents.filter(e => {
      // Check for similar title
      const similarTitle = keywords.some(keyword => 
        e.summary.toLowerCase().includes(keyword)
      );
      
      // Check for same attendees
      const sameAttendees = event.attendees?.some(attendee =>
        e.attendees?.some(a => a.email === attendee.email)
      );

      return (similarTitle || sameAttendees) && e.id !== event.id;
    }).slice(0, 3);
  }

  private async generateAgenda(event: CalendarEvent): Promise<string[]> {
    const prompt = `Generate a concise 3-point meeting agenda for: "${event.summary}"

Context:
- Meeting duration: ${this.getEventDuration(event)} minutes
- Attendees: ${event.attendees?.map(a => a.email).join(', ') || 'Not specified'}
- Location: ${event.location || 'Virtual'}

Return ONLY a JSON object with format: {"items":["point 1","point 2","point 3"]}`;

    try {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key not configured');
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      });

      const parsed = JSON.parse(response.choices[0].message.content || '{"items":[]}');
      return parsed.items || this.getFallbackAgenda(event);
    } catch (error) {
      console.log('⚠️  OpenAI not available, using fallback agenda');
      return this.getFallbackAgenda(event);
    }
  }

  private getFallbackAgenda(event: CalendarEvent): string[] {
    return [
      `Discuss ${event.summary}`,
      'Review action items from previous meeting',
      'Align on next steps and responsibilities',
    ];
  }

  private getEventDuration(event: CalendarEvent): number {
    try {
      const start = parseISO(event.start.dateTime);
      const end = parseISO(event.end.dateTime);
      return differenceInMinutes(end, start);
    } catch (error) {
      return 30; // default
    }
  }

  /**
   * Generate meeting summary/notes
   */
  async generateMeetingSummary(eventId: string, notes?: string): Promise<string> {
    const events = await this.calendarService.getUpcomingEvents(20);
    const event = events.find(e => e.id === eventId);

    if (!event) {
      throw new Error('Event not found');
    }

    const prompt = `Generate a concise meeting summary for: "${event.summary}"

Meeting Details:
- Duration: ${this.getEventDuration(event)} minutes
- Participants: ${event.attendees?.map(a => a.email).join(', ') || 'Not specified'}
${notes ? `- Notes: ${notes}` : ''}

Generate a professional summary with:
1. Key discussion points (3-4 bullets)
2. Decisions made (2-3 bullets)
3. Action items (2-3 bullets with owners)

Return plain text, concise and actionable.`;

    try {
      if (!process.env.OPENAI_API_KEY) {
        return this.getFallbackSummary(event);
      }

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.5,
      });

      return response.choices[0].message.content || this.getFallbackSummary(event);
    } catch (error) {
      console.log('⚠️  OpenAI not available, using fallback summary');
      return this.getFallbackSummary(event);
    }
  }

  private getFallbackSummary(event: CalendarEvent): string {
    return `Meeting Summary: ${event.summary}

Key Discussion Points:
• Topic 1
• Topic 2
• Topic 3

Decisions:
• Decision 1
• Decision 2

Action Items:
• [Owner] Action item 1
• [Owner] Action item 2`;
  }
}
