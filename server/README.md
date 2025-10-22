# Productivity MCP Server

This is the backend server for the Productivity MCP (Model Context Protocol) application that integrates with Google Calendar and Slack.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your credentials:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `GOOGLE_REDIRECT_URI`: OAuth redirect URI (usually `http://localhost:3000/oauth2callback`)
   - `OPENAI_API_KEY`: Your OpenAI API key for NLP features
   - `SLACK_BOT_TOKEN`: Your Slack bot token
   - `SLACK_SIGNING_SECRET`: Your Slack signing secret
   - `SLACK_APP_TOKEN`: Your Slack app token (for Socket Mode)

3. **Authenticate with Google:**
   ```bash
   npm run auth
   ```
   
   This will:
   - Open a browser window for Google OAuth
   - Save authentication tokens for future use
   - Validate token refresh functionality

4. **Start the server:**
   ```bash
   npm run server:dev
   ```

## Available Scripts

- `npm run auth` - Run Google OAuth authentication
- `npm run slack-test` - Test Slack integration
- `npm run nlp-test` - Test NLP service
- `npm run mcp-test` - Test MCP tools
- `npm run server:dev` - Start development server
- `npm run server:build` - Build server for production
- `npm run server:start` - Start production server

## File Structure

```
server/
├── services/
│   ├── auth.service.ts    # Google OAuth 2.0 service
│   ├── calendar.service.ts # Google Calendar service
│   ├── nlp.service.ts     # OpenAI NLP service
│   └── slack.service.ts   # Slack bot service
├── tools/
│   ├── calendar-tools.ts  # Calendar MCP tools
│   └── slack-tools.ts     # Slack MCP tools
├── auth-cli.ts           # Authentication CLI script
├── slack-test.ts         # Slack integration test
├── index.ts              # Main server entry point
└── README.md             # This file
```

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Configure OAuth consent screen:
   - User type: External
   - App name: "Productivity Intelligence MCP"
   - Scopes: `calendar.readonly`, `calendar.events`
5. Create OAuth 2.0 credentials:
   - Application type: Desktop app
   - Download credentials JSON
6. Add the credentials to your `.env.local` file

## Authentication Flow

The authentication process uses OAuth 2.0 with offline access to ensure tokens can be refreshed automatically. Tokens are stored in `data/token.json` and are automatically refreshed when needed.

## Slack Bot Setup

1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Go to "OAuth & Permissions" and add these scopes:
   - `chat:write` - Send messages
   - `channels:read` - List public channels
   - `groups:read` - List private channels
   - `users:read` - List users
   - `im:read` - List direct messages
   - `mpim:read` - List group direct messages
4. Install the app to your workspace
5. Copy the Bot User OAuth Token (starts with `xoxb-`)
6. Go to "Basic Information" and copy the Signing Secret
7. For Socket Mode, go to "Socket Mode" and generate an App Token (starts with `xapp-`)
8. Add all three to your `.env.local` file

## Available MCP Tools

### Calendar Tools
- `create_calendar_event` - Create calendar events from natural language
- `find_available_time` - Find available time slots
- `get_upcoming_events` - Get upcoming calendar events
- `get_next_event` - Get the next calendar event

### Slack Tools
- `send_slack_message` - Send messages to Slack channels
- `get_slack_channels` - List available Slack channels
- `get_slack_users` - List Slack workspace users
- `send_calendar_notification` - Send formatted calendar notifications
- `send_available_slots` - Send available time slots to Slack
- `send_upcoming_events` - Send upcoming events to Slack
- `test_slack_connection` - Test Slack bot connection

## Testing

Test individual components:
```bash
npm run auth          # Test Google OAuth
npm run slack-test    # Test Slack integration
npm run nlp-test      # Test OpenAI NLP
npm run mcp-test      # Test MCP tools
```

## Next Steps

The application now includes:
- ✅ Google Calendar integration
- ✅ Slack bot integration
- ✅ Natural language processing
- ✅ MCP tool definitions
- ✅ Web interface for testing
