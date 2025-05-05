import { client } from "@repo/db/client";
import { Login } from "../components/authentication/login";
import { isLoggedIn } from "../utils/auth";
export default async function Home() {
  const loggedIn = await isLoggedIn();

  if (!loggedIn) {
    return <Login />;
  }
  // Fetch products from the database
  const products = await client.db.product.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return "hello";
}
