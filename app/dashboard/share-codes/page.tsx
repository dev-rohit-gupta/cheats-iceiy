import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { shareCodes as shareCodesTable } from '@/lib/db/schema';
import { Copy } from 'lucide-react';
import Link from 'next/link';

export default async function ShareCodesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'admin') {
    redirect('/login');
  }

  // Fetch all share codes for this admin
  const shareCodes = await db
    .select()
    .from(shareCodesTable)
    .execute();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Share Codes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage share codes for protected resources
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {shareCodes.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No share codes yet. Create one from a cheat detail page.
          </p>
          <Link
            href="/dashboard/cheats"
            className="inline-block px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Manage Cheats
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Expires
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {shareCodes.map((code) => (
                <tr
                  key={code.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-mono font-bold text-gray-900 dark:text-white text-lg">
                      {code.code}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {code.expiresAt
                      ? new Date(code.expiresAt).toLocaleDateString()
                      : 'Never'}
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {code.usageCount} / {code.usageLimit || '∞'}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        code.status === 'revoked'
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      }`}
                    >
                      {code.status === 'revoked' ? 'Revoked' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                      title="Copy code"
                      onClick={() => {
                        navigator.clipboard.writeText(code.code);
                      }}
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
