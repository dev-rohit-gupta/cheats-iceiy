'use client';

import { useEffect, useState } from 'react';
import { CheatCard } from '@/components/cheats';
import { Search } from 'lucide-react';
import type { CheatWithAdmin } from '@/types';

export default function CheatsPage() {
  const [cheats, setCheats] = useState<CheatWithAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadCheats() {
      try {
        const response = await fetch('/api/cheats');
        const data = await response.json();
        if (data.data) {
          setCheats(data.data);
        }
      } catch (error) {
        console.error('Failed to load cheats:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCheats();
  }, []);

  const filteredCheats = cheats.filter(
    (cheat) =>
      cheat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheat.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cheat.tags?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Browse Cheats
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore our collection of study materials and resources
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-600" />
          <input
            type="text"
            placeholder="Search by title, subject, or tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg placeholder-gray-500 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredCheats.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">
            {cheats.length === 0
              ? 'No cheats available yet. Check back soon!'
              : 'No cheats match your search. Try different keywords.'}
          </p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCheats.map((cheat) => (
            <CheatCard key={cheat.id} cheat={cheat} />
          ))}
        </div>
      )}

      {/* Results Count */}
      {!isLoading && filteredCheats.length > 0 && (
        <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
          Showing {filteredCheats.length} of {cheats.length} results
        </div>
      )}
    </div>
  );
}
