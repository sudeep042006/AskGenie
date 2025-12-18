# 🚀 Quick Start - AskGenie Development

## What's Complete ✅

**Backend**:

- ✅ MongoDB models (Chatbot, ChatLog)
- ✅ API routes (`/api/chatbot/create`, `/api/chat`, `/api/chatbots/:userId`)
- ✅ Crawl controller (create bot with URL → crawl → embed → store)
- ✅ Chat controller (RAG retrieval + Gemini LLM response)
- ✅ Express server with CORS enabled

**Frontend**:

- ✅ API service wrapper (`services/api.js`)
- ✅ App state management (bots, activeBot, userId, error handling)
- ✅ Sidebar with bot history list (shows status, name, URL)
- ✅ Hero page with URL input
- ✅ ChatWindow with message display + source links
- ✅ Full message flow from input → API → response

---

## Run Instructions

### Terminal 1: Backend

```powershell
cd F:\Hackathons\H-9 TNX(Hackathon_25_26)\ROUND 2\AskGenie\backend
npm install
npm start
```

✅ Server should say: `Server running on http://localhost:3000`

### Terminal 2: Frontend

```powershell
cd F:\Hackathons\H-9 TNX(Hackathon_25_26)\ROUND 2\AskGenie\frontend
npm install
npm run dev
```

✅ Frontend should say: `Local: http://localhost:5173`

---

## Test the Flow

### 1. Open Frontend

Go to `http://localhost:5173` in your browser

### 2. Create a Chatbot

- Enter URL: `https://iitg.ac.in` (or any website)
- Click "Create Chatbot"
- Watch console for logs
- Status should show "Processing" then "Ready" in sidebar

### 3. Send a Message

- Type: "What is this website about?"
- Click send or press Enter
- AI should respond with information from the website
- See source links below the response

### 4. Switch Bots

- Click another bot in sidebar
- Messages clear (new conversation)
- Chat again with different bot

---

## What Happens Behind the Scenes

### Creating a Bot

```
Frontend                        Backend
User enters URL
   ↓
POST /api/chatbot/create   →   Create MongoDB record
                           →   Crawl website (Firecrawl)
                           →   Chunk text
                           →   Generate embeddings (Gemini)
                           →   Store in Supabase
                           →   Update status to 'ready'
   ←   Return bot object
Add to sidebar list
Open ChatWindow
```

### Sending a Message

```
Frontend                        Backend
User types question
   ↓
POST /api/chat             →   Generate embedding (Gemini)
                           →   Retrieve matching documents (Supabase)
                           →   Build context from documents
                           →   Send to Gemini LLM
                           →   Save to ChatLog (MongoDB)
   ←   Return answer + sources
Display in ChatWindow
Show sources as links
```

---

## Key Files Changed

1. **`backend/src/controllers/crawlController.js`**

   - Updated `createChatbot()`: Save to MongoDB, crawl, embed, store in Supabase
   - Updated `getChatbots()`: Fetch from MongoDB instead of Supabase

2. **`frontend/src/App.jsx`**

   - Added loading state, error handling
   - Pass `userId` to ChatWindow
   - Fetch bots on app load

3. **`frontend/src/components/ChatWindow.jsx`**

   - Accept `userId` prop
   - Pass `userId` to API call
   - Better error messages

4. **`frontend/src/components/Sidebar.jsx`**
   - Show all bots (not just 4)
   - Display status badges (Ready/Processing/Error)
   - Show bot count

---

## Environment Variables Needed

### `.env` (Backend)

```
MONGODB_URI=mongodb+srv://...
SUPABASE_URL=https://...
SUPABASE_KEY=...
GEMINI_API_KEY=...
FIRECRAWL_API_KEY=...
PORT=3000
```

### `.env` (Frontend)

Not needed - API base URL is hardcoded in `frontend/src/services/api.js`:

```javascript
const API_BASE_URL = "http://localhost:3000/api";
```

---

## Frontend Component Props

### App

- `bots`: Chatbot[]
- `activeBot`: Chatbot | null
- `userId`: string
- `loading`: boolean
- `error`: string | null

### Sidebar

- `bots`: Chatbot[]
- `onSelectBot`: (bot: Chatbot) => void
- `onNewChat`: () => void

### ChatWindow

- `chatbot`: Chatbot
- `userId`: string
- `onBack`: () => void

### Hero

- `onCreate`: (url: string) => Promise<void>

---

## API Response Formats

### Create Bot

```json
{
  "message": "Chatbot created successfully!",
  "chatbotId": "507f1f77bcf86cd799439011",
  "bot": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user-123",
    "url": "https://example.com",
    "name": "Example Bot",
    "status": "ready",
    "createdAt": "2025-12-18T10:30:00.000Z"
  }
}
```

### Get Bots

```json
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "user-123",
    "url": "https://example.com",
    "name": "Example Bot",
    "status": "ready",
    "createdAt": "2025-12-18T10:30:00.000Z"
  }
]
```

### Chat Response

```json
{
  "answer": "This website is about...",
  "sources": ["https://example.com/page1", "https://example.com/page2"]
}
```

---

## Troubleshooting

### Frontend shows "Failed to load bots"

- Check backend is running on :3000
- Check network tab in DevTools
- Look at backend console for errors

### Chat returns "I don't have enough information"

- Website might not have been crawled successfully
- Check bot status in sidebar (should be "Ready")
- Verify question is relevant to website content

### Backend crashes on create

- Check all env variables are set
- Check MongoDB connection string is valid
- Check Firecrawl API key is valid

### No messages appear

- Check chatbotId is being passed correctly
- Verify bot status is "ready" before chatting
- Check backend `/api/chat` endpoint is receiving requests

---

**🎉 Everything is wired up and ready to test!**

Next Steps:

1. Make sure all env vars are set
2. Start backend server
3. Start frontend dev server
4. Open browser to `http://localhost:5173`
5. Create a bot and start chatting!
