import "@repo/ui/styles.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@repo/utils";
import { QueryProvider } from "@/components/QueryProvider";
import { NavBar } from "@/components/navbar/NavBar";
import { client } from "@repo/db/client";
import { getServerSession } from "next-auth/next";
import { AuthProvider } from "@/components/AuthProvider"; // Import the client component
import { authOptions } from "@/server/auth-config"; // Import your auth options
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
  const session = await getServerSession(authOptions);

  // Transform user to match NavBar expected type
  const user = session?.user
    ? {
        name: session.user.name || null,
        email: session.user.email || "",
      }
    : null;

  // Get cart items count
  const cartItemCount = await getCartItemCount(session?.user?.id);

  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <QueryProvider>
            <ThemeProvider>
              <div className="flex min-h-screen flex-col">
                <NavBar
                  categories={categories}
                  user={user}
                  cartItemCount={cartItemCount}
                />
                <main className="flex-grow">{children}</main>
              </div>
            </ThemeProvider>
          </QueryProvider>
        </AuthProvider>
      </body>
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

async function getCartItemCount(userId?: string) {
  try {
    if (userId) {
      // Get cart count for authenticated user
      const count = await client.db.cartItem.count({
        where: { userId: parseInt(userId) },
      });
      return count;
    } else {
      // For anonymous users, we can't get cart count server-side
      return 0;
    }
  } catch (error) {
    console.error("Error getting cart count:", error);
    return 0;
  }
}
