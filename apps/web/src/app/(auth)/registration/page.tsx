"use client";

import { useEffect } from "react";
import { UserRegistration } from "@repo/utils";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn } from "next-auth/react"; // Import signIn

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";
  const router = useRouter();

  // Update to use NextAuth
  // Update to use NextAuth
  const handleRegistrationSuccess = async (userData: {
    email: string;
    password: string;
  }) => {
    try {
      // Sign in using NextAuth
      const result = await signIn("credentials", {
        email: userData.email,
        password: userData.password,
        redirect: false,
        callbackUrl: returnUrl,
      });

      if (result?.ok) {
        // Merge anonymous cart into user cart
        try {
          await fetch("/api/cart", { method: "PATCH" });
        } catch (err) {
          console.error("Cart merge failed", err);
        }

        // Use window.location for a full page reload to ensure session is updated correctly
        window.location.href = result.url || returnUrl;
      } else {
        console.error("Login after registration failed:", result?.error);
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
            // First register the user through your API
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
