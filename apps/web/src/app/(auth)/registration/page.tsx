"use client";

import { useEffect } from "react";
import { UserRegistration } from "@repo/utils";
import { useSearchParams, useRouter } from "next/navigation";

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const router = useRouter();

  // Function to handle successful registration
  const handleRegistrationSuccess = async (userData: {
    email: string;
    password: string;
  }) => {
    try {
      // Auto log in the user after successful registration
      const loginResponse = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password,
        }),
      });

      if (loginResponse.ok) {
        // Handle adding pending cart item if exists
        const pendingCartItem = localStorage.getItem("pendingCartItem");

        if (pendingCartItem) {
          try {
            const { productId, quantity } = JSON.parse(pendingCartItem);

            // Send request to add item to cart
            await fetch("/api/cart", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                productId,
                quantity,
              }),
            });

            // Clean up localStorage
            localStorage.removeItem("pendingCartItem");
          } catch (error) {
            console.error("Error processing pending cart item:", error);
          }
        }

        // Redirect to the return URL
        router.push(returnUrl);
      }
    } catch (error) {
      console.error("Error logging in after registration:", error);
    }
  };

  return (
    <div className="auth-layout">
      <UserRegistration
        title="Create Account"
        subtitle="Sign up to start shopping"
        type="customer"
        onSubmit={async (userData) => {
          try {
            const response = await fetch("/api/registration", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (response.ok) {
              await handleRegistrationSuccess({
                email: userData.email,
                password: userData.password,
              });
              return {
                success: true,
                message: "Account created successfully!",
              };
            } else {
              return {
                success: false,
                message: data.message || "Registration failed",
              };
            }
          } catch (error) {
            console.error("Registration error:", error);
            return { success: false, message: "An unexpected error occurred" };
          }
        }}
        redirectPath={returnUrl}
      />
    </div>
  );
}
