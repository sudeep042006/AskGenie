import React, { useState, useEffect, useRef } from 'react';
import { Send, Globe, ChevronLeft, MoreVertical, Copy, Share2, Sparkles } from 'lucide-react';
import { chatbotApi } from '../services/api';
import GenieAvatar from './GenieAvatar';

// Helper component for Typewriter effect
const TypewriterText = ({ text, onComplete }) => {
  const [displayedText, setDisplayedText] = useState('');
  const indexRef = useRef(0);

  useEffect(() => {
    // Reset if text changes (new message)
    if (text !== displayedText && indexRef.current === 0) {
      // start typing
    } else if (text !== displayedText.replace(/▋/g, '') && indexRef.current >= text.length) {
      // already done, but strict check? just keep it simple
    }
  }, [text]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayedText((prev) => prev + text.charAt(indexRef.current));
        indexRef.current++;
      } else {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, 15); // Adjust typing speed here

    return () => clearInterval(timer);
  }, [text, onComplete]);

  return <span>{displayedText}{indexRef.current < text.length && <span className="animate-pulse">▋</span>}</span>;
};


const ChatWindow = ({ chatbot, userId, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false); // "Thinking" state
  const [answering, setAnswering] = useState(false); // "Speaking/Typing" state
  const scrollRef = useRef();

  // Scroll to bottom whenever messages or answering state changes
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, answering, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading || answering) return;

    const userMsg = { role: 'user', text: input, timestamp: new Date() };
    setMessages([...messages, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const chatbotId = chatbot._id || chatbot.id || chatbot.chatbotId;
      const res = await chatbotApi.sendMessage({
        chatbotId,
        question: userMsg.text,
        userId
      });

      // Backend returns full answer. We'll simulate streaming.
      const rawAnswer = res.data.answer || res.data?.answer || res.data;
      const sources = res.data.sources || [];

      setLoading(false);
      setAnswering(true); // Start typewriter effect

      // We add the message but with a flag to render differently or use a dedicated "latest AI" logic
      // Actually simpler: Add the message to the list, but let the Typewriter component handle the rendering of the LAST message if it's AI
      const aiMsg = {
        role: 'ai',
        text: rawAnswer,
        sources: sources,
        timestamp: new Date(),
        isTyping: true // Mark as typing initially
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (err) {
      console.error(err);
      setLoading(false);
      const errorMsg = {
        role: 'ai',
        text: 'Sorry, I encountered an error. Please try again.',
        sources: [],
        isError: true,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleTypingComplete = (index) => {
    setAnswering(false); // Done typing
    setMessages(prev => prev.map((msg, i) => i === index ? { ...msg, isTyping: false } : msg));
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col w-full max-w-5xl h-[85vh] bg-gradient-to-br from-slate-900/90 via-slate-800/80 to-slate-900/90 backdrop-blur-[50px] border border-white/10 rounded-[2rem] shadow-2xl relative overflow-hidden">

      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-50"></div>

      {/* --- CHAT HEADER --- */}
      <div className="p-5 border-b border-white/5 flex justify-between items-center bg-white/5 backdrop-blur-md z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-full transition-all text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            {/* Header Genie Avatar - smaller */}
            <GenieAvatar state={loading ? 'thinking' : answering ? 'speaking' : 'idle'} size="sm" />
            <div>
              <h3 className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-purple-300 uppercase tracking-wider text-xs">
                {chatbot.name || 'Chat Bot'}
              </h3>
              <p className="text-[10px] text-gray-400 flex items-center gap-1">
                <Globe size={10} /> {chatbot.url?.replace(/^https?:\/\//, '').split('/')[0]}
              </p>
            </div>
          </div>
        </div>
        <button className="p-2 hover:bg-white/10 rounded-full text-gray-400">
          <MoreVertical size={18} />
        </button>
      </div>

      {/* --- MESSAGES AREA --- */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8 custom-scrollbar scroll-smooth">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full opacity-60">
            <GenieAvatar state="idle" size="lg" />
            <p className="mt-4 text-sm text-gray-400 font-medium">Summon me with a question...</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isLast = idx === messages.length - 1;
          return (
            <div key={idx} className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>

              {/* Genie Avatar next to AI message */}
              {msg.role === 'ai' && (
                <div className="mr-4 mt-2 hidden sm:block">
                  <GenieAvatar
                    state={msg.isTyping && isLast ? 'speaking' : 'idle'}
                    size="sm"
                  />
                </div>
              )}

              <div className={`max-w-[80%] sm:max-w-[70%] group relative`}>
                <div className={`p-5 rounded-2xl text-[15px] leading-relaxed shadow-lg backdrop-blur-sm ${msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-tr-none'
                    : msg.isError
                      ? 'bg-red-500/10 border border-red-500/20 text-red-200 rounded-tl-none'
                      : 'bg-slate-800/60 border border-white/10 text-gray-100 rounded-tl-none'
                  }`}>
                  {msg.role === 'ai' && msg.isTyping && isLast ? (
                    <TypewriterText text={msg.text} onComplete={() => handleTypingComplete(idx)} />
                  ) : (
                    <p>{msg.text}</p>
                  )}
                </div>

                {/* Sources Chips */}
                {msg.sources && msg.sources.length > 0 && !msg.isTyping && (
                  <div className="mt-3 flex flex-wrap gap-2 animate-in fade-in duration-500">
                    {msg.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-[10px] bg-slate-900/50 hover:bg-slate-800 border border-white/10 hover:border-indigo-500/50 px-3 py-1.5 rounded-full text-indigo-300 hover:text-indigo-200 transition-all duration-200"
                      >
                        <Globe size={10} />
                        Source {i + 1}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking State */}
        {loading && (
          <div className="flex justify-start w-full animate-in fade-in duration-300">
            <div className="mr-4 mt-1">
              <GenieAvatar state="thinking" size="sm" />
            </div>
            <div className="flex items-center gap-1 px-4 py-3 rounded-2xl bg-slate-800/40 border border-white/5 rounded-tl-none">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100"></span>
              <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-200"></span>
            </div>
          </div>
        )}

        <div ref={scrollRef} />
      </div>

      {/* --- INPUT AREA --- */}
      <div className="p-6 bg-slate-900/90 border-t border-white/5 backdrop-blur-xl">
        <div className="relative flex items-end gap-3 max-w-4xl mx-auto">

          <div className="flex-1 relative group">
            {/* Glow effect on focus */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within:opacity-70 blur transition duration-500"></div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || answering}
              placeholder={loading || answering ? "Genie is answering..." : "Ask anything about the website..."}
              rows="1"
              className="relative w-full px-5 py-4 bg-slate-950 text-white placeholder:text-slate-500 rounded-2xl border border-white/10 focus:outline-none focus:border-transparent focus:ring-0 resize-none disabled:opacity-50 disabled:cursor-not-allowed shadow-inner"
              style={{
                minHeight: '56px',
                maxHeight: '150px'
              }}
            />
          </div>

          <button
            onClick={handleSend}
            disabled={loading || answering || !input.trim()}
            className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-lg ${!loading && !answering && input.trim()
                ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 hover:shadow-purple-500/40 hover:scale-105 active:scale-95 text-white'
                : 'bg-slate-800 text-slate-600 cursor-not-allowed'
              }`}
          >
            {loading || answering ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <Sparkles size={22} className={input.trim() ? "animate-pulse" : ""} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;