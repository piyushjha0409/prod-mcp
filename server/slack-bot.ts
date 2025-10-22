import { App, SlackEventMiddlewareArgs } from '@slack/bolt';
import { AuthService } from './services/auth.service';
import { CalendarService } from './services/calendar.service';
import { NLPService } from './services/nlp.service';
import { SlackService } from './services/slack.service';
import { SmartSchedulerService } from './services/smart-scheduler.service';
import { FocusTimeService } from './services/focus-time.service';
import { CalendarTools } from './tools/calendar-tools';
import { SchedulingTools } from './tools/scheduling-tools';
import { AnalyticsTools } from './tools/analytics-tools';
import { AnalyticsService } from './services/analytics.service';
import { MeetingPrepService } from './services/meeting-prep.service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

let calendarTools: CalendarTools;
let schedulingTools: SchedulingTools;
let analyticsTools: AnalyticsTools;

// Initialize services
async function initializeServices() {
  try {
    console.log('🔐 Initializing authentication...');
    const authService = new AuthService();
    const oauth2Client = await authService.getClient();

    console.log('📅 Initializing calendar service...');
    const calendarService = new CalendarService(oauth2Client);
    const nlpService = new NLPService();
    
    console.log('💬 Initializing Slack service...');
    const slackService = new SlackService(process.env.SLACK_BOT_TOKEN!);
    
    console.log('🧠 Initializing smart scheduler...');
    const smartScheduler = new SmartSchedulerService(calendarService);
    const focusTime = new FocusTimeService(calendarService, slackService);
    
    console.log('📊 Initializing analytics...');
    const analyticsService = new AnalyticsService(calendarService);
    const meetingPrepService = new MeetingPrepService(calendarService, slackService);

    calendarTools = new CalendarTools(calendarService, nlpService);
    schedulingTools = new SchedulingTools(smartScheduler, focusTime);
    analyticsTools = new AnalyticsTools(analyticsService, meetingPrepService, calendarService);

    console.log('✅ All services initialized successfully');
  } catch (error) {
    console.error('❌ Failed to initialize services:', error);
    process.exit(1);
  }
}

// Handle app mentions (@bot)
app.event('app_mention', async ({ event, client }: SlackEventMiddlewareArgs<'app_mention'>) => {
  try {
    const text = event.text.replace(/<@[^>]+>/, '').trim();
    
    await client.chat.postMessage({
      channel: event.channel,
      text: `Processing your request: "${text}"...`,
    });

    const response = await processNaturalLanguage(text);
    
    await client.chat.postMessage({
      channel: event.channel,
      text: formatSlackResponse(response),
    });
  } catch (error) {
    console.error('Error handling app_mention:', error);
  }
});

// Handle direct messages
app.message(async ({ message, client }: any) => {
  try {
    if (message.channel_type === 'im') {
      const text = message.text;
      
      const response = await processNaturalLanguage(text);
      
      await client.chat.postMessage({
        channel: message.channel,
        text: formatSlackResponse(response),
      });
    }
  } catch (error) {
    console.error('Error handling message:', error);
  }
});

// Slash Commands

