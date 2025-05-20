import { useState } from "react";

export type FormData = {
  fullName: string;
  email: string;
  phone: string;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postCode: string;
    country: string;
  };
  billingAddress: {
    street: string;
    city: string;
    state: string;
    postCode: string;
    country: string;
  };
  sameAsShipping: boolean;
  paymentMethod: string;
};

type CheckoutFormControllerProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  initialFormData?: FormData;
  children: (props: {
    formData: FormData;
    handleInputChange: (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    ) => void;
    handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSubmit: (e: React.FormEvent) => void;
    validationErrors: Record<string, string>;
    isLoading: boolean;
  }) => React.ReactNode;
};

export function CheckoutFormController({
  onSubmit,
  initialFormData,
  children,
}: CheckoutFormControllerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Default form data
  const defaultFormData = {
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
  };

  const [formData, setFormData] = useState<FormData>(
    initialFormData || defaultFormData,
  );

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

  // Form validation
  const validateForm = () => {
    const errors: Record<string, string> = {};

    // Validate contact information
    if (!formData.fullName.trim()) {
      errors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      errors.phone = "Phone number is required";
    }

    // Validate shipping address
    if (!formData.shippingAddress.street.trim()) {
      errors["shippingAddress.street"] = "Street address is required";
    }

    if (!formData.shippingAddress.city.trim()) {
      errors["shippingAddress.city"] = "City is required";
    }

    if (!formData.shippingAddress.state.trim()) {
      errors["shippingAddress.state"] = "State is required";
    }

    if (!formData.shippingAddress.postCode.trim()) {
      errors["shippingAddress.postCode"] = "Post code is required";
    }

    // Validate billing address if not same as shipping
    if (!formData.sameAsShipping) {
      if (!formData.billingAddress.street.trim()) {
        errors["billingAddress.street"] = "Street address is required";
      }

      if (!formData.billingAddress.city.trim()) {
        errors["billingAddress.city"] = "City is required";
      }

      if (!formData.billingAddress.state.trim()) {
        errors["billingAddress.state"] = "State is required";
      }

      if (!formData.billingAddress.postCode.trim()) {
        errors["billingAddress.postCode"] = "Post code is required";
      }
    }

    // Validate payment method
    if (!formData.paymentMethod) {
      errors.paymentMethod = "Payment method is required";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onSubmit(formData);
    } finally {
      setIsLoading(false);
    }
  };

  return children({
    formData,
    handleInputChange,
    handleCheckboxChange,
    handleSubmit,
    validationErrors,
    isLoading,
  });
}
