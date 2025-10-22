# Phase 3 Testing Guide

## Prerequisites

1. Slack bot running: `npm run slack-bot`
2. Google Calendar authentication completed
3. Slack app configured with new commands
4. OpenAI API key configured (optional - falls back to templates)

## New Slash Commands to Add in Slack

Go to your Slack app settings → Slash Commands and add:

### /weeklyreport
- **Command:** `/weeklyreport`
- **Request URL:** Your app's Socket Mode endpoint
- **Short Description:** Get weekly calendar analytics
- **Usage Hint:** (leave empty)

### /monthlyreport
- **Command:** `/monthlyreport`
- **Request URL:** Your app's Socket Mode endpoint
- **Short Description:** Get monthly calendar analytics with trends
- **Usage Hint:** (leave empty)

### /prepmeeting
- **Command:** `/prepmeeting`
- **Request URL:** Your app's Socket Mode endpoint
- **Short Description:** Prepare context for your next meeting
- **Usage Hint:** (leave empty)

## Test Cases

### Test 1: Weekly Report

**Command:**
```
/weeklyreport
```

**Expected Response:**
- Shows total meeting hours for current week
- Displays meeting count
- Shows average meeting duration
- Indicates % of work time
- Shows busiest day
- Breakdown by day of week
- Breakdown by meeting type (if categorized)
- Recommendations if thresholds exceeded

**Success Criteria:**
- ✅ Report generates without errors
- ✅ Metrics are accurate (verify against Google Calendar)
- ✅ Recommendations appear if >40% or >50% time in meetings
- ✅ Slack blocks formatting looks clean

### Test 2: Monthly Report

**Command:**
```
/monthlyreport
```

**Expected Response:**
- Shows total meeting hours for current month
- Monthly meeting count and averages
- Weekly breakdown (4 weeks)
- Each week shows meeting count and hours
- Overall trends visible

**Success Criteria:**
- ✅ Monthly aggregation correct
- ✅ Weekly breakdown accurate
- ✅ Handles partial months (e.g., first week of month)
- ✅ Performance acceptable (<10s for 4 weeks)

### Test 3: Meeting Preparation - Next Meeting

**Command:**
```
/prepmeeting
```

**Expected Response:**
- Meeting title
- Time until meeting starts (in minutes)
- List of participants (attendee emails)
- Suggested agenda (3-5 items)
- Previous related meetings (if any)
- Related Slack messages (placeholder)

**Success Criteria:**
- ✅ Identifies next upcoming event
- ✅ Time calculation accurate
- ✅ Participants extracted correctly
- ✅ Agenda is relevant (check for keywords from meeting title)
- ✅ Previous meetings have similar title/attendees

### Test 4: Natural Language - Weekly Report

**Command:**
```
@bot show me weekly report
```

**Alternative Phrases:**
- "Give me weekly report"
- "Show weekly analytics"
- "What about this week?"

**Expected Response:**
- Same as Test 1
- Confirms natural language parsing works

**Success Criteria:**
- ✅ Correctly identifies intent
- ✅ Calls appropriate tool
- ✅ Response matches slash command

### Test 5: Natural Language - Monthly Report

**Command:**
```
@bot monthly report
```

**Alternative Phrases:**
- "Show month report"
- "How was my calendar this month?"

**Expected Response:**
- Same as Test 2

**Success Criteria:**
- ✅ Monthly report triggered
- ✅ Natural language works

### Test 6: Natural Language - Meeting Prep

**Command:**
```
@bot prepare for my next meeting
```

**Alternative Phrases:**
- "Meeting prep"
- "Prep meeting"
- "Prepare meeting"

**Expected Response:**
- Same as Test 3

**Success Criteria:**
- ✅ Meeting prep triggered
- ✅ Context gathered successfully

### Test 7: Edge Case - No Upcoming Meetings

**Setup:**
Clear all future events from calendar

**Command:**
```
/prepmeeting
```

**Expected Response:**
```
No upcoming meetings
```

**Success Criteria:**
- ✅ Graceful handling
- ✅ No errors or crashes
- ✅ Clear message to user

### Test 8: Edge Case - Empty Week

**Setup:**
Create a calendar with no events this week

**Command:**
```
/weeklyreport
```

**Expected Response:**
- Total meeting hours: 0
- Meeting count: 0
- No breakdown by day
- Possibly a "Great week for focus time!" message

**Success Criteria:**
- ✅ Handles zero meetings
- ✅ No division by zero errors
- ✅ Encouraging message (optional)

### Test 9: OpenAI Fallback

**Setup:**
Temporarily remove or invalidate OpenAI API key

**Command:**
```
/prepmeeting
```

**Expected Response:**
- Still generates agenda
- Uses template-based agenda ("Review agenda", "Discussion topics", "Next steps")

