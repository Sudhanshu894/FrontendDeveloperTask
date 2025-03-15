'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { FiClock, FiX, FiCopy, FiCheck } from 'react-icons/fi';

import AuthLayout from '@/components/auth/AuthLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { loginSuccess } from '@/redux/slices/userSlice';

// Toast Notification Component
const Toast = ({ message, onClose }: { message: string; onClose: () => void }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed top-4 right-4 z-50 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-md shadow-lg p-4 max-w-xs w-full flex flex-col">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-[var(--heading)] font-medium">Your OTP Code</h3>
        <button onClick={onClose} className="text-[var(--paragraph)] hover:text-[var(--heading)]">
          <FiX size={18} />
        </button>
      </div>
      <p className="text-[var(--paragraph)] mb-2">Use this code to verify your account:</p>
      <div className="flex justify-between items-center bg-[var(--background)] p-2 rounded border border-[var(--input-border)]">
        <span className="font-mono text-[var(--heading)] font-bold">{message}</span>
        <button 
          onClick={handleCopy} 
          className="text-[var(--primary)] hover:text-[var(--heading)] transition-colors"
          title={copied ? "Copied!" : "Copy to clipboard"}
        >
          {copied ? <FiCheck size={18} /> : <FiCopy size={18} />}
        </button>
      </div>
    </div>
  );
};

