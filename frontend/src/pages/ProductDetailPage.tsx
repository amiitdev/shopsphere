import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import type { Product, Review, ReviewSummary } from "../types";
import { fetchProduct, fetchProductReviews, submitReview, fetchProducts, aiRecommendations } from "../api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [origin, setOrigin] = useState("50% 50%");
  const { add } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  // Reviews state
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewSummary, setReviewSummary] = useState<ReviewSummary>({
    average: 0,
    count: 0,
    breakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });
  const [canReview, setCanReview] = useState(false);
  const [verifiedPurchase, setVerifiedPurchase] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // AI Recommendations
  const [recommended, setRecommended] = useState<Product[]>([]);

  const handleAdd = () => {
    if (!user) {
      showToast("Please login first to add items to your cart", "error");
      navigate("/login");
      return;
    }
    if (!product) return;
    void add(product, qty);
    showToast(`Added "${product.title}" to cart`, "success");
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchProduct(id)
      .then(setProduct)
      .catch(() => setError("Product not found."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (!id) return;
    fetchProductReviews(id).then((res) => {
      setReviews(res.items);
      setReviewSummary(res.summary);
      setCanReview(res.canReview ?? false);
      setVerifiedPurchase(res.verifiedPurchase ?? false);
    }).catch(() => {});
  }, [id]);

  // Fetch AI recommendations
  useEffect(() => {
    if (!id) return;
    aiRecommendations(id, 4).then(async (res) => {
      if (res.recommendations.length === 0) return;
      const all = await fetchProducts({ limit: 50 });
      const idSet = new Set(res.recommendations.map((r) => r.productId));
      setRecommended(all.items.filter((p) => idSet.has(p._id)));
    }).catch(() => {});
  }, [id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin(`${x}% ${y}%`);
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitting(true);
    try {
      await submitReview(id, {
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
      });
      showToast("Review submitted!", "success");
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      // refresh reviews
      const res = await fetchProductReviews(id);
      setReviews(res.items);
      setReviewSummary(res.summary);
      setCanReview(res.canReview ?? false);
      setVerifiedPurchase(res.verifiedPurchase ?? false);
    } catch (err: any) {
      showToast(err.message || "Failed to submit review", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    );
  if (error || !product)
    return (
      <div className="empty-state">
        <p>{error}</p>
        <Link to="/" className="btn btn-primary">
          ← Back to catalog
        </Link>
      </div>
    );

  return (
    <section className="detail">
      <Link to="/" className="back-link">
        ← Back to catalog
      </Link>
      <div className="detail-grid">
        <div
          className={`detail-image-wrap ${zoom ? "zoomed" : ""}`}
          onMouseMove={handleMove}
          onClick={() => setZoom(true)}
          role="button"
          tabIndex={0}
          aria-label="Zoom image"
        >
          <img
            src={product.image}
            alt={product.title}
            className="detail-image"
            style={{ transformOrigin: origin }}
          />
          <span className="zoom-hint">Hover to zoom · click to enlarge</span>
        </div>
        <div className="detail-info">
          <span className="badge">{product.category}</span>
          <h1 className="detail-title">{product.title}</h1>
          <div className="detail-rating">
            {Array.from({ length: 5 }, (_, i) => (
              <span
                key={i}
                className={i < Math.round(product.rating.rate) ? "star filled" : "star"}
              >
                ★
              </span>
            ))}
            <span className="detail-rating-text">
              {product.rating.rate} ({product.rating.count} reviews)
            </span>
          </div>
          <p className="detail-price">${product.price.toFixed(2)}</p>
          <p className="detail-description">{product.description}</p>
          <div className="detail-qty-row">
            {user?.role === "admin" ? (
              <p className="admin-view-note">
                You're viewing as an admin. Admin accounts cannot purchase products.
              </p>
            ) : (
              <>
                <div className="qty-stepper">
                  <button
                    onClick={() => setQty(Math.max(1, qty - 1))}
                    aria-label="Decrease quantity"
                  >
                    −
                  </button>
                  <span>{qty}</span>
                  <button
                    onClick={() => setQty(qty + 1)}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <button
                  className="btn btn-primary"
                  onClick={handleAdd}
                >
                  Add to Cart
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {zoom && (
        <div className="lightbox" onClick={() => setZoom(false)}>
          <img
            src={product.image}
            alt={product.title}
            className="lightbox-image"
          />
          <span className="lightbox-close">✕ Close (Esc)</span>
        </div>
      )}

      {/* ─── Reviews Section ─── */}
      <div className="reviews-section">
        <div className="reviews-header">
          <h2>Customer Reviews</h2>
          {user?.role === "user" && canReview && !showReviewForm && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => setShowReviewForm(true)}
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Rating summary */}
        <div className="reviews-summary">
          <div className="reviews-summary-overall">
            <span className="reviews-summary-avg">{reviewSummary.average}</span>
            <div className="reviews-summary-stars">
              {Array.from({ length: 5 }, (_, i) => (
                <span
                  key={i}
                  className={i < Math.round(reviewSummary.average) ? "star filled" : "star"}
                >
                  ★
                </span>
              ))}
            </div>
            <span className="reviews-summary-count">{reviewSummary.count} reviews</span>
          </div>
          <div className="reviews-summary-bars">
            {[5, 4, 3, 2, 1].map((stars) => {
              const count = reviewSummary.breakdown[stars] ?? 0;
              const pct = reviewSummary.count ? (count / reviewSummary.count) * 100 : 0;
              return (
                <div key={stars} className="review-bar-row">
                  <span className="review-bar-label">{stars}★</span>
                  <div className="review-bar-track">
                    <div className="review-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="review-bar-count">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Review form */}
        {showReviewForm && (
          <form className="review-form" onSubmit={handleSubmitReview}>
            <h3>{verifiedPurchase ? "Verified Purchase" : "Your Review"}</h3>
            <div className="review-form-rating">
              <span className="review-form-rating-label">Rating:</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={s <= reviewRating ? "star filled" : "star"}
                  onClick={() => setReviewRating(s)}
                  aria-label={`${s} star${s !== 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Review title (optional)"
              value={reviewTitle}
              onChange={(e) => setReviewTitle(e.target.value)}
              maxLength={120}
            />
            <textarea
              placeholder="Your review (optional)"
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              maxLength={2000}
              rows={4}
            />
            <div className="review-form-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setShowReviewForm(false)}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting || reviewRating < 1}
              >
                {submitting ? "Submitting…" : "Submit Review"}
              </button>
            </div>
          </form>
        )}

        {!showReviewForm && user?.role === "user" && !canReview && (
          <p className="reviews-login-hint">
            You can review this product after purchasing it.
          </p>
        )}

        {/* Review list */}
        <div className="reviews-list">
          {reviews.length === 0 ? (
            <p className="reviews-empty">No reviews yet. Be the first to review this product!</p>
          ) : (
            reviews.map((r) => (
              <div key={r._id} className="review-card">
                <div className="review-card-header">
                  <div className="review-card-stars">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={i < r.rating ? "star filled" : "star"}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <span className="review-card-date">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </span>
                </div>
                {r.title && <h4 className="review-card-title">{r.title}</h4>}
                {r.comment && <p className="review-card-comment">{r.comment}</p>}
                <span className="review-card-verified">
                  {r.verifiedPurchase ? "✓ Verified Purchase" : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ─── AI Recommendations ─── */}
      {recommended.length > 0 && (
        <div className="reviews-section">
          <h2>💡 You Might Also Like</h2>
          <div className="grid" style={{ marginTop: "1rem" }}>
            {recommended.map((p) => (
              <Link
                key={p._id}
                to={`/product/${p._id}`}
                className="card"
                style={{ textDecoration: "none", color: "inherit" }}
              >
                <div className="card-image">
                  <img src={p.image} alt={p.title} />
                </div>
                <div className="card-body">
                  <h3 className="card-title">{p.title}</h3>
                  <p className="card-price">${p.price.toFixed(2)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
