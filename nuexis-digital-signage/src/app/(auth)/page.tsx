'use client';

import React, { useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';

export default function AuthPage() {
  const { signIn, verifyOtp, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [error, setError] = useState('');
  const [isEmailSent, setIsEmailSent] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await signIn(email);
      setIsEmailSent(true);
      setShowOtpModal(true);
    } catch (err) {
      setError('Failed to send verification email. Please try again.');
    }
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await verifyOtp(email, otp);
      // Redirect will be handled by auth context
    } catch (err) {
      setError('Invalid verification code. Please try again.');
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await signIn(email);
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    }
  };

  return (
    <>
      <Card className="shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-neutral-text-base">
            NuExis Digital Signage
          </h1>
          <p className="text-neutral-text-muted mt-2">
            Sign in to manage your digital signage displays
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              required
              disabled={loading}
            />
            
            {error && (
              <div className="p-3 bg-semantic-error-light border border-semantic-error rounded-lg">
                <p className="text-sm text-semantic-error">{error}</p>
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full"
              loading={loading}
              disabled={!email}
            >
              Send Verification Code
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* OTP Verification Modal */}
      <Modal
        isOpen={showOtpModal}
        onClose={() => setShowOtpModal(false)}
        title="Verify Your Email"
      >
        <div className="space-y-4">
          <p className="text-sm text-neutral-text-muted">
            We've sent a verification code to <strong>{email}</strong>
          </p>
          
          <form onSubmit={handleOtpSubmit} className="space-y-4">
            <Input
              label="Verification Code"
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter 6-digit code"
              maxLength={6}
              required
              disabled={loading}
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
                onClick={handleResendOtp}
                disabled={loading}
                className="flex-1"
              >
                Resend Code
              </Button>
              <Button
                type="submit"
                className="flex-1"
                loading={loading}
                disabled={otp.length !== 6}
              >
                Verify
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  );
}