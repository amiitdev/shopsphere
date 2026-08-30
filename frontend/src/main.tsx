import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { ToastProvider } from "./context/ToastContext";
import App from "./App";
import "./index.css";

const savedTheme = localStorage.getItem("ss_theme") || "dark";
const savedAccent = localStorage.getItem("ss_accent") || "violet";
document.documentElement.setAttribute("data-theme", savedTheme);
document.documentElement.setAttribute("data-accent", savedAccent);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </React.StrictMode>
);
