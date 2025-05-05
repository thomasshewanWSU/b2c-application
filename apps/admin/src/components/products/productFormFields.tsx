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
  };
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => void;
};

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

      <div className={styles.formGroup}>
        <label htmlFor="description" className={styles.label}>
          Description
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
            placeholder="Enter product description"
            rows={4}
          />
        </div>
        {hasError(errors, "description") && (
          <FormError message={getErrorMessage(errors, "description")} />
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
            <option value="electronics">Electronics</option>
            <option value="clothing">Clothing</option>
            <option value="home">Home & Kitchen</option>
            <option value="books">Books</option>
            <option value="toys">Toys & Games</option>
            <option value="beauty">Beauty & Personal Care</option>
            <option value="sports">Sports & Outdoors</option>
            <option value="other">Other</option>
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
