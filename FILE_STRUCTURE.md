# Complete File Structure - Productivity Intelligence MCP

## Project Root

```
prod-mcp/
├── app/                            # Next.js frontend
├── server/                         # Backend services
├── data/                           # OAuth tokens (gitignored)
├── config/                         # Configuration files
├── public/                         # Static assets
├── node_modules/                   # Dependencies
├── .env.local                      # Environment variables (gitignored)
├── .env.example                    # Environment template
├── package.json                    # Dependencies & scripts
├── tsconfig.json                   # TypeScript config
├── next.config.ts                  # Next.js config
├── postcss.config.mjs              # PostCSS config
└── Documentation files             # See below
```

---

## Backend Services (`server/`)

### Core Services

```
server/services/
├── auth.service.ts                 # Google OAuth 2.0 authentication
├── calendar.service.ts             # Google Calendar API wrapper
├── nlp.service.ts                  # OpenAI natural language processing
├── slack.service.ts                # Slack API interactions
├── smart-scheduler.service.ts      # Optimal time slot ranking
├── focus-time.service.ts           # Focus time block management
├── meeting-prep.service.ts         # Meeting preparation & context
└── analytics.service.ts            # Calendar analytics & insights
```

### MCP Tools

```
server/tools/
├── calendar-tools.ts               # Calendar MCP tools
├── scheduling-tools.ts             # Scheduling MCP tools
└── analytics-tools.ts              # Analytics MCP tools
```

### Type Definitions

```
server/types/
└── calendar.types.ts               # TypeScript interfaces
```

### Entry Points

```
server/
├── index.ts                        # Main backend entry point
├── slack-bot.ts                    # Slack bot server
└── auth-cli.ts                     # OAuth authentication CLI
```

---

## Frontend (`app/`)

### Next.js App Router

```
app/
├── layout.tsx                      # Root layout
├── page.tsx                        # Home page
├── globals.css                     # Tailwind CSS
└── api/
    └── mcp/
        └── route.ts                # MCP API route handler
```

---

## Configuration Files

```
config/
└── credentials.json                # Google OAuth credentials (gitignored)
```

```
data/
└── token.json                      # OAuth tokens (gitignored)
```

---

## Documentation Files

### Setup & Configuration

```
README.md                           # Main project overview
QUICK_START.md                      # 5-minute setup guide
SLACK_SETUP.md                      # Detailed Slack configuration
ENVIRONMENT_VARIABLES.md            # Environment variable guide
```

### Implementation Summaries

```
PHASE2_COMPLETE.md                  # Phase 2 implementation details
PHASE3_COMPLETE.md                  # Phase 3 implementation details
PROJECT_COMPLETE.md                 # Full project summary
```

### Testing & Demo

```
TESTING.md                          # General testing guide
PHASE3_TESTING.md                   # Phase 3 specific tests
DEMO_SCRIPT.md                      # Presentation demo script
FILE_STRUCTURE.md                   # This file
```

---

## Service Responsibilities

### AuthService
**File:** `server/services/auth.service.ts`  
**Purpose:** Google OAuth 2.0 authentication  
**Key Methods:**
- `getAuthUrl()` - Generate OAuth URL
- `getTokenFromCode()` - Exchange code for tokens
- `getClient()` - Get authenticated client
- `loadSavedTokens()` - Load from disk
- Token auto-refresh

### CalendarService
**File:** `server/services/calendar.service.ts`  
**Purpose:** Google Calendar API wrapper  
**Key Methods:**
- `getUpcomingEvents()` - Fetch upcoming events
- `getEventsInRange()` - Fetch in date range
- `createEvent()` - Create new event
- `updateEvent()` - Update existing event
- `deleteEvent()` - Delete event
- `findAvailableSlots()` - Find free time
- `getNextEvent()` - Get next event

### NLPService
**File:** `server/services/nlp.service.ts`  
**Purpose:** Natural language processing via OpenAI  
**Key Methods:**
- `parseEventIntent()` - Parse user input into event structure

### SlackService
**File:** `server/services/slack.service.ts`  
**Purpose:** Slack API interactions  
**Key Methods:**
- `updateStatus()` - Update Slack status
- `clearStatus()` - Clear status
- `setDND()` - Enable Do Not Disturb
- `endDND()` - Disable DND
- `sendDM()` - Send direct message
- `getCurrentUser()` - Get user info
- `generateStatusForEvent()` - Create status for meeting

### SmartSchedulerService
**File:** `server/services/smart-scheduler.service.ts`  
**Purpose:** Intelligent time slot ranking  
**Key Methods:**
- `findOptimalSlots()` - Find and rank slots
- `scoreSlot()` - Calculate productivity score
- `analyzeProductivityPatterns()` - Identify patterns

### FocusTimeService
**File:** `server/services/focus-time.service.ts`  
**Purpose:** Focus time block management  
**Key Methods:**
- `setupFocusTime()` - Create recurring blocks
- `activateFocusMode()` - Immediate focus mode
- `deactivateFocusMode()` - End focus mode
- `syncCalendarToSlack()` - Sync status

### MeetingPrepService
**File:** `server/services/meeting-prep.service.ts`  
**Purpose:** Meeting preparation and context gathering  
**Key Methods:**
- `prepareMeeting()` - Prepare specific meeting
- `prepareNextMeeting()` - Prepare next meeting
- `findRelatedSlackMessages()` - Find related messages (placeholder)
- `findPreviousMeetings()` - Find similar meetings
- `generateAgenda()` - AI-powered agenda
- `generateMeetingSummary()` - Post-meeting summary

