import "../globals.css";

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
