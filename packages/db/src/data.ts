export type Product = {
  id: number;
  urlId: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  category: string;
  stock: number;
  featured: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type User = {
  id: number;
  email: string;
  name: string;
  password: string; // In a real app, this would be hashed
  role: "customer" | "admin";
  createdAt: Date;
  updatedAt: Date;
};

export type Order = {
  id: number;
  userId: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  shippingAddress: string;
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  id: number;
  orderId: number;
  productId: number;
  quantity: number;
  price: number;
};

// Sample product data
export const products: Product[] = [
  {
    id: 1,
    urlId: "wireless-bluetooth-headphones",
    name: "Wireless Bluetooth Headphones",
    description:
      "Premium wireless headphones with active noise cancellation and 30-hour battery life.",
    price: 199.99,
    imageUrl:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3",
    category: "Electronics",
    stock: 50,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    urlId: "smart-fitness-tracker",
    name: "Smart Fitness Tracker",
    description:
      "Track your steps, heart rate, sleep quality and more. Waterproof and with 7-day battery life.",
    price: 89.99,
    imageUrl:
      "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 75,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    urlId: "organic-cotton-t-shirt",
    name: "Organic Cotton T-Shirt",
    description:
      "Comfortable, sustainable t-shirt made from 100% organic cotton. Available in various colors.",
    price: 24.99,
    imageUrl:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3",
    category: "Clothing",
    stock: 100,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 4,
    urlId: "stainless-steel-water-bottle",
    name: "Stainless Steel Water Bottle",
    description:
      "Eco-friendly double-walled insulated bottle that keeps drinks hot for 12 hours and cold for 24 hours.",
    price: 34.99,
    imageUrl:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3",
    category: "Home",
    stock: 120,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 5,
    urlId: "wireless-charging-station",
    name: "Wireless Charging Station",
    description:
      "3-in-1 charging station for your phone, smartwatch, and earbuds with fast charging technology.",
    price: 59.99,
    imageUrl:
      "https://images.unsplash.com/photo-1625895197185-efcec01cffe0?ixlib=rb-4.0.3",
    category: "Electronics",
    stock: 45,
    featured: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 6,
    urlId: "smart-home-security-camera",
    name: "Smart Home Security Camera",
    description:
      "HD security camera with motion detection, night vision, and two-way audio. Works with your smart home system.",
    price: 129.99,
    imageUrl:
      "https://images.unsplash.com/photo-1580981454769-61eb384acaee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    category: "Electronics",
    stock: 30,
    featured: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample user data
export const users: User[] = [
  {
    id: 1,
    email: "admin@store.com",
    name: "Admin User",
    password: "admin123", // In a real app, this would be hashed
    role: "admin",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 2,
    email: "john@example.com",
    name: "John Doe",
    password: "password123", // In a real app, this would be hashed
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: 3,
    email: "jane@example.com",
    name: "Jane Smith",
    password: "password123", // In a real app, this would be hashed
    role: "customer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

// Sample order data
export const orders: Order[] = [
  {
    id: 1,
    userId: 2,
    status: "delivered",
    total: 224.98,
    shippingAddress: "123 Main St, Anytown, ST 12345",
    paymentMethod: "Credit Card",
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
  },
  {
    id: 2,
    userId: 3,
    status: "shipped",
    total: 89.99,
    shippingAddress: "456 Oak Ave, Othertown, ST 67890",
    paymentMethod: "PayPal",
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
  },
  {
    id: 3,
    userId: 2,
    status: "processing",
    total: 94.98,
    shippingAddress: "123 Main St, Anytown, ST 12345",
    paymentMethod: "Credit Card",
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
  },
];

// Sample order item data
export const orderItems: OrderItem[] = [
  {
    id: 1,
    orderId: 1,
    productId: 1,
    quantity: 1,
    price: 199.99,
  },
  {
    id: 2,
    orderId: 1,
    productId: 3,
    quantity: 1,
    price: 24.99,
  },
  {
    id: 3,
    orderId: 2,
    productId: 2,
    quantity: 1,
    price: 89.99,
  },
  {
    id: 4,
    orderId: 3,
    productId: 3,
    quantity: 2,
    price: 24.99,
  },
  {
    id: 5,
    orderId: 3,
    productId: 4,
    quantity: 1,
    price: 34.99,
  },
];
