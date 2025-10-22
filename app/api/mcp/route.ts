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

let calendarTools: CalendarTools;
let slackTools: SlackTools;

async function initializeServices() {
    if (calendarTools && slackTools) {
        return { calendarTools, slackTools };
    }

    try {
        console.log("Initializing services...");
        const authService = new AuthService();
        const oauth2Client = await authService.getClient();

        const calendarService = new CalendarService(oauth2Client);
        const nlpService = new NLPService();
        const slackService = new SlackService(process.env.SLACK_BOT_TOKEN || '');

        calendarTools = new CalendarTools(calendarService, nlpService);
        slackTools = new SlackTools(slackService);

        console.log("✅ Services Initialized");
        return { calendarTools, slackTools };
    } catch (error: any) {
        console.error("❌ Services Initialization Failed:", error.message);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const services = await initializeServices();
        if (!services) {
            return Response.json({ error: 'Service Unavailable: Backend services could not be initialized. Please check server logs.' }, { status: 503 });
        }
        
        const { calendarTools, slackTools } = services;
        const body = await req.json();
        const { tool, args } = body;
        
        if (!tool) {
            return Response.json({ error: 'Tool name is required' }, { status: 400 });
        }

        // Check if it's a calendar tool
        const calendarToolNames = calendarTools.getTools().map(t => t.name);
        if (calendarToolNames.includes(tool)) {
            const result = await calendarTools.handleToolCall(tool, args || {});
            return Response.json({ result });
        }

        // Check if it's a slack tool
        const slackToolNames = slackTools.getTools().map(t => t.name);
        if (slackToolNames.includes(tool)) {
            const result = await slackTools.handleToolCall(tool, args || {});
            return Response.json({ result });
        }

        return Response.json({ error: `Unknown tool: ${tool}` }, { status: 400 });
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
        if (!services) {
            return Response.json({ error: 'Services not available' }, { status: 503 });
        }

        const { calendarTools, slackTools } = services;
        const allTools = [
            ...calendarTools.getTools(),
            ...slackTools.getTools()
        ];

        return Response.json({ 
            message: 'Productivity MCP API',
            status: 'running',
            tools: allTools.map(tool => ({
                name: tool.name,
                description: tool.description
            }))
        });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}