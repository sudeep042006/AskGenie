import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY;

async function checkModels() {
    console.log("🔍 Asking Google for available models...");
    
    try {
        // Direct fetch request to list models
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await response.json();

        if (data.error) {
            console.error("\n❌ API KEY ERROR:");
            console.error(data.error.message);
            return;
        }

        if (!data.models) {
            console.error("\n❌ NO MODELS FOUND. Your key might be new/restricted.");
            return;
        }

        console.log("\n✅ AVAILABLE MODELS FOR YOU:");
        console.log("---------------------------");
        
        // Filter for "generateContent" models (the ones we need)
        const chatModels = data.models.filter(m => m.supportedGenerationMethods.includes("generateContent"));
        
        chatModels.forEach(m => {
            console.log(`Model Name: ${m.name.replace('models/', '')}`); // This is the string you need!
        });

        console.log("---------------------------");
        console.log("👉 Pick one of the names above and put it in src/services/llm.js");

    } catch (error) {
        console.error("Network Error:", error);
    }
}

checkModels();