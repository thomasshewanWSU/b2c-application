import { AppLayout } from "@/components/Layout/AppLayout";
import { BlogDetail } from "@/components/Blog/Detail";
import { client } from "@repo/db/client";

export default async function Page({
  params,
}: {
  params: Promise<{ urlId: string }>;
}) {
  const { urlId } = await params;

  // Fetch post
  const post = await client.db.post.update({
    where: { urlId, active: true },
    data: { views: { increment: 1 } },
  });

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <AppLayout>
      <BlogDetail post={post} />
    </AppLayout>
  );
}
