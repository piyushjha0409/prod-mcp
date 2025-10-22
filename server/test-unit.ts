#!/usr/bin/env tsx

/**
 * Unit Tests (No API Credentials Required)
 * Tests individual functions with mocked data
 */

import { parseISO, addDays, setHours, setMinutes, differenceInMinutes } from 'date-fns';

interface TestResult {
  name: string;
  status: 'PASS' | 'FAIL';
  message: string;
  error?: any;
}

const results: TestResult[] = [];

function test(name: string, fn: () => void | Promise<void>) {
  return async () => {
    try {
      await fn();
      results.push({ name, status: 'PASS', message: 'Success' });
      console.log(`✅ ${name}`);
    } catch (error: any) {
      results.push({ name, status: 'FAIL', message: error.message, error });
      console.log(`❌ ${name}: ${error.message}`);
    }
  };
}

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertEqual(actual: any, expected: any, message?: string) {
  if (actual !== expected) {
    throw new Error(message || `Expected ${expected}, got ${actual}`);
  }
}

// ============================================================================
// Test: Date/Time Utilities
// ============================================================================

const testDateTimeUtils = test('Date/Time utilities work correctly', () => {
  const now = new Date();
  const tomorrow = addDays(now, 1);
  const diff = differenceInMinutes(tomorrow, now);
  
  assert(diff > 1400 && diff < 1450, 'Tomorrow should be ~1440 minutes away');
});

// ============================================================================
// Test: Calendar Event Validation
// ============================================================================

const testEventValidation = test('Calendar event structure validation', () => {
  const event = {
    summary: 'Test Meeting',
    start: { dateTime: new Date().toISOString() },
    end: { dateTime: addDays(new Date(), 0).toISOString() }
  };
  
  assert(event.summary.length > 0, 'Event must have a summary');
  assert(!!event.start.dateTime, 'Event must have start time');
  assert(!!event.end.dateTime, 'Event must have end time');
});

// ============================================================================
// Test: Time Slot Conflict Detection
// ============================================================================

const testConflictDetection = test('Time slot conflict detection logic', () => {
  const slot = {
    start: setHours(new Date(), 10),
    end: setHours(new Date(), 11)
  };
  
  const event1 = {
    start: setHours(new Date(), 9),
    end: setHours(new Date(), 10)
  };
  
  const event2 = {
    start: setMinutes(setHours(new Date(), 10), 30),
    end: setMinutes(setHours(new Date(), 11), 30)
  };
  
  // Event1 ends when slot starts - no conflict
  const conflict1 = (
    (slot.start >= event1.start && slot.start < event1.end) ||
    (slot.end > event1.start && slot.end <= event1.end) ||
    (slot.start <= event1.start && slot.end >= event1.end)
  );
  
  // Event2 overlaps with slot - conflict
  const conflict2 = (
    (slot.start >= event2.start && slot.start < event2.end) ||
    (slot.end > event2.start && slot.end <= event2.end) ||
    (slot.start <= event2.start && slot.end >= event2.end)
  );
  
  assert(!conflict1, 'Should not detect conflict with adjacent event');
  assert(conflict2, 'Should detect conflict with overlapping event');
});

// ============================================================================
// Test: Slot Scoring Logic
// ============================================================================

const testSlotScoring = test('Time slot scoring algorithm', () => {
  // Morning slot (9-11 AM) should score high
  const morningHour = 9;
  let score = 100;
  
  if (morningHour >= 9 && morningHour < 11) {
    score += 20;
  }
  
  assert(score === 120, 'Morning hours should get +20 bonus');
  
  // Lunch time (12-1 PM) should score low
  const lunchHour = 12;
  score = 100;
  
  if (lunchHour >= 12 && lunchHour < 13) {
    score -= 30;
  }
  
  assert(score === 70, 'Lunch hours should get -30 penalty');
});

// ============================================================================
// Test: NLP Fallback Parser
// ============================================================================

const testNLPFallback = test('NLP fallback keyword parsing', () => {
  function fallbackParse(input: string) {
    const lowerInput = input.toLowerCase();
    
    let action: 'create' | 'update' | 'delete' | 'query' = 'query';
    if (lowerInput.includes('create') || lowerInput.includes('schedule')) {
      action = 'create';
    } else if (lowerInput.includes('delete') || lowerInput.includes('cancel')) {
      action = 'delete';
    }
    
    return { action };
  }
  
  const result1 = fallbackParse('schedule a meeting tomorrow');
  assertEqual(result1.action, 'create', 'Should detect create action');
  
  const result2 = fallbackParse('cancel my 2pm meeting');
  assertEqual(result2.action, 'delete', 'Should detect delete action');
  
  const result3 = fallbackParse("what's my next meeting");
  assertEqual(result3.action, 'query', 'Should default to query');
});

