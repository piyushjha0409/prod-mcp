import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { AnalyticsService } from '../services/analytics.service';
import { MeetingPrepService } from '../services/meeting-prep.service';
import { CalendarService } from '../services/calendar.service';
import { z } from 'zod';

const PrepareMeetingSchema = z.object({
  eventId: z.string().optional().describe('Event ID (optional, defaults to next meeting)'),
});

const GenerateSummarySchema = z.object({
  eventId: z.string().describe('Event ID to generate summary for'),
  notes: z.string().optional().describe('Optional meeting notes'),
});

export class AnalyticsTools {
  constructor(
    private analytics: AnalyticsService,
    private meetingPrep: MeetingPrepService,
    private calendarService: CalendarService
  ) {}

  getTools(): Tool[] {
    return [
      {
        name: 'get_weekly_report',
        description: 'Generate calendar analytics report for the current week',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_monthly_report',
        description: 'Generate calendar analytics report for the current month',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'prepare_next_meeting',
        description: 'Get context and preparation for next upcoming meeting',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'prepare_meeting',
        description: 'Get context and preparation for a specific meeting',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID to prepare for',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'generate_meeting_summary',
        description: 'Generate a meeting summary and action items',
        inputSchema: {
          type: 'object',
          properties: {
            eventId: {
              type: 'string',
              description: 'Event ID to summarize',
            },
            notes: {
              type: 'string',
              description: 'Optional meeting notes',
            },
          },
          required: ['eventId'],
        },
      },
      {
        name: 'get_week_comparison',
        description: 'Compare current week meeting load to previous week',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'calculate_focus_time_saved',
        description: 'Calculate hours saved by focus time blocks this week',
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
        case 'get_weekly_report':
          return await this.getWeeklyReport();

        case 'get_monthly_report':
          return await this.getMonthlyReport();

        case 'prepare_next_meeting':
          return await this.prepareNextMeeting();

        case 'prepare_meeting':
          return await this.prepareMeeting(args);

        case 'generate_meeting_summary':
          return await this.generateSummary(args);

        case 'get_week_comparison':
          return await this.getWeekComparison();

        case 'calculate_focus_time_saved':
          return await this.calculateFocusTimeSaved();

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error: any) {
      return { error: true, message: error.message };
    }
  }

  private async getWeeklyReport() {
    const report = await this.analytics.generateWeeklyReport();

    return {
      success: true,
      report,
      message: 'Weekly calendar analytics generated',
      summary: this.formatReportSummary(report),
    };
  }

  private async getMonthlyReport() {
    const report = await this.analytics.generateMonthlyReport();

    return {
      success: true,
      report,
      message: 'Monthly calendar analytics generated',
      summary: this.formatReportSummary(report),
    };
  }

  private async prepareNextMeeting() {
    const context = await this.meetingPrep.prepareNextMeeting();

    if (!context) {
      return {
        success: false,
        message: 'No upcoming meetings',
      };
    }

    return {
      success: true,
      context,
      message: `Prepared context for: ${context.event.summary}`,
      summary: this.formatMeetingContext(context),
    };
  }

  private async prepareMeeting(args: any) {
    const { eventId } = PrepareMeetingSchema.parse(args);

    const context = await this.meetingPrep.prepareMeeting(eventId);

    return {
      success: true,
      context,
      message: `Prepared context for: ${context.event.summary}`,
      summary: this.formatMeetingContext(context),
    };
  }

  private async generateSummary(args: any) {
    const { eventId, notes } = GenerateSummarySchema.parse(args);

    const summary = await this.meetingPrep.generateMeetingSummary(eventId, notes);

    return {
      success: true,
      summary,
      message: 'Meeting summary generated',
    };
  }

  private async getWeekComparison() {
    const comparison = await this.analytics.getWeekOverWeekComparison();

    const trend = comparison.change > 0 ? '📈 Increasing' : comparison.change < 0 ? '📉 Decreasing' : '➡️ Stable';

    return {
      success: true,
      comparison,
      message: `Week-over-week comparison: ${trend}`,
      summary: `Current: ${comparison.currentWeek} meetings, Previous: ${comparison.previousWeek} meetings (${comparison.changePercent > 0 ? '+' : ''}${comparison.changePercent}%)`,
    };
  }

  private async calculateFocusTimeSaved() {
    const hoursSaved = await this.analytics.calculateFocusTimeSaved();

    return {
      success: true,
      hoursSaved,
      message: `${hoursSaved} hours protected for focus time this week`,
    };
  }

  private formatReportSummary(report: any): string {
    let summary = `📊 Calendar Analytics\n\n`;
    summary += `Total Meeting Time: ${report.totalMeetingHours} hours (${report.percentageOfWorkTime}% of work time)\n`;
    summary += `Meeting Count: ${report.meetingCount} meetings\n`;
    summary += `Average Duration: ${report.averageMeetingDuration} minutes\n`;
    summary += `Busiest Day: ${report.busiestDay}\n\n`;

    if (report.longestMeeting) {
      summary += `Longest Meeting: ${report.longestMeeting.summary} (${this.getMeetingDuration(report.longestMeeting)} min)\n\n`;
    }

    summary += `📈 Breakdown by Day:\n`;
    Object.entries(report.meetingsByDay).forEach(([day, count]) => {
      summary += `• ${day}: ${count} meetings\n`;
    });

    if (report.meetingsByType && Object.keys(report.meetingsByType).length > 0) {
      summary += `\n📋 Breakdown by Type:\n`;
      Object.entries(report.meetingsByType).forEach(([type, count]) => {
        summary += `• ${type}: ${count} meetings\n`;
      });
    }

    if (report.recommendations && report.recommendations.length > 0) {
      summary += `\n💡 Recommendations:\n`;
      report.recommendations.forEach((rec: string) => {
        summary += `${rec}\n`;
      });
    }

    return summary;
  }

  private formatMeetingContext(context: any): string {
    let summary = `📅 ${context.event.summary}\n\n`;
    
    if (context.timeUntilMeeting > 0) {
      summary += `⏰ In ${context.timeUntilMeeting} minutes\n`;
    } else if (context.timeUntilMeeting < 0) {
      summary += `⏰ Started ${Math.abs(context.timeUntilMeeting)} minutes ago\n`;
    } else {
      summary += `⏰ Starting now\n`;
    }

    if (context.participants.length > 0) {
      summary += `👥 Participants: ${context.participants.join(', ')}\n`;
    }

    if (context.event.location) {
      summary += `📍 Location: ${context.event.location}\n`;
    }

    if (context.suggestedAgenda.length > 0) {
      summary += `\n🎯 Suggested Agenda:\n`;
      context.suggestedAgenda.forEach((item: string, index: number) => {
        summary += `${index + 1}. ${item}\n`;
      });
    }

    if (context.previousMeetings.length > 0) {
      summary += `\n📚 Previous Related Meetings:\n`;
      context.previousMeetings.forEach((meeting: any) => {
        summary += `• ${meeting.summary}\n`;
      });
    }

    if (context.relatedMessages.length > 0) {
      summary += `\n💬 Related Slack Context:\n`;
      context.relatedMessages.forEach((msg: string) => {
        summary += `• ${msg}\n`;
      });
    }

    return summary;
  }

  private getMeetingDuration(event: any): number {
    try {
      const start = new Date(event.start.dateTime);
      const end = new Date(event.end.dateTime);
      return Math.round((end.getTime() - start.getTime()) / 60000);
    } catch (error) {
      return 0;
    }
  }
}
