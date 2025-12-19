import mongoose from 'mongoose';
import Chatbot from './src/models/chatbot.js';
import dotenv from 'dotenv';
dotenv.config();

// Connect to MongoDB
import fs from 'fs';

mongoose.connect(process.env.MONGODB_URI)
    .then(async () => {
        try {
            const bot = await Chatbot.findOne();
            if (bot) {
                const data = {
                    chatbotId: bot._id.toString(),
                    userId: bot.userId
                };
                fs.writeFileSync('test_ids.json', JSON.stringify(data, null, 2));
                console.log("Written to test_ids.json");
            }
        } catch (err) {
            console.error(err);
        } finally {
            mongoose.connection.close();
        }
    })
    .catch(err => console.error('Connection error', err));
