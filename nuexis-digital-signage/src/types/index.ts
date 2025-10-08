import { Database } from '@/lib/supabase';

// Database types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];

export type Screen = Database['public']['Tables']['screens']['Row'];
export type ScreenInsert = Database['public']['Tables']['screens']['Insert'];
export type ScreenUpdate = Database['public']['Tables']['screens']['Update'];

// Application types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  timezone: string;
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
  verifyOtp: (email: string, token: string) => Promise<void>;
}

export interface ScreenStatus {
  isOnline: boolean;
  lastSeen: string | null;
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
}

export interface MediaItem {
  id: string;
  name: string;
  file_path: string;
  mime_type: string;
  file_size: number;
  duration?: number;
  width?: number;
  height?: number;
  thumbnail_path?: string;
  is_processed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  items: PlaylistItem[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PlaylistItem {
  media_id: string;
  duration: number;
  order: number;
}

export interface Schedule {
  id: string;
  screen_id: string;
  playlist_id: string;
  name: string;
  description?: string;
  start_time: string;
  end_time: string;
  recurrence_pattern: 'none' | 'daily' | 'weekly' | 'monthly' | 'custom';
  recurrence_data?: any;
  priority: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// UI Component types
export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}