#!/usr/bin/env tsx

/**
 * Comprehensive Service Testing Suite
 * Tests all services individually with both mock and real data
 */

import 'dotenv/config';
import { AuthService } from './services/auth.service';
import { CalendarService } from './services/calendar.service';
import { NLPService } from './services/nlp.service';
import { SlackService } from './services/slack.service';
import { SmartSchedulerService } from './services/smart-scheduler.service';
import { FocusTimeService } from './services/focus-time.service';
import { MeetingPrepService } from './services/meeting-prep.service';
import { AnalyticsService } from './services/analytics.service';

// Test results tracking
interface TestResult {
  service: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'SKIP';
  message: string;
  error?: any;
}

const results: TestResult[] = [];

// Helper to log test results
function logTest(service: string, test: string, status: 'PASS' | 'FAIL' | 'SKIP', message: string, error?: any) {
  results.push({ service, test, status, message, error });
  const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.log(`${emoji} [${service}] ${test}: ${message}`);
  if (error && status === 'FAIL') {
    console.error('   Error:', error.message || error);
  }
}

// Environment validation
function checkEnvironment() {
  console.log('\n🔍 Checking Environment Variables...\n');
  
  const requiredVars = {
    'GOOGLE_CLIENT_ID': process.env.GOOGLE_CLIENT_ID,
    'GOOGLE_CLIENT_SECRET': process.env.GOOGLE_CLIENT_SECRET,
    'GOOGLE_REDIRECT_URI': process.env.GOOGLE_REDIRECT_URI,
  };
  
  const optionalVars = {
    'OPENAI_API_KEY': process.env.OPENAI_API_KEY,
    'SLACK_BOT_TOKEN': process.env.SLACK_BOT_TOKEN,
    'SLACK_SIGNING_SECRET': process.env.SLACK_SIGNING_SECRET,
    'SLACK_APP_TOKEN': process.env.SLACK_APP_TOKEN,
  };

  let hasRequired = true;
  let hasOptional = true;

  for (const [key, value] of Object.entries(requiredVars)) {
    if (!value || value.includes('your_')) {
      console.log(`❌ Missing required: ${key}`);
      hasRequired = false;
    } else {
      console.log(`✅ Found: ${key}`);
    }
  }

  for (const [key, value] of Object.entries(optionalVars)) {
    if (!value || value.includes('your_')) {
      console.log(`⚠️  Missing optional: ${key}`);
      hasOptional = false;
    } else {
      console.log(`✅ Found: ${key}`);
    }
  }

  return { hasRequired, hasOptional };
}

// Test AuthService
async function testAuthService() {
  console.log('\n📝 Testing AuthService...\n');
  
  try {
    const authService = new AuthService();
    
    // Test 1: OAuth URL generation
    try {
      const authUrl = authService.getAuthUrl();
      if (authUrl.includes('accounts.google.com') && authUrl.includes('client_id')) {
        logTest('AuthService', 'getAuthUrl()', 'PASS', 'OAuth URL generated successfully');
      } else {
        logTest('AuthService', 'getAuthUrl()', 'FAIL', 'Invalid OAuth URL format');
      }
    } catch (error) {
      logTest('AuthService', 'getAuthUrl()', 'FAIL', 'Failed to generate OAuth URL', error);
    }

    // Test 2: Load saved tokens (if they exist)
    try {
      const hasTokens = await authService.loadSavedTokens();
      if (hasTokens) {
        logTest('AuthService', 'loadSavedTokens()', 'PASS', 'Successfully loaded existing tokens');
        
        // Test 3: Get authenticated client
        try {
          const client = authService.getClient();
          if (client) {
            logTest('AuthService', 'getClient()', 'PASS', 'Retrieved authenticated OAuth client');
          }
        } catch (error) {
          logTest('AuthService', 'getClient()', 'FAIL', 'Failed to get OAuth client', error);
        }
      } else {
        logTest('AuthService', 'loadSavedTokens()', 'SKIP', 'No saved tokens found (run npm run auth first)');
      }
    } catch (error) {
      logTest('AuthService', 'loadSavedTokens()', 'FAIL', 'Error loading tokens', error);
    }

  } catch (error) {
    logTest('AuthService', 'initialization', 'FAIL', 'Failed to initialize AuthService', error);
  }
}

