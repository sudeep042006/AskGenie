import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema({
    userId: { type: String, required: true, index: true },
    chatbotId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chatbot', required: true, index: true },
    title: { type: String, default: 'New Conversation' },
    lastUpdated: { type: Date, default: Date.now }
});

// Update timestamp on save hook removed to prevent potential environment-specific TypeErrors. 
// We handle lastUpdated updates manually in the controller.

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
