import { FormField } from "./FormField";
import styles from "@/styles/checkout.module.css";

type PaymentMethodProps = {
  paymentMethod: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  validationErrors: Record<string, string>;
};

/**
 * PaymentMethod component renders a form section for selecting a payment method.
 * It includes a dropdown for different payment options and handles validation errors.
 *
 * @param {PaymentMethodProps} props - The properties for the PaymentMethod component.
 * @returns {JSX.Element} The rendered payment method form section.
 */
export function PaymentMethod({
  paymentMethod,
  onChange,
  validationErrors,
}: PaymentMethodProps) {
  return (
    <section className={styles.formSection}>
      <h2 className={styles.sectionTitle}>Payment Method</h2>

      <FormField
        name="paymentMethod"
        label="Payment Method"
        error={validationErrors.paymentMethod}
      >
        <select
          id="paymentMethod"
          name="paymentMethod"
          value={paymentMethod}
          onChange={onChange}
          className={`${styles.select} ${validationErrors.paymentMethod ? styles.inputError : ""}`}
        >
          <option value="creditCard">Credit/Debit Card</option>
          <option value="paypal">PayPal</option>
          <option value="afterpay">Afterpay</option>
          <option value="zip">Zip</option>
        </select>
      </FormField>

      <div className={styles.paymentInfo}>
        <p>This is a mock checkout. No actual payment will be processed.</p>
      </div>
    </section>
  );
}
