import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getOrder } from "../api";
import type { Order } from "../types";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "badge-pending" },
  confirmed: { label: "Confirmed", cls: "badge-confirmed" },
  delivered: { label: "Delivered", cls: "badge-delivered" },
  cancelled: { label: "Cancelled", cls: "badge-cancelled" },
};

export default function OrderConfirmationPage() {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getOrder(id)
      .then(setOrder)
      .catch(() => setError("Order not found."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading order…</p>
      </div>
    );
  if (error || !order)
    return (
      <div className="empty-state">
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">
          Continue Shopping
        </Link>
      </div>
    );

  const tax = order.total * 0.08;
  const orderMeta = STATUS_META[order.status] || STATUS_META.pending;

  return (
    <section className="order-confirmation">
      <div className="confirmation-header">
        <div className="confirmation-check">✓</div>
        <h1>Order Confirmed!</h1>
        <p className="confirmation-sub">
          Thank you for your purchase. Your order has been placed successfully.
        </p>
      </div>
      <div className="confirmation-card">
        <div className="confirmation-meta">
          <div>
            <span className="meta-label">Order Number</span>
            <span className="meta-value">{order.orderNumber}</span>
          </div>
          <div>
            <span className="meta-label">Status</span>
            <span className={`badge ${orderMeta.cls}`}>{orderMeta.label}</span>
          </div>
          {order.payment && (
            <div>
              <span className="meta-label">Payment</span>
              <span className="meta-value">
                •••• {order.payment.last4}
              </span>
            </div>
          )}
        </div>
        <div className="confirmation-items">
          {order.items.map((item) => {
            const itemStatus = item.status || "pending";
            const meta = STATUS_META[itemStatus] || STATUS_META.pending;
            return (
              <div key={item.productId} className="confirmation-item">
                <img src={item.image} alt={item.title} className="confirmation-item-img" />
                <div className="confirmation-item-info">
                  <span>{item.title}</span>
                  <span className="muted">Qty: {item.quantity}</span>
                </div>
                <span className={`badge ${meta.cls}`} style={{ marginRight: "0.5rem" }}>
                  {meta.label}
                </span>
                <span className="confirmation-item-price">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="confirmation-totals">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${(order.total - tax - 5.99).toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>$5.99</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${order.total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      <Link to="/" className="btn btn-primary" style={{ marginTop: "1.5rem" }}>
        Continue Shopping
      </Link>
    </section>
  );
}
