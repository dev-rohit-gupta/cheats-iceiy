'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Edit2, Trash2 } from 'lucide-react';

interface Cheat {
  id: number;
  title: string;
  subject: string;
  accessLevel: string;
  status: string;
  createdAt: string;
}

export default function CheatsManagementPage() {
  const [cheats, setCheats] = useState<Cheat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCheats() {
      try {
        const response = await fetch('/api/cheats');
        const data = await response.json();
        if (data.data) {
          setCheats(data.data);
        }
      } catch (err) {
        setError('Failed to load cheats');
      } finally {
        setIsLoading(false);
      }
    }

    loadCheats();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this cheat?')) return;

    try {
      const response = await fetch(`/api/admin/cheats/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCheats((prev) => prev.filter((c) => c.id !== id));
      } else {
        setError('Failed to delete cheat');
      }
    } catch (err) {
      setError('Failed to delete cheat');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Manage Cheats
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create, edit, and manage your study materials
          </p>
        </div>

        <Link
          href="/dashboard/cheats/new"
          className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
        >
          + Create New
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
      ) : cheats.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-12 text-center">
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No cheats yet. Create one to get started!
          </p>
          <Link
            href="/dashboard/cheats/new"
            className="inline-block px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
          >
            Create First Cheat
          </Link>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-white">
                  Access Level
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
              {cheats.map((cheat) => (
                <tr
                  key={cheat.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {cheat.title}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                    {cheat.subject}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        cheat.accessLevel === 'public'
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                      }`}
                    >
                      {cheat.accessLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        cheat.status === 'active'
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {cheat.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/dashboard/cheats/${cheat.id}/edit`}
                        className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded transition-colors"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(cheat.id)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
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
