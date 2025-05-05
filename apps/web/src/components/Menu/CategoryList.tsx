import { categories } from "@/functions/categories";
import type { Post } from "@repo/db/data";
import { toUrlPath } from "@repo/utils/url";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";

export function CategoryList({
  selectedCategory,
  posts,
}: {
  selectedCategory?: string;
  posts: Post[];
}) {
  // TODO: Implement proper category list
  return (
    <>
      <LinkList title="Categories">
        {categories(posts).map((item) => (
          <SummaryItem
            key={item.name}
            count={item.count}
            name={item.name}
            isSelected={toUrlPath(item.name) === selectedCategory}
            link={`/category/${toUrlPath(item.name)}`}
            title={`Category / ${item.name}`}
          />
        ))}
      </LinkList>
    </>
  );
}
