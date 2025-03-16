'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

interface UseAuthErrorsProps {
  setModalProps: (props: { title: string; message: string; type: 'success' | 'error' | 'warning' | 'info' }) => void;
  setShowModal: (show: boolean) => void;
}

export function useAuthErrors({ setModalProps, setShowModal }: UseAuthErrorsProps) {
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      let errorMessage = 'An error occurred during authentication.';
      let errorTitle = 'Authentication Error';
      
      switch (error) {
        case 'OAuthSignin':
          errorMessage = 'There was a problem starting the OAuth sign-in process.';
          break;
        case 'OAuthCallback':
          errorMessage = 'There was a problem with the OAuth callback. Please check your client ID and secret.';
          break;
        case 'OAuthCreateAccount':
          errorMessage = 'There was a problem creating your account with the OAuth provider.';
          break;
        case 'EmailCreateAccount':
          errorMessage = 'There was a problem creating your account.';
          break;
        case 'Callback':
          errorMessage = 'There was a problem with the authentication callback.';
          break;
        case 'CredentialsSignin':
          errorMessage = 'Invalid email or password.';
          errorTitle = 'Login Failed';
          break;
        case 'AccessDenied':
          errorMessage = 'Access denied. You do not have permission to sign in.';
          break;
        default:
          errorMessage = `Authentication error: ${error}`;
      }
      
      setModalProps({
        title: errorTitle,
        message: errorMessage,
        type: 'error',
      });
      setShowModal(true);
    }
  }, [searchParams, setModalProps, setShowModal]);
}

export default useAuthErrors; 