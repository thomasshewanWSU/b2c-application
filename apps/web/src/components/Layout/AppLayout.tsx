import type { PropsWithChildren } from "react";
import { Content } from "../Content";
import { LeftMenu } from "../Menu/LeftMenu";
import { TopMenu } from "./TopMenu";
import { Filters } from "../../types/filters";
import styles from "./AppLayout.module.css";

type AppLayoutProps = {
  query?: string;
  filters?: Filters;
};

export async function AppLayout({
  children,
  query,
  filters = {},
}: PropsWithChildren<AppLayoutProps>) {
  return (
    <div className={styles.container}>
      <LeftMenu filters={filters} />
      <div className={styles.mainContent}>
        <TopMenu query={query} />
        <Content>{children}</Content>
      </div>
    </div>
  );
}
