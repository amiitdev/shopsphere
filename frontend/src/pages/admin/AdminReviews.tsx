import { useEffect, useState } from "react";
import { FaStar, FaTrash, FaSpinner } from "react-icons/fa";
import type { AdminReviewRow } from "../../types";
import { adminListAllReviews, adminDeleteReview } from "../../api";
import { useToast } from "../../context/ToastContext";

export default function AdminReviews() {
  const [reviews, setReviews] = useState<AdminReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const { showToast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const data = await adminListAllReviews();
      setReviews(data.items);
    } catch {
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this review?")) return;
    setDeleting(id);
    try {
      await adminDeleteReview(id);
      setReviews((prev) => prev.filter((r) => r._id !== id));
      showToast("Review deleted", "success");
    } catch {
      showToast("Failed to delete review", "error");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-header">
        <h1>
          <FaStar /> Review Management
        </h1>
      </div>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading reviews…</p>
        </div>
      ) : reviews.length === 0 ? (
        <p className="admin-empty">No reviews yet.</p>
      ) : (
        <div className="admin-review-list">
          {reviews.map((r) => (
            <div key={r._id} className="admin-review-card">
              <div className="admin-review-header">
                <div className="admin-review-stars">
                  {Array.from({ length: 5 }, (_, i) => (
                    <FaStar
                      key={i}
                      className={i < r.rating ? "star-filled" : "star-empty"}
                    />
                  ))}
                </div>
                {r.verifiedPurchase && (
                  <span className="badge badge-verified">Verified</span>
                )}
                <span className="admin-review-date">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="admin-review-product">{r.title}</h3>
              <p className="admin-review-user">{r.userEmail}</p>
              <button
                className="btn btn-danger btn-sm"
                onClick={() => void handleDelete(r._id)}
                disabled={deleting === r._id}
              >
                {deleting === r._id ? <FaSpinner className="spin" /> : <FaTrash />} Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
