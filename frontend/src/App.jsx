import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import ChatWindow from './components/ChatWindow';
import Login from './pages/Login';
import Register from './pages/Register';
import { chatbotApi } from './services/api';
import Navbar from './components/Navbar'; // Keeping Navbar for public pages or if needed, but likely removing from dashboard

// Dashboard Layout Wrapper
function DashboardLayout() {
  const [bots, setBots] = React.useState([]);
  const [activeBot, setActiveBot] = React.useState(null);
  const [userId, setUserId] = React.useState(null);

  // Get user from localStorage directly for this layout scope or use AuthContext
  // But we need to use useAuth hook inside a component child of AuthProvider
  // We'll move this logic into a separate inner component
  return <DashboardContent />;
}

import { useAuth } from './context/AuthContext';

function DashboardContent() {
  const { user, logout } = useAuth();
  const [bots, setBots] = React.useState([]);
  const [activeBot, setActiveBot] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [showCreateFlow, setShowCreateFlow] = React.useState(true); // Default to "Create New" view

  // Fetch bots on mount
  React.useEffect(() => {
    if (user?.id) {
      loadBots(user.id);
    }
  }, [user]);

  const loadBots = async (uid) => {
    try {
      const res = await chatbotApi.fetchUserBots(uid);
      setBots(res.data || []);
    } catch (err) {
      console.error('Failed to load bots', err);
    }
  };

  const handleDeleteBot = async (botId) => {
    try {
      await chatbotApi.deleteBot(botId);
      setBots(prev => prev.filter(b => b._id !== botId));
      if (activeBot?._id === botId) {
        setActiveBot(null);
        setShowCreateFlow(true);
      }
    } catch (err) {
      console.error('Delete failed', err);
      // Optional: show toast
    }
  };

  const handleBotCreated = (newBot) => {
    setBots(prev => [newBot, ...prev]);
    setActiveBot(newBot);
    setShowCreateFlow(false);
  };

  return (
    <div className="relative h-screen w-screen flex overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-black text-white">
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px]"></div>
      </div>

      <Sidebar
        bots={bots}
        onSelectBot={(bot) => {
          setActiveBot(bot);
          setShowCreateFlow(false);
        }}
        onNewChat={() => {
          setActiveBot(null);
          setShowCreateFlow(true);
        }}
        onDeleteBot={handleDeleteBot}
        onLogout={logout}
      />

      <main className="flex-1 flex flex-col relative z-10 overflow-hidden">
        {/* Header/Navbar for Dashboard if needed, or just clean space */}
        {/* For now, just the main content area */}
        <div className="flex-1 flex items-center justify-center p-6 overflow-auto">
          {showCreateFlow ? (
            <Hero onBotCreated={handleBotCreated} userId={user?.id} />
          ) : (
            activeBot && <ChatWindow chatbot={activeBot} userId={user?.id} onBack={() => {
              setActiveBot(null);
              setShowCreateFlow(true);
            }} />
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;