import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ProductCard from "../src/components/ProductCard";
import { CartProvider } from "../src/context/CartContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import type { Product } from "../src/types";
import { vi } from "vitest";

vi.stubGlobal(
  "fetch",
  vi.fn(async () =>
    new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  )
);

const product: Product = {
  _id: "64b000000000000000000001",
  sourceId: 1,
  title: "Test Mug",
  price: 9.99,
  description: "A mug",
  category: "home",
  image: "https://example.com/b.png",
  rating: { rate: 3.5, count: 5 },
};

describe("ProductCard", () => {
  it("renders product details and links to detail", () => {
    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <ProductCard product={product} />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(screen.getByText("Test Mug")).toBeInTheDocument();
    expect(screen.getByText("$9.99")).toBeInTheDocument();
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/product/64b000000000000000000001");
  });
});
