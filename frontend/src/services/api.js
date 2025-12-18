import axios from 'axios';

// Backend runs on port 3000 in this project (see backend/src/index.js)
const API_BASE_URL = 'http://localhost:3000/api';

// Central axios instance with a modest timeout
const api = axios.create({ baseURL: API_BASE_URL });

// Add request interceptor to attach token
api.interceptors.request.use((config) => {
    const storedUser = localStorage.getItem('askgenie_user');
    if (storedUser) {
        const { token } = JSON.parse(storedUser);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const chatbotApi = {
    // Create a new bot / crawl a URL. Backend expects: { url, userId, name }
    createBot: (data) => api.post('/chatbot/create', data),

    // Chat with a bot. Backend expects: { question, userId, chatbotId }
    sendMessage: (data) => api.post('/chat', data),

    // Fetches your previous bots for the "Grid" sidebar
    fetchUserBots: async (userId) => {
        try {
            return await api.get(`/chatbots/${userId}`);
        } catch (err) {
            console.error('fetchUserBots error', err?.response?.data || err.message || err);
            throw err;
        }
    },

    // Delete a chatbot and its vectors from both MongoDB and Supabase
    deleteBot: async (chatbotId) => {
        try {
            return await api.delete(`/chatbot/${chatbotId}`);
        } catch (err) {
            console.error('deleteBot error', err?.response?.data || err.message || err);
            throw err;
        }
    },

    // NOTE: history endpoint is not wired in routes by default; keep a safe wrapper
    getHistory: async (chatbotId) => {
        try {
            return await api.get(`/history/${chatbotId}`);
        } catch (err) {
            console.warn('getHistory not available or failed', err?.response?.data || err.message || err);
            throw err;
        }
    }
};