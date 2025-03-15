// Global type definitions for the application

export interface User {
  email: string;
  password?: string;
  fullName: string;
  profilePicture?: string;
  verified: boolean;
  authProvider?: string;
  createdAt?: string;
  otp?: string;
}

// Extend the global object to include our users
declare global {
  var users: User[];
} 