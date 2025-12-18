import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import ChatWindow from './components/ChatWindow';
import { chatbotApi } from './services/api';

function App() {
  const [bots, setBots] = useState([]);
  const [activeBot, setActiveBot] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // User ID - in production, this would come from authentication
  const userId = "cb1ed123-08da-4562-b36b-299f726eabe0";

  // Fetch user's chatbots on mount
  useEffect(() => {
    const fetchBots = async () => {
      try {
        setLoading(true);
        const res = await chatbotApi.fetchUserBots(userId);
        setBots(res.data || []);
        setError(null);
      } catch (err) {
        console.error('Failed to load bots:', err);
        setError('Failed to load chatbots. Please refresh.');
        setBots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBots();
  }, [userId]);

  const handleCreateBot = async (url) => {
    try {
      setError(null);
      const res = await chatbotApi.createBot({ 
        url, 
        userId, 
        name: url.split('/')[2] || "New Bot" 
      });
      
      // Backend returns { message, chatbotId, bot }
      const createdBot = res.data?.bot || { 
        _id: res.data?.chatbotId, 
        url, 
        name: 'New Bot',
        status: 'processing',
        userId
      };
      
      // Add new bot to list at the top
      setBots(prev => [createdBot, ...prev]);
      
      // Navigate to the new bot
      setActiveBot(createdBot);
      
      // Optionally show success message
      console.log('✅ Chatbot created:', createdBot._id);
    } catch (err) {
      console.error('Create bot error:', err);
      setError('Failed to create chatbot. Please check the URL and try again.');
      alert('Failed to create chatbot. Check the console for details.');
    }
  };

  const handleDeleteBot = async (botId) => {
    try {
      setError(null);
      await chatbotApi.deleteBot(botId);
      
      // Remove bot from list
      setBots(prev => prev.filter(bot => bot._id !== botId));
      
      // If the deleted bot was active, go back to hero
      if (activeBot?._id === botId) {
        setActiveBot(null);
      }
      
      console.log('🗑️ Chatbot deleted:', botId);
    } catch (err) {
      console.error('Delete bot error:', err);
      setError('Failed to delete chatbot. Please try again.');
    }
  };

  return (
    <div className="relative h-screen w-screen flex overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      {/* Animated background gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 w-full h-full flex flex-col">
        <Navbar />
        
        <div className="flex flex-1 overflow-hidden">
          <Sidebar 
            bots={bots} 
            onSelectBot={(bot) => setActiveBot(bot)} 
            onNewChat={() => setActiveBot(null)}
            onDeleteBot={handleDeleteBot}
          />

          <main className="flex-1 flex items-center justify-center p-10 relative overflow-auto">
            {/* Error Banner */}
            {error && (
              <div className="absolute top-6 right-6 max-w-sm animate-in fade-in slide-in-from-top-4 duration-300 bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/40 backdrop-blur-xl text-red-200 px-6 py-4 rounded-2xl text-sm font-medium z-50">
                <div className="flex items-start justify-between gap-4">
                  <span>{error}</span>
                  <button 
                    onClick={() => setError(null)} 
                    className="text-red-400 hover:text-red-300 transition-colors text-lg leading-none"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
            
            {activeBot ? (
              <ChatWindow 
                chatbot={activeBot} 
                userId={userId} 
                onBack={() => setActiveBot(null)} 
              />
            ) : (
              <Hero onCreate={handleCreateBot} />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default App;