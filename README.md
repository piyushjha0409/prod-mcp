# Productivity Intelligence MCP 🎯

An AI-powered Slack bot that transforms calendar and productivity management into an intelligent assistant. Built with Model Context Protocol (MCP) for seamless integration with your workflow.

## 🚀 Overview

The Productivity Assistant is a Slack bot that helps you:
- **Schedule meetings** using natural language
- **Find optimal meeting times** based on productivity patterns
- **Protect focus time** automatically
- **Sync calendar with Slack status**
- **Analyze productivity** patterns and get recommendations

## ✨ Features

### Core Capabilities
- ✅ Natural language scheduling ("Schedule team meeting tomorrow at 2pm")
- ✅ Smart time slot recommendations (considers productivity patterns)
- ✅ Google Calendar integration (read/write events)
- ✅ Slack status synchronization
- ✅ Focus time protection (auto-decline conflicts)

### Smart Features
- ✅ Multi-factor slot scoring (time of day, meeting density, buffer time)
- ✅ Productivity pattern analysis (most productive hours, busy days)
- ✅ Automatic Slack DND during focus time
- ✅ Calendar-to-Slack sync (auto-update status before meetings)
- ✅ Rich Slack formatting with blocks and emojis

## 🏗️ Architecture

```
User (Slack) → Slack Bot → MCP Tools → Backend Services
                    ↓
                Google Calendar API
                Slack API
                OpenAI API (optional)
```

## 📦 Tech Stack

- **MCP SDK:** `@modelcontextprotocol/sdk` (TypeScript)
- **Calendar:** Google Calendar API v3
- **Communication:** Slack Web API + Bolt
- **Auth:** OAuth 2.0 (googleapis)
- **NLP:** OpenAI GPT-4 (optional)
- **Frontend:** Next.js 15 (admin dashboard)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- Google Cloud account (for Calendar API)
- Slack workspace with admin access
- OpenAI API key (optional, for better NLP)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Google Calendar

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials (Desktop app)
5. Add credentials to `.env.local`:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

6. Authenticate:
```bash
npm run auth
```

### 3. Configure Slack Bot

Follow the detailed guide in `SLACK_SETUP.md` to:
- Create Slack app
- Configure OAuth scopes
- Enable Socket Mode
- Create slash commands
- Get API tokens

Add tokens to `.env.local`:
```env
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token
```

### 4. Start the Bot

```bash
npm run slack-bot
```

## 🎮 Usage

### Slash Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/schedule` | Create a calendar event | `/schedule Team sync tomorrow at 10am for 30 min` |
| `/findtime` | Find optimal time slots | `/findtime 1 hour morning` |
| `/focustime` | Activate focus mode | `/focustime 2 hours` |
| `/meetings` | List upcoming meetings | `/meetings` |
| `/nextmeeting` | Get next meeting | `/nextmeeting` |
| `/productivity` | Analyze patterns | `/productivity` |
| `/weeklyreport` | Get weekly analytics | `/weeklyreport` |
| `/monthlyreport` | Get monthly analytics | `/monthlyreport` |
| `/prepmeeting` | Prepare for next meeting | `/prepmeeting` |

### Natural Language

Mention the bot or send a DM:

```
@Productivity Assistant what's my next meeting?
@Productivity Assistant find time for a 30-minute call tomorrow
@Productivity Assistant schedule a 1:1 with Sarah next week
@Productivity Assistant show me weekly report
@Productivity Assistant prepare for my next meeting
```

### Smart Scheduling Example

```
/findtime 1 hour

⭐ Top 5 Optimal Time Slots:

1. Tuesday 10:00 AM (Score: 135)
   Peak productivity hours (9-11 AM), Clear block of time, Within preferred hours

2. Wednesday 2:00 PM (Score: 120)
   Good afternoon slot, Good buffer time available

3. Thursday 9:30 AM (Score: 130)
   Peak productivity hours (9-11 AM), Friday (good for wrap-ups)
```

### Focus Time Protection

```
/focustime 2 hours

✅ Focus mode activated for 120 minutes
🎯 Slack status: Deep Work - Do Not Disturb
🔕 DND enabled
📅 Calendar blocked
```

## 📁 Project Structure

