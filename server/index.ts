import { AuthService } from './services/auth.service';
import { CalendarService } from './services/calendar.service';
import { NLPService } from './services/nlp.service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function main() {
  console.log('🚀 Starting Productivity MCP Server...');
  
  try {
    const authService = new AuthService();
    const authClient = await authService.getClient();
    
    console.log('✅ Authentication verified');
    
    // Initialize services
    const calendarService = new CalendarService(authClient);
    const nlpService = new NLPService();
    
    // Test calendar access
    const upcomingEvents = await calendarService.getUpcomingEvents(5);
    console.log(`📅 Found ${upcomingEvents.length} upcoming events`);
    
    if (upcomingEvents.length > 0) {
      console.log('Next event:', upcomingEvents[0].summary);
    }
    
    // Test NLP service
    try {
      const testIntent = await nlpService.parseEventIntent('Schedule a meeting tomorrow at 2pm for 1 hour');
      console.log('🧠 NLP Test:', testIntent);
    } catch (error) {
      console.log('⚠️  NLP service not available (check OPENAI_API_KEY)');
    }
    
    console.log('📅 MCP Server ready for calendar operations');
    
    // Keep the server running
    process.on('SIGINT', () => {
      console.log('\n👋 Shutting down MCP Server...');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(console.error);
