"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import * as React from "react";

/**
 * QueryProvider component provides a React Query client context to its children.
 * It initializes a new QueryClient instance and wraps the children with
 * QueryClientProvider.
 *
 * @param {Object} props - The component props
 * @param {React.ReactNode} props.children - The child components to be wrapped
 * @returns {JSX.Element} The rendered QueryClientProvider with children
 */
export default function QueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}
