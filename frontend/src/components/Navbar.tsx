import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { motion, AnimatePresence } from "framer-motion";

const ACCENTS = [
  { id: "violet", swatch: "#a855f7", gradient: "linear-gradient(135deg, #a855f7, #d946ef, #f0abfc)" },
  { id: "orange", swatch: "#fb923c", gradient: "linear-gradient(135deg, #fb923c, #f97316, #ef4444)" },
  { id: "green", swatch: "#4ade80", gradient: "linear-gradient(135deg, #4ade80, #22c55e, #16a34a)" },
  { id: "red", swatch: "#f87171", gradient: "linear-gradient(135deg, #f87171, #ef4444, #dc2626)" },
  { id: "yellow", swatch: "#fde047", gradient: "linear-gradient(135deg, #fde047, #facc15, #eab308)" },
  { id: "neon", swatch: "#22d3ee", gradient: "linear-gradient(135deg, #22d3ee, #06b6d4, #0891b2)" },
];

const AccentOption = ({ accent, isActive, onClick }: { accent: typeof ACCENTS[0]; isActive: boolean; onClick: () => void }) => (
  <motion.button
    key={accent.id}
    className={`accent-option ${isActive ? "active" : ""}`}
    onClick={onClick}
    whileHover={{ scale: 1.15 }}
    whileTap={{ scale: 0.9 }}
    initial={{ scale: 0, opacity: 0, y: 8 }}
    animate={{ scale: 1, opacity: 1, y: 0 }}
    exit={{ scale: 0, opacity: 0, y: -8 }}
    transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.02 }}
    style={{
      background: accent.gradient,
      boxShadow: isActive ? "0 0 0 3px var(--surface), 0 0 20px var(--accent)" : "none",
    }}
  />
);

export default function Navbar({ onCartClick }: { onCartClick: () => void }) {
  const { user, logout } = useAuth();
  const { count } = useCart();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [accentOpen, setAccentOpen] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("ss_theme") || "dark";
  });
  const [accent, setAccent] = useState(() => {
    return localStorage.getItem("ss_accent") || "violet";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("ss_theme", theme);
  }, [theme]);

  useEffect(() => {
    document.documentElement.setAttribute("data-accent", accent);
    localStorage.setItem("ss_accent", accent);
  }, [accent]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const handleLogout = async () => {
    await logout();
    setMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <img src="/logo.png" alt="ShopSphere" className="navbar-logo" />
          <span className="navbar-brand-text">ShopSphere</span>
        </Link>
        <button
          className="navbar-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
          <span className={`hamburger-line ${menuOpen ? "open" : ""}`} />
        </button>
        <div className={`navbar-links ${menuOpen ? "open" : ""}`}>
          {user ? (
            <>
              <span className="navbar-user">{user.name}</span>
              <Link
                to="/orders"
                className="navbar-link"
                onClick={() => setMenuOpen(false)}
              >
                Orders
              </Link>
              {user.role === "admin" && (
                <Link
                  to="/admin"
                  className="navbar-link"
                  onClick={() => setMenuOpen(false)}
                >
                  Admin
                </Link>
              )}
              <button className="btn btn-ghost" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="navbar-link"
                onClick={() => setMenuOpen(false)}
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="btn btn-primary btn-sm"
                onClick={() => setMenuOpen(false)}
              >
                Sign Up
              </Link>
            </>
          )}
          <div className="accent-picker">
            <motion.button
              className="accent-trigger"
              onClick={() => setAccentOpen(!accentOpen)}
              aria-label="Choose accent color"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.div
                className="accent-swatch"
                style={{ background: ACCENTS.find((a) => a.id === accent)?.gradient }}
                animate={{ rotate: accentOpen ? 45 : 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              />
            </motion.button>
            <AnimatePresence>
              {accentOpen && (
                <motion.div
                  className="accent-menu"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                >
                  {ACCENTS.map((a) => (
                    <AccentOption
                      key={a.id}
                      accent={a}
                      isActive={accent === a.id}
                      onClick={() => {
                        setAccent(a.id);
                        setAccentOpen(false);
                      }}
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <motion.button
            className="navbar-theme-toggle"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
          >
            {theme === "dark" ? "☀" : "☾"}
          </motion.button>
          {user?.role !== "admin" && (
            <motion.button
              className="navbar-cart"
              onClick={() => {
                setMenuOpen(false);
                onCartClick();
              }}
              aria-label={`Cart with ${count} items`}
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
            >
              🛒
              {count > 0 && (
                <motion.span
                  className="cart-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                >
                  {count}
                </motion.span>
              )}
            </motion.button>
          )}
        </div>
      </div>
    </nav>
  );
}
