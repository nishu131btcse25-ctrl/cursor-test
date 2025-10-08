'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { formatDate, formatRelativeTime } from '@/lib/utils';

interface ScreenSession {
  id: string;
  screen_id: string;
  session_token: string;
  is_active: boolean;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  expires_at: string;
}

interface ScreenSessionsProps {
  screenId: string;
}

export function ScreenSessions({ screenId }: ScreenSessionsProps) {
  const [sessions, setSessions] = useState<ScreenSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSessions();
  }, [screenId]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('screen_sessions')
        .select('*')
        .eq('screen_id', screenId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setSessions(data || []);
    } catch (error) {
      console.error('Error loading sessions:', error);
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session?')) return;

    try {
      const { error } = await supabase
        .from('screen_sessions')
        .update({ is_active: false })
        .eq('id', sessionId);

      if (error) {
        throw error;
      }

      setSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, is_active: false }
            : session
        )
      );
    } catch (error) {
      console.error('Error revoking session:', error);
      setError('Failed to revoke session');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold text-neutral-text-base">
            Device Sessions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-neutral-border-light rounded mb-2"></div>
                <div className="h-3 bg-neutral-border-light rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-text-base">
            Device Sessions
          </h3>
          <Button size="sm" variant="secondary" onClick={loadSessions}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="p-3 bg-semantic-error-light border border-semantic-error rounded-lg mb-4">
            <p className="text-sm text-semantic-error">{error}</p>
          </div>
        )}

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📱</div>
            <p className="text-neutral-text-muted">No device sessions found</p>
            <p className="text-sm text-neutral-text-subtle">
              Connect a device to see session information
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => (
              <div
                key={session.id}
                className="p-4 border border-neutral-border-base rounded-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        session.is_active ? 'bg-semantic-success' : 'bg-neutral-text-subtle'
                      }`}
                    />
                    <span className="text-sm font-medium">
                      {session.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {session.is_active && (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleRevokeSession(session.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-neutral-text-muted">Created: </span>
                    <span>{formatDate(session.created_at)}</span>
                  </div>
                  
                  <div>
                    <span className="text-neutral-text-muted">Expires: </span>
                    <span>{formatRelativeTime(session.expires_at)}</span>
                  </div>

                  {session.ip_address && (
                    <div>
                      <span className="text-neutral-text-muted">IP: </span>
                      <span className="font-mono">{session.ip_address}</span>
                    </div>
                  )}

                  {session.user_agent && (
                    <div>
                      <span className="text-neutral-text-muted">Device: </span>
                      <span className="text-xs">{session.user_agent}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}