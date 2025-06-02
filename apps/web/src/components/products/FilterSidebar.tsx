"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./FilterSidebar.module.css";
import { formatPrice } from "@repo/utils";
type FilterSidebarProps = {
  filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    brand: string | string[];
    sortBy: string;
    stockStatus: string;
    [key: string]: string | string[];
  };
  categories: string[];
  priceRange: { min: number; max: number };
  brands: string[];
  onFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  onResetFilters: () => void;
  onRemoveFilter: (name: string) => void;
  onQuickPriceChange: (min: number, max: number) => void;
};

/**
 * FilterSidebar component renders a sidebar with various filters for products.
 * It includes category selection, price range slider, brand checkboxes, and availability options.
 *
 * @param {FilterSidebarProps} props - The properties for the FilterSidebar component.
 * @returns {JSX.Element} The rendered filter sidebar.
 */
export function FilterSidebar({
  filters,
  categories,
  priceRange,
  brands,
  onFilterChange,
  onResetFilters,
  onRemoveFilter,
  onQuickPriceChange,
}: FilterSidebarProps) {
  const handleQuickPriceClick = (min: number, max: number | null) => {
    const maxValue = max !== null ? max : priceRange.max;
    setSliderValues([min, maxValue]);
    onQuickPriceChange(min, maxValue);
  };
  const currentMinPrice = filters.minPrice
    ? parseInt(filters.minPrice)
    : priceRange.min;
  const currentMaxPrice = filters.maxPrice
    ? parseInt(filters.maxPrice)
    : priceRange.max;
  // State for slider values
  const [sliderValues, setSliderValues] = useState<[number, number]>([
    currentMinPrice,
    currentMaxPrice,
  ]);
  useEffect(() => {
    setSliderValues([
      filters.minPrice ? parseInt(filters.minPrice) : priceRange.min,
      filters.maxPrice ? parseInt(filters.maxPrice) : priceRange.max,
    ]);
  }, [filters.minPrice, filters.maxPrice, priceRange]);

  // Handle price slider changes
  const handleSliderChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    index: 0 | 1,
  ) => {
    const newValue = parseInt(event.target.value);
    const newSliderValues = [...sliderValues] as [number, number];

    // Calculate the minimum gap (10% of range)
    const minGap = Math.ceil((priceRange.max - priceRange.min) * 0.05);

    // Ensure min can't exceed max and max can't be less than min
    if (index === 0) {
      // Min thumb changed - ensure it doesn't go above max - minGap
      newSliderValues[0] = Math.min(newValue, sliderValues[1] - minGap);
    } else {
      // Max thumb changed - ensure it doesn't go below min + minGap
      newSliderValues[1] = Math.max(newValue, sliderValues[0] + minGap);
    }

    // Ensure values are within bounds
    newSliderValues[0] = Math.max(priceRange.min, newSliderValues[0]);
    newSliderValues[1] = Math.min(priceRange.max, newSliderValues[1]);

    setSliderValues(newSliderValues);
  };
  // Apply price filter when Go button is clicked
  const applyPriceFilter = () => {
    onQuickPriceChange(sliderValues[0], sliderValues[1]);
  };

  return (
    <div className={styles.filterSidebar} data-test-id="filter-sidebar">
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>Filters</h2>
        <button
          onClick={onResetFilters}
          className={styles.resetButton}
          aria-label="Reset all filters"
          data-test-id="reset-filters-button"
        >
          Reset
        </button>
      </div>

      {/* Department/Category Filter */}
      <div
        className={styles.filterSection}
        data-test-id="category-filter-section"
      >
        <h3 className={styles.filterSectionTitle}>Department</h3>
        <ul className={styles.categoryList} data-test-id="category-list">
          <li>
            <button
              className={`${styles.categoryButton} ${!filters.category ? styles.active : ""}`}
              onClick={() => onRemoveFilter("category")}
              data-test-id="category-all"
            >
              All Departments
            </button>
          </li>
          {categories.map((category) => (
            <li key={category}>
              <button
                className={`${styles.categoryButton} ${filters.category === category ? styles.active : ""}`}
                onClick={() => {
                  const event = {
                    target: {
                      name: "category",
                      value: category,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  onFilterChange(event);
                }}
                data-test-id={`category-${category.toLowerCase().replace(/\s+/g, "-")}`}
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Filter - UPDATED */}
      <div className={styles.filterSection} data-test-id="price-filter-section">
        <h3 className={styles.filterSectionTitle}>Price</h3>

        {/* Price display */}
        <div className={styles.priceDisplay} data-test-id="price-display">
          <span>{formatPrice(sliderValues[0])}</span>
          <span>to</span>
          <span>{formatPrice(sliderValues[1])}</span>
        </div>

        {/* New slider implementation */}
        <div className={styles.rangeSlider} data-test-id="price-slider">
          {/* Min thumb */}
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={sliderValues[0]}
            onChange={(e) => handleSliderChange(e, 0)}
            className={styles.rangeMin}
            step="1"
          />

          {/* Max thumb */}
          <input
            type="range"
            min={priceRange.min}
            max={priceRange.max}
            value={sliderValues[1]}
            onChange={(e) => handleSliderChange(e, 1)}
            className={styles.rangeMax}
            step="1"
          />

          {/* Slider track */}
          <div className={styles.sliderTrack}></div>

          {/* Progress bar between thumbs */}
          <div
            className={styles.sliderProgress}
            style={{
              left: `${((sliderValues[0] - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
              width: `${((sliderValues[1] - sliderValues[0]) / (priceRange.max - priceRange.min)) * 100}%`,
            }}
          ></div>
        </div>

        {/* Apply button */}
        <button
          className={styles.applyButton}
          onClick={applyPriceFilter}
          style={{ marginTop: "12px", width: "100%" }}
          data-test-id="apply-price-button"
        >
          Apply Price Range
        </button>

        {/* Quick price buttons */}
        <div
          className={styles.quickPriceButtons}
          data-test-id="quick-price-buttons"
        >
          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(0, 25)}
            data-test-id="price-under-25"
          >
            Under $25
          </button>

          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(25, 50)}
            data-test-id="price-25-50"
          >
            $25 to $50
          </button>

          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(50, 100)}
            data-test-id="price-50-100"
          >
            $50 to $100
          </button>

          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(100, null)}
            data-test-id="price-100-plus"
          >
            $100 & Above
          </button>
        </div>
      </div>

      {/* Brand Filter */}
      {brands.length > 0 && (
        <div
          className={styles.filterSection}
          data-test-id="brand-filter-section"
        >
          <h3 className={styles.filterSectionTitle}>Brand</h3>
          <ul className={styles.brandList} data-test-id="brand-list">
            {brands.map((brand) => {
              // Check if this brand is selected
              const isSelected = Array.isArray(filters.brand)
                ? filters.brand.includes(brand)
                : filters.brand === brand;

              return (
                <li
                  key={brand}
                  className={styles.brandItem}
                  data-test-id={`brand-item-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      name="brand"
                      value={brand}
                      checked={isSelected}
                      onChange={() => {
                        // Handle multiple selection without creating a fake event
                        const currentBrands = Array.isArray(filters.brand)
                          ? [...filters.brand]
                          : filters.brand
                            ? [filters.brand]
                            : [];

                        let newBrands;
                        if (isSelected) {
                          // Remove this brand if already selected
                          newBrands = currentBrands.filter((b) => b !== brand);
                        } else {
                          // Add this brand
                          newBrands = [...currentBrands, brand];
                        }

                        // Use a direct action to update filters instead of synthetic event
                        if (newBrands.length === 0) {
                          onRemoveFilter("brand");
                        } else if (newBrands.length === 1) {
                          const event = {
                            target: {
                              name: "brand",
                              value: newBrands[0],
                            },
                          } as React.ChangeEvent<HTMLInputElement>;
                          onFilterChange(event);
                        } else {
                          const event = {
                            target: {
                              name: "brand",
                              value: newBrands,
                            },
                          } as unknown as React.ChangeEvent<HTMLInputElement>;
                          onFilterChange(event);
                        }
                      }}
                      className={styles.checkbox}
                      data-test-id={`brand-checkbox-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                    />
                    <span
                      className={styles.brandName}
                      data-test-id={`brand-name-${brand.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      {brand}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Availability Filter */}
      <div
        className={styles.filterSection}
        data-test-id="availability-filter-section"
      >
        <h3 className={styles.filterSectionTitle}>Availability</h3>
        <div
          className={styles.availabilityOptions}
          data-test-id="availability-options"
        >
          <label className={styles.checkboxLabel}>
            <input
              type="radio"
              name="stockStatus"
              value=""
              checked={filters.stockStatus === ""}
              onChange={onFilterChange}
              className={styles.checkbox}
              data-test-id="stock-status-all"
            />
            <span>All</span>
          </label>
          <label className={styles.checkboxLabel}>
            <input
              type="radio"
              name="stockStatus"
              value="inStock"
              checked={filters.stockStatus === "inStock"}
              onChange={onFilterChange}
              className={styles.checkbox}
              data-test-id="stock-status-in-stock"
            />
            <span>In Stock</span>
          </label>
        </div>
      </div>
    </div>
  );
}
