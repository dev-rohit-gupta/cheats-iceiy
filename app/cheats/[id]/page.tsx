'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { FileText, Lock, Globe } from 'lucide-react';
import type { CheatWithAdmin } from '@/types';

export default function CheatDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const [cheat, setCheat] = useState<CheatWithAdmin | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnlockForm, setShowUnlockForm] = useState(false);
  const [shareCode, setShareCode] = useState('');

  const cheatId = parseInt(params.id, 10);
  const codeFromUrl = searchParams.get('code');

  useEffect(() => {
    async function loadCheat() {
      try {
        const url = codeFromUrl
          ? `/api/cheats/${cheatId}?code=${encodeURIComponent(codeFromUrl)}`
          : `/api/cheats/${cheatId}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
          if (response.status === 403) {
            setShowUnlockForm(true);
          }
          setError(data.error || 'Failed to load cheat');
        } else {
          setCheat(data.data);
          setShowUnlockForm(false);
        }
      } catch (err) {
        setError('Failed to load cheat');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    loadCheat();
  }, [cheatId, codeFromUrl]);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/share-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: shareCode }),
      });

      if (response.ok) {
        // Redirect with code in URL
        window.location.href = `/cheats/${cheatId}?code=${encodeURIComponent(
          shareCode
        )}`;
      } else {
        const data = await response.json();
        setError(data.error || 'Invalid share code');
      }
    } catch (err) {
      setError('Failed to validate share code');
      console.error(err);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (showUnlockForm || !cheat) {
    return (
      <div className="max-w-md mx-auto py-12">
        <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-8">
          <div className="flex justify-center mb-4">
            <Lock className="h-12 w-12 text-yellow-500" />
          </div>

          <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
            This cheat is protected
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
            You need a share code to unlock this content
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleUnlock} className="space-y-4">
            <input
              type="text"
              placeholder="Enter share code (6 characters)"
              value={shareCode}
              onChange={(e) =>
                setShareCode(e.target.value.toUpperCase().slice(0, 6))
              }
              maxLength={6}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono text-lg tracking-widest"
            />
            <button
              type="submit"
              disabled={shareCode.length !== 6}
              className="w-full px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed rounded-lg font-medium transition-colors"
            >
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Link */}
      <a
        href="/cheats"
        className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 mb-6 font-medium"
      >
        ← Back to Cheats
      </a>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
              {cheat.title}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              {cheat.subject}
              {cheat.branch && ` • ${cheat.branch}`}
            </p>
          </div>

          {/* Access Badge */}
          <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
            {cheat.accessLevel === 'public' ? (
              <>
                <Globe className="h-5 w-5 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-600 dark:text-green-400">
                  Public
                </span>
              </>
            ) : (
              <>
                <Lock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <span className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                  Protected
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid md:grid-cols-3 gap-8">
        {/* Main Section */}
        <div className="md:col-span-2">
          {/* Notes */}
          {cheat.notes && (
            <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-3">
                Notes
              </h2>
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {cheat.notes}
              </p>
            </div>
          )}

          {/* Drive Link */}
          <div className="mb-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-bold text-blue-900 dark:text-blue-300">
                Resource
              </h2>
            </div>
            <p className="text-sm text-blue-700 dark:text-blue-400 mb-3">
              Access the original resource:
            </p>
            <a
              href={cheat.driveLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Open Resource
              <span>↗</span>
            </a>
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Info Card */}
          <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6 sticky top-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4">
              Details
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-gray-600 dark:text-gray-400">Subject</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {cheat.subject}
                </p>
              </div>

              {cheat.branch && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Branch</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {cheat.branch}
                  </p>
                </div>
              )}

              {cheat.admin && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400">By</p>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {cheat.admin.name || cheat.admin.email}
                  </p>
                </div>
              )}

              {cheat.tags && (
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {cheat.tags.split(',').map((tag) => (
                      <span
                        key={tag.trim()}
                        className="inline-block px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
