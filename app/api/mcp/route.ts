import type { NextRequest } from 'next/server';
import { AuthService } from '../../../server/services/auth.service';
import { CalendarService } from '../../../server/services/calendar.service';
import { NLPService } from '../../../server/services/nlp.service';
import { CalendarTools } from '../../../server/tools/calendar-tools';

type Data = {
  result?: any;
  error?: string;
};

let calendarTools: CalendarTools;

async function initializeServices() {
    if (calendarTools) {
        return calendarTools;
    }

    try {
        console.log("Initializing services...");
        const authService = new AuthService();
        const oauth2Client = await authService.getClient();

        const calendarService = new CalendarService(oauth2Client);
        const nlpService = new NLPService();

        calendarTools = new CalendarTools(calendarService, nlpService);

        console.log("✅ Services Initialized");
        return calendarTools;
    } catch (error: any) {
        console.error("❌ Services Initialization Failed:", error.message);
        return null;
    }
}

export async function POST(req: NextRequest) {
    try {
        const tools = await initializeServices();
        if (!tools) {
            return Response.json({ error: 'Service Unavailable: Backend services could not be initialized. Please check server logs.' }, { status: 503 });
        }
        
        const body = await req.json();
        const { tool, args } = body;
        
        if (!tool) {
            return Response.json({ error: 'Tool name is required' }, { status: 400 });
        }

        const result = await tools.handleToolCall(tool, args || {});
        return Response.json({ result });
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
        const tools = await initializeServices();
        if (!tools) {
            return Response.json({ error: 'Services not available' }, { status: 503 });
        }

        return Response.json({ 
            message: 'Productivity MCP API',
            status: 'running',
            tools: tools.getTools().map(tool => ({
                name: tool.name,
                description: tool.description
            }))
        });
    } catch (error: any) {
        return Response.json({ error: error.message }, { status: 500 });
    }
}