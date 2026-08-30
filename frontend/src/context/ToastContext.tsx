import {
  createContext,
  useCallback,
  useContext,
  useState,
  useRef,
  type ReactNode,
} from "react";
import {
  FaCheckCircle,
  FaExclamationTriangle,
  FaInfoCircle,
  FaTimes,
} from "react-icons/fa";

type ToastType = "success" | "error" | "info";
const AUTODISMISS_MS = 3000;

interface Toast {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastCtx {
  showToast: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastCtx | null>(null);

const ICONS: Record<ToastType, JSX.Element> = {
  success: <FaCheckCircle />,
  error: <FaExclamationTriangle />,
  info: <FaInfoCircle />,
};

const TITLES: Record<ToastType, string> = {
  success: "Success",
  error: "Error",
  info: "Heads up",
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [leaving, setLeaving] = useState<Record<number, boolean>>({});
  const idRef = useRef(0);

  const remove = useCallback((id: number) => {
    setLeaving((prev) => ({ ...prev, [id]: true }));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
      setLeaving((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    }, 280);
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = ++idRef.current;
      setToasts((prev) => [...prev.slice(-3), { id, message, type }]);
      setTimeout(() => remove(id), AUTODISMISS_MS);
    },
    [remove]
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}${leaving[t.id] ? " leaving" : ""}`}
          >
            <span className="toast-icon">{ICONS[t.type]}</span>
            <div className="toast-body">
              <span className="toast-title">{TITLES[t.type]}</span>
              <span className="toast-message">{t.message}</span>
            </div>
            <button
              className="toast-close"
              onClick={() => remove(t.id)}
              aria-label="Dismiss notification"
            >
              <FaTimes />
            </button>
            <span
              className="toast-progress"
              style={{ animationDuration: `${AUTODISMISS_MS}ms` }}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastCtx {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}