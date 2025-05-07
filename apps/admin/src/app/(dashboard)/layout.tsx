import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ThemeProvider, QueryProvider } from "@repo/utils";
import { AppLayout } from "@/components/appLayout";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ThemeProvider>
      <AppLayout>
        <QueryProvider>{children}</QueryProvider>
      </AppLayout>
    </ThemeProvider>
  );
}
