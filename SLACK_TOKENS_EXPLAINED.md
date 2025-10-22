# Slack Tokens Explained: Bot Token vs App Token

## 🔑 The Two Types of Tokens

When setting up a Slack app, you need **TWO different tokens** for different purposes:

---

## 1️⃣ Bot Token (SLACK_BOT_TOKEN)

**Starts with:** `xoxb-` (e.g., `xoxb-1234567890-1234567890123-abcdefg`)

### What It's For
- **Actions performed BY your bot**
- Sending messages
- Updating user status
- Reading channel info
- Managing DND settings
- All API calls the bot makes

### Analogy
Think of this as the bot's **ID badge** - it proves who the bot is and what permissions it has.

### Where to Get It
1. Go to your Slack app settings
2. Navigate to **"OAuth & Permissions"**
3. Scroll to **"OAuth Tokens for Your Workspace"**
4. Click **"Install to Workspace"** (if not already installed)
5. Copy the **"Bot User OAuth Token"**

### Scopes Required
The bot token needs these scopes to work:

```
Bot Token Scopes:
- chat:write           # Send messages
- channels:read        # Read channel info
- users:read           # Read user info
- users.profile:write  # Update user status
- users.profile:read   # Read user profile
- dnd:write            # Set Do Not Disturb
- dnd:read             # Check DND status
- im:read              # Access DMs
- im:write             # Send DMs
```

### How It's Used in Code
```typescript
// Initialize Slack client with Bot Token
const slackService = new SlackService(process.env.SLACK_BOT_TOKEN);

// Bot token is used for API calls:
await slackService.updateStatus({ ... });  // Bot performs action
await slackService.sendMessage({ ... });   // Bot sends message
```

---

## 2️⃣ App Token (SLACK_APP_TOKEN)

**Starts with:** `xapp-` (e.g., `xapp-1-A012BCDEFGH-1234567890-abcdefg`)

### What It's For
- **Receiving events in real-time** (Socket Mode)
- Listening for slash commands
- Receiving app mentions
- Getting direct messages
- Enabling bidirectional communication

### Analogy
Think of this as the bot's **phone line** - it's how Slack calls your app when something happens.

### Where to Get It
1. Go to your Slack app settings
2. Navigate to **"Basic Information"**
3. Scroll to **"App-Level Tokens"**
4. Click **"Generate Token and Scopes"**
5. Name it (e.g., "Socket Mode Token")
6. Add scope: `connections:write`
7. Click **"Generate"**
8. Copy the token

### Socket Mode Requirement
- **You MUST enable Socket Mode** to use the App Token
- Go to **"Socket Mode"** in sidebar
- Toggle **"Enable Socket Mode"** to ON

### How It's Used in Code
```typescript
// App token is used to establish WebSocket connection
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,     // Bot token for actions
  appToken: process.env.SLACK_APP_TOKEN,  // App token for events
  socketMode: true,                        // Enable Socket Mode
});

// App token enables receiving events:
app.command('/schedule', async ({ command, ack, respond }) => {
  // This handler receives events via App Token
});
```

---

## 🔄 How They Work Together

```
┌─────────────────────────────────────────────────────────────┐
│                     Your Slack Bot                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐                  ┌────────────────┐     │
│  │   App Token    │                  │   Bot Token    │     │
│  │   (xapp-...)   │                  │   (xoxb-...)   │     │
│  └────────┬───────┘                  └────────┬───────┘     │
│           │                                    │              │
│           │ RECEIVES                          │ SENDS         │
│           │ events                            │ actions       │
│           ▼                                    ▼              │
│  ┌─────────────────┐              ┌──────────────────┐      │
│  │  Socket Mode    │              │   Slack API      │      │
│  │  Connection     │              │   Calls          │      │
│  │                 │              │                  │      │
│  │ • Commands      │              │ • Send messages  │      │
│  │ • Mentions      │              │ • Update status  │      │
│  │ • DMs           │              │ • Get user info  │      │
│  │ • Events        │              │ • Set DND        │      │
│  └─────────────────┘              └──────────────────┘      │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Quick Comparison Table

| Feature | Bot Token (xoxb-) | App Token (xapp-) |
|---------|-------------------|-------------------|
| **Purpose** | Perform actions | Receive events |
| **Direction** | Outgoing (bot → Slack) | Incoming (Slack → bot) |
| **Examples** | Send message, update status | Listen for commands |
| **Required For** | API calls | Socket Mode |
| **Scopes** | Bot Token Scopes | `connections:write` |
| **Location** | OAuth & Permissions | Basic Information |
| **Format** | `xoxb-123-456-abc` | `xapp-1-ABC-123-def` |

---

## 🎯 Real-World Example

### Scenario: User types `/schedule meeting tomorrow`

**Step 1: App Token receives the command**
```
User types: /schedule meeting tomorrow
       ↓
