import { ReactNode } from "react";
import styles from "@/styles/checkout.module.css";

type CheckoutLayoutProps = {
  title: string;
  error?: string;
  success?: string;
  formContent: ReactNode;
  summaryContent: ReactNode;
};

export function CheckoutLayout({
  title,
  error,
  success,
  formContent,
  summaryContent,
}: CheckoutLayoutProps) {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{title}</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.layout}>
        <div className={styles.formContainer}>{formContent}</div>
        {summaryContent}
      </div>
    </div>
  );
}
