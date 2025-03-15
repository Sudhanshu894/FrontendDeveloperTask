import { NextRequest, NextResponse } from 'next/server';

// Define a type for our users
interface User {
  email: string;
  password?: string;
  fullName: string;
  profilePicture?: string;
  verified: boolean;
  authProvider?: string;
  createdAt?: string;
  otp?: string;
}

// Ensure TypeScript knows users is initialized
if (typeof global.users === 'undefined') {
  global.users = [];
}

// Initialize global users if not already initialized
if (typeof global !== "undefined" && !global.users) {
  global.users = [];
}

export async function POST(request: NextRequest) {
  try {
    // Get users from request body
    const { users } = await request.json();
    
    if (!Array.isArray(users)) {
      return NextResponse.json(
        { error: 'Invalid users data. Expected an array.' },
        { status: 400 }
      );
    }
    
    // Merge with existing global users
    // For each user in the incoming array, update if exists or add if new
    users.forEach((incomingUser: User) => {
      const existingUserIndex = global.users.findIndex(u => u.email === incomingUser.email);
      
      if (existingUserIndex === -1) {
        // Add new user
        global.users.push(incomingUser);
      } else {
        // Update existing user
        global.users[existingUserIndex] = {
          ...global.users[existingUserIndex],
          ...incomingUser
        };
      }
    });
    
    console.log("Users synced with server. Current users:", global.users.map(u => u.email));
    
    return NextResponse.json({ success: true, count: global.users.length });
  } catch (error) {
    console.error("Error syncing users:", error);
    return NextResponse.json(
      { error: 'Failed to sync users' },
      { status: 500 }
    );
  }
}

export async function GET() {
  // Return the current global users (for debugging)
  return NextResponse.json({ users: global.users });
} 