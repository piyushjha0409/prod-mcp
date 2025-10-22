# Complete Setup Guide - Productivity Intelligence MCP

## 🚀 Quick Setup (5 minutes)

This guide will help you set up all required services and credentials.

---

## ✅ Environment Variable Checklist

The test suite identified the following required variables:

### Required (Must Have)
- [ ] `GOOGLE_CLIENT_ID` - Google Calendar OAuth
- [ ] `GOOGLE_CLIENT_SECRET` - Google Calendar OAuth  
- [ ] `GOOGLE_REDIRECT_URI` - OAuth callback URL

### Optional (Recommended)
- [ ] `OPENAI_API_KEY` - Better NLP (has fallback)
- [ ] `SLACK_BOT_TOKEN` - Slack bot functionality
- [ ] `SLACK_SIGNING_SECRET` - Slack security
- [ ] `SLACK_APP_TOKEN` - Slack Socket Mode

---

## 📋 Step-by-Step Setup

### Step 1: Google Calendar API Setup (Required)

#### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Click "Select a Project" → "New Project"
3. Project name: `Productivity MCP`
4. Click "Create"

#### 1.2 Enable Google Calendar API

1. In the project, go to "APIs & Services" → "Library"
2. Search for "Google Calendar API"
3. Click on it and press "Enable"

#### 1.3 Configure OAuth Consent Screen

1. Go to "APIs & Services" → "OAuth consent screen"
2. User Type: Select "External" (or Internal if you have Google Workspace)
3. Click "Create"
4. Fill in:
   - App name: `Productivity Assistant`
   - User support email: Your email
   - Developer contact: Your email
5. Click "Save and Continue"
6. Scopes: Click "Add or Remove Scopes"
   - Add: `https://www.googleapis.com/auth/calendar.readonly`
   - Add: `https://www.googleapis.com/auth/calendar.events`
7. Click "Save and Continue"
8. Test users: Add your Google email
9. Click "Save and Continue"

#### 1.4 Create OAuth Credentials

1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. Application type: **Desktop app**
4. Name: `Productivity MCP Desktop`
5. Click "Create"
6. **Download the JSON file** or copy the credentials

#### 1.5 Add to .env.local

```bash
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

---

### Step 2: OpenAI API Setup (Optional but Recommended)

#### 2.1 Get API Key

1. Go to [OpenAI Platform](https://platform.openai.com)
2. Sign up / Log in
3. Go to "API Keys" section
4. Click "Create new secret key"
5. Name it: `Productivity MCP`
6. Copy the key (starts with `sk-`)

#### 2.2 Add to .env.local

```bash
OPENAI_API_KEY=sk-proj-abcdefghijklmnopqrstuvwxyz123456789
```

**Note:** If you skip this, the system will use fallback keyword-based parsing (less accurate but functional).

---

### Step 3: Slack Bot Setup (Optional)

Follow the detailed guide in `SLACK_SETUP.md` or quick steps:

#### 3.1 Create Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. App Name: `Productivity Assistant`
4. Choose your workspace
5. Click "Create App"

#### 3.2 Configure Bot Token Scopes

1. Go to "OAuth & Permissions"
2. Under "Bot Token Scopes", add:
   - `chat:write`
   - `channels:read`
   - `users:read`
   - `users.profile:write`
   - `users.profile:read`
   - `dnd:write`
   - `dnd:read`
   - `im:read`
   - `im:write`

#### 3.3 Install App to Workspace

1. Scroll up to "OAuth Tokens for Your Workspace"
2. Click "Install to Workspace"
3. Authorize the app
4. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

#### 3.4 Get Signing Secret

1. Go to "Basic Information"
2. Scroll to "App Credentials"
3. Copy the "Signing Secret"

#### 3.5 Enable Socket Mode

1. Go to "Socket Mode"
2. Toggle "Enable Socket Mode" to ON
3. Give token a name: `Productivity MCP Socket`
4. Click "Generate"
5. Copy the token (starts with `xapp-`)

#### 3.6 Create Slash Commands

Go to "Slash Commands" and create:

| Command | Description | Usage Hint |
|---------|-------------|------------|
| `/schedule` | Create calendar event | Schedule team meeting tomorrow at 2pm |
| `/findtime` | Find optimal time slots | Find time for 1 hour call |
| `/focustime` | Activate focus mode | Activate focus for 2 hours |
| `/meetings` | List upcoming meetings | Show my meetings |
| `/nextmeeting` | Get next meeting | What's my next meeting? |
| `/productivity` | Analyze patterns | Show productivity report |
| `/weeklyreport` | Weekly analytics | Get weekly report |
| `/monthlyreport` | Monthly analytics | Get monthly report |
| `/prepmeeting` | Prepare for meeting | Prepare next meeting |

**Request URL:** `https://your-domain.com/slack/commands` (not needed for Socket Mode)

#### 3.7 Add to .env.local

```bash
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here
```

