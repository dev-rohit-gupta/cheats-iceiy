import Link from 'next/link';
import { FileText, Lock, Globe } from 'lucide-react';
import type { CheatWithAdmin } from '@/types';

interface CheatCardProps {
  cheat: CheatWithAdmin;
  showAdmin?: boolean;
}

export function CheatCard({ cheat, showAdmin = true }: CheatCardProps) {
  const isProtected = cheat.accessLevel !== 'public';
  const Icon = isProtected ? Lock : Globe;

  return (
    <Link href={`/cheats/${cheat.id}`}>
      <div className="h-full group cursor-pointer rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-lg dark:hover:shadow-blue-900/20 transition-all p-6 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
              {cheat.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {cheat.subject}
              {cheat.branch && ` • ${cheat.branch}`}
            </p>
          </div>

          {/* Access Icon */}
          <div className="flex-shrink-0">
            <Icon className="h-5 w-5 text-gray-400 dark:text-gray-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
          </div>
        </div>

        {/* Notes */}
        {cheat.notes && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {cheat.notes}
          </p>
        )}

        {/* Tags */}
        {cheat.tags && (
          <div className="flex flex-wrap gap-2 mb-4">
            {cheat.tags.split(',').slice(0, 3).map((tag) => (
              <span
                key={tag.trim()}
                className="inline-block px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded"
              >
                {tag.trim()}
              </span>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
            <FileText className="h-4 w-4" />
            <span>Resource</span>
          </div>
          {showAdmin && cheat.admin && (
            <span className="text-xs text-gray-500 dark:text-gray-500">
              by {cheat.admin.name || cheat.admin.email}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