**Success Criteria:**
- ✅ Doesn't crash without OpenAI
- ✅ Fallback agenda appears
- ✅ Warning logged in console (optional)

### Test 10: Performance - Large Calendar

**Setup:**
Calendar with 50+ events this week

**Command:**
```
/weeklyreport
```

**Expected Response:**
- Report generates (may take 5-10s)
- Accurate metrics

**Success Criteria:**
- ✅ Completes within 15 seconds
- ✅ No timeout errors
- ✅ Accurate calculations

## Integration Tests

### Test 11: Analytics + Scheduling

**Sequence:**
1. `/weeklyreport` - See high meeting load
2. Follow recommendation
3. `/focustime 2 hours` - Block focus time
4. `/weeklyreport` - Verify lower meeting %

**Success Criteria:**
- ✅ Analytics drives action
- ✅ Focus time blocks appear in analytics

### Test 12: Meeting Prep + Event Creation

**Sequence:**
1. `/schedule Team sync tomorrow at 10am`
2. Wait a moment
3. `/prepmeeting` - Should show the newly created event

**Success Criteria:**
- ✅ New event appears as next meeting
- ✅ Agenda generated for new event

## Validation Checklist

### Functionality
- [ ] Weekly report generates correctly
- [ ] Monthly report shows 4 weeks
- [ ] Meeting prep finds next event
- [ ] Agendas are relevant
- [ ] Previous meetings are similar
- [ ] Natural language parsing works
- [ ] Edge cases handled gracefully

### Data Accuracy
- [ ] Meeting counts match Google Calendar
- [ ] Total hours calculated correctly
- [ ] Average duration accurate
- [ ] Busiest day is correct
- [ ] Meeting type categorization works
- [ ] % of work time accurate (assumes 40h week, 8h/day)

### Performance
- [ ] Weekly report: <5 seconds
- [ ] Monthly report: <10 seconds
- [ ] Meeting prep: <5 seconds (with OpenAI)
- [ ] Meeting prep: <2 seconds (without OpenAI)
- [ ] No timeouts on large calendars

### User Experience
- [ ] Slack blocks formatted nicely
- [ ] Text responses are readable
- [ ] Error messages are clear
- [ ] Recommendations are actionable
- [ ] Time calculations make sense

### Edge Cases
- [ ] No upcoming meetings
- [ ] Empty week/month
- [ ] Single meeting
- [ ] Many meetings (>50)
- [ ] All-day events
- [ ] Missing attendees
- [ ] Missing location

## Sample Test Calendar

Create these events for comprehensive testing:

**Monday:**
- 9:00 AM - Daily Standup (15 min)
- 10:00 AM - 1:1 with Sarah (30 min)
- 2:00 PM - Project Planning (1 hour)

**Tuesday:**
- 9:00 AM - Daily Standup (15 min)
- 11:00 AM - Client Review (1 hour)
- 1:00 PM - Team Sync (30 min)
- 3:00 PM - Code Review (45 min)

**Wednesday:**
- 9:00 AM - Daily Standup (15 min)
- 2:00 PM - Sprint Planning (2 hours)

**Thursday:**
- 9:00 AM - Daily Standup (15 min)
- 10:30 AM - 1:1 with Mike (30 min)

**Friday:**
- 9:00 AM - Daily Standup (15 min)
- 3:00 PM - Happy Hour (1 hour)

**Expected Analytics:**
- Total: ~10.5 hours
- Count: 14 meetings
- Avg: 45 minutes
- Busiest: Tuesday (4 meetings)
- Types: 5 Standups, 2 1:1s, 1 Planning, 1 Review, 5 Other

## Debugging

### Check Logs

```bash
# Start bot with verbose logging
npm run slack-bot

# Look for these log lines:
📊 Initializing analytics...
✅ All services initialized successfully
```

### Common Issues

**Issue:** "Service Unavailable"
**Fix:** Ensure auth.service.ts has valid token

**Issue:** "OpenAI error"
**Fix:** Check OPENAI_API_KEY or let it fall back to templates

**Issue:** "Empty report"
**Fix:** Verify calendar has events in the time range

**Issue:** "Slack blocks not rendering"
**Fix:** Check block structure in slack-bot.ts formatting functions

## Success Criteria Summary

**Phase 3 is complete when:**
- ✅ All 3 new slash commands work
- ✅ Natural language parsing includes Phase 3 intents
- ✅ Weekly/monthly reports accurate
- ✅ Meeting prep generates context
- ✅ Agendas are relevant (OpenAI or template)
- ✅ Edge cases handled
- ✅ Performance acceptable
- ✅ Slack formatting clean
- ✅ Integration with Phase 1 & 2 works

## Next Steps After Testing

1. Create demo calendar with realistic events
2. Record screen demos for each feature
3. Prepare demo script for presentation
4. Document any bugs found
5. Create known issues list
6. Plan V2 enhancements
