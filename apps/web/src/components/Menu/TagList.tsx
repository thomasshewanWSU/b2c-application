import { type Post } from "@repo/db/data";
import { tags } from "../../functions/tags";
import { LinkList } from "./LinkList";
import { toUrlPath } from "@repo/utils/url";
import { SummaryItem } from "./SummaryItem";

export async function TagList({
  selectedTag,
  posts,
}: {
  selectedTag?: string;
  posts: Post[];
}) {
  const postTags = await tags(posts);
  return (
    <LinkList title="Tags">
      <ul>
        {postTags.map((tag) => (
          <li key={tag.name}>
            <SummaryItem
              name={tag.name}
              link={`/tags/${toUrlPath(tag.name)}`}
              count={tag.count}
              isSelected={toUrlPath(tag.name) === selectedTag}
              title={`Tag / ${tag.name}`}
            />
          </li>
        ))}
      </ul>
    </LinkList>
  );
}
