"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validateProductForm } from "../../utils/formValidation";
import styles from "./productForm.module.css";
import { ProductFormFields } from "./ProductFormFields";
import { AlertMessage } from "@repo/utils";
import { DeleteProductButton } from "../../utils/DeleteProduct";
import { LoadingSpinner } from "@repo/utils";
import { AdminProductPreview } from "./AdminProductPreview";
import { AdminProductCard } from "./AdminProductCard";
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
    specifications: string;
    detailedDescription: string;
    active?: boolean;
  };
  mode: "create" | "edit";
};

/**
 * ProductForm component for creating or editing products in the admin dashboard.
 * It includes form fields for product details, validation, and submission handling.
 *
 * @param {Object} props - Component properties
 * @param {Object} props.initialProduct - Initial product data for editing (optional)
 * @param {string} props.mode - Form mode, either "create" or "edit"
 * @returns {JSX.Element} The rendered product form component
 */
export function ProductForm({ initialProduct, mode }: ProductFormProps) {
  const defaultProduct = {
    name: "",
    brand: "",
    description: "",
    detailedDescription: "",
    specifications: "",
    price: 0,
    imageUrl: "",
    stock: 0,
    category: "",
    active: true, // Default to active for new products
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
    const { name, value, type } = e.target;

    // Special handling for checkbox inputs (active/inactive toggle)
    if (type === "checkbox") {
      const checkbox = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checkbox.checked,
      }));
    }
    // Special handling for imageUrl to prevent URL validation errors while typing
    else if (name === "imageUrl") {
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

  // Toggle function specifically for active status
  const handleActiveToggle = () => {
    setFormData((prev) => ({
      ...prev,
      active: !prev.active,
    }));
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
        setSuccess(data.message || "Operation successful!");

        // Get the product ID - either from response or from existing product
        const productId = data.product?.id || initialProduct?.id;

        if (productId) {
          // Show success message briefly before redirecting
          router.push(`/products/${productId}`);
        } else {
          // Fallback if somehow we don't have a product ID
          router.push("/products");
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
        <AdminProductPreview
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
            {/* Product Status Toggle */}
            <div className={styles.statusToggleContainer}>
              <div className={styles.statusToggleSection}>
                <h3 className={styles.sectionTitle}>Product Status</h3>
                <div className={styles.statusToggleWrapper}>
                  <label className={styles.toggleSwitch}>
                    <input
                      type="checkbox"
                      name="active"
                      checked={formData.active}
                      onChange={handleActiveToggle}
                    />
                    <span className={styles.toggleSlider}></span>
                  </label>
                  <span
                    className={`${styles.statusLabel} ${formData.active ? styles.activeStatus : styles.inactiveStatus}`}
                  >
                    {formData.active ? "Active" : "Inactive"}
                  </span>
                  <p className={styles.statusHelpText}>
                    {formData.active
                      ? "Product is visible in the store and available for purchase."
                      : "Product is hidden from the store and cannot be purchased."}
                  </p>
                </div>
              </div>
            </div>

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
            <AdminProductCard product={formData} isPreview={true} />
          </div>
          {showDetailPreview && (
            <AdminProductPreview
              product={formData}
              onClose={() => setShowDetailPreview(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
