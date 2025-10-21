import OpenAI from 'openai';
import { CalendarEvent } from '../types/calendar.types';
import { addMinutes } from 'date-fns';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface ParsedEventIntent {
  action: 'create' | 'update' | 'delete' | 'query';
  event?: Partial<CalendarEvent>;
  query?: string;
  confidence: number;
}

export class NLPService {
  async parseEventIntent(input: string): Promise<ParsedEventIntent> {
    const systemPrompt = `You are a calendar assistant. Parse the user's request into a structured calendar event.
Current date/time: ${new Date().toISOString()}
The user's time zone is assumed to be the local one where this script is running.
Return JSON only.
Format:
{
  "action": "create" | "update" | "delete" | "query",
  "event": {
    "summary": "Meeting Title",
    "duration": 60, // in minutes
    "dateTime": "YYYY-MM-DDTHH:mm:ssZ",
    "attendees": ["email@example.com"],
    "location": "Location",
    "description": "Optional description"
  },
  "confidence": 0.95
}`;

    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: input },
        ],
        temperature: 0.2,
        response_format: { type: 'json_object' },
      });

      const content = response.choices[0].message.content;
      const parsed = content ? JSON.parse(content) : {};

      if (parsed.event && parsed.event.dateTime && parsed.event.duration) {
        const startTime = new Date(parsed.event.dateTime);
        const endTime = addMinutes(startTime, parsed.event.duration);
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        parsed.event = {
          summary: parsed.event.summary,
          description: parsed.event.description,
          location: parsed.event.location,
          start: { dateTime: startTime.toISOString(), timeZone },
          end: { dateTime: endTime.toISOString(), timeZone },
          attendees: parsed.event.attendees?.map((email: string) => ({ email })),
        };
      }

      return parsed;
    } catch (error) {
      console.error('Error parsing intent with OpenAI:', error);
      // Implement a fallback if needed
      throw new Error("Failed to parse event intent.");
    }
  }
}
