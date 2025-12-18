// This model file exports the ChatLog model (ES module). When run with
// `node src/models/chatlog.js --seed` it will create a sample document
// so you can observe the collection in MongoDB.

// Import the connected mongoose instance so the model is registered on
// an active connection (src/config/mongoClient.js performs the connect).
import mongoose from '../config/mongoClient.js';

const ChatLogSchema = new mongoose.Schema({
    userQuestion: { type: String, required: true },
    aiAnswer: { type: String, required: true },
    sources: [String], // Store the URLs used
    timestamp: { type: Date, default: Date.now }
});

const ChatLog = mongoose.model('ChatLog', ChatLogSchema);

// Optional: if the file is executed directly with `--seed`, create a sample doc
/* async function seedSample() {
    try {
        const sample = new ChatLog({
            userQuestion: 'Sample question for seeding',
            aiAnswer: 'Sample answer stored for verification',
            sources: ['https://example.com']
        });
        const saved = await sample.save();
        console.log('Seeded ChatLog:', saved);
    } catch (err) {
        console.error('Error seeding ChatLog:', err);
    } finally {
        // Close mongoose connection gracefully
        await mongoose.connection.close();
        process.exit(0);
    }
}

if (process.argv.includes('--seed')) {
    // Run seeding when invoked with --seed
    seedSample();
} */

export default ChatLog;