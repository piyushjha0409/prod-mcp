# Environment Variables

This document lists all the environment variables required for the Productivity MCP application.

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

### Google OAuth Configuration
```env
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

### OpenAI API Configuration
```env
OPENAI_API_KEY=your_openai_api_key_here
```

### Slack Bot Configuration
```env
SLACK_BOT_TOKEN=xoxb-your-slack-bot-token-here
SLACK_SIGNING_SECRET=your_slack_signing_secret_here
SLACK_APP_TOKEN=xapp-your-slack-app-token-here
```

## Optional Environment Variables
```env
NODE_ENV=development
```

## How to Get These Values

### Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project or select existing one
3. Enable the Google Calendar API
4. Configure OAuth consent screen
5. Create OAuth 2.0 credentials (Desktop app type)
6. Download credentials and add to `.env.local`

### OpenAI API Key
1. Sign up at [OpenAI Platform](https://platform.openai.com)
2. Generate an API key
3. Add to `.env.local`

### Slack Bot Credentials
1. Go to [Slack API](https://api.slack.com/apps)
2. Create a new app
3. Go to "OAuth & Permissions" and add these scopes:
   - `chat:write`
   - `channels:read`
   - `groups:read`
   - `users:read`
   - `im:read`
   - `mpim:read`
4. Install the app to your workspace
5. Copy the Bot User OAuth Token (starts with `xoxb-`)
6. Go to "Basic Information" and copy the Signing Secret
7. For Socket Mode, go to "Socket Mode" and generate an App Token (starts with `xapp-`)
8. Add all three to `.env.local`

## File Structure
```
.env.local          # Your actual environment variables (not committed to git)
.env.example        # Example file (this file)
ENVIRONMENT_VARIABLES.md  # This documentation
```
