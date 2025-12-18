import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';
dotenv.config();

const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
});

export async function crawlWebsite(url) {
    console.log(`🔥 Firecrawl starting crawl for: ${url}`);

    try {
        // FIX: Reduced limit from 100 to 25 pages to prevent memory overflow
        // This is still comprehensive but prevents heap allocation failures
        // Processing: We'll stream/batch process pages to avoid memory buildup
        const crawlResponse = await app.crawlUrl(url, {
            limit: 50, // Reduced from 25 to 10 pages - prevents memory overflow during embedding
            // 10 pages is still comprehensive for knowledge base, but manageable for embeddings
            scrapeOptions: {
                formats: ['markdown'],
            },
            // Note: Firecrawl v2 API doesn't support timeout parameter
            // The API handles timeouts internally
        });

        if (!crawlResponse.success) {
            throw new Error(`Crawl failed: ${crawlResponse.error}`);
        }

        // Check if we got data
        if (!crawlResponse.data || crawlResponse.data.length === 0) {
            throw new Error('No content crawled from the URL');
        }

        console.log(`✅ Crawled ${crawlResponse.data.length} pages successfully`);

        // Return pages with content validation
        // OPTIMIZATION: Do NOT map (copy) the array here. Return the raw data.
        // The controller will extract content one-by-one to save memory.
        const validPages = crawlResponse.data.filter(page => {
            const contentLength = page.markdown ? page.markdown.trim().length : 0;
            const hasContent = contentLength > 0;

            if (!hasContent) {
                console.log(`⚠️  Skipping page with no content: ${page.url}`);
            }
            return hasContent;
        });

        if (validPages.length === 0) {
            console.warn(`⚠️  WARNING: All ${crawlResponse.data.length} pages were empty after crawling`);
            console.warn(`This might be a JavaScript-heavy site. Try using a different URL or specific page.`);
            throw new Error('No content crawled from the URL - all pages were empty');
        }

        console.log(`✅ Using ${validPages.length}/${crawlResponse.data.length} pages with content`);
        return validPages;

    } catch (error) {
        console.error("❌ Firecrawl Error:", error.message);

        // Provide helpful error message for memory issues
        if (error.message.includes('heap') || error.message.includes('memory')) {
            console.error("💡 Tip: The website might be too large. Try a smaller URL (specific page instead of homepage)");
        }

        throw error;
    }
}