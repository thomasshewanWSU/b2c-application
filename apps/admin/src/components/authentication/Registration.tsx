"use client";

import { UserRegistration } from "@repo/utils";
import { validateAdminForm } from "../../utils/formValidation";

/**
 * Admin Registration Component
 *
 * Renders the user registration form for creating admin users.
 * This component is used in the admin dashboard to allow administrators to create new admin accounts.
 *
 * @returns {JSX.Element} The rendered registration form component
 */
export function AdminRegistration() {
  return (
    <UserRegistration
      type="admin"
      title="Create Admin User"
      subtitle="Add a new administrator to the system"
      allowRoleSelection={false}
      defaultRole="admin"
      apiEndpoint="/api/registration"
      validateForm={validateAdminForm}
      onSubmit={async (userData) => {
        try {
          const response = await fetch("/api/registration", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...userData,
              role: "admin",
            }),
          });

          const data = await response.json();

          if (!response.ok) {
            return {
              success: false,
              message: data.message || "Failed to create admin user",
            };
          }

          return {
            success: true,
            message: "Admin user created successfully!",
          };
        } catch (error) {
          console.error("Admin registration error:", error);
          return {
            success: false,
            message: "An unexpected error occurred",
          };
        }
      }}
    />
  );
}
