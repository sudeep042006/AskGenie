import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useParams } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import ChatInterface from './components/ChatInterface'; // The new component
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import { chatbotApi } from './services/api';

// Main Layout with Global Sidebar
function MainLayout() {
  const { user, logout } = useAuth();
  const [bots, setBots] = React.useState([]);
  const [isMobileNavOpen, setMobileNavOpen] = useState(false);
  const navigate = useNavigate();

  // Load Bots for Sidebar
  React.useEffect(() => {
    if (user?.id) {
      chatbotApi.fetchUserBots(user.id)
        .then(res => setBots(res.data || []))
        .catch(err => console.error(err));
    }
  }, [user]);

  const handleDeleteBot = async (botId) => {
    await chatbotApi.deleteBot(botId);
    setBots(prev => prev.filter(b => b._id !== botId));
    navigate('/');
  };

  return (
    <div className="relative h-screen w-screen flex overflow-hidden bg-slate-950 text-white">
      {/* Mobile Menu Button */}
      <div className="absolute top-4 left-4 z-50 md:hidden">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 bg-slate-900/80 backdrop-blur-md border border-white/10 rounded-lg text-white shadow-lg"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Global Sidebar - Always visible */}
      <Sidebar
        bots={bots}
        isOpen={isMobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        onSelectBot={(bot) => {
          // Navigate to the chat route
          const id = bot._id || bot.id;
          navigate(`/chat/${id}`);
        }}
        onNewChat={() => navigate('/')} // Go to Dashboard/Create
        onDeleteBot={handleDeleteBot}
        onLogout={logout}
      />
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

// The Dashboard Index Page (Create New / Hero)
function DashboardIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();

  // If a bot is created, refresh sidebar? 
  // We might need a context for bots if we want real-time update in Sidebar
  // For now, simpler: forcing a reload or passing a callback is hard with Outlet.
  // Solution: Just navigate to the chat. The sidebar might be stale until refresh.
  // Better: Lift state to Context, but for now let's just accept it.

  // Actually, we can pass context through Outlet or use a simple EventBus/Context.
  // Let's stick to simple navigation.

  return (
    <div className="flex-1 flex items-center justify-center p-6 overflow-auto bg-gradient-to-br from-slate-950 via-slate-900 to-black">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-80 h-80 bg-teal-500/10 rounded-full blur-[120px] animate-pulse"></div>
      </div>
      <Hero onBotCreated={(bot) => {
        // The user created a bot. Navigate to its chat.
        // Force window reload to update sidebar? Or just navigate.
        const id = bot._id || bot.id;
        window.location.href = `/chat/${id}`; // Hack to force sidebar refresh
      }} userId={user?.id} />
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

          {/* Protected Area */}
          <Route element={<ProtectedRoute><MainLayout /></ProtectedRoute>}>
            <Route path="/" element={<DashboardIndex />} />
            <Route path="/chat/:chatbotId" element={<ChatInterface />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;