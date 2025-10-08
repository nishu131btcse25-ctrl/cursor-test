'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          router.push('/auth?error=callback_error');
          return;
        }

        if (data.session) {
          // Check if user has a profile, create one if not
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('id')
            .eq('id', data.session.user.id)
            .single();

          if (profileError && profileError.code === 'PGRST116') {
            // Profile doesn't exist, create one
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                id: data.session.user.id,
                email: data.session.user.email!,
                full_name: data.session.user.user_metadata?.full_name || null,
                avatar_url: data.session.user.user_metadata?.avatar_url || null,
                timezone: 'UTC',
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              router.push('/auth?error=profile_creation_failed');
              return;
            }
          } else if (profileError) {
            console.error('Error checking profile:', profileError);
            router.push('/auth?error=profile_check_failed');
            return;
          }

          // Redirect to dashboard
          router.push('/dashboard');
        } else {
          router.push('/auth');
        }
      } catch (error) {
        console.error('Unexpected error in auth callback:', error);
        router.push('/auth?error=unexpected_error');
      }
    };

    handleAuthCallback();
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p className="text-neutral-text-muted">Completing sign in...</p>
      </div>
    </div>
  );
}