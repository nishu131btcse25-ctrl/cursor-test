'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from './supabase';
import { Screen } from '@/types';

interface ScreenContextType {
  screens: Screen[];
  loading: boolean;
  error: string | null;
  refreshScreens: () => Promise<void>;
  addScreen: (screen: Screen) => void;
  updateScreen: (id: string, updates: Partial<Screen>) => void;
  removeScreen: (id: string) => void;
}

const ScreenContext = createContext<ScreenContextType | undefined>(undefined);

export function ScreenProvider({ children, userId }: { children: React.ReactNode; userId: string }) {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadScreens = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setScreens(data || []);
    } catch (error) {
      console.error('Error loading screens:', error);
      setError('Failed to load screens');
    } finally {
      setLoading(false);
    }
  };

  const refreshScreens = async () => {
    await loadScreens();
  };

  const addScreen = (screen: Screen) => {
    setScreens(prev => [screen, ...prev]);
  };

  const updateScreen = (id: string, updates: Partial<Screen>) => {
    setScreens(prev => 
      prev.map(screen => 
        screen.id === id ? { ...screen, ...updates } : screen
      )
    );
  };

  const removeScreen = (id: string) => {
    setScreens(prev => prev.filter(screen => screen.id !== id));
  };

  useEffect(() => {
    if (userId) {
      loadScreens();

      // Set up real-time subscriptions
      const channel = supabase
        .channel('screens-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'screens',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log('Screen change received:', payload);
            
            switch (payload.eventType) {
              case 'INSERT':
                addScreen(payload.new as Screen);
                break;
              case 'UPDATE':
                updateScreen(payload.new.id, payload.new as Partial<Screen>);
                break;
              case 'DELETE':
                removeScreen(payload.old.id);
                break;
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  const value: ScreenContextType = {
    screens,
    loading,
    error,
    refreshScreens,
    addScreen,
    updateScreen,
    removeScreen,
  };

  return (
    <ScreenContext.Provider value={value}>
      {children}
    </ScreenContext.Provider>
  );
}

export function useScreens() {
  const context = useContext(ScreenContext);
  if (context === undefined) {
    throw new Error('useScreens must be used within a ScreenProvider');
  }
  return context;
}