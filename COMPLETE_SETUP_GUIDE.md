# 🧞‍♂️ AskGenie - Complete Setup & Flow Guide

## 📋 Overview

AskGenie is a **RAG (Retrieval-Augmented Generation) Chatbot Platform** that allows users to:

1. **Create** a chatbot by providing a website URL
2. **View** their chatbot creation history
3. **Chat** with AI about the website content using RAG (context-aware answers)

---

## 🏗️ Architecture

### Backend Stack

- **Framework**: Express.js (Node.js)
- **Database**: MongoDB (stores chatbots and chat history)
- **Vector DB**: Supabase (pgvector) - stores document embeddings
- **Crawling**: Firecrawl API - extracts website content
- **Embeddings**: Gemini API - generates embeddings for text chunks
- **LLM**: Gemini API - generates AI responses

### Frontend Stack

- **Framework**: React 18 + Vite
- **Styling**: Tailwind CSS
- **HTTP**: Axios for API calls
- **Icons**: Lucide React

---

## 🔄 Complete User Flow

### 1️⃣ **Create Chatbot (From Frontend)**

**User Action**: Enters URL on Hero page → Clicks "Create Chatbot"

**API Call**:

```javascript
POST /api/chatbot/create
Body: {
  url: "https://example.com",
  userId: "cb1ed123-08da-4562-b36b-299f726eabe0",
  name: "Example Bot"
}
```

**Backend Process** (`crawlController.js`):

1. Creates MongoDB record: `{ userId, url, name, status: 'processing' }`
2. Crawls website using Firecrawl → gets `[ { content, url, title }, ... ]`
3. Chunks text using `textChunker.js`
4. For each chunk:
   - Generates embedding with `generateEmbedding()` (Gemini)
   - Stores in Supabase with metadata: `{ chatbot_id, url, user_id }`
5. Updates MongoDB status to `'ready'`

**Response** (Frontend receives):

```json
{
  "message": "Chatbot created successfully!",
  "chatbotId": "67a1b2c3d4e5f6g7h8i9j0k1",
  "bot": {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "url": "https://example.com",
    "name": "Example Bot",
    "status": "ready",
    "createdAt": "2025-12-18T10:30:00.000Z"
  }
}
```

**Frontend Updates**:

- Adds bot to sidebar list
- Automatically opens ChatWindow for the new bot

---

### 2️⃣ **Fetch User's Bots (On App Load)**

**API Call**:

```javascript
GET /api/chatbots/cb1ed123-08da-4562-b36b-299f726eabe0
```

**Backend** (`crawlController.js` - `getChatbots`):

```javascript
Chatbot.find({ userId }).sort({ createdAt: -1 });
```

**Response** (Array of bots):

```json
[
  {
    "_id": "67a1b2c3d4e5f6g7h8i9j0k1",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "url": "https://example.com",
    "name": "Example Bot",
    "status": "ready",
    "createdAt": "2025-12-18T10:30:00.000Z"
  }
  // ... more bots
]
```

**Frontend Updates**:

- Populates Sidebar with user's bots
- Each bot is clickable to open ChatWindow

---

### 3️⃣ **Send Message & Get AI Response**

**User Action**: Types question in ChatWindow → Clicks send

**API Call**:

```javascript
POST /api/chat
Body: {
  question: "What services do you offer?",
  userId: "cb1ed123-08da-4562-b36b-299f726eabe0",
  chatbotId: "67a1b2c3d4e5f6g7h8i9j0k1"
}
```

**Backend Process** (`chatController.js` - `askQuestion`):

1. **Embedding Generation**:
   - Converts question to embedding with `generateEmbedding()`
2. **Retrieval (RAG)**:
   - Calls Supabase RPC `match_documents` with:
     - `query_embedding` (question embedding)
     - `match_threshold: 0.4`
     - `match_count: 10`
   - Filters results to only documents with `metadata.chatbot_id === chatbotId`
3. **Prompt Construction**:

```javascript
const prompt = `
You are a highly detailed institutional assistant.
Answer the question using the context provided. 
If the answer is not in the context, say you don't know.

CONTEXT:
${relevantDocs.map((d) => d.content).join("\n\n---\n\n")}

QUESTION: ${question}
`;
```

4. **LLM Call**:
   - Sends prompt to Gemini API → gets `answer`
5. **Save History**:
   - Stores in MongoDB ChatLog: `{ userQuestion, aiAnswer, sources }`

**Response**:

```json
{
  "answer": "We offer a comprehensive range of services including...",
  "sources": ["https://example.com/services", "https://example.com/about"]
}
```

**Frontend Updates**:

- Displays user message in ChatWindow
- Shows loading state while waiting
- Displays AI response with source links
- Appends message to conversation history

---

## 📁 File Structure & Responsibilities

### Backend

