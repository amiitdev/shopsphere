import mongoose, { Schema, type InferSchemaType } from "mongoose";

const cartItemSchema = new Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    sourceId: { type: Number, required: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1, max: 99 },
  },
  { _id: false }
);

const cartSchema = new Schema(
  {
    cartId: { type: String, required: true, unique: true, index: true },
    items: { type: [cartItemSchema], default: [] },
  },
  { timestamps: true }
);

export type CartDocument = InferSchemaType<typeof cartSchema> & {
  _id: mongoose.Types.ObjectId;
};

export const CartModel = mongoose.model("Cart", cartSchema);
