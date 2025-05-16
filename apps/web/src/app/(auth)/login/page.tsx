"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Login } from "@repo/utils";

export default function LoginPage() {
  const searchParams = useSearchParams();

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
        redirectPath={returnUrl}
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
