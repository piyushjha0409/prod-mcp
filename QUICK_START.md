# Quick Start Guide - Productivity Intelligence MCP

Get up and running in 5 minutes! 🚀

## Prerequisites

- Node.js 18+ installed
- Google Calendar account
- Slack workspace (admin access)
- OpenAI API key (optional - falls back to templates)

## 1. Install Dependencies

```bash
cd prod-mcp
npm install
```

## 2. Set Up Environment Variables

Create `.env.local` file:

```bash
# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:3000/auth/callback

# Slack
SLACK_BOT_TOKEN=xoxb-your-token
SLACK_SIGNING_SECRET=your-secret
SLACK_APP_TOKEN=xapp-your-token

# OpenAI (optional)
OPENAI_API_KEY=sk-your-key
```

### Get Google Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project
3. Enable **Google Calendar API**
4. Create **OAuth 2.0 Client ID** (Desktop app)
5. Copy Client ID and Secret to `.env.local`

### Get Slack Credentials

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create new app
3. Enable **Socket Mode** → Get App Token
4. Go to **OAuth & Permissions** → Get Bot Token
5. Go to **Basic Information** → Get Signing Secret
6. Add slash commands (see SLACK_SETUP.md)
7. Install to workspace

## 3. Authenticate with Google

```bash
npm run auth
```

1. Copy the URL from terminal
2. Open in browser
3. Sign in with Google
4. Copy authorization code
5. Paste in terminal

You should see: ✅ Authentication successful!

## 4. Start the Slack Bot

```bash
npm run slack-bot
```

Expected output:
```
🔐 Initializing authentication...
📅 Initializing calendar service...
💬 Initializing Slack service...
🧠 Initializing smart scheduler...
📊 Initializing analytics...
✅ All services initialized successfully
⚡️ Slack bot is running!
```

## 5. Test in Slack

### Invite the bot to a channel:
```
/invite @Productivity Assistant
```

### Try these commands:

#### Basic Calendar
```
/meetings                                      # List upcoming
/nextmeeting                                   # Next event
/schedule Team sync tomorrow at 10am          # Create event
```

#### Smart Scheduling
```
/findtime 30 minutes                          # Optimal slots
/focustime 2 hours                            # Block focus time
/productivity                                 # Analyze patterns
```

#### Analytics & Intelligence
```
/weeklyreport                                 # Weekly analytics
/monthlyreport                                # Monthly analytics
/prepmeeting                                  # Prepare for next meeting
```

#### Natural Language
```
@Productivity Assistant what's my next meeting?
@Productivity Assistant find time for a 1 hour call tomorrow
@Productivity Assistant show me weekly report
```

## Expected Results

### `/meetings`
```
📅 Upcoming Events (5):
• Team Standup - Wed, Nov 22, 9:00 AM
• 1:1 with Sarah - Wed, Nov 22, 2:00 PM
• Project Review - Thu, Nov 23, 10:00 AM
...
```

### `/findtime 1 hour`
```
⭐ Top 5 Optimal Time Slots:

1. Thursday 10:00 AM (Score: 145)
   ✅ Peak productivity hours
   ✅ Clear block of time
   ✅ 60 min buffer after
```

### `/weeklyreport`
```
📊 Calendar Analytics

Total Meeting Time: 14.5 hours (36% of work time)
Meeting Count: 18 meetings
Average Duration: 48 minutes
Busiest Day: Tuesday

💡 Recommendations:
⚠️ You spend 36% of time in meetings (industry avg: 31%)
```

### `/prepmeeting`
```
📅 Product Roadmap Review
⏰ In 25 minutes
👥 sarah@company.com, mike@company.com

🎯 Suggested Agenda:
1. Review Q2 feature proposals
2. Discuss timeline estimates
3. Assign ownership and next steps
```

## Troubleshooting

### Bot not responding?
- ✅ Check Socket Mode is enabled in Slack app settings
- ✅ Verify tokens in `.env.local`
- ✅ Ensure bot is running (`npm run slack-bot`)
- ✅ Check console for errors

### "User not authenticated" error?
- ✅ Run `npm run auth` again
- ✅ Check `data/token.json` exists
- ✅ Verify Google credentials are correct

### "OpenAI error" messages?
- ✅ Check `OPENAI_API_KEY` in `.env.local`
- ✅ It will fall back to templates (this is fine!)

### Slash commands return "Unknown command"?
- ✅ Add commands in Slack app settings
- ✅ See `SLACK_SETUP.md` for full list
- ✅ Reinstall app to workspace

## Available Commands Summary

| Command | What it does |
|---------|-------------|
| `/schedule <desc>` | Create calendar event |
| `/findtime <duration>` | Find optimal time slots |
| `/focustime <duration>` | Activate focus mode |
| `/meetings` | List upcoming meetings |
| `/nextmeeting` | Get next meeting |
| `/productivity` | Analyze productivity |
| `/weeklyreport` | Weekly analytics |
| `/monthlyreport` | Monthly analytics |
| `/prepmeeting` | Prepare for meeting |

## Next Steps

1. ✅ Test all commands
2. ✅ Review `PHASE3_TESTING.md` for comprehensive tests
3. ✅ Read `PROJECT_COMPLETE.md` for full feature list
4. ✅ Check `SLACK_SETUP.md` for advanced configuration

## Need Help?

- **Full Setup:** See `SLACK_SETUP.md`
- **Testing:** See `PHASE3_TESTING.md`
- **Environment:** See `ENVIRONMENT_VARIABLES.md`
- **Project Overview:** See `PROJECT_COMPLETE.md`

---

**You're all set!** Start using your AI-powered productivity assistant! 🎉