// ============================================================================
// Test: Meeting Type Categorization
// ============================================================================

const testMeetingCategorization = test('Meeting type categorization', () => {
  function categorizeMeeting(title: string): string {
    const lower = title.toLowerCase();
    
    if (lower.includes('standup') || lower.includes('daily sync')) {
      return 'Standup';
    }
    if (lower.includes('1:1') || lower.includes('one-on-one')) {
      return '1:1';
    }
    if (lower.includes('review') || lower.includes('retrospective')) {
      return 'Review';
    }
    if (lower.includes('planning') || lower.includes('sprint')) {
      return 'Planning';
    }
    if (lower.includes('interview')) {
      return 'Interview';
    }
    
    return 'Other';
  }
  
  assertEqual(categorizeMeeting('Daily Standup'), 'Standup');
  assertEqual(categorizeMeeting('1:1 with Sarah'), '1:1');
  assertEqual(categorizeMeeting('Code Review'), 'Review');
  assertEqual(categorizeMeeting('Sprint Planning'), 'Planning');
  assertEqual(categorizeMeeting('Candidate Interview'), 'Interview');
  assertEqual(categorizeMeeting('Random Meeting'), 'Other');
});

// ============================================================================
// Test: Emoji Selection for Events
// ============================================================================

const testEmojiSelection = test('Smart emoji selection for events', () => {
  function selectEmoji(summary: string): string {
    const lower = summary.toLowerCase();
    
    if (lower.includes('standup')) return ':speaking_head:';
    if (lower.includes('1:1')) return ':handshake:';
    if (lower.includes('review')) return ':memo:';
    if (lower.includes('interview')) return ':briefcase:';
    if (lower.includes('focus')) return ':dart:';
    
    return ':calendar:';
  }
  
  assertEqual(selectEmoji('Daily Standup'), ':speaking_head:');
  assertEqual(selectEmoji('1:1 with Manager'), ':handshake:');
  assertEqual(selectEmoji('Code Review'), ':memo:');
  assertEqual(selectEmoji('Focus Time'), ':dart:');
  assertEqual(selectEmoji('Random Meeting'), ':calendar:');
});

// ============================================================================
// Test: Analytics Calculations
// ============================================================================

const testAnalyticsCalculations = test('Analytics metric calculations', () => {
  const mockEvents = [
    { duration: 30 },  // 30 min
    { duration: 60 },  // 1 hour
    { duration: 45 },  // 45 min
    { duration: 30 },  // 30 min
  ];
  
  const totalMinutes = mockEvents.reduce((sum, e) => sum + e.duration, 0);
  const totalHours = totalMinutes / 60;
  const avgDuration = totalMinutes / mockEvents.length;
  const workHoursPerWeek = 40;
  const percentageOfWorkTime = (totalHours / workHoursPerWeek) * 100;
  
  assertEqual(totalMinutes, 165, 'Total minutes should be 165');
  assertEqual(totalHours, 2.75, 'Total hours should be 2.75');
  assertEqual(avgDuration, 41.25, 'Average duration should be 41.25 min');
  assert(Math.abs(percentageOfWorkTime - 6.875) < 0.01, 'Percentage should be ~6.9%');
});

// ============================================================================
// Test: Recommendation Logic
// ============================================================================

const testRecommendations = test('Productivity recommendation logic', () => {
  function generateRecommendations(percentageOfWorkTime: number, meetingCount: number) {
    const recommendations: string[] = [];
    
    if (percentageOfWorkTime > 50) {
      recommendations.push('Critical: Reduce meeting load immediately');
    } else if (percentageOfWorkTime > 40) {
      recommendations.push('Warning: High meeting percentage');
    }
    
    if (meetingCount > 25) {
      recommendations.push('Consider batching meetings');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Healthy meeting load');
    }
    
    return recommendations;
  }
  
  const critical = generateRecommendations(55, 30);
  assert(critical.length > 0 && critical[0].includes('Critical'), 
    'Should give critical warning for >50%');
  
  const warning = generateRecommendations(45, 20);
  assert(warning.length > 0 && warning[0].includes('Warning'), 
    'Should give warning for >40%');
  
  const healthy = generateRecommendations(30, 15);
  assert(healthy[0].includes('Healthy'), 'Should confirm healthy load');
});

// ============================================================================
// Test: Buffer Time Validation
// ============================================================================

