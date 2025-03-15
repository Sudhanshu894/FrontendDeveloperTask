'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';

import AuthLayout from '@/components/auth/AuthLayout';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// Validation schema
const ForgotPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
});

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    buttonText?: string;
  }>({
    title: '',
    message: '',
    type: 'success',
  });

  const handleForgotPassword = async (values: { email: string }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      // Update email state
      setEmail(values.email);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get users from localStorage
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      
      // Find user with matching email
      const userIndex = users.findIndex((u: any) => u.email === values.email);
      
      if (userIndex === -1) {
        setModalProps({
          title: 'User Not Found',
          message: 'No account found with this email. Please sign up first.',
          type: 'error',
          buttonText: 'Try Again'
        });
        setShowModal(true);
        setSubmitting(false);
        return;
      }
      
      // Generate random 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Update user's OTP
      users[userIndex].otp = otp;
      
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
          console.log("Users synced with server after OTP update:", data);
        }
      } catch (error) {
        console.error("Error syncing users after OTP update:", error);
      }
      
      // Store email in session for OTP verification
      sessionStorage.setItem('pendingVerification', values.email);
      
      // Set OTP in cookies
      document.cookie = `reset_otp=${otp}; path=/; max-age=3600`;
      
      // Show success modal
      setModalProps({
        title: 'Reset OTP Sent',
        message: `We've sent a password reset OTP to ${values.email}. Please check your inbox.`,
        type: 'success',
        buttonText: 'Verify OTP'
      });
      setShowModal(true);
      
      // Show browser notification with OTP
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          new Notification('Password Reset OTP', {
            body: `Your OTP is: ${otp}`,
            icon: '/favicon.ico'
          });
        } else if (Notification.permission !== 'denied') {
          Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
              new Notification('Password Reset OTP', {
                body: `Your OTP is: ${otp}`,
                icon: '/favicon.ico'
              });
            }
          });
        }
      }
      
      // Log OTP for demo purposes
      console.log("[Reset Password] OTP generated:", otp);
      
      // Redirect to verify-otp page after a short delay
      setTimeout(() => {
        router.push('/auth/verify-otp');
      }, 2000);
      
    } catch (error) {
      setModalProps({
        title: 'Error',
        message: 'An error occurred. Please try again.',
        type: 'error',
        buttonText: 'Try Again'
      });
      setShowModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Custom modal close handler to redirect to verify-otp page
  const handleModalClose = () => {
    setShowModal(false);
    
    // If it was a success modal, redirect to verify-otp page
    if (modalProps.type === 'success') {
      router.push('/auth/verify-otp');
    }
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center max-h-full overflow-y-auto py-4 px-2">
      <h1 className="auth-title w-full text-left text-xl md:text-4xl py-3">Forgot Password</h1>
        <p className="auth-subtitle text-left text-xs md:text-base mb-4 md:mb-6 w-full">
          Enter your email address and we'll send you a link to reset your password.
        </p>
        
        <Formik
          initialValues={{ email: email }}
          validationSchema={ForgotPasswordSchema}
          onSubmit={handleForgotPassword}
          enableReinitialize
        >
          {({ isSubmitting, touched, errors, handleChange, values }) => (
            <Form className="w-full">
              <InputField
                label="Email Address"
                name="email"
                type="email"
                placeholder="youremail@workhive.com"
                error={errors.email}
                touched={touched.email}
                value={values.email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  handleChange(e);
                  setEmail(e.target.value);
                }}
              />
              
              <Button type="submit" isLoading={isSubmitting} className="mt-4 md:mt-6 mb-4">
                Send Reset Link
              </Button>
            </Form>
          )}
        </Formik>
        
        <p className="text-center mt-2 mb-4" style={{ color: 'var(--paragraph)', fontSize: '0.875rem' }}>
          Remember your password?{' '}
          <Link href="/auth/login" className="link">
            Back to Sign In
          </Link>
        </p>
      </div>
      
      <Modal
        isOpen={showModal}
        onClose={handleModalClose}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
        buttonText={modalProps.buttonText}
      />
    </AuthLayout>
  );
} 