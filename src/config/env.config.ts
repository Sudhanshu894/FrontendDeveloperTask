/**
 * Environment Configuration
 * 
 * This file validates and exports all environment variables used in the application.
 * It ensures that required variables are present and provides type safety.
 */

// Function to get environment variables with validation
const getEnvVar = (key: string, defaultValue?: string, required = true): string => {
  const value = process.env[key] || defaultValue;
  
  if (required && !value) {
    throw new Error(`Environment variable ${key} is required but not set.`);
  }
  
  return value || '';
};

// Environment variables configuration
export const env = {
  // Node environment
  NODE_ENV: getEnvVar('NODE_ENV', 'development'),
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  
  // API URLs
  API_URL: getEnvVar('NEXT_PUBLIC_API_URL', '/api'),
  
  // Authentication
  GOOGLE_CLIENT_ID: getEnvVar('NEXT_PUBLIC_GOOGLE_CLIENT_ID', 'YOUR_GOOGLE_CLIENT_ID', false),
  GOOGLE_CLIENT_SECRET: getEnvVar('GOOGLE_CLIENT_SECRET', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET || 'YOUR_GOOGLE_CLIENT_SECRET', false),
  MICROSOFT_CLIENT_ID: getEnvVar('NEXT_PUBLIC_MICROSOFT_CLIENT_ID', '', false),
  MICROSOFT_CLIENT_SECRET: getEnvVar('MICROSOFT_CLIENT_SECRET', process.env.NEXT_PUBLIC_MICROSOFT_CLIENT_SECRET || '', false),
  
  // NextAuth
  NEXTAUTH_URL: getEnvVar('NEXTAUTH_URL', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  NEXTAUTH_SECRET: getEnvVar('NEXTAUTH_SECRET', process.env.JWT_SECRET || 'your-nextauth-secret-key-for-development-only', !process.env.NODE_ENV?.includes('prod')),
  
  // JWT Secret (for server-side)
  JWT_SECRET: getEnvVar('JWT_SECRET', 'your-jwt-secret-key-for-development-only', !process.env.NODE_ENV?.includes('prod')),
  
  // Cookie settings
  COOKIE_NAME: getEnvVar('NEXT_PUBLIC_COOKIE_NAME', 'auth'),
  COOKIE_MAX_AGE: parseInt(getEnvVar('NEXT_PUBLIC_COOKIE_MAX_AGE', '86400'), 10), // 24 hours in seconds
  
  // Application settings
  APP_NAME: getEnvVar('NEXT_PUBLIC_APP_NAME', 'WorkHive'),
  APP_URL: getEnvVar('NEXT_PUBLIC_APP_URL', 'http://localhost:3000'),
  
  // Feature flags
  ENABLE_GOOGLE_AUTH: getEnvVar('NEXT_PUBLIC_ENABLE_GOOGLE_AUTH', 'true') === 'true',
  ENABLE_MICROSOFT_AUTH: getEnvVar('NEXT_PUBLIC_ENABLE_MICROSOFT_AUTH', 'true') === 'true',
  
  // Validation helper functions
  isValidUrl: (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch (error) {
      return false;
    }
  },
  
  // Validate configuration
  validate: (): void => {
    // Validate API URL format if provided
    if (process.env.NEXT_PUBLIC_API_URL && !env.isValidUrl(process.env.NEXT_PUBLIC_API_URL)) {
      console.warn(`Invalid API URL format: ${process.env.NEXT_PUBLIC_API_URL}`);
    }
    
    // Validate APP URL format
    if (process.env.NEXT_PUBLIC_APP_URL && !env.isValidUrl(process.env.NEXT_PUBLIC_APP_URL)) {
      console.warn(`Invalid APP URL format: ${process.env.NEXT_PUBLIC_APP_URL}`);
    }
    
    // Log environment mode
    console.info(`Application running in ${env.NODE_ENV} mode`);
  }
};

// Validate configuration on import
if (typeof window === 'undefined') {
  // Only run validation on server-side to avoid console logs in browser
  env.validate();
}

export default env; 