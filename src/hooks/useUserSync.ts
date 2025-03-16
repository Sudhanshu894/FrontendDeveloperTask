'use client';

import { useEffect } from 'react';

interface User {
  email: string;
  password?: string;
  fullName: string;
  verified: boolean;
  createdAt?: string;
  otp?: string;
  [key: string]: any;
}

export function useUserSync() {
  useEffect(() => {
    const syncUsersWithServer = async () => {
      try {
        // Create a demo user if no users exist in localStorage
        const storedUsers = localStorage.getItem('users');
        let users: User[] = [];
        
        if (!storedUsers || JSON.parse(storedUsers).length === 0) {
          const demoUser: User = {
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
        
        return { success: true, data };
      } catch (error) {
        console.error("Error syncing users:", error);
        return { success: false, error };
      }
    };
    
    syncUsersWithServer();
  }, []);

  const addUser = async (user: User): Promise<{ success: boolean; error?: any }> => {
    try {
      // Get existing users
      const storedUsers = localStorage.getItem('users');
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if user already exists
      const userExists = users.some((u) => u.email === user.email);
      
      if (userExists) {
        return { success: false, error: 'User already exists' };
      }
      
      // Add new user
      users.push({
        ...user,
        createdAt: user.createdAt || new Date().toISOString()
      });
      
      // Save updated users array
      localStorage.setItem('users', JSON.stringify(users));
      
      // Sync with server
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
      console.log("Users synced with server after adding user:", data);
      
      return { success: true };
    } catch (error) {
      console.error("Error adding user:", error);
      return { success: false, error };
    }
  };

  const updateUser = async (email: string, updates: Partial<User>): Promise<{ success: boolean; error?: any }> => {
    try {
      // Get existing users
      const storedUsers = localStorage.getItem('users');
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user index
      const userIndex = users.findIndex((u) => u.email === email);
      
      if (userIndex === -1) {
        return { success: false, error: 'User not found' };
      }
      
      // Update user
      users[userIndex] = {
        ...users[userIndex],
        ...updates
      };
      
      // Save updated users array
      localStorage.setItem('users', JSON.stringify(users));
      
      // Sync with server
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
      console.log("Users synced with server after updating user:", data);
      
      return { success: true };
    } catch (error) {
      console.error("Error updating user:", error);
      return { success: false, error };
    }
  };

  return {
    addUser,
    updateUser
  };
}

export default useUserSync; 