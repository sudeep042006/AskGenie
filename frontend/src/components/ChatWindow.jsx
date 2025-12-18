import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, ChevronLeft, MoreVertical, Copy, Share2 } from 'lucide-react';
import { chatbotApi } from '../services/api';

const ChatWindow = ({ chatbot, userId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = { role: 'user', text: input, timestamp: new Date() };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatbotId = chatbot._id || chatbot.id || chatbot.chatbotId;
      const res = await chatbotApi.askQuestion(chatbotId, input, userId);

      const aiMsg = { 
        role: 'ai', 
        text: res.data.answer || res.data?.answer || res.data,
        sources: res.data.sources || [],
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      const errorMsg = {
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        sources: [],
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl h-[85vh] bg-gradient-to-b from-white/8 to-white/3 backdrop-blur-[50px] border border-white/15 rounded-[2.5rem] shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] overflow-hidden relative">
      
      {/* --- CHAT HEADER --- */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-white/5 to-transparent backdrop-blur-md">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack} 
            className="p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <div>
            <h3 className="font-bold text-teal-300 uppercase tracking-tight text-sm">
              {chatbot.name || 'Chat Bot'}
            </h3>
            <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
              <Globe size={12} /> {chatbot.url?.replace('https://', '').replace('http://', '').split('/')[0]}
            </p>
          </div>
        </div>
        <button className="p-2.5 hover:bg-white/10 rounded-full transition-all duration-200">
          <MoreVertical size={18} className="text-gray-400" />
        </button>
      </div>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe size={28} className="text-teal-400" />
              </div>
              <p className="text-gray-400 text-sm">Start a conversation...</p>
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <div className={`max-w-[75%] group`}>
              <div className={`p-4 rounded-2xl transition-all duration-200 ${
                msg.role === 'user' 
                  ? 'bg-gradient-to-r from-teal-500/80 to-cyan-500/70 text-white rounded-tr-none shadow-lg hover:shadow-xl' 
                  : msg.isError
                  ? 'bg-red-500/20 border border-red-500/40 text-red-300 rounded-tl-none'
                  : 'bg-white/10 border border-white/20 backdrop-blur-md text-gray-100 rounded-tl-none hover:bg-white/15'
              }`}>
                <p className="text-[15px] leading-relaxed break-words">{msg.text}</p>
              </div>
              
              {/* Sources Chips */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {msg.sources.map((src, i) => (
                    <a 
                      key={i} 
                      href={src} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] bg-teal-500/20 hover:bg-teal-500/40 border border-teal-500/40 hover:border-teal-500/70 px-3 py-1.5 rounded-full text-teal-300 hover:text-teal-200 transition-all duration-200 backdrop-blur-sm"
                    >
                      <Globe size={10} />
                      Source {i + 1}
                    </a>
                  ))}
                </div>
              )}

              {/* Message Actions */}
              {msg.role === 'ai' && (
                <div className="mt-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all flex items-center gap-1">
                    <Copy size={12} /> Copy
                  </button>
                  <button className="text-xs px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-400 hover:text-white transition-all flex items-center gap-1">
                    <Share2 size={12} /> Share
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start animate-in fade-in">
            <div className="flex items-center gap-2 p-4 rounded-2xl bg-white/10 border border-white/20 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce"></div>
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-100"></div>
                <div className="w-2 h-2 rounded-full bg-teal-400 animate-bounce delay-200"></div>
              </div>
              <span className="text-sm text-gray-300">Genie is thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={scrollRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-6 bg-gradient-to-t from-white/5 to-transparent border-t border-white/10 backdrop-blur-md">
        <div className="relative flex items-end gap-3 group">
          <div className="flex-1 relative">
            {/* Input Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-teal-500/0 via-cyan-500/10 to-purple-500/0 rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 -z-10"></div>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask anything about the website..."
              rows="1"
              className="w-full px-6 py-4 rounded-2xl bg-white/10 border border-white/20 text-white placeholder:text-gray-500 focus:outline-none focus:border-teal-500/50 focus:bg-white/15 focus:ring-0 transition-all duration-200 resize-none backdrop-blur-sm"
              style={{
                maxHeight: '120px',
                minHeight: '52px',
                overflow: 'auto'
              }}
            />
          </div>

          <button 
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 transform ${
              !loading && input.trim()
                ? 'bg-gradient-to-br from-teal-500 to-cyan-500 hover:shadow-[0_0_20px_rgba(45,212,191,0.5)] hover:scale-110 active:scale-95 cursor-pointer text-white'
                : 'bg-gray-700/50 text-gray-500 cursor-not-allowed opacity-60'
            }`}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;