Slack sends event to your bot via Socket Mode
       ↓
App Token (xapp-...) receives the event
       ↓
Your bot handler is triggered
```

**Step 2: Bot Token performs actions**
```
Your bot processes the command
       ↓
Bot creates calendar event
       ↓
Bot Token (xoxb-...) sends response to Slack API
       ↓
User sees: "✅ Meeting scheduled for tomorrow at 10am"
```

---

## 🚨 Common Mistakes

### ❌ Wrong: Using only Bot Token
```typescript
// This WON'T receive events!
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  socketMode: false,  // No App Token = No events
});
```

**Result:** Bot can send messages but never receives commands.

### ❌ Wrong: Using only App Token
```typescript
// This CAN'T perform actions!
const app = new App({
  appToken: process.env.SLACK_APP_TOKEN,
  socketMode: true,
  // Missing bot token!
});
```

**Result:** Bot receives events but can't respond.

### ✅ Correct: Using both tokens
```typescript
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,      // For actions
  appToken: process.env.SLACK_APP_TOKEN,   // For events
  socketMode: true,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});
```

**Result:** Bot can both receive commands AND respond! 🎉

---

## 🔐 Security Note: Signing Secret

There's also a **third credential** you need:

### SLACK_SIGNING_SECRET

**Purpose:** Verify that requests actually come from Slack

**Where to get it:**
- "Basic Information" → "App Credentials" → "Signing Secret"

**Why it's needed:**
- Prevents unauthorized requests
- Ensures message authenticity
- Required for security validation

---

## 📝 Setup Checklist

For the Productivity MCP bot to work, you need ALL THREE:

```bash
# In your .env.local file:

# 1. Bot Token - for API calls
SLACK_BOT_TOKEN=xoxb-your-bot-token-here

# 2. App Token - for Socket Mode events
SLACK_APP_TOKEN=xapp-your-app-token-here

# 3. Signing Secret - for security
SLACK_SIGNING_SECRET=your-signing-secret-here
```

---

## 🎓 Summary

### Bot Token (xoxb-)
- **What:** Your bot's identity and permissions
- **Does:** Sends messages, updates status, performs actions
- **Flow:** Your bot → Slack API
- **Like:** A key to open doors (perform actions)

### App Token (xapp-)
- **What:** Your bot's event receiver
- **Does:** Receives commands, mentions, messages
- **Flow:** Slack → Your bot (via WebSocket)
- **Like:** A mailbox to receive letters (events)

### Signing Secret
- **What:** Security validator
- **Does:** Verifies requests are from Slack
- **Flow:** Validates incoming events
- **Like:** A signature to verify authenticity

---

## 🔗 Slack Documentation Links

- [Bot Tokens](https://api.slack.com/authentication/token-types#bot)
- [App Tokens](https://api.slack.com/authentication/token-types#app)
- [Socket Mode](https://api.slack.com/apis/connections/socket)
- [OAuth Scopes](https://api.slack.com/scopes)

---

## ❓ FAQ

**Q: Can I use just the Bot Token without App Token?**
A: Yes, but only with HTTP webhooks. Socket Mode (easier, no public URL needed) requires both.

**Q: Why do I need Socket Mode?**
A: Socket Mode lets you develop locally without exposing a public webhook URL. Perfect for development!

**Q: What happens if I regenerate a token?**
A: The old token stops working immediately. Update your `.env.local` with the new token.

**Q: Can I use the same tokens for multiple apps?**
A: No, each Slack app has unique tokens. Don't share tokens between apps.

**Q: Are these tokens secret?**
A: YES! Never commit them to git. Keep them in `.env.local` (which is gitignored).

---

## 🚀 Quick Reference

```bash
# Copy this to your .env.local:

# From: OAuth & Permissions → Bot User OAuth Token
SLACK_BOT_TOKEN=xoxb-...

# From: Basic Information → App-Level Tokens
SLACK_APP_TOKEN=xapp-...

# From: Basic Information → App Credentials
SLACK_SIGNING_SECRET=...
```

Then:
```bash
npm run slack-bot
```

Your bot will:
- ✅ Receive commands (via App Token + Socket Mode)
- ✅ Perform actions (via Bot Token)
- ✅ Validate security (via Signing Secret)

---

**Need more help?** See `SLACK_SETUP.md` for step-by-step setup instructions.


