'use client';

import React, { Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import Link from 'next/link';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import * as Yup from 'yup';

import AuthLayout from '@/components/auth/AuthLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AuthFormDivider from '@/components/auth/AuthFormDivider';
import SocialSignInButtons from '@/components/auth/SocialSignInButtons';
import LoadingFallback from '@/components/ui/LoadingFallback';
import useAuthForm from '@/hooks/useAuthForm';
import usePasswordVisibility from '@/hooks/usePasswordVisibility';
import useFormValidation from '@/hooks/useFormValidation';
import useUserSync from '@/hooks/useUserSync';
import { loginSuccess } from '@/redux/slices/userSlice';

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

function SignupContent() {
  const router = useRouter();
  const dispatch = useDispatch();
  
  // Use custom hooks
  const { 
    showModal, 
    setShowModal, 
    isSubmitting, 
    modalProps, 
    setModalProps,
    handleOAuthError,
    showErrorModal,
    showSuccessModal,
    showInfoModal,
    startSubmitting,
    stopSubmitting
  } = useAuthForm();
  
  const { showPassword, togglePasswordVisibility } = usePasswordVisibility();
  const { showPassword: showConfirmPassword, togglePasswordVisibility: toggleConfirmPasswordVisibility } = usePasswordVisibility();
  
  const { addUser } = useUserSync();
  
  const { 
    formValues, 
    errors, 
    handleChange, 
    validateForm 
  } = useFormValidation({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      termsAccepted: false
    },
    validationSchema: SignupSchema
  });

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    startSubmitting();
    
    try {
      // Validate form
      const isValid = await validateForm();
      
      if (isValid) {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Generate random 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Add new user with OTP
        const result = await addUser({
          fullName: formValues.fullName,
          email: formValues.email,
          password: formValues.password,
          verified: false,
          otp
        });
        
        if (!result.success) {
          if (result.error === 'User already exists') {
            showInfoModal(
              'User Already Exists',
              'An account with this email already exists. Please sign in instead.'
            );
            return;
          } else {
            throw new Error(result.error || 'Failed to create user');
          }
        }
        
        console.log("[Signup] User created successfully with OTP:", otp);
        
        // Store email in session for OTP verification
        sessionStorage.setItem('pendingVerification', formValues.email);
        
        dispatch(loginSuccess({ email: formValues.email, name: formValues.fullName, verified: false }));
        
        // Redirect to OTP verification page
        router.push('/auth/verify-otp');
      }
    } catch (error) {
      console.error('Signup failed:', error);
      showErrorModal(
        'Signup Error',
        'An error occurred during signup. Please try again.'
      );
    } finally {
      stopSubmitting();
    }
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
        
        <AuthFormDivider />
        
        <SocialSignInButtons 
          buttonTextPrefix="Sign up"
          callbackUrl="/dashboard"
          onError={handleOAuthError}
        />
        
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

export default function SignupPage() {
  return (
    <Suspense fallback={<LoadingFallback message="Loading signup page..." />}>
      <SignupContent />
    </Suspense>
  );
}