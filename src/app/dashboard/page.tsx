'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import { loginSuccess, loginFailure, logout } from '@/redux/slices/userSlice';
import Image from 'next/image';

export default function DashboardPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session, status } = useSession();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.user);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status
    if (status === 'loading') {
      return; // Wait for session to load
    }
    
    setIsLoading(false);
    
    if (status === 'unauthenticated') {
      dispatch(loginFailure('You must be logged in to access this page'));
      router.push('/auth/login');
      return;
    }
    
    // If we have a session but Redux state is not updated, sync them
    if (status === 'authenticated' && session && !isAuthenticated) {
      dispatch(loginSuccess({
        email: session.user?.email || '',
        name: session.user?.name || '',
        verified: session.user?.verified || false,
        profilePicture: session.user?.image || undefined
      }));
    }
    
    // Check if user is verified
    if (session?.user && session.user.verified === false) {
      router.push('/auth/verify-otp');
      return;
    }
  }, [status, session, isAuthenticated, router, dispatch]);

  const handleLogout = async () => {
    try {
      // Sign out from NextAuth
      await signOut({ redirect: false });
      
      // Clear session storage
      sessionStorage.removeItem('pendingVerification');
      
      // Dispatch logout action to Redux
      dispatch(logout());
      
      // Redirect to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--background)' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2" style={{ borderColor: 'var(--primary)' }}></div>
      </div>
    );
  }

  if (status === 'unauthenticated' || !session) {
    return null;
  }

  // Use session data or Redux state (prefer session as it's more up-to-date)
  const userData = {
    name: session?.user?.name || user?.name || 'User',
    email: session?.user?.email || user?.email || '',
    verified: session?.user?.verified || user?.verified || false,
    image: session?.user?.image || user?.profilePicture
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8" style={{ backgroundColor: 'var(--background)' }}>
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 md:p-8" style={{ backgroundColor: 'var(--card-background)' }}>
        <h1 className="text-2xl md:text-3xl font-bold mb-6" style={{ color: 'var(--heading)' }}>
          Dashboard
        </h1>
        
        <div className="mb-8 p-4 md:p-6 border rounded-lg" style={{ borderColor: 'var(--input-border)' }}>
          <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
            {userData.image && (
              <div className="relative w-20 h-20 rounded-full overflow-hidden">
                <Image 
                  src={userData.image} 
                  alt="Profile" 
                  fill 
                  style={{ objectFit: 'cover' }}
                  className="rounded-full"
                />
              </div>
            )}
            <div>
              <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--heading)' }}>
                Welcome, {userData.name}!
              </h2>
              <p style={{ color: 'var(--paragraph)' }}>
                You have successfully logged in to the application. This is your dashboard.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 md:p-6 border rounded-lg" style={{ borderColor: 'var(--input-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--heading)' }}>
              Account Information
            </h3>
            <p style={{ color: 'var(--paragraph)' }}>
              Email: {userData.email || 'Not available'}
            </p>
            <p style={{ color: 'var(--paragraph)' }}>
              Name: {userData.name || 'Not available'}
            </p>
            <p style={{ color: 'var(--paragraph)' }}>
              Account Type: {userData.image ? 'Google Account' : 'Standard'}
            </p>
            <p style={{ color: 'var(--paragraph)' }}>
              Verified: {userData.verified ? 'Yes' : 'No'}
            </p>
          </div>
          
          <div className="p-4 md:p-6 border rounded-lg" style={{ borderColor: 'var(--input-border)' }}>
            <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--heading)' }}>
              Recent Activity
            </h3>
            <p style={{ color: 'var(--paragraph)' }}>
              No recent activity to display.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-md text-white"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 