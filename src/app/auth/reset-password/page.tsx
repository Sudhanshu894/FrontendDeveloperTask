'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import Link from 'next/link';

import AuthLayout from '@/components/auth/AuthLayout';
import InputField from '@/components/ui/InputField';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// Validation schema
const ResetPasswordSchema = Yup.object().shape({
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
});

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [showModal, setShowModal] = useState(false);
  const [modalProps, setModalProps] = useState<{
    title: string;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
  }>({
    title: '',
    message: '',
    type: 'success',
  });

  // Validate token
  if (!token) {
    return (
      <div className="text-center">
        <h1 className="auth-title">Invalid Link</h1>
        <p className="auth-subtitle">The password reset link is invalid or has expired.</p>
        <Link href="/auth/forgot-password">
          <Button className="mt-6">Request New Link</Button>
        </Link>
      </div>
    );
  }

  const handleResetPassword = async (values: { 
    password: string; 
    confirmPassword: string;
  }, { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // For demo purposes, we'll just simulate a successful password reset
      setModalProps({
        title: 'Password Reset Successful',
        message: 'Your password has been reset successfully. You can now log in with your new password.',
        type: 'success',
      });
      setShowModal(true);
      
      // Redirect after showing success message
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
      
    } catch (error) {
      setModalProps({
        title: 'Error',
        message: 'An error occurred while resetting your password. Please try again.',
        type: 'error',
      });
      setShowModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <h1 className="auth-title">Reset Password</h1>
      <p className="auth-subtitle">Enter your new password below.</p>
      
      <Formik
        initialValues={{ password: '', confirmPassword: '' }}
        validationSchema={ResetPasswordSchema}
        onSubmit={handleResetPassword}
      >
        {({ isSubmitting, touched, errors }) => (
          <Form>
            <InputField
              label="New Password"
              name="password"
              type="password"
              placeholder="••••••••••••"
              error={errors.password}
              touched={touched.password}
            />
            
            <InputField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••••••"
              error={errors.confirmPassword}
              touched={touched.confirmPassword}
            />
            
            <Button type="submit" isLoading={isSubmitting} className="mt-6">
              Reset Password
            </Button>
          </Form>
        )}
      </Formik>
      
      <p className="text-center mt-6" style={{ color: 'var(--paragraph)', fontSize: '0.875rem' }}>
        Remember your password?{' '}
        <Link href="/auth/login" className="link">
          Back to Sign In
        </Link>
      </p>
      
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={modalProps.title}
        message={modalProps.message}
        type={modalProps.type}
      />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthLayout>
      <Suspense fallback={
        <div className="flex justify-center items-center h-full">
          <p>Loading reset password page...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </AuthLayout>
  );
} 