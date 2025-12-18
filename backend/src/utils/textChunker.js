/**
 * Splits long text into smaller chunks.
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Size of each chunk in characters (default 500 for memory efficiency)
 * @param {number} overlap - Overlap between chunks in characters (default 100)
 * @returns {Array<string>} Array of text chunks
 */
export function chunkText(text, chunkSize = 500, overlap = 100) {
    if (!text || text.trim().length === 0) {
        return [];
    }

    const chunks = [];
    let start = 0;

    while (start < text.length) {
        const end = start + chunkSize;
        let chunk = text.slice(start, end);

        let step = chunkSize - overlap;

        if (end < text.length) {
            const lastSpace = chunk.lastIndexOf(' ');
            // Only split at space if it's in the latter half of the chunk to avoid getting stuck
            // and ensure we advance by at least 1 character
            if (lastSpace > overlap) {
                chunk = chunk.slice(0, lastSpace);
                step = lastSpace - overlap;
            }
        }

        start += Math.max(1, step); // Ensure we always move forward


        // Only add chunks with at least 10 characters (very minimal filter)
        const trimmedChunk = chunk.trim();
        if (trimmedChunk.length > 10) {
            // Force a new string allocation to avoid holding reference to the huge parent string
            chunks.push((' ' + chunk).slice(1));
        }
    }

    return chunks;
}