### AnalyticsService
**File:** `server/services/analytics.service.ts`  
**Purpose:** Calendar analytics and insights  
**Key Methods:**
- `generateWeeklyReport()` - Weekly analytics
- `generateMonthlyReport()` - Monthly analytics with trends
- `getWeekOverWeekComparison()` - Week comparison
- `calculateFocusTimeSaved()` - Focus time ROI
- `generateRecommendations()` - Actionable advice

---

## MCP Tools Structure

### CalendarTools
**File:** `server/tools/calendar-tools.ts`  
**Tools:**
1. `create_calendar_event` - Natural language event creation
2. `find_available_time` - Find free slots
3. `get_upcoming_events` - List upcoming
4. `get_next_event` - Next event

### SchedulingTools
**File:** `server/tools/scheduling-tools.ts`  
**Tools:**
1. `find_optimal_meeting_time` - Smart time finding
2. `setup_focus_time` - Configure focus blocks
3. `activate_focus_mode` - Immediate focus
4. `deactivate_focus_mode` - End focus
5. `analyze_productivity` - Pattern analysis

### AnalyticsTools
**File:** `server/tools/analytics-tools.ts`  
**Tools:**
1. `get_weekly_report` - Weekly analytics
2. `get_monthly_report` - Monthly analytics
3. `prepare_next_meeting` - Next meeting prep
4. `prepare_meeting` - Specific meeting prep
5. `generate_meeting_summary` - Post-meeting summary
6. `get_week_comparison` - Week-over-week
7. `calculate_focus_time_saved` - Focus ROI

**Total MCP Tools:** 21

---

## Slack Bot Structure

### File: `server/slack-bot.ts`

**Slash Commands:**
1. `/schedule` - Create event
2. `/findtime` - Find optimal slots
3. `/focustime` - Activate focus mode
4. `/meetings` - List upcoming
5. `/nextmeeting` - Next event
6. `/productivity` - Analyze patterns
7. `/weeklyreport` - Weekly analytics
8. `/monthlyreport` - Monthly analytics
9. `/prepmeeting` - Prepare meeting

**Event Handlers:**
- App mentions (`@bot`)
- Direct messages
- Natural language processing

**Formatting Functions:**
- `formatSlackResponse()` - Generic response
- `formatUpcomingEvents()` - Events as blocks
- `formatProductivityBlocks()` - Productivity report
- `formatAnalyticsBlocks()` - Analytics report
- `formatMeetingPrepBlocks()` - Meeting prep
- `formatDate()` - Date formatting

---

## TypeScript Interfaces

### File: `server/types/calendar.types.ts`

```typescript
// Calendar event structure
interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string };
  end: { dateTime: string; timeZone?: string };
  attendees?: Array<{ email: string }>;
}

// Time slot structure
interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Options for finding time
interface FindTimeOptions {
  duration: number;
  dateRange: { start: Date; end: Date };
  workingHours?: WorkingHours;
  excludeWeekends?: boolean;
}

// Working hours configuration
interface WorkingHours {
  start: number;
  end: number;
}
```

---

## Environment Variables

### File: `.env.local`

```bash
# Google Calendar API
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=

# Slack API
SLACK_BOT_TOKEN=
SLACK_SIGNING_SECRET=
SLACK_APP_TOKEN=

# OpenAI API (optional)
OPENAI_API_KEY=

# Server
PORT=3000
LOG_LEVEL=info
```

---

## Package Scripts

### File: `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "auth": "tsx server/auth-cli.ts",
    "slack-bot": "tsx server/slack-bot.ts",
    "server:dev": "tsx watch server/index.ts",
    "server:build": "tsc -p tsconfig.server.json",
    "server:start": "node dist/server/index.js"
  }
}
```

---

## Dependencies

### Production

```json
{
  "@modelcontextprotocol/sdk": "^1.0.4",
  "@slack/bolt": "^3.22.0",
  "@slack/web-api": "^7.9.0",
  "date-fns": "^4.1.0",
  "dotenv": "^16.4.5",
  "google-auth-library": "^9.15.0",
  "googleapis": "^144.0.0",
  "next": "15.0.3",
  "openai": "^4.77.3",
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "zod": "^3.23.8"
}
```

### Development

```json
{
  "@tailwindcss/postcss": "^4.0.0",
  "@types/node": "^20",
  "@types/react": "^19",
  "@types/react-dom": "^19",
  "tailwindcss": "^4.0.0",
  "tsx": "^4.19.2",
  "typescript": "^5"
}
```

---

## File Count Summary

| Category | Count |
|----------|-------|
| Services | 8 |
| MCP Tools | 3 |
| Type Definitions | 1 |
| Entry Points | 3 |
| Frontend Pages | 2 |
| API Routes | 1 |
| Documentation | 11 |
| Config Files | 4 |
| **Total** | **33** |

---

## Lines of Code (Approximate)

| Category | LoC |
|----------|-----|
| Services | ~1,500 |
| MCP Tools | ~800 |
| Slack Bot | ~650 |
| Frontend | ~200 |
| Types | ~50 |
| **Total** | **~3,200** |

---

## Git Structure (Recommended)

```
.gitignore:
  node_modules/
  .next/
  .env.local
  data/
  config/credentials.json
  *.log
```

---

This file structure represents a production-ready, well-organized TypeScript project with:
- ✅ Clear separation of concerns
- ✅ Modular service architecture
- ✅ Comprehensive documentation
- ✅ Type safety throughout
- ✅ Scalable structure for future enhancements
