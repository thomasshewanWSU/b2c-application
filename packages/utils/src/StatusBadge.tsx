// @repo/utils/src/StatusBadge.tsx
import styles from "./statusBadge.module.css";

// Get status badge class for order statuses
export const getOrderStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case "delivered":
      return styles.statusDelivered || "";
    case "shipped":
      return styles.statusShipped || "";
    case "processing":
      return styles.statusProcessing || "";
    case "pending":
      return styles.statusPending || "";
    case "cancelled":
      return styles.statusCancelled || "";
    default:
      return ""; // Return empty string instead of undefined
  }
};
export const getStockStatusText = (stock: number): string => {
  if (stock === 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
};
export const getStockStatusClass = (stock: number): string => {
  if (stock === 0) return "outOfStock";
  if (stock <= 10) return "lowStock";
  return "inStock";
};
