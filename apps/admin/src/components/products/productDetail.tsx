"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Product } from "@repo/db/data";
import styles from "./productDetail.module.css";
import { AlertMessage, ProductImage } from "@repo/utils/";
import { DeleteProductButton } from "../../utils/deleteProduct";
type ProductDetailProps = {
  product: Product;
};

export function ProductDetail({ product }: ProductDetailProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Format currency
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Format date
  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get stock status
  const getStockStatus = (stock: number) => {
    if (stock === 0)
      return { label: "Out of Stock", className: styles.outOfStock };
    if (stock <= 10) return { label: "Low Stock", className: styles.lowStock };
    return { label: "In Stock", className: styles.inStock };
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess("Product deleted successfully. Redirecting...");
        setTimeout(() => {
          router.push("/products");
        }, 1500);
      } else {
        setError(data.message || "Failed to delete product");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const stockStatus = getStockStatus(product.stock);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.breadcrumbs}>
          <Link href="/products" className={styles.breadcrumbLink}>
            Products
          </Link>{" "}
          / {product.name}
        </div>

        <div className={styles.actions}>
          <Link
            href={`/products/${product.id}/edit`}
            className={`${styles.button} ${styles.editButton}`}
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
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            Edit
          </Link>

          <DeleteProductButton
            productId={product.id}
            className={`${styles.button} ${styles.deleteButton}`}
            onSuccess={() => {
              setSuccess("Product deleted successfully. Redirecting...");
              setTimeout(() => {
                router.push("/products");
              }, 1500);
            }}
          />
        </div>
      </div>

      {error && <AlertMessage type="error" message={error} />}
      {success && <AlertMessage type="success" message={success} />}

      <div className={styles.productCard}>
        <div className={styles.productLayout}>
          <div className={styles.imageContainer}>
            <ProductImage
              src={product.imageUrl}
              alt={product.name}
              className={styles.productImage}
            />
            <div className={`${styles.statusBadge} ${stockStatus.className}`}>
              {stockStatus.label}
            </div>
          </div>

          <div className={styles.productInfo}>
            <h1 className={styles.productName}>{product.name}</h1>
            <div className={styles.productCategory}>{product.category}</div>
            <div className={styles.productPrice}>
              {formatPrice(product.price)}
            </div>

            <div className={styles.metaInfo}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>ID:</span> {product.id}
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Stock:</span> {product.stock}{" "}
                units
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Created:</span>{" "}
                {formatDate(product.createdAt)}
              </div>
              {product.updatedAt && (
                <div className={styles.metaItem}>
                  <span className={styles.metaLabel}>Updated:</span>{" "}
                  {formatDate(product.updatedAt)}
                </div>
              )}
            </div>

            <div className={styles.descriptionSection}>
              <h2 className={styles.sectionTitle}>Description</h2>
              <p className={styles.productDescription}>{product.description}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
