import { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import CartDrawer from "./components/CartDrawer";
import AdminRoute from "./components/AdminRoute";
import { useAuth } from "./context/AuthContext";
import CatalogPage from "./pages/CatalogPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmationPage from "./pages/OrderConfirmationPage";
import OrdersPage from "./pages/OrdersPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminReviews from "./pages/admin/AdminReviews";
import ChatWidget from "./components/ChatWidget";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <Navbar onCartClick={() => setCartOpen(true)} />
      {user?.role !== "admin" && (
        <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
      )}
      <main className="app-main">
        <Routes>
          <Route path="/" element={<CatalogPage />} />
          <Route path="/product/:id" element={<ProductDetailPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/order/:id" element={<OrderConfirmationPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="reviews" element={<AdminReviews />} />
            </Route>
          </Route>
        </Routes>
      </main>
      <ChatWidget />
    </>
  );
}
