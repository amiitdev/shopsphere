import dotenv from "dotenv";

dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  nodeEnv: process.env.NODE_ENV ?? "development",
  mongoUri: required("MONGODB_URI", "mongodb://127.0.0.1:27017/shopsphere"),
  testMongoUri: process.env.TEST_MONGODB_URI ?? "mongodb://127.0.0.1:27017/shopsphere_test",
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  authSecret: process.env.AUTH_SECRET ?? "dev-secret-change-me",
  authTokenName: process.env.AUTH_TOKEN_NAME ?? "ss_token",
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
  geminiModel: process.env.GEMINI_MODEL ?? "gemini-2.5-flash",
  cloudinaryUrl: process.env.CLOUDINARY_URL ?? "",
};

export function isProduction(): boolean {
  return config.nodeEnv === "production";
}
