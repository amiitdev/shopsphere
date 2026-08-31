import { useNavigate } from "react-router-dom";
import { FaComments } from "react-icons/fa";

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
