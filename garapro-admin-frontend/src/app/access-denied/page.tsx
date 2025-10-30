// app/access-denied/page.tsx
'use client';

import { useAuth } from '@/contexts/auth-context';
import Link from 'next/link';

export default function AccessDenied() {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-red-500 text-6xl mb-4">🚫</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
        <p className="text-gray-600 mb-6">
          You don't have permission to access this page.
        </p>
        
        {user && (
          <div className="mb-6 p-4 bg-gray-100 rounded-lg">
            <p className="text-sm text-gray-600">
              Logged in as: <strong>{user.email}</strong>
            </p>
            <p className="text-sm text-gray-600">
              Roles: <strong>{user.roles.join(', ')}</strong>
            </p>
          </div>
        )}

        <div className="flex flex-col space-y-3">
          <Link 
            href="/"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Go to Homepage
          </Link>
          
          <button
            onClick={() => logout()}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}