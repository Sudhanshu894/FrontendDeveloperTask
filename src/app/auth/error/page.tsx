'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import AuthLayout from '@/components/auth/AuthLayout';
import Button from '@/components/ui/Button';

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('An unknown authentication error occurred.');
  const [errorTitle, setErrorTitle] = useState('Authentication Error');

  useEffect(() => {
    // Get error details from URL
    const error = searchParams.get('error');
    
    if (error) {
      let message = 'An unknown authentication error occurred.';
      let title = 'Authentication Error';
      
      switch (error) {
        case 'Configuration':
          message = 'There is a problem with the server configuration. Please contact support.';
          break;
        case 'AccessDenied':
          message = 'Access denied. You do not have permission to sign in.';
          title = 'Access Denied';
          break;
        case 'Verification':
          message = 'The verification link is invalid or has expired.';
          title = 'Verification Failed';
          break;
        case 'OAuthSignin':
          message = 'There was a problem starting the OAuth sign-in process. Please try again.';
          break;
        case 'OAuthCallback':
          message = 'There was a problem with the OAuth callback. Please check your client ID and secret.';
          break;
        case 'OAuthCreateAccount':
          message = 'There was a problem creating your account with the OAuth provider.';
          break;
        case 'EmailCreateAccount':
          message = 'There was a problem creating your account.';
          break;
        case 'Callback':
          message = 'There was a problem with the authentication callback.';
          break;
        case 'OAuthAccountNotLinked':
          message = 'To confirm your identity, sign in with the same account you used originally.';
          title = 'Account Not Linked';
          break;
        case 'EmailSignin':
          message = 'The email could not be sent. Please try again later.';
          title = 'Email Sign-in Failed';
          break;
        case 'CredentialsSignin':
          message = 'Invalid email or password. Please check your credentials and try again.';
          title = 'Login Failed';
          break;
        case 'SessionRequired':
          message = 'You must be signed in to access this page.';
          title = 'Authentication Required';
          break;
        default:
          message = `Authentication error: ${error}`;
      }
      
      setErrorMessage(message);
      setErrorTitle(title);
    }
  }, [searchParams]);

  return (
    <AuthLayout>
      <div className="flex flex-col items-center max-h-full overflow-y-auto py-4 px-2">
        <div className="w-full text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: 'var(--heading)' }}>
            {errorTitle}
          </h1>
          <div className="p-4 rounded-md mb-6" style={{ backgroundColor: 'rgba(var(--error-rgb), 0.1)', color: 'var(--error)' }}>
            <p className="text-sm md:text-base">{errorMessage}</p>
          </div>
          <p className="text-sm md:text-base mb-6" style={{ color: 'var(--paragraph)' }}>
            Please try again or contact support if the problem persists.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 w-full">
          <Button
            onClick={() => router.push('/auth/login')}
            className="flex-1"
          >
            Return to Login
          </Button>
          
          <Link href="/" className="flex-1">
            <Button variant="outline" className="w-full">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </AuthLayout>
  );
} 