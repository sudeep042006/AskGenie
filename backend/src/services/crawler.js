import FirecrawlApp from '@mendable/firecrawl-js';
import dotenv from 'dotenv';
import axios from 'axios';
import * as cheerio from 'cheerio';
import TurndownService from 'turndown';

dotenv.config();

const app = new FirecrawlApp({
    apiKey: process.env.FIRECRAWL_API_KEY
});

export async function crawlWebsite(url) {
    console.log(`🔥 Firecrawl starting crawl for: ${url}`);

    try {
        const crawlResponse = await app.crawlUrl(url, {
            limit: 10,
            scrapeOptions: {
                formats: ['markdown'],
            },
        });

        if (!crawlResponse.success) {
            throw new Error(`Crawl failed: ${crawlResponse.error}`);
        }

        if (!crawlResponse.data || crawlResponse.data.length === 0) {
            throw new Error('No content crawled from the URL');
        }

        console.log(`✅ Crawled ${crawlResponse.data.length} pages successfully`);

        const validPages = crawlResponse.data.filter(page => {
            return page.markdown && page.markdown.trim().length > 0;
        });

        if (validPages.length === 0) {
            throw new Error('No content crawled from the URL - all pages were empty');
        }

        console.log(`✅ Using ${validPages.length}/${crawlResponse.data.length} pages with content`);
        return validPages;

    } catch (error) {
        console.error("❌ Firecrawl Error:", error.message);

        // FALLBACK SCRAPER (For Hackathon robustness)
        // Switch to fallback if 402 (Payment) or other API errors
        if (error.message.includes('402') || error.message.includes('quota') || error.message.includes('Payment') || error.message.includes('Rate limit')) {
            console.log("⚠️ Switching to Fallback Scraper (Cheap Mode)...");
            try {
                // 1. Fetch HTML
                const response = await axios.get(url, {
                    headers: {
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
                    },
                    timeout: 15000
                });

                const html = response.data;
                const $ = cheerio.load(html);

                // 2. Clean HTML
                $('script').remove();
                $('style').remove();
                $('nav').remove();
                $('footer').remove();
                $('header').remove();
                $('iframe').remove();

                const title = $('title').text() || url;

                // 3. Convert to Markdown
                const turndownService = new TurndownService();
                const markdown = turndownService.turndown($('body').html());

                if (!markdown || markdown.trim().length < 50) {
                    throw new Error("Fallback content too short or empty");
                }

                console.log("✅ Fallback Scraper Success! (Single Page Mode)");

                // Return in Firecrawl format
                return [{
                    markdown: markdown,
                    url: url,
                    metadata: {
                        title: title,
                        sourceURL: url,
                        description: "Scraped via Fallback"
                    }
                }];

            } catch (fallbackError) {
                console.error("❌ Fallback Scraper Failed:", fallbackError.message);
                // Throw the ORIGINAL Firecrawl error so the user knows why it failed initially
                throw error;
            }
        }

        throw error;
    }
}