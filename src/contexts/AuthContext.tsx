'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, Language } from '@/types';
import * as storage from '@/lib/storage';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  language: Language;
  isCloud: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  loginWithGoogle: (name?: string, email?: string, avatar?: string) => Promise<boolean>;
  logout: () => void;
  setLanguage: (lang: Language) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [language, setLang] = useState<Language>('en');

  useEffect(() => {
    // 1. Load saved language from localStorage
    const savedLang = storage.getLanguage();
    if (savedLang) setLang(savedLang);

    // 2. If real Supabase is configured, listen to onAuthStateChange real-time stream
    if (isSupabaseConfigured) {
      // Check current session first
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          await syncSupabaseUser(session.user, savedLang);
        } else {
          setUser(null);
          storage.clearCurrentUser();
        }
        setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          await syncSupabaseUser(session.user, savedLang);
        } else {
          setUser(null);
          storage.clearCurrentUser();
        }
        setLoading(false);
      });

      return () => {
        subscription.unsubscribe();
      };
    } else {
      // Fallback to localStorage if Supabase API keys are not yet configured in .env.local
      const currentUser = storage.getCurrentUser();
      if (currentUser) setUser(currentUser);
      setLoading(false);
    }
  }, []);

  const syncSupabaseUser = async (sbUser: any, savedLang?: string) => {
    try {
      // Fetch user profile from Supabase 'users' table
      const { data: userDoc, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', sbUser.id)
        .single();
      
      if (userDoc && !error) {
        const userData: User = {
          id: userDoc.id,
          name: userDoc.name,
          email: userDoc.email,
          password: 'supabase-session',
          avatar: userDoc.avatar,
          createdAt: userDoc.created_at || new Date().toISOString(),
          language: (userDoc.language as Language) || savedLang || 'id',
        };
        setUser(userData);
        storage.setCurrentUser(userData);
      } else {
        // Create user row if missing (e.g. first time Google OAuth login)
        const newUser: User = {
          id: sbUser.id,
          name: sbUser.user_metadata?.full_name || sbUser.user_metadata?.name || 'Pengguna Akuila',
          email: sbUser.email || '',
          password: 'supabase-oauth-token',
          avatar: sbUser.user_metadata?.avatar_url || sbUser.user_metadata?.picture || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          language: (savedLang as Language) || 'id',
        };
        
        await supabase.from('users').upsert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          created_at: newUser.createdAt,
          language: newUser.language,
        });
        
        setUser(newUser);
        storage.setCurrentUser(newUser);
      }
    } catch (err) {
      console.error('⚠️ [Supabase] Error loading user data, falling back to basic profile:', err);
      const basicUser: User = {
        id: sbUser.id,
        name: sbUser.user_metadata?.full_name || 'Pengguna Akuila',
        email: sbUser.email || '',
        password: 'supabase-token',
        avatar: sbUser.user_metadata?.avatar_url || undefined,
        createdAt: new Date().toISOString(),
        language: 'id',
      };
      setUser(basicUser);
      storage.setCurrentUser(basicUser);
    }
  };

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          console.error('❌ [Supabase Auth] Login error:', error.message);
          if (error.message.includes('Email not confirmed')) {
            alert('⚠️ Email belum dikonfirmasi!\n\nSolusi di Supabase Dashboard:\n1. Buka menu Authentication -> Providers -> klik Email.\n2. Matikan (uncheck) opsi "Confirm email" lalu klik Save.\n3. Di tab Users, klik titik tiga (...) pada akun Anda lalu pilih "Confirm user" (atau daftar ulang akun baru).');
          }
          return false;
        }
        return true;
      } catch (err) {
        console.error('❌ [Supabase Auth] Login error:', err);
        return false;
      }
    } else {
      // Local fallback
      const users = storage.getUsers();
      const found = users.find(u => u.email === email && u.password === password);
      if (found) {
        setUser(found);
        storage.setCurrentUser(found);
        return true;
      }
      return false;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: name }
          }
        });
        if (error || !data.user) {
          console.error('❌ [Supabase Auth] Register error:', error?.message);
          return false;
        }
        
        const newUser: User = {
          id: data.user.id,
          name,
          email,
          password: 'encrypted-in-supabase',
          createdAt: new Date().toISOString(),
          language: language,
        };
        await supabase.from('users').upsert({
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          created_at: newUser.createdAt,
          language: newUser.language,
        });
        
        setUser(newUser);
        storage.setCurrentUser(newUser);
        return true;
      } catch (err) {
        console.error('❌ [Supabase Auth] Register error:', err);
        return false;
      }
    } else {
      // Local fallback
      const users = storage.getUsers();
      const exists = users.find(u => u.email === email);
      if (exists) return false;
      
      const newUser: User = {
        id: storage.generateId(),
        name,
        email,
        password,
        createdAt: new Date().toISOString(),
        language: language,
      };
      storage.saveUser(newUser);
      setUser(newUser);
      storage.setCurrentUser(newUser);
      return true;
    }
  }, [language]);

  const loginWithGoogle = useCallback(async (name: string = 'Pengguna Google', email: string = 'user.google@gmail.com', avatar?: string): Promise<boolean> => {
    if (isSupabaseConfigured) {
      try {
        // Asli mengalihkan ke halaman Google OAuth resmi dari Supabase
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/catalog` : undefined,
          }
        });
        if (error) {
          console.error('❌ [Supabase Google OAuth] Error:', error.message);
          return false;
        }
        return true;
      } catch (err) {
        console.error('❌ [Supabase Google OAuth] Error:', err);
        return false;
      }
    } else {
      // Local simulation fallback jika API key di .env.local masih default
      const users = storage.getUsers();
      let existing = users.find(u => u.email === email);
      if (!existing) {
        existing = {
          id: storage.generateId(),
          name,
          email,
          password: 'google-oauth-token',
          avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          createdAt: new Date().toISOString(),
          language: language,
        };
        storage.saveUser(existing);
      } else if (avatar && !existing.avatar) {
        existing.avatar = avatar;
        storage.saveUser(existing);
      }
      setUser(existing);
      storage.setCurrentUser(existing);
      return true;
    }
  }, [language]);

  const logout = useCallback(async () => {
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('❌ [Supabase Auth] Logout error:', err);
      }
    }
    setUser(null);
    storage.clearCurrentUser();
    storage.clearAllDraftsAndMedia();
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLang(lang);
    storage.setLanguage(lang);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, language, isCloud: isSupabaseConfigured, login, register, loginWithGoogle, logout, setLanguage }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
