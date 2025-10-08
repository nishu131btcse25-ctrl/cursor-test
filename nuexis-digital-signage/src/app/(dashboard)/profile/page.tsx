'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    timezone: user?.timezone || 'UTC',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setSubmitting(true);
      setError('');
      setSuccess('');

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name || null,
          timezone: formData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      setSuccess('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-text-base">Profile</h1>
        <p className="text-neutral-text-muted mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            Profile Information
          </h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              value={user.email}
              disabled
              helperText="Email address cannot be changed"
            />

            <Input
              label="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Enter your full name"
              disabled={submitting}
            />

            <Input
              label="Timezone"
              value={formData.timezone}
              onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
              disabled={submitting}
              helperText="Used for scheduling and time displays"
            />

            {error && (
              <div className="p-3 bg-semantic-error-light border border-semantic-error rounded-lg">
                <p className="text-sm text-semantic-error">{error}</p>
              </div>
            )}

            {success && (
              <div className="p-3 bg-semantic-success-light border border-semantic-success rounded-lg">
                <p className="text-sm text-semantic-success">{success}</p>
              </div>
            )}

            <Button
              type="submit"
              loading={submitting}
              disabled={!formData.full_name}
            >
              Update Profile
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            Account Actions
          </h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-neutral-bg-elevated rounded-lg">
              <div>
                <h3 className="font-medium text-neutral-text-base">Sign Out</h3>
                <p className="text-sm text-neutral-text-muted">
                  Sign out of your account on this device
                </p>
              </div>
              <Button variant="secondary" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}