import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Navbar from "../src/components/Navbar";
import { CartProvider } from "../src/context/CartContext";
import { AuthProvider } from "../src/context/AuthContext";

vi.stubGlobal(
  "fetch",
  vi.fn(async () =>
    new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    })
  )
);

function renderNavbar(onCartClick: () => void = () => {}) {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <CartProvider>
          <Navbar onCartClick={onCartClick} />
        </CartProvider>
      </AuthProvider>
    </MemoryRouter>
  );
}

describe("Navbar", () => {
  it("renders brand name", () => {
    renderNavbar();
    expect(screen.getByText("ShopSphere")).toBeInTheDocument();
  });

  it("renders theme toggle button", () => {
    renderNavbar();
    expect(screen.getByLabelText("Toggle theme")).toBeInTheDocument();
  });

  it("renders cart button with zero badge", () => {
    renderNavbar();
    expect(screen.getByLabelText("Cart with 0 items")).toBeInTheDocument();
  });

  it("renders login and signup links when logged out", () => {
    renderNavbar();
    expect(screen.getByText("Login")).toBeInTheDocument();
    expect(screen.getByText("Sign Up")).toBeInTheDocument();
  });

  it("calls onCartClick when cart button is clicked", () => {
    const onClick = vi.fn();
    renderNavbar(onClick);
    screen.getByLabelText("Cart with 0 items").click();
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
