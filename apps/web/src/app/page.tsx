"use client";
import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function Home() {
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const authSuccess = searchParams.get("auth_success");
  const router = useRouter();

  useEffect(() => {
    // Only run if redirected back after OAuth login and mergeCartOnLogin is desired
    if (authSuccess === "true") {
      fetch("/api/cart", { method: "PATCH" })
        .then(() => {})
        .catch((err) => {
          console.error("Cart merge failed after OAuth", err);
        });
    }
  }, [authSuccess, returnUrl, router]);
  return <div> Hello</div>;
}