// /schedule command
app.command('/schedule', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await calendarTools.handleToolCall('create_calendar_event', {
      input: command.text,
    });

    await respond({
      text: formatSlackResponse(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /findtime command
app.command('/findtime', async ({ command, ack, respond }) => {
  await ack();

  try {
    // Parse duration from text
    const durationMatch = command.text.match(/(\d+)\s*(min|minute|hour|hr)/i);
    const duration = durationMatch
      ? durationMatch[2].toLowerCase().includes('hour')
        ? parseInt(durationMatch[1]) * 60
        : parseInt(durationMatch[1])
      : 30;

    const result = await schedulingTools.handleToolCall('find_optimal_meeting_time', {
      duration,
      daysAhead: 7,
      preferMornings: command.text.toLowerCase().includes('morning'),
    });

    await respond({
      text: formatSlackResponse(result),
      blocks: formatTimeSlotsBlocks(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /focustime command
app.command('/focustime', async ({ command, ack, respond }) => {
  await ack();

  try {
    const durationMatch = command.text.match(/(\d+)\s*(min|minute|hour|hr)/i);
    const durationMinutes = durationMatch
      ? durationMatch[2].toLowerCase().includes('hour')
        ? parseInt(durationMatch[1]) * 60
        : parseInt(durationMatch[1])
      : 120; // default 2 hours

    const result = await schedulingTools.handleToolCall('activate_focus_mode', {
      durationMinutes,
    });

    await respond({
      text: formatSlackResponse(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /meetings command
app.command('/meetings', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await calendarTools.handleToolCall('get_upcoming_events', {
      maxResults: 10,
    });

    await respond({
      text: formatSlackResponse(result),
      blocks: formatEventsBlocks(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /nextmeeting command
app.command('/nextmeeting', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await calendarTools.handleToolCall('get_next_event', {});

    await respond({
      text: formatSlackResponse(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /productivity command
app.command('/productivity', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await schedulingTools.handleToolCall('analyze_productivity', {});

    await respond({
      text: formatSlackResponse(result),
      blocks: formatProductivityBlocks(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /weeklyreport command
app.command('/weeklyreport', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await analyticsTools.handleToolCall('get_weekly_report', {});

    await respond({
      text: result.summary || formatSlackResponse(result),
      blocks: formatAnalyticsBlocks(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /monthlyreport command
app.command('/monthlyreport', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await analyticsTools.handleToolCall('get_monthly_report', {});

    await respond({
      text: result.summary || formatSlackResponse(result),
      blocks: formatAnalyticsBlocks(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// /prepmeeting command
app.command('/prepmeeting', async ({ command, ack, respond }) => {
  await ack();

  try {
    const result = await analyticsTools.handleToolCall('prepare_next_meeting', {});

    await respond({
      text: result.summary || formatSlackResponse(result),
      blocks: formatMeetingPrepBlocks(result),
    });
  } catch (error: any) {
    await respond({
      text: `❌ Error: ${error.message}`,
    });
  }
});

// Natural language processing
async function processNaturalLanguage(text: string): Promise<any> {
  const lowerText = text.toLowerCase();

  // Determine intent
  if (lowerText.includes('next meeting') || lowerText.includes('next event')) {
    return await calendarTools.handleToolCall('get_next_event', {});
  }

  if (lowerText.includes('upcoming') || lowerText.includes('meetings today') || lowerText.includes('events')) {
    return await calendarTools.handleToolCall('get_upcoming_events', { maxResults: 10 });
  }

  if (lowerText.includes('find time') || lowerText.includes('available slot')) {
    const durationMatch = text.match(/(\d+)\s*(min|minute|hour|hr)/i);
    const duration = durationMatch
      ? durationMatch[2].toLowerCase().includes('hour')
        ? parseInt(durationMatch[1]) * 60
        : parseInt(durationMatch[1])
      : 30;

    return await schedulingTools.handleToolCall('find_optimal_meeting_time', {
      duration,
      daysAhead: 7,
    });
  }

  if (lowerText.includes('focus') || lowerText.includes('deep work')) {
    return await schedulingTools.handleToolCall('activate_focus_mode', {
      durationMinutes: 120,
    });
  }

  if (lowerText.includes('productivity') || lowerText.includes('analyze')) {
    return await schedulingTools.handleToolCall('analyze_productivity', {});
  }

  if (lowerText.includes('weekly report') || lowerText.includes('week report')) {
    return await analyticsTools.handleToolCall('get_weekly_report', {});
  }

  if (lowerText.includes('monthly report') || lowerText.includes('month report')) {
    return await analyticsTools.handleToolCall('get_monthly_report', {});
  }

  if (lowerText.includes('prepare meeting') || lowerText.includes('prep meeting') || lowerText.includes('meeting prep')) {
    return await analyticsTools.handleToolCall('prepare_next_meeting', {});
  }

  if (lowerText.includes('schedule') || lowerText.includes('create') || lowerText.includes('book')) {
    return await calendarTools.handleToolCall('create_calendar_event', { input: text });
  }

  // Default: get upcoming events
  return await calendarTools.handleToolCall('get_upcoming_events', { maxResults: 5 });
}

// Format response for Slack
function formatSlackResponse(result: any): string {
  if (result.error) {
    return `❌ ${result.message}`;
  }

  if (result.success) {
    let response = result.message || '✅ Success';

    if (result.event) {
      response += `\n\n📅 *${result.event.summary}*`;
      response += `\n⏰ ${formatDate(result.event.start.dateTime)} - ${formatDate(result.event.end.dateTime)}`;
    }

    if (result.events && result.events.length > 0) {
      response += `\n\n📅 *Upcoming Events (${result.count}):*`;
      result.events.forEach((event: any) => {
        response += `\n• ${event.summary} - ${formatDate(event.start.dateTime)}`;
      });
    }

    if (result.topSlots && result.topSlots.length > 0) {
      response += `\n\n⭐ *Top ${result.topSlots.length} Time Slots:*`;
      result.topSlots.forEach((slot: any, index: number) => {
        response += `\n${index + 1}. ${formatDate(slot.start)} (Score: ${slot.score})`;
        response += `\n   ${slot.reasons.join(', ')}`;
      });
    }

    if (result.analysis) {
      response += `\n\n📊 *Productivity Analysis:*`;
      response += `\n• Most Productive Hours: ${result.analysis.mostProductiveHours.join(', ')}`;
      response += `\n• Least Busy Days: ${result.analysis.leastBusyDays.join(', ')}`;
      response += `\n• Average Meetings/Day: ${result.analysis.averageMeetingsPerDay}`;
    }

    if (result.recommendations && result.recommendations.length > 0) {
      response += `\n\n💡 *Recommendations:*`;
      result.recommendations.forEach((rec: string) => {
        response += `\n${rec}`;
      });
    }

    return response;
  }

  return JSON.stringify(result, null, 2);
}

// Format time slots as Slack blocks
function formatTimeSlotsBlocks(result: any): any[] {
  if (!result.topSlots || result.topSlots.length === 0) {
    return [];
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `⭐ Top ${result.topSlots.length} Optimal Time Slots`,
      },
    },
  ];

  result.topSlots.forEach((slot: any, index: number) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${index + 1}. ${formatDate(slot.start)}*\nScore: ${slot.score}\n_${slot.reasons.join(', ')}_`,
      },
    });
  });

  return blocks;
}

// Format events as Slack blocks
function formatEventsBlocks(result: any): any[] {
  if (!result.events || result.events.length === 0) {
    return [];
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📅 Upcoming Events (${result.count})`,
      },
    },
  ];

  result.events.forEach((event: any) => {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${event.summary}*\n⏰ ${formatDate(event.start.dateTime)}${event.location ? `\n📍 ${event.location}` : ''}`,
      },
    });
  });

  return blocks;
}

// Format productivity analysis as Slack blocks
function formatProductivityBlocks(result: any): any[] {
  if (!result.analysis) {
    return [];
  }

  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 Productivity Analysis',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Most Productive Hours:*\n${result.analysis.mostProductiveHours.join(', ')}`,
        },
        {
          type: 'mrkdwn',
          text: `*Least Busy Days:*\n${result.analysis.leastBusyDays.join(', ')}`,
        },
        {
          type: 'mrkdwn',
          text: `*Avg Meetings/Day:*\n${result.analysis.averageMeetingsPerDay}`,
        },
      ],
    },
  ];

  if (result.recommendations && result.recommendations.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💡 Recommendations:*\n${result.recommendations.join('\n')}`,
      },
    });
  }

  return blocks;
}

// Format analytics report as Slack blocks
function formatAnalyticsBlocks(result: any): any[] {
  if (!result.report) {
    return [];
  }

  const report = result.report;
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: '📊 Calendar Analytics Report',
      },
    },
    {
      type: 'section',
      fields: [
        {
          type: 'mrkdwn',
          text: `*Total Meeting Time:*\n${report.totalMeetingHours} hours`,
        },
        {
          type: 'mrkdwn',
          text: `*% of Work Time:*\n${report.percentageOfWorkTime}%`,
        },
        {
          type: 'mrkdwn',
          text: `*Meeting Count:*\n${report.meetingCount} meetings`,
        },
        {
          type: 'mrkdwn',
          text: `*Avg Duration:*\n${report.averageMeetingDuration} min`,
        },
      ],
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Busiest Day:* ${report.busiestDay}`,
      },
    },
  ];

  if (report.recommendations && report.recommendations.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*💡 Recommendations:*\n${report.recommendations.join('\n')}`,
      },
    });
  }

  return blocks;
}

// Format meeting prep as Slack blocks
function formatMeetingPrepBlocks(result: any): any[] {
  if (!result.context) {
    return [];
  }

  const context = result.context;
  const blocks: any[] = [
    {
      type: 'header',
      text: {
        type: 'plain_text',
        text: `📅 ${context.event.summary}`,
      },
    },
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `⏰ In ${context.timeUntilMeeting} minutes\n👥 ${context.participants.join(', ')}`,
      },
    },
  ];

  if (context.suggestedAgenda && context.suggestedAgenda.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*🎯 Suggested Agenda:*\n${context.suggestedAgenda.map((item: string, i: number) => `${i + 1}. ${item}`).join('\n')}`,
      },
    });
  }

  if (context.previousMeetings && context.previousMeetings.length > 0) {
    blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*📚 Previous Related Meetings:*\n${context.previousMeetings.map((m: any) => `• ${m.summary}`).join('\n')}`,
      },
    });
  }

  return blocks;
}

// Helper to format dates
function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch (error) {
    return dateString;
  }
}

// Start the bot
(async () => {
  await initializeServices();
  
  await app.start(process.env.PORT || 3000);
  console.log('⚡️ Slack bot is running!');
  console.log('📍 Available commands:');
  console.log('  /schedule <description>');
  console.log('  /findtime <duration>');
  console.log('  /focustime <duration>');
  console.log('  /meetings');
  console.log('  /nextmeeting');
  console.log('  /productivity');
  console.log('  /weeklyreport');
  console.log('  /monthlyreport');
  console.log('  /prepmeeting');
})();
