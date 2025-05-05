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
export function validateProductForm(data: any): ValidationResult {
  // Product form validation logic
  const errors: Record<string, string> = {};
  // ...
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
