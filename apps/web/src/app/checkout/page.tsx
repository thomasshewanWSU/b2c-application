"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { formatPrice } from "@repo/utils";
import Link from "next/link";
import styles from "./checkout.module.css";

type CartItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  slug: string;
};

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isOrderPlaced, setIsOrderPlaced] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});
  const queryClient = useQueryClient();

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    shippingAddress: {
      street: "",
      city: "",
      state: "",
      postCode: "",
      country: "Australia",
    },
    billingAddress: {
      street: "",
      city: "",
      state: "",
      postCode: "",
      country: "Australia",
    },
    sameAsShipping: true,
    paymentMethod: "creditCard",
  });

  // Fetch cart data
  const { data, isLoading: isLoadingCart } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart");
      return response.json();
    },
    staleTime: 1000 * 60, // 1 minute
  });

  const cartItems = data?.items || [];
  const subtotal = cartItems.reduce(
    (sum: number, item: CartItem) => sum + item.price * item.quantity,
    0,
  );

  // Shipping calculation (mock - could be more complex)
  const shippingCost = subtotal > 100 ? 0 : 10;
  const total = subtotal + shippingCost;

  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0 && !isOrderPlaced) {
      router.push("/cart");
    }
  }, [cartItems, isLoadingCart, router, isOrderPlaced]);

  // Handle form changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("shipping")) {
      const field = name.split(".")[1] as string;
      setFormData({
        ...formData,
        shippingAddress: {
          ...formData.shippingAddress,
          [field]: value,
        },
      });
    } else if (name.startsWith("billing")) {
      const field = name.split(".")[1] as string;
      setFormData({
        ...formData,
        billingAddress: {
          ...formData.billingAddress,
          [field]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Handle checkbox change
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      sameAsShipping: e.target.checked,
    });
  };

  // Traditional form validation function
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate full name
    if (formData.fullName.length < 3) {
      errors.fullName = "Full name must be at least 3 characters";
    }

    // Validate email with regex
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    const email = formData.email.trim(); // Trim whitespace
    if (!email) {
      errors.email = "Email address is required";
    } else if (!emailRegex.test(email)) {
      errors.email = "Please enter a valid email address";
    }

    // Validate phone with regex
    const phoneRegex = /^\d{8,15}$/;
    if (!phoneRegex.test(formData.phone)) {
      errors.phone = "Please enter a valid phone number (8-15 digits)";
    }

    // Validate shipping address
    if (formData.shippingAddress.street.length < 5) {
      errors["shippingAddress.street"] =
        "Street address must be at least 5 characters";
    }
    if (formData.shippingAddress.city.length < 2) {
      errors["shippingAddress.city"] = "City is required";
    }
    if (formData.shippingAddress.state.length < 2) {
      errors["shippingAddress.state"] = "State is required";
    }
    if (formData.shippingAddress.postCode.length < 4) {
      errors["shippingAddress.postCode"] =
        "Post code must be at least 4 characters";
    }

    // Validate billing address if not same as shipping
    if (!formData.sameAsShipping) {
      if (formData.billingAddress.street.length < 5) {
        errors["billingAddress.street"] =
          "Street address must be at least 5 characters";
      }
      if (formData.billingAddress.city.length < 2) {
        errors["billingAddress.city"] = "City is required";
      }
      if (formData.billingAddress.state.length < 2) {
        errors["billingAddress.state"] = "State is required";
      }
      if (formData.billingAddress.postCode.length < 4) {
        errors["billingAddress.postCode"] =
          "Post code must be at least 4 characters";
      }

      // Check if billing address is completely empty, show a general error
      if (
        !formData.billingAddress.street &&
        !formData.billingAddress.city &&
        !formData.billingAddress.state &&
        !formData.billingAddress.postCode
      ) {
        errors.billingAddress = "Billing address is incomplete";
      }
    }

    // Validate payment method
    const validPaymentMethods = ["creditCard", "paypal", "afterpay", "zip"];
    if (!validPaymentMethods.includes(formData.paymentMethod)) {
      errors.paymentMethod = "Please select a payment method";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setValidationErrors({});

    // Validate form using traditional validation
    if (!validateForm()) {
      setError("Please fix the validation errors below.");
      return;
    }

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Format addresses
      const shippingAddress = `${formData.shippingAddress.street}, ${formData.shippingAddress.city}, ${formData.shippingAddress.state}, ${formData.shippingAddress.postCode}, ${formData.shippingAddress.country}`;

      const billingAddress = formData.sameAsShipping
        ? shippingAddress
        : `${formData.billingAddress.street}, ${formData.billingAddress.city}, ${formData.billingAddress.state}, ${formData.billingAddress.postCode}, ${formData.billingAddress.country}`;

      const orderData = {
        shippingAddress,
        billingAddress: formData.sameAsShipping ? null : billingAddress,
        paymentMethod: formData.paymentMethod,
        total: total,
      };

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (!response.ok) {
        // Check for stock issues specifically
        if (data.stockIssues && data.stockIssues.length > 0) {
          // Stock issue detected - redirect to cart with stock error flag
          await queryClient.invalidateQueries({ queryKey: ["cart"] });

          router.push(`/cart?stockIssues=true`);
          return;
        }

        // Handle other errors as usual
        throw new Error(data.message || "Failed to place order");
      }

      setIsOrderPlaced(true);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setSuccess("Order placed successfully!");
      router.push(`/checkout/confirmation/${data.orderId}`);
    } catch (error) {
      setError((error as Error).message || "Failed to place order");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || isLoadingCart) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p>Loading checkout...</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Checkout</h1>

      {error && <div className={styles.error}>{error}</div>}
      {success && <div className={styles.success}>{success}</div>}

      <div className={styles.layout}>
        <div className={styles.formContainer}>
          <form onSubmit={handleSubmit} className={styles.checkoutForm}>
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Contact Information</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="fullName">Full Name</label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.fullName ? styles.inputError : ""}`}
                  />
                  {validationErrors.fullName && (
                    <div className={styles.fieldError}>
                      {validationErrors.fullName}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.email ? styles.inputError : ""}`}
                  />
                  {validationErrors.email && (
                    <div className={styles.fieldError}>
                      {validationErrors.email}
                    </div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="phone">Phone</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors.phone ? styles.inputError : ""}`}
                  />
                  {validationErrors.phone && (
                    <div className={styles.fieldError}>
                      {validationErrors.phone}
                    </div>
                  )}
                </div>
              </div>
            </section>
            // For the shipping address section
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Shipping Address</h2>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="shipping.street">Street Address</label>
                  <input
                    type="text"
                    id="shipping.street"
                    name="shipping.street"
                    value={formData.shippingAddress.street}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors["shippingAddress.street"] ? styles.inputError : ""}`}
                  />
                  {validationErrors["shippingAddress.street"] && (
                    <div className={styles.fieldError}>
                      {validationErrors["shippingAddress.street"]}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="shipping.city">City</label>
                  <input
                    type="text"
                    id="shipping.city"
                    name="shipping.city"
                    value={formData.shippingAddress.city}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors["shippingAddress.city"] ? styles.inputError : ""}`}
                  />
                  {validationErrors["shippingAddress.city"] && (
                    <div className={styles.fieldError}>
                      {validationErrors["shippingAddress.city"]}
                    </div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="shipping.state">State</label>
                  <input
                    type="text"
                    id="shipping.state"
                    name="shipping.state"
                    value={formData.shippingAddress.state}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors["shippingAddress.state"] ? styles.inputError : ""}`}
                  />
                  {validationErrors["shippingAddress.state"] && (
                    <div className={styles.fieldError}>
                      {validationErrors["shippingAddress.state"]}
                    </div>
                  )}
                </div>
              </div>
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label htmlFor="shipping.postCode">Post Code</label>
                  <input
                    type="text"
                    id="shipping.postCode"
                    name="shipping.postCode"
                    value={formData.shippingAddress.postCode}
                    onChange={handleInputChange}
                    className={`${styles.input} ${validationErrors["shippingAddress.postCode"] ? styles.inputError : ""}`}
                  />
                  {validationErrors["shippingAddress.postCode"] && (
                    <div className={styles.fieldError}>
                      {validationErrors["shippingAddress.postCode"]}
                    </div>
                  )}
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="shipping.country">Country</label>
                  <select
                    id="shipping.country"
                    name="shipping.country"
                    value={formData.shippingAddress.country}
                    onChange={handleInputChange}
                    className={`${styles.select} ${validationErrors["shippingAddress.country"] ? styles.inputError : ""}`}
                  >
                    <option value="Australia">Australia</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                  </select>
                  {validationErrors["shippingAddress.country"] && (
                    <div className={styles.fieldError}>
                      {validationErrors["shippingAddress.country"]}
                    </div>
                  )}
                </div>
              </div>
            </section>
            // For the billing address section (when not same as shipping)
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
                  {validationErrors.billingAddress && (
                    <div className={styles.fieldError}>
                      {validationErrors.billingAddress}
                    </div>
                  )}
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="billing.street">Street Address</label>
                      <input
                        type="text"
                        id="billing.street"
                        name="billing.street"
                        value={formData.billingAddress.street}
                        onChange={handleInputChange}
                        className={`${styles.input} ${validationErrors["billingAddress.street"] ? styles.inputError : ""}`}
                      />
                      {validationErrors["billingAddress.street"] && (
                        <div className={styles.fieldError}>
                          {validationErrors["billingAddress.street"]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="billing.city">City</label>
                      <input
                        type="text"
                        id="billing.city"
                        name="billing.city"
                        value={formData.billingAddress.city}
                        onChange={handleInputChange}
                        className={`${styles.input} ${validationErrors["billingAddress.city"] ? styles.inputError : ""}`}
                      />
                      {validationErrors["billingAddress.city"] && (
                        <div className={styles.fieldError}>
                          {validationErrors["billingAddress.city"]}
                        </div>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="billing.state">State</label>
                      <input
                        type="text"
                        id="billing.state"
                        name="billing.state"
                        value={formData.billingAddress.state}
                        onChange={handleInputChange}
                        className={`${styles.input} ${validationErrors["billingAddress.state"] ? styles.inputError : ""}`}
                      />
                      {validationErrors["billingAddress.state"] && (
                        <div className={styles.fieldError}>
                          {validationErrors["billingAddress.state"]}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles.formRow}>
                    <div className={styles.formGroup}>
                      <label htmlFor="billing.postCode">Post Code</label>
                      <input
                        type="text"
                        id="billing.postCode"
                        name="billing.postCode"
                        value={formData.billingAddress.postCode}
                        onChange={handleInputChange}
                        className={`${styles.input} ${validationErrors["billingAddress.postCode"] ? styles.inputError : ""}`}
                      />
                      {validationErrors["billingAddress.postCode"] && (
                        <div className={styles.fieldError}>
                          {validationErrors["billingAddress.postCode"]}
                        </div>
                      )}
                    </div>
                    <div className={styles.formGroup}>
                      <label htmlFor="billing.country">Country</label>
                      <select
                        id="billing.country"
                        name="billing.country"
                        value={formData.billingAddress.country}
                        onChange={handleInputChange}
                        className={`${styles.select} ${validationErrors["billingAddress.country"] ? styles.inputError : ""}`}
                      >
                        <option value="Australia">Australia</option>
                        <option value="New Zealand">New Zealand</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                      {validationErrors["billingAddress.country"] && (
                        <div className={styles.fieldError}>
                          {validationErrors["billingAddress.country"]}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </section>
            // For the payment method section
            <section className={styles.formSection}>
              <h2 className={styles.sectionTitle}>Payment Method</h2>
              <div className={styles.formGroup}>
                <select
                  id="paymentMethod"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleInputChange}
                  className={`${styles.select} ${validationErrors.paymentMethod ? styles.inputError : ""}`}
                >
                  <option value="creditCard">Credit/Debit Card</option>
                  <option value="paypal">PayPal</option>
                  <option value="afterpay">Afterpay</option>
                  <option value="zip">Zip</option>
                </select>
                {validationErrors.paymentMethod && (
                  <div className={styles.fieldError}>
                    {validationErrors.paymentMethod}
                  </div>
                )}
              </div>
              <div className={styles.paymentInfo}>
                <p>
                  This is a mock checkout. No actual payment will be processed.
                </p>
              </div>
            </section>
            <div className={styles.actionButtons}>
              <Link href="/cart" className={styles.backButton}>
                Return to Cart
              </Link>
              <button
                type="submit"
                className={styles.placeOrderButton}
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Place Order"}
              </button>
            </div>
          </form>
        </div>

        <div className={styles.orderSummary}>
          <h2 className={styles.summaryTitle}>Order Summary</h2>
          <div className={styles.summaryItems}>
            {cartItems.map((item: CartItem) => (
              <div key={item.id} className={styles.summaryItem}>
                <div className={styles.itemImageWrapper}>
                  <Image
                    src={item.image || "/placeholder.jpg"}
                    alt={item.name}
                    width={64}
                    height={64}
                    className={styles.itemImage}
                  />
                  <span className={styles.itemQuantity}>x{item.quantity}</span>
                </div>
                <div className={styles.itemDetails}>
                  <span className={styles.itemName}>{item.name}</span>
                  <span className={styles.itemPrice}>
                    {formatPrice(item.price)}
                  </span>
                </div>
                <span className={styles.itemTotal}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.summaryTotals}>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Shipping</span>
              <span>
                {shippingCost === 0 ? "Free" : formatPrice(shippingCost)}
              </span>
            </div>
            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
