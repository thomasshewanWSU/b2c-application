import type { PropsWithChildren } from "react";

export function LinkList({
  title,
  children,
}: PropsWithChildren<{ title: string }>) {
  return (
    <div>
      <h3 className="mb-2 font-medium">{title}</h3>
      {children}
    </div>
  );
}
