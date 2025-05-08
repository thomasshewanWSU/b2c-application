"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateProductForm } from "../../utils/formValidation";
import styles from "./productForm.module.css";
import { ProductCardPreview } from "./productPreview";
import { ProductFormFields } from "./productFormFields";
import { AlertMessage } from "@repo/utils";
import { DetailPreviewOverlay } from "./detailPreviewOverlay";
import { DeleteProductButton } from "../../utils/deleteProduct";
import { LoadingSpinner } from "@repo/utils/";
type ProductFormProps = {
  initialProduct?: {
    id?: number;
    urlId?: string;
    name: string;
    brand: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category: string;
  };
  mode: "create" | "edit";
};

export function ProductForm({ initialProduct, mode }: ProductFormProps) {
  const defaultProduct = {
    name: "",
    description: "",
    price: 0,
    imageUrl: "",
    stock: 0,
    category: "",
  };

  const [formData, setFormData] = useState(initialProduct || defaultProduct);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [showDetailPreview, setShowDetailPreview] = useState(false);
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;

    // Special handling for imageUrl to prevent URL validation errors while typing
    if (name === "imageUrl") {
      setFormData((prev) => ({
        ...prev,
        imageUrl: value,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "price" || name === "stock" ? parseFloat(value) : value,
      }));
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSuccess("");

    // Validate the form
    const validation = validateProductForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setLoading(false);
      return;
    }

    try {
      const url =
        mode === "create"
          ? "/api/products"
          : `/api/products/${initialProduct?.id}`;

      const method = mode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          mode === "create"
            ? "Product created successfully! Redirecting..."
            : "Product updated successfully!",
        );

        if (mode === "create") {
          setFormData(defaultProduct);
        }

        router.refresh();

        if (mode === "create") {
          setTimeout(() => {
            router.push("/products");
          }, 1500);
        }
      } else {
        setErrors({ form: data.message || "Operation failed" });
      }
    } catch (err) {
      setErrors({ form: "An unexpected error occurred" });
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      {/* Full-screen preview */}
      {showDetailPreview && (
        <DetailPreviewOverlay
          product={formData}
          onClose={() => setShowDetailPreview(false)}
        />
      )}

      <div className={styles.formLayout}>
        {/* Main form section */}
        <div className={styles.formCard}>
          <div className={styles.headerSection}>
            <h2 className={styles.title}>
              {mode === "create" ? "Create New Product" : "Edit Product"}
            </h2>
            <p className={styles.subtitle}>
              {mode === "create"
                ? "Add a new product to your inventory"
                : "Update product information"}
            </p>
          </div>

          {/* Alert messages */}
          {errors.form && <AlertMessage type="error" message={errors.form} />}

          {success && <AlertMessage type="success" message={success} />}

          <form onSubmit={handleSubmit} className={styles.form}>
            <ProductFormFields
              formData={formData}
              errors={errors}
              handleChange={handleChange}
            />

            {/* Preview Detail View Button */}
            <div className={styles.previewActions}>
              <button
                type="button"
                className={styles.previewDetailButton}
                onClick={() => setShowDetailPreview(true)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className={styles.previewIcon}
                >
                  <path d="M12 15a3 3 0 100-6 3 3 0 000 6z" />
                  <path
                    fillRule="evenodd"
                    d="M1.323 11.447C2.811 6.976 7.028 3.75 12.001 3.75c4.97 0 9.185 3.223 10.675 7.69.12.362.12.752 0 1.113-1.487 4.471-5.705 7.697-10.677 7.697-4.97 0-9.186-3.223-10.675-7.69a1.762 1.762 0 010-1.113zM17.25 12a5.25 5.25 0 11-10.5 0 5.25 5.25 0 0110.5 0z"
                    clipRule="evenodd"
                  />
                </svg>
                View Full Preview
              </button>
            </div>

            {/* Form buttons */}
            <div className={styles.buttonGroup}>
              {mode === "edit" && initialProduct?.id && (
                <DeleteProductButton
                  productId={initialProduct.id}
                  className={styles.deleteButton}
                  onSuccess={() => {
                    setSuccess("Product deleted successfully! Redirecting...");
                    setTimeout(() => {
                      router.push("/products");
                    }, 1500);
                  }}
                />
              )}
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => router.push("/products")}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className={styles.button}
              >
                {loading ? (
                  <LoadingSpinner size="small" message="" />
                ) : mode === "create" ? (
                  "Create Product"
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Always visible card preview */}
        <div className={styles.previewSidebar}>
          <div className={styles.previewSidebarHeader}>
            <h3 className={styles.previewTitle}>Product Card Preview</h3>
          </div>
          <div className={styles.previewSidebarContent}>
            <ProductCardPreview product={formData} />
            <div className={styles.previewNote}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.noteIcon}
              >
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z"
                  clipRule="evenodd"
                />
              </svg>
              <p>Live preview updates as you type</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
