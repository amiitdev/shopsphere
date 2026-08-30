import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { items, count, subtotal, updateQty, remove } = useCart();

  return (
    <>
      <div
        className={`drawer-overlay ${open ? "open" : ""}`}
        onClick={onClose}
      />
      <aside className={`drawer ${open ? "open" : ""}`}>
        <div className="drawer-header">
          <h2>Your Cart ({count})</h2>
          <button className="drawer-close" onClick={onClose} aria-label="Close cart">
            ✕
          </button>
        </div>
        {items.length === 0 ? (
          <div className="drawer-empty">
            <p>Your cart is empty</p>
            <Link to="/" className="btn btn-primary" onClick={onClose}>
              Browse Products
            </Link>
          </div>
        ) : (
          <>
            <ul className="drawer-items">
              {items.map((item) => (
                <li key={item.productId} className="drawer-item">
                  <img src={item.image} alt={item.title} className="drawer-item-img" />
                  <div className="drawer-item-info">
                    <p className="drawer-item-title">{item.title}</p>
                    <p className="drawer-item-price">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
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
                  </div>
                  <button
                    className="drawer-item-remove"
                    onClick={() => remove(item.productId)}
                    aria-label={`Remove ${item.title}`}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
            <div className="drawer-footer">
              <div className="drawer-subtotal">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <Link
                to="/cart"
                className="btn btn-secondary"
                onClick={onClose}
              >
                View Cart
              </Link>
              <Link
                to="/checkout"
                className="btn btn-primary"
                onClick={onClose}
              >
                Checkout
              </Link>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
