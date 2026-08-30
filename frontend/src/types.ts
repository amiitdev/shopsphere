export interface Product {
  _id: string;
  sourceId: number;
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
  rating: { rate: number; count: number };
}

export interface ProductList {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
}

export interface CartItem {
  productId: string;
  sourceId: number;
  title: string;
  price: number;
  image: string;
  quantity: number;
  status?: string;
}

export interface Cart {
  _id: string;
  cartId: string;
  items: CartItem[];
}

export interface Customer {
  name: string;
  email: string;
  address: string;
  city: string;
  zip: string;
}

export interface Payment {
  status: string;
  last4: string;
  transactionId: string;
}

export interface Review {
  _id: string;
  productId: string;
  userId: string;
  rating: number;
  title?: string;
  comment?: string;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
  breakdown: Record<number, number>;
}

export interface ReviewListResponse {
  items: Review[];
  total: number;
  page: number;
  limit: number;
  summary: ReviewSummary;
  canReview?: boolean;
  verifiedPurchase?: boolean;
}

export interface AdminReviewRow {
  _id: string;
  productId: string;
  title: string;
  userId: string;
  userEmail: string;
  rating: number;
  verifiedPurchase: boolean;
  createdAt: string;
}

export interface Order {
  _id: string;
  orderNumber: string;
  cartId: string;
  userId: string | null;
  items: CartItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: "pending" | "confirmed" | "delivered" | "cancelled";
  customer: Customer;
  payment: Payment;
  createdAt: string;
}