// Test CalendarService
async function testCalendarService() {
  console.log('\n📅 Testing CalendarService...\n');

  try {
    const authService = new AuthService();
    const hasTokens = await authService.loadSavedTokens();
    
    if (!hasTokens) {
      logTest('CalendarService', 'all tests', 'SKIP', 'No authentication tokens (run npm run auth first)');
      return;
    }

    const calendarService = new CalendarService(authService.getClient());

    // Test 1: Get upcoming events
    try {
      const events = await calendarService.getUpcomingEvents(5);
      logTest('CalendarService', 'getUpcomingEvents()', 'PASS', `Retrieved ${events.length} upcoming events`);
      
      if (events.length > 0) {
        console.log(`   First event: "${events[0].summary}" at ${events[0].start.dateTime}`);
      }
    } catch (error) {
      logTest('CalendarService', 'getUpcomingEvents()', 'FAIL', 'Failed to fetch events', error);
    }

    // Test 2: Get next event
    try {
      const nextEvent = await calendarService.getNextEvent();
      if (nextEvent) {
        logTest('CalendarService', 'getNextEvent()', 'PASS', `Next event: "${nextEvent.summary}"`);
      } else {
        logTest('CalendarService', 'getNextEvent()', 'PASS', 'No upcoming events found');
      }
    } catch (error) {
      logTest('CalendarService', 'getNextEvent()', 'FAIL', 'Failed to get next event', error);
    }

    // Test 3: Find available slots
    try {
      const now = new Date();
      const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

      const slots = await calendarService.findAvailableSlots({
        duration: 30,
        dateRange: { start: tomorrow, end: dayAfter },
        workingHours: { start: 9, end: 17 },
        excludeWeekends: true
      });

      logTest('CalendarService', 'findAvailableSlots()', 'PASS', `Found ${slots.length} available 30-min slots`);
      
      if (slots.length > 0) {
        console.log(`   First slot: ${slots[0].start.toLocaleString()}`);
      }
    } catch (error) {
      logTest('CalendarService', 'findAvailableSlots()', 'FAIL', 'Failed to find slots', error);
    }

  } catch (error) {
    logTest('CalendarService', 'initialization', 'FAIL', 'Failed to initialize CalendarService', error);
  }
}

// Test NLPService
async function testNLPService() {
  console.log('\n🧠 Testing NLPService...\n');

  const nlpService = new NLPService();

  const testCases = [
    {
      input: 'schedule team meeting tomorrow at 2pm for 1 hour',
      expectedAction: 'create'
    },
    {
      input: 'find time for a call next week',
      expectedAction: 'query'
    },
    {
      input: "what's my next meeting?",
      expectedAction: 'query'
    },
    {
      input: 'cancel the standup on Friday',
      expectedAction: 'delete'
    }
  ];

  for (const testCase of testCases) {
    try {
      const result = await nlpService.parseEventIntent(testCase.input);
      
      if (result.action === testCase.expectedAction) {
        logTest('NLPService', `parseEventIntent("${testCase.input.substring(0, 30)}...")`, 'PASS', 
          `Correctly parsed as "${result.action}" (confidence: ${result.confidence})`);
      } else {
        logTest('NLPService', `parseEventIntent("${testCase.input}")`, 'FAIL', 
          `Expected "${testCase.expectedAction}", got "${result.action}"`);
      }
    } catch (error) {
      logTest('NLPService', `parseEventIntent("${testCase.input}")`, 'FAIL', 'Parse failed', error);
    }
  }

  // Test fallback parser (without OpenAI)
  try {
    const originalKey = process.env.OPENAI_API_KEY;
    process.env.OPENAI_API_KEY = '';
    
    const result = await nlpService.parseEventIntent('schedule meeting tomorrow at 2pm');
    
    process.env.OPENAI_API_KEY = originalKey;
    
    if (result.action === 'create') {
      logTest('NLPService', 'fallbackParse()', 'PASS', 'Fallback parser works without OpenAI');
    } else {
      logTest('NLPService', 'fallbackParse()', 'FAIL', 'Fallback parser failed');
    }
  } catch (error) {
    logTest('NLPService', 'fallbackParse()', 'FAIL', 'Fallback parser error', error);
  }
}

