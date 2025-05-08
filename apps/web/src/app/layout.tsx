// import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { cookies } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@repo/utils";
import { NavBar } from "@/components/navbar/NavBar";
import { client } from "@repo/db/client";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: "Full-Stack Blog",
  description: "Blog about full stack development",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fetch categories from your database
  const categories = await getCategories();

  // Get user from the session if logged in
  const user = await getCurrentUser();

  // Get cart items count
  const cartItemCount = await getCartItemCount();

  return (
    <html lang="en">
      <ThemeProvider>
        <body className={`${geistSans.variable} ${geistMono.variable}`}>
          <NavBar
            categories={categories}
            user={user}
            cartItemCount={cartItemCount}
          />
          {children}
        </body>
      </ThemeProvider>
    </html>
  );
}
async function getCategories() {
  try {
    // Fetch categories from your database
    const categories = await client.db.product.findMany({
      select: { category: true },
      distinct: ["category"],
    });
    return categories.map((c) => c.category).filter(Boolean) as string[];
  } catch (error) {
    console.error("Error fetching categories:", error);
    return [];
  }
}

async function getCurrentUser() {
  try {
    // Get user from session logic here
    return null; // Return user object if authenticated
  } catch (error) {
    return null;
  }
}

async function getCartItemCount() {
  try {
    // Get cart items count - implement your cart logic
    return 0;
  } catch (error) {
    return 0;
  }
}
