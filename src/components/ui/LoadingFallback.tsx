'use client';

import React from 'react';
import AuthLayout from '@/components/auth/AuthLayout';

interface LoadingFallbackProps {
  message?: string;
  withAuthLayout?: boolean;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ 
  message = 'Loading...', 
  withAuthLayout = true 
}) => {
  const content = (
    <div className="flex justify-center items-center h-full">
      <p>{message}</p>
    </div>
  );

  if (withAuthLayout) {
    return <AuthLayout>{content}</AuthLayout>;
  }

  return content;
};

export default LoadingFallback; 