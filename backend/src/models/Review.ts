import mongoose, { Schema, type InferSchemaType } from "mongoose";
import type { ProductDocument } from "./Product";

export const reviewSchema = new Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, trim: true, maxlength: 120 },
    comment: { type: String, trim: true, maxlength: 2000 },
    verifiedPurchase: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const RATING_VALUES = [1, 2, 3, 4, 5] as const;

export type ReviewDocument = InferSchemaType<typeof reviewSchema> & {
  _id: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
};

export const ReviewModel = mongoose.model("Review", reviewSchema);