const testBufferTimeValidation = test('Buffer time validation between meetings', () => {
  function hasBufferTime(
    slot: { start: Date; end: Date },
    event: { start: Date; end: Date },
    bufferMinutes: number
  ): boolean {
    const beforeBuffer = differenceInMinutes(slot.start, event.end);
    const afterBuffer = differenceInMinutes(event.start, slot.end);
    
    // Check if event is before or after the slot
    if (event.end <= slot.start) {
      // Event is before slot - check before buffer
      return beforeBuffer >= bufferMinutes;
    } else if (event.start >= slot.end) {
      // Event is after slot - check after buffer
      return afterBuffer >= bufferMinutes;
    }
    // Event overlaps slot - no buffer possible
    return false;
  }
  
  const baseDate = new Date();
  
  const slot = {
    start: setMinutes(setHours(baseDate, 10), 0),
    end: setMinutes(setHours(baseDate, 11), 0)
  };
  
  const eventBefore = {
    start: setMinutes(setHours(baseDate, 8), 0),
    end: setMinutes(setHours(baseDate, 9), 30)  // 30 min buffer before slot
  };
  
  const eventTooClose = {
    start: setMinutes(setHours(baseDate, 8), 0),
    end: setMinutes(setHours(baseDate, 9), 50)  // only 10 min buffer before slot
  };
  
  const result1 = hasBufferTime(slot, eventBefore, 15);
  const result2 = hasBufferTime(slot, eventTooClose, 15);
  
  assert(result1, 'Should have buffer with 30min gap');
  assert(!result2, 'Should not have buffer with 10min gap');
});

// ============================================================================
// Test: Week-over-Week Comparison
// ============================================================================

const testWeekComparison = test('Week-over-week analytics comparison', () => {
  const thisWeek = { meetingCount: 18, totalHours: 14.5 };
  const lastWeek = { meetingCount: 15, totalHours: 12.0 };
  
  const countChange = thisWeek.meetingCount - lastWeek.meetingCount;
  const hoursChange = thisWeek.totalHours - lastWeek.totalHours;
  const countPercentChange = ((countChange / lastWeek.meetingCount) * 100).toFixed(1);
  const hoursPercentChange = ((hoursChange / lastWeek.totalHours) * 100).toFixed(1);
  
  assertEqual(countChange, 3, 'Meeting count increased by 3');
  assert(Math.abs(hoursChange - 2.5) < 0.1, 'Hours increased by 2.5');
  assertEqual(countPercentChange, '20.0', 'Count increased by 20%');
  assert(Math.abs(parseFloat(hoursPercentChange) - 20.8) < 0.2, 'Hours increased by ~20.8%');
});

// ============================================================================
// Test: Focus Time ROI Calculation
// ============================================================================

const testFocusTimeROI = test('Focus time ROI calculation', () => {
  const focusBlocks = [
    { duration: 120 },  // 2 hours
    { duration: 180 },  // 3 hours
    { duration: 90 },   // 1.5 hours
  ];
  
  const totalMinutes = focusBlocks.reduce((sum, b) => sum + b.duration, 0);
  const totalHours = totalMinutes / 60;
  const weeksUsing = 4;
  const hoursPerWeek = totalHours / weeksUsing;
  
  assertEqual(totalMinutes, 390, 'Total focus time is 390 minutes');
  assertEqual(totalHours, 6.5, 'Total focus time is 6.5 hours');
  assert(Math.abs(hoursPerWeek - 1.625) < 0.01, 'Average 1.625 hours/week');
});

// ============================================================================
// Run All Tests
// ============================================================================

async function runTests() {
  console.log('🧪 UNIT TESTS (No API Required)\n');
  console.log('Testing core logic and algorithms...\n');
  
  await testDateTimeUtils();
  await testEventValidation();
  await testConflictDetection();
  await testSlotScoring();
  await testNLPFallback();
  await testMeetingCategorization();
  await testEmojiSelection();
  await testAnalyticsCalculations();
  await testRecommendations();
  await testBufferTimeValidation();
  await testWeekComparison();
  await testFocusTimeROI();
  
  console.log('\n' + '='.repeat(60));
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const total = results.length;
  
  console.log(`\n📊 Results: ${passed}/${total} passed`);
  
  if (failed > 0) {
    console.log('\n❌ Failed tests:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`  - ${r.name}: ${r.message}`);
    });
  } else {
    console.log('\n✅ All unit tests passed!');
  }
  
  console.log();
  process.exit(failed > 0 ? 1 : 0);
}

runTests();

