import express from 'express';
// We import functions from crawlController
import { createChatbot, deleteChatbot } from '../controllers/crawlController.js';
import {
    askQuestion,
    createConversation,
    getConversations,
    getConversationMessages,
    deleteConversation
} from '../controllers/chatController.js';
import Chatbot from '../models/chatbot.js'; // Import this to list the bots

const router = express.Router();

// -------------------------------------------
// 1. DASHBOARD: List all chatbots for a user
// -------------------------------------------
router.get('/chatbots/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        // Find all bots created by this specific user
        const bots = await Chatbot.find({ userId }).sort({ createdAt: -1 });
        res.json(bots);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// -------------------------------------------
// 2. CREATE: User makes a new Chatbot
// -------------------------------------------
// This calls the function that uses Firecrawl + Supabase
router.post('/chatbot/create', createChatbot);

// -------------------------------------------
// 3. CHAT: User talks to a specific bot
// -------------------------------------------
// This calls the function that uses Gemini + MongoDB History
router.post('/chat', askQuestion);

// -------------------------------------------
// 4. DELETE: Remove a chatbot and its vectors
// -------------------------------------------
// Deletes from MongoDB and Supabase vectors
router.delete('/chatbot/:chatbotId', deleteChatbot);

// -------------------------------------------
// 5. CONVERSATIONS: ChatGPT-style history
// -------------------------------------------
router.post('/conversation', createConversation);
router.get('/conversations/:chatbotId/:userId', getConversations);
router.get('/messages/:conversationId', getConversationMessages);
router.delete('/conversation/:conversationId', deleteConversation);

export default router;