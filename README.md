# 🚀 Next.js Authentication Platform

![Next.js](https://img.shields.io/badge/Next.js-14.2.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0.4-blue?style=for-the-badge&logo=typescript)
![NextAuth.js](https://img.shields.io/badge/NextAuth.js-4.24.5-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18.2.0-61DAFB?style=for-the-badge&logo=react)
![Redux](https://img.shields.io/badge/Redux-4.2.1-764ABC?style=for-the-badge&logo=redux)

A modern, secure authentication platform built with Next.js, featuring multi-provider authentication, responsive design, and comprehensive user management.

## ✨ Features

### 🔐 Authentication
- **Multi-provider Authentication**: Support for credentials, Google, and Microsoft authentication
- **JWT-based Sessions**: Secure session management with JWT tokens
- **Password Reset Flow**: Complete password reset functionality with email verification
- **OTP Verification**: One-time password verification for enhanced security

### 🎨 UI/UX
- **Responsive Design**: Mobile-first approach with responsive layouts
- **Dark Mode**: Sleek dark theme for better user experience
- **Form Validation**: Client-side validation using Formik and Yup
- **Toast Notifications**: User-friendly notifications for actions and errors
- **Loading States**: Visual feedback during asynchronous operations

### 🛠️ Technical Features
- **TypeScript**: Type-safe code throughout the application
- **Redux State Management**: Centralized state management for user data
- **API Routes**: Serverless API endpoints for authentication and user management
- **Environment Configuration**: Secure environment variable management
- **Error Handling**: Comprehensive error handling and user feedback

## 📱 Pages

### Authentication Flow
- **Login**: Email/password login with social authentication options
- **Signup**: New user registration with validation
- **Forgot Password**: Password recovery flow
- **Reset Password**: Secure password reset with token validation
- **Verify OTP**: One-time password verification
- **Error Page**: Custom error handling for authentication issues

### User Dashboard
- **Dashboard**: User-specific dashboard after successful authentication

## 🧩 Components

### Authentication Components
- **GoogleSignIn**: Google OAuth authentication component
- **MicrosoftSignIn**: Microsoft OAuth authentication component
- **AuthLayout**: Consistent layout for all authentication pages
- **SessionProvider**: NextAuth session provider wrapper

### UI Components
- **Button**: Customizable button with variants (primary, social, outline)
- **InputField**: Form input with validation and error display
- **Modal**: Reusable modal for notifications and confirmations
- **OtpInput**: One-time password input component

## 🔧 Technical Implementation

### NextAuth Configuration
- Custom JWT callbacks for user verification
- Provider-specific configuration for Google and Microsoft
- Session management with custom properties

### API Routes
- `/api/auth/[...nextauth]`: NextAuth API routes
- `/api/auth/sync-users`: User synchronization endpoint

### State Management
- Redux slices for user authentication state
- Persistent state with local storage

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/nextjs-auth-platform.git
cd nextjs-auth-platform
```

2. Install dependencies
```bash
npm install
# or
yarn install
```

3. Set up environment variables
```bash
cp .env.example .env.local
```
Edit `.env.local` with your configuration:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your-microsoft-client-id
MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

4. Run the development server
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📝 Code Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/                # API Routes
│   │   └── auth/           # Authentication API endpoints
│   ├── auth/               # Authentication pages
│   │   ├── login/          # Login page
│   │   ├── signup/         # Signup page
│   │   ├── error/          # Auth error page
│   │   └── ...             # Other auth pages
│   └── dashboard/          # User dashboard
├── components/             # React components
│   ├── auth/               # Auth-specific components
│   └── ui/                 # UI components
├── config/                 # Configuration files
├── redux/                  # Redux state management
│   └── slices/             # Redux slices
└── types/                  # TypeScript type definitions
```

## 🔍 Key Technical Challenges Solved

1. **NextAuth Integration**: Seamless integration with NextAuth.js for multi-provider authentication
2. **Type Safety**: Comprehensive TypeScript types for NextAuth and custom components
3. **Client-Side Rendering**: Proper implementation of client components with Suspense boundaries
4. **Form Validation**: Robust form validation with Formik and Yup
5. **Responsive Design**: Mobile-first approach with responsive layouts
6. **Error Handling**: Comprehensive error handling for authentication flows

## 🛠️ Technical Improvements Implemented

1. **Suspense Boundaries**: Added proper Suspense boundaries around components using `useSearchParams()` to fix server-side rendering issues
2. **Button Component Enhancement**: Extended the Button component to support an 'outline' variant with appropriate styling
3. **OTP Input Component Fix**: Resolved TypeScript errors in the OTP input component by properly handling key and ref properties
4. **Modal Component Enhancement**: Updated the Modal component to support children as content, making it more flexible
5. **InputField Component Improvement**: Enhanced the InputField component to support password toggling functionality
6. **CSS Variables**: Added RGB color variables for consistent styling and hover effects
7. **Type Safety**: Fixed type errors throughout the application to ensure type safety and better developer experience

## 📸 Screenshots

*[Screenshots would be included here in a real README]*

## 🧪 Testing

```bash
# Run tests
npm test
# or
yarn test
```

## 🔒 Security Considerations

- JWT tokens with secure configuration
- HTTPS-only cookies
- CSRF protection
- Input validation
- Rate limiting on authentication endpoints

## 🛣️ Future Enhancements

- Email verification flow
- Two-factor authentication
- Role-based access control
- Account management features
- Enhanced security features

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

Made with ❤️ by Sudhanshu Sharma