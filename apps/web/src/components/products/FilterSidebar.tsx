"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./FilterSidebar.module.css";
import { formatPrice } from "@repo/utils/";
type FilterSidebarProps = {
  filters: {
    search: string;
    category: string;
    minPrice: string;
    maxPrice: string;
    brand: string | string[]; // Update to support array of brands
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
  onRemoveFilter: (name: string) => void; // Keep this as string type
};

export function FilterSidebar({
  filters,
  categories,
  priceRange,
  brands,
  onFilterChange,
  onResetFilters,
  onRemoveFilter,
}: FilterSidebarProps) {
  const handleQuickPriceClick = (min: number, max: number | null) => {
    // Update slider visually
    setSliderValues([min, max !== null ? max : priceRange.max]);

    // Apply the filter
    setTimeout(() => {
      const minPriceEvent = {
        target: { name: "minPrice", value: min.toString() },
      } as React.ChangeEvent<HTMLInputElement>;

      const maxPriceEvent = {
        target: {
          name: "maxPrice",
          value: max !== null ? max.toString() : "",
        },
      } as React.ChangeEvent<HTMLInputElement>;

      onFilterChange(minPriceEvent);
      onFilterChange(maxPriceEvent);
    }, 0);
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
    const minGap = Math.ceil((priceRange.max - priceRange.min) * 0.1);

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
    const minPriceEvent = {
      target: {
        name: "minPrice",
        value: sliderValues[0].toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;

    const maxPriceEvent = {
      target: {
        name: "maxPrice",
        value: sliderValues[1].toString(),
      },
    } as React.ChangeEvent<HTMLInputElement>;

    onFilterChange(minPriceEvent);
    onFilterChange(maxPriceEvent);
  };

  return (
    <div className={styles.filterSidebar}>
      <div className={styles.filterHeader}>
        <h2 className={styles.filterTitle}>Filters</h2>
        <button
          onClick={onResetFilters}
          className={styles.resetButton}
          aria-label="Reset all filters"
        >
          Reset
        </button>
      </div>

      {/* Department/Category Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Department</h3>
        <ul className={styles.categoryList}>
          <li>
            <button
              className={`${styles.categoryButton} ${!filters.category ? styles.active : ""}`}
              onClick={() => onRemoveFilter("category")}
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
              >
                {category}
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Price Range Filter - UPDATED */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Price</h3>

        {/* Price display */}
        <div className={styles.priceDisplay}>
          <span>{formatPrice(sliderValues[0])}</span>
          <span>to</span>
          <span>{formatPrice(sliderValues[1])}</span>
        </div>

        {/* New slider implementation */}
        <div className={styles.rangeSlider}>
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
        >
          Apply Price Range
        </button>

        {/* Quick price buttons */}
        <div className={styles.quickPriceButtons}>
          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(0, 25)}
          >
            Under $25
          </button>

          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(25, 50)}
          >
            $25 to $50
          </button>

          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(50, 100)}
          >
            $50 to $100
          </button>

          <button
            className={styles.quickPriceButton}
            onClick={() => handleQuickPriceClick(100, null)}
          >
            $100 & Above
          </button>
        </div>
      </div>

      {/* Brand Filter */}
      {/* Brand Filter */}
      {brands.length > 0 && (
        <div className={styles.filterSection}>
          <h3 className={styles.filterSectionTitle}>Brand</h3>
          <ul className={styles.brandList}>
            {brands.map((brand) => {
              // Check if this brand is selected
              const isSelected = Array.isArray(filters.brand)
                ? filters.brand.includes(brand)
                : filters.brand === brand;

              return (
                <li key={brand} className={styles.brandItem}>
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
                    />
                    <span className={styles.brandName}>{brand}</span>
                  </label>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Availability Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.filterSectionTitle}>Availability</h3>
        <div className={styles.availabilityOptions}>
          <label className={styles.checkboxLabel}>
            <input
              type="radio"
              name="stockStatus"
              value=""
              checked={filters.stockStatus === ""}
              onChange={onFilterChange}
              className={styles.checkbox}
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
            />
            <span>In Stock</span>
          </label>
        </div>
      </div>
    </div>
  );
}
