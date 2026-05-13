export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* About */}
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-2">
              Cheats
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Your trusted source for study materials and cheat sheets.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Links
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="/cheats"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Browse Cheats
                </a>
              </li>
              <li>
                <a
                  href="/"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
              Info
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Built with Next.js, React, and Tailwind CSS
            </p>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-200 dark:border-gray-800 pt-6 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            &copy; {currentYear} Cheats Dashboard. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
