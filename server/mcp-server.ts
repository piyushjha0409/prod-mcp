import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { CalendarTools } from './tools/calendar-tools.js';
import { AuthService } from './services/auth.service.js';
import { CalendarService } from './services/calendar.service.js';
import { NLPService } from './services/nlp.service.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

class ProductivityMCPServer {
  private server: Server;
  private calendarTools: CalendarTools;

  constructor() {
    this.server = new Server(
      {
        name: 'productivity-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List tools handler
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: this.calendarTools.getTools(),
      };
    });

    // Call tool handler
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      return await this.calendarTools.handleToolCall(name, args);
    });
  }

  async initialize() {
    try {
      // Initialize authentication
      const authService = new AuthService();
      const authClient = await authService.getClient();
      
      // Initialize services
      const calendarService = new CalendarService(authClient);
      const nlpService = new NLPService();
      
      // Initialize tools
      this.calendarTools = new CalendarTools(calendarService, nlpService);
      
      console.error('✅ Productivity MCP Server initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize MCP Server:', error);
      process.exit(1);
    }
  }

  async start() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Productivity MCP Server started');
  }
}

// Start the server
const server = new ProductivityMCPServer();
server.initialize().then(() => server.start()).catch(console.error);
