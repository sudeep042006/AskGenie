import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ✅ UPDATED: Using a model from your "Available" list
// ✅ UPDATED: Fixed configuration usage
const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    // generationConfig must be here, NOT in generateContent
    generationConfig: {
       /*  maxOutputTokens: 2048, */
        temperature: 0.3,
    }
});

export async function generateAnswer(userPrompt) {
    if (!userPrompt || typeof userPrompt !== "string") {
        console.error("Invalid prompt received:", userPrompt);
        return "I'm sorry, I encountered an internal error.";
    }

    try {
        console.log(`Sending prompt to Gemini (${userPrompt.length} chars)...`);

        // ✅ EXPLICIT CORRECT FORMAT
        const result = await model.generateContent({
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: userPrompt } // Must be an object with 'text' key
                    ]
                }
            ]
        });

        const response = await result.response;
        return response.text();
    } catch (error) {
        console.error("❌ Gemini Chat Error:", error);
        return "I'm sorry, I'm having trouble thinking right now.";
    }
}