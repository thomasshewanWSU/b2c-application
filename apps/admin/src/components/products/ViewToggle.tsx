import styles from "./ViewToggle.module.css";

type ViewToggleProps = {
  viewType: "cards" | "table";
  onViewChange: (viewType: "cards" | "table") => void;
};

export function ViewToggle({ viewType, onViewChange }: ViewToggleProps) {
  return (
    <div className={styles.viewOptions}>
      <button
        className={`${styles.viewButton} ${viewType === "cards" ? styles.activeView : ""}`}
        onClick={() => onViewChange("cards")}
        title="Card view"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span>Cards</span>
      </button>
      <button
        className={`${styles.viewButton} ${viewType === "table" ? styles.activeView : ""}`}
        onClick={() => onViewChange("table")}
        title="Table view"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
        <span>Table</span>
      </button>
    </div>
  );
}
