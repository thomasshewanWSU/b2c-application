import { UserRegistration } from "@repo/utils";

export default function CreateAdminPage() {
  return (
    <div className="py-6">
      <UserRegistration type="admin" apiEndpoint="/api/registration" />
    </div>
  );
}
