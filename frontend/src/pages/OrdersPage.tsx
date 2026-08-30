import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listMyOrders } from "../api";
import { useAuth } from "../context/AuthContext";
import type { Order } from "../types";

const STATUS_META: Record<string, { label: string; cls: string }> = {
  pending: { label: "Pending", cls: "badge-pending" },
  confirmed: { label: "Confirmed", cls: "badge-confirmed" },
  delivered: { label: "Delivered", cls: "badge-delivered" },
  cancelled: { label: "Cancelled", cls: "badge-cancelled" },
};

export default function OrdersPage() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    listMyOrders()
      .then(setOrders)
      .catch(() => setError("Failed to load orders."))
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="empty-state">
        <h2>Please log in</h2>
        <p>Sign in to view your order history.</p>
        <Link to="/login" className="btn btn-primary">
          Sign In
        </Link>
      </div>
    );
  }

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading orders…</p>
      </div>
    );

  if (error)
    return (
      <div className="empty-state">
        <p className="status error">{error}</p>
      </div>
    );

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">📦</div>
        <h2>No orders yet</h2>
        <p>When you place an order, it will appear here.</p>
        <Link to="/" className="btn btn-primary">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <section className="orders-page">
      <h1>Your Orders</h1>
      <div className="orders-list">
        {orders.map((order) => {
          const orderMeta = STATUS_META[order.status] || STATUS_META.pending;
          return (
            <Link
              key={order._id}
              to={`/order/${order._id}`}
              className="order-card"
            >
              <div className="order-card-header">
                <span className="order-number">{order.orderNumber}</span>
                <span className={`badge ${orderMeta.cls}`}>{orderMeta.label}</span>
              </div>
              <div className="order-card-meta">
                <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                <span className="order-card-total">
                  ${order.total.toFixed(2)}
                </span>
              </div>
              <p className="order-card-items">
                {order.items.length} item{order.items.length !== 1 ? "s" : ""}
              </p>
              
              <div className="order-card-items-list" style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {order.items.map((item) => {
                  const itemStatus = item.status || "pending";
                  const meta = STATUS_META[itemStatus] || STATUS_META.pending;
                  return (
                    <div key={item.productId} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', padding: '0.4rem 0', borderTop: '1px solid var(--border)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0, flex: 1 }}>
                        <img src={item.image} alt={item.title} style={{ width: '24px', height: '24px', objectFit: 'contain', background: '#fff', borderRadius: '4px', padding: '2px' }} />
                        <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: 'var(--text-secondary)' }}>
                          {item.title} (Qty: {item.quantity})
                        </span>
                      </div>
                      <span className={`badge ${meta.cls}`} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', marginLeft: '0.5rem', flexShrink: 0 }}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
