"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Login } from "@/components/authentication/Login";
import { useQueryClient } from "@tanstack/react-query";
// In your component:
export default function LoginPage() {
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  // Add a custom callback URL parameter to help detect auth status
  let returnUrl = searchParams.get("returnUrl") || "/";
  returnUrl = decodeURIComponent(returnUrl);
  console.log("Return URL:", returnUrl);
  return (
    <div className="auth-layout">
      <Login
        title="Sign In"
        subtitle="Enter your credentials to continue"
        logoText="B2C"
        redirectPath={`${returnUrl}?auth_success=true`} // Add auth_success=true here
        mergeCartOnLogin={true}
        enableOAuth={true}
        onLoginSuccess={() => {
          // Here you can use any app-specific logic like queryClient.invalidateQueries
          queryClient.invalidateQueries({ queryKey: ["cart"] });
        }}
        oauthProviders={["google", "github"]}
        helpText={
          <>
            Don't have an account?{" "}
            <a href={`/registration`} className="text-blue-600 hover:underline">
              Sign up
            </a>
          </>
        }
      />
    </div>
  );
}
