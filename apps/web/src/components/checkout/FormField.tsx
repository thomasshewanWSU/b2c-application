import { ReactNode } from "react";
import styles from "@/styles/checkout.module.css";

type FormFieldProps = {
  name: string;
  label: string;
  error?: string;
  children: ReactNode;
};

/**
 * FormField component renders a labeled form field with optional error message.
 * It is used to encapsulate form controls and their labels, providing a consistent layout.
 *
 * @param {FormFieldProps} props - The properties for the FormField component.
 * @returns {JSX.Element} The rendered form field with label and children.
 */
export function FormField({ name, label, error, children }: FormFieldProps) {
  return (
    <div className={styles.formGroup}>
      <label htmlFor={name}>{label}</label>
      {children}
      {error && <div className={styles.fieldError}>{error}</div>}
    </div>
  );
}
