import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ UPDATED: Using a model from your "Available" list
const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

export async function generateAnswer(prompt) {
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("❌ Gemini Chat Error:", error); 
        return "I'm sorry, I'm having trouble thinking right now.";
    }
}