import { Login } from "@repo/utils";
/**
 * Admin Login Page Component
 *
 * Renders the admin dashboard login page using the shared Login component.
 * Configures login-specific properties including title, help text, and authentication options.
 * This page is part of the authentication flow for admin users.
 *
 * @returns {JSX.Element} The rendered login page component
 */
export default function LoginPage() {
  return (
    <div className="auth-layout">
      <Login
        title="Admin Dashboard"
        subtitle="Enter your credentials to continue"
        logoText="B2C"
        redirectPath="/"
        mergeCartOnLogin={false}
        enableOAuth={false}
        helpText="For testing use: admin@store.com / admin123"
      />
    </div>
  );
}
