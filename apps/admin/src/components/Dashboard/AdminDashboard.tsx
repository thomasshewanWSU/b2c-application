"use client";

import { useState } from "react";
import { Product } from "@repo/db/data";
import styles from "./adminDashboard.module.css";

type AdminDashboardProps = {
  initialProducts: Product[];
};
/**
 * AdminDashboard - Main dashboard for blog post management
 *
 * Central component for the admin interface that combines filtering
 * functionality with post listing. Maintains filter state and passes
 * filtered posts to the BlogList component.
 *
 * Features:
 * - Post filtering with PostFilters component
 * - Dynamic post list display
 * - State management for filtered posts
 *
 * @param {Post[]} initialPosts - The initial collection of posts to display
 * @returns {JSX.Element} Complete dashboard with filters and post list
 */
export function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  return (
    <div className={styles.dashboardContainer}>
      <h2 className={styles.dashboardTitle}>Products</h2>
    </div>
  );
}
