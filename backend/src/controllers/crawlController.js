import { crawlWebsite } from '../services/crawler.js';
import { chunkText } from '../utils/textChunker.js';
import { generateEmbedding } from '../services/embedder.js';
import supabase from '../config/supabaseClient.js';
import Chatbot from '../models/chatbot.js';

export async function createChatbot(req, res) {
    const { url, userId, name } = req.body;

    // Fail-safe: allow a test fallback, but prefer explicit userId from frontend
    const effectiveUserId = userId || 'test-user';

    if (!url) {
        return res.status(400).json({ error: "URL is required" });
    }

    try {
        // --- 1. SAVE TO MONGODB FIRST ---
        // Create the record now so we have a valid ID to link from Supabase
        const newBot = await Chatbot.create({
            userId: effectiveUserId,
            url,
            name: name || "New Assistant",
            status: 'processing'
        });

        const chatbotId = newBot._id.toString();
        console.log(`✅ MongoDB Record Created: ${chatbotId}`);

        // --- 2. CRAWL & PROCESS ---
        const pages = await crawlWebsite(url); // expects array of { content, url, title? }

        console.log(`� Processing ${pages.length} pages with embeddings (streaming to prevent memory overflow)...`);

        // Process pages sequentially with immediate memory cleanup
        let totalChunksProcessed = 0;

        for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
            const page = pages[pageIndex];
            // EXTRACT DATA JUST-IN-TIME (Memory Optimization)
            // We are now receiving the raw Firecrawl object to avoid mapping copies
            const content = page.markdown;
            const url = page.metadata?.sourceURL || page.url; // Firecrawl sometimes puts URL in metadata
            const title = page.metadata?.title || "No Title";

            console.log(`   [${pageIndex + 1}/${pages.length}] Processing: ${title}`);

            // Use moderate chunk size (500 chars) and overlap to balance count vs memory
            const chunks = chunkText(content, 500, 100);

            // CRITICAL FIX: Release the large full-text content immediately after chunking
            // This prevents holding the full page string + chunks simultaneously
            if (page.markdown) page.markdown = null; // Clear raw markdown
            if (page.content) page.content = null;   // Clear if alias exists

            // memory guard threshold (bytes) - lower to 2GB to enable earlier GC (assuming 4GB max)
            const MEM_THRESHOLD = 5 * 1024 * 1024 * 1024; // 2GB

            // Parallel processing configuration
            const CONCURRENCY_LIMIT = 5; // Process 5 chunks at a time (speed vs memory trade-off)

            // Create a processing function for individual chunks
            const processChunk = async (chunk) => {
                let currentChunk = chunk;
                let embedding = null;
                try {
                    embedding = await generateEmbedding(currentChunk);
                    // No need to increment counter atomically in JS (single threaded event loop)
                    totalChunksProcessed++;

                    // --- 3. STORE IN SUPABASE WITH chatbotId ---
                    const { error: sbError } = await supabase
                        .from('documents')
                        .insert({
                            content: currentChunk,
                            embedding: embedding,
                            metadata: {
                                chatbot_id: chatbotId, // Linked to MongoDB _id
                                url: url,
                                user_id: effectiveUserId
                            }
                        });

                    if (sbError) {
                        console.error('Supabase insert error (continuing others):', sbError);
                        // We don't stop the whole batch for one chunk error, 
                        // but we could track errors if needed.
                        // For critical failures we might want to flag the bot, 
                        // but let's try to save as much as possible.
                    }
                } catch (chunkError) {
                    console.error(`❌ Error processing chunk in ${url}:`, chunkError.message || chunkError);
                } finally {
                    embedding = null;
                    currentChunk = null;
                }
            };

            // Process chunks in parallel batches using p-limit (dynamically imported)
            const pLimit = (await import('p-limit')).default;
            const limit = pLimit(CONCURRENCY_LIMIT);

            const tasks = chunks.map(chunk => limit(() => processChunk(chunk)));
            await Promise.all(tasks);

            // Force GC between pages
            if (global.gc) {
                try { global.gc(); } catch (e) { /* ignore */ }
            }

            // Clear page object completely to allow garbage collection
            pages[pageIndex] = null;

            // Small delay between pages
            if (pageIndex < pages.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }

        console.log(`✅ Processed ${totalChunksProcessed} chunks from ${pages.length} pages`);

        // --- 4. UPDATE STATUS IN MONGODB ---
        newBot.status = 'ready';
        await newBot.save();

        console.log("🚀 Bot Knowledge Indexed Successfully");

        // Return the full MongoDB object to the frontend (includes _id)
        res.status(201).json({
            message: 'Chatbot created successfully!',
            chatbotId,
            bot: newBot
        });

    } catch (error) {
        console.error("❌ Creation Error:", error);
        // If a MongoDB record was created earlier, ensure it's marked as error
        try {
            if (typeof chatbotId !== 'undefined') {
                // reload the bot and mark error if possible
                const maybeBot = await Chatbot.findById(chatbotId);
                if (maybeBot) {
                    maybeBot.status = 'error';
                    await maybeBot.save();
                }
            }
        } catch (e) {
            // ignore secondary errors
            console.error('Error updating bot status after failure:', e);
        }

        res.status(500).json({ error: "Failed to create chatbot" });
    }
}

export async function getChatbots(req, res) {
    // Support userId as path param or query param
    const userId = req.params.userId || req.query.userId;

    if (!userId) {
        return res.status(400).json({ error: 'userId is required' });
    }

    try {
        // Fetch chatbots from MongoDB created by this user
        const bots = await Chatbot.find({ userId }).sort({ createdAt: -1 });
        res.json(bots);
    } catch (error) {
        console.error('Error fetching chatbots:', error);
        res.status(500).json({ error: 'Failed to fetch chatbots' });
    }
}


// Add this at the bottom of src/controllers/crawlController.js
export async function deleteChatbot(req, res) {
    const { chatbotId } = req.params;

    if (!chatbotId) {
        return res.status(400).json({ error: 'chatbotId is required' });
    }

    try {
        // 1. DELETE FROM MONGODB
        const deletedBot = await Chatbot.findByIdAndDelete(chatbotId);

        if (!deletedBot) {
            return res.status(404).json({ error: 'Chatbot not found' });
        }

        console.log(`✅ MongoDB Record Deleted: ${chatbotId}`);

        // 2. DELETE FROM SUPABASE VECTORS
        // We use metadata->>chatbot_id to match the string ID stored in Supabase
        const { error: sbError } = await supabase
            .from('documents')
            .delete()
            .eq('metadata->>chatbot_id', chatbotId);

        if (sbError) {
            console.error('Supabase delete error:', sbError);
            return res.status(500).json({
                error: 'Bot deleted from MongoDB but failed to clear vectors in Supabase',
                details: sbError.message
            });
        }

        console.log(`🗑️ Supabase Vectors Deleted for chatbot: ${chatbotId}`);

        res.json({
            message: 'Chatbot and all associated vectors deleted successfully!',
            chatbotId
        });

    } catch (error) {
        console.error("❌ Deletion Error:", error);
        res.status(500).json({ error: "Internal Server Error during deletion" });
    }
}