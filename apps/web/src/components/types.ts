export interface CartProduct {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  stock: number;
  brand?: string;
  urlId: string;
}

export interface CartItem {
  id?: number;
  productId: number;
  product: CartProduct;
  quantity: number;
  selectedOptions?: string | null;
  quantityAdjusted?: boolean;
}

export interface CartNotification {
  type: "success" | "warning" | "error";
  message: string;
}

export interface AddToCartButtonProps {
  productId: number;
  quantity: number;
  disabled?: boolean;
  className?: string;
  onSuccess?: () => void;
}
