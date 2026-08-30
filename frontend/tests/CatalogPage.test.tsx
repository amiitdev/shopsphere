import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import CatalogPage from "../src/pages/CatalogPage";
import { MemoryRouter } from "react-router-dom";
import { CartProvider } from "../src/context/CartContext";
import { AuthProvider } from "../src/context/AuthContext";
import { ToastProvider } from "../src/context/ToastContext";
import type { ProductList } from "../src/types";

const sample: ProductList = {
  items: [
    {
      _id: "64b000000000000000000001",
      sourceId: 1,
      title: "Test Shirt",
      price: 19.99,
      description: "A shirt",
      category: "clothing",
      image: "https://example.com/a.png",
      rating: { rate: 4.5, count: 10 },
    },
  ],
  total: 1,
  page: 1,
  limit: 50,
};

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CatalogPage", () => {
  it("renders products after load", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (typeof url === "string" && url.includes("/auth/me")) {
          return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }
        if (typeof url === "string" && url.includes("/categories")) {
          return new Response(JSON.stringify(["clothing"]), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(JSON.stringify(sample), {
          status: 200,
          headers: { "content-type": "application/json" },
        });
      })
    );

    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CatalogPage />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText("Test Shirt")).toBeInTheDocument();
    expect(screen.getByText("$19.99")).toBeInTheDocument();
  });

  it("shows an error message when the request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (typeof url === "string" && url.includes("/auth/me")) {
          return new Response(JSON.stringify({ error: "Not authenticated" }), {
            status: 401,
            headers: { "content-type": "application/json" },
          });
        }
        return new Response(null, { status: 500 });
      })
    );

    render(
      <MemoryRouter>
        <ToastProvider>
          <AuthProvider>
            <CartProvider>
              <CatalogPage />
            </CartProvider>
          </AuthProvider>
        </ToastProvider>
      </MemoryRouter>
    );

    expect(await screen.findByText(/Failed to load products/i)).toBeInTheDocument();
  });
});