// Test SmartSchedulerService
async function testSmartSchedulerService() {
  console.log('\n🎯 Testing SmartSchedulerService...\n');

  try {
    const authService = new AuthService();
    const hasTokens = await authService.loadSavedTokens();
    
    if (!hasTokens) {
      logTest('SmartSchedulerService', 'all tests', 'SKIP', 'No authentication tokens');
      return;
    }

    const calendarService = new CalendarService(authService.getClient());
    const schedulerService = new SmartSchedulerService(calendarService);

    // Test 1: Find optimal slots
    try {
      const slots = await schedulerService.findOptimalSlots(60, 7, {
        preferMornings: true,
        avoidLunchTime: true,
        bufferBetweenMeetings: 15
      });

      logTest('SmartSchedulerService', 'findOptimalSlots()', 'PASS', 
        `Found ${slots.length} ranked slots`);
      
      if (slots.length > 0) {
        console.log(`   Best slot: ${slots[0].slot.start.toLocaleString()} (score: ${slots[0].score})`);
        console.log(`   Reasons: ${slots[0].reasons.join(', ')}`);
      }
    } catch (error) {
      logTest('SmartSchedulerService', 'findOptimalSlots()', 'FAIL', 'Failed to find optimal slots', error);
    }

    // Test 2: Analyze productivity patterns
    try {
      const analysis = await schedulerService.analyzeProductivityPatterns();
      
      logTest('SmartSchedulerService', 'analyzeProductivityPatterns()', 'PASS', 
        `Avg meetings/day: ${analysis.averageMeetingsPerDay}`);
      
      console.log(`   Most productive hours: ${analysis.mostProductiveHours.join(', ')}`);
      console.log(`   Least busy days: ${analysis.leastBusyDays.join(', ')}`);
    } catch (error) {
      logTest('SmartSchedulerService', 'analyzeProductivityPatterns()', 'FAIL', 
        'Failed to analyze patterns', error);
    }

  } catch (error) {
    logTest('SmartSchedulerService', 'initialization', 'FAIL', 'Failed to initialize', error);
  }
}

// Test SlackService
async function testSlackService() {
  console.log('\n💬 Testing SlackService...\n');

  if (!process.env.SLACK_BOT_TOKEN || process.env.SLACK_BOT_TOKEN.includes('your_')) {
    logTest('SlackService', 'all tests', 'SKIP', 'No Slack token configured');
    return;
  }

  try {
    const slackService = new SlackService(process.env.SLACK_BOT_TOKEN);

    // Test 1: Get current user
    try {
      const user = await slackService.getCurrentUser();
      logTest('SlackService', 'getCurrentUser()', 'PASS', 
        `Connected as ${user.username} (${user.userId})`);
    } catch (error) {
      logTest('SlackService', 'getCurrentUser()', 'FAIL', 'Failed to get user info', error);
    }

    // Test 2: Status generation
    try {
      const status = slackService.generateStatusForEvent('Team Standup', 30);
      
      if (status.status_text && status.status_emoji && status.status_expiration) {
        logTest('SlackService', 'generateStatusForEvent()', 'PASS', 
          `Generated: ${status.status_emoji} ${status.status_text}`);
      } else {
        logTest('SlackService', 'generateStatusForEvent()', 'FAIL', 'Invalid status format');
      }
    } catch (error) {
      logTest('SlackService', 'generateStatusForEvent()', 'FAIL', 'Status generation failed', error);
    }

  } catch (error) {
    logTest('SlackService', 'initialization', 'FAIL', 'Failed to initialize SlackService', error);
  }
}

