"use client";

import "../globals.css";
import { QueryProvider } from "@/components/QueryProvider";
import { AuthProvider } from "@/components/AuthProvider"; // Import the client component
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout-container">
      <AuthProvider>
        <QueryProvider>
          <main className="auth-layout">{children}</main>
        </QueryProvider>{" "}
      </AuthProvider>
    </div>
  );
}
