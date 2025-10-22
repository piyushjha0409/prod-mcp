# Google Calendar API Setup Guide

## 🎯 What You Need

To use the Productivity MCP with Google Calendar, you need three credentials:

1. **Client ID** - Identifies your application
2. **Client Secret** - Authentication secret for your app
3. **Redirect URI** - Where users return after authentication

---

## 📋 Step-by-Step Setup (10 minutes)

### Step 1: Go to Google Cloud Console

🔗 **URL:** [https://console.cloud.google.com](https://console.cloud.google.com)

1. Sign in with your Google account
2. Make sure you're using the correct Google account (if you have multiple)

---

### Step 2: Create a New Project

1. Click the **project dropdown** at the top (says "Select a project")
2. Click **"NEW PROJECT"** in the top right
3. Fill in:
   - **Project name:** `Productivity MCP` (or any name you like)
   - **Organization:** Leave as "No organization" (unless you have one)
   - **Location:** Leave as default
4. Click **"CREATE"**
5. Wait ~10 seconds for the project to be created
6. Click **"SELECT PROJECT"** when prompted (or select it from the dropdown)

---

### Step 3: Enable Google Calendar API

1. In the left sidebar, go to **"APIs & Services"** → **"Library"**
   - Or use the search bar at top and search "API Library"
2. In the API Library search box, type: **"Google Calendar API"**
3. Click on **"Google Calendar API"** from the results
4. Click the **"ENABLE"** button
5. Wait a few seconds for it to enable

✅ You should see "API enabled" and a dashboard

---

### Step 4: Configure OAuth Consent Screen

**Important:** You must do this BEFORE creating credentials.

1. In the left sidebar, go to **"OAuth consent screen"**
2. Select **"External"** user type
   - (Choose "Internal" only if you have Google Workspace)
3. Click **"CREATE"**

#### OAuth Consent Screen - Page 1: App Information

Fill in:
- **App name:** `Productivity Assistant` (or your choice)
- **User support email:** Your email address
- **App logo:** Skip (optional)
- **App domain:** Skip (optional)
- **Authorized domains:** Skip (optional)
- **Developer contact information:** Your email address

Click **"SAVE AND CONTINUE"**

#### OAuth Consent Screen - Page 2: Scopes

1. Click **"ADD OR REMOVE SCOPES"**
2. In the filter box, search for: **"calendar"**
3. Check these TWO scopes:
   - ✅ `https://www.googleapis.com/auth/calendar.events`
   - ✅ `https://www.googleapis.com/auth/calendar.readonly`
4. Click **"UPDATE"** at the bottom
5. Click **"SAVE AND CONTINUE"**

#### OAuth Consent Screen - Page 3: Test Users

1. Click **"+ ADD USERS"**
2. Add your Gmail address (the one you'll use for testing)
3. Click **"ADD"**
4. Click **"SAVE AND CONTINUE"**

#### OAuth Consent Screen - Page 4: Summary

1. Review everything
2. Click **"BACK TO DASHBOARD"**

✅ OAuth consent screen is now configured!

---

### Step 5: Create OAuth 2.0 Credentials

1. In the left sidebar, go to **"Credentials"**
2. Click **"+ CREATE CREDENTIALS"** at the top
3. Select **"OAuth client ID"**

#### Choose Application Type

**IMPORTANT:** Select **"Desktop app"** (NOT Web application)

- **Application type:** Desktop app
- **Name:** `Productivity MCP Desktop` (or any name)

Click **"CREATE"**

---

### Step 6: Get Your Credentials

A popup will appear with your credentials:

```
OAuth client created
Your Client ID: 123456789-abcdefghijklmnop.apps.googleusercontent.com
Your Client Secret: GOCSPX-abcdefghijklmnopqrstuvwx
```

**Option 1: Copy from popup**
- Copy both values now (or click "DOWNLOAD JSON")

**Option 2: Get them later**
- Go to "Credentials" page
- Find your OAuth 2.0 Client ID in the list
- Click the name to see details
- Copy Client ID and Client Secret

---

### Step 7: Add to Your .env.local File

1. Open your terminal
2. Navigate to the project:
   ```bash
   cd "/Users/piyushjha/Mystuff/teamdotapk/dora hacks/project1-productivity-mcp/prod-mcp"
   ```

3. Create/edit `.env.local`:
   ```bash
   nano .env.local
   ```
   Or use your favorite editor (VS Code, etc.)

4. Add these lines:
   ```bash
   # Google Calendar API
   GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwx
   GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
   
   # OpenAI API (you already have this)
   OPENAI_API_KEY=sk-your-existing-key
   
   # Slack (add later if needed)
   # SLACK_BOT_TOKEN=
   # SLACK_SIGNING_SECRET=
   # SLACK_APP_TOKEN=
   ```

5. Save the file:
   - In nano: `Ctrl+O`, `Enter`, `Ctrl+X`
   - In VS Code: `Cmd+S`

---

## 🔑 Your Three Credentials

| Credential | Value | Where It Comes From |
|------------|-------|---------------------|
| **Client ID** | `123456789-abc...apps.googleusercontent.com` | Google Cloud Console → Credentials |
| **Client Secret** | `GOCSPX-abcdefghijklmnop` | Google Cloud Console → Credentials |
| **Redirect URI** | `http://localhost:3000/oauth2callback` | Fixed value (don't change) |

### ⚠️ Important Notes

- **Client ID:** Looks like `123456789-abcdefg.apps.googleusercontent.com`
- **Client Secret:** Starts with `GOCSPX-` (newer) or can be other formats
- **Redirect URI:** Must be EXACTLY `http://localhost:3000/oauth2callback`
  - Don't add `https://`
  - Don't add trailing slash
  - Port must be `3000`

---

## ✅ Verify Your Setup

### Step 1: Check Environment Variables

```bash
cd "/Users/piyushjha/Mystuff/teamdotapk/dora hacks/project1-productivity-mcp/prod-mcp"

# Check if variables are set (hides actual values)
cat .env.local | sed 's/=.*/=***/'
```

Expected output:
```
GOOGLE_CLIENT_ID=***
GOOGLE_CLIENT_SECRET=***
GOOGLE_REDIRECT_URI=***
OPENAI_API_KEY=***
```

### Step 2: Run the Tests

```bash
npm run test
```

Expected output:
```
✅ Found: GOOGLE_CLIENT_ID
✅ Found: GOOGLE_CLIENT_SECRET
✅ Found: GOOGLE_REDIRECT_URI
```

### Step 3: Authenticate with Google

```bash
npm run auth
```

Expected flow:
1. Opens a URL in your terminal
2. Copy/paste the URL into your browser
3. Sign in with Google
4. Grant permissions to the app
5. You'll see a code (looks like `4/0AY0e-g7...`)
6. Paste the code back into the terminal
7. Success! Token saved to `data/token.json`

### Step 4: Test Calendar Access

```bash
npm run test
```

Now you should see:
```
✅ [CalendarService] getUpcomingEvents(): Retrieved X events
✅ [CalendarService] getNextEvent(): Next event: "Meeting Name"
✅ All tests passed!
```

---

## 🐛 Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem:** The redirect URI doesn't match

**Solution:** Make sure `.env.local` has EXACTLY:
```bash
GOOGLE_REDIRECT_URI=http://localhost:3000/oauth2callback
```

Common mistakes:
- ❌ `https://localhost:3000/oauth2callback` (don't use https)
- ❌ `http://localhost:3000/oauth2callback/` (no trailing slash)
- ❌ `http://localhost:3001/oauth2callback` (wrong port)

### Error: "invalid_client"

**Problem:** Client ID or Secret is wrong

**Solution:**
1. Go back to Google Cloud Console
2. Credentials → Find your OAuth 2.0 Client ID
3. Copy the values again
4. Make sure no extra spaces in `.env.local`

### Error: "Access blocked: This app's request is invalid"

**Problem:** OAuth consent screen not configured

**Solution:**
1. Go to OAuth consent screen
2. Make sure it's configured
3. Add your email as a test user
4. Publish the app (or keep it in testing mode)

### Error: "The API is not enabled"

**Problem:** Calendar API not enabled

**Solution:**
1. Go to APIs & Services → Library
2. Search "Google Calendar API"
3. Click Enable

---

## 🔒 Security Best Practices

### ✅ DO:
- Keep `.env.local` in `.gitignore` (already done)
- Never commit credentials to git
- Only share credentials with trusted team members
- Regenerate secrets if accidentally exposed

### ❌ DON'T:
- Don't share Client Secret publicly
- Don't commit `.env.local` to GitHub
- Don't use production credentials for testing

---

## 📊 Quick Reference

### File Locations

```
prod-mcp/
├── .env.local              # Your credentials (gitignored)
├── data/
│   └── token.json          # OAuth token (gitignored)
└── config/
    └── credentials.json    # Alternative (gitignored)
```

### Commands

```bash
# Authenticate
npm run auth

# Test connection
npm run test

# Test calendar
npm run mcp-test
```

---

## 🎯 Next Steps After Setup

Once you have Google credentials working:

### 1. Test Basic Features
```bash
npm run mcp-test
# Should show your upcoming calendar events
```

### 2. (Optional) Add Slack
See `SLACK_SETUP.md` for Slack bot setup

### 3. Run the Full Application
```bash
# If you have Slack configured:
npm run slack-bot

# Or use MCP tools directly:
npm run mcp-server
```

---

## 📱 What You Can Do Now

With Google Calendar credentials configured, you can:

- ✅ List upcoming events
- ✅ Create new events
- ✅ Find available time slots
- ✅ Update existing events
- ✅ Delete events
- ✅ Smart scheduling
- ✅ Analytics and reports
- ✅ Meeting preparation
- ✅ Focus time blocking

---

## 🆘 Still Having Issues?

1. **Check environment variables:**
   ```bash
   cat .env.local
   ```

2. **Verify Google Cloud Console:**
   - API is enabled?
   - OAuth consent configured?
   - Test user added?
   - Credentials created as "Desktop app"?

3. **Check documentation:**
   - `SETUP_GUIDE.md` - General setup
   - `TEST_REPORT.md` - Testing details
   - `ENV_STATUS.md` - Environment status

4. **Google's Documentation:**
   - [OAuth 2.0 Guide](https://developers.google.com/identity/protocols/oauth2)
   - [Calendar API Docs](https://developers.google.com/calendar/api/guides/overview)

---

## ✅ Success Checklist

- [ ] Google Cloud project created
- [ ] Google Calendar API enabled
- [ ] OAuth consent screen configured
- [ ] Test user added (your email)
- [ ] OAuth 2.0 credentials created (Desktop app)
- [ ] Client ID copied to `.env.local`
- [ ] Client Secret copied to `.env.local`
- [ ] Redirect URI set to `http://localhost:3000/oauth2callback`
- [ ] `npm run auth` completed successfully
- [ ] `npm run test` shows all tests passing
- [ ] Can see your calendar events

---

**Ready to authenticate?** Run: `npm run auth` 🚀


