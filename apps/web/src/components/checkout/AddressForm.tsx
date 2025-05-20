import { FormEvent } from "react";
import { FormField } from "./FormField";
import styles from "@/styles/checkout.module.css";

type Address = {
  street: string;
  city: string;
  state: string;
  postCode: string;
  country: string;
};

type AddressFormProps = {
  address: Address;
  onChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  prefix: string;
  validationErrors: Record<string, string>;
};

export function AddressForm({
  address,
  onChange,
  prefix,
  validationErrors,
}: AddressFormProps) {
  return (
    <>
      <div className={styles.formRow}>
        <FormField
          name={`${prefix}.street`}
          label="Street Address"
          error={validationErrors[`${prefix}Address.street`]}
        >
          <input
            type="text"
            id={`${prefix}.street`}
            name={`${prefix}.street`}
            value={address.street}
            onChange={onChange}
            className={`${styles.input} ${
              validationErrors[`${prefix}Address.street`]
                ? styles.inputError
                : ""
            }`}
          />
        </FormField>
      </div>

      <div className={styles.formRow}>
        <FormField
          name={`${prefix}.city`}
          label="City"
          error={validationErrors[`${prefix}Address.city`]}
        >
          <input
            type="text"
            id={`${prefix}.city`}
            name={`${prefix}.city`}
            value={address.city}
            onChange={onChange}
            className={`${styles.input} ${
              validationErrors[`${prefix}Address.city`] ? styles.inputError : ""
            }`}
          />
        </FormField>

        <FormField
          name={`${prefix}.state`}
          label="State"
          error={validationErrors[`${prefix}Address.state`]}
        >
          <input
            type="text"
            id={`${prefix}.state`}
            name={`${prefix}.state`}
            value={address.state}
            onChange={onChange}
            className={`${styles.input} ${
              validationErrors[`${prefix}Address.state`]
                ? styles.inputError
                : ""
            }`}
          />
        </FormField>
      </div>

      <div className={styles.formRow}>
        <FormField
          name={`${prefix}.postCode`}
          label="Post Code"
          error={validationErrors[`${prefix}Address.postCode`]}
        >
          <input
            type="text"
            id={`${prefix}.postCode`}
            name={`${prefix}.postCode`}
            value={address.postCode}
            onChange={onChange}
            className={`${styles.input} ${
              validationErrors[`${prefix}Address.postCode`]
                ? styles.inputError
                : ""
            }`}
          />
        </FormField>

        <FormField
          name={`${prefix}.country`}
          label="Country"
          error={validationErrors[`${prefix}Address.country`]}
        >
          <select
            id={`${prefix}.country`}
            name={`${prefix}.country`}
            value={address.country}
            onChange={onChange}
            className={`${styles.select} ${
              validationErrors[`${prefix}Address.country`]
                ? styles.inputError
                : ""
            }`}
          >
            <option value="Australia">Australia</option>
            <option value="New Zealand">New Zealand</option>
            <option value="United States">United States</option>
            <option value="United Kingdom">United Kingdom</option>
          </select>
        </FormField>
      </div>
    </>
  );
}
