"use client";

import { useState, useCallback } from "react";

/**
 * Custom hook to manage error messages in a React application.
 * Provides functions to show and clear error messages with optional auto-clear functionality.
 *
 * @returns {Object} - Contains the current error message, a function to show an error, and a function to clear the error.
 */
export function useErrorMessage() {
  const [error, setError] = useState<string | null>(null);

  const showError = useCallback((message: string, duration = 3000) => {
    setError(message);

    // Auto-clear after duration
    if (duration > 0) {
      setTimeout(() => {
        setError(null);
      }, duration);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { error, showError, clearError };
}
