import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { CartProvider, useCart } from "../src/context/CartContext";
import type { Product } from "../src/types";

const product: Product = {
  _id: "6a8fec96dabf4376a470b747",
  sourceId: 14,
  title: "Artisan Olive Wood Cutting Board",
  price: 74,
  description: "A beautiful board",
  category: "home",
  image: "/images/14-cuttingboard.png",
  rating: { rate: 4.8, count: 42 },
};

// Component that exercises the flow a user triggers: initial cart load, then add-to-cart.
function Harness() {
  const { items, count, subtotal, add } = useCart();
  return (
    <div>
      <button onClick={() => void add(product)}>add</button>
      <span data-testid="count">{count}</span>
      <span data-testid="subtotal">{subtotal.toFixed(2)}</span>
      <span data-testid="names">
        {items.map((i) => i.title).join(",")}
      </span>
    </div>
  );
}

function renderHarness() {
  return render(
    <CartProvider>
      <Harness />
    </CartProvider>
  );
}

beforeEach(() => {
  vi.restoreAllMocks();
  localStorage.clear();
});

describe("CartProvider add-to-cart (fresh visitor)", () => {
  it("adopts the created cart id and persists items when the stored cart does not exist yet", async () => {
    const newCartId = "fresh-server-uuid";

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init?: RequestInit) => {
        const u = String(url);

        // The stored (client) cart does not exist yet -> 404 so we create one.
        if (u.includes("/api/cart/fresh-server-uuid") && !u.includes("/items")) {
          return new Response(JSON.stringify({ error: "not found" }), {
            status: 404,
          });
        }
        // Creating a fresh cart returns a new server id.
        if (u.endsWith("/api/cart") && (init?.method ?? "GET") === "POST") {
          return new Response(
            JSON.stringify({ _id: "c", cartId: newCartId, items: [] }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        // Add item -> server responds with the new cart id and the item present.
        if (u.includes("/api/cart/" + newCartId + "/items") || u.includes("/items")) {
          return new Response(
            JSON.stringify({
              _id: "c",
              cartId: newCartId,
              items: [
                {
                  productId: product._id,
                  sourceId: product.sourceId,
                  title: product.title,
                  price: product.price,
                  image: product.image,
                  quantity: 1,
                },
              ],
            }),
            { status: 200, headers: { "content-type": "application/json" } }
          );
        }
        // GET cart by the new id.
        return new Response(
          JSON.stringify({ _id: "c", cartId: newCartId, items: [] }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      })
    );

    renderHarness();

    // Wait for initial load, then click add.
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      screen.getByRole("button", { name: "add" }).click();
      await Promise.resolve();
    });

    // The item must appear with correct count and subtotal.
    expect(screen.getByTestId("count").textContent).toBe("1");
    expect(screen.getByTestId("subtotal").textContent).toBe("74.00");
    expect(screen.getByTestId("names").textContent).toContain("Artisan Olive Wood");
  });
});
