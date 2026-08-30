import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function CartPage() {
  const { items, count, subtotal, updateQty, remove, clear } = useCart();
  const { user } = useAuth();
  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + tax + shipping;

  if (user?.role === "admin") {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛡️</div>
        <h2>Admins cannot purchase</h2>
        <p>Admin accounts manage the store — they can't add to cart or place orders.</p>
        <Link to="/admin" className="btn btn-primary">
          Go to Admin Panel
        </Link>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛒</div>
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet.</p>
        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="cart-page">
      <h1>Shopping Cart ({count} items)</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {items.map((item) => (
            <div key={item.productId} className="cart-line-item">
              <img src={item.image} alt={item.title} className="cart-item-img" />
              <div className="cart-item-info">
                <Link to={`/product/${item.productId}`} className="cart-item-title">
                  {item.title}
                </Link>
                <p className="cart-item-price">${item.price.toFixed(2)} each</p>
                <div className="cart-item-row">
                  <div className="qty-stepper">
                    <button
                      onClick={() =>
                        item.quantity > 1
                          ? updateQty(item.productId, item.quantity - 1)
                          : remove(item.productId)
                      }
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQty(item.productId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>
                  <span className="cart-item-total">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => remove(item.productId)}
                  >
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button className="btn btn-ghost" onClick={clear}>
            Clear Cart
          </button>
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <Link to="/checkout" className="btn btn-primary btn-block">
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}
