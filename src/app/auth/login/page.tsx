'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useDispatch } from 'react-redux';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';

import AuthLayout from '@/components/auth/AuthLayout';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import GoogleSignIn from '@/components/auth/GoogleSignIn';
import MicrosoftSignIn from '@/components/auth/MicrosoftSignIn';
import { loginStart, loginSuccess, loginFailure } from '@/redux/slices/userSlice';
import env from '@/config/env.config';

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
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isFormValid, setIsFormValid] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [modalProps, setModalProps] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    title: '',
    message: '',
    type: 'success',
  });

  // Sync localStorage users with server on page load
  useEffect(() => {
    const syncUsersWithServer = async () => {
      try {
        // Create a demo user if no users exist in localStorage
        const storedUsers = localStorage.getItem('users');
        let users = [];
        
        if (!storedUsers || JSON.parse(storedUsers).length === 0) {
          const demoUser = {
            email: "demo@example.com",
            password: "Password123!",
            fullName: "Demo User",
            verified: true,
            createdAt: new Date().toISOString()
          };
          users = [demoUser];
          localStorage.setItem('users', JSON.stringify(users));
          console.log("Created demo user in localStorage:", demoUser);
        } else {
          users = JSON.parse(storedUsers);
        }
        
        // Sync users with server
        const response = await fetch('/api/auth/sync-users', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ users }),
        });
        
        if (!response.ok) {
          throw new Error('Failed to sync users with server');
        }
        
        const data = await response.json();
        console.log("Users synced with server:", data);
      } catch (error) {
        console.error("Error syncing users:", error);
      }
    };
    
    syncUsersWithServer();
  }, []);

  // Check for authentication errors
  useEffect(() => {
    const error = searchParams.get('error');
    
    if (error) {
      let errorMessage = 'An error occurred during authentication.';
      let errorTitle = 'Authentication Error';
      
      switch (error) {
        case 'OAuthSignin':
          errorMessage = 'There was a problem starting the OAuth sign-in process.';
          break;
        case 'OAuthCallback':
          errorMessage = 'There was a problem with the OAuth callback. Please check your client ID and secret.';
          break;
        case 'OAuthCreateAccount':
          errorMessage = 'There was a problem creating your account with the OAuth provider.';
          break;
        case 'EmailCreateAccount':
          errorMessage = 'There was a problem creating your account.';
          break;
        case 'Callback':
          errorMessage = 'There was a problem with the authentication callback.';
          break;
        case 'CredentialsSignin':
          errorMessage = 'Invalid email or password.';
          errorTitle = 'Login Failed';
          break;
        case 'AccessDenied':
          errorMessage = 'Access denied. You do not have permission to sign in.';
          break;
        default:
          errorMessage = `Authentication error: ${error}`;
      }
      
      setModalProps({
        title: errorTitle,
        message: errorMessage,
        type: 'error',
      });
      setShowModal(true);
    }
  }, [searchParams]);

  // Redirect if already authenticated
  useEffect(() => {
    if (status === 'authenticated' && session && !isRedirecting) {
      setIsRedirecting(true);
      
      // Update Redux state
      dispatch(loginSuccess({
        email: session.user?.email || '',
        name: session.user?.name || '',
        verified: session.user?.verified || false,
        profilePicture: session.user?.image || undefined
      }));
      
      // Show success message
      setModalProps({
        title: 'Login Successful',
        message: 'You have successfully signed in. Redirecting to dashboard...',
        type: 'success',
      });
      setShowModal(true);
      
      // Redirect to dashboard
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    }
  }, [status, session, dispatch, router, isRedirecting]);

  const handleLogin = async (values: { email: string; password: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      dispatch(loginStart());
      
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
          dispatch(loginFailure(result.error));
          setModalProps({
            title: 'Login Failed',
            message: 'Invalid email or password. Please try again.',
            type: 'error',
          });
          setShowModal(true);
        }
        
        // The session update and redirect will be handled by the useEffect above
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
      dispatch(loginFailure('An error occurred during login'));
      setModalProps({
        title: 'Login Error',
        message: 'An error occurred during login. Please try again.',
        type: 'error',
      });
      setShowModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuthSignInError = (errorMessage: string) => {
    setModalProps({
      title: 'Login Error',
      message: errorMessage,
      type: 'error',
    });
    setShowModal(true);
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
        
        <div className="divider w-full">
          <div className="divider-line"></div>
          <span className="divider-text">or</span>
          <div className="divider-line"></div>
        </div>
        
        <div className="space-y-3 w-full">
          {env.ENABLE_GOOGLE_AUTH && (
            <GoogleSignIn 
              buttonText="Sign in with Google"
              callbackUrl="/dashboard"
              onError={handleOAuthSignInError}
            />
          )}
          
          {env.ENABLE_MICROSOFT_AUTH && (
            <MicrosoftSignIn 
              buttonText="Sign in with Microsoft"
              callbackUrl="/dashboard"
              onError={handleOAuthSignInError}
            />
          )}
        </div>
        
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
    <Suspense fallback={
      <AuthLayout>
        <div className="flex justify-center items-center h-full">
          <p>Loading...</p>
        </div>
      </AuthLayout>
    }>
      <LoginContent />
    </Suspense>
  );
} 