```
prod-mcp/
├── server/
│   ├── services/
│   │   ├── auth.service.ts           # Google OAuth
│   │   ├── calendar.service.ts       # Calendar CRUD
│   │   ├── nlp.service.ts            # Natural language parsing
│   │   ├── slack.service.ts          # Slack integration
│   │   ├── smart-scheduler.service.ts # Smart scheduling
│   │   └── focus-time.service.ts     # Focus time protection
│   ├── tools/
│   │   ├── calendar-tools.ts         # Calendar MCP tools
│   │   └── scheduling-tools.ts       # Scheduling MCP tools
│   ├── types/
│   │   └── calendar.types.ts         # Type definitions
│   ├── slack-bot.ts                  # Main Slack bot
│   ├── auth-cli.ts                   # Auth helper
│   └── mcp-server.ts                 # MCP server
├── app/                               # Next.js frontend (admin)
├── components/                        # React components
├── SLACK_SETUP.md                     # Slack setup guide
├── PHASE2_COMPLETE.md                 # Implementation summary
└── README.md                          # This file
```

## 🛠️ Development

### Available Scripts

```bash
# Authentication
npm run auth              # Authenticate with Google Calendar

# Slack Bot
npm run slack-bot         # Start Slack bot

# Testing
npm run mcp-test          # Test MCP tools
npm run nlp-test          # Test NLP service

# Frontend
npm run dev               # Start Next.js dev server (admin dashboard)
npm run build             # Build for production
```

## 🧪 Testing

See `TESTING.md` for comprehensive testing guide.

Quick test:
```bash
# 1. Authenticate
npm run auth

# 2. Start bot
npm run slack-bot

# 3. Test in Slack
/meetings
/findtime 30 minutes
@bot what's my next meeting?
```

## 📊 Features Breakdown

### Smart Scheduling Algorithm

Uses multi-factor scoring:
- ⏰ **Time of Day:** Morning hours (9-11 AM) preferred
- 🍽️ **Lunch Avoidance:** Penalizes 12-1 PM slots
- 📅 **Day of Week:** Optimizes based on typical meeting patterns
- 📊 **Meeting Density:** Avoids days with many meetings
- ⏱️ **Buffer Time:** Ensures breaks between meetings
- 🎯 **Preferred Hours:** Respects your work schedule

### Focus Time Protection

- Creates recurring focus time blocks
- Auto-blocks calendar with "Do Not Book"
- Sets Slack to DND mode
- Updates Slack status with 🎯 emoji
- Prevents meeting conflicts automatically

### Calendar-Slack Sync

- Monitors upcoming meetings
- Auto-updates Slack status 5 minutes before events
- Smart emoji selection based on meeting type:
  - 🗣️ Standup/Sync
  - 🤝 1:1 meetings
  - 📝 Reviews
  - 💼 Interviews
  - 🎯 Focus time

### Productivity Analytics

- Identifies most productive hours (least meetings)
- Finds least busy days
- Calculates average meetings per day
- Provides actionable recommendations

## 🔒 Security

- OAuth 2.0 for Google Calendar
- Tokens stored locally in `data/token.json`
- Slack Socket Mode (no public webhooks needed)
- Environment variables for sensitive data
- No data stored on external servers

## 🚧 Roadmap

### Phase 1: Core Calendar Integration ✅
- Google OAuth 2.0
- Calendar CRUD operations
- Natural language parsing
- MCP tool definitions

### Phase 2: Slack & Smart Scheduling ✅
- Slack bot integration
- Smart scheduling algorithm
- Focus time protection
- Productivity analytics

### Phase 3: Meeting Intelligence ✅
- Meeting preparation assistant
- Calendar analytics and insights
- Weekly/monthly reports
- Productivity recommendations
- AI-powered agenda generation

## 📝 Documentation

- `SLACK_SETUP.md` - Detailed Slack app configuration
- `TESTING.md` - Comprehensive testing guide
- `PHASE2_COMPLETE.md` - Phase 2 implementation summary
- `PHASE3_COMPLETE.md` - Phase 3 implementation summary
- `server/README.md` - Server-side documentation

## 🤝 Contributing

This project is built for the DoraHacks hackathon. Contributions welcome!

## 📄 License

MIT

## 🙏 Acknowledgments

- Model Context Protocol (MCP) SDK
- Google Calendar API
- Slack API
- OpenAI API
- Next.js

---

**Built with ❤️ for the DoraHacks Hackathon**