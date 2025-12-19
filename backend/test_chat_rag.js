
import axios from 'axios';

const API_URL = 'http://localhost:3000/api/chat';

// Use the ID found in the database during previous step
const CHATBOT_ID = '6944c88ae7f3a353aa4de44f'; // Valid from Step 601
const USER_ID = 'test-crawl-user';

async function testChat() {
    console.log(`🤖 Testing RAG Chat for Bot: ${CHATBOT_ID}`);
    const payload = {
        question: "Tell me about IIT", // Question relevant to the context found
        userId: USER_ID,
        chatbotId: CHATBOT_ID
    };

    try {
        const res = await axios.post(API_URL, payload);
        console.log("✅ Chat Response Status:", res.status);
        console.log("📝 Answer:", res.data.answer);
        console.log("📚 Sources:", res.data.sources);

        if (res.data.answer.includes("I don't have enough information")) {
            console.error("❌ RAG Failed: Still returning fallback response.");
        } else {
            console.log("🚀 RAG SUCCESS! Context was used.");
        }

    } catch (e) {
        console.error("❌ Chat Request Failed:", e.message);
        if (e.response) console.error("Details:", e.response.data);
    }
}

// Wait for server warm up
setTimeout(testChat, 2000);
