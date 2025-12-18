import React, { useState } from 'react';
import { Plus, LayoutGrid, Settings, HelpCircle, Trash2, MessageSquare, Clock, AlertCircle } from 'lucide-react';

const Sidebar = ({ bots, onSelectBot, onNewChat, onDeleteBot }) => {
  const [hoveredBot, setHoveredBot] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  const handleDeleteBot = async (botId, e) => {
    e.stopPropagation();
    
    // Confirm deletion
    if (!window.confirm('Are you sure you want to delete this chatbot? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(botId);
      setDeleteError(null);
      await onDeleteBot(botId);
      console.log('✅ Bot deleted successfully:', botId);
    } catch (err) {
      console.error('❌ Failed to delete bot:', err);
      setDeleteError(`Failed to delete chatbot: ${err?.response?.data?.error || err.message}`);
      // Show error for 5 seconds then clear
      setTimeout(() => setDeleteError(null), 5000);
    } finally {
      setDeletingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'ready':
        return 'from-teal-500/20 to-cyan-500/20 border-teal-500/40';
      case 'processing':
        return 'from-amber-500/20 to-orange-500/20 border-amber-500/40';
      case 'error':
        return 'from-red-500/20 to-rose-500/20 border-red-500/40';
      default:
        return 'from-gray-500/20 to-gray-500/20 border-gray-500/40';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'ready':
        return 'bg-teal-500/30 text-teal-300 border-teal-500/50';
      case 'processing':
        return 'bg-amber-500/30 text-amber-300 border-amber-500/50';
      case 'error':
        return 'bg-red-500/30 text-red-300 border-red-500/50';
      default:
        return 'bg-gray-500/30 text-gray-300 border-gray-500/50';
    }
  };

  return (
    <aside className="w-72 h-[calc(100vh-100px)] ml-4 mt-20 flex flex-col gap-4 z-40">
      <div className="glass-card rounded-[2rem] p-6 flex flex-col h-full bg-gradient-to-b from-white/8 to-white/3 backdrop-blur-[50px] border border-white/15">
        
        {/* Delete Error Banner */}
        {deleteError && (
          <div className="mb-4 p-3 rounded-xl bg-red-500/20 border border-red-500/40 flex items-start gap-2 text-red-300 text-xs animate-in fade-in slide-in-from-top">
            <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
            <span className="flex-1">{deleteError}</span>
            <button onClick={() => setDeleteError(null)} className="text-red-400 hover:text-red-300 flex-shrink-0">✕</button>
          </div>
        )}
        <div className="space-y-3 mb-8">
          <button 
            onClick={onNewChat} 
            className="w-full flex items-center justify-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-teal-500/30 to-cyan-500/20 border border-teal-500/40 text-teal-300 hover:from-teal-500/40 hover:to-cyan-500/30 hover:border-teal-500/60 transition-all duration-200 font-medium group"
          >
            <Plus size={18} className="group-hover:rotate-90 transition-transform" /> 
            New Chat
          </button>
          <div className="flex items-center gap-3 p-3 text-gray-400 hover:text-teal-300 cursor-pointer transition-all duration-200 rounded-xl hover:bg-white/5">
            <LayoutGrid size={18} /> 
            <span className="text-sm font-medium">My Chatbots</span>
          </div>
        </div>

        {/* Bots List */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-3">
          <h3 className="text-[11px] uppercase tracking-[0.2em] text-gray-500 font-bold px-2 sticky top-0 bg-gradient-to-b from-white/8 to-transparent py-2">
            <div className="flex items-center gap-2">
              <Clock size={12} />
              {bots.length} Active Bot{bots.length !== 1 ? 's' : ''}
            </div>
          </h3>
          
          {bots.length === 0 ? (
            <div className="text-center text-gray-500 text-xs py-12 px-4">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-50" />
              <p className="font-medium">No chatbots yet.</p>
              <p className="text-gray-600 text-[10px] mt-2">Create one to get started!</p>
            </div>
          ) : (
            bots.map((bot) => (
              <div
                key={bot._id}
                onMouseEnter={() => setHoveredBot(bot._id)}
                onMouseLeave={() => setHoveredBot(null)}
                onClick={() => onSelectBot(bot)}
                className={`relative group rounded-2xl p-4 cursor-pointer transition-all duration-200 overflow-hidden backdrop-blur-xl border ${getStatusColor(bot.status)}`}
              >
                {/* Hover Background Glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-white/10 to-transparent -z-10"></div>

                {/* Content */}
                <div className="relative space-y-2">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-white truncate group-hover:text-teal-300 transition-colors">
                        {bot.name || "Untitled Bot"}
                      </h4>
                      <p className="text-[11px] text-gray-400 truncate mt-1">
                        {bot.url?.replace('https://', '').replace('http://', '').split('/')[0]}
                      </p>
                    </div>
                    
                    {/* Delete Button */}
                    {hoveredBot === bot._id && (
                      <button
                        onClick={(e) => handleDeleteBot(bot._id, e)}
                        disabled={deletingId === bot._id}
                        className={`opacity-100 -mr-2 p-1.5 text-gray-500 rounded-lg transition-all duration-200 flex-shrink-0 ${
                          deletingId === bot._id 
                            ? 'bg-red-500/20 text-red-300 cursor-wait' 
                            : 'hover:bg-red-500/30 hover:text-red-400'
                        }`}
                      >
                        {deletingId === bot._id ? (
                          <div className="w-3.5 h-3.5 border-2 border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>

                  {/* Status Badge */}
                  <div className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-semibold border ${getStatusBadgeColor(bot.status)} backdrop-blur-sm transition-all duration-200`}>
                    {bot.status === 'ready' && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></span>
                        Ready
                      </span>
                    )}
                    {bot.status === 'processing' && (
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-spin"></span>
                        Processing
                      </span>
                    )}
                    {bot.status === 'error' && (
                      <span className="flex items-center gap-1">
                        <span className="text-[12px]">⚠️</span>
                        Error
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  {bot.createdAt && (
                    <p className="text-[9px] text-gray-600">
                      {new Date(bot.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Icons */}
        <div className="pt-4 border-t border-white/10 flex justify-around text-gray-500 mt-auto">
          <button className="p-2 hover:text-teal-400 transition-colors duration-200 hover:bg-white/10 rounded-lg">
            <Settings size={18} />
          </button>
          <button className="p-2 hover:text-teal-400 transition-colors duration-200 hover:bg-white/10 rounded-lg">
            <HelpCircle size={18} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;