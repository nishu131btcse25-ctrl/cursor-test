'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { generateScreenId } from '@/lib/utils';
import Link from 'next/link';

export default function NewScreenPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      setError('');

      const screenId = generateScreenId();
      const { data, error } = await supabase
        .from('screens')
        .insert({
          user_id: user.id,
          name: formData.name,
          screen_id: screenId,
          description: formData.description || null,
          location: formData.location || null,
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      router.push(`/dashboard/screens/${data.id}`);
    } catch (error) {
      console.error('Error creating screen:', error);
      setError('Failed to create screen. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/screens">← Back to Screens</Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-base">
            Add New Screen
          </h1>
          <p className="text-neutral-text-muted">
            Create a new digital signage display
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            Screen Information
          </h2>
          <p className="text-sm text-neutral-text-muted">
            Provide details about your digital signage display
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Screen Name"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="e.g., Lobby Display, Conference Room A"
              required
              disabled={submitting}
              helperText="A descriptive name to identify this screen"
            />

            <Input
              label="Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Optional description of the screen's purpose"
              disabled={submitting}
              helperText="Additional details about this screen (optional)"
            />

            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Main Lobby, Conference Room A, Reception Area"
              disabled={submitting}
              helperText="Physical location of the display (optional)"
            />

            {error && (
              <div className="p-4 bg-semantic-error-light border border-semantic-error rounded-lg">
                <p className="text-sm text-semantic-error">{error}</p>
              </div>
            )}

            <div className="flex space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => router.push('/dashboard/screens')}
                disabled={submitting}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!formData.name}
                className="flex-1"
              >
                Create Screen
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Help Card */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            What happens next?
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-primary-600">1</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-text-base">
                  Screen Created
                </h3>
                <p className="text-sm text-neutral-text-muted">
                  Your screen will be created with a unique ID that you'll use for pairing
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-neutral-bg-elevated rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-neutral-text-muted">2</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-text-base">
                  Pair Your Device
                </h3>
                <p className="text-sm text-neutral-text-muted">
                  Use the pairing instructions to connect your display device
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-neutral-bg-elevated rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-neutral-text-muted">3</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-text-base">
                  Upload Content
                </h3>
                <p className="text-sm text-neutral-text-muted">
                  Add media files and create playlists to display on your screen
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}