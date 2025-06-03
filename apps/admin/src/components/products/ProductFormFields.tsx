import styles from "./productForm.module.css";
import { hasError, getErrorMessage } from "../../utils/formValidation";

type ProductFormFieldsProps = {
  formData: {
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    stock: number;
    category: string;
    brand: string; // Add new field
    specifications: string; // Add new field
    detailedDescription: string; // Add new field
  };
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
};

/**
 * Product Form Fields Component
 *
 * Renders a set of form fields for product details including name, brand,
 * description, price, stock, category, image URL, and additional fields
 * for detailed description and specifications.
 *
 * @param {Object} props - Component properties
 * @param {Object} props.formData - Current state of the form data
 * @param {Object} props.errors - Validation errors for the form fields
 * @param {Function} props.handleChange - Handler for input changes
 * @returns {JSX.Element} The rendered product form fields component
 */
export function ProductFormFields({
  formData,
  errors,
  handleChange,
}: ProductFormFieldsProps) {
  return (
    <>
      <div className={styles.formGroup}>
        <label htmlFor="name" className={styles.label}>
          Product Name
        </label>
        <div className={styles.inputContainer}>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`${styles.input} ${
              hasError(errors, "name") ? styles.errorInput : ""
            }`}
            placeholder="Enter product name"
          />
        </div>
        {hasError(errors, "name") && (
          <FormError message={getErrorMessage(errors, "name")} />
        )}
      </div>

      {/* Add Brand Field */}
      <div className={styles.formGroup}>
        <label htmlFor="brand" className={styles.label}>
          Brand
        </label>
        <div className={styles.inputContainer}>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className={`${styles.input} ${
              hasError(errors, "brand") ? styles.errorInput : ""
            }`}
            placeholder="Enter product brand"
          />
        </div>
        {hasError(errors, "brand") && (
          <FormError message={getErrorMessage(errors, "brand")} />
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Short Description
        </label>
        <div className={styles.inputContainer}>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`${styles.textarea} ${
              hasError(errors, "description") ? styles.errorInput : ""
            }`}
            placeholder="Enter brief product description"
            rows={4}
          />
        </div>
        {hasError(errors, "description") && (
          <FormError message={getErrorMessage(errors, "description")} />
        )}
      </div>

      {/* Add Detailed Description Field */}
      <div className={styles.formGroup}>
        <label htmlFor="detailedDescription" className={styles.label}>
          Detailed Description
        </label>
        <div className={styles.inputContainer}>
          <textarea
            id="detailedDescription"
            name="detailedDescription"
            value={formData.detailedDescription}
            onChange={handleChange}
            className={`${styles.textarea} ${
              hasError(errors, "detailedDescription") ? styles.errorInput : ""
            }`}
            placeholder="Enter comprehensive product description"
            rows={6}
          />
        </div>
        {hasError(errors, "detailedDescription") && (
          <FormError message={getErrorMessage(errors, "detailedDescription")} />
        )}
      </div>

      {/* Add Specifications Field */}
      <div className={styles.formGroup}>
        <label htmlFor="specifications" className={styles.label}>
          Specifications
        </label>
        <div className={styles.inputContainer}>
          <textarea
            id="specifications"
            name="specifications"
            value={formData.specifications}
            onChange={handleChange}
            className={`${styles.textarea} ${
              hasError(errors, "specifications") ? styles.errorInput : ""
            }`}
            placeholder="Enter product specifications (dimensions, materials, etc.)"
            rows={4}
          />
        </div>
        {hasError(errors, "specifications") && (
          <FormError message={getErrorMessage(errors, "specifications")} />
        )}
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <label htmlFor="price" className={styles.label}>
            Price
          </label>
          <div className={styles.inputContainer}>
            <span className={styles.prependIcon}>$</span>
            <input
              type="number"
              step="0.01"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              className={`${styles.input} ${styles.priceInput} ${
                hasError(errors, "price") ? styles.errorInput : ""
              }`}
              placeholder="0.00"
            />
          </div>
          {hasError(errors, "price") && (
            <FormError message={getErrorMessage(errors, "price")} />
          )}
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="stock" className={styles.label}>
            Stock Quantity
          </label>
          <div className={styles.inputContainer}>
            <input
              type="number"
              id="stock"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              className={`${styles.input} ${
                hasError(errors, "stock") ? styles.errorInput : ""
              }`}
              placeholder="0"
              min="0"
            />
          </div>
          {hasError(errors, "stock") && (
            <FormError message={getErrorMessage(errors, "stock")} />
          )}
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="category" className={styles.label}>
          Category
        </label>
        <div className={styles.inputContainer}>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`${styles.select} ${
              hasError(errors, "category") ? styles.errorInput : ""
            }`}
          >
            <option value="">Select a category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Home">Home & Kitchen</option>
            <option value="Hooks">Books</option>
            <option value="Toys">Toys & Games</option>
            <option value="Beauty">Beauty & Personal Care</option>
            <option value="Sports">Sports & Outdoors</option>
            <option value="Other">Other</option>
          </select>
        </div>
        {hasError(errors, "category") && (
          <FormError message={getErrorMessage(errors, "category")} />
        )}
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="imageUrl" className={styles.label}>
          Product Image URL
        </label>
        <div className={styles.inputContainer}>
          <input
            type="text"
            id="imageUrl"
            name="imageUrl"
            value={formData.imageUrl}
            onChange={handleChange}
            className={`${styles.input} ${
              hasError(errors, "imageUrl") ? styles.errorInput : ""
            }`}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        {hasError(errors, "imageUrl") && (
          <FormError message={getErrorMessage(errors, "imageUrl")} />
        )}
      </div>
    </>
  );
}

function FormError({ message }: { message: string }) {
  return (
    <p className={styles.errorMessage}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className={styles.errorIcon}
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}
