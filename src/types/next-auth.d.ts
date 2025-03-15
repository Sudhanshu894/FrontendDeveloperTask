import { DefaultSession } from 'next-auth';

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      verified?: boolean;
    } & DefaultSession['user'];
  }
  
  interface User {
    verified?: boolean;
  }
}

// Extend the JWT type
declare module 'next-auth/jwt' {
  interface JWT {
    verified?: boolean;
  }
} 