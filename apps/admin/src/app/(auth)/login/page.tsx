import { Login } from "@repo/utils";

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
