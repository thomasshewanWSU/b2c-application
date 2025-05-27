import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "B2C Application Admin Portal",
};

export default async function Home() {
  return (
    <div className="mx-auto max-w-screen-xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* Products Card */}
        <Link href="/products" className="block">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
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
            <p className="text-gray-600 dark:text-gray-300">
              Manage your product catalog, prices, and inventory
            </p>
          </div>
        </Link>

        {/* Users Card */}
        <Link href="/users" className="block">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
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
            <p className="text-gray-600 dark:text-gray-300">
              View and manage customer accounts and profiles
            </p>
          </div>
        </Link>

        {/* Orders Card */}
        <Link href="/orders" className="block">
          <div className="rounded-lg border border-gray-100 bg-white p-6 shadow-md transition-all hover:shadow-lg dark:border-gray-700 dark:bg-gray-800">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
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
            <p className="text-gray-600 dark:text-gray-300">
              Process customer orders and manage shipments
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
