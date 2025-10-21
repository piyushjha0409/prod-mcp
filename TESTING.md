# Testing Guide for Productivity MCP Backend

This guide covers all the different ways to test your backend services.

## 🚀 Quick Start Testing

### 1. **Prerequisites**
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials:
# - GOOGLE_CLIENT_ID
# - GOOGLE_CLIENT_SECRET  
# - GOOGLE_REDIRECT_URI
# - OPENAI_API_KEY (optional for NLP features)
```

### 2. **Authentication Setup**
```bash
# Authenticate with Google Calendar
npm run auth
# Follow the prompts to complete OAuth flow
```

## 🧪 Testing Methods

### Method 1: Web Interface (Easiest)
```bash
# Start the development server
npm run dev

# Open browser to test interface
open http://localhost:3000/api-test
```

**Features:**
- Interactive tool selection
- JSON argument input
- Real-time results display
- All calendar tools available

### Method 2: Command Line Testing

#### Test Individual Services
```bash
# Test authentication
npm run auth

# Test NLP service
npm run nlp-test

# Test MCP tools
npm run mcp-test

# Test full server
npm run server:dev
```

#### Test MCP Server
```bash
# Start MCP server
npm run mcp-server
```

### Method 3: API Testing with curl

#### Get Available Tools
```bash
curl http://localhost:3000/api/mcp
```

#### Test Calendar Tools
```bash
# Get upcoming events
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_upcoming_events", "args": {"maxResults": 5}}'

# Find available time
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "find_available_time", "args": {"duration": 60, "daysAhead": 7}}'

# Get next event
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "get_next_event", "args": {}}'

# Create event (requires OpenAI API key)
curl -X POST http://localhost:3000/api/mcp \
  -H "Content-Type: application/json" \
  -d '{"tool": "create_calendar_event", "args": {"input": "Test meeting tomorrow at 2pm for 30 minutes"}}'
```

### Method 4: Using Postman/Insomnia

1. **Import Collection:**
   - Create new collection
   - Add requests for each tool
   - Use the curl examples above

2. **Environment Variables:**
   - Set base URL: `http://localhost:3000`
   - Add any custom headers

### Method 5: Unit Testing (Advanced)

```bash
# Run individual service tests
npm run test:auth
npm run test:calendar
npm run test:nlp
npm run test:mcp
```

## 🔍 Testing Scenarios

### 1. **Authentication Flow**
```bash
# Test OAuth flow
npm run auth

# Expected: Browser opens, OAuth flow completes, tokens saved
# Check: data/token.json file created
```

### 2. **Calendar Operations**
```bash
# Test reading calendar
npm run mcp-test

# Expected: Shows upcoming events, finds available slots
# Check: No authentication errors
```

### 3. **NLP Processing**
```bash
# Test natural language processing
npm run nlp-test

# Try inputs like:
# - "Schedule a meeting tomorrow at 2pm for 1 hour"
# - "Find time for a 30-minute call next week"
# - "What meetings do I have today?"
```

### 4. **API Endpoints**
```bash
# Test API health
curl http://localhost:3000/api/mcp

# Expected: Returns available tools list
```

## 🐛 Troubleshooting

### Common Issues

#### 1. **Authentication Errors**
```bash
# Clear tokens and re-authenticate
rm -rf data/token.json
npm run auth
```

#### 2. **Environment Variables**
```bash
# Check if .env.local exists and has correct values
cat .env.local

# Verify Google OAuth credentials are correct
```

#### 3. **Port Conflicts**
```bash
# Check if port 3000 is available
lsof -i :3000

# Kill process if needed
kill -9 <PID>
```

#### 4. **Dependencies**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Debug Mode
```bash
# Run with debug logging
DEBUG=* npm run server:dev

# Or with specific debug scope
DEBUG=productivity-mcp npm run server:dev
```

## 📊 Expected Results

### Successful Authentication
```
✅ Already authenticated!
✅ Tokens are valid.
```

### Successful Calendar Access
```
📅 Found 3 upcoming events
Next event: Team Meeting
```

### Successful API Response
```json
{
  "result": {
    "success": true,
    "events": [...],
    "count": 3
  }
}
```

### Successful NLP Processing
```json
{
  "action": "create",
  "event": {
    "summary": "Meeting",
    "start": {"dateTime": "2024-01-16T14:00:00.000Z"},
    "end": {"dateTime": "2024-01-16T15:00:00.000Z"}
  },
  "confidence": 0.95
}
```

## 🎯 Testing Checklist

- [ ] Environment variables configured
- [ ] Google OAuth authentication working
- [ ] Calendar service can read events
- [ ] NLP service can parse natural language (if OpenAI key provided)
- [ ] MCP tools respond correctly
- [ ] API endpoints return expected data
- [ ] Web interface loads and functions
- [ ] Error handling works properly

## 🚀 Next Steps

Once basic testing passes:
1. Test with real calendar data
2. Test error scenarios (network issues, invalid inputs)
3. Test performance with large datasets
4. Test concurrent requests
5. Set up automated testing pipeline
