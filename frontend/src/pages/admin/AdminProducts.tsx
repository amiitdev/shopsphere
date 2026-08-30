import { useState, useEffect, useCallback, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaBoxOpen, FaUpload, FaSearch, FaTimes } from "react-icons/fa";
import type { Product } from "../../types";
import {
  fetchProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  adminUploadImage,
  type AdminProductInput,
} from "../../api";
import { useToast } from "../../context/ToastContext";

const SEED_IMAGES = Array.from(
  { length: 20 },
  (_, i) => `/images/${String(i + 1).padStart(2, "0")}-headphones.png`
);

const EMPTY_FORM: AdminProductInput = {
  title: "",
  price: 0,
  description: "",
  category: "",
  image: "/images/",
};

export default function AdminProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<AdminProductInput>(EMPTY_FORM);
  const [priceStr, setPriceStr] = useState("");
  const [search, setSearch] = useState("");
  const [total, setTotal] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = useCallback(
    async (term: string = "") => {
      setLoading(true);
      try {
        const data = await fetchProducts({ search: term, limit: 50 });
        setProducts(data.items);
        setTotal(data.total);
      } catch {
        showToast("Failed to load products", "error");
      } finally {
        setLoading(false);
      }
    },
    [showToast]
  );

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const timeout = setTimeout(() => void load(search.trim()), 300);
    return () => clearTimeout(timeout);
  }, [search, load]);

  const set = (field: keyof AdminProductInput, value: string | number) =>
    setForm((f) => ({ ...f, [field]: value }));

  const setPrice = (value: string) => {
    const cleaned = value.replace(/[^0-9.]/g, "");
    const [integer, decimal] = cleaned.split(".");
    if (decimal !== undefined) {
      if (decimal.length > 2) return;
      setPriceStr(`${integer.replace(/^0+(?=\d)/, "")}.${decimal}`);
    } else {
      setPriceStr(integer.replace(/^0+(?=\d)/, ""));
    }
  };

  const startEdit = (p: Product) => {
    setEditing(p);
    setPriceStr(String(p.price));
    setForm({
      title: p.title,
      price: p.price,
      description: p.description,
      category: p.category,
      image: p.image,
    });
  };

  const cancelEdit = () => {
    setEditing(null);
    setPriceStr("");
    setForm(EMPTY_FORM);
  };

  const handleUpload = async (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      showToast("Image must be 5MB or smaller", "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      showToast("Only PNG, JPEG, or WebP images are allowed", "error");
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setUploading(true);
    try {
      const { url } = await adminUploadImage(file);
      set("image", url);
      showToast("Image uploaded", "success");
    } catch {
      showToast("Image upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const price = Number(priceStr);
    if (!Number.isFinite(price) || price <= 0) {
      showToast("Enter a valid price greater than zero", "error");
      return;
    }
    const payload = { ...form, price };
    setSaving(true);
    try {
      if (editing) {
        await adminUpdateProduct(editing._id, payload);
        showToast(`Updated "${payload.title}"`, "success");
      } else {
        await adminCreateProduct(payload);
        showToast(`Created "${payload.title}"`, "success");
      }
      cancelEdit();
      void load();
    } catch {
      showToast("Failed to save product", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(`Delete "${p.title}"? This cannot be undone.`)) return;
    try {
      await adminDeleteProduct(p._id);
      showToast(`Deleted "${p.title}"`, "success");
      void load();
    } catch {
      showToast("Failed to delete product", "error");
    }
  };

  return (
    <section className="admin-page">
      <div className="admin-header">
        <h1>
          <FaBoxOpen /> Product Management
        </h1>
        <div className="admin-search">
          <FaSearch className="admin-search-icon" />
          <input
            type="search"
            placeholder="Search products by title, description, or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="admin-search-input"
            aria-label="Search products"
          />
          {search && (
            <button
              type="button"
              className="admin-search-clear"
              onClick={() => setSearch("")}
              aria-label="Clear search"
            >
              <FaTimes />
            </button>
          )}
        </div>
      </div>
      {total && <p className="admin-results-count">{total} product{total !== 1 ? "s" : ""} found</p>}

      <form
        className="admin-product-form"
        onSubmit={handleSubmit}
        style={{ marginBottom: "2rem" }}
      >
        <h2>{editing ? `Edit "${editing.title}"` : "Create Product"}</h2>
        <div className="product-form-grid">
          <label className="form-field">
            <span>Title</span>
            <input
              value={form.title}
              onChange={(e) => set("title", e.target.value)}
              placeholder="Product name"
              required
              maxLength={120}
            />
          </label>
          <label className="form-field">
            <span>Price ($)</span>
            <input
              type="text"
              inputMode="decimal"
              value={priceStr}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              required
            />
          </label>
          <label className="form-field">
            <span>Category</span>
            <input
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              placeholder="e.g. electronics, home, clothing"
              required
            />
          </label>
          <label className="form-field">
            <span>Description</span>
            <textarea
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Product description"
              required
              rows={2}
            />
          </label>

          <div className="form-field admin-image-field">
            <span>Image</span>
            <div className="admin-image-input-row">
              <input
                list="seed-images"
                value={form.image}
                onChange={(e) => set("image", e.target.value)}
                placeholder="/images/01-headphones.png or https://…"
                required
              />
              <datalist id="seed-images">
                {SEED_IMAGES.map((src) => (
                  <option key={src} value={src} />
                ))}
              </datalist>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
              >
                <FaUpload /> {uploading ? "Uploading…" : "Upload"}
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => handleUpload(e.target.files?.[0])}
                style={{ display: "none" }}
                aria-label="Upload product image"
              />
            </div>
            {form.image && form.image !== "/images/" && (
              <div className="admin-image-preview">
                <img
                  src={form.image}
                  alt="Preview"
                  onError={(e) => ((e.target as HTMLImageElement).style.opacity = "0.2")}
                  onLoad={(e) => ((e.target as HTMLImageElement).style.opacity = "1")}
                />
                {form.image.startsWith("/uploads/") && (
                  <span className="admin-image-tag">Uploaded</span>
                )}
              </div>
            )}
            <p className="form-hint">PNG, JPEG or WebP · max 5MB · or paste a URL above</p>
          </div>
        </div>
        <div className="product-form-actions">
          <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
            {editing ? <FaEdit /> : <FaPlus />}
            {saving ? "Saving…" : editing ? "Update Product" : "Create Product"}
          </button>
          {editing && (
            <button type="button" className="btn btn-ghost" onClick={cancelEdit}>
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="loading-state">
          <div className="spinner" />
          <p>Loading products…</p>
        </div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <FaBoxOpen className="empty-icon" />
          <p>No products yet. Create your first one above.</p>
        </div>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Price</th>
              <th>Category</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>
                  <img src={p.image} alt={p.title} className="admin-product-thumb" />
                </td>
                <td>{p.title}</td>
                <td>${p.price.toFixed(2)}</td>
                <td>
                  <span className="badge">{p.category}</span>
                </td>
                <td>
                  <div className="admin-row-actions">
                    <button
                      className="btn btn-outline btn-xs"
                      onClick={() => startEdit(p)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="btn btn-outline btn-xs danger"
                      onClick={() => handleDelete(p)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}