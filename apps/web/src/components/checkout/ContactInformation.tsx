import { FormField } from "./FormField";
import styles from "@/styles/checkout.module.css";

type ContactInformationProps = {
  fullName: string;
  email: string;
  phone: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  validationErrors: Record<string, string>;
};

/**
 * ContactInformation component renders a form section for entering contact details.
 * It includes fields for full name, email, and phone number, with validation error handling.
 *
 * @param {ContactInformationProps} props - The properties for the ContactInformation component.
 * @returns {JSX.Element} The rendered contact information form section.
 */
export function ContactInformation({
  fullName,
  email,
  phone,
  onChange,
  validationErrors,
}: ContactInformationProps) {
  return (
    <section className={styles.formSection}>
      <h2 className={styles.sectionTitle}>Contact Information</h2>

      <div className={styles.formRow}>
        <FormField
          name="fullName"
          label="Full Name"
          error={validationErrors.fullName}
        >
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={fullName}
            onChange={onChange}
            className={`${styles.input} ${validationErrors.fullName ? styles.inputError : ""}`}
          />
        </FormField>
      </div>

      <div className={styles.formRow}>
        <FormField name="email" label="Email" error={validationErrors.email}>
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={onChange}
            className={`${styles.input} ${validationErrors.email ? styles.inputError : ""}`}
          />
        </FormField>

        <FormField name="phone" label="Phone" error={validationErrors.phone}>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={phone}
            onChange={onChange}
            className={`${styles.input} ${validationErrors.phone ? styles.inputError : ""}`}
          />
        </FormField>
      </div>
    </section>
  );
}
