import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Plus } from 'lucide-react';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  // Only admins can access dashboard
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Welcome back, {session.user.name || session.user.email}
          </p>
        </div>

        <Link
          href="/dashboard/cheats/new"
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          <Plus className="h-5 w-5" />
          Create Cheat
        </Link>
      </div>

      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Total Cheats
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            —
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Active Share Codes
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            —
          </p>
        </div>

        <div className="p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
          <p className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
            Total Accesses
          </p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            —
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
          Quick Actions
        </h2>

        <div className="space-y-2">
          <Link
            href="/dashboard/cheats"
            className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium transition-colors"
          >
            → Manage Cheats
          </Link>
          <Link
            href="/dashboard/users"
            className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium transition-colors"
          >
            → Manage Users
          </Link>
          <Link
            href="/account/security"
            className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600 dark:text-blue-400 font-medium transition-colors"
          >
            → Account Settings
          </Link>
          <a
            href="/api/auth/signout"
            className="block p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-red-600 dark:text-red-400 font-medium transition-colors"
          >
            → Sign Out
          </a>
        </div>
      </div>
    </div>
  );
}
