"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./categoryBox.module.css";

type CategoryBoxProps = {
  categories: string[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onFocusSearch?: () => void;
};

export function CategoryBox({
  categories,
  selectedCategory,
  onCategoryChange,
  onFocusSearch,
}: CategoryBoxProps) {
  const selectWrapperRef = useRef<HTMLDivElement>(null);
  const textMeasureRef = useRef<HTMLSpanElement>(null);

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

  // Set the initial width when component mounts
  useEffect(() => {
    updateSelectWidth(selectedCategory);
  }, [selectedCategory]);

  return (
    <div ref={selectWrapperRef} className={styles.categorySelectWrapper}>
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
