// Import types from DB package
export type Product = {
  id: number;
  urlId: string;
  name: string;
  brand: string;
  description: string;
  specifications: string;
  detailedDescription: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  featured: boolean;
  active: boolean;
  rating?: number;
  reviewCount?: number;
  reviews?: Review[];
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: number;
  email: string;
  name?: string | null;
  password: string;
  role: "customer" | "admin";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
};
// Update the FilterState type to include brand
export type FilterState = {
  search: string;
  category: string;
  minPrice: string;
  maxPrice: string;
  brand: string | string[]; // Support both string and array
  sortBy: string;
  stockStatus: string;
  activeStatus: string; // Add this

  [key: string]: string | string[]; // Support for additional filters
};

export type PaginationData = {
  total: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  hasMore: boolean;
};
export type RegistrationType = "admin" | "customer";
export type UserRoles = "admin" | "customer";

export type UserRegistrationProps = {
  type?: RegistrationType;
  // Make onSubmit optional since we'll provide a default implementation
  onSubmit?: (userData: {
    name: string;
    email: string;
    password: string;
    role?: UserRoles;
  }) => Promise<{ success: boolean; message: string }>;
  title?: string;
  subtitle?: string;
  allowRoleSelection?: boolean;
  defaultRole?: UserRoles;
  redirectAfterSuccess?: boolean;
  redirectPath?: string;
  // Make validateForm optional since we'll provide a default implementation
  validateForm?: (formData: any) => {
    isValid: boolean;
    errors: Record<string, string>;
  };
  // Add API endpoint configuration
  apiEndpoint?: string;
};
// Add to your existing LoginProps
export interface LoginProps {
  title?: string;
  subtitle?: string;
  logoText?: string;
  redirectPath?: string;
  apiPath?: string;
  helpText?: React.ReactNode | string;
  mergeCartOnLogin?: boolean;
  customStyles?: {
    container?: string;
    loginCard?: string;
    button?: string;
    [key: string]: string | undefined;
  };
  // New OAuth props
  enableOAuth?: boolean;
  oauthProviders?: string[];
}

export type PaginationProps = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
  itemName?: string;
};
export type ProductImageProps = {
  src: string | null | undefined;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  priority?: boolean;
  sizes?: string;
  style?: React.CSSProperties;
};
export type Review = {
  id: number;
  productId: number;
  userId: number;
  rating: number;
  title?: string | null;
  comment: string;
  verified: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
};

export type AddToCartButtonProps = {
  productId: number;
  quantity: number;
  disabled?: boolean;
  className?: string;
};

export type CartItem = {
  id: number;
  quantity: number;
  name: string;
  price: number;
  image: string;
  productId?: number;
};
export type Cart = {
  id: number;
  userId: number;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
  updatedAt: Date;
};
export type CheckoutCartItem = {
  id: number;
  quantity: number;
  product: {
    id: number;
    name: string;
    price: number;
    imageUrl: string;
  };
};
