"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product } from "@repo/db/data";

// Update the FilterState type to include brand
export type FilterState = {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  brand: string | string[]; // Support both string and array
  sortBy: string;
  stockStatus: string;
  [key: string]: string | string[]; // Support for additional filters
};

type PaginationData = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
};

export const useProductFilters = ({
  apiEndpoint = "/api/products/search",
  initialFilters = {},
  defaultPageSize = 12,
  defaultSortBy = "newest",
  includeAdminFeatures = false,
}: {
  apiEndpoint?: string;
  initialFilters?: Record<string, string | string[] | undefined>;
  defaultPageSize?: number;
  defaultSortBy?: string;
  includeAdminFeatures?: boolean;
} = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });

  // Initialize pagination with configurable page size
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    totalPages: 0,
    currentPage: 1,
    pageSize: defaultPageSize,
    hasMore: false,
  });

  // Initialize filters with search params or defaults
  const [filters, setFilters] = useState<FilterState>(() => {
    // Handle brand parameter which could be multiple
    const brandParams = searchParams.getAll("brand");
    const brandValue =
      brandParams.length > 1
        ? brandParams
        : searchParams.get("brand") || initialFilters.brand?.toString() || "";

    return {
      search:
        searchParams.get("search") || initialFilters.search?.toString() || "",
      category:
        searchParams.get("category") ||
        initialFilters.category?.toString() ||
        "",
      minPrice:
        searchParams.get("minPrice") ||
        initialFilters.minPrice?.toString() ||
        "",
      maxPrice:
        searchParams.get("maxPrice") ||
        initialFilters.maxPrice?.toString() ||
        "",
      brand: brandValue,
      stockStatus:
        searchParams.get("stockStatus") ||
        initialFilters.stockStatus?.toString() ||
        "",
      sortBy:
        searchParams.get("sortBy") ||
        initialFilters.sortBy?.toString() ||
        defaultSortBy,
    };
  });

  // Fetch products based on current filters
  const fetchProducts = async () => {
    setLoading(true);

    // Build query params for the API call
    const params = new URLSearchParams();

    // Add all non-empty filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((item) => {
            params.append(key, item);
          });
        } else {
          params.append(key, value);
        }
      }
    });

    // Add pagination parameters
    params.append("page", pagination.currentPage.toString());
    params.append("limit", pagination.pageSize.toString());

    try {
      const response = await fetch(`${apiEndpoint}?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch products");
      }

      setProducts(data.products);
      setPagination(data.pagination);

      // Update filter-related data
      if (data.categories) setCategories(data.categories);
      if (data.brands) setBrands(data.brands);
      if (data.priceRange) setPriceRange(data.priceRange);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update filters when search params change
  useEffect(() => {
    // Remove duplicate comment
    const updatedFilters = { ...filters };
    let hasChanged = false;

    // Handle special case for brand which could have multiple values
    const brandParams = searchParams.getAll("brand");
    if (brandParams.length > 0) {
      // If we have multiple brand params, use array
      if (brandParams.length > 1) {
        if (JSON.stringify(brandParams) !== JSON.stringify(filters.brand)) {
          updatedFilters.brand = brandParams;
          hasChanged = true;
        }
      }
      // If we have just one, use string
      else if (brandParams[0] !== filters.brand) {
        updatedFilters.brand = brandParams[0] || "";
        hasChanged = true;
      }
    }
    // If no brand param but we have a value, clear it
    else if (filters.brand) {
      updatedFilters.brand = "";
      hasChanged = true;
    }

    // Update all other filters from URL search params
    for (const key of Object.keys(filters)) {
      if (key !== "brand") {
        // Skip brand which we handled above
        const paramValue = searchParams.get(key);
        if (paramValue !== null && paramValue !== filters[key]) {
          updatedFilters[key] = paramValue;
          hasChanged = true;
        } else if (paramValue === null && filters[key]) {
          updatedFilters[key] = "";
          hasChanged = true;
        }
      }
    }

    if (hasChanged) {
      // Only update filters - don't trigger fetchProducts here
      setFilters(updatedFilters);
    }
  }, [searchParams]);

  // Fetch products when filters or pagination change
  useEffect(() => {
    fetchProducts();
    // Don't call updateUrl() here to avoid the loop
  }, [filters, pagination.currentPage, pagination.pageSize]);

  const lastUrlRef = useRef<string>("");

  const updateUrl = useCallback(() => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          // For arrays (like multiple brands), add each item as a separate param
          value.forEach((item) => {
            if (item) {
              params.append(key, item);
            }
          });
        } else if (typeof value === "string" && value.trim() !== "") {
          params.set(key, value);
        }
      }
    });

    if (pagination.currentPage > 1) {
      params.set("page", pagination.currentPage.toString());
    }

    const newSearch = params.toString();
    const newPathWithSearch = pathname + (newSearch ? `?${newSearch}` : "");

    // Only update URL if it has actually changed
    if (newPathWithSearch !== lastUrlRef.current) {
      lastUrlRef.current = newPathWithSearch;
      router.replace(newPathWithSearch, { scroll: false });
    }
  }, [filters, pagination.currentPage, pathname, router]);
  useEffect(() => {
    updateUrl();
  }, [updateUrl]);
  // Handle filter change from inputs/selects
  // Handle filter change from inputs/selects
  const handleFilterChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    // Prevent redundant updates if value hasn't changed
    if (filters[name] === value) {
      return;
    }

    // Reset to page 1 when changing filters
    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));

    // Update filters with new value
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  // Remove a specific filter
  const removeFilter = (name: string) => {
    // Make sure we don't throw an error if name isn't in FilterState
    setFilters((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      minPrice: "",
      maxPrice: "",
      brand: "",
      stockStatus: "",
      sortBy: defaultSortBy,
    });

    setPagination((prev) => ({
      ...prev,
      currentPage: 1,
    }));
  };

  // Set page for pagination
  const setPage = (page: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  // Admin-specific features
  const adminFeatures = includeAdminFeatures
    ? {
        handleDelete: async (productId: number) => {
          await fetch(`/api/admin/products/${productId}`, { method: "DELETE" });
          fetchProducts();
        },
        handleToggleFeatured: async (productId: number, featured: boolean) => {
          await fetch(`/api/admin/products/${productId}/featured`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ featured }),
          });
          fetchProducts();
        },
      }
    : {};

  return {
    products,
    loading,
    filters,
    pagination,
    categories,
    brands,
    priceRange,
    fetchProducts,
    handleFilterChange,
    resetFilters,
    setPage,
    removeFilter,
    ...adminFeatures,
  };
};
