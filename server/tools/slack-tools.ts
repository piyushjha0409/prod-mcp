import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SlackService } from '../services/slack.service';
import { z } from 'zod';

const SendMessageSchema = z.object({
  channel: z.string().describe('Slack channel ID or name (e.g., #general or C1234567890)'),
  text: z.string().describe('Message text to send'),
  blocks: z.array(z.any()).optional().describe('Optional Slack blocks for rich formatting'),
});

const GetChannelsSchema = z.object({
  types: z.string().optional().default('public_channel,private_channel').describe('Channel types to fetch'),
});

const GetUsersSchema = z.object({
  limit: z.number().optional().default(100).describe('Maximum number of users to fetch'),
});

const SendCalendarNotificationSchema = z.object({
  channel: z.string().describe('Slack channel ID or name'),
  event: z.object({
    summary: z.string(),
    start: z.object({
      dateTime: z.string(),
      timeZone: z.string(),
    }),
    end: z.object({
      dateTime: z.string(),
      timeZone: z.string(),
    }),
    location: z.string().optional(),
    description: z.string().optional(),
    attendees: z.array(z.object({ email: z.string() })).optional(),
  }),
});

const SendAvailableSlotsSchema = z.object({
  channel: z.string().describe('Slack channel ID or name'),
  slots: z.array(z.object({
    start: z.string(),
    end: z.string(),
    duration: z.number(),
  })),
});

const SendUpcomingEventsSchema = z.object({
  channel: z.string().describe('Slack channel ID or name'),
  events: z.array(z.object({
    summary: z.string(),
    start: z.object({
      dateTime: z.string(),
      timeZone: z.string(),
    }),
    end: z.object({
      dateTime: z.string(),
      timeZone: z.string(),
    }),
    location: z.string().optional(),
  })),
});

export class SlackTools {
  constructor(private slackService: SlackService) {}

  getTools(): Tool[] {
    return [
      {
        name: 'send_slack_message',
        description: 'Send a message to a Slack channel.',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel ID or name (e.g., #general)' },
            text: { type: 'string', description: 'Message text to send' },
            blocks: { type: 'array', description: 'Optional Slack blocks for rich formatting' },
          },
          required: ['channel', 'text'],
        },
      },
      {
        name: 'get_slack_channels',
        description: 'Get list of Slack channels the bot has access to.',
        inputSchema: {
          type: 'object',
          properties: {
            types: { type: 'string', description: 'Channel types to fetch', default: 'public_channel,private_channel' },
          },
        },
      },
      {
        name: 'get_slack_users',
        description: 'Get list of users in the Slack workspace.',
        inputSchema: {
          type: 'object',
          properties: {
            limit: { type: 'number', description: 'Maximum number of users to fetch', default: 100 },
          },
        },
      },
      {
        name: 'send_calendar_notification',
        description: 'Send a formatted calendar event notification to a Slack channel.',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel ID or name' },
            event: {
              type: 'object',
              properties: {
                summary: { type: 'string' },
                start: {
                  type: 'object',
                  properties: {
                    dateTime: { type: 'string' },
                    timeZone: { type: 'string' },
                  },
                  required: ['dateTime', 'timeZone'],
                },
                end: {
                  type: 'object',
                  properties: {
                    dateTime: { type: 'string' },
                    timeZone: { type: 'string' },
                  },
                  required: ['dateTime', 'timeZone'],
                },
                location: { type: 'string' },
                description: { type: 'string' },
                attendees: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      email: { type: 'string' },
                    },
                    required: ['email'],
                  },
                },
              },
              required: ['summary', 'start', 'end'],
            },
          },
          required: ['channel', 'event'],
        },
      },
      {
        name: 'send_available_slots',
        description: 'Send available time slots to a Slack channel.',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel ID or name' },
            slots: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  start: { type: 'string' },
                  end: { type: 'string' },
                  duration: { type: 'number' },
                },
                required: ['start', 'end', 'duration'],
              },
            },
          },
          required: ['channel', 'slots'],
        },
      },
      {
        name: 'send_upcoming_events',
        description: 'Send upcoming calendar events to a Slack channel.',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel ID or name' },
            events: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  summary: { type: 'string' },
                  start: {
                    type: 'object',
                    properties: {
                      dateTime: { type: 'string' },
                      timeZone: { type: 'string' },
                    },
                    required: ['dateTime', 'timeZone'],
                  },
                  end: {
                    type: 'object',
                    properties: {
                      dateTime: { type: 'string' },
                      timeZone: { type: 'string' },
                    },
                    required: ['dateTime', 'timeZone'],
                  },
                  location: { type: 'string' },
                },
                required: ['summary', 'start', 'end'],
              },
            },
          },
          required: ['channel', 'events'],
        },
      },
      {
        name: 'test_slack_connection',
        description: 'Test the Slack bot connection and authentication.',
        inputSchema: { type: 'object', properties: {} },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'send_slack_message':
          return await this.sendMessage(args);
        case 'get_slack_channels':
          return await this.getChannels(args);
        case 'get_slack_users':
          return await this.getUsers(args);
        case 'send_calendar_notification':
          return await this.sendCalendarNotification(args);
        case 'send_available_slots':
          return await this.sendAvailableSlots(args);
        case 'send_upcoming_events':
          return await this.sendUpcomingEvents(args);
        case 'test_slack_connection':
          return await this.testConnection();
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return { error: true, message: error.message };
    }
  }

  //TODO: Implement these methods and fix the errors below 
  private async sendMessage(args: any) {
    const { channel, text, blocks } = SendMessageSchema.parse(args);
    const result = await this.slackService.sendMessage({ channel, text, blocks });
    return { success: true, result, message: 'Message sent successfully' };
  }

  private async getChannels(args: any) {
    const { types } = GetChannelsSchema.parse(args);
    const channels = await this.slackService.getChannels();
    return { success: true, channels, count: channels.length };
  }

  private async getUsers(args: any) {
    const { limit } = GetUsersSchema.parse(args);
    const users = await this.slackService.getUsers();
    return { success: true, users: users.slice(0, limit), count: users.length };
  }

  private async sendCalendarNotification(args: any) {
    const { channel, event } = SendCalendarNotificationSchema.parse(args);
    const result = await this.slackService.sendCalendarNotification(channel, event);
    return { success: true, result, message: 'Calendar notification sent successfully' };
  }

  private async sendAvailableSlots(args: any) {
    const { channel, slots } = SendAvailableSlotsSchema.parse(args);
    const result = await this.slackService.sendAvailableSlots(channel, slots);
    return { success: true, result, message: 'Available slots sent successfully' };
  }

  private async sendUpcomingEvents(args: any) {
    const { channel, events } = SendUpcomingEventsSchema.parse(args);
    const result = await this.slackService.sendUpcomingEvents(channel, events);
    return { success: true, result, message: 'Upcoming events sent successfully' };
  }

  private async testConnection() {
    const isConnected = await this.slackService.testConnection();
    return { 
      success: isConnected, 
      message: isConnected ? 'Slack connection successful' : 'Slack connection failed' 
    };
  }
}

