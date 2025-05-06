import styles from "./orderList.module.css";

// Define the FilterState type
export type FilterState = {
  userId: string;
  status: string;
  minTotal: string;
  maxTotal: string;
  fromDate: string;
  toDate: string;
  sortBy: string;
};

type FilterProps = {
  filters: FilterState;
  statuses: string[];
  handleFilterChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  resetFilters: () => void;
  removeFilter: (filterName: keyof FilterState) => void;
};

export function OrderListFilters({
  filters,
  statuses,
  handleFilterChange,
  resetFilters,
  removeFilter,
}: FilterProps) {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterControls}>
        <div className={styles.filterGroup}>
          <label htmlFor="userId" className={styles.filterLabel}>
            User ID
          </label>
          <input
            type="number"
            id="userId"
            name="userId"
            value={filters.userId}
            onChange={handleFilterChange}
            className={styles.filterInput}
            placeholder="Enter user ID"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="status" className={styles.filterLabel}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="minTotal" className={styles.filterLabel}>
            Min Total
          </label>
          <input
            type="number"
            id="minTotal"
            name="minTotal"
            value={filters.minTotal}
            onChange={handleFilterChange}
            className={styles.filterInput}
            placeholder="$0"
            min="0"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="maxTotal" className={styles.filterLabel}>
            Max Total
          </label>
          <input
            type="number"
            id="maxTotal"
            name="maxTotal"
            value={filters.maxTotal}
            onChange={handleFilterChange}
            className={styles.filterInput}
            placeholder="No limit"
            min="0"
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="fromDate" className={styles.filterLabel}>
            From Date
          </label>
          <input
            type="date"
            id="fromDate"
            name="fromDate"
            value={filters.fromDate}
            onChange={handleFilterChange}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="toDate" className={styles.filterLabel}>
            To Date
          </label>
          <input
            type="date"
            id="toDate"
            name="toDate"
            value={filters.toDate}
            onChange={handleFilterChange}
            className={styles.filterInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="sortBy" className={styles.filterLabel}>
            Sort By
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className={styles.filterSelect}
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="totalHigh">Total: High to Low</option>
            <option value="totalLow">Total: Low to High</option>
          </select>
        </div>
      </div>

      <div className={styles.filterActions}>
        <button
          className={`${styles.filterButton} ${styles.filterResetButton}`}
          onClick={resetFilters}
        >
          Reset
        </button>
      </div>

      {/* Active filters display */}
      {Object.entries(filters).some(
        ([key, value]) => value && key !== "sortBy",
      ) && (
        <div className={styles.activeFilters}>
          <div className={styles.filterLabel}>Active filters:</div>
          {filters.userId && (
            <div className={styles.filterChip}>
              User ID: {filters.userId}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("userId")}
                aria-label="Remove user ID filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.status && (
            <div className={styles.filterChip}>
              Status:{" "}
              {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("status")}
                aria-label="Remove status filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.minTotal && (
            <div className={styles.filterChip}>
              Min Total: ${filters.minTotal}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("minTotal")}
                aria-label="Remove min total filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.maxTotal && (
            <div className={styles.filterChip}>
              Max Total: ${filters.maxTotal}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("maxTotal")}
                aria-label="Remove max total filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.fromDate && (
            <div className={styles.filterChip}>
              From: {filters.fromDate}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("fromDate")}
                aria-label="Remove from date filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.toDate && (
            <div className={styles.filterChip}>
              To: {filters.toDate}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("toDate")}
                aria-label="Remove to date filter"
              >
                ×
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