---

## 🔧 Final Setup Steps

### 1. Create .env.local File

```bash
cd prod-mcp
cp .env.local.example .env.local
```

### 2. Edit .env.local

Open `.env.local` in your editor and fill in all the credentials you gathered above.

Example complete `.env.local`:

```bash
# Google Calendar API (REQUIRED)
GOOGLE_CLIENT_ID=123456789-abcd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnop
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback

# OpenAI API (OPTIONAL - better NLP)
OPENAI_API_KEY=sk-proj-abcdefghijklmnop

# Slack Bot API (OPTIONAL - for Slack bot)
SLACK_BOT_TOKEN=xoxb-your-bot-token-here
SLACK_SIGNING_SECRET=your-signing-secret-here
SLACK_APP_TOKEN=xapp-your-app-token-here

# Optional
NODE_ENV=development
```

### 3. Authenticate with Google

```bash
npm run auth
```

This will:
1. Open your browser to Google OAuth
2. Ask you to authorize the app
3. Give you a code to paste back
4. Save the token to `data/token.json`

### 4. Run Tests

```bash
npm run test
```

This will verify:
- ✅ All environment variables are set
- ✅ Google Calendar connection works
- ✅ OpenAI API works (if configured)
- ✅ Slack API works (if configured)
- ✅ All services function correctly

Expected output:
```
✅ [AuthService] getAuthUrl(): OAuth URL generated successfully
✅ [AuthService] loadSavedTokens(): Successfully loaded existing tokens
✅ [CalendarService] getUpcomingEvents(): Retrieved 5 upcoming events
✅ [NLPService] parseEventIntent(): Correctly parsed as "create"
...
Success Rate: 100%
```

### 5. Start the Slack Bot (if configured)

```bash
npm run slack-bot
```

### 6. Test in Slack

```
/meetings
/findtime 30 minutes
@Productivity Assistant what's my next meeting?
```

---

## 🧪 Testing Without Full Setup

If you only want to test certain features:

### Minimal Setup (Calendar only)
```bash
# Only set Google credentials
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=...
```

This enables:
- ✅ Calendar operations
- ✅ Time slot finding
- ✅ Basic scheduling
- ❌ Slack integration (skipped)
- ⚠️ NLP (fallback mode)

### With OpenAI
Add `OPENAI_API_KEY` for:
- ✅ Better natural language understanding
- ✅ AI-powered agenda generation
- ✅ Smart event parsing

### Full Setup
All credentials for:
- ✅ Everything enabled
- ✅ Slack bot commands
- ✅ Status synchronization
- ✅ Complete features

---

## 🔍 Verification Checklist

Run this checklist after setup:

```bash
# 1. Check environment
npm run test

# 2. Verify Google auth
npm run auth

# 3. Test calendar (if you have events)
npm run mcp-test

# 4. Test Slack (if configured)
npm run slack-bot
# Then test /meetings in Slack

# 5. Test NLP
npm run nlp-test
```

---

## ❌ Troubleshooting

### "Missing required environment variables"

**Solution:** Make sure `.env.local` exists and has all required variables.

```bash
# Check if file exists
ls -la .env.local

# Verify contents (hide sensitive data)
cat .env.local | sed 's/=.*/=***/'
```

### "No saved tokens found"

**Solution:** Run the auth flow:

```bash
npm run auth
```

### "Failed to fetch events"

**Possible causes:**
1. Token expired → Run `npm run auth` again
2. Wrong credentials → Check `.env.local`
3. API not enabled → Verify in Google Cloud Console

### "Slack bot not responding"

**Checklist:**
1. ✅ Socket Mode enabled?
2. ✅ App installed to workspace?
3. ✅ Bot invited to channel?
4. ✅ Slash commands created?
5. ✅ `npm run slack-bot` running?

### "OpenAI API errors"

**If you see OpenAI errors:**
- System automatically falls back to keyword parsing
- You can continue without OpenAI
- Or add valid API key to `.env.local`

---

## 📚 Next Steps

After successful setup:

1. **Review Features:** Read `README.md` for full feature list
2. **Try Demo Scenarios:** Follow `DEMO_SCRIPT.md`
3. **Customize:** Adjust preferences in service configs
4. **Deploy:** See deployment guide for production setup

---

## 🆘 Getting Help

If you're stuck:

1. **Check Logs:** Look at console output for error messages
2. **Run Tests:** `npm run test` identifies issues
3. **Review Docs:** 
   - `ENVIRONMENT_VARIABLES.md`
   - `SLACK_SETUP.md`
   - `TESTING.md`
4. **Common Issues:** See troubleshooting section above

---

## ✅ Setup Complete!

Once all tests pass, you're ready to:

- 📅 Schedule meetings via natural language
- 🎯 Find optimal meeting times
- 💬 Use Slack bot commands
- 📊 Generate productivity reports
- 🚀 Protect your focus time

**Happy productivity! 🎉**


