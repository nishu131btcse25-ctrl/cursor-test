'use client';

import React, { useState } from 'react';
import { useScreens } from '@/lib/screen-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { generateScreenId, formatRelativeTime } from '@/lib/utils';
import { ScreenStatus } from '@/components/shared/screen-status';
import { SkeletonCard } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/toast';
import Link from 'next/link';

export default function ScreensPage() {
  const { screens, loading, error: contextError, addScreen } = useScreens();
  const { addToast } = useToast();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newScreen, setNewScreen] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleAddScreen = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError('');

      const screenId = generateScreenId();
      const { data, error } = await supabase
        .from('screens')
        .insert({
          name: newScreen.name,
          screen_id: screenId,
          description: newScreen.description || null,
          location: newScreen.location || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      addScreen(data);
      setNewScreen({ name: '', description: '', location: '' });
      setShowAddModal(false);
      addToast({
        type: 'success',
        title: 'Screen Created',
        description: `${data.name} has been added successfully`,
      });
    } catch (error) {
      console.error('Error adding screen:', error);
      setError('Failed to add screen');
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to create screen. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteScreen = async (screenId: string) => {
    if (!confirm('Are you sure you want to delete this screen?')) return;

    try {
      const { error } = await supabase
        .from('screens')
        .delete()
        .eq('id', screenId);

      if (error) {
        throw error;
      }

      addToast({
        type: 'success',
        title: 'Screen Deleted',
        description: 'Screen has been removed successfully',
      });
    } catch (error) {
      console.error('Error deleting screen:', error);
      setError('Failed to delete screen');
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete screen. Please try again.',
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-text-base">Screens</h1>
            <p className="text-neutral-text-muted mt-1">
              Manage your digital signage displays
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-base">Screens</h1>
          <p className="text-neutral-text-muted mt-1">
            Manage your digital signage displays
          </p>
        </div>
        <Button onClick={() => setShowAddModal(true)}>
          Add Screen
        </Button>
      </div>

      {/* Error Message */}
      {(error || contextError) && (
        <div className="p-4 bg-semantic-error-light border border-semantic-error rounded-lg">
          <p className="text-sm text-semantic-error">{error || contextError}</p>
        </div>
      )}

      {/* Screens Grid */}
      {screens.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="text-4xl mb-4">📺</div>
            <h3 className="text-lg font-medium text-neutral-text-base mb-2">
              No screens yet
            </h3>
            <p className="text-neutral-text-muted mb-6">
              Get started by adding your first digital signage display
            </p>
            <Button onClick={() => setShowAddModal(true)}>
              Add Your First Screen
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {screens.map((screen) => (
            <Card key={screen.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-neutral-text-base mb-1">
                      {screen.name}
                    </h3>
                    <p className="text-sm text-neutral-text-muted">
                      ID: {screen.screen_id}
                    </p>
                  </div>
                  <ScreenStatus screen={screen} size="sm" showLastSeen={false} />
                </div>

                {screen.description && (
                  <p className="text-sm text-neutral-text-muted mb-3">
                    {screen.description}
                  </p>
                )}

                {screen.location && (
                  <p className="text-sm text-neutral-text-subtle mb-4">
                    📍 {screen.location}
                  </p>
                )}

                <div className="text-xs text-neutral-text-subtle mb-4">
                  {screen.last_seen ? (
                    <>Last seen {formatRelativeTime(screen.last_seen)}</>
                  ) : (
                    'Never connected'
                  )}
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    asChild
                    className="flex-1"
                  >
                    <Link href={`/dashboard/screens/${screen.id}`}>
                      View Details
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteScreen(screen.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add Screen Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Screen"
      >
        <form onSubmit={handleAddScreen} className="space-y-4">
          <Input
            label="Screen Name"
            value={newScreen.name}
            onChange={(e) => setNewScreen({ ...newScreen, name: e.target.value })}
            placeholder="e.g., Lobby Display"
            required
            disabled={submitting}
          />

          <Input
            label="Description"
            value={newScreen.description}
            onChange={(e) => setNewScreen({ ...newScreen, description: e.target.value })}
            placeholder="Optional description"
            disabled={submitting}
          />

          <Input
            label="Location"
            value={newScreen.location}
            onChange={(e) => setNewScreen({ ...newScreen, location: e.target.value })}
            placeholder="e.g., Main Lobby, Conference Room A"
            disabled={submitting}
          />

          {error && (
            <div className="p-3 bg-semantic-error-light border border-semantic-error rounded-lg">
              <p className="text-sm text-semantic-error">{error}</p>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowAddModal(false)}
              disabled={submitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={submitting}
              disabled={!newScreen.name}
              className="flex-1"
            >
              Add Screen
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}