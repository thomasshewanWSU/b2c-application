import Link from "next/link";
import { Metadata } from "next";
import styles from "./page.module.css";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "B2C Application Admin Portal",
};
/**
 * Admin Dashboard Home Component
 *
 * Renders the main admin dashboard interface with navigation cards for the primary
 * administrative functions: Products, Users, and Orders management.
 * Provides visual indicators and descriptive text for each section.
 * Implements React Suspense for improved loading experience.
 *
 * @returns {Promise<JSX.Element>} The rendered admin dashboard home page
 */
export default async function Home() {
  return (
    <div className="mx-auto max-w-screen-xl p-8">
      <Suspense fallback={<div>Loading ...</div>}>
        <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Products Card */}
          <Link href="/products" className="block">
            <div className={`${styles.dashboardCard} p-6`}>
              <div
                className={`${styles.iconContainer} mb-4 flex h-12 w-12 items-center justify-center rounded-full`}
                style={{
                  backgroundColor: "var(--blue-100)",
                  color: "var(--blue-600)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20.91 8.84 8.56 2.23a1.93 1.93 0 0 0-1.81 0L3.1 4.13a2.12 2.12 0 0 0-.05 3.69l12.22 6.93a2 2 0 0 0 1.94 0L21 12.51a2.12 2.12 0 0 0-.09-3.67Z"></path>
                  <path d="m3.09 8.84 12.35-6.61a1.93 1.93 0 0 1 1.81 0l3.65 1.9a2.12 2.12 0 0 1 .1 3.69L8.73 14.75a2 2 0 0 1-1.94 0L3 12.51a2.12 2.12 0 0 1 .09-3.67Z"></path>
                  <line x1="12" y1="22" x2="12" y2="13"></line>
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">Products</h2>
              <p className={styles.cardDescription}>
                Manage your product catalog, prices, and inventory
              </p>
            </div>
          </Link>

          {/* Users Card */}
          <Link href="/users" className="block">
            <div className={`${styles.dashboardCard} p-6`}>
              <div
                className={`${styles.iconContainer} mb-4 flex h-12 w-12 items-center justify-center rounded-full`}
                style={{
                  backgroundColor: "var(--green-100)",
                  color: "var(--green-600)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                  <circle cx="9" cy="7" r="4"></circle>
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                  <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">Users</h2>
              <p className={styles.cardDescription}>
                View and manage customer accounts and profiles
              </p>
            </div>
          </Link>

          {/* Orders Card */}
          <Link href="/orders" className="block">
            <div className={`${styles.dashboardCard} p-6`}>
              <div
                className={`${styles.iconContainer} mb-4 flex h-12 w-12 items-center justify-center rounded-full`}
                style={{
                  backgroundColor: "var(--purple-100)",
                  color: "var(--purple-600)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path>
                  <path d="M3 6h18"></path>
                  <path d="M16 10a4 4 0 0 1-8 0"></path>
                </svg>
              </div>
              <h2 className="mb-2 text-xl font-semibold">Orders</h2>
              <p className={styles.cardDescription}>
                Process customer orders and manage shipments
              </p>
            </div>
          </Link>
        </div>
      </Suspense>
    </div>
  );
}
