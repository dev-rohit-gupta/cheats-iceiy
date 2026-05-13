import { getPublicCheats } from '@/lib/db/cheats';
import { CheatCard } from '@/components/cheats';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export default async function HomePage() {
  const cheats = await getPublicCheats();
  const featuredCheats = cheats.slice(0, 3);

  return (
    <div>
      {/* Hero Section */}
      <section className="text-center py-12 md:py-20">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Study Smarter with Cheats
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
            Access curated study materials, cheat sheets, and resources for your courses. Share knowledge with peers using secure share codes.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/cheats"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Browse Cheats
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center gap-2 px-6 py-3 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-900 rounded-lg font-medium transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 grid md:grid-cols-3 gap-8 mb-12">
        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="text-2xl mb-3">📚</div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            Rich Library
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Explore thousands of study materials across multiple subjects and topics.
          </p>
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="text-2xl mb-3">🔗</div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            Share Safely
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Share resources with secure codes that expire and have usage limits.
          </p>
        </div>

        <div className="p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-gray-50 dark:bg-gray-900">
          <div className="text-2xl mb-3">🌙</div>
          <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">
            Dark Mode
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Easy on the eyes with automatic dark mode support for late-night studying.
          </p>
        </div>
      </section>

      {/* Featured Cheats */}
      {featuredCheats.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Featured Resources
            </h2>
            <Link
              href="/cheats"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-500 font-medium transition-colors"
            >
              View All →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {featuredCheats.map((cheat) => (
              <CheatCard key={cheat.id} cheat={cheat} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-blue-600 to-blue-400 rounded-xl p-8 md:p-12 text-white text-center mt-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Ready to get started?
        </h2>
        <p className="text-blue-50 mb-6 max-w-2xl mx-auto">
          Sign up now to create your own cheats, share resources, and collaborate with other learners.
        </p>
        <Link
          href="/auth/signup"
          className="inline-block px-8 py-3 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-colors"
        >
          Sign Up Free
        </Link>
      </section>
    </div>
  );
}
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
