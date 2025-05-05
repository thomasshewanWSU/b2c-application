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
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(price);
};

// Generate page numbers for pagination
export const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pageNumbers = [];
  const maxPagesToShow = 5;

  if (totalPages <= maxPagesToShow) {
    // Show all pages
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(i);
    }
  } else {
    // Always include first page
    pageNumbers.push(1);

    // Calculate start and end
    let startPage = Math.max(2, currentPage - 1);
    let endPage = Math.min(totalPages - 1, currentPage + 1);

    // Adjust for edge cases
    if (currentPage <= 3) {
      endPage = Math.min(4, totalPages - 1);
    }
    if (currentPage >= totalPages - 2) {
      startPage = Math.max(2, totalPages - 3);
    }

    // Add ellipsis after first page if needed
    if (startPage > 2) {
      pageNumbers.push("...");
    }

    // Add middle pages
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis before last page if needed
    if (endPage < totalPages - 1) {
      pageNumbers.push("...");
    }

    // Always include last page
    if (totalPages > 1) {
      pageNumbers.push(totalPages);
    }
  }

  return pageNumbers;
};
