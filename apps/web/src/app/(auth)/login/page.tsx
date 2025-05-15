"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Login } from "@repo/utils";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  // Add a custom callback URL parameter to help detect auth status
  const finalRedirectPath = `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}auth_success=true`;

  return (
    <div className="auth-layout">
      <Login
        title="Sign In"
        subtitle="Enter your credentials to continue"
        logoText="B2C"
        redirectPath={finalRedirectPath}
        mergeCartOnLogin={true}
        enableOAuth={true}
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
