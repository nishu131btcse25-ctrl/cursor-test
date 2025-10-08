'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Screen } from '@/types';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import Link from 'next/link';

export default function ScreenDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [screen, setScreen] = useState<Screen | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && params.id) {
      loadScreen();
    }
  }, [user, params.id]);

  const loadScreen = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('screens')
        .select('*')
        .eq('id', params.id)
        .eq('user_id', user!.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          setError('Screen not found');
        } else {
          throw error;
        }
        return;
      }

      setScreen(data);
    } catch (error) {
      console.error('Error loading screen:', error);
      setError('Failed to load screen');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteScreen = async () => {
    if (!confirm('Are you sure you want to delete this screen? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('screens')
        .delete()
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      router.push('/dashboard/screens');
    } catch (error) {
      console.error('Error deleting screen:', error);
      setError('Failed to delete screen');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/screens">← Back to Screens</Link>
          </Button>
        </div>
        
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-6 bg-neutral-border-light rounded mb-4"></div>
            <div className="h-4 bg-neutral-border-light rounded w-2/3 mb-2"></div>
            <div className="h-4 bg-neutral-border-light rounded w-1/2"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !screen) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/screens">← Back to Screens</Link>
          </Button>
        </div>
        
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">❌</div>
            <h3 className="text-lg font-medium text-neutral-text-base mb-2">
              Screen Not Found
            </h3>
            <p className="text-neutral-text-muted mb-6">
              {error || 'The screen you are looking for does not exist or you do not have permission to view it.'}
            </p>
            <Button asChild>
              <Link href="/dashboard/screens">Back to Screens</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard/screens">← Back to Screens</Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-neutral-text-base">
              {screen.name}
            </h1>
            <p className="text-neutral-text-muted">
              Screen ID: {screen.screen_id}
            </p>
          </div>
        </div>
        <Button variant="destructive" onClick={handleDeleteScreen}>
          Delete Screen
        </Button>
      </div>

      {/* Status Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-neutral-text-base">
              Connection Status
            </h2>
            <div className="flex items-center space-x-2">
              <div
                className={`w-3 h-3 rounded-full ${
                  screen.is_online ? 'bg-semantic-success' : 'bg-neutral-text-subtle'
                }`}
              />
              <span className="text-sm font-medium">
                {screen.is_online ? 'Online' : 'Offline'}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-neutral-text-muted mb-1">Last Seen</p>
              <p className="font-medium">
                {screen.last_seen ? formatRelativeTime(screen.last_seen) : 'Never'}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-text-muted mb-1">Created</p>
              <p className="font-medium">
                {formatDate(screen.created_at)}
              </p>
            </div>
            <div>
              <p className="text-sm text-neutral-text-muted mb-1">Last Updated</p>
              <p className="font-medium">
                {formatDate(screen.updated_at)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            Screen Details
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-sm text-neutral-text-muted mb-1">Name</p>
              <p className="font-medium">{screen.name}</p>
            </div>
            
            {screen.description && (
              <div>
                <p className="text-sm text-neutral-text-muted mb-1">Description</p>
                <p className="font-medium">{screen.description}</p>
              </div>
            )}
            
            {screen.location && (
              <div>
                <p className="text-sm text-neutral-text-muted mb-1">Location</p>
                <p className="font-medium">📍 {screen.location}</p>
              </div>
            )}
            
            <div>
              <p className="text-sm text-neutral-text-muted mb-1">Screen ID</p>
              <p className="font-mono text-sm bg-neutral-bg-elevated px-2 py-1 rounded">
                {screen.screen_id}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pairing Instructions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            Pairing Instructions
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-neutral-text-muted">
              To connect this screen to your display device, follow these steps:
            </p>
            
            <ol className="list-decimal list-inside space-y-2 text-sm">
              <li>Open the display device's web browser</li>
              <li>Navigate to the pairing URL</li>
              <li>Enter the Screen ID: <code className="bg-neutral-bg-elevated px-1 rounded">{screen.screen_id}</code></li>
              <li>Follow the on-screen instructions to complete pairing</li>
            </ol>
            
            <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
              <p className="text-sm text-primary-800">
                <strong>Note:</strong> The display device must be connected to the internet and have a modern web browser to complete the pairing process.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}