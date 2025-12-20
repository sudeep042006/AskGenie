import React from 'react';
import { Search, User, Settings, CreditCard } from 'lucide-react';
import logo from '../assets/logo_ag_only.png';

const Navbar = () => {
  return (
    <nav className="fixed top-0 w-full z-[100] px-6 py-4 flex justify-between items-center border-b border-white/5 backdrop-blur-md bg-black/20">

      {/* --- LOGO SECTION --- */}
      <div className="flex-1 flex justify-center md:justify-start">
        <div className="flex items-center gap-3 group cursor-pointer">
          <div className="relative w-12 h-12 flex items-center justify-center">
            <div className="absolute inset-0 bg-teal-500/20 rounded-full blur-lg group-hover:bg-teal-500/30 transition-all"></div>
            <img
              src={logo}
              alt="AG"
              style={{
                maskImage: 'radial-gradient(circle, black 50%, transparent 100%)',
                WebkitMaskImage: 'radial-gradient(circle, black 50%, transparent 100%)'
              }}
              className="relative w-full h-full object-contain mix-blend-screen hover:scale-110 transition-transform duration-300"
            />
          </div>

          <span className="text-2xl font-black tracking-tighter text-white uppercase italic">
            ask<span className="text-teal-400">genie</span>
          </span>
        </div>
      </div>

      {/* --- UTILITIES SECTION (Right Aligned) --- */}
      <div className="flex items-center gap-4 md:gap-8">

        {/* Slim Search Bar */}
        <div className="hidden lg:flex items-center bg-black/40 border border-white/10 rounded-full px-4 py-1.5 focus-within:border-teal-500/50 focus-within:shadow-[0_0_15px_rgba(45,212,191,0.1)] transition-all">
          <Search className="w-4 h-4 text-gray-500" />
          <input
            type="text"
            className="bg-transparent border-none outline-none focus:ring-0 text-sm w-48 placeholder:text-gray-600"
            placeholder="Find a chatbot..."
          />
        </div>

        {/* Text Links */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#settings" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <Settings size={16} /> Settings
          </a>
          <a href="#account" className="text-sm font-medium text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <User size={16} /> Account
          </a>
        </div>

        {/* Upgrade Button (Glass-border effect) */}
        <button className="hidden sm:flex items-center gap-2 px-5 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-lg hover:bg-white/10 hover:border-teal-500/50 transition-all group">
          <CreditCard size={16} className="text-teal-400 group-hover:scale-110 transition-transform" />
          <span className="text-sm font-bold text-white">Upgrade</span>
        </button>

        {/* User Profile Avatar */}
        <div className="relative group cursor-pointer">
          <div className="absolute inset-0 bg-gradient-to-tr from-teal-500 to-purple-600 rounded-full blur-[5px] opacity-50 group-hover:opacity-100 transition-opacity"></div>
          <div className="relative w-10 h-10 rounded-full border-2 border-white/20 overflow-hidden bg-black">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sudeep"
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;