"use client";

import { useRouter } from "next/navigation";
import styles from "./login.module.css";
import { useState, useEffect } from "react";

interface LoginProps {
  // Configuration options
  title?: string;
  subtitle?: string;
  logoText?: string;
  redirectPath?: string;
  apiPath?: string;
  helpText?: string | React.ReactNode;
  customStyles?: {
    container?: string;
    loginCard?: string;
    button?: string;
    // Add more style overrides as needed
  };
}

export function Login({
  title = "Sign In",
  subtitle = "Enter your credentials to continue",
  logoText = "",
  redirectPath = "/",
  apiPath = "/api/auth/",
  helpText,
  customStyles = {},
}: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(apiPath, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        router.refresh(); // Refresh the page to get the latest data
        // Handle redirect if specified
        router.push(redirectPath);
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${styles.container} ${customStyles.container || ""}`}>
      <div className={`${styles.loginCard} ${customStyles.loginCard || ""}`}>
        <div className={styles.headerSection}>
          {logoText && (
            <div className={styles.logoContainer}>
              <span className={styles.logo}>{logoText}</span>
            </div>
          )}
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {error && (
          <div className={styles.errorAlert}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className={styles.alertIcon}
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="email" className={styles.label}>
              Email
            </label>
            <div className={styles.inputContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.inputIcon}
              >
                <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
              </svg>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@example.com"
                className={styles.input}
                required
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.label}>
              Password
            </label>
            <div className={styles.inputContainer}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="currentColor"
                className={styles.inputIcon}
              >
                <path
                  fillRule="evenodd"
                  d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                  clipRule="evenodd"
                />
              </svg>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={styles.input}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`${styles.button} ${loading ? styles.loading : ""} ${customStyles.button || ""}`}
          >
            {loading ? (
              <span className={styles.loadingSpinner}>
                <span className={styles.spinnerDot}></span>
                <span className={styles.spinnerDot}></span>
                <span className={styles.spinnerDot}></span>
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {helpText && (
          <div className={styles.helpText}>
            {typeof helpText === "string" ? <p>{helpText}</p> : helpText}
          </div>
        )}
      </div>
    </div>
  );
}
