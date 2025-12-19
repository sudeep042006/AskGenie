// test_crawl.js
import axios from 'axios';

const API_URL = 'http://localhost:3000';
const TEST_URL = 'https://example.com'; // Simple, fast to crawl

async function testCrawl() {
    console.log(`🤖 Testing Chatbot Creation (Crawling ${TEST_URL})...`);
    try {
        const payload = {
            url: TEST_URL,
            userId: "test-crawl-user",
            name: "Test Crawl Bot"
        };
        const res = await axios.post(`${API_URL}/api/chatbot/create`, payload);
        console.log("✅ Chatbot Created Successfully:", res.data);
    } catch (e) {
        if (e.response) {
            console.error("❌ API Error:", e.response.status, e.response.data);
        } else {
            console.error("❌ Network/Client Error:", e.message);
        }
    }
}

// Give server time to start
setTimeout(testCrawl, 3000);
