import { CalendarTools } from './tools/calendar-tools';
import { AuthService } from './services/auth.service';
import { CalendarService } from './services/calendar.service';
import { NLPService } from './services/nlp.service';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function testMCPTools() {
  console.log('🧪 Testing MCP Calendar Tools\n');

  try {
    // Initialize services
    const authService = new AuthService();
    const authClient = await authService.getClient();
    const calendarService = new CalendarService(authClient);
    const nlpService = new NLPService();
    
    // Initialize tools
    const calendarTools = new CalendarTools(calendarService, nlpService);
    
    console.log('📋 Available Tools:');
    const tools = calendarTools.getTools();
    tools.forEach(tool => {
      console.log(`  - ${tool.name}: ${tool.description}`);
    });
    console.log('\n');

    // Test 1: Get upcoming events
    console.log('🔍 Test 1: Getting upcoming events...');
    const upcomingResult = await calendarTools.handleToolCall('get_upcoming_events', { maxResults: 3 });
    console.log('Result:', JSON.stringify(upcomingResult, null, 2));
    console.log('\n');

    // Test 2: Get next event
    console.log('🔍 Test 2: Getting next event...');
    const nextEventResult = await calendarTools.handleToolCall('get_next_event', {});
    console.log('Result:', JSON.stringify(nextEventResult, null, 2));
    console.log('\n');

    // Test 3: Find available time
    console.log('🔍 Test 3: Finding available time slots...');
    const availableTimeResult = await calendarTools.handleToolCall('find_available_time', { 
      duration: 60, 
      daysAhead: 3 
    });
    console.log('Result:', JSON.stringify(availableTimeResult, null, 2));
    console.log('\n');

    // Test 4: Create event (if OpenAI is available)
    console.log('🔍 Test 4: Creating event with natural language...');
    try {
      const createEventResult = await calendarTools.handleToolCall('create_calendar_event', {
        input: 'Schedule a test meeting tomorrow at 2pm for 30 minutes'
      });
      console.log('Result:', JSON.stringify(createEventResult, null, 2));
    } catch (error) {
      console.log('⚠️  Create event test skipped (OpenAI not available or other error)');
    }

    console.log('\n✅ All tests completed!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testMCPTools().catch(console.error);
