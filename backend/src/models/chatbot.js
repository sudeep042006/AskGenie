import mongoose from 'mongoose';

const chatbotSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    url: { type: String, required: true },
    status: { type: String, default: 'ready' }, // 'processing' or 'ready'
    createdAt: { type: Date, default: Date.now }
});

const Chatbot = mongoose.model('Chatbot', chatbotSchema);
export default Chatbot;
console.log("create schema succesfully");