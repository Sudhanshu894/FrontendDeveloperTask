'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import * as Yup from 'yup';

import AuthLayout from '@/components/auth/AuthLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import MicrosoftSignIn from '@/components/auth/MicrosoftSignIn';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/userSlice';
import env from '@/config/env.config';

// Validation schema
const SignupSchema = Yup.object().shape({
  fullName: Yup.string()
    .required('Full name is required')
    .min(2, 'Name must be at least 2 characters'),
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'
    ),
  confirmPassword: Yup.string()
    .required('Please confirm your password')
    .oneOf([Yup.ref('password')], 'Passwords must match'),
  termsAccepted: Yup.boolean()
    .required('You must accept the terms and conditions')
    .oneOf([true], 'You must accept the terms and conditions'),
});

export default function SignupPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [modalProps, setModalProps] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    title: '',
    message: '',
    type: 'success',
  });

  // Form state
  const [formValues, setFormValues] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false
  });

  // Errors state
  const [errors, setErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    termsAccepted?: string;
  }>({});

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormValues({
      ...formValues,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Toggle confirm password visibility
  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  // Validate form
  const validateForm = async () => {
    try {
      await SignupSchema.validate(formValues, { abortEarly: false });
      setErrors({});
      return true;
    } catch (err) {
      if (err instanceof Yup.ValidationError) {
        const validationErrors: Record<string, string> = {};
        err.inner.forEach((error) => {
          if (error.path) {
            validationErrors[error.path] = error.message;
          }
        });
        setErrors(validationErrors);
      }
      return false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      dispatch(loginStart());
      
      // Validate form
      const isValid = await validateForm();
      
      if (isValid) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Save user data to localStorage for demo purposes
        // In a real app, this would be a server API call
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // Check if user already exists
        const userExists = users.some((user: any) => user.email === formValues.email);
        
        if (userExists) {
          dispatch(loginFailure('User already exists'));
          setModalProps({
            title: 'User Already Exists',
            message: 'An account with this email already exists. Please sign in instead.',
            type: 'info',
          });
          setShowModal(true);
          setIsSubmitting(false);
          return;
        }
        
        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Add new user with OTP
        users.push({
          fullName: formValues.fullName,
          email: formValues.email,
          password: formValues.password, // In a real app, this would be hashed
          createdAt: new Date().toISOString(),
          verified: false,
          otp: otp
        });
        
        // Save updated users array
        localStorage.setItem('users', JSON.stringify(users));
        console.log("[Signup] User created successfully with OTP:", otp);
        
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
            console.log("Users synced with server after signup:", data);
          }
        } catch (error) {
          console.error("Error syncing users after signup:", error);
        }
        
        // Store email in session for OTP verification
        sessionStorage.setItem('pendingVerification', formValues.email);
        
        dispatch(loginSuccess({ email: formValues.email, name: formValues.fullName, verified: false }));
        
        // Redirect to OTP verification page
        router.push('/auth/verify-otp');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      dispatch(loginFailure('An error occurred during signup'));
      setModalProps({
        title: 'Signup Error',
        message: 'An error occurred during signup. Please try again.',
        type: 'error',
      });
      setShowModal(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuthSignInError = (errorMessage: string) => {
    setModalProps({
      title: 'Signup Error',
      message: errorMessage,
      type: 'error',
    });
    setShowModal(true);
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center max-h-full overflow-y-auto py-4 px-2">
      <h1 className="auth-title w-full text-left text-xl md:text-4xl">Create Account</h1>
        <p className="auth-subtitle text-left text-sm md:text-base mb-4 md:mb-6 w-full">
          Join our platform to manage your workspace efficiently.
        </p>
        
        <form onSubmit={handleSignup} className="w-full">
          <div className="mb-3 md:mb-4">
            <label htmlFor="fullName" className="block mb-1 md:mb-2 text-xs md:text-sm font-medium" style={{ color: 'var(--paragraph)' }}>
              Full Name
            </label>
            <input
              id="fullName"
              name="fullName"
              type="text"
              placeholder="John Doe"
              value={formValues.fullName}
              onChange={handleChange}
              className="w-full p-2 md:p-2.5 rounded-lg border text-xs md:text-sm"
              style={{ 
                backgroundColor: 'var(--input-bg)',
                borderColor: errors.fullName ? 'var(--error)' : 'var(--input-border)',
                color: 'var(--heading)'
              }}
            />
            {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
          </div>
          
          <div className="mb-3 md:mb-4">
            <label htmlFor="email" className="block mb-1 md:mb-2 text-xs md:text-sm font-medium" style={{ color: 'var(--paragraph)' }}>
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="youremail@workhive.com"
              value={formValues.email}
              onChange={handleChange}
              className="w-full p-2 md:p-2.5 rounded-lg border text-xs md:text-sm"
              style={{ 
                backgroundColor: 'var(--input-bg)',
                borderColor: errors.email ? 'var(--error)' : 'var(--input-border)',
                color: 'var(--heading)'
              }}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>
          
          <div className="mb-3 md:mb-4">
            <label htmlFor="password" className="block mb-1 md:mb-2 text-xs md:text-sm font-medium" style={{ color: 'var(--paragraph)' }}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formValues.password}
                onChange={handleChange}
                className="w-full p-2 md:p-2.5 rounded-lg border text-xs md:text-sm"
                style={{ 
                  backgroundColor: 'var(--input-bg)',
                  borderColor: errors.password ? 'var(--error)' : 'var(--input-border)',
                  color: 'var(--heading)'
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={togglePasswordVisibility}
              >
                {showPassword ? (
                  <FiEyeOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>
          
          <div className="mb-3 md:mb-4">
            <label htmlFor="confirmPassword" className="block mb-1 md:mb-2 text-xs md:text-sm font-medium" style={{ color: 'var(--paragraph)' }}>
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="••••••••••••"
                value={formValues.confirmPassword}
                onChange={handleChange}
                className="w-full p-2 md:p-2.5 rounded-lg border text-xs md:text-sm"
                style={{ 
                  backgroundColor: 'var(--input-bg)',
                  borderColor: errors.confirmPassword ? 'var(--error)' : 'var(--input-border)',
                  color: 'var(--heading)'
                }}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                ) : (
                  <FiEye className="h-4 w-4 md:h-5 md:w-5 text-gray-400" />
                )}
              </button>
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
          
          <div className="flex items-start mb-4 md:mb-6">
            <div className="flex items-center h-5">
              <input
                id="termsAccepted"
                name="termsAccepted"
                type="checkbox"
                checked={formValues.termsAccepted}
                onChange={handleChange}
                className="h-3 w-3 md:h-4 md:w-4 rounded cursor-pointer"
                style={{ 
                  accentColor: 'var(--primary)',
                  borderColor: 'var(--input-border)'
                }}
              />
            </div>
            <div className="ml-2 text-xs md:text-sm">
              <label htmlFor="termsAccepted" className="cursor-pointer" style={{ color: 'var(--paragraph)' }}>
                I agree to the <Link href="/terms" className="link">Terms of Service</Link> and <Link href="/privacy" className="link">Privacy Policy</Link>
              </label>
              {errors.termsAccepted && (
                <p className="text-red-500 text-xs mt-1">{errors.termsAccepted}</p>
              )}
            </div>
          </div>
          
          <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting} className="mb-4">
            Create Account
          </Button>
        </form>
        
        <div className="divider w-full">
          <div className="divider-line"></div>
          <span className="divider-text">or</span>
          <div className="divider-line"></div>
        </div>
        
        <div className="space-y-3 w-full">
          {env.ENABLE_GOOGLE_AUTH && (
            <GoogleSignIn 
              buttonText="Sign up with Google"
              callbackUrl="/dashboard"
              onError={handleOAuthSignInError}
            />
          )}
          
          {env.ENABLE_MICROSOFT_AUTH && (
            <MicrosoftSignIn 
              buttonText="Sign up with Microsoft"
              callbackUrl="/dashboard"
              onError={handleOAuthSignInError}
            />
          )}
        </div>
        
        <p className="text-center mt-4 mb-4" style={{ color: 'var(--paragraph)', fontSize: '0.875rem' }}>
          Already have an account?{' '}
          <Link href="/auth/login" className="link">
            Sign In
          </Link>
        </p>
      </div>
      
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