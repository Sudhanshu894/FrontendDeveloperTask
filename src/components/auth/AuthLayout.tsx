'use client';

import Image from 'next/image';
import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="auth-container h-screen flex">
      {/* Left side with image and text */}
      <div className="auth-image-container h-full p-8">
        <div className="rounded-3xl h-full w-full relative overflow-hidden">
          <div className="w-full h-full relative">
            <Image 
              fill
              src="/images/team_workhive.png" 
              alt="Team collaboration" 
              className="auth-image object-cover"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-80 rounded-lg"></div>
            <div className="absolute inset-x-0 bottom-0 m-4 px-8 max-h-[50%] overflow-y-auto">
              <h1 className="auth-image-title text-white text-3xl font-bold mb-4">Welcome to WORKHIVE!</h1>
              <ul className="auth-image-list space-y-3">
                <li className="auth-image-list-item text-white/90 flex">
                  <span className="auth-image-list-item-bullet">•</span>
                  <span className="text-lg font-medium">Employee Management: View detailed profiles, track performance, and manage attendance.</span>
                </li>
                <li className="auth-image-list-item text-white/90 flex">
                  <span className="auth-image-list-item-bullet">•</span>
                  <span className="text-lg font-medium">Performance Insights: Analyze team goals, progress, and achievements.</span>
                </li>
                <li className="auth-image-list-item text-white/90 flex">
                  <span className="auth-image-list-item-bullet">•</span>
                  <span className="text-lg font-medium">Attendance & Leaves: Track attendance patterns and manage leave requests effortlessly.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side with form */}
      <div className="auth-form-container">
        <div className="auth-form">
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout; 