export default function VerifyOtpPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const [otp, setOtp] = useState<string[]>(Array(6).fill(''));
  const [email, setEmail] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalProps, setModalProps] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    title: '',
    message: '',
    type: 'success',
  });
  const [seconds, setSeconds] = useState<number>(30);
  const [timerExpired, setTimerExpired] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');

  // Get email and OTP from sessionStorage on component mount
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingVerification');
    if (pendingEmail) {
      setEmail(pendingEmail);
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user with the matching email
      const user = users.find((u: any) => u.email === pendingEmail);
      
      if (user && user.otp) {
        // Show toast with OTP
        setToastMessage(user.otp);
        setShowToast(true);
      }
    } else {
      // If no email in session, redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  // Timer countdown effect
  useEffect(() => {
    if (seconds <= 0) {
      setTimerExpired(true);
      return;
    }

    const timer = setInterval(() => {
      setSeconds((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [seconds]);

  // Handle input change for OTP
  const handleOtpChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const value = e.target.value;
    
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;
    
    // Take the last character if multiple characters are pasted
    const digit = value.slice(-1);
    
    // Update the OTP array
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    
    // Move to next input if a digit was entered
    if (digit && index < 5 && e.target.nextElementSibling) {
      (e.target.nextElementSibling as HTMLInputElement).focus();
    }
  };

  // Handle key down for OTP input
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === 'Backspace' && !otp[index] && index > 0 && e.currentTarget.previousElementSibling) {
      (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
    }
  };

  // Handle paste for OTP input
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').trim();
    
    // Check if pasted data contains only digits
    if (!/^\d+$/.test(pastedData)) return;
    
    // Fill the OTP inputs with the pasted digits
    const digits = pastedData.slice(0, 6).split('');
    const newOtp = [...otp];
    
    digits.forEach((digit, index) => {
      if (index < 6) {
        newOtp[index] = digit;
      }
    });
    
    setOtp(newOtp);
    
    // Focus the next empty input or the last input
    const inputs = e.currentTarget.parentElement?.querySelectorAll('input');
    if (inputs) {
      const focusIndex = Math.min(digits.length, 5);
      inputs[focusIndex].focus();
    }
  };

  const handleVerifyOtp = async () => {
    const otpString = otp.join('');
    
    if (otpString.length !== 6) {
      setModalProps({
        title: 'Invalid OTP',
        message: 'Please enter a valid 6-digit OTP.',
        type: 'error',
      });
      setShowModal(true);
      return;
    }

    setIsSubmitting(true);

    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user with the matching email
      const user = users.find((u: any) => u.email === email);
      
      if (!user) {
        setModalProps({
          title: 'User Not Found',
          message: 'We could not find your account. Please sign up again.',
          type: 'error',
        });
        setShowModal(true);
        setIsSubmitting(false);
        return;
      }
      
      // Check if OTP matches
      if (user.otp === otpString) {
        // Update user as verified
        user.verified = true;
        
        // Update localStorage
        localStorage.setItem('users', JSON.stringify(users));
        
        // Sync users with server
        try {
          const response = await fetch('/api/auth/sync-users', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ users }),
          });
          
          if (!response.ok) {
            console.error('Failed to sync users with server');
          } else {
            const data = await response.json();
            console.log("Users synced with server after verification:", data);
          }
        } catch (error) {
          console.error("Error syncing users after verification:", error);
        }
        
        // Update Redux state
        dispatch(loginSuccess({ 
          email: user.email, 
          name: user.fullName, 
          verified: true 
        }));
        
        // Keep pending verification for password creation
        // sessionStorage.removeItem('pendingVerification');
        
        // Set auth cookie
        document.cookie = `auth=${JSON.stringify({ 
          email: user.email, 
          name: user.fullName,
          verified: true 
        })}; path=/; max-age=86400`;
        
        setModalProps({
          title: 'Verification Successful',
          message: 'Your account has been verified successfully. You will be redirected to create a new password.',
          type: 'success',
        });
        setShowModal(true);
        
        // Redirect to create password page after showing success message
        setTimeout(() => {
          router.push('/auth/create-password');
        }, 2000);
      } else {
        setModalProps({
          title: 'Invalid OTP',
          message: 'The OTP you entered is incorrect. Please try again.',
          type: 'error',
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setModalProps({
        title: 'Verification Error',
        message: 'An error occurred during verification. Please try again.',
        type: 'error',
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find the user with the matching email
      const userIndex = users.findIndex((u: any) => u.email === email);
      
      if (userIndex === -1) {
        setModalProps({
          title: 'User Not Found',
          message: 'We could not find your account. Please sign up again.',
          type: 'error',
        });
        setShowModal(true);
        return;
      }
      
      // Generate new OTP
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user's OTP
      users[userIndex].otp = newOtp;
      
      // Update localStorage
      localStorage.setItem('users', JSON.stringify(users));
      
      console.log("[OTP] New OTP generated:", newOtp);
      
      // Show toast with new OTP
      setToastMessage(newOtp);
      setShowToast(true);
      
      setModalProps({
        title: 'OTP Resent',
        message: `A new OTP has been sent to ${email}. Please check your inbox.`,
        type: 'success',
      });
      setShowModal(true);
      
      // Reset timer
      setSeconds(30);
      setTimerExpired(false);
    } catch (error) {
      console.error('Resend OTP error:', error);
      setModalProps({
        title: 'Error',
        message: 'Failed to resend OTP. Please try again.',
        type: 'error',
      });
      setShowModal(true);
    }
  };

  const handleChangeEmail = () => {
    sessionStorage.removeItem('pendingVerification');
    router.push('/auth/login');
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center max-h-full overflow-y-auto py-4 px-2">
        <h1 className="auth-title text-center text-xl md:text-2xl">Enter OTP</h1>
        <p className="auth-subtitle text-center text-sm md:text-base mb-3 md:mb-4">
          Enter the OTP that we have sent to your email address<br />
          <span className="font-medium">{email}</span>
        </p>
        
        <button 
          onClick={handleChangeEmail}
          className="link text-left w-full text-sm mb-4 md:mb-6"
          type="button"
        >
          Change Email Address
        </button>
        
        <div className="w-full flex justify-between gap-1 md:gap-2 mb-4 md:mb-6">
          {Array.from({ length: 6 }, (_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              value={otp[index]}
              onChange={(e) => handleOtpChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              className="otp-digit w-full"
              style={{ height: '2.75rem' }}
              aria-label={`Digit ${index + 1}`}
              autoComplete="one-time-code"
            />
          ))}
        </div>
        
        <div className="flex items-center self-start mb-4 md:mb-6">
          {!timerExpired ? (
            <>
              <FiClock className="mr-1" style={{ color: 'var(--paragraph)' }} />
              <span style={{ color: 'var(--paragraph)', fontSize: '0.875rem' }}>
                {seconds} Sec
              </span>
            </>
          ) : (
            <button 
              onClick={handleResendOtp} 
              className="link text-sm"
              type="button"
            >
              Resend Code
            </button>
          )}
        </div>
        
        <Button 
          onClick={handleVerifyOtp} 
          isLoading={isSubmitting}
          disabled={otp.join('').length !== 6}
          className="w-full mb-4"
        >
          Continue
        </Button>
        
        <p className="text-center mt-2 mb-4" style={{ color: 'var(--paragraph)', fontSize: '0.875rem' }}>
          <Link href="/auth/login" className="link">
            Back to Sign In
          </Link>
        </p>
      </div>
      
      {showToast && (
        <Toast message={toastMessage} onClose={() => setShowToast(false)} />
      )}
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
    </AuthLayout>
  );
} 