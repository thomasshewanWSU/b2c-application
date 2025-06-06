"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode, useState } from "react";
import { ThemeSwitch } from "@repo/utils";
import styles from "./appLayout.module.css";
import { signOut } from "next-auth/react";
type AppLayoutProps = {
  children: ReactNode;
};

/**
 * AppLayout component provides a consistent layout for the admin dashboard.
 * It includes a top navigation bar, main content area, and footer.
 * The layout is responsive and includes a mobile-friendly menu toggle.
 *
 * @param {Object} props - Component properties
 * @param {ReactNode} props.children - Child components to render within the layout
 * @returns {JSX.Element} The rendered app layout component
 */
export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const isActive = (path: string) => {
    if (pathname === path) {
      return styles.active;
    }

    if (pathname?.startsWith(`${path}/`)) {
      const subPath = pathname.substring(path.length);
      if (subPath.includes("/create") || subPath.includes("/edit")) {
        return "";
      }
      return styles.active;
    }

    return "";
  };
  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);

      // First sign out but don't redirect yet
      await signOut({ redirect: false });

      // Then manually redirect to the current origin
      window.location.href = window.location.origin;
    } catch (error) {
      console.error("Error signing out:", error);
      setIsLoggingOut(false);
    }
  };
  return (
    <div className={styles.layout}>
      {/* Top Navigation Bar */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <Link href="/products" className={styles.logo}>
              B2C - Admin
            </Link>

            {/* Mobile menu toggle */}
            <button
              className={styles.menuToggle}
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={styles.menuIcon}
              >
                {menuOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          <nav
            className={`${styles.navigation} ${menuOpen ? styles.menuOpen : ""}`}
          >
            <ul className={styles.navList}>
              <li className={styles.navItem}>
                <Link
                  href="/products"
                  className={`${styles.navLink} ${isActive("/products")}`}
                >
                  Products
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link
                  href="/orders"
                  className={`${styles.navLink} ${isActive("/orders")}`}
                >
                  Order History
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link
                  href="/users"
                  className={`${styles.navLink} ${isActive("/users")}`}
                >
                  Users
                </Link>
              </li>
            </ul>

            <div className={styles.actionItems}>
              <ThemeSwitch />

              <Link href="/products/create" className={styles.createButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={styles.buttonIcon}
                >
                  <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
                </svg>
                New Product
              </Link>

              <Link href="/users/create" className={styles.createButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={styles.buttonIcon}
                >
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                New User
              </Link>

              <button onClick={handleSignOut} className={styles.logoutButton}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={styles.buttonIcon}
                >
                  <path
                    fillRule="evenodd"
                    d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z"
                    clipRule="evenodd"
                  />
                </svg>
                Logout
              </button>
            </div>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.main}>{children}</main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerSection}>
            <p className={styles.copyright}>
              &copy; {new Date().getFullYear()} B2C Admin Portal. All rights
              reserved.
            </p>
          </div>

          <div className={styles.footerSection}>
            <p className={styles.version}>v1.0.0</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