```
backend/src/
├── index.js                    # Express app, middleware, server
├── routes/
│   ├── apiRoutes.js           # Routes: /api/chatbot/create, /api/chat, /api/chatbots/:userId
│   └── authroutes.js          # Auth endpoints (register/login)
├── controllers/
│   ├── crawlController.js     # createChatbot(), getChatbots()
│   └── chatController.js      # askQuestion(), getChatHistory()
├── services/
│   ├── crawler.js             # Firecrawl integration (crawlWebsite)
│   ├── embedder.js            # Gemini embedding (generateEmbedding)
│   ├── llm.js                 # Gemini LLM (generateAnswer)
│   └── textChunker.js         # Split text into chunks
├── models/
│   ├── chatbot.js             # MongoDB Chatbot schema
│   └── chatlog.js             # MongoDB ChatLog schema
└── config/
    ├── mongoClient.js         # MongoDB connection
    └── supabaseClient.js      # Supabase vector DB connection
```

### Frontend

```
frontend/src/
├── App.jsx                     # Main component, state management (bots, activeBot, userId)
├── services/
│   └── api.js                 # Axios API wrapper (createBot, askQuestion, fetchUserBots)
└── components/
    ├── Navbar.jsx             # Header with logo/branding
    ├── Sidebar.jsx            # Bot list + New Chat button
    ├── Hero.jsx               # URL input form (when no bot selected)
    └── ChatWindow.jsx         # Chat interface (when bot selected)
```

---

## 🚀 Running the Application

### Prerequisites

```bash
# Install Node.js 18+ and npm
# Set up environment variables:
# Backend: .env file with GEMINI_API_KEY, MONGODB_URI, SUPABASE_URL, SUPABASE_KEY, FIRECRAWL_API_KEY
# Frontend: Already configured to http://localhost:3000/api
```

### Start Backend

```bash
cd backend
npm install
npm start
# Server runs on http://localhost:3000
```

### Start Frontend

```bash
cd frontend
npm install
npm run dev
# App runs on http://localhost:5173
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint                | Body                              | Response                                            |
| ------ | ----------------------- | --------------------------------- | --------------------------------------------------- |
| POST   | `/api/chatbot/create`   | `{ url, userId, name }`           | `{ message, chatbotId, bot }`                       |
| GET    | `/api/chatbots/:userId` | -                                 | `[ { _id, userId, url, name, status, createdAt } ]` |
| POST   | `/api/chat`             | `{ question, userId, chatbotId }` | `{ answer, sources }`                               |

---

## 🧪 Testing the Flow

### Test 1: Create Chatbot

```bash
curl -X POST http://localhost:3000/api/chatbot/create \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://iitg.ac.in",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "name": "IITG Assistant"
  }'
```

### Test 2: Fetch User Bots

```bash
curl http://localhost:3000/api/chatbots/cb1ed123-08da-4562-b36b-299f726eabe0
```

### Test 3: Ask Question

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "question": "What programs does IITG offer?",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "chatbotId": "67a1b2c3d4e5f6g7h8i9j0k1"
  }'
```

---

## ✅ Data Flow Summary

```
USER FLOW:
1. Frontend: User enters URL on Hero page
2. Frontend→Backend: POST /api/chatbot/create
3. Backend: Crawl → Chunk → Embed → Store in Supabase + MongoDB
4. Frontend: Add bot to sidebar, open ChatWindow
5. Frontend: User types question
6. Frontend→Backend: POST /api/chat
7. Backend: Embed question → Retrieve docs → Generate answer with LLM
8. Frontend: Display answer + sources

SIDEBAR:
- GET /api/chatbots/:userId (on app load)
- Displays all user's bots with status badges
- Click to select bot → Opens ChatWindow
```

---

## 🛠️ Key Components Explained

### `App.jsx` - State Management

- `bots`: Array of user's chatbots
- `activeBot`: Currently selected bot (null = Hero page)
- `userId`: Current user ID (hardcoded for now)
- Fetches bots on mount
- Handles bot creation and selection

### `ChatWindow.jsx` - Chat Interface

- Receives `{ chatbot, userId, onBack }`
- Manages message history locally
- Sends messages via `/api/chat`
- Displays AI responses + sources
- Shows loading state while waiting

### `Sidebar.jsx` - Bot History

- Lists all user's bots
- Shows bot name, URL, and status badge
- Click to switch bots
- Delete button (TODO: not yet implemented)

### `Hero.jsx` - Bot Creation

- Shows when no bot is selected
- URL input with validation
- Create button triggers `/api/chatbot/create`

---

## 📝 Notes

- **User ID**: Currently hardcoded in `App.jsx`. In production, get from auth context.
- **Status Badges**: Ready (✓), Processing (⏳), Error (✗)
- **Error Handling**: Frontend catches errors and shows user-friendly messages
- **Message History**: Stored in memory (frontend) and MongoDB (backend)
- **Source Links**: Clickable URLs from relevant documents

---

## 🐛 Common Issues & Solutions

| Issue                        | Solution                                         |
| ---------------------------- | ------------------------------------------------ |
| Backend won't start          | Check MongoDB connection, all env vars set       |
| Create bot fails             | Verify Firecrawl API key, URL is valid           |
| Chat returns no answer       | Check Supabase connection, documents are indexed |
| Frontend can't reach backend | Ensure backend runs on :3000, CORS enabled       |

---

**Last Updated**: December 18, 2025  
**Version**: 1.0.0
