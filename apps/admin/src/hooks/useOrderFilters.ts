import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type FilterState = {
  userId: string;
  status: string;
  minTotal: string;
  maxTotal: string;
  fromDate: string;
  toDate: string;
  sortBy: string;
};

type PaginationData = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
};

/**
 * Custom hook to manage order filters and pagination.
 * It fetches orders based on the current filters and pagination state,
 * updates the URL with filter parameters, and provides methods to handle
 * filter changes, reset filters, and pagination.
 *
 * @returns {Object} - Contains orders, loading state, filters, pagination data,
 *                     statuses, and methods to manage filters and pagination.
 */
export const useOrderFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<any[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 0,
    currentPage: parseInt(searchParams.get("page") || "1", 10),
    pageSize: 20,
    hasMore: false,
  });

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<FilterState>({
    userId: searchParams.get("userId") || "",
    status: searchParams.get("status") || "",
    minTotal: searchParams.get("minTotal") || "",
    maxTotal: searchParams.get("maxTotal") || "",
    fromDate: searchParams.get("fromDate") || "",
    toDate: searchParams.get("toDate") || "",
    sortBy: searchParams.get("sortBy") || "newest",
  });

  // Fetch orders with current filters
  const fetchOrders = async () => {
    setLoading(true);

    // Build query params for API request
    const params = new URLSearchParams();
    params.set("page", pagination.currentPage.toString());
    params.set("limit", pagination.pageSize.toString());

    if (filters.userId) params.set("userId", filters.userId);
    if (filters.status) params.set("status", filters.status);
    if (filters.minTotal) params.set("minTotal", filters.minTotal);
    if (filters.maxTotal) params.set("maxTotal", filters.maxTotal);
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);

    try {
      const response = await fetch(`/api/orders/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch orders");
      }

      setOrders(data.orders);
      setPagination(data.pagination);
      if (data.statuses) {
        setStatuses(data.statuses);
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL with current filters
  const updateUrl = () => {
    const params = new URLSearchParams();

    if (filters.userId) params.set("userId", filters.userId);
    if (filters.status) params.set("status", filters.status);
    if (filters.minTotal) params.set("minTotal", filters.minTotal);
    if (filters.maxTotal) params.set("maxTotal", filters.maxTotal);
    if (filters.fromDate) params.set("fromDate", filters.fromDate);
    if (filters.toDate) params.set("toDate", filters.toDate);
    if (filters.sortBy && filters.sortBy !== "newest")
      params.set("sortBy", filters.sortBy);
    if (pagination.currentPage > 1)
      params.set("page", pagination.currentPage.toString());

    // Update URL without reloading the page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fetch orders when filters or page changes
  useEffect(() => {
    fetchOrders();
    updateUrl();
  }, [filters, pagination.currentPage]);

  // Handle filter changes
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    // Reset to first page when filters change
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      userId: "",
      status: "",
      minTotal: "",
      maxTotal: "",
      fromDate: "",
      toDate: "",
      sortBy: "newest",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  // Set page
  const setPage = (page: number) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  // Remove a specific filter
  const removeFilter = (filterName: keyof FilterState) => {
    setFilters((prev) => ({ ...prev, [filterName]: "" }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  return {
    orders,
    loading,
    filters,
    pagination,
    statuses,
    fetchOrders,
    handleFilterChange,
    resetFilters,
    setPage,
    removeFilter,
  };
};
