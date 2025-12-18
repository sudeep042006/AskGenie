import React, { useState } from 'react';
import { Sparkles, Globe, Loader2, Zap, Search } from 'lucide-react';

const Hero = ({ onCreate }) => {
  const [url, setUrl] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [focused, setFocused] = useState(false);

  const handleAction = async () => {
    if (!url) return;
    setIsCreating(true);
    await onCreate(url);
    setIsCreating(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && url && !isCreating) {
      handleAction();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-6xl animate-in fade-in zoom-in duration-700 px-4">
      
      {/* --- ANIMATED BACKGROUND GRADIENTS --- */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-gradient-to-br from-teal-500/20 to-transparent rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-gradient-to-tl from-purple-500/20 to-transparent rounded-full blur-[120px] animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-80 h-80 bg-gradient-to-br from-blue-500/10 to-transparent rounded-full blur-[100px]"></div>
      </div>

      {/* --- MAIN HERO CARD --- */}
      <div className="w-full bg-gradient-to-b from-white/8 to-white/3 backdrop-blur-[50px] border border-white/15 rounded-[3rem] p-12 md:p-24 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] text-center relative overflow-hidden z-10">
        
        {/* Glassmorphic background elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-teal-500/5 via-transparent to-purple-500/5 rounded-[3rem]"></div>
        </div>

        {/* Content */}
        <div className="relative z-20 space-y-8">
          
          {/* Top Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-teal-500/40 backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <Sparkles size={16} className="text-teal-400 animate-pulse" />
                <span className="text-teal-300 text-sm font-bold uppercase tracking-wider">AI Web Crawler Active</span>
              </div>
            </div>
          </div>

          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-6xl md:text-8xl font-extrabold tracking-tighter leading-[1.0]">
              <span className="block">
                <span className="bg-gradient-to-r from-white via-white to-white/70 bg-clip-text text-transparent">
                  Transform Any
                </span>
              </span>
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-cyan-300 via-teal-400 to-blue-400 bg-clip-text text-transparent drop-shadow-lg">
                  Website into AI
                </span>
              </span>
              <span className="block mt-2">
                <span className="bg-gradient-to-r from-purple-400 via-pink-300 to-cyan-300 bg-clip-text text-transparent">
                  Assistant
                </span>
              </span>
            </h1>

            <p className="text-gray-300 text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mt-6">
              Paste your website URL below. AskGenie instantly crawls, analyzes, and deploys a custom AI chatbot trained on your content.
            </p>
          </div>

          {/* Input Section */}
          <div className="mt-12 max-w-2xl mx-auto">
            <div className={`relative group transition-all duration-300 ${focused ? 'scale-105' : ''}`}>
              {/* Input Background Glow */}
              <div className={`absolute inset-0 bg-gradient-to-r from-teal-500/30 via-cyan-500/20 to-purple-500/30 rounded-2xl blur-2xl transition-all duration-300 ${focused ? 'opacity-100' : 'opacity-0'}`}></div>
              
              {/* Input Container */}
              <div className="relative flex items-center gap-2 bg-black/40 backdrop-blur-xl border-2 border-white/10 rounded-2xl px-6 py-4 transition-all duration-300 hover:border-white/20 focus-within:border-teal-500/60">
                
                {/* Icon */}
                <Globe className={`transition-all duration-300 ${focused ? 'text-teal-400' : 'text-teal-500/50'}`} size={24} />
                
                {/* Input */}
                <input
                  type="text"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyPress={handleKeyPress}
                  placeholder="Paste your website URL here... (e.g., example.com)"
                  className="flex-1 bg-transparent text-white text-lg placeholder:text-gray-500 outline-none"
                />
              </div>
            </div>

            {/* Action Button */}
            <div className="mt-6 flex gap-4">
              <button
                onClick={handleAction}
                disabled={isCreating || !url}
                className={`flex-1 relative group overflow-hidden rounded-2xl px-8 py-4 font-bold text-lg transition-all duration-300 transform ${
                  url && !isCreating
                    ? 'bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:shadow-[0_0_40px_rgba(45,212,191,0.4)] hover:scale-105 active:scale-95 cursor-pointer text-white'
                    : 'bg-gray-700/50 text-gray-400 cursor-not-allowed opacity-60'
                }`}
              >
                {/* Shimmer effect */}
                {url && !isCreating && (
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                )}
                
                <div className="relative flex items-center justify-center gap-2">
                  {isCreating ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Creating Chatbot...</span>
                    </>
                  ) : (
                    <>
                      <Zap size={20} />
                      <span>Create Chatbot</span>
                    </>
                  )}
                </div>
              </button>

              {/* Secondary Action */}
              <button className="hidden md:flex items-center justify-center w-14 h-14 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 text-white transition-all duration-300 hover:bg-white/10 group">
                <Search size={20} className="group-hover:scale-110 transition-transform" />
              </button>
            </div>

            {/* Helper Text */}
            <p className="mt-6 text-sm text-gray-400">
              Powered by <span className="text-teal-300 font-semibold">Firecrawl</span>, <span className="text-cyan-300 font-semibold">Supabase</span>, and <span className="text-blue-300 font-semibold">Gemini AI</span>
            </p>
          </div>

          {/* Feature Pills */}
          <div className="mt-16 flex flex-wrap justify-center gap-3">
            {[
              { icon: '⚡', text: 'Instant Deployment' },
              { icon: '🔍', text: 'Semantic Search' },
              { icon: '💬', text: 'AI Responses' },
              { icon: '📊', text: 'Source Links' }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-gray-300 text-sm font-medium hover:border-white/20 hover:bg-white/10 transition-all duration-300 cursor-default"
              >
                <span className="mr-2">{feature.icon}</span>
                {feature.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;