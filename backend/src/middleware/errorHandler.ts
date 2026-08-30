import type { ErrorRequestHandler, RequestHandler } from "express";
import multer from "multer";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (req, res) => {
  res.status(404).json({ error: "Not found", path: req.path });
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message });
  }
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ error: `Upload error: ${err.message}` });
  }
  console.error("[ERROR]", err);
  res.status(500).json({ error: "Internal server error" });
};
