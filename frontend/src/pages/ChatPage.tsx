import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { aiChat } from "../api";
import { FaSpinner, FaPaperPlane } from "react-icons/fa";

interface ChatProduct {
  _id: string;
  title: string;
  price: number;
  image: string;
  category: string;
  rating: { rate: number; count: number };
}

interface Message {
  role: "user" | "assistant";
  content: string;
  products?: ChatProduct[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm ShopSphere's AI assistant. Ask me about products, recommendations, or anything in our catalog!",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Message = { role: "user", content: text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);
    try {
      const history = messages.slice(-6).map((m) => ({ role: m.role, content: m.content }));
      const { reply, products } = await aiChat(text, history);
      setMessages((prev) => [...prev, { role: "assistant", content: reply, products }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Sorry, I’m having trouble right now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-page">
      <div className="chat-messages">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-msg ${msg.role}`}>
            <div className="chat-bubble">{msg.content}</div>
            {msg.products && msg.products.length > 0 && (
              <div className="chat-product-grid">
                {msg.products.map((p) => (
                  <div key={p._id} className="chat-product-card">
                    <img src={p.image} alt={p.title} className="chat-product-img" />
                    <div className="chat-product-info">
                      <span className="chat-product-title">{p.title}</span>
                      <span className="chat-product-category">{p.category}</span>
                      <div className="chat-product-bottom">
                        <span className="chat-product-price">${p.price.toFixed(2)}</span>
                        <span className="chat-product-rating">★ {p.rating.rate} ({p.rating.count})</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="chat-msg assistant">
            <div className="chat-bubble typing">
              <FaSpinner className="spin" /> Thinking…
            </div>
          </div>
        )}
      </div>
      <form
        className="chat-input"
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about products…"
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()}>
          <FaPaperPlane />
        </button>
      </form>
    </div>
  );
}
