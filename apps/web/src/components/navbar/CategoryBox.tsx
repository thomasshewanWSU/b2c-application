"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./categoryBox.module.css";

type CategoryBoxProps = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onFocusSearch?: () => void;
};
/**
 * CategoryBox component renders a dropdown for selecting categories.
 * It dynamically adjusts its width based on the selected category text.
 * The component also supports focusing on a search input when a category is selected.
 *
 * @param {CategoryBoxProps} props - The properties for the CategoryBox component.
 * @returns {JSX.Element} The rendered category box with dropdown and dynamic width.
 */
export function CategoryBox({
  categories,
  selectedCategory,
  onCategoryChange,
  onFocusSearch,
}: CategoryBoxProps) {
  const selectWrapperRef = useRef<HTMLDivElement>(null);
  const textMeasureRef = useRef<HTMLSpanElement>(null);
  const [hydrated, setHydrated] = useState(false);
  const [calculatedWidth, setCalculatedWidth] = useState(false);

  // Detect hydration
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Update width after hydration
  useEffect(() => {
    if (!hydrated) return;

    const selectedText =
      selectedCategory === "All"
        ? "All"
        : categories.find((c) => c === selectedCategory) || selectedCategory;

    updateSelectWidth(selectedText);
    // Mark width as calculated after a small delay
    const timer = setTimeout(() => setCalculatedWidth(true), 10);
    return () => clearTimeout(timer);
  }, [hydrated, selectedCategory, categories]);

  const updateSelectWidth = (text: string) => {
    if (selectWrapperRef.current && textMeasureRef.current) {
      // Set the text in our measuring span
      textMeasureRef.current.textContent = text;

      // Get the width of the text plus padding
      const textWidth = textMeasureRef.current.offsetWidth + 10;
      const arrowPadding = 24; // Space for dropdown arrow
      const totalWidth = textWidth + arrowPadding;

      // Set minimum width
      const minWidth = 60;
      const finalWidth = Math.max(minWidth, totalWidth);

      // Apply the width to the wrapper
      selectWrapperRef.current.style.width = `${finalWidth}px`;
    }
  };

  // Handle category change
  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value;
    onCategoryChange(newValue);

    // Get the text content of the selected option
    const selectedOption = e.target.options[e.target.selectedIndex];
    updateSelectWidth(selectedOption?.textContent || newValue);

    // Focus on search input if callback provided
    if (onFocusSearch) {
      setTimeout(() => {
        onFocusSearch();
      }, 10);
    }
  };

  return (
    <div
      ref={selectWrapperRef}
      className={`${styles.categorySelectWrapper} ${!calculatedWidth ? styles.initializing : ""}`}
    >
      <select
        value={selectedCategory}
        onChange={handleCategoryChange}
        className={styles.categorySelect}
        aria-label="Select category"
      >
        <option value="All">All</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
      <div className={styles.selectArrow}></div>
      <span ref={textMeasureRef} className={styles.categoryTextMeasure}></span>
    </div>
  );
}
