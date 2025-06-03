import styles from "./statusBadge.module.css";

type StatusBadgeProps = {
  stock?: number;
  orderStatus?: string;
  productStatus?: "active" | "inactive"; // Add product status support
  className?: string;
  variant?: "default" | "small" | "inline" | "pill";
  position?:
    | "corner"
    | "topRight"
    | "topLeft"
    | "bottomRight"
    | "bottomLeft"
    | "centered"
    | "flag";
};

/**
 * StatusBadge component displays a badge indicating the status of a product or order.
 * It can show stock levels, order statuses, or product statuses with customizable styles.
 *
 * @param {StatusBadgeProps} props - The properties for the StatusBadge component.
 * @returns {JSX.Element | null} The rendered status badge or null if no status is provided.
 */
export function StatusBadge({
  stock,
  orderStatus,
  productStatus,
  className = "",
  variant = "default",
  position,
}: StatusBadgeProps) {
  // Determine badge content and styling based on input
  let statusText = "";
  let statusClass;

  // Get the appropriate base style based on variant
  const baseStyle =
    variant === "small"
      ? styles.badgeSmall
      : variant === "inline"
        ? styles.badgeInline
        : styles.badge;

  // Add pill styling if variant is pill
  const pillStyle = variant === "pill" ? styles.badgePill : "";

  // Add positioning class if specified
  const positionClass = position
    ? position === "corner"
      ? styles.badgeCorner
      : position === "topRight"
        ? styles.badgeTopRight
        : position === "topLeft"
          ? styles.badgeTopLeft
          : position === "bottomRight"
            ? styles.badgeBottomRight
            : position === "bottomLeft"
              ? styles.badgeBottomLeft
              : position === "centered"
                ? styles.badgeCentered
                : position === "flag"
                  ? styles.badgeFlag
                  : ""
    : "";

  // Determine the status text and class
  if (stock !== undefined) {
    if (stock === 0) {
      statusText = "Out of Stock";
      statusClass = styles.statusOutOfStock;
    } else if (stock <= 10) {
      statusText = `Low Stock${variant !== "small" && variant !== "inline" ? ` (${stock})` : ""}`;
      statusClass = styles.statusLowStock;
    } else {
      statusText = "In Stock";
      statusClass = styles.statusInStock;
    }
  } else if (productStatus) {
    statusText = productStatus === "active" ? "Active" : "Inactive";
    statusClass =
      productStatus === "active" ? styles.statusActive : styles.statusInactive;
  } else if (orderStatus) {
    statusText =
      orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1).toLowerCase();
    switch (orderStatus.toLowerCase()) {
      case "delivered":
        statusClass = styles.statusDelivered;
        break;
      case "shipped":
        statusClass = styles.statusShipped;
        break;
      case "processing":
        statusClass = styles.statusProcessing;
        break;
      case "pending":
        statusClass = styles.statusPending;
        break;
      case "cancelled":
        statusClass = styles.statusCancelled;
        break;
      case "returned":
        statusClass = styles.statusReturned;
        break;
      case "refunded":
        statusClass = styles.statusRefunded;
        break;
    }
  }

  // If no status to display, return null
  if (!statusText) {
    return null;
  }

  return (
    <span
      className={`${baseStyle} ${statusClass} ${pillStyle} ${positionClass} ${className}`}
    >
      {statusText}
    </span>
  );
}
