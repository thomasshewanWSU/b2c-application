type HistoryItem = {
  month: number;
  year: number;
  count: number;
};

export function history(
  posts: { date: Date; active: boolean }[],
): HistoryItem[] {
  // Group active posts by year-month and count them
  const historyMap = posts
    .filter((post) => post.active)
    .reduce((map, post) => {
      const date = new Date(post.date);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      const key = `${year}-${month}`;

      map.set(key, {
        month,
        year,
        count: (map.get(key)?.count || 0) + 1,
      });

      return map;
    }, new Map<string, HistoryItem>());

  // Convert to array and sort by descending date
  return Array.from(historyMap.values()).sort((a, b) =>
    b.year !== a.year ? b.year - a.year : b.month - a.month,
  );
}
