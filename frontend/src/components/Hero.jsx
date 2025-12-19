import React, { useState, useEffect, useRef } from 'react';
import { Search, Globe, ChevronRight, Zap, CheckCircle2, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { chatbotApi } from '../services/api';

export default function Hero({ onBotCreated, userId }) {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0); // 0: Start, 1: Crawling, 2: Extracting, 3: Training, 4: Finalizing
  const [errorMsg, setErrorMsg] = useState('');

  const progressInterval = useRef(null);

  const STAGES = [
    { label: 'Initializing', duration: 1000 },
    { label: 'Crawling website pages', duration: 4000 },
    { label: 'Extracting content', duration: 3000 },
    { label: 'Creating embeddings', duration: 3000 },
    { label: 'Training chatbot', duration: 2000 },
  ];

  const simulateProgress = () => {
    setProgress(0);
    setStage(0);

    // Smooth progress simulation that stalls at 90% until actual completion
    let currentProgress = 0;

    progressInterval.current = setInterval(() => {
      currentProgress += Math.random() * 2;
      if (currentProgress > 90) {
        currentProgress = 90; // Stall here
      }

      setProgress(currentProgress);

      // Map progress to rough stages
      if (currentProgress < 10) setStage(0);
      else if (currentProgress < 30) setStage(1);
      else if (currentProgress < 50) setStage(2);
      else if (currentProgress < 75) setStage(3);
      else setStage(4);

    }, 200);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!url) return;

    setStatus('processing');
    setErrorMsg('');
    simulateProgress();

    try {
      const { data } = await chatbotApi.createBot({
        url,
        userId,
        name: url.replace(/^https?:\/\//, '').split('/')[0] // Simple name derivation
      });

      // Complete the progress on success
      clearInterval(progressInterval.current);
      setProgress(100);
      setStage(STAGES.length - 1);
      setStatus('success');

      // Small delay to show 100% state
      setTimeout(() => {
        // Construct the bot object from response or default
        const newBot = data.bot || {
          _id: data.chatbotId,
          name: url,
          status: 'ready',
          url: url,
          userId
        };
        onBotCreated(newBot);
      }, 1500);

    } catch (err) {
      clearInterval(progressInterval.current);
      setStatus('error');
      setErrorMsg(err.response?.data?.error || 'Failed to create chatbot. Ensure the URL is accessible.');
      setProgress(0);
    }
  };

  useEffect(() => {
    return () => clearInterval(progressInterval.current);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center relative z-10">

      {status === 'idle' && (
        <div className="space-y-8 animate-in fade-in zoom-in duration-500">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium uppercase tracking-wider">
              <Sparkles size={12} /> AI-Powered
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-white via-indigo-100 to-purple-200 bg-clip-text text-transparent">
              Website into AI
            </h1>
            <p className="text-slate-400 text-lg max-w-lg mx-auto leading-relaxed">
              Paste your website link and let AskGenie build a custom AI assistant trained on your content in seconds.
            </p>
          </div>

          <form onSubmit={handleCreate} className="relative w-full max-w-lg mx-auto group">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity duration-500"></div>
            <div className="relative flex items-center bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-2 shadow-2xl">
              <div className="pl-4 text-slate-500">
                <Globe size={20} />
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com"
                className="flex-1 bg-transparent border-none text-white placeholder:text-slate-600 focus:ring-0 px-4 py-3 text-base"
                required
              />
              <button
                type="submit"
                disabled={!url}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl font-medium shadow-lg shadow-indigo-500/20 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                Create <ChevronRight size={18} />
              </button>
            </div>
          </form>

          {/* Feature Pills */}
          <div className="flex justify-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-teal-400" /> Instant Crawling</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-teal-400" /> Semantic Search</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-teal-400" /> Secure</span>
          </div>
        </div>
      )}

      {status === 'processing' && (
        <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-bold text-white">Building your Genie...</h2>
            <p className="text-slate-400 text-sm">Do not close this window</p>
          </div>

          {/* Progress Circle & Status */}
          <div className="relative flex flex-col items-center justify-center py-8">
            <div className="w-32 h-32 relative flex items-center justify-center">
              {/* Background Ring */}
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-800" />
                {/* Progress Ring */}
                <circle
                  cx="64" cy="64" r="60"
                  stroke="currentColor" strokeWidth="4" fill="none"
                  strokeDasharray={377}
                  strokeDashoffset={377 - (377 * progress) / 100}
                  className="text-indigo-500 transition-all duration-300 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white">{Math.round(progress)}%</span>
              </div>
            </div>

            {/* Stage Indicator */}
            <div className="mt-8 grid gap-3 w-full">
              {STAGES.map((s, idx) => (
                <div key={idx} className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-300 ${idx === stage
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-white'
                  : idx < stage
                    ? 'bg-slate-800/30 border-slate-800 text-slate-500'
                    : 'bg-transparent border-transparent text-slate-600'
                  }`}>
                  {idx < stage ? (
                    <CheckCircle2 size={18} className="text-teal-400" />
                  ) : idx === stage ? (
                    <Loader2 size={18} className="text-indigo-400 animate-spin" />
                  ) : (
                    <div className="w-4.5 h-4.5 rounded-full border border-slate-600" />
                  )}
                  <span className="text-sm font-medium">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {status === 'success' && (
        <div className="flex flex-col items-center animate-in zoom-in duration-300">
          <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-teal-500/40 mb-6">
            <CheckCircle2 size={40} className="text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Genie Ready!</h2>
          <p className="text-slate-400">Redirecting to chat...</p>
        </div>
      )}

      {status === 'error' && (
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl max-w-md animate-in shake flex flex-col items-center gap-4">
          <div className="p-3 bg-red-500/20 rounded-full text-red-400">
            <AlertCircle size={32} />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-red-200">Creation Failed</h3>
            <p className="text-sm text-red-300 mt-1">{errorMsg}</p>
          </div>
          <button
            onClick={() => setStatus('idle')}
            className="px-6 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-200 rounded-lg text-sm font-medium transition-colors"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}