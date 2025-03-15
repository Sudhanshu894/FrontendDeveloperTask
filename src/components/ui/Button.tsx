'use client';

import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'social' | 'outline';
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  isLoading = false,
  icon,
  className = '',
  ...props
}) => {
  let baseClasses = 'primary-button';
  
  if (variant === 'social') {
    baseClasses = 'social-button';
  } else if (variant === 'outline') {
    baseClasses = 'outline-button';
  }

  return (
    <button
      className={`${baseClasses} ${isLoading ? 'opacity-70 cursor-not-allowed' : ''} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
          <span>Loading...</span>
        </div>
      ) : (
        <div className="flex items-center justify-center">
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </div>
      )}
    </button>
  );
};

export default Button; 