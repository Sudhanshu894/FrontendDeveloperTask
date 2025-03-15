'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiEye, FiEyeOff, FiCheck, FiX } from 'react-icons/fi';

import AuthLayout from '@/components/auth/AuthLayout';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

// Validation schema
const CreatePasswordSchema = Yup.object().shape({
  password: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Please confirm your password'),
});

export default function CreatePasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
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

  // Get email from sessionStorage on component mount
  useEffect(() => {
    const pendingEmail = sessionStorage.getItem('pendingVerification');
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // If no email in session, redirect to login
      router.push('/auth/login');
    }
  }, [router]);

  const handleCreatePassword = async (
    values: { password: string; confirmPassword: string },
    { setSubmitting }: { setSubmitting: (isSubmitting: boolean) => void }
  ) => {
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
        setSubmitting(false);
        return;
      }
      
      // Update user's password
      users[userIndex].password = values.password;
      
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
          console.log("Users synced with server after password update:", data);
        }
      } catch (error) {
        console.error("Error syncing users after password update:", error);
      }
      
      // Show success modal
      setModalProps({
        title: 'Password Updated',
        message: 'Your password has been updated successfully. You will be redirected to the login page.',
        type: 'success',
      });
      setShowModal(true);
      
      // Clear pending verification
      sessionStorage.removeItem('pendingVerification');
      
      // Redirect to login page after showing success message
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    } catch (error) {
      console.error('Password update error:', error);
      setModalProps({
        title: 'Update Error',
        message: 'An error occurred while updating your password. Please try again.',
        type: 'error',
      });
      setShowModal(true);
    } finally {
      setSubmitting(false);
    }
  };

  // Password validation checks
  const getPasswordStrength = (password: string) => {
    const checks = [
      { id: 'length', label: 'At least 8 characters', valid: password.length >= 8 },
      { id: 'uppercase', label: 'At least one uppercase letter', valid: /[A-Z]/.test(password) },
      { id: 'lowercase', label: 'At least one lowercase letter', valid: /[a-z]/.test(password) },
      { id: 'number', label: 'At least one number', valid: /[0-9]/.test(password) },
      { id: 'special', label: 'At least one special character', valid: /[^A-Za-z0-9]/.test(password) },
    ];
    
    return checks;
  };

  return (
    <AuthLayout>
      <div className="flex flex-col items-center max-h-full overflow-y-auto py-4 px-2">
      <h1 className="auth-title w-full text-left text-xl md:text-4xl">Create New Password</h1>
        <p className="auth-subtitle text-left text-sm md:text-base mb-4 md:mb-6 w-full">
          Choose a strong and secure password to keep your account safe.<br />
          Make sure it's easy for you to remember, but hard for others to guess!
        </p>
        
        <Formik
          initialValues={{ password: '', confirmPassword: '' }}
          validationSchema={CreatePasswordSchema}
          onSubmit={handleCreatePassword}
        >
          {({ isSubmitting, touched, errors, handleChange, handleBlur, values }) => {
            const passwordChecks = getPasswordStrength(values.password);
            const passwordsMatch = values.password === values.confirmPassword && values.confirmPassword !== '';
            
            return (
              <Form className="w-full">
                <div className="mb-3 md:mb-4">
                  <label htmlFor="password" className="input-label">Password</label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      className={`input-field pr-10 ${touched.password && errors.password ? 'input-error' : ''}`}
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[40%] transform -translate-y-1/2 text-[var(--paragraph)]"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {touched.password && errors.password && (
                    <div className="error-message mt-1">
                      <FiX size={14} />
                      <span>{errors.password}</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-3 md:mb-4">
                  <label htmlFor="confirmPassword" className="input-label">Re-enter your new password</label>
                  <div className="relative">
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      className={`input-field pr-10 ${touched.confirmPassword && errors.confirmPassword ? 'input-error' : ''}`}
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-[40%] transform -translate-y-1/2 text-[var(--paragraph)]"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                  {touched.confirmPassword && errors.confirmPassword && (
                    <div className="error-message mt-1">
                      <FiX size={14} />
                      <span>{errors.confirmPassword}</span>
                    </div>
                  )}
                  
                  {values.confirmPassword && passwordsMatch && (
                    <div className="flex items-center mt-1 text-[var(--success)] text-sm">
                      <FiCheck size={14} className="mr-1" />
                      <span>Passwords match</span>
                    </div>
                  )}
                </div>
                
                <div className="mb-4 md:mb-6 p-3 md:p-4 bg-[var(--input-bg)] rounded-md border border-[var(--input-border)]">
                  <h3 className="text-[var(--heading)] text-xs md:text-sm font-medium mb-2">Password must contain:</h3>
                  <ul className="space-y-1">
                    {passwordChecks.map((check) => (
                      <li key={check.id} className="flex items-center text-xs md:text-sm">
                        {check.valid ? (
                          <FiCheck className="mr-2 text-[var(--success)]" size={14} />
                        ) : (
                          <FiX className="mr-2 text-[var(--paragraph)]" size={14} />
                        )}
                        <span className={check.valid ? 'text-[var(--success)]' : 'text-[var(--paragraph)]'}>
                          {check.label}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Button 
                  type="submit" 
                  isLoading={isSubmitting}
                  disabled={!passwordsMatch || passwordChecks.some(check => !check.valid)}
                  className="w-full mb-4"
                >
                  Update Password
                </Button>
              </Form>
            );
          }}
        </Formik>
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
