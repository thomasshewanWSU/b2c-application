// Generic validation result type
type ValidationResult = {
  isValid: boolean;
  errors: Record<string, string>;
};

// Admin user form validation
export function validateAdminForm(data: {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || data.name.trim() === "") {
    errors.name = "Name is required";
  } else if (data.name.length < 2) {
    errors.name = "Name must be at least 2 characters";
  }

  // Email validation
  if (!data.email) {
    errors.email = "Email is required";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  // Password validation
  if (!data.password) {
    errors.password = "Password is required";
  } else {
    if (data.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    // Optional: Add more password complexity rules
    if (!/[A-Z]/.test(data.password)) {
      errors.password =
        errors.password ||
        "Password must contain at least one uppercase letter";
    }

    if (!/[0-9]/.test(data.password)) {
      errors.password =
        errors.password || "Password must contain at least one number";
    }
  }

  // Confirm password validation
  if (data.confirmPassword !== data.password) {
    errors.confirmPassword = "Passwords do not match";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// You can add more validation functions for other form types
// Add this to your existing formValidation.ts file

export function validateProductForm(data: {
  name?: string;
  description?: string;
  price?: number;
  imageUrl?: string;
  stock?: number;
  category?: string;
  brand: string;
  specifications: string;
  detailedDescription: string;
}): ValidationResult {
  const errors: Record<string, string> = {};

  // Name validation
  if (!data.name || data.name.trim() === "") {
    errors.name = "Product name is required";
  } else if (data.name.length < 3) {
    errors.name = "Product name must be at least 3 characters";
  }

  // Description validation
  if (!data.description || data.description.trim() === "") {
    errors.description = "Product description is required";
  } else if (data.description.length < 10) {
    errors.description = "Description must be at least 10 characters";
  }
  if (!data.brand.trim()) {
    errors.brand = "Brand is required";
  }
  if (!data.detailedDescription.trim()) {
    errors.detailedDescription = "Detailed description is required";
  }
  if (!data.specifications.trim()) {
    errors.specifications = "Specifications are required";
  }
  // Price validation
  if (data.price === undefined || data.price === null) {
    errors.price = "Price is required";
  } else if (isNaN(data.price) || data.price < 0) {
    errors.price = "Price must be a positive number";
  }

  // Stock validation
  if (data.stock === undefined || data.stock === null) {
    errors.stock = "Stock quantity is required";
  } else if (
    isNaN(data.stock) ||
    data.stock < 0 ||
    !Number.isInteger(data.stock)
  ) {
    errors.stock = "Stock must be a positive whole number";
  }

  // Category validation
  if (!data.category || data.category.trim() === "") {
    errors.category = "Category is required";
  }

  // Image URL validation
  if (!data.imageUrl || data.imageUrl.trim() === "") {
    errors.imageUrl = "Image URL is required";
  } else {
    try {
      new URL(data.imageUrl);
    } catch (e) {
      errors.imageUrl = "Please enter a valid URL";
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

// Helper for checking if a field has an error
export function hasError(
  errors: Record<string, string>,
  field: string,
): boolean {
  return !!errors[field];
}

// Helper to get error message for a field
export function getErrorMessage(
  errors: Record<string, string>,
  field: string,
): string {
  return errors[field] || "";
}
