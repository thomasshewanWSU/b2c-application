import { useState, useEffect } from "react";

interface Pagination {
  currentPage: number;
  totalPages: number;
  total: number;
  pageSize: number;
  hasMore: boolean;
}

interface UserFilters {
  role: string;
  sortBy: string;
}

interface UseUserFiltersResult<T> {
  users: T[];
  loading: boolean;
  error: string;
  search: string;
  filters: UserFilters;
  pagination: Pagination;
  setSearch: (search: string) => void;
  handleFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  resetFilters: () => void;
  handlePageChange: (page: number) => void;
}

/**
 * Custom hook to manage user filters and pagination.
 * Fetches users from the provided API endpoint with search and filter options.
 *
 * @param apiEndpoint - The API endpoint to fetch users from.
 * @returns An object containing users, loading state, error message, filters, pagination, and functions to handle changes.
 */
export function useUserFilters<T>(
  apiEndpoint: string = "/api/users/search",
): UseUserFiltersResult<T> {
  // State for users data
  const [users, setUsers] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // State for filters
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<UserFilters>({
    role: "",
    sortBy: "newest",
  });

  // State for pagination
  const [pagination, setPagination] = useState<Pagination>({
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

      const response = await fetch(`${apiEndpoint}?${params.toString()}`);

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

  return {
    users,
    loading,
    error,
    search,
    filters,
    pagination,
    setSearch,
    handleFilterChange,
    resetFilters,
    handlePageChange,
  };
}
