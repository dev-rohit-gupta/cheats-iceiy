import type { Metadata } from "next";
import { Header, Footer } from "@/components/layout";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cheats Dashboard",
  description: "Your source for study materials and cheat sheets",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-50 transition-colors">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
