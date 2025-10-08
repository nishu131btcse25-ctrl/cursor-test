'use client';

import React from 'react';
import { useScreens } from '@/lib/screen-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function DashboardPage() {
  const { screens } = useScreens();
  
  const onlineScreens = screens.filter(screen => screen.is_online).length;
  
  const stats = [
    {
      title: 'Total Screens',
      value: screens.length.toString(),
      description: 'Active displays',
      icon: '📺',
      href: '/dashboard/screens',
    },
    {
      title: 'Media Library',
      value: '0',
      description: 'Uploaded files',
      icon: '🎬',
      href: '/dashboard/media',
    },
    {
      title: 'Active Playlists',
      value: '0',
      description: 'Scheduled content',
      icon: '📋',
      href: '/dashboard/media',
    },
    {
      title: 'Online Now',
      value: onlineScreens.toString(),
      description: 'Connected screens',
      icon: '🟢',
      href: '/dashboard/screens',
    },
  ];

  const quickActions = [
    {
      title: 'Add New Screen',
      description: 'Connect a new display device',
      icon: '➕',
      href: '/dashboard/screens/new',
    },
    {
      title: 'Upload Media',
      description: 'Add images, videos, or documents',
      icon: '📤',
      href: '/dashboard/media',
    },
    {
      title: 'Create Playlist',
      description: 'Organize your content',
      icon: '📝',
      href: '/dashboard/media',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-neutral-text-base">Dashboard</h1>
        <p className="text-neutral-text-muted mt-1">
          Manage your digital signage displays and content
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Link key={stat.title} href={stat.href}>
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-text-muted">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-neutral-text-base mt-1">
                      {stat.value}
                    </p>
                    <p className="text-xs text-neutral-text-subtle mt-1">
                      {stat.description}
                    </p>
                  </div>
                  <div className="text-2xl">{stat.icon}</div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-neutral-text-base mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action) => (
            <Link key={action.title} href={action.href}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">{action.icon}</div>
                    <div>
                      <h3 className="font-medium text-neutral-text-base">
                        {action.title}
                      </h3>
                      <p className="text-sm text-neutral-text-muted">
                        {action.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Getting Started */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-neutral-text-base">
            Getting Started
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
                  Add Your First Screen
                </h3>
                <p className="text-sm text-neutral-text-muted">
                  Connect a display device to start showing content
                </p>
                <Button size="sm" className="mt-2" asChild>
                  <Link href="/dashboard/screens/new">Add Screen</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-neutral-bg-elevated rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-neutral-text-muted">2</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-text-base">
                  Upload Media Files
                </h3>
                <p className="text-sm text-neutral-text-muted">
                  Add images, videos, and documents to your media library
                </p>
                <Button size="sm" variant="secondary" className="mt-2" asChild>
                  <Link href="/dashboard/media">Upload Media</Link>
                </Button>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-neutral-bg-elevated rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-neutral-text-muted">3</span>
              </div>
              <div>
                <h3 className="font-medium text-neutral-text-base">
                  Create Playlists
                </h3>
                <p className="text-sm text-neutral-text-muted">
                  Organize your content into playlists for scheduled display
                </p>
                <Button size="sm" variant="secondary" className="mt-2" asChild>
                  <Link href="/dashboard/media">Create Playlist</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}