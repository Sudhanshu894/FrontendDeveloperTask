'use client';

import React, { useState } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { MdError } from 'react-icons/md';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  touched?: boolean;
}

const InputField: React.FC<InputFieldProps> = ({
  label,
  error,
  touched,
  type = 'text',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
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
            onClick={() => setShowPassword(!showPassword)}
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