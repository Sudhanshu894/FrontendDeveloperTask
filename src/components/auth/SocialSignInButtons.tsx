'use client';

import React from 'react';
import GoogleSignIn from './GoogleSignIn';
import MicrosoftSignIn from './MicrosoftSignIn';
import env from '@/config/env.config';

interface SocialSignInButtonsProps {
  buttonTextPrefix?: string;
  callbackUrl?: string;
  onError: (error: string) => void;
}

const SocialSignInButtons: React.FC<SocialSignInButtonsProps> = ({
  buttonTextPrefix = 'Sign in',
  callbackUrl = '/dashboard',
  onError
}) => {
  return (
    <div className="space-y-3 w-full">
      {env.ENABLE_GOOGLE_AUTH && (
        <GoogleSignIn 
          buttonText={`${buttonTextPrefix} with Google`}
          callbackUrl={callbackUrl}
          onError={onError}
        />
      )}
      
      {env.ENABLE_MICROSOFT_AUTH && (
        <MicrosoftSignIn 
          buttonText={`${buttonTextPrefix} with Microsoft`}
          callbackUrl={callbackUrl}
          onError={onError}
        />
      )}
    </div>
  );
};

export default SocialSignInButtons; 