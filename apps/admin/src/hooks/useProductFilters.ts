import { useState, useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product } from "@repo/db/data";

type FilterState = {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  stockStatus: string;
  sortBy: string;
};

type PaginationData = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
};

export const useServerProductFilters = () => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: 12,
    hasMore: false,
  });

  // Initialize filters from URL search params
  const [filters, setFilters] = useState<FilterState>({
    search: searchParams.get("search") || "",
    category: searchParams.get("category") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    stockStatus: searchParams.get("stockStatus") || "",
    sortBy: searchParams.get("sortBy") || "newest",
  });

  // Fetch products with current filters
  const fetchProducts = async () => {
    setLoading(true);

    // Build query params for API request
    const params = new URLSearchParams();
    params.set("page", pagination.currentPage.toString());
    params.set("limit", pagination.pageSize.toString());

    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.stockStatus) params.set("stockStatus", filters.stockStatus);
    if (filters.sortBy) params.set("sortBy", filters.sortBy);

    try {
      const response = await fetch(`/api/products/search?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products);
      setPagination(data.pagination);
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update URL with current filters
  const updateUrl = () => {
    const params = new URLSearchParams();

    if (filters.search) params.set("search", filters.search);
    if (filters.category) params.set("category", filters.category);
    if (filters.minPrice) params.set("minPrice", filters.minPrice);
    if (filters.maxPrice) params.set("maxPrice", filters.maxPrice);
    if (filters.stockStatus) params.set("stockStatus", filters.stockStatus);
    if (filters.sortBy && filters.sortBy !== "newest")
      params.set("sortBy", filters.sortBy);
    if (pagination.currentPage > 1)
      params.set("page", pagination.currentPage.toString());

    // Update URL without reloading the page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Fetch products when filters or page changes
  useEffect(() => {
    fetchProducts();
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
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      stockStatus: "",
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

  // Delete a product and refresh
  const handleDelete = async (productId: number) => {
    await fetch(`/api/products/${productId}`, { method: "DELETE" });
    fetchProducts(); // Refresh list after deletion
  };

  return {
    products,
    loading,
    filters,
    pagination,
    categories,
    fetchProducts,
    handleFilterChange,
    resetFilters,
    setPage,
    removeFilter,
    handleDelete,
  };
};
