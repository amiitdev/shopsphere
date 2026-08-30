import mongoose, { Schema, type InferSchemaType } from "mongoose";

const ratingSchema = new Schema(
  {
    rate: { type: Number, required: true, min: 0, max: 5 },
    count: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const productSchema = new Schema(
  {
    sourceId: { type: Number, required: true, unique: true, index: true },
    title: { type: String, required: true, trim: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    category: { type: String, required: true, index: true },
    image: { type: String, required: true },
    rating: { type: ratingSchema, required: true },
    syncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

productSchema.index({ title: "text", description: "text", category: "text" });

export type ProductDocument = InferSchemaType<typeof productSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const ProductModel = mongoose.model("Product", productSchema);
