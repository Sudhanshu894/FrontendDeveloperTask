'use client';

import React from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MdError } from 'react-icons/md';
import usePasswordVisibility from '@/hooks/usePasswordVisibility';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
  togglePassword?: () => void; // Allow parent to control password visibility
  showPassword?: boolean; // Allow parent to control password visibility state
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  touched,
  type = 'text',
  togglePassword,
  showPassword: externalShowPassword,
  ...props
}) => {
  // Use the hook only if togglePassword is not provided
  const { showPassword: internalShowPassword, togglePasswordVisibility } = 
    usePasswordVisibility(false);
  
  // Use either external or internal state
  const showPassword = togglePassword !== undefined ? externalShowPassword : internalShowPassword;
  const isPasswordType = type === 'password';
  const hasError = touched && error;

  return (
    <div className="mb-4">
      <label className="input-label">{label}</label>
      <div className="relative">
        <input
          type={isPasswordType && showPassword ? 'text' : type}
          className={`input-field ${hasError ? 'input-error' : ''}`}
          {...props}
        />
        {isPasswordType && (
          <button
            type="button"
            className="absolute right-3 top-[40%] transform translate-y-[-50%] flex items-center justify-center"
            style={{ color: 'var(--paragraph)' }}
            onClick={togglePassword || togglePasswordVisibility}
          >
            {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
          </button>
        )}
      </div>
      {hasError && (
        <div className="error-message">
          <MdError />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default InputField; 