'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { loginSuccess } from '@/redux/slices/userSlice';

interface UseAuthSessionProps {
  redirectTo?: string;
  redirectDelay?: number;
  onAuthenticated?: () => void;
  showSuccessModal?: (title: string, message: string) => void;
}

export function useAuthSession({
  redirectTo = '/dashboard',
  redirectDelay = 1500,
  onAuthenticated,
  showSuccessModal
}: UseAuthSessionProps = {}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated' && session && !isRedirecting) {
      setIsRedirecting(true);
      
      // Update Redux state
      dispatch(loginSuccess({
        email: session.user?.email || '',
        name: session.user?.name || '',
        verified: session.user?.verified || false,
        profilePicture: session.user?.image || undefined
      }));
      
      // Show success message if provided
      if (showSuccessModal) {
        showSuccessModal(
          'Login Successful',
          `You have successfully signed in. Redirecting to ${redirectTo === '/dashboard' ? 'dashboard' : redirectTo}...`
        );
      }
      
      // Call onAuthenticated callback if provided
      if (onAuthenticated) {
        onAuthenticated();
      }
      
      // Redirect to specified path
      if (redirectTo) {
        setTimeout(() => {
          router.push(redirectTo);
        }, redirectDelay);
      }
    }
  }, [status, session, dispatch, router, isRedirecting, redirectTo, redirectDelay, onAuthenticated, showSuccessModal]);

  return {
    session,
    status,
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    isRedirecting
  };
}

export default useAuthSession; 