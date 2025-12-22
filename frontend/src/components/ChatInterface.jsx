import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Plus, History, MessageSquare, ChevronLeft, MoreVertical } from 'lucide-react';
import { chatbotApi } from '../services/api';
import { useAuth } from '../context/AuthContext';
import GenieAvatar from './GenieAvatar';
import Loader from './Loader';

// Reuse Typewriter for consistency
const TypewriterText = ({ text, onComplete }) => {
    const [displayedText, setDisplayedText] = useState('');
    const indexRef = useRef(0);

    useEffect(() => {
        // If text update is a true appendage, we could optimize, but simple "reset if new" text logic:
        // Actually, we want to type out the *full* text if it's new. 
        // But since we are mounting a new message component, just running from 0 is fine.
        // Speed up slightly for long text
        const speed = text.length > 500 ? 5 : 15;

        const timer = setInterval(() => {
            if (indexRef.current < text.length) {
                setDisplayedText((prev) => prev + text.charAt(indexRef.current));
                indexRef.current++;
            } else {
                clearInterval(timer);
                if (onComplete) onComplete();
            }
        }, speed);

        return () => clearInterval(timer);
    }, [text, onComplete]);

    return <span>{displayedText}{indexRef.current < text.length && <span className="animate-pulse">▋</span>}</span>;
};

