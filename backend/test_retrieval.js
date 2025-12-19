
import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenerativeAI } from '@google/generative-ai';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function testRetrieval() {
    // 1. Get the latest chatbot ID from the logs (user provided chatbotId in screenshot/logs would be better, but we can query mostly recently created)
    // For now, let's just search everything to see what's there.

    const query = "Tell about iit"; // From user screenshot
    console.log(`🔍 Testing Retrieval for query: "${query}"`);

    // A. Generate Embedding
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
    const result = await model.embedContent(query);
    const embedding = result.embedding.values;

    console.log(`✅ Generated embedding (len: ${embedding.length})`);

    // B. Direct Table Check (Is there ANY data?)
    const { data: rawDocs, error: rawError } = await supabase
        .from('documents')
        .select('metadata, content')
        .limit(3);

    if (rawError) console.error("❌ Error reading valid docs:", rawError);
    else console.log("📊 Sample Raw Docs in DB:", JSON.stringify(rawDocs, null, 2));


    // C. Test RPC Call (The one failing)
    // We need a chatbot_id from the raw docs to test filtering
    const sampleChatbotId = rawDocs?.[0]?.metadata?.chatbot_id;
    console.log(`🧪 Testing filter with chatbot_id: ${sampleChatbotId}`);

    const { data: matches, error: rpcError } = await supabase.rpc('match_documents', {
        query_embedding: embedding,
        match_threshold: 0.1, // Very low to see whatever comes back
        match_count: 5
    });

    if (rpcError) {
        console.error("❌ RPC Error:", rpcError);
    } else {
        console.log(`✅ RPC returned ${matches.length} matches.`);
        matches.forEach(m => {
            console.log(` - [${m.similarity.toFixed(4)}] ${m.content.substring(0, 50)}... (Meta: ${JSON.stringify(m.metadata)})`);
        });
    }
}

testRetrieval();
