import multer from "multer";
import path from "node:path";
import crypto from "node:crypto";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { HttpError } from "./errorHandler";
import { config } from "../config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const uploadsDir = path.join(__dirname, "..", "..", "uploads");

try {
  fs.mkdirSync(uploadsDir, { recursive: true });
} catch {
  // Ignore on Vercel serverless (read-only filesystem)
}

export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME = new Set(["image/png", "image/jpeg", "image/webp"]);
const EXT_BY_MIME: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
};

async function createUpload(): Promise<multer.Multer> {
  // Cloudinary storage for Vercel
  if (config.cloudinaryUrl) {
    const cloudinaryMod = await import("cloudinary");
    const cloudinary = (cloudinaryMod as any).v2;
    cloudinary.config({ cloudinary_url: config.cloudinaryUrl });

    const storageMod = await import("multer-storage-cloudinary");
    const { CloudinaryStorage } = storageMod as any;

    const storage = new CloudinaryStorage({
      cloudinary,
      params: {
        folder: "shopsphere/uploads",
        allowed_formats: ["png", "jpg", "jpeg", "webp"],
        transformation: [{ width: 800, height: 800, crop: "limit" }],
      },
    });

    return multer({
      storage,
      limits: { fileSize: MAX_UPLOAD_BYTES },
      fileFilter: (_req: any, file: any, cb: any) => {
        if (!ALLOWED_MIME.has(file.mimetype)) {
          return cb(new HttpError(400, "Only PNG, JPEG, or WebP images are allowed"));
        }
        cb(null, true);
      },
    });
  }

  // Local disk storage for development
  return multer({
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
}

// Lazy init — resolved on first request
let _uploadImage: multer.Multer | null = null;

export async function getUploadImage(): Promise<multer.Multer> {
  if (!_uploadImage) _uploadImage = await createUpload();
  return _uploadImage;
}

// Sync export for routes that don't use Cloudinary
export const uploadImage = {
  single(field: string) {
    return async (req: any, res: any, next: any) => {
      try {
        const uploader = await getUploadImage();
        return uploader.single(field)(req, res, next);
      } catch (e) { next(e); }
    };
  },
};
