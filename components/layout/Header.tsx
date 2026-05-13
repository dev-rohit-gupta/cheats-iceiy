import { ReactNode } from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';
import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface HeaderProps {
  children?: ReactNode;
}

export async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-gray-900 dark:text-white">
          <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
            Cheats
          </span>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center gap-6">
          <Link
            href="/cheats"
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
          >
            Browse
          </Link>

          {session?.user && (
            <>
              {session.user.role === 'admin' && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  Dashboard
                </Link>
              )}
              <Link
                href="/account"
                className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
              >
                Account
              </Link>
            </>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          <ThemeSwitcher />

          {!session?.user ? (
            <div className="flex gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors font-medium"
              >
                Admin Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors font-medium"
              >
                Sign Up
              </Link>
            </div>
          ) : (
            <div className="text-sm text-gray-600 dark:text-gray-400">
              {session.user.email}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