// Test AnalyticsService
async function testAnalyticsService() {
  console.log('\n📊 Testing AnalyticsService...\n');

  try {
    const authService = new AuthService();
    const hasTokens = await authService.loadSavedTokens();
    
    if (!hasTokens) {
      logTest('AnalyticsService', 'all tests', 'SKIP', 'No authentication tokens');
      return;
    }

    const calendarService = new CalendarService(authService.getClient());
    const analyticsService = new AnalyticsService(calendarService);

    // Test 1: Weekly report
    try {
      const weeklyReport = await analyticsService.generateWeeklyReport();
      
      logTest('AnalyticsService', 'generateWeeklyReport()', 'PASS', 
        `${weeklyReport.meetingCount} meetings, ${weeklyReport.totalMeetingHours}h total`);
      
      console.log(`   Work time: ${weeklyReport.percentageOfWorkTime}%`);
      console.log(`   Busiest day: ${weeklyReport.busiestDay}`);
      console.log(`   Recommendations: ${weeklyReport.recommendations.length}`);
    } catch (error) {
      logTest('AnalyticsService', 'generateWeeklyReport()', 'FAIL', 'Failed to generate report', error);
    }

    // Test 2: Monthly report
    try {
      const monthlyReport = await analyticsService.generateMonthlyReport();
      
      logTest('AnalyticsService', 'generateMonthlyReport()', 'PASS', 
        `${monthlyReport.meetingCount} meetings this month`);
      
      console.log(`   Weekly breakdown: ${monthlyReport.weeklyBreakdown.length} weeks`);
    } catch (error) {
      logTest('AnalyticsService', 'generateMonthlyReport()', 'FAIL', 'Failed to generate monthly report', error);
    }

  } catch (error) {
    logTest('AnalyticsService', 'initialization', 'FAIL', 'Failed to initialize', error);
  }
}

// Test MeetingPrepService
async function testMeetingPrepService() {
  console.log('\n📋 Testing MeetingPrepService...\n');

  try {
    const authService = new AuthService();
    const hasTokens = await authService.loadSavedTokens();
    
    if (!hasTokens) {
      logTest('MeetingPrepService', 'all tests', 'SKIP', 'No authentication tokens');
      return;
    }

    const calendarService = new CalendarService(authService.getClient());
    const slackService = process.env.SLACK_BOT_TOKEN 
      ? new SlackService(process.env.SLACK_BOT_TOKEN)
      : null;

    if (!slackService) {
      logTest('MeetingPrepService', 'all tests', 'SKIP', 'No Slack token configured');
      return;
    }

    const meetingPrepService = new MeetingPrepService(calendarService, slackService);

    // Test: Prepare next meeting
    try {
      const nextEvent = await calendarService.getNextEvent();
      
      if (!nextEvent || !nextEvent.id) {
        logTest('MeetingPrepService', 'prepareNextMeeting()', 'SKIP', 'No upcoming meetings');
        return;
      }

      const prep = await meetingPrepService.prepareMeeting(nextEvent.id);
      
      logTest('MeetingPrepService', 'prepareMeeting()', 'PASS', 
        `Prepared for: "${prep.event.summary}"`);
      
      console.log(`   Participants: ${prep.participants.length}`);
      console.log(`   Agenda items: ${prep.suggestedAgenda.length}`);
      console.log(`   Previous meetings: ${prep.previousMeetings.length}`);
    } catch (error) {
      logTest('MeetingPrepService', 'prepareNextMeeting()', 'FAIL', 'Failed to prepare meeting', error);
    }

  } catch (error) {
    logTest('MeetingPrepService', 'initialization', 'FAIL', 'Failed to initialize', error);
  }
}

