import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { createOrder } from "../api";

export default function CheckoutPage() {
  const { cartId, items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [zip, setZip] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const tax = subtotal * 0.08;
  const shipping = subtotal > 0 ? 5.99 : 0;
  const total = subtotal + tax + shipping;

  if (user?.role === "admin") {
    return (
      <div className="empty-state">
        <div className="empty-icon">🛡️</div>
        <h2>Admins cannot purchase</h2>
        <p>Admin accounts manage the store — they can't place orders.</p>
        <Link to="/admin" className="btn btn-primary">
          Go to Admin Panel
        </Link>
      </div>
    );
  }

  const formatCardNumber = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (v: string) => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    setError(null);
    setLoading(true);
    try {
      const order = await createOrder({
        cartId,
        customer: { name, email, address, city, zip },
        card: {
          number: cardNumber.replace(/\s/g, ""),
          name: cardName,
          expiry,
          cvv,
        },
      });
      await clear();
      navigate(`/order/${order._id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order failed");
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="empty-state">
        <h2>Nothing to checkout</h2>
        <p>Add items to your cart first.</p>
      </div>
    );
  }

  return (
    <section className="checkout-page">
      <h1>Checkout</h1>
      {error && <div className="auth-error">{error}</div>}
      <form className="checkout-layout" onSubmit={handleSubmit}>
        <div className="checkout-form">
          <h2>Customer Information</h2>
          <label className="form-field">
            <span>Full Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label className="form-field">
            <span>Address</span>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>City</span>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </label>
            <label className="form-field">
              <span>ZIP Code</span>
              <input
                type="text"
                value={zip}
                onChange={(e) => setZip(e.target.value)}
                required
              />
            </label>
          </div>

          <h2>Payment Details</h2>
          <div className="card-preview">
            <div className="card-preview-number">
              {cardNumber || "•••• •••• •••• ••••"}
            </div>
            <div className="card-preview-bottom">
              <span>{cardName || "CARDHOLDER"}</span>
              <span>{expiry || "MM/YY"}</span>
            </div>
          </div>
          <label className="form-field">
            <span>Card Number</span>
            <input
              type="text"
              value={cardNumber}
              onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              required
            />
          </label>
          <label className="form-field">
            <span>Cardholder Name</span>
            <input
              type="text"
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              required
            />
          </label>
          <div className="form-row">
            <label className="form-field">
              <span>Expiry</span>
              <input
                type="text"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                maxLength={5}
                required
              />
            </label>
            <label className="form-field">
              <span>CVV</span>
              <input
                type="password"
                value={cvv}
                onChange={(e) =>
                  setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                placeholder="•••"
                maxLength={4}
                required
              />
            </label>
          </div>
        </div>
        <div className="cart-summary">
          <h2>Order Summary</h2>
          {items.map((item) => (
            <div key={item.productId} className="summary-item">
              <span>
                {item.title} × {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
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
          <button
            type="submit"
            className="btn btn-primary btn-block"
            disabled={loading}
          >
            {loading ? "Placing Order…" : `Pay $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </section>
  );
}
