import React, { useState } from 'react';
import { Plus, LayoutGrid, Settings, HelpCircle, Trash2, MessageSquare, Clock, AlertCircle, LogOut, Zap } from 'lucide-react';

import { useNavigate } from 'react-router-dom';

const Sidebar = ({ bots, onSelectBot, onNewChat, onDeleteBot, onLogout, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [hoveredBot, setHoveredBot] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) onClose(); // Close sidebar on mobile after navigation
  };

  const handleDeleteBot = async (botId, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }
    try {
      setDeletingId(botId);
      setDeleteError(null);
      await onDeleteBot(botId);
    } catch (err) {
      console.error('❌ Failed to delete bot:', err);
      setDeleteError(`Failed to delete chatbot: ${err?.response?.data?.error || err.message}`);
      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready': return 'from-teal-500/10 to-transparent border-teal-500/20 hover:border-teal-500/40';
      case 'processing': return 'from-amber-500/10 to-transparent border-amber-500/20';
      case 'error': return 'from-red-500/10 to-transparent border-red-500/20';
      default: return 'from-gray-500/10 to-transparent border-gray-500/20';
    }
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        fixed md:relative inset-y-0 left-0 w-72 h-screen p-4 flex flex-col gap-4 z-40 
        transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="glass-card rounded-[2rem] p-5 flex flex-col h-full bg-slate-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl">

          {/* LOGO AREA */}
          <div className="flex items-center gap-3 px-2 mb-8 pt-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Zap className="text-white w-6 h-6 fill-current" />
            </div>
            <div>
              <h1 className="font-bold text-lg tracking-tight text-white leading-none">ASK GENIE</h1>
              <span className="text-[10px] text-indigo-400 font-medium tracking-wider uppercase">AI Assistant</span>
            </div>
          </div>

          {/* Delete Error Banner */}
          {deleteError && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 flex items-start gap-2 text-red-300 text-xs animate-in fade-in slide-in-from-top">
              <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
              <span className="flex-1">{deleteError}</span>
              <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-300 flex-shrink-0">✕</button>
            </div>
          )}

          <div className="space-y-2 mb-6">
            <button
              onClick={() => {
                onNewChat();
                if (onClose) onClose();
              }}
              className="w-full flex items-center justify-center gap-2 p-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02] transition-all duration-200 group"
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform" />
              New Chatbot
            </button>
          </div>

          <div className="px-2 mb-2 flex items-center justify-between text-xs font-medium text-slate-500 uppercase tracking-wider">
            <span>My Chatbots</span>
            <span className="bg-slate-800 px-1.5 py-0.5 rounded text-slate-400">{bots.length}</span>
          </div>

          {/* Bots List */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 -mr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
            {bots.length === 0 ? (
              <div className="text-center text-slate-600 text-xs py-12 px-4 border border-dashed border-slate-800 rounded-2xl bg-slate-900/30">
                <MessageSquare size={24} className="mx-auto mb-3 opacity-30" />
                <p>No chatbots yet.</p>
              </div>
            ) : (
              bots.map((bot) => (
                <div
                  key={bot._id}
                  onMouseEnter={() => setHoveredBot(bot._id)}
                  onMouseLeave={() => setHoveredBot(null)}
                  onClick={() => {
                    onSelectBot(bot);
                    if (onClose) onClose();
                  }}
                  className={`group relative rounded-xl p-3 cursor-pointer transition-all duration-200 border hover:bg-slate-800/50 ${getStatusColor(bot.status)}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors">
                        {bot.name || "Untitled Bot"}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate">
                        {bot.url?.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}
                      </p>
                    </div>

                    {hoveredBot === bot._id && (
                      <button
                        onClick={(e) => handleDeleteBot(bot._id, e)}
                        disabled={deletingId === bot._id}
                        className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        {deletingId === bot._id ? <div className="w-3 h-3 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" /> : <Trash2 size={13} />}
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="pt-4 mt-auto border-t border-white/5 space-y-1">
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center gap-3 p-2.5 text-sm text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            >
              <Settings size={16} /> Settings
            </button>
            <button onClick={onLogout} className="w-full flex items-center gap-3 p-2.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;