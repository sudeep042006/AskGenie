// test_backend.js
import axios from 'axios';
import fs from 'fs';

const API_URL = 'http://localhost:3000';

async function test() {
    console.log("1. Testing Health Check...");
    try {
        const res = await axios.get(API_URL + '/');
        console.log("✅ Health Check Passed:", res.data);
    } catch (e) {
        console.error("❌ Health Check Failed:", e.message);
    }

    console.log("\n2. Testing /api/chat...");
    let payload = {};
    try {
        const ids = JSON.parse(fs.readFileSync('test_ids.json', 'utf8'));
        payload = {
            question: "Hello Test",
            userId: ids.userId,
            chatbotId: ids.chatbotId
        };
        console.log("Payload:", payload);

        const res = await axios.post(API_URL + '/api/chat', payload);
        console.log("✅ Chat Response:", res.data);
    } catch (e) {
        if (e.response) {
            console.error("❌ API Error Status:", e.response.status);
            console.error("❌ API Error Data:", e.response.data); // This is crucial
        } else {
            console.error("❌ Network/Client Error:", e.message);
        }
    }
}

test();
