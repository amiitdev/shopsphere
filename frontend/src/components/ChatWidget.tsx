import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaComments, FaTimes, FaPaperPlane, FaSpinner } from "react-icons/fa";
import { aiChat } from "../api";

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

import { useNavigate } from "react-router-dom";

export default function ChatWidget() {
  const navigate = useNavigate();
  return (
    <button
      className="chat-fab"
      onClick={() => navigate("/chat")}
      aria-label="Open AI chat"
    >
      <FaComments />
    </button>
  );
}
