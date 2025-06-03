"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import styles from "@/styles/home.module.css";

/**
 * Home component serves as the landing page for the application.
 * It handles OAuth authentication success and merges cart data if applicable.
 * The component displays a hero section with a welcome message and features.
 *
 * @returns {JSX.Element} The rendered home page.
 */
export default function Home() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const authSuccess = searchParams.get("auth_success");
  const router = useRouter();

  useEffect(() => {
    if (authSuccess === "true") {
      fetch("/api/cart", { method: "PATCH" })
        .then(() => {})
        .catch((err) => {
          console.error("Cart merge failed after OAuth", err);
        });
    }
  }, [authSuccess, returnUrl, router]);

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <div className={styles.content}>
          <h1 className={styles.title}>Welcome to Our Store</h1>
          <p className={styles.subtitle}>
            Discover quality products at competitive prices
          </p>
          <Link href="/products" className={styles.button}>
            Shop Now
          </Link>
        </div>
      </div>

      <div className={styles.features}>
        <div className={styles.feature}>
          <div className={styles.iconWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3>Quality Products</h3>
          <p>Carefully selected for excellence</p>
        </div>

        <div className={styles.feature}>
          <div className={styles.iconWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3>Fast Shipping</h3>
          <p>Quick delivery to your door</p>
        </div>

        <div className={styles.feature}>
          <div className={styles.iconWrapper}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className={styles.icon}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
            </svg>
          </div>
          <h3>Secure Payment</h3>
          <p>Safe and protected transactions</p>
        </div>
      </div>
    </div>
  );
}
