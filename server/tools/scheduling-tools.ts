import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { SmartSchedulerService } from '../services/smart-scheduler.service';
import { FocusTimeService } from '../services/focus-time.service';
import { z } from 'zod';

const FindOptimalTimeSchema = z.object({
  duration: z.number().min(15).describe('Meeting duration in minutes'),
  daysAhead: z.number().min(1).max(30).default(7).describe('Days ahead to search'),
  preferMornings: z.boolean().default(false).describe('Prefer morning slots'),
});

const SetupFocusTimeSchema = z.object({
  startHour: z.number().min(0).max(23).describe('Start hour (0-23)'),
  endHour: z.number().min(0).max(23).describe('End hour (0-23)'),
  daysOfWeek: z.array(z.number().min(0).max(6)).describe('Days of week (0=Sunday, 1=Monday, etc.)'),
});

const ActivateFocusModeSchema = z.object({
  durationMinutes: z.number().min(15).max(480).describe('Duration in minutes'),
});

export class SchedulingTools {
  constructor(
    private smartScheduler: SmartSchedulerService,
    private focusTime: FocusTimeService
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'find_optimal_meeting_time',
        description: 'Find the best time slots for a meeting based on availability and productivity patterns',
        inputSchema: {
          type: 'object',
          properties: {
            duration: {
              type: 'number',
              description: 'Meeting duration in minutes',
            },
            daysAhead: {
              type: 'number',
              description: 'How many days ahead to search (default: 7)',
              default: 7,
            },
            preferMornings: {
              type: 'boolean',
              description: 'Prefer morning time slots',
              default: false,
            },
          },
          required: ['duration'],
        },
      },
      {
        name: 'setup_focus_time',
        description: 'Set up recurring focus time blocks for deep work',
        inputSchema: {
          type: 'object',
          properties: {
            startHour: {
              type: 'number',
              description: 'Start hour (0-23)',
            },
            endHour: {
              type: 'number',
              description: 'End hour (0-23)',
            },
            daysOfWeek: {
              type: 'array',
              description: 'Days of week (0=Sunday, 1=Monday, etc.)',
              items: { type: 'number' },
            },
          },
          required: ['startHour', 'endHour', 'daysOfWeek'],
        },
      },
      {
        name: 'activate_focus_mode',
        description: 'Activate focus mode with Slack DND and status update',
        inputSchema: {
          type: 'object',
          properties: {
            durationMinutes: {
              type: 'number',
              description: 'Duration in minutes',
            },
          },
          required: ['durationMinutes'],
        },
      },
      {
        name: 'deactivate_focus_mode',
        description: 'Deactivate focus mode and clear Slack status',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'analyze_productivity',
        description: 'Analyze calendar patterns to identify most productive hours and meeting load',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'sync_calendar_to_slack',
        description: 'Sync calendar status to Slack automatically',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ];
  }

  async handleToolCall(name: string, args: any): Promise<any> {
    try {
      switch (name) {
        case 'find_optimal_meeting_time':
          return await this.findOptimalTime(args);

        case 'setup_focus_time':
          return await this.setupFocusTime(args);

        case 'activate_focus_mode':
          return await this.activateFocusMode(args);

        case 'deactivate_focus_mode':
          return await this.deactivateFocusMode();

        case 'analyze_productivity':
          return await this.analyzeProductivity();

        case 'sync_calendar_to_slack':
          return await this.syncCalendarToSlack();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return { error: true, message: error.message };
    }
  }

  private async findOptimalTime(args: any) {
    const { duration, daysAhead, preferMornings } = FindOptimalTimeSchema.parse(args);

    const slots = await this.smartScheduler.findOptimalSlots(duration, daysAhead, {
      preferMornings,
      avoidLunchTime: true,
      bufferBetweenMeetings: 15,
    });

    const topSlots = slots.slice(0, 5).map(scored => ({
      start: scored.slot.start,
      end: scored.slot.end,
      score: scored.score,
      reasons: scored.reasons,
    }));

    return {
      success: true,
      topSlots,
      totalFound: slots.length,
      message: `Found ${slots.length} possible slots, showing top 5 optimal times`,
    };
  }

  private async setupFocusTime(args: any) {
    const { startHour, endHour, daysOfWeek } = SetupFocusTimeSchema.parse(args);

    await this.focusTime.setupFocusTime({
      dailyBlocks: [{ start: startHour, end: endHour }],
      daysOfWeek,
      autoDeclineMeetings: true,
      slackDND: true,
    });

    return {
      success: true,
      message: 'Focus time blocks created for the next 4 weeks',
      config: {
        hours: `${startHour}:00 - ${endHour}:00`,
        days: daysOfWeek.map(d => ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d]),
      },
    };
  }

  private async activateFocusMode(args: any) {
    const { durationMinutes } = ActivateFocusModeSchema.parse(args);

    await this.focusTime.activateFocusMode(durationMinutes);

    return {
      success: true,
      message: `Focus mode activated for ${durationMinutes} minutes`,
      slackStatus: 'Deep Work - Do Not Disturb 🎯',
      dndEnabled: true,
    };
  }

  private async deactivateFocusMode() {
    await this.focusTime.deactivateFocusMode();

    return {
      success: true,
      message: 'Focus mode deactivated',
      slackStatus: 'Available',
      dndEnabled: false,
    };
  }

  private async analyzeProductivity() {
    const analysis = await this.smartScheduler.analyzeProductivityPatterns();

    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const mostProductiveHours = analysis.mostProductiveHours.map(h => `${h}:00`);
    const leastBusyDays = analysis.leastBusyDays.map(d => dayNames[d]);

    return {
      success: true,
      analysis: {
        mostProductiveHours,
        leastBusyDays,
        averageMeetingsPerDay: analysis.averageMeetingsPerDay,
      },
      message: 'Productivity analysis complete',
      recommendations: this.generateRecommendations(analysis),
    };
  }

  private async syncCalendarToSlack() {
    await this.focusTime.syncCalendarToSlack();

    return {
      success: true,
      message: 'Calendar synced to Slack status',
    };
  }

  private generateRecommendations(analysis: any): string[] {
    const recommendations: string[] = [];

    if (analysis.averageMeetingsPerDay > 4) {
      recommendations.push('⚠️ High meeting load detected. Consider blocking focus time.');
    }

    if (analysis.mostProductiveHours.length > 0) {
      recommendations.push(`💡 Protect ${analysis.mostProductiveHours.join(', ')} for deep work.`);
    }

    if (analysis.leastBusyDays.length > 0) {
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const days = analysis.leastBusyDays.map((d: number) => dayNames[d]).join(' and ');
      recommendations.push(`📅 ${days} are your least busy days - ideal for focus work.`);
    }

    return recommendations;
  }
}
