'use client';

import { useEffect, useState } from 'react';
import { CheatCard } from '@/components/cheats';
import { AdSlot } from '@/components/ads';
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

  const firstBatch = filteredCheats.slice(0, 6);
  const remainingCheats = filteredCheats.slice(6);

  return (
    <div>
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
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
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {firstBatch.map((cheat) => (
                  <CheatCard key={cheat.id} cheat={cheat} />
                ))}
              </div>

              {filteredCheats.length > 6 && (
                <AdSlot
                  slotId="cheats_inline_native_1"
                  minHeight={250}
                  label="Cheats inline ad"
                  containerId="container-e33059460be7441d73eb391a6f8f5276"
                  scriptSrc="https://pl29468349.effectivecpmnetwork.com/e33059460be7441d73eb391a6f8f5276/invoke.js"
                  scriptAttributes={{ 'data-cfasync': 'false' }}
                  className="my-8 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
                />
              )}

              {remainingCheats.length > 0 && (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {remainingCheats.map((cheat) => (
                    <CheatCard key={cheat.id} cheat={cheat} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Results Count */}
          {!isLoading && filteredCheats.length > 0 && (
            <div className="mt-8 text-sm text-gray-600 dark:text-gray-400 text-center">
              Showing {filteredCheats.length} of {cheats.length} results
            </div>
          )}

          <AdSlot
            slotId="cheats_footer_banner"
            minHeight={90}
            label="Cheats footer banner"
            inlineScript={`window.atOptions = {
  'key': 'a1fd37fbb77c39a58a69cc7177763f0c',
  'format': 'iframe',
  'height': 90,
  'width': 728,
  'params': {}
};`}
            scriptSrc="https://www.highperformanceformat.com/a1fd37fbb77c39a58a69cc7177763f0c/invoke.js"
            className="mt-10 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
          />
          <AdSlot
            slotId="cheats_footer_banner_mobile"
            minHeight={50}
            label="Cheats footer banner mobile"
            inlineScript={`window.atOptions = {
  'key': 'b5bae9f2e225fcfe5bbdbe7e75629512',
  'format': 'iframe',
  'height': 50,
  'width': 320,
  'params': {}
};`}
            scriptSrc="https://www.highperformanceformat.com/b5bae9f2e225fcfe5bbdbe7e75629512/invoke.js"
            className="mt-6 md:hidden rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
          />
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <AdSlot
              slotId="cheats_sidebar_banner"
              minHeight={600}
              label="Cheats sidebar banner"
              inlineScript={`window.atOptions = {
  'key': 'b7326beae220f1f0e42f100fcb92878f',
  'format': 'iframe',
  'height': 600,
  'width': 160,
  'params': {}
};`}
              scriptSrc="https://www.highperformanceformat.com/b7326beae220f1f0e42f100fcb92878f/invoke.js"
              className="rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900"
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
