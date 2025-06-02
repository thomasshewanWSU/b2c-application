"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ThemeSwitch } from "@repo/utils";
import styles from "./NavBar.module.css";
import { CategoryBox } from "./CategoryBox";
import { PopupCart } from "../cart/PopupCart"; // Import the new PopupCart component
import { useQuery } from "@tanstack/react-query";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useQueryClient } from "@tanstack/react-query";

type NavBarProps = {
  categories?: string[];
  user?: {
    name: string | null;
    email: string;
  } | null;
  cartItemCount?: number;
};

/**
 * NavBar component renders the navigation bar with logo, search, categories, user account, and cart.
 * It supports mobile responsiveness and includes a dropdown for user account actions.
 *
 * @param {NavBarProps} props - The properties for the NavBar component.
 * @returns {JSX.Element} The rendered navigation bar component.
 */
export function NavBar({ categories = [], user = null }: NavBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [showCart, setShowCart] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const authSuccess = searchParams.get("auth_success");
  const closeAllMenus = () => {
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
    setShowCart(false);
  };
  // Force refetch after OAuth login
  useEffect(() => {
    if (authSuccess === "true") {
      // Refetch cart data
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      // Remove auth_success from URL without page reload
      const params = new URLSearchParams(window.location.search);
      params.delete("auth_success");
      const newUrl =
        window.location.pathname +
        (params.toString() ? `?${params.toString()}` : "");

      router.push(newUrl, { scroll: false });
    }
  }, [authSuccess, queryClient, router]);
  const userData = session?.user
    ? {
        name: session.user.name || "User",
        email: session.user.email || "",
        image: session.user.image || null,
      }
    : user;
  const initialCategory =
    pathname === "/products" ? searchParams.get("category") || "All" : "All";
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: true,
        callbackUrl: "/",
      });
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };
  useEffect(() => {
    if (pathname === "/products") {
      const urlCategory = searchParams.get("category") || "All";
      setSelectedCategory(urlCategory);
      setSearchQuery(searchParams.get("search") || "");
    } else {
      setSelectedCategory("All");
      setSearchQuery("");
    }
  }, [pathname, searchParams]);
  const { data } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch("/api/cart");
      if (!res.ok) throw new Error("Failed to fetch cart");
      return res.json();
    },
    staleTime: 1000 * 60 * 2,
  });

  const cartItems = data?.items || [];
  const cartCount = cartItems.reduce(
    (sum: number, item: { quantity: number }) => sum + item.quantity,
    0,
  );
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setIsSearchActive(true);
    focusSearchInput();
  };
  const focusSearchInput = () => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  const handleSearchFocus = () => {
    setIsSearchActive(true);
  };

  const handleSearchBlur = () => {
    if (!searchQuery.trim()) {
      setIsSearchActive(false);
    }
  };
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearchActive(false);

    const queryParams = new URLSearchParams();
    if (searchQuery.trim()) {
      queryParams.set("search", searchQuery.trim());
    }

    if (selectedCategory && selectedCategory !== "All") {
      queryParams.set("category", selectedCategory);
    }

    router.push(`/products?${queryParams.toString()}`);
  };
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(event.target as Node) &&
        showUserDropdown
      ) {
        setShowUserDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserDropdown]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);
  useEffect(() => {
    setShowCart(false);
  }, [pathname]);

  return (
    <div>
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
          <div
            className={`${styles.searchSection} ${isSearchActive ? styles.searchActive : ""}`}
          >
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
                data-test-id="search-input"
              />

              <button
                type="submit"
                className={styles.searchButton}
                aria-label="Search"
                data-test-id="search-button"
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
                  {/* If user has image from OAuth, display it */}
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
                    {userData
                      ? `Hello, ${userData.name || "User"}`
                      : "Hello, Sign in"}
                  </span>
                  <span className={styles.accountLabel}>Account & Lists</span>
                </div>
              </button>

              {/* User Dropdown Menu */}
              {showUserDropdown && (
                <div
                  ref={userDropdownRef}
                  className={styles.accountDropdown}
                  onClick={(e) => e.stopPropagation()}
                >
                  {userData ? (
                    <>
                      <div className={styles.dropdownHeader}>
                        <h3>Your Account</h3>
                      </div>
                      <div className={styles.dropdownItem}>*Profile*</div>
                      <Link
                        href="/orders"
                        className={styles.dropdownItem}
                        onClick={closeAllMenus}
                      >
                        Orders
                      </Link>
                      <div className={styles.dropdownItem}>*Settings*</div>

                      <hr className={styles.dropdownDivider} />
                      <button
                        className={styles.signOutButton}
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <div className={styles.dropdownHeader}>
                        <Link
                          href="/login"
                          className={styles.signInButton}
                          onClick={closeAllMenus}
                        >
                          Sign In
                        </Link>
                      </div>
                      <div className={styles.newCustomer}>
                        New customer?{" "}
                        <Link href="/registration">Start here</Link>
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
      {isSearchActive && (
        <div
          className={styles.searchOverlay}
          onClick={() => {
            setIsSearchActive(false);
            if (searchInputRef.current) searchInputRef.current.blur();
          }}
          aria-hidden="true"
        />
      )}
    </div>
  );
}
