import { QueryProvider } from "@repo/utils";
import { AppLayout } from "@/components/appLayout";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <AppLayout>
      <QueryProvider>{children}</QueryProvider>
    </AppLayout>
  );
}
