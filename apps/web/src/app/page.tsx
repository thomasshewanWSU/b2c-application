import { AppLayout } from "../components/Layout/AppLayout";
import { Main } from "../components/Main";
import styles from "./page.module.css";
import { client } from "@repo/db/client";

export default async function Home() {
  const activePosts = await client.db.post.findMany({
    where: {
      active: true,
    },
  });
  return (
    <AppLayout>
      <Main posts={activePosts} className={styles.main} />
    </AppLayout>
  );
}
