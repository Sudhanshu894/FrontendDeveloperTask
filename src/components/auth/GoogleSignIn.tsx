'use client';

import React from 'react';
import { signIn } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { FcGoogle } from 'react-icons/fc';
import Button from '@/components/ui/Button';
import { loginStart, loginFailure } from '@/redux/slices/userSlice';
import env from '@/config/env.config';

interface GoogleSignInProps {
  buttonText?: string;
  callbackUrl?: string;
  onError?: (error: string) => void;
}

const GoogleSignIn: React.FC<GoogleSignInProps> = ({
  buttonText = 'Sign in with Google',
  callbackUrl = '/dashboard',
  onError
}) => {
  const dispatch = useDispatch();

  const handleGoogleSignIn = async () => {
    try {
      // Skip if Google auth is disabled
      if (!env.ENABLE_GOOGLE_AUTH) {
        if (onError) {
          onError('Google authentication is currently disabled.');
        }
        return;
      }
      
      dispatch(loginStart());
      
      // Sign in with NextAuth Google provider
      await signIn('google', { 
        callbackUrl
      });
      
      // The rest will be handled by NextAuth callbacks and redirects
    } catch (error) {
      console.error('Google sign-in failed:', error);
      dispatch(loginFailure('Google sign-in failed'));
      
      if (onError) {
        onError('Google sign-in failed. Please try again.');
      }
    }
  };

  return (
    <Button 
      variant="social" 
      type="button" 
      onClick={handleGoogleSignIn}
      icon={<FcGoogle size={20} />}
    >
      {buttonText}
    </Button>
  );
};

export default GoogleSignIn; 