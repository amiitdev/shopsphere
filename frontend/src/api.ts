import type {
  Product,
  ProductList,
  User,
  Cart,
  Order,
  Customer,
  ReviewListResponse,
  AdminReviewRow,
} from "./types";

export interface AdminProductInput {
  title: string;
  price: number;
  description: string;
  category: string;
  image: string;
}

const BASE = "/api";

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export async function fetchProducts(params: {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<ProductList> {
  const qs = new URLSearchParams();
  if (params.category) qs.set("category", params.category);
  if (params.search) qs.set("search", params.search);
  if (params.page) qs.set("page", String(params.page));
  if (params.limit) qs.set("limit", String(params.limit));
  const res = await fetch(`${BASE}/products?${qs.toString()}`);
  return handle<ProductList>(res);
}

export async function fetchProduct(id: string): Promise<Product> {
  const res = await fetch(`${BASE}/products/${id}`);
  return handle<Product>(res);
}

export async function fetchCategories(): Promise<string[]> {
  const res = await fetch(`${BASE}/products/categories`);
  return handle<string[]>(res);
}

// Auth
export async function signup(data: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: User }> {
  const res = await fetch(`${BASE}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handle<{ user: User }>(res);
}

export async function login(data: {
  email: string;
  password: string;
}): Promise<{ user: User }> {
  const res = await fetch(`${BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handle<{ user: User }>(res);
}

export async function logout(): Promise<void> {
  await fetch(`${BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

export async function fetchMe(): Promise<{ user: User }> {
  const res = await fetch(`${BASE}/auth/me`, { credentials: "include" });
  if (res.status === 401) throw new Error("Not authenticated");
  return handle<{ user: User }>(res);
}

// Cart
export async function createCart(): Promise<Cart> {
  const res = await fetch(`${BASE}/cart`, {
    method: "POST",
    credentials: "include",
  });
  return handle<Cart>(res);
}

export async function getCart(cartId: string): Promise<Cart> {
  const res = await fetch(`${BASE}/cart/${cartId}`, {
    credentials: "include",
  });
  return handle<Cart>(res);
}

export async function addCartItem(
  cartId: string,
  productId: string,
  quantity: number
): Promise<Cart> {
  const res = await fetch(`${BASE}/cart/${cartId}/items`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ productId, quantity }),
  });
  return handle<Cart>(res);
}

export async function updateCartItem(
  cartId: string,
  productId: string,
  quantity: number
): Promise<Cart> {
  const res = await fetch(`${BASE}/cart/${cartId}/items/${productId}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ quantity }),
  });
  return handle<Cart>(res);
}

export async function removeCartItem(
  cartId: string,
  productId: string
): Promise<Cart> {
  const res = await fetch(`${BASE}/cart/${cartId}/items/${productId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle<Cart>(res);
}

export async function clearCart(cartId: string): Promise<Cart> {
  const res = await fetch(`${BASE}/cart/${cartId}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle<Cart>(res);
}

// Orders
export async function createOrder(data: {
  cartId: string;
  customer: Customer;
  card: { number: string; name: string; expiry: string; cvv: string };
}): Promise<Order> {
  const res = await fetch(`${BASE}/orders`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handle<Order>(res);
}

export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${id}`, { credentials: "include" });
  return handle<Order>(res);
}

export async function listMyOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE}/orders/me`, { credentials: "include" });
  return handle<Order[]>(res);
}

// Admin
export async function adminListOrders(status?: string): Promise<Order[]> {
  const q = status ? `?status=${encodeURIComponent(status)}` : "";
  const res = await fetch(`${BASE}/orders${q}`, { credentials: "include" });
  return handle<Order[]>(res);
}

export async function adminUpdateOrderStatus(
  id: string,
  status: string
): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${id}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return handle<Order>(res);
}

export async function adminUpdateOrderItemStatus(
  orderId: string,
  productId: string,
  status: string
): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${orderId}/items/${productId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ status }),
  });
  return handle<Order>(res);
}

// Admin — products
export async function adminCreateProduct(data: AdminProductInput): Promise<Product> {
  const res = await fetch(`${BASE}/admin/products`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handle<Product>(res);
}

export async function adminUpdateProduct(
  id: string,
  data: AdminProductInput
): Promise<Product> {
  const res = await fetch(`${BASE}/admin/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handle<Product>(res);
}

export async function adminDeleteProduct(id: string): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/admin/products/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle<{ message: string }>(res);
}

export async function adminUploadImage(file: File): Promise<{ url: string }> {
  const formData = new FormData();
  formData.append("image", file);
  const res = await fetch(`${BASE}/admin/images`, {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  return handle<{ url: string }>(res);
}

// Admin — orders
export async function adminListAllOrders(): Promise<Order[]> {
  const res = await fetch(`${BASE}/admin/orders`, { credentials: "include" });
  return handle<Order[]>(res);
}

export async function adminCancelOrder(id: string): Promise<Order> {
  const res = await fetch(`${BASE}/admin/orders/${id}/cancel`, {
    method: "PATCH",
    credentials: "include",
  });
  return handle<Order>(res);
}

// Reviews
export async function fetchProductReviews(
  productId: string,
  page?: number,
  limit?: number
): Promise<ReviewListResponse> {
  const qs = new URLSearchParams();
  if (page) qs.set("page", String(page));
  if (limit) qs.set("limit", String(limit));
  const res = await fetch(
    `${BASE}/products/${productId}/reviews?${qs.toString()}`,
    { credentials: "include" }
  );
  return handle<ReviewListResponse>(res);
}

export async function submitReview(
  productId: string,
  data: { rating: number; title?: string; comment?: string }
): Promise<unknown> {
  const res = await fetch(`${BASE}/products/${productId}/reviews`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return handle<unknown>(res);
}

export async function adminListAllReviews(): Promise<{
  items: AdminReviewRow[];
  total: number;
}> {
  const res = await fetch(`${BASE}/admin/reviews`, { credentials: "include" });
  return handle<{ items: AdminReviewRow[]; total: number }>(res);
}

export async function adminDeleteReview(
  id: string
): Promise<{ message: string }> {
  const res = await fetch(`${BASE}/admin/reviews/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  return handle<{ message: string }>(res);
}

// AI
export async function aiChat(
  message: string,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<{
  reply: string;
  products: { _id: string; title: string; price: number; image: string; category: string; rating: { rate: number; count: number } }[];
}> {
  const res = await fetch(`${BASE}/ai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ message, history }),
  });
  return handle<{
    reply: string;
    products: { _id: string; title: string; price: number; image: string; category: string; rating: { rate: number; count: number } }[];
  }>(res);
}

export async function aiSearch(
  query: string
): Promise<{ results: { productId: string; score: number; reason: string }[] }> {
  const res = await fetch(`${BASE}/ai/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ query }),
  });
  return handle<{ results: { productId: string; score: number; reason: string }[] }>(res);
}

export async function aiSentiment(
  text: string
): Promise<{ sentiment: string; confidence: number; themes: string[] }> {
  const res = await fetch(`${BASE}/ai/sentiment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ text }),
  });
  return handle<{ sentiment: string; confidence: number; themes: string[] }>(res);
}

export async function aiRecommendations(
  productId: string,
  limit = 4
): Promise<{ recommendations: { productId: string; reason: string }[] }> {
  const res = await fetch(
    `${BASE}/ai/recommendations/${productId}?limit=${limit}`,
    { credentials: "include" }
  );
  return handle<{ recommendations: { productId: string; reason: string }[] }>(res);
}
