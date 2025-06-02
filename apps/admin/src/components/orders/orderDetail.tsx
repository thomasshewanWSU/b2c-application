"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import styles from "./orderDetail.module.css";
import {
  updateOrderStatus,
  saveOrderNotes,
  printOrderInvoice,
} from "../../utils/orderUtils";
import {
  LoadingSpinner,
  formatPrice,
  AlertMessage,
  StatusBadge,
  formatDate,
  ProductImage,
} from "@repo/utils";

// Type for order detail props
type OrderDetailProps = {
  order: {
    id: number;
    userId: number;
    status: string;
    total: number;
    shippingAddress: string;
    paymentMethod: string;
    createdAt: string | Date;
    updatedAt: string | Date;
    notes?: string;
    user: {
      name: string | null;
      email: string;
    };
    items: {
      id: number;
      quantity: number;
      price: number;
      product: {
        id: number;
        name: string;
        imageUrl: string | null;
      };
    }[];
  };
};

// Main OrderDetail component
export function OrderDetail({ order }: OrderDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [notes, setNotes] = useState(order.notes || "");
  const [initialNotes, setInitialNotes] = useState(order.notes || "");
  const [savingNotes, setSavingNotes] = useState(false);

  // Check if notes have been modified
  const notesModified = notes !== initialNotes;

  // Calculate subtotal
  const subtotal = order.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  // Calculate shipping cost
  const shippingCost = order.total - subtotal;

  // Handle status update
  const handleStatusUpdate = (newStatus: string) => {
    updateOrderStatus({
      orderId: order.id,
      newStatus,
      currentStatus,
      setLoading,
      setCurrentStatus,
      setError,
      setSuccess,
    });
  };

  // Handle save notes
  const handleSaveNotes = () => {
    saveOrderNotes({
      orderId: order.id,
      notes,
      setSavingNotes,
      setError,
      setSuccess,
    });
    // Update initialNotes after successful save
    setInitialNotes(notes);
  };

  // Handle print invoice
  const handlePrintInvoice = () => {
    printOrderInvoice(order, formatPrice);
  };

  // Reset success message after 5 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  return (
    <div className={styles.container} data-test-id="order-detail">
      <div className={styles.header}>
        <div className={styles.breadcrumbs} data-test-id="order-breadcrumbs">
          <Link href="/orders" className={styles.breadcrumbLink}>
            Orders
          </Link>{" "}
          / Order #{order.id}
        </div>

        <div className={styles.actions}>
          <Link
            href={`/users/${order.userId}`}
            className={`${styles.button} ${styles.viewCustomerButton}`}
            data-test-id="view-customer-button"
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
              className={styles.buttonIcon}
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            View Customer
          </Link>
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      <div className={styles.layout}>
        {/* Main content */}
        <div className={styles.mainContent} data-test-id="main-content">
          {/* Order Summary Card */}
          <div className={styles.card} data-test-id="order-summary">
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Order Summary</h2>
              <StatusBadge
                orderStatus={order.status}
                variant="default"
                data-test-id="status-badge"
              />
            </div>

            <div className={styles.orderInfo} data-test-id="order-info">
              {/* Order info items */}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Order ID</span>
                <span className={styles.infoValue} data-test-id="order-id">
                  #{order.id}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Date</span>
                <span className={styles.infoValue} data-test-id="order-date">
                  {formatDate(order.createdAt)}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Payment Method</span>
                <span
                  className={styles.infoValue}
                  data-test-id="payment-method"
                >
                  {order.paymentMethod}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Status</span>
                <div
                  className={styles.statusDropdownWrapper}
                  data-test-id="status-wrapper"
                >
                  <select
                    value={currentStatus}
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={loading}
                    className={styles.statusDropdown}
                    data-test-id="status-select"
                  >
                    <option value="pending">Pending</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  {loading && (
                    <LoadingSpinner
                      size="small"
                      message=""
                      data-test-id="loading-spinner"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Customer Info Section */}
            <div
              className={styles.customerSection}
              data-test-id="customer-section"
            >
              <h3 className={styles.sectionTitle}>Customer Information</h3>
              <div
                className={styles.customerInfoCompact}
                data-test-id="customer-info"
              >
                <div
                  className={styles.customerAvatarSmall}
                  data-test-id="customer-avatar"
                >
                  {(order.user.name?.charAt(0) || "C").toUpperCase()}
                </div>
                <div className={styles.customerDataCompact}>
                  <div className={styles.customerNameRow}>
                    <span
                      className={styles.customerNameLabel}
                      data-test-id="customer-name"
                    >
                      {order.user.name || "Customer"}
                    </span>
                  </div>
                  <div className={styles.customerEmailRow}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.customerContactIcon}
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    <a
                      href={`mailto:${order.user.email}`}
                      className={styles.customerEmailLink}
                      data-test-id="customer-email"
                    >
                      {order.user.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.card} data-test-id="order-items">
            <h2 className={styles.cardTitle}>Order Items</h2>
            <div className={styles.orderItemsList}>
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className={styles.orderItem}
                  data-test-id="order-item"
                >
                  <div className={styles.productImageContainer}>
                    {item.product.imageUrl ? (
                      <ProductImage
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={24}
                        height={24}
                        className={styles.orderItemImage}
                        style={{ objectFit: "cover" }}
                        data-test-id="product-image"
                      />
                    ) : (
                      <div
                        className={styles.placeholderImage}
                        data-test-id="placeholder-image"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <rect
                            x="3"
                            y="3"
                            width="18"
                            height="18"
                            rx="2"
                            ry="2"
                          ></rect>
                          <circle cx="8.5" cy="8.5" r="1.5"></circle>
                          <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className={styles.productInfo}>
                    <Link
                      href={`/products/${item.product.id}`}
                      className={styles.productName}
                      data-test-id="product-name"
                    >
                      {item.product.name}
                    </Link>
                    <div
                      className={styles.productQuantity}
                      data-test-id="product-quantity"
                    >
                      Qty: {item.quantity} × {formatPrice(item.price)}
                    </div>
                  </div>
                  <div
                    className={styles.productTotal}
                    data-test-id="product-total"
                  >
                    {formatPrice(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.sidebar} data-test-id="sidebar">
          <div className={styles.card} data-test-id="order-totals">
            <h2 className={styles.cardTitle}>Order Totals</h2>
            <div className={styles.totalsTable}>
              <div className={styles.totalRow} data-test-id="subtotal-row">
                <span>Subtotal:</span>
                <span data-test-id="subtotal-value">
                  {formatPrice(subtotal)}
                </span>
              </div>
              <div className={styles.totalRow} data-test-id="shipping-row">
                <span>Shipping:</span>
                <span data-test-id="shipping-value">
                  {formatPrice(shippingCost)}
                </span>
              </div>
              <div
                className={`${styles.totalRow} ${styles.totalRowFinal}`}
                data-test-id="total-row"
              >
                <span>Total:</span>
                <span className={styles.grandTotal} data-test-id="total-value">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          <div className={styles.card} data-test-id="shipping-address">
            <h2 className={styles.cardTitle}>Shipping Address</h2>
            <p className={styles.addressText} data-test-id="address-text">
              {order.shippingAddress}
            </p>
          </div>

          <div className={styles.card} data-test-id="notes-actions">
            <h2 className={styles.cardTitle}>Notes & Actions</h2>
            <div className={styles.notesSection}>
              <textarea
                className={styles.notesTextarea}
                placeholder="Add internal notes about this order..."
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                data-test-id="notes-textarea"
              ></textarea>

              {/* Only show save button when notes are modified */}
              {notesModified && (
                <button
                  className={styles.saveNotesButton}
                  disabled={savingNotes}
                  onClick={handleSaveNotes}
                >
                  {savingNotes ? "Saving..." : "Save Notes"}
                </button>
              )}
            </div>
            <div className={styles.orderActions}>
              <button
                className={`${styles.actionButton} ${styles.printButton}`}
                onClick={handlePrintInvoice}
                data-test-id="print-invoice-button"
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
                  <polyline points="6 9 6 2 18 2 18 9"></polyline>
                  <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                  <rect x="6" y="14" width="12" height="8"></rect>
                </svg>
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
