# Productivity MCP Server

This is the backend server for the Productivity MCP (Model Context Protocol) application that integrates with Google Calendar.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google OAuth credentials:
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
   - `GOOGLE_REDIRECT_URI`: OAuth redirect URI (usually `http://localhost:3000/oauth2callback`)

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
- `npm run server:dev` - Start development server
- `npm run server:build` - Build server for production
- `npm run server:start` - Start production server

## File Structure

```
server/
├── services/
│   └── auth.service.ts    # Google OAuth 2.0 service
├── auth-cli.ts           # Authentication CLI script
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

## Next Steps

After authentication is complete, you can:
- Implement calendar service for CRUD operations
- Add MCP tool definitions
- Create natural language processing for event creation
- Integrate with Slack for smart scheduling
