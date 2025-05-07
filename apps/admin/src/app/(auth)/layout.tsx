import "@repo/ui/styles.css";
import "../globals.css";
import { ThemeProvider } from "@repo/utils";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout-container">
      <main className="auth-layout">{children}</main>
    </div>
  );
}
