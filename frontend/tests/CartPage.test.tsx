import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CartPage from "../src/pages/CartPage";
import { CartProvider } from "../src/context/CartContext";

vi.mock("../src/context/AuthContext", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("../src/context/AuthContext")>();
  return {
    ...actual,
    useAuth: () => ({
      user: null,
      loading: false,
      login: vi.fn(),
      signup: vi.fn(),
      logout: vi.fn(),
    }),
  };
});

function renderWithCart() {
  return render(
    <MemoryRouter>
      <CartProvider>
        <CartPage />
      </CartProvider>
    </MemoryRouter>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("CartPage", () => {
  it("shows empty cart message when no items", () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({ cartId: "test", items: [] }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )
    );

    renderWithCart();
    expect(screen.getByText("Your cart is empty")).toBeInTheDocument();
    expect(screen.getByText("Start Shopping")).toBeInTheDocument();
  });

  it("renders order summary section when cart has items", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(
          JSON.stringify({
            _id: "cart1",
            cartId: "test",
            items: [
              {
                productId: "p1",
                sourceId: 1,
                title: "Test Product",
                price: 25.0,
                image: "/images/test.png",
                quantity: 2,
              },
            ],
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      )
    );

    renderWithCart();
    expect(await screen.findByText("Test Product")).toBeInTheDocument();
    expect(screen.getByText("Order Summary")).toBeInTheDocument();
    expect(screen.getByText("Proceed to Checkout")).toBeInTheDocument();
  });
});
