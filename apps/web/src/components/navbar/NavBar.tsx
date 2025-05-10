"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ThemeSwitch } from "@repo/utils";
import styles from "./NavBar.module.css";
import { CategoryBox } from "./CategoryBox";
import { PopupCart } from "../cart/PopupCart"; // Import the new PopupCart component
import { useCartContext } from "@/components/cart/CartProvider";

type NavBarProps = {
  categories?: string[];
  user?: {
    name: string | null;
    email: string;
  } | null;
  cartItemCount?: number;
};

export function NavBar({ categories = [], user = null }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showCart, setShowCart] = useState(false); // New state for cart popup
  const searchInputRef = useRef<HTMLInputElement>(null);
  const { cartCount } = useCartContext(); // Get cartCount from context

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsSearchActive(true);
  };
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  // Handle search input focus/blur
  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    // Only deactivate highlight if search is empty
    if (!searchQuery.trim()) {
      setIsSearchActive(false);
    }
  };

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    const queryParams = new URLSearchParams();
    queryParams.set("search", searchQuery);

    if (selectedCategory && selectedCategory !== "All") {
      queryParams.set("category", selectedCategory);
    }

    router.push(`/products?${queryParams.toString()}`);
  };
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserDropdown(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Reset mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    setShowCart(false);
  }, [pathname]);

  return (
    <header className={styles.navbar}>
      <div className={styles.navbarContent}>
        {/* Logo Section */}
        <div className={styles.logoSection}>
          <Link href="/" className={styles.logoLink}>
            <div className={styles.logo}>B2C Store</div>
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          className={styles.mobileMenuButton}
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={styles.menuIcon}
          >
            {mobileMenuOpen ? (
              <path d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>

        {/* Search Section */}
        <div className={styles.searchSection}>
          <form onSubmit={handleSearch} className={styles.searchForm}>
            <CategoryBox
              categories={categories}
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              onFocusSearch={focusSearchInput}
            />

            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
              placeholder="Search products..."
              className={styles.searchInput}
              aria-label="Search products"
            />

            <button
              type="submit"
              className={styles.searchButton}
              aria-label="Search"
            >
              {/* Button content */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className={styles.searchIcon}
              >
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
            </button>
          </form>
        </div>
        {/* Actions Section */}
        <div
          className={`${styles.actionsSection} ${mobileMenuOpen ? styles.mobileVisible : ""}`}
        >
          <div className={styles.themeToggle}>
            <ThemeSwitch />
          </div>

          {/* User Account */}
          <div className={styles.accountSection}>
            <button
              className={styles.accountButton}
              onClick={(e) => {
                e.stopPropagation();
                setShowUserDropdown(!showUserDropdown);
              }}
              aria-label="Account"
            >
              <div className={styles.accountIcon}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <div className={styles.accountText}>
                <span className={styles.accountGreeting}>
                  {user ? `Hello, ${user.name || "User"}` : "Hello, Sign in"}
                </span>
                <span className={styles.accountLabel}>Account & Lists</span>
              </div>
            </button>

            {/* User Dropdown Menu */}
            {showUserDropdown && (
              <div
                className={styles.accountDropdown}
                onClick={(e) => e.stopPropagation()}
              >
                {user ? (
                  <>
                    <div className={styles.dropdownHeader}>
                      <h3>Your Account</h3>
                    </div>
                    <Link href="/account" className={styles.dropdownItem}>
                      Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      className={styles.dropdownItem}
                    >
                      Orders
                    </Link>
                    <Link
                      href="/account/settings"
                      className={styles.dropdownItem}
                    >
                      Settings
                    </Link>
                    <hr className={styles.dropdownDivider} />
                    <button
                      className={styles.signOutButton}
                      onClick={async () => {
                        await fetch("/api/auth/", { method: "DELETE" });
                        router.refresh();
                      }}
                    >
                      Sign Out
                    </button>
                  </>
                ) : (
                  <>
                    <div className={styles.dropdownHeader}>
                      <Link href="/login" className={styles.signInButton}>
                        Sign In
                      </Link>
                    </div>
                    <div className={styles.newCustomer}>
                      New customer? <Link href="/register">Start here</Link>
                    </div>
                    <hr className={styles.dropdownDivider} />
                    <div className={styles.dropdownSection}>
                      <h4>Your Account</h4>
                      <Link
                        href="/login?redirect=/account"
                        className={styles.dropdownItem}
                      >
                        Account
                      </Link>
                      <Link
                        href="/login?redirect=/account/orders"
                        className={styles.dropdownItem}
                      >
                        Orders
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Shopping Cart */}
          <button
            className={styles.cartButton}
            onClick={() => setShowCart(true)}
            aria-label="Shopping cart"
          >
            <div className={styles.cartIcon}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="9" cy="21" r="1"></circle>
                <circle cx="20" cy="21" r="1"></circle>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
              </svg>
              <span className={styles.cartCount}>{cartCount}</span>
            </div>
            <span className={styles.cartText}>Cart</span>
          </button>
        </div>
      </div>
      <PopupCart isOpen={showCart} onClose={() => setShowCart(false)} />
    </header>
  );
}
