import { AdminRegistration } from "../../../components/authentication/registration";

export default function CreateAdminPage() {
  return (
    <div className="py-6">
      <h1 className="mb-6 text-2xl font-bold">Create New Admin User</h1>
      <AdminRegistration />
    </div>
  );
}
