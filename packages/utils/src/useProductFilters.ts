"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Product, FilterState, PaginationData } from "./types";

export const useProductFilters = ({
  apiEndpoint = "/api/products/search",
  initialFilters = {},
  defaultPageSize = 8,
  defaultSortBy = "newest",
  initialProducts = undefined, // Accept initial products
}: {
  apiEndpoint?: string;
  initialFilters?: Record<string, string | string[] | undefined>;
  defaultPageSize?: number;
  defaultSortBy?: string;
  initialProducts?: Product[];
} = {}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [loading, setLoading] = useState(!initialProducts); // Not loading if we have initial data

  const [categories, setCategories] = useState<string[]>([]);
  const [brands, setBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const isInitialRender = useRef(true);
  const isUrlChangeFromFilter = useRef(false);
  const lastRequestParams = useRef("");

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
      activeStatus:
        searchParams.get("activeStatus") ||
        initialFilters.activeStatus?.toString() ||
        "",

      sortBy:
        searchParams.get("sortBy") ||
        initialFilters.sortBy?.toString() ||
        defaultSortBy,
    };
  });
  useEffect(() => {
    // Set lastRequestParams to the initial state so the first fetch isn't duplicated
    lastRequestParams.current = JSON.stringify({
      filters,
      page: pagination.currentPage,
      limit: pagination.pageSize,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch products based on current filters
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build the current request parameters string
      const currentParams = JSON.stringify({
        filters,
        page: pagination.currentPage,
        limit: pagination.pageSize,
      });

      // If this exact request was just made, skip it
      if (currentParams === lastRequestParams.current) {
        setLoading(false);
        return;
      }

      // Save the current parameters for deduplication
      lastRequestParams.current = currentParams;
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
  useEffect(() => {
    // Only process URL params if this change wasn't triggered by our own filter updates
    if (isUrlChangeFromFilter.current) {
      isUrlChangeFromFilter.current = false;
      return;
    }

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
      // The filters effect will handle the fetch
      setFilters(updatedFilters);
    } else {
      // Only fetch if no filter changes were made
      // This covers direct URL navigation/refresh
      fetchProducts();
    }
  }, [searchParams]);

  const lastUrlRef = useRef<string>("");
  // Then in your updateUrl function:
  const updateUrl = useCallback(() => {
    // Set the flag to indicate we're updating the URL ourselves
    isUrlChangeFromFilter.current = true;

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
    // Skip the very first render to avoid double fetching with the URL params effect
    if (isInitialRender.current) {
      isInitialRender.current = false;
      return;
    }

    // When filters or pagination change, fetch updated products
    fetchProducts();
  }, [filters, pagination.currentPage, pagination.pageSize]);

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
      activeStatus: "",

      sortBy: "",
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
  };
};
