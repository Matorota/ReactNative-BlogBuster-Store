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
  role: "admin" | "user";
  dateOfBirth?: Date;
}
