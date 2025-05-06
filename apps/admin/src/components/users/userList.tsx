"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./userList.module.css";
import { formatDate } from "../../utils/userUtils";
import { AlertMessage } from "../../ui/alertMessage";
import { Pagination } from "../../utils/pagination";

type User = {
  id: number;
  name: string | null;
  email: string;
  role: "admin" | "customer";
  createdAt: string | Date;
  updatedAt: string | Date;
  orders?: number;
};

export function UserList() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    role: "",
    sortBy: "newest",
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    pageSize: 10,
    hasMore: false,
  });

  // Fetch users with filters
  const fetchUsers = async () => {
    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();
      params.set("page", pagination.currentPage.toString());
      params.set("limit", pagination.pageSize.toString());

      if (search) params.set("search", search);
      if (filters.role) params.set("role", filters.role);
      if (filters.sortBy) params.set("sortBy", filters.sortBy);

      // Fix: Use correct URL format and toString() on params object
      const response = await fetch(`/api/users/search?${params.toString()}`);

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();

      setUsers(data.users);
      setPagination({
        currentPage: data.pagination.currentPage,
        totalPages: data.pagination.totalPages,
        total: data.pagination.total,
        pageSize: data.pagination.pageSize,
        hasMore: data.pagination.hasMore,
      });
    } catch (err) {
      setError("An error occurred while fetching users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "search") {
      setSearch(value);
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }

    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setFilters({
      role: "",
      sortBy: "newest",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Handle page change from pagination component
  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Fetch users when filters or page changes
  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage, search, filters.role, filters.sortBy]);

  // Focus search input on mount
  useEffect(() => {
    const searchInput = document.getElementById("user-search");
    if (searchInput) {
      searchInput.focus();
    }
  }, []);

  return (
    <div className={styles.container}>
      {/* Header section */}
      <div className={styles.header}>
        <h1 className={styles.title}>Users</h1>
      </div>

      {error && <AlertMessage type="error" message={error} />}

      {/* Filter section */}
      <div className={styles.filterSection}>
        <div className={styles.filterControls}>
          <div className={styles.filterGroup}>
            <label htmlFor="user-search" className={styles.filterLabel}>
              Search
            </label>
            <input
              id="user-search"
              type="text"
              name="search"
              placeholder="Search by name or email"
              value={search}
              onChange={handleFilterChange}
              className={styles.filterInput}
            />
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="role" className={styles.filterLabel}>
              Role
            </label>
            <select
              id="role"
              name="role"
              value={filters.role}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label htmlFor="sortBy" className={styles.filterLabel}>
              Sort By
            </label>
            <select
              id="sortBy"
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className={styles.filterSelect}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="nameAZ">Name: A to Z</option>
              <option value="nameZA">Name: Z to A</option>
              <option value="email">Email</option>
            </select>
          </div>
        </div>

        <div className={styles.filterActions}>
          <button className={styles.resetButton} onClick={resetFilters}>
            Reset Filters
          </button>
        </div>

        {/* Display active filters */}
        {(search || filters.role) && (
          <div className={styles.activeFilters}>
            {search && (
              <div className={styles.filterChip}>
                Search: {search}
                <button
                  className={styles.removeFilterButton}
                  onClick={() => setSearch("")}
                >
                  ×
                </button>
              </div>
            )}
            {filters.role && (
              <div className={styles.filterChip}>
                Role: {filters.role}
                <button
                  className={styles.removeFilterButton}
                  onClick={() => setFilters((prev) => ({ ...prev, role: "" }))}
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Users table with pagination */}
      {loading ? (
        <div className={styles.loadingState}>
          <div className={styles.spinner}></div>
          <p>Loading users...</p>
        </div>
      ) : users.length > 0 ? (
        <div className={styles.tableContainer}>
          <table className={styles.usersTable}>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Orders</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className={styles.userRow}>
                  <td className={styles.userName}>
                    <div className={styles.userAvatar}>
                      {(
                        user.name?.charAt(0) || user.email.charAt(0)
                      ).toUpperCase()}
                    </div>
                    <span>{user.name || "No Name"}</span>
                  </td>
                  <td className={styles.userEmail}>{user.email}</td>
                  <td>
                    <span
                      className={`${styles.roleBadge} ${user.role === "admin" ? styles.adminBadge : styles.customerBadge}`}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td className={styles.orderCount}>
                    <Link href={`/orders?userId=${user.id}`}>
                      {user.orders || 0} Orders
                    </Link>
                  </td>
                  <td className={styles.createdDate}>
                    {formatDate(user.createdAt)}
                  </td>
                  <td className={styles.actions}>
                    <Link
                      href={`/users/${user.id}`}
                      className={`${styles.actionButton} ${styles.viewButton}`}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={styles.actionIcon}
                      >
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination component - properly implemented */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.currentPage}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pagination.pageSize}
              hasMore={pagination.hasMore}
              onPageChange={handlePageChange}
              itemName="users"
            />
          )}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateIcon}>👤</div>
          <h3 className={styles.emptyStateTitle}>No users found</h3>
          <p className={styles.emptyStateMessage}>
            {pagination.total === 0
              ? "You can add a new user by clicking the button above."
              : "Try adjusting your filters to find what you're looking for."}
          </p>
        </div>
      )}
    </div>
  );
}
