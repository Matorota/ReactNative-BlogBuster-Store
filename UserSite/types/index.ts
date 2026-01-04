export interface Product {
  id: string;
  name: string;
  price: number;
  barcode: string;
  ageRestriction?: number;
  imageUrl?: string;
  stock?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface ShoppingCart {
  id: string;
  userId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
  status: "active" | "pending" | "completed" | "cancelled";
  qrCode?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  dateOfBirth?: Date;
  createdAt: Date;
}

export interface Order {
  id: string;
  userId: string;
  cartId: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: Date;
  completedAt?: Date;
  status: "pending" | "completed" | "cancelled";
}
