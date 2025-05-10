"use client";

import { useEffect } from "react";
import { Login } from "@repo/utils";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  // Handle adding pending cart item after login
  useEffect(() => {
    return () => {
      // This cleanup function will run when the component unmounts (user logs in)
      const pendingCartItem = localStorage.getItem("pendingCartItem");

      if (pendingCartItem) {
        try {
          const { productId, quantity } = JSON.parse(pendingCartItem);

          // Send request to add item to cart
          fetch("/api/cart", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              productId,
              quantity,
            }),
          }).then(() => {
            // Clean up localStorage
            localStorage.removeItem("pendingCartItem");
          });
        } catch (error) {
          console.error("Error processing pending cart item:", error);
        }
      }
    };
  }, []);

  return (
    <div className="auth-layout">
      <Login
        title="Sign In"
        subtitle="Enter your credentials to continue"
        logoText="B2C"
        redirectPath={returnUrl}
        apiPath="/api/auth"
        helpText={
          <>
            Don't have an account?{" "}
            <a
              href={`/register?returnUrl=${encodeURIComponent(returnUrl)}`}
              className="text-blue-600 hover:underline"
            >
              Sign up
            </a>
          </>
        }
      />
    </div>
  );
}
