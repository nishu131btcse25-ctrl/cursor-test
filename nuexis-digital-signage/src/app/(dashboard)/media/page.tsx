'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function MediaPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-text-base">Media Library</h1>
          <p className="text-neutral-text-muted mt-1">
            Manage your media files and playlists
          </p>
        </div>
        <Button>
          Upload Media
        </Button>
      </div>

      {/* Coming Soon */}
      <Card>
        <CardContent className="p-12 text-center">
          <div className="text-4xl mb-4">🎬</div>
          <h3 className="text-lg font-medium text-neutral-text-base mb-2">
            Media Library Coming Soon
          </h3>
          <p className="text-neutral-text-muted mb-6">
            This feature is currently under development. You'll be able to upload and manage your media files here.
          </p>
          <div className="text-sm text-neutral-text-subtle">
            Phase 3: Media Library & File Uploads
          </div>
        </CardContent>
      </Card>
    </div>
  );
}