"use client";

import { useRouter } from "next/navigation";
import { UserRegistration } from "@repo/utils";
import { validateAdminForm } from "../../utils/formValidation";

export function AdminRegistration() {
  const router = useRouter();

  return (
    <UserRegistration
      type="admin"
      title="Create Admin User"
      subtitle="Add a new administrator to the system"
      allowRoleSelection={false} // Admin registration always creates admin users
      defaultRole="admin"
      apiEndpoint="/api/registration"
      validateForm={validateAdminForm} // Use your custom validation if needed
      onSubmit={async (userData) => {
        try {
          const response = await fetch("/api/registration", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...userData,
              role: "admin", // Ensure the role is set to admin
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
