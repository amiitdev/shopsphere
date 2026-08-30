import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBoxes, FaClipboardList, FaHourglassHalf, FaCheckCircle, FaTruck, FaBan } from "react-icons/fa";
import { fetchProducts, adminListAllOrders } from "../../api";

export default function AdminDashboard() {
  const [productCount, setProductCount] = useState<number | null>(null);
  const [orderCount, setOrderCount] = useState<number | null>(null);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [products, orders] = await Promise.all([
          fetchProducts({ limit: 1 }),
          adminListAllOrders(),
        ]);
        if (!mounted) return;
        setProductCount(products.total);
        setOrderCount(orders.length);
        const counts: Record<string, number> = {};
        for (const o of orders) counts[o.status] = (counts[o.status] ?? 0) + 1;
        setStatusCounts(counts);
      } catch {
        if (mounted) setError("Failed to load dashboard data");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const cards = [
    { to: "/admin/products", icon: <FaBoxes />, label: "Products", value: productCount },
    { to: "/admin/orders", icon: <FaClipboardList />, label: "Orders", value: orderCount },
  ];

  const breakdown = [
    { key: "pending", icon: <FaHourglassHalf />, cls: "badge-pending" },
    { key: "confirmed", icon: <FaCheckCircle />, cls: "badge-confirmed" },
    { key: "delivered", icon: <FaTruck />, cls: "badge-delivered" },
    { key: "cancelled", icon: <FaBan />, cls: "badge-cancelled" },
  ];

  if (error)
    return (
      <div className="empty-state">
        <p>{error}</p>
      </div>
    );

  return (
    <section className="admin-page">
      <div className="admin-header">
        <h1>Dashboard</h1>
      </div>

      <div className="admin-dash-grid">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="admin-dash-card">
            <span className="admin-dash-icon">{c.icon}</span>
            <span className="admin-dash-label">{c.label}</span>
            <span className="admin-dash-value">
              {c.value === null ? "—" : c.value}
            </span>
          </Link>
        ))}
      </div>

      <div className="admin-dash-statuses">
        <h2>Orders by status</h2>
        <div className="admin-dash-badges">
          {breakdown.map((b) => (
            <span key={b.key} className={`badge ${b.cls}`}>
              {b.icon} {statusCounts[b.key] ?? 0} {b.key}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}