const ChatInterface = () => {
    const { chatbotId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false); // New State
    const [answering, setAnswering] = useState(false);
    const [sidebarOpen, setSidebarOpen] = useState(false); // For mobile/history drawer
    const [conversations, setConversations] = useState([]); // History list

    const scrollRef = useRef();

    // 1. Initial Load: Fetch Conversations for this Bot
    useEffect(() => {
        if (user?.id && chatbotId) {
            loadConversations();
        }
    }, [chatbotId, user]);

    const loadConversations = async () => {
        setHistoryLoading(true);
        try {
            const res = await chatbotApi.getConversations(chatbotId, user.id);
            const convs = res.data || [];
            setConversations(convs);

            // Successfully grabbed history
            if (convs.length > 0) {
                // Load the most recent one by default
                selectConversation(convs[0]);
            } else {
                setActiveConversation(null);
                setMessages([]);
            }
        } catch (err) {
            console.error("Failed to load history", err);
        } finally {
            setHistoryLoading(false);
        }
    };

    const selectConversation = async (conv) => {
        try {
            setActiveConversation(conv);
            // Fetch messages
            const res = await chatbotApi.getMessages(conv._id);
            setMessages(res.data || []);
            // Close sidebar if mobile
            setSidebarOpen(false);
        } catch (err) {
            console.error("Failed to load messages", err);
        }
    };

    const handleNewChat = () => {
        setActiveConversation(null);
        setMessages([]);
        setSidebarOpen(false);
    };

    // 2. Sending Messages
    const handleSend = async () => {
        if (!input.trim() || loading || answering) return;

        const textPayload = input;
        setInput('');
        setLoading(true);

        // Optimistic User Message
        const tempUserMsg = { role: 'user', content: textPayload, timestamp: new Date() };
        setMessages(prev => [...prev, tempUserMsg]);

        try {
            // API Call
            // conversationId is null if new, backend handles creation
            const res = await chatbotApi.sendMessage({
                chatbotId,
                userId: user.id,
                question: textPayload,
                conversationId: activeConversation?._id
            });

            const { answer, sources, conversationId } = res.data;

            setLoading(false);
            setAnswering(true);

            // If we just created a conversation, update state
            if (!activeConversation || activeConversation._id !== conversationId) {
                // It's new! Refresh list to show in sidebar
                loadConversations(); // Logic inside will detect but we want to stay on this new one
                // Manually set active for now to avoid jump
                setActiveConversation({ _id: conversationId, title: textPayload });
            }

            // Add AI Message
            const aiMsg = {
                role: 'ai',
                content: answer,
                sources: sources,
                timestamp: new Date(),
                isTyping: true
            };
            setMessages(prev => [...prev, aiMsg]);

        } catch (err) {
            console.error(err);
            setLoading(false);
            // Add error message
            setMessages(prev => [...prev, {
                role: 'ai',
                content: "Sorry, I encountered an error. Please try again.",
                isError: true
            }]);
        }
    };

    // Auto-scroll
    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, loading, answering]);

    return (
        <div className="flex h-full w-full bg-slate-950 text-white overflow-hidden relative">

            {/* --- HISTORY SIDEBAR (Optional/Collapsible) --- */}
            <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 border-r border-white/5 transform transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 lg:flex lg:flex-col`}>
                <div className="p-4 pt-20 md:pt-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-bold text-slate-400 text-xs uppercase tracking-wider">Chat History</h3>
                    <button onClick={handleNewChat} className="p-2 bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {historyLoading ? (
                        <div className="space-y-3 px-2 mt-2">
                            <Loader type="line" count={1} className="h-6 w-3/4 opacity-20" />
                            <Loader type="line" count={1} className="h-6 w-1/2 opacity-10" />
                            <Loader type="line" count={1} className="h-6 w-2/3 opacity-15" />
                        </div>
                    ) : conversations.map(conv => (
                        <button
                            key={conv._id}
                            onClick={() => selectConversation(conv)}
                            className={`w-full text-left p-3 rounded-xl text-sm truncate transition-all ${activeConversation?._id === conv._id
                                ? 'bg-white/10 text-white'
                                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                                }`}
                        >
                            {conv.title || "New Conversation"}
                        </button>
                    ))}
                </div>
            </div>

            {/* --- MAIN CHAT AREA --- */}
            <div className="flex-1 flex flex-col relative bg-gradient-to-br from-slate-950 via-slate-900 to-black w-full">

                {/* Toggle History Button (Mobile) */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className={`absolute top-6 left-20 z-40 lg:hidden p-2 rounded-lg bg-slate-800 text-slate-400`}
                >
                    <History size={20} />
                </button>

                {/* Messages Container */}
                <div className="flex-1 overflow-y-auto px-4 py-6 md:px-20 lg:px-40 space-y-8 custom-scrollbar scroll-smooth">

                    {/* Empty State */}
                    {messages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full opacity-50 animate-in zoom-in duration-500">
                            <GenieAvatar state="idle" size="lg" />
                            <h2 className="mt-6 text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
                                Ask Genie
                            </h2>
                            <p className="text-slate-500 mt-2">New conversation started</p>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg, idx) => {
                        const isLast = idx === messages.length - 1;
                        const isAI = msg.role === 'ai';
                        return (
                            <div key={idx} className={`flex w-full ${isAI ? 'justify-start' : 'justify-end'} animate-in fade-in slide-in-from-bottom-4 duration-300`}>

                                {/* Avatar for AI */}
                                {isAI && (
                                    <div className="mr-4 mt-1 hidden sm:block">
                                        <GenieAvatar state={msg.isTyping && isLast ? 'speaking' : 'idle'} size="sm" />
                                    </div>
                                )}

                                <div className={`max-w-[85%] md:max-w-[75%] px-6 py-4 rounded-3xl text-[15px] leading-7 shadow-sm ${isAI
                                    ? 'bg-slate-800/50 text-slate-200 border border-white/5 rounded-tl-sm whitespace-pre-line text-justify'
                                    : 'bg-indigo-600 text-white rounded-tr-sm shadow-indigo-500/20'
                                    }`}>
                                    {isAI && msg.isTyping && isLast ? (
                                        <TypewriterText text={msg.content || msg.aiAnswer || ""} onComplete={() => setAnswering(false)} />
                                    ) : (
                                        // Handle schema differences (msg.content from Message model, msg.aiAnswer from legacy?)
                                        // We normalized to 'content' in frontend logic above
                                        <span>{msg.content}</span>
                                    )}

                                    {/* Sources */}
                                    {isAI && msg.sources && msg.sources.length > 0 && !msg.isTyping && (
                                        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap gap-2">
                                            {msg.sources.map((src, i) => (
                                                <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="text-[11px] px-2 py-1 rounded bg-black/20 hover:bg-black/40 text-indigo-300 transition-colors">
                                                    Source {i + 1}
                                                </a>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex justify-start w-full animate-in fade-in">
                            <div className="mr-4 mt-1"><GenieAvatar state="thinking" size="sm" /></div>
                            <div className="px-6 py-4 bg-slate-800/50 rounded-3xl rounded-tl-sm border border-white/5">
                                <span className="flex gap-1.5">
                                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" />
                                    <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100" />
                                    <span className="w-1.5 h-1.5 bg-pink-400 rounded-full animate-bounce delay-200" />
                                </span>
                            </div>
                        </div>
                    )}

                    <div ref={scrollRef} className="h-4" />
                </div>

                {/* Input Area - Added extra pb for mobile safety */}
                <div className="p-4 pb-8 md:p-6 bg-slate-950 border-t border-white/5">
                    <div className="max-w-4xl mx-auto relative group">
                        {/* Magic focus glow */}
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-0 group-focus-within:opacity-50 blur transition duration-500"></div>

                        <div className="relative flex items-end gap-2 bg-slate-900 p-2 rounded-3xl border-none shadow-xl">
                            <button onClick={handleNewChat} className="p-3 text-slate-400 hover:text-indigo-400 transition-colors hidden sm:block">
                                <Plus size={20} />
                            </button>

                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                                placeholder="Ask Genie..."
                                disabled={loading || answering}
                                className="flex-1 bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-slate-500 py-3 max-h-32 min-h-[48px] resize-none"
                                rows={1}
                            />

                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || loading || answering}
                                className={`p-3 rounded-2xl transition-all ${input.trim()
                                    ? 'bg-indigo-600 text-white hover:bg-indigo-500 hover:scale-105 shadow-lg shadow-indigo-500/30'
                                    : 'bg-slate-800 text-slate-600'
                                    }`}
                            >
                                <Send size={20} className={input.trim() ? 'ml-0.5' : ''} />
                            </button>
                        </div>
                        <p className="text-center text-[10px] text-slate-600 mt-2">
                            Ask Genie can make mistakes. Verify important information.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChatInterface;
