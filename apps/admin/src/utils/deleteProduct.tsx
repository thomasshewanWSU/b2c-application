"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./deleteProduct.module.css";

type DeleteProductButtonProps = {
  productId: number;
  variant?: "button" | "icon";
  onSuccess?: () => void;
  className?: string;
  buttonClassName?: string;
};

export function DeleteProductButton({
  productId,
  variant = "button",
  onSuccess,
  className,
  buttonClassName,
}: DeleteProductButtonProps) {
  const [loading, setLoading] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  const openConfirmDialog = () => {
    setShowConfirmation(true);
  };

  const closeConfirmDialog = () => {
    setShowConfirmation(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    closeConfirmDialog();

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Call onSuccess if provided
        if (onSuccess) {
          onSuccess();
        } else {
          // Default behavior: redirect
          setTimeout(() => {
            router.push("/products");
            router.refresh();
          }, 500);
        }
      } else {
        alert(data.message || "Failed to delete product");
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (variant === "icon") {
    return (
      <>
        <button
          className={`${styles.actionButton} ${styles.deleteButton} ${buttonClassName || ""}`}
          onClick={openConfirmDialog}
          disabled={loading}
          aria-label="Delete product"
        >
          <svg
            className={styles.actionIcon}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          Delete
          {loading && <span className={styles.loadingDot}></span>}
        </button>

        {showConfirmation && (
          <ConfirmationModal
            onConfirm={handleDelete}
            onCancel={closeConfirmDialog}
            loading={loading}
          />
        )}
      </>
    );
  }

  return (
    <>
      <button
        type="button"
        className={`${styles.deleteButton} ${className || ""}`}
        onClick={openConfirmDialog}
        disabled={loading}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="16"
          height="16"
        >
          <path
            fillRule="evenodd"
            d="M16.5 4.478v.227a48.816 48.816 0 013.878.512.75.75 0 11-.256 1.478l-.209-.035-1.005 13.07a3 3 0 01-2.991 2.77H8.084a3 3 0 01-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 01-.256-1.478A48.567 48.567 0 017.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 013.369 0c1.603.051 2.815 1.387 2.815 2.951zm-6.136-1.452a51.196 51.196 0 013.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 00-6 0v-.113c0-.794.609-1.428 1.364-1.452zm-.355 5.945a.75.75 0 10-1.5.058l.347 9a.75.75 0 101.499-.058l-.346-9zm5.48.058a.75.75 0 10-1.498-.058l-.347 9a.75.75 0 001.5.058l.345-9z"
            clipRule="evenodd"
          />
        </svg>
        {loading ? "Deleting..." : "Delete Product"}
      </button>

      {showConfirmation && (
        <ConfirmationModal
          onConfirm={handleDelete}
          onCancel={closeConfirmDialog}
          loading={loading}
        />
      )}
    </>
  );
}

// Confirmation Modal Component
type ConfirmationModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
};

function ConfirmationModal({
  onConfirm,
  onCancel,
  loading,
}: ConfirmationModalProps) {
  // Close if the user clicks outside the modal
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div className={styles.modalBackdrop} onClick={handleBackdropClick}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <svg
            className={styles.warningIcon}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              fillRule="evenodd"
              d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zm0-6a1 1 0 100-2 1 1 0 000 2zm0-8a1 1 0 011 1v4a1 1 0 11-2 0V9a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <h3>Confirm Deletion</h3>
        </div>

        <div className={styles.modalBody}>
          <p>
            Are you sure you want to delete this product? This action cannot be
            undone.
          </p>
        </div>

        <div className={styles.modalFooter}>
          <button
            className={styles.cancelButton}
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={styles.confirmButton}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? (
              <span className={styles.buttonLoader}>
                <span className={styles.loaderDot}></span>
                <span className={styles.loaderDot}></span>
                <span className={styles.loaderDot}></span>
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
