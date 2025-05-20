"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import styles from "@/styles/checkout.module.css";
// Import our components
import { CheckoutLayout } from "@/components/checkout/CheckoutLayout";
import { ContactInformation } from "@/components/checkout/ContactInformation";
import { AddressForm } from "@/components/checkout/AddressForm";
import { PaymentMethod } from "@/components/checkout/PaymentMethod";
import { OrderSummary } from "@/components/checkout/OrderSummary";
import { FormActions } from "@/components/checkout/FormActions";
import {
  CheckoutFormController,
  FormData,
} from "@/components/checkout/CheckoutFormController";
import { CartCalculation } from "@/components/checkout/CartCalculation";

export default function CheckoutPage() {
  const router = useRouter();
  const { status } = useSession();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const queryClient = useQueryClient();

  // Fetch cart data
  const { data, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
    staleTime: 0, // 1 minute
  });
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["cart"] });
  }, [queryClient]);
  const cartItems = data?.items || [];

  // Submit handler
  const handleFormSubmit = async (
    formData: FormData,
    calculatedTotal: number,
  ) => {
    setError("");
    setSuccess("");

    try {
      // Format addresses
      const shippingAddress = `${formData.shippingAddress.street}, ${formData.shippingAddress.city}, ${formData.shippingAddress.state}, ${formData.shippingAddress.postCode}, ${formData.shippingAddress.country}`;

      const billingAddress = formData.sameAsShipping
        ? shippingAddress
        : `${formData.billingAddress.street}, ${formData.billingAddress.city}, ${formData.billingAddress.state}, ${formData.billingAddress.postCode}, ${formData.billingAddress.country}`;

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shippingAddress,
          billingAddress: formData.sameAsShipping ? null : billingAddress,
          paymentMethod: formData.paymentMethod,
          total: calculatedTotal, // Use the calculated total directly
        }),
      });
      const data = await response.json();

      if (!response.ok) {
        if (data.stockIssues && data.stockIssues.length > 0) {
          await queryClient.invalidateQueries({ queryKey: ["cart"] });
          router.push(`/cart?stockIssues=true`);
          return;
        }
        throw new Error(data.message || "Failed to place order");
      }

      setIsOrderPlaced(true);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setSuccess("Order placed successfully!");
      router.push(`/checkout/confirmation/${data.orderId}`);
    } catch (error) {
      setError((error as Error).message || "Failed to place order");
    }
  };

  // Redirect if cart is empty
  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0 && !isOrderPlaced) {
      router.push("/cart");
    }
  }, [cartItems, isLoadingCart, router, isOrderPlaced]);

  if (status === "loading" || isLoadingCart) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <CartCalculation items={cartItems}>
      {({ subtotal, shippingCost, total }) => (
        <CheckoutFormController
          onSubmit={(formData) => handleFormSubmit(formData, total)}
        >
          {({
            formData,
            handleInputChange,
            handleCheckboxChange,
            handleSubmit,
            validationErrors,
            isLoading,
          }) => (
            <CheckoutLayout
              title="Checkout"
              error={error}
              success={success}
              formContent={
                <form onSubmit={handleSubmit} className={styles.checkoutForm}>
                  <ContactInformation
                    fullName={formData.fullName}
                    email={formData.email}
                    phone={formData.phone}
                    onChange={handleInputChange}
                    validationErrors={validationErrors}
                  />

                  <section className={styles.formSection}>
                    <h2 className={styles.sectionTitle}>Shipping Address</h2>
                    <AddressForm
                      address={formData.shippingAddress}
                      onChange={handleInputChange}
                      prefix="shipping"
                      validationErrors={validationErrors}
                    />
                  </section>

                  <section className={styles.formSection}>
                    <div className={styles.checkboxGroup}>
                      <input
                        type="checkbox"
                        id="sameAsShipping"
                        name="sameAsShipping"
                        checked={formData.sameAsShipping}
                        onChange={handleCheckboxChange}
                        className={styles.checkbox}
                      />
                      <label htmlFor="sameAsShipping">
                        Billing address same as shipping
                      </label>
                    </div>

                    {!formData.sameAsShipping && (
                      <>
                        <h2 className={styles.sectionTitle}>Billing Address</h2>
                        <AddressForm
                          address={formData.billingAddress}
                          onChange={handleInputChange}
                          prefix="billing"
                          validationErrors={validationErrors}
                        />
                      </>
                    )}
                  </section>

                  <PaymentMethod
                    paymentMethod={formData.paymentMethod}
                    onChange={handleInputChange}
                    validationErrors={validationErrors}
                  />

                  <FormActions isLoading={isLoading} />
                </form>
              }
              summaryContent={
                <OrderSummary
                  cartItems={cartItems}
                  subtotal={subtotal}
                  shippingCost={shippingCost}
                  total={total}
                />
              }
            />
          )}
        </CheckoutFormController>
      )}
    </CartCalculation>
  );
}
