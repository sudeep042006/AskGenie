# 🔍 Code Flow Examples - AskGenie

## 1. CREATE CHATBOT - Full Code Flow

### Frontend: User creates bot

**File**: `frontend/src/App.jsx`

```javascript
const handleCreateBot = async (url) => {
  try {
    setError(null);
    // ① Call API service
    const res = await chatbotApi.createBot({
      url,
      userId,
      name: url.split("/")[2] || "New Bot",
    });

    // ② Extract bot from response
    const createdBot = res.data?.bot || {
      _id: res.data?.chatbotId,
      url,
      name: "New Bot",
      status: "processing",
      userId,
    };

    // ③ Update state
    setBots((prev) => [createdBot, ...prev]);
    setActiveBot(createdBot);
  } catch (err) {
    setError("Failed to create chatbot...");
  }
};
```

### Frontend: API Service

**File**: `frontend/src/services/api.js`

```javascript
export const chatbotApi = {
  createBot: async (data) => {
    // ① Make HTTP request to backend
    return await api.post("/chatbot/create", data);
    // data = { url: "https://example.com", userId: "user-123", name: "Example" }
  },
};
```

### Backend: Express Route

**File**: `backend/src/routes/apiRoutes.js`

```javascript
router.post("/chatbot/create", createChatbot);
// Routes POST /api/chatbot/create → createChatbot controller
```

### Backend: Controller Logic

**File**: `backend/src/controllers/crawlController.js`

```javascript
export async function createChatbot(req, res) {
  const { url, userId, name } = req.body;
  const effectiveUserId = userId || "test-user";

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // ① CREATE MONGODB RECORD
    const newBot = await Chatbot.create({
      userId: effectiveUserId,
      url,
      name: name || "New Assistant",
      status: "processing", // ← Important! Marks as being processed
    });

    const chatbotId = newBot._id.toString();
    console.log(`✅ MongoDB Record Created: ${chatbotId}`);

    // ② CRAWL WEBSITE
    const pages = await crawlWebsite(url);
    // Returns: [ { content: "...", url: "...", title: "..." }, ... ]

    // ③ PROCESS EACH PAGE
    for (const page of pages) {
      const chunks = chunkText(page.content);
      // Returns: [ "chunk1...", "chunk2...", ... ]

      // ④ EMBED & STORE EACH CHUNK
      for (const chunk of chunks) {
        const embedding = await generateEmbedding(chunk);
        // Returns: [0.123, 0.456, 0.789, ...] (1536 dimensions)

        // ⑤ STORE IN SUPABASE WITH LINK TO CHATBOT
        const { error: sbError } = await supabase.from("documents").insert({
          content: chunk,
          embedding: embedding,
          metadata: {
            chatbot_id: chatbotId, // ← THE KEY LINK!
            url: page.url,
            user_id: effectiveUserId,
          },
        });

        if (sbError) throw sbError;
      }
    }

    // ⑥ UPDATE STATUS IN MONGODB
    newBot.status = "ready"; // ← Now it's ready for chat
    await newBot.save();

    // ⑦ SEND RESPONSE BACK TO FRONTEND
    res.status(201).json({
      message: "Chatbot created successfully!",
      chatbotId,
      bot: newBot, // Frontend needs this!
    });
  } catch (error) {
    console.error("❌ Creation Error:", error);
    res.status(500).json({ error: "Failed to create chatbot" });
  }
}
```

### Frontend: Receives Response

**File**: `frontend/src/App.jsx`

```javascript
// res.data =
// {
//   "message": "Chatbot created successfully!",
//   "chatbotId": "507f1f77bcf86cd799439011",
//   "bot": {
//     "_id": "507f1f77bcf86cd799439011",
//     "userId": "user-123",
//     "url": "https://example.com",
//     "name": "example.com",
//     "status": "ready",
//     "createdAt": "2025-12-18T10:30:00Z"
//   }
// }

const createdBot = res.data.bot; // Extract the bot object
setBots((prev) => [createdBot, ...prev]); // Add to list
setActiveBot(createdBot); // Open chat with new bot
```

---

## 2. FETCH BOTS - Full Code Flow

### Frontend: App Mounts

**File**: `frontend/src/App.jsx`

```javascript
useEffect(() => {
  const fetchBots = async () => {
    try {
      setLoading(true);
      // ① Call API to get user's bots
      const res = await chatbotApi.fetchUserBots(userId);
      // userId = "cb1ed123-08da-4562-b36b-299f726eabe0"

      // ② Update state with bots array
      setBots(res.data || []);
      setError(null);
    } catch (err) {
      setError("Failed to load chatbots...");
      setBots([]);
    } finally {
      setLoading(false);
    }
  };

  fetchBots();
}, [userId]);
```

### Frontend: API Service

**File**: `frontend/src/services/api.js`

