import { UserList } from "../../components/users/userList";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users | Admin Dashboard",
  description: "Manage your users",
};

export default function UsersPage() {
  return (
    <main>
      <UserList />
    </main>
  );
}
