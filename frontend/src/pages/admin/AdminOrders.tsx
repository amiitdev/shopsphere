import { useState, useEffect, useCallback } from "react";
import {
  FaBoxOpen,
  FaCheckCircle,
  FaTruck,
  FaHourglassHalf,
  FaBan,
  FaClipboardList,
  FaExclamationTriangle,
} from "react-icons/fa";
import {
  adminListAllOrders,
  adminCancelOrder,
  adminUpdateOrderStatus,
} from "../../api";
import { useToast } from "../../context/ToastContext";
import type { Order } from "../../types";

const STATUS_FLOW: Record<string, string[]> = {
  pending: ["confirmed", "delivered"],
  confirmed: ["delivered"],
  delivered: [],
  cancelled: [],
};

const STATUS_META: Record<string, { label: string; icon: JSX.Element; cls: string }> = {
  pending: { label: "Pending", icon: <FaHourglassHalf />, cls: "badge-pending" },
  confirmed: { label: "Confirmed", icon: <FaCheckCircle />, cls: "badge-confirmed" },
  delivered: { label: "Delivered", icon: <FaTruck />, cls: "badge-delivered" },
  cancelled: { label: "Cancelled", icon: <FaBan />, cls: "badge-cancelled" },
};

const FILTERS = ["", "pending", "confirmed", "delivered", "cancelled"];

export default function AdminOrders() {
  const { showToast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");

  const load = useCallback(async (status?: string) => {
    setLoading(true);
    try {
      const all = await adminListAllOrders();
      setOrders(status ? all.filter((o) => o.status === status) : all);
    } catch {
      showToast("Failed to load orders", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void load(filter);
  }, [filter, load]);

  const advance = async (order: Order, next: string) => {
    try {
      await adminUpdateOrderStatus(order._id, next);
      showToast(`Order ${order.orderNumber} marked ${next}`, "success");
      void load(filter);
    } catch {
      showToast("Failed to update order status", "error");
    }
  };

  const cancel = async (order: Order) => {
    if (
      !window.confirm(
        `Cancel order ${order.orderNumber} ($${order.total.toFixed(2)})? This cannot be undone.`
      )
    ) {
      return;
    }
    try {
      await adminCancelOrder(order._id);
      showToast(`Order ${order.orderNumber} cancelled`, "success");
      void load(filter);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to cancel order", "error");
    }
  };

  const canCancel = (o: Order) =>
    o.status !== "delivered" && o.status !== "cancelled";

  return (
    <section className="admin-page">
      <div className="admin-header">
        <h1>
          <FaClipboardList /> Order Management
        </h1>
        <div className="admin-filters">
          {FILTERS.map((s) => (
            <button
              key={s || "all"}
              className={`btn btn-sm ${filter === s ? "btn-primary" : "btn-outline"}`}
              onClick={() => setFilter(s)}
            >
              {s ? (STATUS_META[s]?.label ?? s) : "All"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading orders…</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          <FaBoxOpen className="empty-icon" />
          <p>No orders{filter ? ` with status "${filter}"` : ""} yet.</p>
        </div>
      ) : (
        <div className="admin-order-list">
          {orders.map((order) => {
            const meta = STATUS_META[order.status] ?? STATUS_META.pending;
            const nextActions = STATUS_FLOW[order.status] ?? [];
            return (
              <div
                key={order._id}
                className={`admin-order-card${order.status === "cancelled" ? " cancelled" : ""}`}
              >
                <div className="admin-order-top">
                  <span className="order-number">{order.orderNumber}</span>
                  <span className={`badge ${meta.cls}`}>
                    {meta.icon} {meta.label}
                  </span>
                </div>
                <div className="admin-order-meta">
                  <span>{new Date(order.createdAt).toLocaleString()}</span>
                  <span className="admin-order-customer">
                    {order.customer.name} · {order.customer.email}
                  </span>
                  <span className="admin-order-total">${order.total.toFixed(2)}</span>
                </div>
                <div className="admin-order-items-grid">
                  {order.items.map((it) => {
                    const itemStatus = it.status || "pending";
                    const itemMeta = STATUS_META[itemStatus] ?? STATUS_META.pending;
                    return (
                      <div key={it.productId} className="admin-order-item-row">
                        <div className="admin-order-item-left">
                          <img src={it.image} alt={it.title} className="admin-order-thumb" />
                          <div className="admin-order-item-details">
                            <span className="admin-order-item-title">{it.title}</span>
                            <span className="admin-order-item-qty">Qty: {it.quantity}</span>
                          </div>
                        </div>
                        <div className="admin-order-item-right">
                          <span className={`badge ${itemMeta.cls}`}>
                            {itemMeta.icon} {itemMeta.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="admin-order-actions">
                  {order.status === "cancelled" && (
                    <span className="cancelled-note">
                      <FaExclamationTriangle /> Cancelled by admin
                    </span>
                  )}
                  {nextActions.length > 0 &&
                    nextActions.map((n) => (
                      <button
                        key={n}
                        className="btn btn-primary btn-sm"
                        onClick={() => advance(order, n)}
                      >
                        {STATUS_META[n]?.icon} Mark {STATUS_META[n]?.label}
                      </button>
                    ))}
                  {canCancel(order) && (
                    <button className="btn btn-outline btn-sm danger-sm" onClick={() => cancel(order)}>
                      <FaBan /> Cancel Order
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}