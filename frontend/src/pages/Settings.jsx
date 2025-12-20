import React from 'react';
import { User, Bell, Moon, Smartphone, Shield, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
    const { user, logout } = useAuth();

    return (
        <div className="h-full w-full overflow-y-auto bg-slate-950 p-4 md:p-8 relative">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none fixed">
                <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-teal-500/10 rounded-full blur-[100px] animate-pulse delay-700"></div>
            </div>

            <div className="max-w-4xl mx-auto relative z-10 space-y-8 pb-20">

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">Settings</h1>
                    <p className="text-slate-400 mt-2">Manage your account preferences and app settings.</p>
                </div>

                {/* Profile Section */}
                <div className="glass-card bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Account Profile</h2>
                            <p className="text-sm text-slate-500">Update your personal information</p>
                        </div>
                    </div>

                    <div className="space-y-4 max-w-xl">
                        <div>
                            <label className="block text-sm font-medium text-slate-400 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={user?.email || ''}
                                disabled
                                className="w-full bg-slate-950/50 border border-white/10 rounded-lg px-4 py-2.5 text-slate-300 focus:outline-none focus:border-indigo-500/50 transition-colors"
                                readOnly
                            />
                            <p className="text-xs text-slate-600 mt-1">Managed via Supabase Auth</p>
                        </div>
                    </div>
                </div>

                {/* Appearance & Preferences */}
                <div className="glass-card bg-slate-900/40 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
                            <Moon size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-white">Appearance & App</h2>
                            <p className="text-sm text-slate-500">Customize your experience</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <Moon size={18} className="text-slate-400" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-200">Dark Mode</h3>
                                    <p className="text-xs text-slate-500">Optimized for low-light environments</p>
                                </div>
                            </div>
                            <div className="h-6 w-11 bg-indigo-600 rounded-full relative cursor-pointer">
                                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"></div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-slate-400" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-200">Notifications</h3>
                                    <p className="text-xs text-slate-500">Get updates on your chatbot's activity</p>
                                </div>
                            </div>
                            <div className="h-6 w-11 bg-slate-700 rounded-full relative cursor-pointer">
                                <div className="absolute left-1 top-1 h-4 w-4 bg-slate-400 rounded-full shadow-sm"></div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5 last:border-0 last:pb-0">
                            <div className="flex items-center gap-3">
                                <Smartphone size={18} className="text-slate-400" />
                                <div>
                                    <h3 className="text-sm font-medium text-slate-200">Mobile Layout</h3>
                                    <p className="text-xs text-slate-500">Responsive view active</p>
                                </div>
                            </div>
                            <span className="text-xs font-mono bg-teal-500/10 text-teal-400 px-2 py-0.5 rounded">AUTO</span>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="glass-card bg-red-500/5 border border-red-500/10 rounded-2xl p-6 backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400">
                            <Shield size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-red-200">Session Zone</h2>
                            <p className="text-sm text-red-500/60">Manage your current session</p>
                        </div>
                    </div>

                    <button
                        onClick={logout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg transition-colors text-sm font-medium"
                    >
                        <LogOut size={16} /> Sign Out of All Devices
                    </button>
                </div>

            </div>
        </div>
    );
}
