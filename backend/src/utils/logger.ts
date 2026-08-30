export function createLogger(level: "info" | "warn" | "error" = "info") {
  const emit = (severity: "info" | "warn" | "error", args: unknown[]) =>
    console[severity]("[" + severity.toUpperCase() + "]", ...args);
  return {
    info: (...args: unknown[]) => level !== "error" && emit("info", args),
    warn: (...args: unknown[]) => level !== "error" && emit("warn", args),
    error: (...args: unknown[]) => emit("error", args),
  };
}

export const logger = createLogger();
