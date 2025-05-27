import { ReactNode } from "react";
import styles from "@/styles/checkout.module.css";

type FormFieldProps = {
  name: string;
  label: string;
  error?: string;
  children: ReactNode;
};

export function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}
