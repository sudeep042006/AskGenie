import React, { createContext, useContext, useState, useEffect } from 'react';
import { chatbotApi } from '../services/api';

import { supabase } from '../supabaseClient';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; // Using the env var

const AuthContext = createContext();

export function useAuth() {
    return useContext(AuthContext);
}

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // 1. Check local storage for legacy/backend session
        const storedUser = localStorage.getItem('askgenie_user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }

        // 2. Check Supabase Session (OAuth recovery)
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                const userData = {
                    id: session.user.id,
                    email: session.user.email,
                    token: session.access_token,
                    avatar_url: session.user.user_metadata.avatar_url,
                    full_name: session.user.user_metadata.full_name
                };
                setUser(userData);
                localStorage.setItem('askgenie_user', JSON.stringify(userData));
            }
            setLoading(false);
        });

        // 3. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                const userData = {
                    id: session.user.id,
                    email: session.user.email,
                    token: session.access_token,
                    avatar_url: session.user.user_metadata.avatar_url,
                    full_name: session.user.user_metadata.full_name
                };
                setUser(userData);
                localStorage.setItem('askgenie_user', JSON.stringify(userData));
            } else {
                // Only clear if we strictly want to sync with Supabase. 
                // But mixed mode (Backend Auth + Supabase Auth) might be tricky.
                // For now, if we explicitly sign out via Supabase, we clear.
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            const userData = {
                id: data.userId,
                email: data.email,
                token: data.token,
            };

            // Save to state and local storage
            setUser(userData);
            localStorage.setItem('askgenie_user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const signInWithGoogle = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: window.location.origin,
                }
            });
            if (error) throw error;
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const register = async (email, password) => {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            return { success: true, message: data.message };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const logout = async () => {
        await supabase.auth.signOut(); // Clear Supabase session
        setUser(null);
        localStorage.removeItem('askgenie_user');
    };

    const value = {
        user,
        login,
        register,
        logout,
        signInWithGoogle,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}
