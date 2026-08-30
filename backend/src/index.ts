import { config } from "./config";
import { createApp } from "./app";
import { logger } from "./utils/logger";
import mongoose from "mongoose";

export async function start(): Promise<void> {
  await mongoose.connect(config.mongoUri);
  logger.info("Connected to MongoDB");

  const app = createApp();
  app.listen(config.port, () => {
    logger.info(`Backend listening on :${config.port}`);
  });
}

start().catch((err) => {
  logger.error("Failed to start backend", err);
  process.exit(1);
});
