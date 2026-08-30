import { useEffect, useState, useCallback, useRef } from "react";
import type { Product } from "../types";
import { fetchProducts, fetchCategories, aiSearch } from "../api";
import ProductCard from "../components/ProductCard";
import HeroSlideshow from "../components/HeroSlideshow";
import { FaRobot } from "react-icons/fa";

const DEBOUNCE_MS = 300;

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [category, setCategory] = useState<string>("");
  const [searchInput, setSearchInput] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [aiMode, setAiMode] = useState(false);
  const [aiSearching, setAiSearching] = useState(false);
  const [aiResults, setAiResults] = useState<Product[]>([]);
  const [aiMessage, setAiMessage] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setSearch(searchInput.trim()), DEBOUNCE_MS);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [searchInput]);

  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => setCategories([]));
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProducts({
        category: category || undefined,
        search: search || undefined,
        limit: 50,
      });
      setProducts(data.items);
    } catch {
      setError("Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => {
    if (!aiMode) void load();
  }, [load, aiMode]);

  const handleAiSearch = async () => {
    const q = searchInput.trim();
    if (!q) return;
    setAiSearching(true);
    setAiMessage("");
    setAiResults([]);
    try {
      const { results } = await aiSearch(q);
      if (results.length === 0) {
        setAiMessage("No AI results found. Try different words.");
        setAiResults([]);
      } else {
        setAiMessage(`Found ${results.length} result(s) ranked by relevance`);
        // fetch full product data for the matched IDs
        const all = await fetchProducts({ limit: 50 });
        const idSet = new Set(results.map((r) => r.productId));
        const matched = all.items.filter((p) => idSet.has(p._id));
        // order by AI relevance score
        const order = new Map(results.map((r, i) => [r.productId, i]));
        matched.sort((a, b) => (order.get(a._id) ?? 0) - (order.get(b._id) ?? 0));
        setAiResults(matched);
      }
    } catch {
      setAiMessage("AI search failed. Try again.");
    } finally {
      setAiSearching(false);
    }
  };

  const showHero = !searchInput && !category && !aiMode;

  return (
    <section>
      {showHero && <HeroSlideshow />}
      {!searchInput && !category && !aiMode && (
        <div className="hero">
          <h1 className="hero-title">ShopSphere</h1>
          <p className="hero-subtitle">Premium essentials, beautifully made</p>
        </div>
      )}
      <div className="controls">
        <input
          type="search"
          placeholder={aiMode ? "Ask AI: e.g. waterproof headphones under $100" : "Search products..."}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => {
            if (aiMode && e.key === "Enter") {
              e.preventDefault();
              void handleAiSearch();
            }
          }}
          aria-label="Search products"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          aria-label="Filter by category"
          disabled={aiMode}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <button
          className={`btn btn-sm ${aiMode ? "btn-primary" : "btn-outline"}`}
          onClick={() => {
            setAiMode(!aiMode);
            setAiResults([]);
            setAiMessage("");
            setSearchInput("");
          }}
          title={aiMode ? "Switch to normal search" : "Switch to AI search"}
        >
          <FaRobot /> {aiMode ? "AI On" : "AI Search"}
        </button>
        {aiMode && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => void handleAiSearch()}
            disabled={aiSearching || !searchInput.trim()}
          >
            {aiSearching ? "Searching…" : "Ask AI"}
          </button>
        )}
      </div>

      {aiMessage && <p className="status">{aiMessage}</p>}
      {aiSearching && <p className="status">AI is searching…</p>}

      {!aiMode && loading && <p className="status">Loading…</p>}
      {error && <p className="status error">{error}</p>}
      {!loading && !error && !aiMode && products.length === 0 && (
        <div className="empty-state">
          <p>No products found.</p>
        </div>
      )}

      <div className="grid">
        {(aiMode ? aiResults : products).map((p) => (
          <ProductCard key={p._id} product={p} />
        ))}
      </div>
    </section>
  );
}
