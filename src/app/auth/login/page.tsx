'use client';

import React, { useState, Suspense } from 'react';
import { signIn } from 'next-auth/react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';

import AuthLayout from '@/components/auth/AuthLayout';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AuthFormDivider from '@/components/auth/AuthFormDivider';
import SocialSignInButtons from '@/components/auth/SocialSignInButtons';
import LoadingFallback from '@/components/ui/LoadingFallback';
import useAuthForm from '@/hooks/useAuthForm';
import useUserSync from '@/hooks/useUserSync';
import useAuthErrors from '@/hooks/useAuthErrors';
import useAuthSession from '@/hooks/useAuthSession';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  password: Yup.string()
    .required('Password is required')
    .min(6, 'Password must be at least 6 characters'),
});

// Add TypeScript interface for Google
declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize?: (config: any) => void;
          prompt?: (callback?: any) => void;
        }
      }
    }
  }
}

function LoginContent() {
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
    startSubmitting,
    stopSubmitting
  } = useAuthForm();
  
  // Use user sync hook
  useUserSync();
  
  // Use auth errors hook
  useAuthErrors({ setModalProps, setShowModal });
  
  // Use auth session hook
  useAuthSession({ showSuccessModal });
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);

  const handleLogin = async (values: { email: string; password: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      startSubmitting();
      
      // Update state with form values
      setEmail(values.email);
      setPassword(values.password);
      
      // Check if all fields are filled and valid
      if (values.email && values.password && LoginSchema.isValidSync(values)) {
        setIsFormValid(true);
        
        // Sign in with NextAuth credentials provider
        const result = await signIn('credentials', {
          redirect: false,
          email: values.email,
          password: values.password,
        });
        
        if (result?.error) {
          showErrorModal(
            'Login Failed',
            'Invalid email or password. Please try again.'
          );
        }
        
        // The session update and redirect will be handled by the useAuthSession hook
      } else {
        setIsFormValid(false);
        setModalProps({
          title: 'Validation Error',
          message: 'Please fill in all required fields correctly.',
          type: 'warning',
        });
        setShowModal(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      showErrorModal(
        'Login Error',
        'An error occurred during login. Please try again.'
      );
    } finally {
      setSubmitting(false);
      stopSubmitting();
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center max-h-full overflow-y-auto py-4 px-2">
        <h1 className="auth-title w-full text-left text-xl md:text-4xl">Sign In</h1>
        <p className="auth-subtitle text-left text-sm md:text-base mb-4 md:mb-6 w-full">
          Manage your workspace seamlessly. Sign in to continue.
        </p>
        
        <Formik
          initialValues={{ email: '', password: '', rememberMe: false }}
          validationSchema={LoginSchema}
          onSubmit={handleLogin}
        >
          {({ isSubmitting, touched, errors, values, handleChange }) => (
            <Form className="w-full">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="youremail@workhive.com"
                error={errors.email}
                touched={touched.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  setEmail(e.target.value);
                }}
              />
              
              <InputField
                label="Password"
                name="password"
                type="password"
                placeholder="••••••••••••"
                error={errors.password}
                touched={touched.password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  setPassword(e.target.value);
                }}
              />
              
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <div className="flex items-center">
                  <Field
                    id="rememberMe"
                    name="rememberMe"
                    type="checkbox"
                    className="h-4 w-4 rounded cursor-pointer"
                    style={{ 
                      accentColor: 'var(--primary)',
                      borderColor: 'var(--input-border)'
                    }}
                  />
                  <label htmlFor="rememberMe" className="ml-2 block text-xs md:text-sm cursor-pointer" style={{ color: 'var(--paragraph)' }}>
                    Remember me
                  </label>
                </div>
                
                <Link href="/auth/forgot-password" className="link text-xs md:text-sm">
                  Forgot Password?
                </Link>
              </div>
              
              <Button type="submit" isLoading={isSubmitting} className="mb-4">
                Sign In
              </Button>
            </Form>
          )}
        </Formik>
        
        <AuthFormDivider />
        
        <SocialSignInButtons 
          buttonTextPrefix="Sign in"
          callbackUrl="/dashboard"
          onError={handleOAuthError}
        />
        
        <p className="text-center mt-4 mb-4" style={{ color: 'var(--paragraph)', fontSize: '0.875rem' }}>
         {`Don't have an account? `}
          <Link href="/auth/signup" className="link">
            Sign Up
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

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback message="Loading login page..." />}>
      <LoginContent />
    </Suspense>
  );
} 