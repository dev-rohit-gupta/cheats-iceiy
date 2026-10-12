"use client";

import type { ReactNode } from "react";
import { signOut } from "next-auth/react";

interface SignOutButtonProps {
  className?: string;
  children: ReactNode;
}

export function SignOutButton({ className, children }: SignOutButtonProps) {
  return (
    <button
      type="button"
      onClick={() => { void signOut({ callbackUrl: "/" }); }}
      className={className}
    >
      {children}
    </button>
  );
}
