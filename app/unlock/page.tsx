'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

function UnlockContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cheatId = searchParams.get('cheatId');

  const [shareCode, setShareCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/cheats/${cheatId}?code=${shareCode}`,
        { method: 'GET' }
      );

      if (!response.ok) {
        setError('Invalid or expired share code');
        return;
      }

      // Redirect back to the cheat detail page with the code
      router.push(`/cheats/${cheatId}?code=${shareCode}`);
    } catch (err) {
      setError('Failed to unlock');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="text-center mb-6">
            <div className="text-4xl mb-3">🔒</div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              This content is protected
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Enter the share code to unlock this resource
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Share Code (6 characters)
              </label>
              <input
                type="text"
                value={shareCode}
                onChange={(e) =>
                  setShareCode(
                    e.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '')
                      .slice(0, 6)
                  )
                }
                maxLength={6}
                placeholder="XXXXXX"
                required
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-2xl tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || shareCode.length !== 6}
              className="w-full px-4 py-3 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Unlocking...' : 'Unlock'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have a share code?{' '}
            <Link
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 font-medium"
            >
              Browse public resources
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UnlockPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <UnlockContent />
    </Suspense>
  );
}
