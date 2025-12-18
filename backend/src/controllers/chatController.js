import { generateEmbedding } from '../services/embedder.js';
import { generateAnswer } from '../services/llm.js';
import supabase from '../config/supabaseClient.js';
import ChatLog from '../models/chatlog.js'; // Ensure this import is here

export async function askQuestion(req, res) {
    const { question, userId, chatbotId } = req.body;

    if (!question || !chatbotId) {
        return res.status(400).json({ error: 'Question and ChatbotID required' });
    }

    try {
        const questionEmbedding = await generateEmbedding(question);

        // 1. RETRIEVAL - Increase match_count to 10 for detailed answers
        const { data: documents, error } = await supabase.rpc('match_documents', {
            query_embedding: questionEmbedding,
            match_threshold: 0.4, 
            match_count: 10 // <--- CRITICAL: Change 3 back to 10
        });

        if (error) throw error;

        const relevantDocs = documents.filter(doc => 
            doc.metadata && doc.metadata.chatbot_id === chatbotId
        );

        if (relevantDocs.length === 0) {
            return res.json({ answer: "I don't have enough information on this topic." });
        }

        // 2. CONTEXT BUILDING
        const contextText = relevantDocs.map(doc => doc.content).join("\n\n---\n\n");

        // 3. DETAILED PROMPTING
        const prompt = `
        You are a highly detailed institutional assistant. 
        Answer the question using the context provided. If the answer is not in the context, say you don't know.
        
        INSTRUCTIONS:
        - Provide a comprehensive, multi-paragraph response.
        - Provide proper point wise responses for the question asked if required.
        - Include specific details like departments, names, and programs if mentioned.
        - Use a professional tone.

        CONTEXT:
        ${contextText}

        QUESTION: ${question}
        `;

        const answer = await generateAnswer(prompt);

        // 4. SAVE LOG - Using the correct keys from your ChatLog model
        await ChatLog.create({ 
            userQuestion: question, // Key matches src/models/chatlog.js
            aiAnswer: answer,       // Key matches src/models/chatlog.js
            sources: relevantDocs.map(doc => doc.metadata.url) 
        });
        
        res.json({ 
            answer, 
            sources: [...new Set(relevantDocs.map(doc => doc.metadata.url))] 
        });

    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

export async function getChatHistory(req, res) {
    const { chatbotId } = req.params;
    try {
        const history = await ChatLog.find({ chatbotId }).sort({ createdAt: 1 });
        res.json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
}