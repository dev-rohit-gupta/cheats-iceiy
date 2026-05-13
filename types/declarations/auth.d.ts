import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    id: string | number;
    email: string;
    name: string | null;
    role: "admin" | "user";
  }

  interface Session extends DefaultSession {
    user: {
      id: number;
      email: string;
      name: string | null;
      role: "admin" | "user";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: number;
    email: string;
    role: "admin" | "user";
  }
}
