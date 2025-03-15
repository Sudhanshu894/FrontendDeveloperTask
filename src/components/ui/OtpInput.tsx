'use client';

import React, { useState, useRef, useEffect } from 'react';

interface OtpInputProps {
  value: string;
  onChange: (otp: string) => void;
  numInputs: number;
  inputType?: string;
  renderInput: (props: React.InputHTMLAttributes<HTMLInputElement> & {
    ref: React.RefCallback<HTMLInputElement>;
  }) => React.ReactNode;
}

const OtpInput: React.FC<OtpInputProps> = ({ 
  value, 
  onChange, 
  numInputs, 
  inputType = 'text',
  renderInput 
}) => {
  const [otp, setOtp] = useState<string[]>(value.split('').concat(Array(numInputs - value.length).fill('')));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Focus the first empty input on mount
    const firstEmptyIndex = otp.findIndex(digit => !digit);
    const indexToFocus = firstEmptyIndex === -1 ? numInputs - 1 : firstEmptyIndex;
    
    if (inputRefs.current[indexToFocus]) {
      inputRefs.current[indexToFocus]?.focus();
    }
  }, []);

  useEffect(() => {
    // Update internal state when value prop changes
    if (value !== otp.join('')) {
      setOtp(value.split('').concat(Array(numInputs - value.length).fill('')));
    }
  }, [value, numInputs]);

  useEffect(() => {
    // Notify parent component when OTP changes
    onChange(otp.join(''));
  }, [otp, onChange]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const val = e.target.value;
    
    // Only allow numbers if inputType is number
    if (inputType === 'number' && !/^\d*$/.test(val)) return;
    
    // Take the last character if multiple characters are pasted
    const digit = val.slice(-1);
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Move to next input if a digit was entered
    if (digit && index < numInputs - 1 && inputRefs.current[index + 1]) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && inputRefs.current[index - 1]) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data contains only digits if inputType is number
    if (inputType === 'number' && !/^\d+$/.test(pastedData)) return;
    
    // Fill the OTP inputs with the pasted digits
    const digits = pastedData.slice(0, numInputs).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      newOtp[index] = digit;
    });
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const focusIndex = Math.min(digits.length, numInputs - 1);
    if (inputRefs.current[focusIndex]) {
      inputRefs.current[focusIndex]?.focus();
    }
  };

  return (
    <div className="otp-container">
      {Array.from({ length: numInputs }, (_, index) => (
        <React.Fragment key={index}>
          {renderInput({
            type: inputType,
            maxLength: 1,
            ref: (ref: HTMLInputElement | null) => (inputRefs.current[index] = ref),
            value: otp[index] || '',
            onChange: (e) => handleChange(e as React.ChangeEvent<HTMLInputElement>, index),
            onKeyDown: (e) => handleKeyDown(e as React.KeyboardEvent<HTMLInputElement>, index),
            onPaste: handlePaste,
            className: "otp-input",
            'aria-label': `Digit ${index + 1}`,
            autoComplete: "one-time-code"
          })}
        </React.Fragment>
      ))}
    </div>
  );
};

export default OtpInput; 