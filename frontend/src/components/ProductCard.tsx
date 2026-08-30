import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../types";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleAdd = () => {
    if (!user) {
      showToast("Please login first to add items to your cart", "error");
      navigate("/login");
      return;
    }
    void add(product);
    showToast(`Added "${product.title}" to cart`, "success");
  };

  return (
    <div className="card">
      <Link to={`/product/${product._id}`} className="card-link">
        <div className="card-image">
          <img src={product.image} alt={product.title} loading="lazy" />
        </div>
        <div className="card-body">
          <h3 className="card-title">{product.title}</h3>
          <p className="card-category">{product.category}</p>
          <p className="card-price">${product.price.toFixed(2)}</p>
          <p className="card-rating">
            {product.rating.rate} ★ ({product.rating.count})
          </p>
        </div>
      </Link>
      <div className="card-actions">
        {user?.role === "admin" ? (
          <span className="text-muted-sm">View only · admins cannot purchase</span>
        ) : (
          <button
            className="btn btn-primary btn-sm"
            onClick={handleAdd}
          >
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
}