```javascript
export const chatbotApi = {
  fetchUserBots: async (userId) => {
    // ① Make GET request to /api/chatbots/:userId
    return await api.get(`/chatbots/${userId}`);
  },
};
```

### Backend: Express Route

**File**: `backend/src/routes/apiRoutes.js`

```javascript
router.get("/chatbots/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    // userId = "cb1ed123-08da-4562-b36b-299f726eabe0"

    // ① Query MongoDB for all bots with this userId
    const bots = await Chatbot.find({ userId }).sort({ createdAt: -1 });
    // Returns: [ bot1, bot2, bot3, ... ]

    res.json(bots);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});
```

### Frontend: Receives Bots

**File**: `frontend/src/App.jsx`

```javascript
// res.data = [
//   {
//     "_id": "507f1f77bcf86cd799439011",
//     "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
//     "url": "https://example1.com",
//     "name": "Example 1",
//     "status": "ready",
//     "createdAt": "2025-12-17T10:30:00Z"
//   },
//   {
//     "_id": "607f1f77bcf86cd799439012",
//     "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
//     "url": "https://example2.com",
//     "name": "Example 2",
//     "status": "ready",
//     "createdAt": "2025-12-18T10:30:00Z"
//   }
// ]

setBots(res.data); // Update state
// Sidebar now renders all bots!
```

### Frontend: Sidebar Renders

**File**: `frontend/src/components/Sidebar.jsx`

```javascript
const Sidebar = ({ bots }) => {
  return (
    <div>
      {bots.length === 0 ? (
        <p>No chatbots yet.</p>
      ) : (
        <div>
          {bots.map((bot) => (
            <div key={bot._id}>
              <h4>{bot.name}</h4>
              <p>{bot.url}</p>
              <span>
                {bot.status === "ready" ? "✓ Ready" : "⏳ Processing"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 3. SEND MESSAGE & GET AI RESPONSE - Full Code Flow

### Frontend: User Sends Message

**File**: `frontend/src/components/ChatWindow.jsx`

```javascript
const handleSend = async () => {
  if (!input.trim()) return;

  // ① Add user message to UI
  const userMsg = { role: "user", text: input };
  setMessages([...messages, userMsg]);
  setInput("");
  setLoading(true);

  try {
    const chatbotId = chatbot._id;
    const userQuestion = input; // "What is this website about?"

    // ② Call API to get AI response
    const res = await chatbotApi.askQuestion(chatbotId, userQuestion, userId);
    // Sends: POST /api/chat
    // Body: { question, userId, chatbotId }

    // ③ Display AI response
    const aiMsg = {
      role: "ai",
      text: res.data.answer,
      sources: res.data.sources,
    };
    setMessages((prev) => [...prev, aiMsg]);
  } catch (err) {
    // ④ Show error if something fails
    const errorMsg = {
      role: "ai",
      text: "Sorry, I encountered an error. Please try again.",
      sources: [],
    };
    setMessages((prev) => [...prev, errorMsg]);
  } finally {
    setLoading(false);
  }
};
```

### Frontend: API Service

**File**: `frontend/src/services/api.js`

```javascript
export const chatbotApi = {
  askQuestion: async (chatbotId, question, userId) => {
    // ① Send chat request to backend
    return await api.post("/chat", {
      question, // "What is this website about?"
      userId, // "cb1ed123-08da-4562-b36b-299f726eabe0"
      chatbotId, // "507f1f77bcf86cd799439011"
    });
  },
};
```

### Backend: Express Route

**File**: `backend/src/routes/apiRoutes.js`

```javascript
router.post("/chat", askQuestion);
// Routes POST /api/chat → askQuestion controller
```

### Backend: Controller Logic

**File**: `backend/src/controllers/chatController.js`

```javascript
export async function askQuestion(req, res) {
  const { question, userId, chatbotId } = req.body;
  // question = "What is this website about?"
  // userId = "cb1ed123-08da-4562-b36b-299f726eabe0"
  // chatbotId = "507f1f77bcf86cd799439011"

  if (!question || !chatbotId) {
    return res.status(400).json({ error: "Question and ChatbotID required" });
  }

  try {
    // ① GENERATE EMBEDDING FOR QUESTION
    const questionEmbedding = await generateEmbedding(question);
    // Returns: [0.234, 0.567, 0.890, ...] (1536 dimensions)

    // ② RETRIEVE MATCHING DOCUMENTS FROM SUPABASE
    const { data: documents, error } = await supabase.rpc("match_documents", {
      query_embedding: questionEmbedding,
      match_threshold: 0.4,
      match_count: 10,
    });
    // Returns documents with similarity scores
    // SELECT content, metadata, similarity
    // WHERE embedding <-> query_embedding < (1 - 0.4)
    // LIMIT 10

    // ③ FILTER TO ONLY THIS CHATBOT'S DOCUMENTS
    const relevantDocs = documents.filter(
      (doc) => doc.metadata && doc.metadata.chatbot_id === chatbotId
    );
    // Now we only have documents from THIS specific chatbot

    // ④ BUILD CONTEXT FROM DOCUMENTS
    const contextText = relevantDocs
      .map((doc) => doc.content)
      .join("\n\n---\n\n");
    // Joins chunks with separator

    // ⑤ CREATE DETAILED PROMPT
    const prompt = `
You are a helpful institutional assistant.
Answer the question using the context provided.
If the answer is not in the context, say you don't know.

CONTEXT:
${contextText}

QUESTION: ${question}
    `;

    // ⑥ CALL GEMINI LLM
    const answer = await generateAnswer(prompt);
    // Returns: "This website is about..."

    // ⑦ SAVE TO MONGODB CHAT HISTORY
    await ChatLog.create({
      userQuestion: question,
      aiAnswer: answer,
      sources: relevantDocs.map((doc) => doc.metadata.url),
    });

    // ⑧ SEND RESPONSE TO FRONTEND
    res.json({
      answer,
      sources: [...new Set(relevantDocs.map((doc) => doc.metadata.url))],
      // Remove duplicates with Set
    });
  } catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
}
```

### Frontend: Displays Response

**File**: `frontend/src/components/ChatWindow.jsx`

```javascript
// res.data = {
//   "answer": "This website is about offering web development services...",
//   "sources": [
//     "https://example.com/services",
//     "https://example.com/about"
//   ]
// }

