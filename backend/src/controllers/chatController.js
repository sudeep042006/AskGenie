import { generateEmbedding } from '../services/embedder.js';
import { generateAnswer } from '../services/llm.js';
import supabase from '../config/supabaseClient.js';
import Conversation from '../models/conversation.js';
import Message from '../models/message.js';

// --- CONVERSATION MANAGEMENT ---

// 1. Create a new conversation
export async function createConversation(req, res) {
    const { userId, chatbotId } = req.body;
    try {
        const conversation = await Conversation.create({ userId, chatbotId });
        res.status(201).json(conversation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 2. Get all conversations for a specific bot and user
export async function getConversations(req, res) {
    const { chatbotId, userId } = req.params;
    try {
        const conversations = await Conversation.find({ chatbotId, userId })
            .sort({ lastUpdated: -1 });
        res.json(conversations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// 3. Get messages for a specific conversation
export async function getConversationMessages(req, res) {
    const { conversationId } = req.params;
    try {
        const messages = await Message.find({ conversationId }).sort({ timestamp: 1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

// --- CHAT LOGIC ---

// ... (previous code)

export async function askQuestion(req, res) {
    const { question, userId, chatbotId, conversationId } = req.body;
    console.log("Asking Question Payload:", { question, userId, chatbotId, conversationId });

    if (!question || !chatbotId) {
        return res.status(400).json({ error: 'Question and ChatbotID required' });
    }

    try {
        let convId = conversationId;

        // 1. Find or Create Conversation
        if (!convId) {
            console.log("Creating new conversation...");
            try {
                const newConv = await Conversation.create({ userId, chatbotId, title: question.substring(0, 30) + "..." });
                convId = newConv._id;
                console.log("Created Conversation ID:", convId);
            } catch (err) {
                console.error("Error creating conversation:", err);
                throw new Error("Failed to create conversation");
            }
        }

        // 2. Save User Message
        console.log("Saving user message to DB...");
        await Message.create({
            conversationId: convId,
            role: 'user',
            content: question
        });

        // 3. Fetch History (Revise from last chat)
        // Get last 10 messages (excluding the one we just saved? No, usually fine to include or exclude. 
        // We just saved it, so it will be in the list. We want PREVIOUS history.)
        const history = await Message.find({ conversationId: convId })
            .sort({ timestamp: 1 })
            .limit(20); // Last 20 messages

        const historyText = history.map(m => `${m.role === 'user' ? 'User' : 'AI'}: ${m.content}`).join("\n");

        // 4. Generate Embedding
        console.log("Generating embedding...");
        const questionEmbedding = await generateEmbedding(question);

        // 5. Semantic Search (Supabase)
        console.log("Searching documents...");
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: questionEmbedding,
            match_threshold: 0.1,
            match_count: 50,
            filter: { chatbot_id: chatbotId } // Pass filter for DB-side filtering
        });

        if (error) {
            console.error("Supabase RPC Error:", error);
            throw new Error("Database search failed");
        }

        console.log(`Found ${documents.length} raw matches. Filtering for chatbotId: ${chatbotId}`);
        // Log first match metadata to debug
        if (documents.length > 0) {
            console.log("Top Match Metadata:", documents[0].metadata);
        }

        const relevantDocs = documents.filter(doc =>
            doc.metadata && doc.metadata.chatbot_id === chatbotId
        );

        let answer = "I don't have enough information on this topic.";
        let sources = [];

        if (relevantDocs.length > 0) {
            const contextText = relevantDocs.map(doc => doc.content).join("\n\n---\n\n");
            sources = [...new Set(relevantDocs.map(doc => doc.metadata.url))];

            const prompt = `
            You are a helpful and detailed institutional assistant.
            Use the following Context to answer the users Latest Question.
            
            CONTEXT:
            ${contextText}

            CONVERSATION HISTORY:
            ${historyText}

            LATEST QUESTION: ${question}

            Provide a professional, clear response based on the Context.
            `;

            console.log("Generating AI Answer...");
            answer = await generateAnswer(prompt);
        } else {
            // Fallback if no docs found, but maybe history has context?
            // For now, simple fallback.
            console.log("No relevant documents found. Using fallback.");
        }

        // 6. Save AI Message
        console.log("Saving AI message...");
        await Message.create({
            conversationId: convId,
            role: 'ai',
            content: answer,
            sources: sources
        });

        // 7. Update Last Updated
        await Conversation.findByIdAndUpdate(convId, { lastUpdated: new Date() });

        console.log("Success! Sending response.");
        res.json({
            answer,
            sources,
            conversationId: convId
        });

    } catch (error) {
        console.error("CRITICAL CHAT ERROR:", error);
        res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
}

// Deprecated: Old history method
export async function getChatHistory(req, res) {
    res.status(410).json({ error: "Deprecated. Use /messages/:conversationId" });
}