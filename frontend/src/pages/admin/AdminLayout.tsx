import { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaTachometerAlt, FaBoxes, FaClipboardList, FaStore, FaBars, FaTimes, FaStar } from 'react-icons/fa';

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <button
          className="admin-menu-btn"
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close admin menu" : "Open admin menu"}
          aria-expanded={open}
        >
          {open ? <FaTimes /> : <FaBars />}
        </button>
        <span className="admin-topbar-title">
          <FaTachometerAlt /> Admin Panel
        </span>
        <NavLink to="/" className="admin-topbar-home" aria-label="Back to store">
          <FaStore />
        </NavLink>
      </div>

      <nav className={`admin-nav ${open ? "open" : ""}`}>
        <h2 className="admin-nav-title">
          <FaTachometerAlt /> Admin Panel
        </h2>
        <NavLink
          to="/admin"
          end
          className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          onClick={close}
        >
          <FaTachometerAlt /> Dashboard
        </NavLink>
        <NavLink
          to="/admin/products"
          className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          onClick={close}
        >
          <FaBoxes /> Products
        </NavLink>
        <NavLink
          to="/admin/orders"
          className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          onClick={close}
        >
          <FaClipboardList /> Orders
        </NavLink>
        <NavLink
          to="/admin/reviews"
          className={({ isActive }) => `admin-link ${isActive ? "active" : ""}`}
          onClick={close}
        >
          <FaStar /> Reviews
        </NavLink>
        <NavLink to="/" className="admin-link admin-link-store" onClick={close}>
          <FaStore /> Back to Store
        </NavLink>
      </nav>

      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}