// Test FocusTimeService
async function testFocusTimeService() {
  console.log('\n🎯 Testing FocusTimeService...\n');

  try {
    const authService = new AuthService();
    const hasTokens = await authService.loadSavedTokens();
    
    if (!hasTokens) {
      logTest('FocusTimeService', 'all tests', 'SKIP', 'No authentication tokens');
      return;
    }

    const calendarService = new CalendarService(authService.getClient());
    const slackService = process.env.SLACK_BOT_TOKEN 
      ? new SlackService(process.env.SLACK_BOT_TOKEN)
      : null;

    if (!slackService) {
      logTest('FocusTimeService', 'calendar sync', 'SKIP', 'No Slack token (calendar-only mode)');
      
      const focusTimeService = new FocusTimeService(calendarService, slackService);
      
      // Test without Slack
      try {
        await focusTimeService.syncCalendarToSlack();
        logTest('FocusTimeService', 'syncCalendarToSlack()', 'PASS', 
          'Sync completed (no Slack token, skip status update)');
      } catch (error) {
        logTest('FocusTimeService', 'syncCalendarToSlack()', 'FAIL', 'Sync failed', error);
      }
      
      return;
    }

    const focusTimeService = new FocusTimeService(calendarService, slackService);

    // Test: Calendar to Slack sync
    try {
      await focusTimeService.syncCalendarToSlack();
      logTest('FocusTimeService', 'syncCalendarToSlack()', 'PASS', 'Successfully synced calendar to Slack');
    } catch (error) {
      logTest('FocusTimeService', 'syncCalendarToSlack()', 'FAIL', 'Sync failed', error);
    }

  } catch (error) {
    logTest('FocusTimeService', 'initialization', 'FAIL', 'Failed to initialize', error);
  }
}

// Print summary
function printSummary() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(80) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const skipped = results.filter(r => r.status === 'SKIP').length;
  const total = results.length;

  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log();

  if (failed > 0) {
    console.log('Failed Tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - [${r.service}] ${r.test}`);
      console.log(`    ${r.message}`);
      if (r.error) {
        console.log(`    Error: ${r.error.message || r.error}`);
      }
    });
    console.log();
  }

  if (skipped > 0) {
    console.log('Skipped Tests (missing config):');
    const skipReasons = new Map<string, string[]>();
    results.filter(r => r.status === 'SKIP').forEach(r => {
      const reason = r.message;
      if (!skipReasons.has(reason)) {
        skipReasons.set(reason, []);
      }
      skipReasons.get(reason)!.push(r.service);
    });
    
    skipReasons.forEach((services, reason) => {
      console.log(`  - ${reason}`);
      console.log(`    Affected: ${services.join(', ')}`);
    });
    console.log();
  }

  const successRate = total > 0 ? ((passed / (total - skipped)) * 100).toFixed(1) : '0';
  console.log(`Success Rate: ${successRate}% (excluding skipped)\n`);
}

// Main test runner
async function runAllTests() {
  console.log('🧪 PRODUCTIVITY MCP - SERVICE TEST SUITE');
  console.log('='.repeat(80));

  const { hasRequired, hasOptional } = checkEnvironment();

  if (!hasRequired) {
    console.log('\n❌ Missing required environment variables!');
    console.log('Please copy .env.local.example to .env.local and fill in your credentials.\n');
    process.exit(1);
  }

  await testAuthService();
  await testCalendarService();
  await testNLPService();
  await testSmartSchedulerService();
  await testSlackService();
  await testAnalyticsService();
  await testMeetingPrepService();
  await testFocusTimeService();

  printSummary();

  // Exit with error code if any tests failed
  const failedCount = results.filter(r => r.status === 'FAIL').length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('\n❌ Test suite crashed:', error);
  process.exit(1);
});


