import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider, QueryProvider } from "@repo/utils";
import { isLoggedIn } from "../utils/auth";
import { AppLayout } from "../components/appLayout";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Full stack Blog Admin",
  description: "Administration of Full Stack Blog",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return (
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <ThemeProvider>
            <QueryProvider>{children}</QueryProvider>
          </ThemeProvider>
        </body>
      </html>
    );
  }
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <AppLayout>
            <QueryProvider>{children}</QueryProvider>
          </AppLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
