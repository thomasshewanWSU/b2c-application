"use client";

import { useState, useCallback } from "react";

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
