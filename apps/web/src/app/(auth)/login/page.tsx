"use client";

import { useSearchParams } from "next/navigation";
import { Login } from "@repo/utils";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  return (
    <div className="auth-layout">
      <Login
        title="Sign In"
        subtitle="Enter your credentials to continue"
        logoText="B2C"
        redirectPath={returnUrl}
        enableOAuth={true}
        oauthProviders={["google", "github"]}
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
