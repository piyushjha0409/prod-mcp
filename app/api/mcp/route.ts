import type { NextRequest } from 'next/server';
import { AuthService } from '../../../server/services/auth.service';
import { CalendarService } from '../../../server/services/calendar.service';
import { NLPService } from '../../../server/services/nlp.service';
import { SlackService } from '../../../server/services/slack.service';
import { CalendarTools } from '../../../server/tools/calendar-tools';
import { SlackTools } from '../../../server/tools/slack-tools';

type Data = {
  result?: any;
  error?: string;
};

// Define static tool names for identification even when services are unavailable
const CALENDAR_TOOL_NAMES = [
  'create_calendar_event',
  'find_available_time',
  'get_upcoming_events',
  'get_next_event'
];

const SLACK_TOOL_NAMES = [
  'send_slack_message',
  'get_slack_channels',
  'get_slack_users',
  'send_calendar_notification',
  'send_available_slots',
  'send_upcoming_events',
  'test_slack_connection'
];

let calendarTools: CalendarTools | undefined;
let slackTools: SlackTools | undefined;

async function initializeServices() {
    if (calendarTools && slackTools) {
        return { calendarTools, slackTools, isCalendarAvailable: true, isSlackAvailable: true };
    }

    let isCalendarAvailable = false;
    let isSlackAvailable = false;

    try {
        console.log("Initializing services...");
        
        // Try to initialize Calendar services (may fail if not authenticated)
        try {
            const authService = new AuthService();
            const oauth2Client = await authService.getClient();
            const calendarService = new CalendarService(oauth2Client);
            const nlpService = new NLPService();
            calendarTools = new CalendarTools(calendarService, nlpService);
            isCalendarAvailable = true;
            console.log("✅ Calendar Services Initialized");
        } catch (error: any) {
            console.log("⚠️  Calendar services not available:", error.message);
            // Calendar tools will remain undefined, but we can still continue
        }

        // Initialize Slack services (independent of calendar)
        try {
            const slackService = new SlackService(process.env.SLACK_BOT_TOKEN || '');
            slackTools = new SlackTools(slackService);
            isSlackAvailable = true;
            console.log("✅ Slack Services Initialized");
        } catch (error: any) {
            console.log("⚠️  Slack services not available:", error.message);
        }

        return { calendarTools, slackTools, isCalendarAvailable, isSlackAvailable };
    } catch (error: any) {
        console.error("❌ Services Initialization Failed:", error.message);
        return { calendarTools: undefined, slackTools: undefined, isCalendarAvailable: false, isSlackAvailable: false };
    }
}

export async function POST(req: NextRequest) {
    try {
        const services = await initializeServices();
        const { calendarTools, slackTools, isCalendarAvailable, isSlackAvailable } = services;
        
        const body = await req.json();
        const { tool, args } = body;
        
        if (!tool) {
            return Response.json({ error: 'Tool name is required' }, { status: 400 });
        }

        // Check if it's a calendar tool (by name, regardless of availability)
        if (CALENDAR_TOOL_NAMES.includes(tool)) {
            if (!isCalendarAvailable || !calendarTools) {
                return Response.json({ 
                    error: 'Calendar services not available. Google Calendar authentication is required. Please see GOOGLE_CALENDAR_SETUP.md for setup instructions.',
                    tool: tool,
                    category: 'calendar'
                }, { status: 503 });
            }
            const result = await calendarTools.handleToolCall(tool, args || {});
            return Response.json({ result });
        }

        // Check if it's a slack tool (by name, regardless of availability)
        if (SLACK_TOOL_NAMES.includes(tool)) {
            if (!isSlackAvailable || !slackTools) {
                return Response.json({ 
                    error: 'Slack services not available. Please ensure SLACK_BOT_TOKEN is configured in environment variables.',
                    tool: tool,
                    category: 'slack'
                }, { status: 503 });
            }
            const result = await slackTools.handleToolCall(tool, args || {});
            return Response.json({ result });
        }

        return Response.json({ 
            error: `Unknown tool: ${tool}`,
            availableTools: [...CALENDAR_TOOL_NAMES, ...SLACK_TOOL_NAMES]
        }, { status: 400 });
    } catch (error: any) {
        console.error("API Handler Error:", error);
        if (error.message.includes('User not authenticated')) {
            return Response.json({ error: 'Authentication required. Please run the authentication script.' }, { status: 401 });
        }
        return Response.json({ error: error.message || 'An internal server error occurred' }, { status: 500 });
    }
}

export async function GET() {
    try {
        const services = await initializeServices();
        const { calendarTools, slackTools, isCalendarAvailable, isSlackAvailable } = services;

        const allTools = [];
        
        // Add calendar tools (from actual tools if available, otherwise from static list)
        if (calendarTools) {
            allTools.push(...calendarTools.getTools().map(tool => ({
                name: tool.name,
                description: tool.description,
                available: isCalendarAvailable,
                category: 'calendar'
            })));
        } else {
            // Show calendar tools as unavailable even when service isn't initialized
            allTools.push(...CALENDAR_TOOL_NAMES.map(name => ({
                name,
                description: `Calendar tool: ${name}`,
                available: false,
                category: 'calendar'
            })));
        }
        
        // Add slack tools (from actual tools if available, otherwise from static list)
        if (slackTools) {
            allTools.push(...slackTools.getTools().map(tool => ({
                name: tool.name,
                description: tool.description,
                available: isSlackAvailable,
                category: 'slack'
            })));
        } else {
            // Show slack tools as unavailable even when service isn't initialized
            allTools.push(...SLACK_TOOL_NAMES.map(name => ({
                name,
                description: `Slack tool: ${name}`,
                available: false,
                category: 'slack'
            })));
        }

        return Response.json({ 
            message: 'Productivity MCP API',
            status: 'running',
            services: {
                calendar: isCalendarAvailable ? 'available' : 'unavailable - authentication required',
                slack: isSlackAvailable ? 'available' : 'unavailable - token required'
            },
            tools: allTools
        });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}