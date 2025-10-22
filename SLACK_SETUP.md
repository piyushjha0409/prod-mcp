# Slack Bot Setup Guide

This guide will help you set up the Productivity Assistant Slack bot.

## Prerequisites

- A Slack workspace where you have admin permissions
- Google Calendar authentication already completed (`npm run auth`)
- OpenAI API key (optional, for natural language processing)

## Step 1: Create Slack App

1. Go to [https://api.slack.com/apps](https://api.slack.com/apps)
2. Click **"Create New App"**
3. Choose **"From scratch"**
4. App Name: `Productivity Assistant`
5. Choose your workspace
6. Click **"Create App"**

## Step 2: Configure OAuth & Permissions

1. In the left sidebar, click **"OAuth & Permissions"**
2. Scroll down to **"Scopes"**
3. Add the following **Bot Token Scopes**:
   - `app_mentions:read` - View messages that directly mention @bot
   - `chat:write` - Send messages
   - `im:history` - View messages in direct messages
   - `im:read` - View basic information about direct messages
   - `im:write` - Start direct messages with people
   - `users.profile:read` - View profile details
   - `users.profile:write` - Edit profile
   - `dnd:write` - Edit Do Not Disturb settings
   - `dnd:read` - View Do Not Disturb settings

4. Scroll up and click **"Install to Workspace"**
5. Authorize the app
6. Copy the **"Bot User OAuth Token"** (starts with `xoxb-`)
   - Save this as `SLACK_BOT_TOKEN` in your `.env.local`

## Step 3: Enable Socket Mode

1. In the left sidebar, click **"Socket Mode"**
2. Toggle **"Enable Socket Mode"** to ON
3. Give it a token name: `productivity-mcp`
4. Click **"Generate"**
5. Copy the **App-Level Token** (starts with `xapp-`)
   - Save this as `SLACK_APP_TOKEN` in your `.env.local`

## Step 4: Get Signing Secret

1. In the left sidebar, click **"Basic Information"**
2. Scroll down to **"App Credentials"**
3. Copy the **"Signing Secret"**
   - Save this as `SLACK_SIGNING_SECRET` in your `.env.local`

## Step 5: Enable Event Subscriptions

1. In the left sidebar, click **"Event Subscriptions"**
2. Toggle **"Enable Events"** to ON
3. Under **"Subscribe to bot events"**, add:
   - `app_mention` - Mentions & direct messages
   - `message.im` - Direct messages

4. Click **"Save Changes"**

## Step 6: Create Slash Commands

Create the following slash commands in **"Slash Commands"** section:

### /schedule
- **Command:** `/schedule`
- **Short Description:** Schedule a new calendar event
- **Usage Hint:** `[event description]`
- Example: `/schedule Team meeting tomorrow at 2pm for 1 hour`

### /findtime
- **Command:** `/findtime`
- **Short Description:** Find optimal meeting time slots
- **Usage Hint:** `[duration]`
- Example: `/findtime 30 minutes`

### /focustime
- **Command:** `/focustime`
- **Short Description:** Activate focus mode
- **Usage Hint:** `[duration]`
- Example: `/focustime 2 hours`

### /meetings
- **Command:** `/meetings`
- **Short Description:** List upcoming meetings
- **Usage Hint:** (no parameters)

### /nextmeeting
- **Command:** `/nextmeeting`
- **Short Description:** Get next upcoming meeting
- **Usage Hint:** (no parameters)

### /productivity
- **Command:** `/productivity`
- **Short Description:** Analyze productivity patterns
- **Usage Hint:** (no parameters)

## Step 7: Configure Environment Variables

Update your `.env.local` file:

```env
# Google Calendar API
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# OpenAI (for NLP)
OPENAI_API_KEY=your_openai_key

# Slack API
SLACK_BOT_TOKEN=xoxb-your-bot-token
SLACK_SIGNING_SECRET=your-signing-secret
SLACK_APP_TOKEN=xapp-your-app-token

# Server
PORT=3000
LOG_LEVEL=info
```

## Step 8: Start the Slack Bot

```bash
# Make sure you're authenticated with Google first
npm run auth

# Start the Slack bot
npm run slack-bot
```

You should see:
```
✅ All services initialized successfully
⚡️ Slack bot is running!
📍 Available commands:
  /schedule <description>
  /findtime <duration>
  /focustime <duration>
  /meetings
  /nextmeeting
  /productivity
  /weeklyreport
  /monthlyreport
  /prepmeeting
```

## Step 9: Test the Bot

### In Slack:

1. **Invite the bot to a channel:**
   - In any channel: `/invite @Productivity Assistant`

2. **Test slash commands:**
   ```
   /meetings
   /nextmeeting
   /findtime 30 minutes
   /productivity
   ```

3. **Test mentions:**
   ```
   @Productivity Assistant what's my next meeting?
   @Productivity Assistant find time for a 1 hour meeting tomorrow
   ```

4. **Test direct messages:**
   - Send a DM to the bot
   - Try: "Show me my upcoming events"

## Available Features

### Slash Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/schedule` | Create a calendar event | `/schedule Team sync tomorrow at 10am for 30 min` |
| `/findtime` | Find optimal time slots | `/findtime 1 hour` |
| `/focustime` | Activate focus mode | `/focustime 2 hours` |
| `/meetings` | List upcoming meetings | `/meetings` |
| `/nextmeeting` | Get next meeting | `/nextmeeting` |
| `/productivity` | Analyze patterns | `/productivity` |
| `/weeklyreport` | Get weekly analytics | `/weeklyreport` |
| `/monthlyreport` | Get monthly analytics | `/monthlyreport` |
| `/prepmeeting` | Prepare for next meeting | `/prepmeeting` |

### Natural Language (via mentions or DM)

- "What's my next meeting?"
- "Show me my upcoming events"
- "Find time for a 30-minute call tomorrow"
- "Schedule a team meeting next Monday at 2pm"
- "Activate focus mode for 2 hours"
- "Analyze my productivity"
- "Show me weekly report"
- "Prepare for my next meeting"
- "How was my calendar this month?"

### Smart Features

- **Optimal Time Finding:** Ranks slots by productivity score
- **Focus Time Protection:** Auto-blocks calendar and sets Slack DND
- **Calendar-Slack Sync:** Updates status based on meetings
- **Productivity Analysis:** Shows patterns and recommendations
- **Meeting Preparation:** Context and agenda for upcoming meetings
- **Calendar Analytics:** Weekly/monthly reports with insights
- **AI-Powered Agendas:** OpenAI-generated meeting agendas

## Troubleshooting

### Bot not responding?
- Check that Socket Mode is enabled
- Verify all tokens are correct in `.env.local`
- Make sure the bot is running (`npm run slack-bot`)
- Check console for error messages

### "User not authenticated" error?
- Run `npm run auth` to authenticate with Google Calendar
- Check that Google OAuth tokens are valid

### Slash commands not working?
- Make sure you created all slash commands in Slack app settings
- Verify the bot has proper scopes (OAuth & Permissions)
- Try reinstalling the app to workspace

### Can't set Slack status?
- Verify bot has `users.profile:write` scope
- Make sure you're using a Bot Token, not User Token
- Check that the bot is installed in the workspace

## Next Steps

- Set up recurring focus time blocks
- Configure productivity preferences
- Integrate with team calendars
- Add custom scheduling rules

## Support

For issues or questions:
- Check the console logs for detailed error messages
- Review Slack app event logs at https://api.slack.com/apps
- Verify Google Calendar API is working: `npm run mcp-test`
