import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function AccountPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signup');
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Account Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your profile and preferences
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Profile Section */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">
            Profile Information
          </h2>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Name
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {session.user.name || 'Not set'}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Email
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white">
                {session.user.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                Account Type
              </p>
              <p className="text-lg font-medium text-gray-900 dark:text-white capitalize">
                {session.user.role}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                User ID
              </p>
              <p className="text-sm font-mono text-gray-700 dark:text-gray-300 break-all">
                {session.user.id}
              </p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>

          <div className="space-y-3">
            <Link
              href="/account/security"
              className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
            >
              <p className="font-medium text-gray-900 dark:text-white">
                Security Settings
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Manage password and connected accounts
              </p>
            </Link>

            {session.user.role === 'admin' && (
              <Link
                href="/dashboard"
                className="block p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-colors"
              >
                <p className="font-medium text-gray-900 dark:text-white">
                  Admin Dashboard
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Manage cheats and share codes
                </p>
              </Link>
            )}

            <a
              href="/api/auth/signout"
              className="block p-4 rounded-lg border border-red-200 dark:border-red-800 hover:border-red-500 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
            >
              <p className="font-medium text-red-600 dark:text-red-400">
                Sign Out
              </p>
              <p className="text-sm text-red-600/70 dark:text-red-400/70">
                Sign out from this account
              </p>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
