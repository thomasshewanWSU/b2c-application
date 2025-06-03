import styles from "./orderList.module.css";

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

/**
 * Order List Filters Component
 *
 * Renders a comprehensive filtering interface for the order management system.
 * Provides controls for filtering orders by user ID, status, price range, and date range.
 * Includes sorting options and the ability to view and remove active filters.
 *
 * @param {Object} props - Component properties
 * @param {FilterState} props.filters - Current state of all filter values
 * @param {string[]} props.statuses - Available order status options
 * @param {Function} props.handleFilterChange - Handler for filter input changes
 * @param {Function} props.resetFilters - Handler to reset all filters to default values
 * @param {Function} props.removeFilter - Handler to remove a specific active filter
 * @returns {JSX.Element} The rendered filter controls and active filter chips
 */
export function OrderListFilters({
  filters,
  statuses,
  handleFilterChange,
  resetFilters,
  removeFilter,
}: FilterProps) {
  return (
    <div className={styles.filterSection} data-test-id="filter-section">
      <div className={styles.filterControls} data-test-id="filter-controls">
        <div className={styles.filterGroup} data-test-id="userid-filter">
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
            data-test-id="user-id-input"
          />
        </div>

        <div className={styles.filterGroup} data-test-id="status-filter">
          <label htmlFor="status" className={styles.filterLabel}>
            Status
          </label>
          <select
            id="status"
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className={styles.filterSelect}
            data-test-id="status-select"
          >
            <option value="">All Statuses</option>
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup} data-test-id="min-total-filter">
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
            data-test-id="min-total-input"
          />
        </div>

        <div className={styles.filterGroup} data-test-id="max-total-filter">
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
            data-test-id="max-total-input"
          />
        </div>

        <div className={styles.filterGroup} data-test-id="from-date-filter">
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
            data-test-id="from-date"
          />
        </div>

        <div className={styles.filterGroup} data-test-id="to-date-filter">
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
            data-test-id="to-date"
          />
        </div>

        <div className={styles.filterGroup} data-test-id="sort-filter">
          <label htmlFor="sortBy" className={styles.filterLabel}>
            Sort By
          </label>
          <select
            id="sortBy"
            name="sortBy"
            value={filters.sortBy}
            onChange={handleFilterChange}
            className={styles.filterSelect}
            data-test-id="sort-select"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="totalHigh">Total: High to Low</option>
            <option value="totalLow">Total: Low to High</option>
          </select>
        </div>
      </div>

      <div className={styles.filterActions} data-test-id="filter-actions">
        <button
          className={`${styles.filterButton} ${styles.filterResetButton}`}
          onClick={resetFilters}
          data-test-id="reset-filters"
        >
          Reset
        </button>
      </div>

      {/* Active filters display */}
      {Object.entries(filters).some(
        ([key, value]) => value && key !== "sortBy",
      ) && (
        <div className={styles.activeFilters} data-test-id="active-filters">
          <div className={styles.filterLabel}>Active filters:</div>
          {filters.userId && (
            <div className={styles.filterChip} data-test-id="user-id-chip">
              User ID: {filters.userId}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("userId")}
                aria-label="Remove user ID filter"
                data-test-id="remove-user-id-filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.status && (
            <div className={styles.filterChip} data-test-id="status-chip">
              Status:{" "}
              {filters.status.charAt(0).toUpperCase() + filters.status.slice(1)}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("status")}
                aria-label="Remove status filter"
                data-test-id="remove-status-filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.minTotal && (
            <div className={styles.filterChip} data-test-id="min-total-chip">
              Min Total: ${filters.minTotal}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("minTotal")}
                aria-label="Remove min total filter"
                data-test-id="remove-min-total-filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.maxTotal && (
            <div className={styles.filterChip} data-test-id="max-total-chip">
              Max Total: ${filters.maxTotal}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("maxTotal")}
                aria-label="Remove max total filter"
                data-test-id="remove-max-total-filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.fromDate && (
            <div className={styles.filterChip} data-test-id="from-date-chip">
              From: {filters.fromDate}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("fromDate")}
                aria-label="Remove from date filter"
                data-test-id="remove-from-date-filter"
              >
                ×
              </button>
            </div>
          )}

          {filters.toDate && (
            <div className={styles.filterChip} data-test-id="to-date-chip">
              To: {filters.toDate}
              <button
                className={styles.removeFilterButton}
                onClick={() => removeFilter("toDate")}
                aria-label="Remove to date filter"
                data-test-id="remove-to-date-filter"
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
