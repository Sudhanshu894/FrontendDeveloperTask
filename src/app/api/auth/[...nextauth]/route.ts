import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";
import CredentialsProvider from "next-auth/providers/credentials";
import env from "@/config/env.config";
import { Profile } from "next-auth";

// Define a type for our users
interface User {
  email: string;
  password?: string;
  fullName: string;
  profilePicture?: string;
  verified: boolean;
  authProvider?: string;
  createdAt?: string;
}

// Extend the global object to include our users
declare global {
  var users: User[];
}

// For demo purposes, we'll use a global variable to store users
// In a real app, this would be a database
if (typeof global !== "undefined" && !global.users) {
  global.users = JSON.parse(process.env.DEMO_USERS || '[]');
}

// Configure NextAuth handlers
const handler = NextAuth({
  providers: [
    // Google OAuth provider
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    }),
    
    // Microsoft Azure AD provider
    AzureADProvider({
      clientId: env.MICROSOFT_CLIENT_ID,
      clientSecret: env.MICROSOFT_CLIENT_SECRET,
      tenantId: "common", // Use "common" for multi-tenant applications
    }),
    
    // Credentials provider for email/password login
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        
        try {
          // For demo purposes, we'll use the global users variable on the server
          // In a real app, you would query your database here
          
          // Get users from the global variable (server-side)
          let users: User[] = global.users || [];
          
          // If no users exist, create a demo user
          if (users.length === 0) {
            users = [{
              email: "demo@example.com",
              password: "Password123!",
              fullName: "Demo User",
              verified: true
            }];
            
            // Update global users
            global.users = users;
          }
          
          // Log the users for debugging
          console.log("Available users for authentication:", users.map(u => ({ email: u.email, password: u.password })));
          console.log("Credentials provided:", credentials);
          
          const user = users.find((u) => u.email === credentials.email);
          
          if (!user || user.password !== credentials.password) {
            console.log("Authentication failed: User not found or password mismatch");
            return null;
          }
          
          console.log("Authentication successful for user:", user.email);
          
          return {
            id: user.email,
            email: user.email,
            name: user.fullName,
            image: user.profilePicture,
            verified: user.verified
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Always allow sign in for credentials provider
      if (account?.provider === 'credentials') {
        return true;
      }
      
      // For OAuth providers, create or update user in our system
      if ((account?.provider === 'google' || account?.provider === 'azure-ad') && profile?.email) {
        try {
          // In a real app, you would update your database here
          // For demo purposes, we'll simulate localStorage
          
          // Create a user object from the OAuth profile
          const oauthProfile = profile as Profile & {
            given_name?: string;
            family_name?: string;
            picture?: string;
          };
          
          const oauthUser: User = {
            email: profile.email,
            fullName: profile.name || `${oauthProfile.given_name || ''} ${oauthProfile.family_name || ''}`.trim(),
            profilePicture: oauthProfile.picture || profile.image,
            verified: true,
            authProvider: account.provider,
            createdAt: new Date().toISOString()
          };
          
          // Store in global for server-side access
          if (typeof global !== 'undefined') {
            if (!global.users) {
              global.users = [];
            }
            
            const existingUserIndex = global.users.findIndex((u) => u.email === oauthUser.email);
            
            if (existingUserIndex === -1) {
              global.users.push(oauthUser);
            } else {
              global.users[existingUserIndex] = {
                ...global.users[existingUserIndex],
                ...oauthUser
              };
            }
          }
          
          return true;
        } catch (error) {
          console.error("Error saving OAuth user:", error);
          return true; // Still allow sign in even if saving fails
        }
      }
      
      return true;
    },
    async jwt({ token, user, account }) {
      // Add custom claims to the JWT token
      if (user) {
        token.verified = user.verified || false;
      }
      
      // If it's an OAuth sign-in, mark as verified
      if (account?.provider === "google" || account?.provider === "azure-ad") {
        token.verified = true;
      }
      
      return token;
    },
    async session({ session, token }) {
      // Add custom session properties
      if (session.user) {
        session.user.verified = token.verified as boolean;
      }
      
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt",
    maxAge: env.COOKIE_MAX_AGE,
  },
  debug: process.env.NODE_ENV === 'development',
  secret: env.NEXTAUTH_SECRET || env.JWT_SECRET,
});

export { handler as GET, handler as POST }; 