import styles from "./pagination.module.css";
import { PaginationProps } from "./types";

/**
 * Pagination component for navigating through paginated data.
 *
 * Displays page numbers, previous/next buttons, and current page information.
 * Handles page changes through a callback function.
 *
 * @param {Object} props - Component properties
 * @param {number} props.currentPage - The current active page number
 * @param {number} props.totalPages - Total number of pages available
 * @param {number} props.totalItems - Total number of items across all pages
 * @param {number} props.pageSize - Number of items per page
 * @param {boolean} props.hasMore - Whether there are more pages to load
 * @param {function} props.onPageChange - Callback function to handle page changes
 * @param {string} [props.itemName="items"] - Name of the item type for display
 * @returns {JSX.Element} The rendered pagination component
 */
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  hasMore,
  onPageChange,
  itemName = "items",
}: PaginationProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  return (
    <div className={styles.paginationControls} data-test-id="pagination">
      <div className={styles.paginationInfo}>
        Showing {(currentPage - 1) * pageSize + 1} to{" "}
        {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{" "}
        {itemName}
      </div>

      <div className={styles.paginationButtons}>
        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Previous page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>

        {pageNumbers.map((pageNum, index) =>
          pageNum === "..." ? (
            <span key={`ellipsis-${index}`} className={styles.paginationButton}>
              ...
            </span>
          ) : (
            <button
              key={`page-${pageNum}`}
              className={`${styles.paginationButton} ${pageNum === currentPage ? styles.activePage : ""}`}
              onClick={() => onPageChange(Number(pageNum))}
            >
              {pageNum}
            </button>
          ),
        )}

        <button
          className={styles.paginationButton}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasMore}
          aria-label="Next page"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      </div>
    </div>
  );
}

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
