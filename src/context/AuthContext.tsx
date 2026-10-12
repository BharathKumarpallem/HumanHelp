import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, ProviderProfile, UserRole, NotificationItem } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  providerProfile: ProviderProfile | null;
  role: UserRole;
  isLoading: boolean;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  favorites: string[];
  toggleFavorite: (providerId: string) => void;
  isFavorite: (providerId: string) => boolean;
  switchPersona: (role: UserRole) => Promise<void>;
  login: (email: string) => Promise<void>;
  register: (data: { fullName: string; email: string; role: UserRole; phone?: string; location?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  notifications: NotificationItem[];
  unreadNotifsCount: number;
  markNotificationRead: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [providerProfile, setProviderProfile] = useState<ProviderProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('humanhelp_favorites');
      return saved ? JSON.parse(saved) : ['prov-profile-1', 'prov-profile-3'];
    } catch {
      return ['prov-profile-1', 'prov-profile-3'];
    }
  });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Initialize theme
  useEffect(() => {
    const savedTheme = localStorage.getItem('humanhelp_theme') as 'light' | 'dark' | null;
    const initialTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initialTheme);
    if (initialTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    localStorage.setItem('humanhelp_theme', nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Load initial user session
  const refreshUser = async () => {
    try {
      const data = await api.auth.getMe();
      setUser(data.user);
      setProviderProfile(data.providerProfile);
    } catch (err) {
      console.error('Failed to load session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const switchPersona = async (newRole: UserRole) => {
    setIsLoading(true);
    try {
      const res = await api.auth.switchPersona(newRole);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    } catch (err) {
      console.error('Failed to switch persona:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login(email);
      setUser(res.user);
      setProviderProfile(res.providerProfile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: { fullName: string; email: string; role: UserRole; phone?: string; location?: string }) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      setUser(res.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await api.auth.logout();
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFavorite = (providerId: string) => {
    setFavorites(prev => {
      const next = prev.includes(providerId) ? prev.filter(id => id !== providerId) : [...prev, providerId];
      localStorage.setItem('humanhelp_favorites', JSON.stringify(next));
      return next;
    });
  };

  const isFavorite = (providerId: string) => favorites.includes(providerId);

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const unreadNotifsCount = notifications.filter(n => !n.isRead).length;

  return (
    <AuthContext.Provider
      value={{
        user,
        providerProfile,
        role: user?.role || 'customer',
        isLoading,
        theme,
        toggleTheme,
        favorites,
        toggleFavorite,
        isFavorite,
        switchPersona,
        login,
        register,
        logout,
        refreshUser,
        notifications,
        unreadNotifsCount,
        markNotificationRead,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
