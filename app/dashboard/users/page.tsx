'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

interface AdminUserRow {
  id: number;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionUserId, setActionUserId] = useState<number | null>(null);
  const [sessionUserId, setSessionUserId] = useState<number | null>(null);

  useEffect(() => {
    async function loadUsers() {
      try {
        setError(null);
        const response = await fetch('/api/admin/users?limit=200&offset=0');
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'Failed to load users');
          return;
        }

        setUsers(data.data?.users || []);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setIsLoading(false);
      }
    }

    async function loadSession() {
      try {
        const response = await fetch('/api/auth/session');
        if (!response.ok) return;
        const session = await response.json();
        setSessionUserId(session?.user?.id ?? null);
      } catch (err) {
        setSessionUserId(null);
      }
    }

    loadUsers();
    loadSession();
  }, []);

  const adminCount = useMemo(
    () => users.filter((u) => u.role === 'admin').length,
    [users]
  );

  const handleRoleChange = async (user: AdminUserRow) => {
    const action = user.role === 'admin' ? 'demote' : 'promote';

    if (
      action === 'demote' &&
      sessionUserId !== null &&
      sessionUserId === user.id
    ) {
      setError('You cannot demote yourself');
      return;
    }

    if (action === 'demote' && adminCount <= 1) {
      setError('Cannot demote the last admin');
      return;
    }

    setActionUserId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}/${action}`, {
        method: 'POST',
      });
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to update role');
        return;
      }

      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? data.data : u))
      );
    } catch (err) {
      setError('Failed to update role');
    } finally {
      setActionUserId(null);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Users
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Promote or demote users and manage admin access
          </p>
        </div>

        <Link
          href="/dashboard"
          className="px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg font-medium transition-colors"
        >
          ← Back to Dashboard
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : users.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No users found.
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {users.map((user) => {
                const isSelf = sessionUserId !== null && sessionUserId === user.id;
                const isAdminRole = user.role === 'admin';
                const isBusy = actionUserId === user.id;

                return (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {user.name || 'Unnamed'}
                        {isSelf && (
                          <span className="ml-2 text-xs text-blue-600 dark:text-blue-400">
                            You
                          </span>
                        )}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                          isAdminRole
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {isAdminRole ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleRoleChange(user)}
                        disabled={isBusy || (isAdminRole && isSelf)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          isAdminRole
                            ? 'bg-red-600 text-white hover:bg-red-700 disabled:bg-gray-400'
                            : 'bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-400'
                        }`}
                        title={isAdminRole ? 'Demote to user' : 'Promote to admin'}
                      >
                        {isBusy
                          ? 'Updating...'
                          : isAdminRole
                          ? 'Demote'
                          : 'Promote'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
