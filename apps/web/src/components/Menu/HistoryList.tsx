import { history } from "@/functions/history";
import { type Post } from "@repo/db/data";
import { SummaryItem } from "./SummaryItem";
import { LinkList } from "./LinkList";
const months = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export async function HistoryList({
  selectedYear,
  selectedMonth,
  posts,
}: {
  selectedYear?: string;
  selectedMonth?: string;
  posts: Post[];
}) {
  const historyItems = history(posts);

  // TODO: use the "history" function on "functions" directory to get the history
  //       and render all history items using the SummaryItem component
  return (
    <LinkList title="History">
      <ul>
        {historyItems.map((item) => {
          const dateStr = `${months[item.month]}, ${item.year}`;
          // Compare selectedYear and selectedMonth to the current item
          const isSelected =
            selectedYear === item.year.toString() &&
            selectedMonth === item.month.toString();
          return (
            <li key={`${item.year}-${item.month}`}>
              <SummaryItem
                name={dateStr}
                link={`/history/${item.year}/${item.month}`}
                count={item.count}
                isSelected={isSelected}
                title={`History / ${dateStr}`}
              />
            </li>
          );
        })}
      </ul>
    </LinkList>
  );
}
