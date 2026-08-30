import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { HttpError } from "./errorHandler";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

export const uploadImage = multer({
  storage: multer.diskStorage({
    destination: uploadsDir,
    filename: (_req, file, cb) => {
      const ext = EXT_BY_MIME[file.mimetype] ?? "";
      cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`);
    },
  }),
  limits: { fileSize: MAX_UPLOAD_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED_MIME.has(file.mimetype)) {
      return cb(new HttpError(400, "Only PNG, JPEG, or WebP images are allowed"));
    }
    cb(null, true);
  },
});