import { type PropsWithChildren } from "react";
import styles from "./Content.module.css";

export function Content({ children }: PropsWithChildren) {
  return <main className={styles.content}>{children}</main>;
}
