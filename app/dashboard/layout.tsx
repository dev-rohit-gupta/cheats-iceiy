import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth/permissions";

/**
 * Enforce admin access on every dashboard page (including client pages).
 * This uses the same NextAuth session and live database role checks as the
 * admin API handlers, so it works consistently on localhost and on Vercel.
 */
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/login");

  return children;
}
