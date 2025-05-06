import styles from "../components/products/productList.module.css";

// Get stock status badge class
export const getStockStatusClass = (stock: number) => {
  if (stock === 0) return styles.outOfStock;
  if (stock <= 10) return styles.lowStock;
  return styles.inStock;
};

// Get stock status text
export const getStockStatusText = (stock: number) => {
  if (stock === 0) return "Out of Stock";
  if (stock <= 10) return "Low Stock";
  return "In Stock";
};

// Format currency
export const formatPrice = (price: number) => {
  return new Intl.NumberFormat("en-AU", {
    style: "currency",
    currency: "AUD",
    minimumFractionDigits: 2,
  }).format(price);
};