const aiMsg = {
  role: "ai",
  text: res.data.answer,
  sources: res.data.sources,
};

setMessages((prev) => [...prev, aiMsg]);

// In UI:
// User message: "What is this website about?"
// AI response: "This website is about..."
// Source links: [Source 1] [Source 2]
```

---

## Data Model Examples

### MongoDB Chatbot Document

```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  userId: "cb1ed123-08da-4562-b36b-299f726eabe0",
  url: "https://example.com",
  name: "Example Website",
  status: "ready",  // "processing" or "error"
  createdAt: ISODate("2025-12-18T10:30:00Z"),
  __v: 0
}
```

### Supabase Document (with vector)

```javascript
{
  id: 123,
  content: "This is a chunk of text from the website...",
  embedding: [0.123, 0.456, 0.789, ...],  // 1536 dimensions
  metadata: {
    chatbot_id: "507f1f77bcf86cd799439011",  // Links to MongoDB
    url: "https://example.com/page",
    user_id: "cb1ed123-08da-4562-b36b-299f726eabe0"
  },
  created_at: "2025-12-18T10:30:00Z"
}
```

### MongoDB ChatLog Document

```javascript
{
  _id: ObjectId("607f1f77bcf86cd799439012"),
  userQuestion: "What services do you offer?",
  aiAnswer: "We offer web development, design, and...",
  sources: [
    "https://example.com/services",
    "https://example.com/pricing"
  ],
  timestamp: ISODate("2025-12-18T10:35:00Z"),
  __v: 0
}
```

---

## Request/Response Examples

### 1. Create Chatbot

```bash
REQUEST:
POST http://localhost:3000/api/chatbot/create
Content-Type: application/json

{
  "url": "https://example.com",
  "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
  "name": "Example Bot"
}

RESPONSE (201):
{
  "message": "Chatbot created successfully!",
  "chatbotId": "507f1f77bcf86cd799439011",
  "bot": {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "url": "https://example.com",
    "name": "Example Bot",
    "status": "ready",
    "createdAt": "2025-12-18T10:30:00Z"
  }
}
```

### 2. Fetch User Bots

```bash
REQUEST:
GET http://localhost:3000/api/chatbots/cb1ed123-08da-4562-b36b-299f726eabe0

RESPONSE (200):
[
  {
    "_id": "507f1f77bcf86cd799439011",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "url": "https://example.com",
    "name": "Example Bot",
    "status": "ready",
    "createdAt": "2025-12-18T10:30:00Z"
  },
  {
    "_id": "607f1f77bcf86cd799439012",
    "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
    "url": "https://anothersite.com",
    "name": "Another Bot",
    "status": "ready",
    "createdAt": "2025-12-17T15:20:00Z"
  }
]
```

### 3. Send Chat Message

```bash
REQUEST:
POST http://localhost:3000/api/chat
Content-Type: application/json

{
  "question": "What services do you offer?",
  "userId": "cb1ed123-08da-4562-b36b-299f726eabe0",
  "chatbotId": "507f1f77bcf86cd799439011"
}

RESPONSE (200):
{
  "answer": "We offer a comprehensive range of web development and design services including responsive website design, e-commerce solutions, and custom application development...",
  "sources": [
    "https://example.com/services",
    "https://example.com/pricing",
    "https://example.com/portfolio"
  ]
}
```

---

**This is the complete data flow from user input to AI response!** 🎉
