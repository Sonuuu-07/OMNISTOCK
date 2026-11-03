import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface LiveEvent {
  id: string;
  type: string;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, pass: string) => Promise<void>;
  switchRole: (role: UserRole) => Promise<void>;
  logout: () => void;
  liveEvents: LiveEvent[];
  unreadEventCount: number;
  clearUnreadEvents: () => void;
  rateLimitStatus: { limit: number; remaining: number; reset: number };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('omnistock_user');
    if (!savedUser) return null;
    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem('omnistock_user');
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(localStorage.getItem('omnistock_jwt'));
  const [liveEvents, setLiveEvents] = useState<LiveEvent[]>([
    {
      id: 'init-1',
      type: 'SYSTEM_ONLINE',
      message: 'OmniStock Real-time WMS telemetry connected to Chicago (ORD-01) & Rotterdam (RTM-02)',
      level: 'success',
      timestamp: new Date().toISOString(),
    },
  ]);
  const [unreadEventCount, setUnreadEventCount] = useState<number>(1);
  const [rateLimitStatus, setRateLimitStatus] = useState({ limit: 180, remaining: 174, reset: 52 });

  useEffect(() => {
    if (!token) return;

    // Connect to Server-Sent Events (SSE) stream for real-time live warehouse updates
    const eventSource = new EventSource('/api/events/stream');
    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type !== 'CONNECTED') {
          setLiveEvents(prev => [parsed, ...prev.slice(0, 40)]);
          setUnreadEventCount(prev => prev + 1);
        }
      } catch (err) {
        console.error('Failed to parse live telemetry stream event:', err);
      }
    };

    return () => {
      eventSource.close();
    };
  }, [token]);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    if (res.success) {
      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('omnistock_user', JSON.stringify(res.user));
    }
  };

  const switchRole = async (newRole: UserRole) => {
    const res = await api.switchRole(newRole);
    if (res.success) {
      api.setToken(res.token);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem('omnistock_user', JSON.stringify(res.user));
    }
  };

  const logout = () => {
    api.setToken(null);
    setToken(null);
    setUser(null);
    localStorage.removeItem('omnistock_user');
  };

  const clearUnreadEvents = () => {
    setUnreadEventCount(0);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        switchRole,
        logout,
        liveEvents,
        unreadEventCount,
        clearUnreadEvents,
        rateLimitStatus,
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
